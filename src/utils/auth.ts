/**
 * auth.ts — Supabase Auth 헬퍼 함수
 *
 * 역할:
 *   - Supabase 인증(Auth) 및 사용자 프로필(user_profiles 테이블) 관련 비동기 작업을
 *     한곳에 모아 캡슐화한 유틸리티 모듈.
 *   - UI 컴포넌트가 Supabase 클라이언트를 직접 다루지 않고 이 함수들만 호출하도록 하여
 *     인증 로직을 한 군데에서 관리한다.
 *
 * 핵심 책임:
 *   - 다양한 로그인 방식 제공: Google/Kakao OAuth, 이메일+비밀번호.
 *   - 회원가입, 로그아웃, 비밀번호 재설정.
 *   - 사용자 프로필 조회/업데이트 (RLS가 적용된 user_profiles 테이블 접근).
 *   - 모든 함수는 getSupabase()로 클라이언트를 가져오며, 미설정 시 안전하게 처리.
 *
 * 주요 export:
 *   - signInWithGoogle, signInWithKakao, signInWithEmail : 로그인
 *   - signUp        : 회원가입
 *   - signOut       : 로그아웃
 *   - getProfile    : 프로필 조회
 *   - resetPassword : 비밀번호 재설정 메일 전송
 *   - updateProfile : 프로필 수정
 */
// UserProfile: user_profiles 테이블의 행 구조를 나타내는 타입 (타입 전용 import).
import type { UserProfile } from '../types';
// getSupabase: 싱글턴 Supabase 클라이언트를 반환하는 팩토리. 환경설정이 없으면 null 반환 가능.
import getSupabase from './supabase';

/**
 * Google OAuth 로그인
 * - 매개변수: 없음
 * - 반환값: Supabase signInWithOAuth의 data (보통 OAuth provider URL 정보)
 * - 부수효과: 브라우저를 Google 인증 페이지로 리다이렉트한다.
 * - 예외: 클라이언트 미설정 또는 OAuth 오류 시 throw.
 */
export async function signInWithGoogle() {
  const client = getSupabase();
  // 클라이언트가 없으면(=환경변수 미설정) 진행 불가 — 즉시 예외 발생.
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    // 인증 완료 후 현재 페이지(origin+pathname)로 되돌아오도록 리다이렉트 URL 지정.
    // 해시/쿼리는 제외해 OAuth 콜백 처리를 단순화한다.
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) throw error;
  return data;
}

/**
 * Kakao OAuth 로그인
 * - 매개변수: 없음
 * - 반환값: Supabase signInWithOAuth의 data
 * - 부수효과: 브라우저를 Kakao 인증 페이지로 리다이렉트한다.
 * - 예외: 클라이언트 미설정 또는 OAuth 오류 시 throw.
 */
export async function signInWithKakao() {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      // 인증 후 현재 페이지로 복귀.
      redirectTo: window.location.origin + window.location.pathname,
      // Kakao 동의 항목 요청: 닉네임/프로필 이미지/계정 이메일.
      // 이메일 수신을 위해 Kakao 개발자 콘솔에서도 해당 항목이 허용되어 있어야 한다.
      scopes: 'profile_nickname profile_image account_email',
    }
  });
  if (error) throw error;
  return data;
}

/**
 * 이메일/비밀번호 로그인
 * - 매개변수: email(로그인 이메일), password(비밀번호)
 * - 반환값: 세션/유저 정보가 담긴 data
 * - 부수효과: 성공 시 Supabase 세션이 저장되어 로그인 상태가 된다.
 * - 예외: 클라이언트 미설정 또는 인증 실패 시 throw.
 */
export async function signInWithEmail(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * 이메일 회원가입
 * - 매개변수: email, password, displayName(표시 이름)
 * - 반환값: 생성된 유저/세션 정보 data
 * - 부수효과: 신규 사용자 생성. 이메일 확인 설정에 따라 확인 메일이 발송될 수 있다.
 * - 예외: 클라이언트 미설정 또는 가입 오류 시 throw.
 */
export async function signUp(email: string, password: string, displayName: string) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      // user metadata(raw_user_meta_data)에 저장될 추가 정보.
      data: {
        // 표시 이름. 트리거/프로필 동기화 시 사용될 수 있음.
        full_name: displayName,
        // 가입이 발생한 도메인(호스트네임)을 기록 — 멀티 사이트 환경에서 출처 구분용.
        signup_domain: window.location.hostname,
      }
    }
  });
  if (error) throw error;
  return data;
}

/**
 * 로그아웃 — local scope로 OAuth 세션 만료 시 에러 방지
 * - 매개변수: 없음
 * - 반환값: 없음(void)
 * - 부수효과: 로컬에 저장된 세션을 제거한다.
 * - 비고: scope:'local'은 현재 기기의 세션만 만료시킨다. 전역(global) 로그아웃은
 *   서버 호출이 필요한데, OAuth 세션이 이미 만료된 경우 그 호출이 에러를 던질 수 있어
 *   이를 피하기 위해 local을 사용한다.
 */
export async function signOut() {
  const client = getSupabase();
  // 클라이언트가 없으면 로그아웃할 세션도 없으므로 조용히 반환.
  if (!client) return;
  const { error } = await client.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

/**
 * 프로필 조회
 * - 매개변수: userId(조회할 사용자 UUID)
 * - 반환값: UserProfile 또는 null(클라이언트 미설정/조회 실패 시)
 * - 부수효과: 없음(읽기 전용). 오류는 throw하지 않고 콘솔 로깅 후 null 반환.
 * - 비고: user_profiles 테이블은 RLS가 걸려 있으므로, 본인 또는 권한 있는 행만 조회된다.
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    // .single(): 정확히 1행을 기대. 0행이거나 2행 이상이면 error가 채워진다.
    .single();
  if (error) {
    // 호출부 흐름을 끊지 않기 위해 throw 대신 로깅 후 null 반환(엣지케이스 방어).
    console.error('getProfile error:', error);
    return null;
  }
  return data as UserProfile;
}

/**
 * 비밀번호 재설정 이메일 전송
 * - 매개변수: email(재설정 메일을 받을 주소)
 * - 반환값: Supabase 응답 data
 * - 부수효과: 해당 이메일로 재설정 링크 메일이 발송된다.
 * - 예외: 클라이언트 미설정 또는 전송 오류 시 throw.
 */
export async function resetPassword(email: string) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client.auth.resetPasswordForEmail(email, {
    // 메일 링크 클릭 후 비밀번호 변경을 처리할 페이지(현재 origin+pathname)로 리다이렉트.
    redirectTo: window.location.origin + window.location.pathname
  });
  if (error) throw error;
  return data;
}

/**
 * 프로필 업데이트
 * - 매개변수: userId(대상 사용자 UUID), updates(변경할 컬럼들의 부분 객체)
 * - 반환값: 갱신된 UserProfile 또는 null(클라이언트 미설정 시)
 * - 부수효과: user_profiles 해당 행을 수정한다.
 * - 예외: 업데이트 오류 시 throw.
 * - 비고: RLS로 본인(또는 권한자) 행만 수정 가능하다.
 */
export async function updateProfile(
  userId: string,
  updates: Record<string, unknown>
): Promise<UserProfile | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from('user_profiles')
    // 전달받은 updates를 펼치고 updated_at을 현재 시각(ISO 문자열)으로 항상 갱신.
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    // .select().single(): 수정된 행을 다시 받아 갱신 결과를 반환.
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}
