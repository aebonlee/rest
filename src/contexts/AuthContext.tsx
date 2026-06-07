/**
 * AuthContext.tsx
 * -----------------------------------------------------------------------------
 * [이 파일이 무엇인가? — 한 줄 요약]
 *   "지금 누가 로그인했는지"를 앱 전체가 공유할 수 있게 해주는 중앙 보관소.
 *
 * [왜 필요한가? — 초보자용 배경]
 *   로그인 정보(누가 로그인했는지, 관리자인지 등)는 헤더, 마이페이지, 강의 페이지 등
 *   앱 곳곳에서 필요하다. 이걸 컴포넌트마다 props로 일일이 내려주면 너무 번거롭다
 *   ("props drilling"이라고 부른다). 그래서 React의 "Context"라는 기능을 쓴다.
 *   Context = 멀리 떨어진 컴포넌트끼리도 값을 공유하게 해주는 "전역 통로"라고 생각하면 된다.
 *
 * [꼭 알아둘 용어]
 *   - Authentication(인증): "너 누구냐?"를 확인하는 절차(로그인).
 *   - Supabase: 백엔드(DB + 인증)를 대신 제공해 주는 서비스. 여기선 로그인과
 *     사용자 데이터 저장에 쓴다.
 *   - 세션(session): 로그인된 상태를 증명하는 토큰 묶음. 세션이 있으면 로그인 상태.
 *   - 프로필(profile): user_profiles 테이블에 저장된 사용자 정보(이름/전화/권한 등).
 *     인증 사용자(user)와는 별개로 우리 DB에 따로 저장한다.
 *   - RLS: Supabase(PostgreSQL)의 "행 수준 보안". DB가 "이 사용자가 이 행을
 *     읽고/쓸 권한이 있나?"를 직접 검사한다. 그래서 인증된 사용자만 자기 데이터에 접근 가능.
 *   - RPC: 서버(DB)에 미리 만들어둔 함수를 호출하는 것. 여기선 check_user_status로
 *     계정 정지/차단 여부를 서버에서 판단한다.
 *
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
 *     (앱의 최상단을 이 Provider로 감싸야, 그 안쪽 어디서든 로그인 정보를 쓸 수 있다.)
 *   - useAuth: AuthContext 값을 꺼내 쓰는 커스텀 훅(Provider 외부 사용 시 throw).
 * -----------------------------------------------------------------------------
 */

// [import 설명]
// React의 핵심 도구들을 가져온다. 각각의 역할:
//   createContext : 위에서 말한 "전역 통로(Context)"를 새로 만든다.
//   useContext    : 그 통로에서 값을 꺼내 읽는다.
//   useState      : 컴포넌트가 기억해야 할 "상태(값)"를 만든다. 값이 바뀌면 화면이 다시 그려진다.
//   useEffect     : 화면이 그려진 "후"에 실행할 부수효과(구독 등록 등)를 정의한다.
//   useCallback   : 함수를 메모이즈(재사용)해서, 매 렌더마다 새 함수가 만들어지는 걸 막는다.
//   type ReactElement : (TypeScript 타입) 컴포넌트가 반환하는 JSX의 타입.
//                       'type' 키워드를 붙이면 "이건 타입일 뿐 실제 코드가 아니다"라는 뜻.
import { createContext, useContext, useState, useEffect, useCallback, type ReactElement } from 'react';
// Supabase가 제공하는 "인증 사용자" 타입. user 변수의 모양을 TypeScript에게 알려준다.
import type { User } from '@supabase/supabase-js';
// Supabase 클라이언트(서버와 통신하는 객체)를 가져오는 함수. 설정이 없으면 null을 줄 수 있다.
import getSupabase from '../utils/supabase';
// 프로필 조회/수정, 로그아웃 같은 "인증 관련 도우미 함수"들. 여기선 별칭(as)으로 signOut을 authSignOut으로 부른다.
import { getProfile, updateProfile, signOut as authSignOut } from '../utils/auth';
// 관리자 이메일 목록(상수). 이 목록에 들어 있으면 관리자로 본다.
import { ADMIN_EMAILS } from '../config/admin';
// 우리 앱에서 직접 정의한 타입들(프로필 모양, 계정 차단 정보 모양).
import type { UserProfile, AccountBlock } from '../types';
// 60분 무동작 시 자동 로그아웃을 처리하는 커스텀 훅.
import { useIdleTimeout } from '../hooks/useIdleTimeout';
// 이름/전화가 비어 있을 때 입력을 유도하는 모달 컴포넌트.
import ProfileCompleteModal from '../components/ProfileCompleteModal';

// [TypeScript 개념] interface = "객체가 가져야 할 속성과 그 타입"을 미리 약속해 두는 설계도.
// AuthContext가 하위 컴포넌트에 제공하는 값의 형태(인터페이스) 정의.
// 즉, useAuth()를 호출하면 아래 모양의 객체를 받게 된다.
interface AuthContextValue {
  user: User | null;                 // Supabase Auth 세션의 사용자(미로그인 시 null). '| null'은 "둘 중 하나"라는 뜻.
  profile: UserProfile | null;       // user_profiles 테이블의 프로필(미로드/미로그인 시 null)
  loading: boolean;                  // 초기 세션 확인 중 여부(스플래시/가드 처리에 사용)
  isLoggedIn: boolean;               // user 존재 여부 기반 로그인 플래그
  isAdmin: boolean;                  // 사용자 이메일이 ADMIN_EMAILS에 포함되는지 여부
  needsProfileCompletion: boolean;   // 이름/전화 미입력 등 프로필 보완 필요 여부
  signOut: () => Promise<void>;      // 로그아웃 + 로컬 상태 정리. '() => Promise<void>'는 "인자 없고 비동기로 동작하는 함수" 타입.
  refreshProfile: () => Promise<void>; // 현재 사용자 기준 프로필 재로딩
  accountBlock: AccountBlock | null; // 정지/차단 등 비정상 계정 상태 정보
  clearAccountBlock: () => void;     // 차단 안내 표시 후 상태 초기화
}

// Context를 실제로 생성한다. 초깃값을 null로 둔다.
// 기본값 null로 생성 — Provider 밖에서 useContext 시 null이 되어 useAuth에서 가드한다.
// (이렇게 해두면 "Provider로 안 감싼 채 useAuth를 잘못 쓴 경우"를 아래 useAuth에서 잡아낼 수 있다.)
const AuthContext = createContext<AuthContextValue | null>(null);

// [React 개념] props = 부모가 자식 컴포넌트에 넘겨주는 입력값.
// AuthProvider가 받는 props: 감쌀 자식 노드만 필요.
// children = <AuthProvider>...여기에 들어오는 모든 내용...</AuthProvider>. React.ReactNode는 거의 모든 렌더 가능한 값을 뜻하는 타입.
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider
 * 인증 상태를 보유/관리하고 하위 트리에 Context로 공급하는 컴포넌트.
 * Supabase auth 이벤트 구독, 프로필 로드/자동생성, 유휴 타임아웃 등을 담당한다.
 *
 * @param children - 이 Provider로 감쌀 하위 컴포넌트들(앱 전체가 들어온다).
 * @returns        - 자식들을 감싸 인증 값을 공급하는 JSX 요소.
 * 부수효과       - Supabase 인증 이벤트 구독, DB 읽기/쓰기, 자동 로그아웃 타이머 등.
 */
export const AuthProvider = ({ children }: AuthProviderProps): ReactElement => {
  // [useState 개념] const [값, 값을바꾸는함수] = useState(초깃값);
  // setUser를 호출해 값을 바꾸면 React가 화면을 자동으로 다시 그린다.
  // 현재 인증 세션 사용자 상태
  const [user, setUser] = useState<User | null>(null);
  // 사용자에 연동된 DB 프로필 상태
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // 초기 세션 확인이 끝날 때까지 true (라우팅 가드/플리커 방지용)
  // 주의: loading이 true인 동안 "로그인 안 됨"으로 단정하면 안 된다. 아직 확인 중일 뿐이다.
  const [loading, setLoading] = useState(true);
  // 계정이 active가 아닐 때 차단 사유를 담는 상태
  const [accountBlock, setAccountBlock] = useState<AccountBlock | null>(null);

  /**
   * loadProfile
   * 주어진 인증 사용자(authUser)에 대해 프로필을 로드한다.
   *   1) 프로필이 없으면 자동 생성(OAuth 첫 로그인 등),
   *   2) 누락 필드(signup_domain/role/visited_sites) 자동 보정,
   *   3) RPC(check_user_status)로 계정 상태를 검사해 비정상이면 강제 로그아웃.
   *
   * [왜 useCallback으로 감쌌나?]
   *   아래 useEffect의 의존성 배열에 loadProfile이 들어간다. 만약 매 렌더마다
   *   loadProfile이 "새 함수"로 다시 만들어지면, useEffect가 매번 "의존성이 바뀌었다"고
   *   판단해 구독을 떼었다 붙였다 반복한다. useCallback([]) 로 감싸면 함수가
   *   한 번만 만들어져 그런 불필요한 재실행을 막는다.
   *
   * @param authUser - Supabase 인증 사용자(없으면 null).
   * @returns        - Promise<void> (반환값 없음, 상태만 갱신).
   * 부수효과        - DB 읽기/쓰기, 차단 시 강제 로그아웃, 여러 setState 호출.
   */
  const loadProfile = useCallback(async (authUser: User | null) => {
    // 사용자가 없으면 프로필 비우고 종료(로그아웃 상태)
    if (!authUser) {
      setProfile(null);
      return; // 더 진행할 게 없으니 함수를 여기서 끝낸다.
    }
    // [async/await 개념] await = "이 비동기 작업이 끝날 때까지 기다린 뒤 결과를 받는다".
    // getProfile은 DB 조회라 시간이 걸리므로 await로 결과(프로필 또는 null)를 받는다.
    let p = await getProfile(authUser.id);
    // 프로필 미존재 시 자동 생성 (OAuth 첫 로그인 등)
    // (구글/카카오로 처음 로그인하면 인증 계정은 생겼지만 우리 DB 프로필은 아직 없을 수 있다.)
    if (!p) {
      const client = getSupabase();
      if (client) { // 클라이언트가 정상일 때만 DB 작업 시도
        // OAuth 공급자가 채워준 메타데이터에서 이름 등을 추출(없으면 빈 객체)
        // 주의: '|| {}'는 user_metadata가 undefined일 때 빈 객체로 대체해, 아래에서 meta.name 접근 시 에러를 막는다.
        const meta = authUser.user_metadata || {};
        // 가입/접속한 사이트 도메인 기록(멀티 도메인 운영 추적용)
        const currentDomain = window.location.hostname; // 예: 'rest.dreamitbiz.com'
        // user_profiles 테이블에 새 행을 INSERT 하고, .select().single()로 방금 만든 행 1개를 돌려받는다.
        const { data } = await client.from('user_profiles').insert({
          id: authUser.id,                                // 인증 사용자 id와 동일하게 맞춰 1:1 연결
          email: authUser.email || '',                    // 이메일 없으면 빈 문자열로 안전 처리
          name: meta.full_name || meta.name || '',        // 여러 후보 중 먼저 값이 있는 것을 사용(없으면 빈 문자열)
          display_name: meta.full_name || meta.name || '',
          phone: '',
          provider: authUser.app_metadata?.provider || 'email', // 인증 공급자(google/kakao/email 등). '?.'는 옵셔널 체이닝.
          signup_domain: currentDomain,
          visited_sites: [currentDomain],
          role: 'member', // 신규 사용자 기본 권한
        }).select().single();
        if (data) p = data as UserProfile; // 생성된 행을 이후 보정 로직에서 사용. 'as'는 TypeScript에게 타입을 알려주는 단언.
      }
    }
    // signup_domain, role 자동 초기화 + 현재 도메인 visited_sites 자동 추가
    // (옛날에 만들어진 프로필이라 빠진 정보가 있을 수 있어, 여기서 채워준다.)
    if (p) {
      const updates: Record<string, unknown> = {}; // 변경이 필요한 필드만 모음. Record<string, unknown> = "키는 문자열, 값은 무엇이든"인 객체 타입.
      const currentDomain = window.location.hostname;
      // 가입 도메인 누락 시 현재 도메인으로 채움
      if (!p.signup_domain) updates.signup_domain = currentDomain;
      // 구버전 'user' 또는 빈 role을 표준 'member'로 정규화(과거 데이터 호환)
      if (!p.role || p.role === 'user') updates.role = 'member';
      // 현재 도메인이 visited_sites에 없으면 자동 추가
      // 주의: Array.isArray로 먼저 검사하는 이유 — 값이 배열이 아닐 때 .includes를 부르면 에러가 나기 때문(방어 코드).
      const sites = Array.isArray(p.visited_sites) ? p.visited_sites : []; // 비배열 방어
      if (!sites.includes(currentDomain)) {
        // [불변성] 기존 배열을 직접 push로 바꾸지 않고, '...sites'로 펼쳐 새 배열을 만든다.
        // React/상태 관리는 "원본을 바꾸지 말고 새 값을 만들어 교체"하는 불변성 규칙을 따른다.
        updates.visited_sites = [...sites, currentDomain];
      }
      // 보정할 항목이 있을 때만 DB 업데이트 수행(불필요한 쓰기 방지)
      // Object.keys(updates).length > 0 == "updates 객체에 키가 하나라도 있는가?"
      if (Object.keys(updates).length > 0) {
        try {
          const updated = await updateProfile(authUser.id, updates);
          setProfile(updated); // 업데이트된 최신 프로필 반영
        } catch {
          setProfile(p); // 업데이트 실패해도 기존 프로필로 진행(가용성 우선 — 일부 보정 실패가 로그인 자체를 막지 않게)
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
        // 주의: 이 검사는 "클라이언트에서" 하는 게 아니라 서버 함수(check_user_status)에 맡긴다.
        //       보안 판단은 사용자가 조작 가능한 브라우저가 아니라 서버에서 해야 안전하기 때문이다.
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
          await authSignOut(); // 서버 세션 종료
          setUser(null);       // 로컬 상태도 즉시 비워 UI가 로그인된 채로 남지 않게
          setProfile(null);
          return; // 차단된 계정은 이후 로직 진행하지 않음
        }
      }
    } catch {
      // check_user_status 함수 미존재 시 무시
      // (이 RPC가 아직 배포 안 된 환경에서도 로그인 흐름이 깨지지 않도록 조용히 넘어간다.)
    }
  }, []); // 의존성 빈 배열 [] = "외부 값에 의존하지 않으니 함수를 한 번만 만들고 계속 재사용".

  // [useEffect 개념] useEffect(실행할함수, 의존성배열)
  //   - 화면이 그려진 "뒤"에 실행된다.
  //   - 의존성 배열 안의 값이 바뀔 때마다 다시 실행된다([]이면 마운트 시 한 번만).
  //   - 함수가 무언가를 반환하면(아래 return), 그게 "정리(cleanup)" 함수가 되어
  //     컴포넌트가 사라지거나 재실행 직전에 호출된다.
  // Supabase 인증 상태 구독: 마운트 시 1회 등록하고 언마운트 시 해제
  useEffect(() => {
    const client = getSupabase();
    // Supabase 미설정 환경(env 누락 등)에서는 로딩만 종료하고 종료
    // 주의: 여기서 setLoading(false)를 안 하면 화면이 영원히 로딩 상태로 멈춘다.
    if (!client) {
      setLoading(false);
      return;
    }

    // onAuthStateChange 하나로 통합 — INITIAL_SESSION은 OAuth 코드 교환 완료 후 발생
    // [구독(subscribe)이란?] "인증 상태가 바뀌면 알려줘"라고 등록해 두는 것.
    // 로그인/로그아웃/토큰갱신/최초확인 등이 일어날 때마다 아래 콜백(event, session)이 호출된다.
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null; // 세션에서 사용자 추출(없으면 null). '?? null'은 "왼쪽이 null/undefined면 null 사용".
      setUser(u);
      if (u) {
        // 주의: 여기서 loadProfile에 await를 쓰지 않는다. 이 콜백을 async로 만들지 않고
        //       "백그라운드로 프로필을 동기화"시키기 위함이다(이벤트 콜백을 가볍게 유지).
        loadProfile(u); // 사용자 변경 시 프로필 동기화(비동기, await 불필요)
        // 실제 로그인 시에만 last_sign_in_at 갱신
        if (event === 'SIGNED_IN') {
          // 토큰 갱신 등 다른 이벤트에서는 갱신하지 않아 정확한 로그인 시각 유지
          // (TOKEN_REFRESHED 같은 이벤트마다 갱신하면 "마지막 로그인 시각"이 실제 로그인과 달라진다.)
          client.from('user_profiles')
            .update({ last_sign_in_at: new Date().toISOString() }) // 현재 시각을 ISO 문자열로 기록
            .eq('id', u.id) // WHERE id = u.id (이 사용자 행만)
            .then(() => {}); // 결과 무시(베스트 에포트 갱신 — 성공 여부에 흐름을 걸지 않음)
        }
      } else {
        setProfile(null); // 로그아웃/세션 만료 시 프로필 정리
      }
      // INITIAL_SESSION: 초기 로드 완료 (OAuth 콜백 코드 교환 포함)
      // 이 이벤트는 "앱을 켰을 때 기존 세션이 있는지 최초 확인이 끝났다"는 신호다.
      if (event === 'INITIAL_SESSION') {
        setLoading(false); // 첫 세션 확인이 끝났으므로 로딩 해제
      }
    });

    // 안전장치: INITIAL_SESSION이 5초 내 안 오면 loading 해제
    // (네트워크 문제 등으로 그 이벤트가 영영 안 올 때 화면이 무한 로딩에 갇히는 걸 막는다.)
    const fallbackTimer = setTimeout(() => {
      // [함수형 업데이트] setLoading(prev => ...)처럼 함수를 넘기면 "현재 최신값(prev)"을 받아 처리한다.
      // 타이머는 5초 전 시점의 값을 기억하므로, 최신값을 확실히 보려고 함수형으로 쓴다.
      setLoading((prev) => {
        if (prev) console.warn('Auth: INITIAL_SESSION timeout, forcing loading=false'); // 아직 로딩 중이었을 때만 경고
        return false;
      });
    }, 5000); // 5000ms = 5초

    // 정리(cleanup): 타이머 해제 + 구독 해제로 메모리 누수/중복 호출 방지
    // 주의: 구독을 해제하지 않으면, 컴포넌트가 사라진 뒤에도 콜백이 계속 살아남아
    //       "사라진 컴포넌트의 상태를 바꾸려는" 버그/메모리 누수가 생긴다. 그래서 반드시 정리한다.
    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [loadProfile]); // loadProfile은 useCallback으로 안정적이라 재구독 유발 안 함

  /**
   * signOut
   * Supabase 로그아웃을 수행하고 로컬 user/profile 상태를 즉시 비운다.
   * (UI가 로그인 상태로 잠깐 남는 것을 방지)
   *
   * @returns - Promise<void>
   * 부수효과 - 서버 세션 종료 + user/profile 상태 초기화.
   */
  const signOut = useCallback(async () => {
    await authSignOut();  // 먼저 서버 세션을 끝내고
    setUser(null);        // 로컬 상태도 비워 화면을 즉시 로그아웃 상태로 바꾼다.
    setProfile(null);
  }, []); // 외부 값에 의존하지 않으므로 빈 배열

  /**
   * refreshProfile
   * 현재 로그인 사용자 기준으로 프로필을 다시 로드한다.
   * (프로필 모달 저장 후 등 외부에서 강제 갱신할 때 사용)
   *
   * @returns - Promise<void>
   * 부수효과 - loadProfile을 통해 DB 재조회 및 profile 상태 갱신.
   */
  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user); // 로그인 상태일 때만 의미가 있다.
  }, [user, loadProfile]); // user가 바뀌면 최신 user로 동작하도록 의존성에 포함

  // 관리자 판별용 이메일 후보 수집:
  //  - 인증 user의 email, user_metadata.email, 첫 번째 identity의 email,
  //  - DB profile.email
  // 공급자/연동 방식에 따라 이메일 위치가 달라 여러 소스를 모두 확인한다.
  // (예: 구글 로그인은 user.email에, 다른 경로는 메타데이터/identity에 이메일이 있을 수 있다.)
  // 주의: 아래 '?.'(옵셔널 체이닝)은 "앞이 null/undefined면 에러 없이 undefined를 반환"한다.
  //       user가 아직 없을 때도 안전하게 접근하기 위함.
  const allEmails = [
    user?.email,
    user?.user_metadata?.email as string | undefined,
    (user?.identities?.[0]?.identity_data as Record<string, unknown> | undefined)?.email as string | undefined, // 첫 번째 연동 계정의 이메일
    profile?.email,
  ].filter((e): e is string => Boolean(e)).map((e) => e.toLowerCase());
  // 위 한 줄 풀이:
  //   .filter(...Boolean(e))  → 비어 있는(undefined/'') 값을 모두 제거. '(e): e is string'은 "걸러낸 뒤엔 모두 문자열"이라고 타입을 좁히는 표기.
  //   .map(e => e.toLowerCase()) → 대소문자 차이로 비교가 틀어지지 않게 전부 소문자로 통일.

  // 수집된 이메일 중 하나라도 관리자 목록에 있으면 관리자
  // .some(...) = "배열 원소 중 조건을 만족하는 게 하나라도 있나?" (하나라도 true면 true)
  const isAdmin = allEmails.some((e) => ADMIN_EMAILS.includes(e));
  // user 존재 여부로 로그인 판정. '!!'는 값을 깔끔한 true/false로 변환하는 관용구.
  const isLoggedIn = !!user;
  // 로그인했고 프로필이 있으나 필수값(이름/전화)이 비어 있으면 보완 필요
  // (이 값이 true면 아래에서 프로필 입력 모달을 띄운다.)
  const needsProfileCompletion = isLoggedIn && !!profile && (!profile.name || !profile.phone);


  // 60분 무동작 세션 타임아웃 (시험·강의 중 끊김 방지)
  // (커스텀 훅 useIdleTimeout이 마우스/키보드 등 활동을 감시하다, 60분간 아무 동작이 없으면 onTimeout을 부른다.)
  useIdleTimeout({
    timeout: 60 * 60 * 1000, // 60분(ms). 60분 × 60초 × 1000ms.
    enabled: isLoggedIn,     // 로그인 상태에서만 유휴 감시 활성화(비로그인 땐 감시 불필요)
    onTimeout: () => {
      // 로컬 상태까지 즉시 정리해 UI가 로그인된 채로 남지 않도록 함
      signOut().catch(() => {}); // 실패해도 흐름을 막지 않도록 에러 무시(.catch로 거부된 Promise 처리)
    },
  });

  // [JSX 개념] return 안의 <태그> 문법이 JSX다. HTML처럼 보이지만 실제론 JavaScript다.
  // Context 값 공급: 상태/파생값/액션을 하위 트리에 전달
  // <AuthContext.Provider value={...}> 로 감싼 내부(children)에서는 useAuth()로 이 value를 꺼내 쓸 수 있다.
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
      {/* [조건부 렌더링] 'A && <컴포넌트/>'는 A가 true일 때만 컴포넌트를 그린다(A가 false면 아무것도 안 그림). */}
      {/* 프로필 보완이 필요하면 전역 모달 노출 (user는 위 조건상 항상 존재하므로 ! 단언) */}
      {/* 주의: user!의 '!'(non-null 단언)는 "이건 절대 null이 아니다"라고 TypeScript에 약속하는 표시.
          needsProfileCompletion이 true이려면 isLoggedIn(=user 존재)이 먼저 true여야 하므로 여기선 안전하다. */}
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
 *
 * [커스텀 훅이란?] use~ 로 시작하는, 재사용 가능한 로직 묶음 함수.
 * 컴포넌트 안에서 useAuth()처럼 호출해 인증 값을 손쉽게 가져온다.
 *
 * @returns - AuthContextValue (위 인터페이스 모양의 인증 상태/함수 묶음).
 * @throws  - Provider 밖에서 사용하면 Error를 던진다.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext); // Context 통로에서 현재 값을 꺼낸다.
  // 주의: Provider로 감싸지 않은 곳에서 호출하면 context가 null이다.
  //       이때 조용히 두면 나중에 알 수 없는 곳에서 에러가 나므로, 여기서 바로 명확히 알려준다.
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
