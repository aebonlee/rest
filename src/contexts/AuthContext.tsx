/**
 * AuthContext.tsx
 * -----------------------------------------------------------------------------
 * 역할/책임:
 *   - 애플리케이션 전역 인증(Authentication) 상태를 관리하는 React Context.
 *   - Supabase Auth 세션을 구독하여 로그인 사용자(user)와 그에 연동된
 *     프로필(user_profiles 테이블)을 로드/동기화한다.
 *   - 관리자 여부(isAdmin), 로그인 여부(isLoggedIn), 프로필 완성 필요 여부
 *     (needsProfileCompletion), 계정 차단 상태(accountBlock)를 파생 계산한다.
 *   - 60분 무동작 시 자동 로그아웃(useIdleTimeout) 및 미완성 프로필 입력 모달
 *     (ProfileCompleteModal)을 함께 제공한다.
 *
 * 주요 export:
 *   - AuthProvider: 위 인증 상태를 하위 트리에 공급하는 Provider 컴포넌트.
 *   - useAuth: AuthContext 값을 꺼내 쓰는 커스텀 훅(Provider 외부 사용 시 throw).
 * -----------------------------------------------------------------------------
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactElement } from 'react';
import type { User } from '@supabase/supabase-js';
import getSupabase from '../utils/supabase';
import { getProfile, updateProfile, signOut as authSignOut } from '../utils/auth';
import { ADMIN_EMAILS } from '../config/admin';
import type { UserProfile, AccountBlock } from '../types';
import { useIdleTimeout } from '../hooks/useIdleTimeout';
import ProfileCompleteModal from '../components/ProfileCompleteModal';

// AuthContext가 하위 컴포넌트에 제공하는 값의 형태(인터페이스) 정의
interface AuthContextValue {
  user: User | null;                 // Supabase Auth 세션의 사용자(미로그인 시 null)
  profile: UserProfile | null;       // user_profiles 테이블의 프로필(미로드/미로그인 시 null)
  loading: boolean;                  // 초기 세션 확인 중 여부(스플래시/가드 처리에 사용)
  isLoggedIn: boolean;               // user 존재 여부 기반 로그인 플래그
  isAdmin: boolean;                  // 사용자 이메일이 ADMIN_EMAILS에 포함되는지 여부
  needsProfileCompletion: boolean;   // 이름/전화 미입력 등 프로필 보완 필요 여부
  signOut: () => Promise<void>;      // 로그아웃 + 로컬 상태 정리
  refreshProfile: () => Promise<void>; // 현재 사용자 기준 프로필 재로딩
  accountBlock: AccountBlock | null; // 정지/차단 등 비정상 계정 상태 정보
  clearAccountBlock: () => void;     // 차단 안내 표시 후 상태 초기화
}

// 기본값 null로 생성 — Provider 밖에서 useContext 시 null이 되어 useAuth에서 가드한다.
const AuthContext = createContext<AuthContextValue | null>(null);

// AuthProvider가 받는 props: 감쌀 자식 노드만 필요
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider
 * 인증 상태를 보유/관리하고 하위 트리에 Context로 공급하는 컴포넌트.
 * Supabase auth 이벤트 구독, 프로필 로드/자동생성, 유휴 타임아웃 등을 담당한다.
 */
export const AuthProvider = ({ children }: AuthProviderProps): ReactElement => {
  // 현재 인증 세션 사용자 상태
  const [user, setUser] = useState<User | null>(null);
  // 사용자에 연동된 DB 프로필 상태
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // 초기 세션 확인이 끝날 때까지 true (라우팅 가드/플리커 방지용)
  const [loading, setLoading] = useState(true);
  // 계정이 active가 아닐 때 차단 사유를 담는 상태
  const [accountBlock, setAccountBlock] = useState<AccountBlock | null>(null);

  /**
   * loadProfile
   * 주어진 인증 사용자(authUser)에 대해 프로필을 로드한다.
   *   1) 프로필이 없으면 자동 생성(OAuth 첫 로그인 등),
   *   2) 누락 필드(signup_domain/role/visited_sites) 자동 보정,
   *   3) RPC(check_user_status)로 계정 상태를 검사해 비정상이면 강제 로그아웃.
   * useCallback로 메모이즈해 useEffect 의존성 안정성을 확보한다.
   */
  const loadProfile = useCallback(async (authUser: User | null) => {
    // 사용자가 없으면 프로필 비우고 종료(로그아웃 상태)
    if (!authUser) {
      setProfile(null);
      return;
    }
    let p = await getProfile(authUser.id);
    // 프로필 미존재 시 자동 생성 (OAuth 첫 로그인 등)
    if (!p) {
      const client = getSupabase();
      if (client) {
        // OAuth 공급자가 채워준 메타데이터에서 이름 등을 추출(없으면 빈 객체)
        const meta = authUser.user_metadata || {};
        // 가입/접속한 사이트 도메인 기록(멀티 도메인 운영 추적용)
        const currentDomain = window.location.hostname;
        const { data } = await client.from('user_profiles').insert({
          id: authUser.id,
          email: authUser.email || '',
          name: meta.full_name || meta.name || '',
          display_name: meta.full_name || meta.name || '',
          phone: '',
          provider: authUser.app_metadata?.provider || 'email', // 인증 공급자(google/kakao/email 등)
          signup_domain: currentDomain,
          visited_sites: [currentDomain],
          role: 'member', // 신규 사용자 기본 권한
        }).select().single();
        if (data) p = data as UserProfile; // 생성된 행을 이후 보정 로직에서 사용
      }
    }
    // signup_domain, role 자동 초기화 + 현재 도메인 visited_sites 자동 추가
    if (p) {
      const updates: Record<string, unknown> = {}; // 변경이 필요한 필드만 모음
      const currentDomain = window.location.hostname;
      // 가입 도메인 누락 시 현재 도메인으로 채움
      if (!p.signup_domain) updates.signup_domain = currentDomain;
      // 구버전 'user' 또는 빈 role을 표준 'member'로 정규화
      if (!p.role || p.role === 'user') updates.role = 'member';
      // 현재 도메인이 visited_sites에 없으면 자동 추가
      const sites = Array.isArray(p.visited_sites) ? p.visited_sites : []; // 비배열 방어
      if (!sites.includes(currentDomain)) {
        updates.visited_sites = [...sites, currentDomain];
      }
      // 보정할 항목이 있을 때만 DB 업데이트 수행(불필요한 쓰기 방지)
      if (Object.keys(updates).length > 0) {
        try {
          const updated = await updateProfile(authUser.id, updates);
          setProfile(updated); // 업데이트된 최신 프로필 반영
        } catch {
          setProfile(p); // 업데이트 실패해도 기존 프로필로 진행(가용성 우선)
        }
      } else {
        setProfile(p); // 변경 없으면 로드한 프로필 그대로 사용
      }
    }

    // 계정 상태 체크
    try {
      const client = getSupabase();
      if (client) {
        // 서버측 RPC로 정지/차단 여부 확인(도메인별 차단 정책 포함)
        const { data: statusData } = await client.rpc('check_user_status', {
          target_user_id: authUser.id,
          current_domain: window.location.hostname,
        });
        // status가 'active'가 아니면(정지/차단 등) 차단 정보 저장 후 강제 로그아웃
        if (statusData && statusData.status && statusData.status !== 'active') {
          setAccountBlock({
            status: statusData.status,
            reason: statusData.reason || '',
            suspended_until: statusData.suspended_until || null, // 일시정지 해제 시각(없으면 null)
          });
          await authSignOut();
          setUser(null);
          setProfile(null);
          return; // 차단된 계정은 이후 로직 진행하지 않음
        }
      }
    } catch {
      // check_user_status 함수 미존재 시 무시
    }
  }, []);

  // Supabase 인증 상태 구독: 마운트 시 1회 등록하고 언마운트 시 해제
  useEffect(() => {
    const client = getSupabase();
    // Supabase 미설정 환경(env 누락 등)에서는 로딩만 종료하고 종료
    if (!client) {
      setLoading(false);
      return;
    }

    // onAuthStateChange 하나로 통합 — INITIAL_SESSION은 OAuth 코드 교환 완료 후 발생
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null; // 세션에서 사용자 추출(없으면 null)
      setUser(u);
      if (u) {
        loadProfile(u); // 사용자 변경 시 프로필 동기화(비동기, await 불필요)
        // 실제 로그인 시에만 last_sign_in_at 갱신
        if (event === 'SIGNED_IN') {
          // 토큰 갱신 등 다른 이벤트에서는 갱신하지 않아 정확한 로그인 시각 유지
          client.from('user_profiles')
            .update({ last_sign_in_at: new Date().toISOString() })
            .eq('id', u.id)
            .then(() => {}); // 결과 무시(베스트 에포트 갱신)
        }
      } else {
        setProfile(null); // 로그아웃/세션 만료 시 프로필 정리
      }
      // INITIAL_SESSION: 초기 로드 완료 (OAuth 콜백 코드 교환 포함)
      if (event === 'INITIAL_SESSION') {
        setLoading(false); // 첫 세션 확인이 끝났으므로 로딩 해제
      }
    });

    // 안전장치: INITIAL_SESSION이 5초 내 안 오면 loading 해제
    const fallbackTimer = setTimeout(() => {
      // 함수형 업데이트로 최신 prev 참조 — 이미 해제됐으면 경고 생략
      setLoading((prev) => {
        if (prev) console.warn('Auth: INITIAL_SESSION timeout, forcing loading=false');
        return false;
      });
    }, 5000);

    // 정리(cleanup): 타이머 해제 + 구독 해제로 메모리 누수/중복 호출 방지
    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [loadProfile]); // loadProfile은 useCallback으로 안정적이라 재구독 유발 안 함

  /**
   * signOut
   * Supabase 로그아웃을 수행하고 로컬 user/profile 상태를 즉시 비운다.
   * (UI가 로그인 상태로 잠깐 남는 것을 방지)
   */
  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  /**
   * refreshProfile
   * 현재 로그인 사용자 기준으로 프로필을 다시 로드한다.
   * (프로필 모달 저장 후 등 외부에서 강제 갱신할 때 사용)
   */
  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  // 관리자 판별용 이메일 후보 수집:
  //  - 인증 user의 email, user_metadata.email, 첫 번째 identity의 email,
  //  - DB profile.email
  // 공급자/연동 방식에 따라 이메일 위치가 달라 여러 소스를 모두 확인한다.
  const allEmails = [
    user?.email,
    user?.user_metadata?.email as string | undefined,
    (user?.identities?.[0]?.identity_data as Record<string, unknown> | undefined)?.email as string | undefined,
    profile?.email,
  ].filter((e): e is string => Boolean(e)).map((e) => e.toLowerCase()); // 빈 값 제거 후 소문자 정규화
  // 수집된 이메일 중 하나라도 관리자 목록에 있으면 관리자
  const isAdmin = allEmails.some((e) => ADMIN_EMAILS.includes(e));
  // user 존재 여부로 로그인 판정
  const isLoggedIn = !!user;
  // 로그인했고 프로필이 있으나 필수값(이름/전화)이 비어 있으면 보완 필요
  const needsProfileCompletion = isLoggedIn && !!profile && (!profile.name || !profile.phone);


  // 60분 무동작 세션 타임아웃 (시험·강의 중 끊김 방지)
  useIdleTimeout({
    timeout: 60 * 60 * 1000, // 60분(ms)
    enabled: isLoggedIn,     // 로그인 상태에서만 유휴 감시 활성화
    onTimeout: () => {
      // 로컬 상태까지 즉시 정리해 UI가 로그인된 채로 남지 않도록 함
      signOut().catch(() => {}); // 실패해도 흐름을 막지 않도록 에러 무시
    },
  });

  // Context 값 공급: 상태/파생값/액션을 하위 트리에 전달
  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isLoggedIn,
      isAdmin,
      needsProfileCompletion,
      signOut,
      refreshProfile,
      accountBlock,
      clearAccountBlock: () => setAccountBlock(null), // 차단 안내 닫기 시 상태 초기화
    }}>
      {children}
      {/* 프로필 보완이 필요하면 전역 모달 노출 (user는 위 조건상 항상 존재하므로 ! 단언) */}
      {needsProfileCompletion && (
        <ProfileCompleteModal user={user!} onComplete={refreshProfile} />
      )}
    </AuthContext.Provider>
  );
};

/**
 * useAuth
 * AuthContext 값을 반환하는 커스텀 훅.
 * AuthProvider 외부에서 호출되면(컨텍스트 null) 명시적으로 에러를 던져
 * 잘못된 사용을 빠르게 발견하도록 한다.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
