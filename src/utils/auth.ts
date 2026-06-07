/**
 * auth.ts — Supabase Auth 헬퍼 함수
 *
 * ── 이 파일이 무엇인가? (초보자용 큰 그림) ──────────────────────────────
 *   "로그인/회원가입/로그아웃/프로필"처럼 '사용자 인증'과 관련된 작업들을
 *   한 파일에 모아둔 도구상자(유틸리티 모듈)입니다.
 *   화면(UI) 컴포넌트들은 복잡한 인증 코드를 직접 쓰지 않고, 여기 있는 함수만
 *   불러다 쓰면 됩니다. 이렇게 하면 인증 규칙이 한 곳에 모여 관리가 쉬워집니다.
 *
 * ── 꼭 알아야 할 용어 (쉬운 말로) ───────────────────────────────────
 *   • Supabase: 데이터베이스 + 로그인 기능을 제공하는 백엔드 서비스(클라우드).
 *               우리는 이 서비스에 명령을 보내는 '클라이언트(client)'를 통해 대화합니다.
 *   • Auth(인증): "당신이 정말 본인인가?"를 확인하는 절차(로그인 등).
 *   • OAuth: 구글/카카오 같은 외부 계정으로 대신 로그인하게 해주는 표준 방식.
 *            우리 사이트가 비밀번호를 직접 받지 않아도 되어 안전합니다.
 *   • 비동기(async/await): 서버에 요청을 보내고 '답이 올 때까지 잠깐 기다리는' 작업.
 *            await가 붙은 줄은 "결과가 올 때까지 여기서 멈췄다가 다음 줄로 간다"는 뜻입니다.
 *   • RLS(Row Level Security): 데이터베이스의 '행(row) 단위 보안 규칙'.
 *            예) "사용자는 자기 자신의 프로필 행만 읽고/수정할 수 있다" 같은 규칙을
 *            DB가 강제로 걸어줍니다. 그래서 코드가 실수해도 남의 데이터를 못 건드립니다.
 *
 * ── 이 파일의 공통 패턴 (모든 함수가 비슷하게 생긴 이유) ───────────────
 *   1) getSupabase()로 클라이언트를 가져온다.
 *   2) 클라이언트가 없으면(환경설정 누락) 안전하게 처리한다.
 *   3) await로 Supabase에 요청을 보내고 { data, error } 형태로 결과를 받는다.
 *      → Supabase는 성공이든 실패든 예외를 던지지 않고, error 자리에 담아서 돌려줍니다.
 *        그래서 직접 'if (error)'로 확인해줘야 합니다. (이게 초보자가 자주 빠뜨리는 부분!)
 *   4) error가 있으면 throw 하거나(호출부가 try/catch로 잡음), null을 돌려준다.
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
// import type: '값'이 아니라 '타입(모양 정보)'만 가져온다는 뜻.
//   TypeScript에서 타입은 코드 검사(컴파일)할 때만 쓰이고, 실제 실행 파일에는 안 들어갑니다.
//   UserProfile: user_profiles 테이블의 행 구조를 나타내는 타입 (타입 전용 import).
import type { UserProfile } from '../types';
// getSupabase: 싱글턴 Supabase 클라이언트를 반환하는 팩토리. 환경설정이 없으면 null 반환 가능.
//   '싱글턴'이란 프로그램 전체에서 단 하나의 인스턴스만 만들어 공유하는 방식입니다.
//   환경변수(접속 주소/키)가 없으면 null을 돌려줄 수 있어, 아래 함수들이 매번 null 검사를 합니다.
import getSupabase from './supabase';

/**
 * Google OAuth 로그인
 * - 매개변수: 없음
 * - 반환값: Supabase signInWithOAuth의 data (보통 OAuth provider URL 정보)
 * - 부수효과: 브라우저를 Google 인증 페이지로 리다이렉트한다.
 *            → 즉, 이 함수가 성공하면 화면이 구글 로그인 페이지로 넘어갑니다.
 * - 예외: 클라이언트 미설정 또는 OAuth 오류 시 throw (호출부에서 try/catch로 잡아야 함).
 */
export async function signInWithGoogle() {
  const client = getSupabase();
  // 클라이언트가 없으면(=환경변수 미설정) 진행 불가 — 즉시 예외 발생.
  // 주의: '!client'는 client가 null/undefined일 때 true가 됩니다. (널 체크의 표준 표현)
  if (!client) throw new Error('Supabase not configured');
  // await: 구글 로그인 시작 요청을 보내고 응답이 올 때까지 기다립니다.
  // 구조 분해 할당: 받은 결과 객체에서 data와 error를 꺼내 변수로 바로 받습니다.
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    // 인증 완료 후 현재 페이지(origin+pathname)로 되돌아오도록 리다이렉트 URL 지정.
    // 해시/쿼리는 제외해 OAuth 콜백 처리를 단순화한다.
    //   window.location.origin   = 'https://도메인'  (프로토콜+호스트)
    //   window.location.pathname = '/경로'           (쿼리(?)·해시(#) 제외한 경로)
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  // Supabase는 실패를 error에 담아 돌려줍니다. 있으면 직접 던져 호출부에 알립니다.
  if (error) throw error;
  return data;
}

/**
 * Kakao OAuth 로그인
 * - 매개변수: 없음
 * - 반환값: Supabase signInWithOAuth의 data
 * - 부수효과: 브라우저를 Kakao 인증 페이지로 리다이렉트한다.
 * - 예외: 클라이언트 미설정 또는 OAuth 오류 시 throw.
 * - 구글 버전과 거의 같고, '동의 항목(scopes)'을 추가로 요청하는 점만 다릅니다.
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
      // 주의: 코드에서 요청해도 콘솔에서 '허용'돼 있지 않으면 실제 값을 못 받습니다.
      scopes: 'profile_nickname profile_image account_email',
    }
  });
  if (error) throw error;
  return data;
}

/**
 * 이메일/비밀번호 로그인
 * - 매개변수: email(로그인 이메일), password(비밀번호) — 둘 다 string 타입.
 * - 반환값: 세션/유저 정보가 담긴 data
 * - 부수효과: 성공 시 Supabase 세션이 저장되어 로그인 상태가 된다.
 * - 예외: 클라이언트 미설정 또는 인증 실패(비번 틀림 등) 시 throw.
 * - OAuth와 달리 리다이렉트 없이, 현재 페이지에서 바로 로그인됩니다.
 */
export async function signInWithEmail(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  // { email, password }는 { email: email, password: password }의 축약형(객체 속성 단축 표기).
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * 이메일 회원가입
 * - 매개변수: email, password, displayName(표시 이름)
 * - 반환값: 생성된 유저/세션 정보 data
 * - 부수효과: 신규 사용자 생성. 이메일 확인 설정에 따라 확인 메일이 발송될 수 있다.
 * - 예외: 클라이언트 미설정 또는 가입 오류(이미 가입된 이메일 등) 시 throw.
 */
export async function signUp(email: string, password: string, displayName: string) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      // user metadata(raw_user_meta_data)에 저장될 추가 정보.
      //   로그인 자체엔 꼭 필요 없지만, 표시 이름 등 부가 정보를 함께 보관합니다.
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
 *     • 'local'  = 지금 이 기기/브라우저의 세션만 지움.
 *     • 'global' = 서버에 요청해 모든 기기의 세션까지 한 번에 만료(실패 위험 있음).
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
 *           (반환 타입 'Promise<UserProfile | null>': 비동기 결과로 둘 중 하나가 온다는 뜻)
 * - 부수효과: 없음(읽기 전용). 오류는 throw하지 않고 콘솔 로깅 후 null 반환.
 * - 설계 의도: '실패해도 앱이 멈추지 않게' 예외 대신 null을 반환합니다.
 *             호출부는 try/catch 대신 'if (profile)' 같은 식으로 처리하면 됩니다.
 * - 비고: user_profiles 테이블은 RLS가 걸려 있으므로, 본인 또는 권한 있는 행만 조회된다.
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const client = getSupabase();
  if (!client) return null;
  // 아래는 '메서드 체이닝': 점(.)으로 연결해 질의를 한 단계씩 조립합니다.
  const { data, error } = await client
    .from('user_profiles')   // 어떤 테이블에서?  → user_profiles
    .select('*')             // 어떤 칼럼을?      → '*' = 모든 칼럼
    .eq('id', userId)        // 어떤 조건으로?    → id 칼럼이 userId와 '같은(equal)' 행만
    // .single(): 정확히 1행을 기대. 0행이거나 2행 이상이면 error가 채워진다.
    .single();
  if (error) {
    // 호출부 흐름을 끊지 않기 위해 throw 대신 로깅 후 null 반환(엣지케이스 방어).
    console.error('getProfile error:', error);
    return null;
  }
  // 'as UserProfile': TypeScript에게 "이 data는 UserProfile 타입이야"라고 알려주는 타입 단언.
  return data as UserProfile;
}

/**
 * 비밀번호 재설정 이메일 전송
 * - 매개변수: email(재설정 메일을 받을 주소)
 * - 반환값: Supabase 응답 data
 * - 부수효과: 해당 이메일로 재설정 링크 메일이 발송된다.
 * - 예외: 클라이언트 미설정 또는 전송 오류 시 throw.
 * - 흐름: 사용자가 메일 링크 클릭 → 아래 redirectTo 페이지로 이동 → 거기서 새 비밀번호 입력.
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
 *     updates 타입 Record<string, unknown> = "키는 문자열, 값은 타입 미특정"인 객체.
 *     (예: { nickname: '새이름', age: 30 } 처럼 일부 필드만 넘겨도 됨)
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
    //   '...updates'(전개 구문)는 updates의 모든 키/값을 이 새 객체에 그대로 펼쳐 넣습니다.
    //   주의: 같은 키가 겹치면 '뒤에 쓴 것'이 이깁니다 → updated_at은 항상 현재 시각으로 덮어써짐.
    //   new Date().toISOString(): 현재 시각을 '2026-06-07T12:34:56.789Z' 같은 표준 문자열로 변환.
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)   // id가 userId와 같은 행만 한정 (이 줄이 없으면 전체 행이 위험!)
    // .select().single(): 수정된 행을 다시 받아 갱신 결과를 반환.
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}
