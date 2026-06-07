/**
 * Login.tsx — 로그인 페이지 컴포넌트
 *
 * [이 파일을 한 줄로 말하면]
 * - 사용자가 "로그인"을 할 수 있는 화면 한 개를 통째로 그려주는 코드입니다.
 *
 * [초보자를 위한 배경 지식]
 * - 이 파일은 "React 컴포넌트"입니다. 컴포넌트란 화면의 한 조각(여기서는 로그인 화면 전체)을
 *   만들어내는 함수라고 생각하면 됩니다. 함수가 JSX(아래 return 안의 HTML처럼 생긴 코드)를
 *   돌려주면, React가 그것을 실제 웹 화면으로 바꿔서 보여줍니다.
 * - 확장자 .tsx = TypeScript(.ts) + JSX. TypeScript는 JavaScript에 "타입(자료형)" 검사를
 *   더한 언어입니다. 예: 문자열 자리에 숫자를 넣으면 미리 경고해 줍니다.
 * - "라우트 페이지"란 특정 주소(URL)로 들어왔을 때 보여줄 화면을 뜻합니다. 이 파일은
 *   보통 "/login" 주소에 연결됩니다.
 *
 * [이 화면이 하는 일 / 책임]
 * - 두 단계(step) UI 제공: 'method'(소셜/이메일 로그인 방식 고르기) → 'email'(이메일·비밀번호 입력 폼).
 *   즉, 화면을 새로 옮기지 않고 같은 페이지 안에서 보이는 내용만 바꿉니다.
 * - 소셜 로그인(Google/Kakao)과 이메일/비밀번호 로그인을 처리합니다.
 * - OAuth 콜백(소셜 로그인 후 돌아오는 단계)에서 실패했을 때, 주소(URL)에 붙어온 에러를
 *   감지해 사용자에게 보여줍니다.
 * - 이미 로그인된 사용자가 이 페이지에 오면, 원래 가려던 곳(from) 또는 홈으로 자동 이동시킵니다.
 * - 차단/탈퇴 처리된 계정(accountBlock)에는 안내 메시지를 보여줍니다.
 *
 * [용어 빠른 설명]
 * - 소셜 로그인 / OAuth: 구글·카카오 같은 외부 서비스에 "이 사람이 맞는지" 확인을 맡기는 방식.
 *   우리 사이트가 비밀번호를 직접 받지 않고, 외부 사이트로 보냈다가 다시 우리 사이트로
 *   "리다이렉트(주소 이동)"되어 돌아옵니다.
 * - Supabase: 회원가입·로그인·데이터베이스를 대신 처리해 주는 백엔드 서비스. 여기서는
 *   utils/auth 안의 함수들이 Supabase에 로그인 요청을 보냅니다.
 * - RLS(Row Level Security): 데이터베이스에서 "이 사용자는 이 행(데이터)만 볼 수 있다"는 규칙.
 *   로그인이 되어 있어야(=인증) 본인 데이터에 접근할 수 있게 하는 보안 장치입니다.
 *
 * [주요 export]
 * - default: Login (React 컴포넌트)
 *
 * [의존성 — 다른 곳에서 가져와 쓰는 도구들]
 * - useLanguage: 다국어 번역 함수 t 제공 (예: t('auth.login') → 현재 언어의 "로그인" 문구)
 * - useAuth: 로그인 상태(isLoggedIn) 및 계정 차단 정보(accountBlock) 제공
 * - utils/auth: signInWithGoogle / signInWithKakao / signInWithEmail (Supabase 인증 래퍼 함수)
 */

// ── import: 다른 파일/라이브러리에서 필요한 기능을 가져옵니다 ──
// useState: 컴포넌트가 "기억"할 값(상태)을 만드는 React 훅(hook). 값이 바뀌면 화면이 다시 그려집니다.
// useEffect: 화면이 그려진 "뒤"에 부수효과(예: URL 읽기, 타이머 등)를 실행하는 훅.
// type ReactElement / type FormEvent: TypeScript 타입(자료형)만 가져옵니다. 실제 코드는 아니고
//   "이 값은 이런 모양"이라고 알려주는 표식입니다. (앞의 type 키워드가 타입 전용 import라는 표시)
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
// 라우팅(주소 이동) 도구들:
// Link: 클릭하면 다른 페이지로 이동하는 링크(새로고침 없이 이동).
// useNavigate: 코드에서 직접 페이지를 이동시키는 함수를 돌려줌(navigate('/경로')).
// useLocation: 현재 주소 정보(어디서 왔는지 등)를 읽는 훅.
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signInWithKakao, signInWithEmail } from '../utils/auth';
import SEOHead from '../components/SEOHead';
import '../styles/auth.css'; // CSS 파일 import: 이 화면에 적용할 스타일(디자인)을 불러옵니다.

// 로그인 화면의 단계 타입: 'method'(로그인 방식 선택) | 'email'(이메일 폼 입력)
// TypeScript의 "유니온 타입"입니다. 이 변수는 반드시 이 두 문자열 중 하나만 가질 수 있어,
// 오타('emial' 같은)나 엉뚱한 값을 미리 막아줍니다.
type LoginStep = 'method' | 'email';

// Login 컴포넌트 정의.
// (): ReactElement | null → "매개변수 없음, 반환값은 화면 요소(ReactElement) 또는 아무것도 안 그림(null)"이라는 뜻.
// null을 반환하면 "이 화면은 그리지 마"라는 의미입니다(아래 이미 로그인된 경우에 사용).
const Login = (): ReactElement | null => {
  const { t } = useLanguage(); // 다국어 번역 함수 t를 꺼냅니다. ({ t }는 객체에서 t만 뽑는 "구조 분해 할당")
  // 인증 컨텍스트에서 필요한 값들을 꺼냅니다.
  // isLoggedIn: 현재 로그인되어 있는지(true/false)
  // accountBlock: 차단/탈퇴된 계정 정보(없으면 비어있음)
  // clearAccountBlock: 차단 안내를 닫을 때 그 정보를 지우는 함수
  const { isLoggedIn, accountBlock, clearAccountBlock } = useAuth();
  const navigate = useNavigate(); // 페이지 이동을 시키는 함수
  const location = useLocation(); // 현재 위치(주소) 정보
  // 보호된 라우트(로그인해야 볼 수 있는 페이지)에서 튕겨져 이 로그인 페이지로 왔다면,
  // 원래 가려던 목적지 경로가 location.state.from.pathname 에 담겨 옵니다. 그 값을 꺼냅니다.
  // ?. (옵셔널 체이닝): 중간 값이 없으면(undefined) 에러 내지 않고 그냥 undefined로 넘어갑니다.
  //   즉 from이 없을 수도 있는 상황을 안전하게 처리합니다.
  // || '/' : 위에서 못 찾으면(빈 값이면) 기본값으로 홈('/')을 씁니다.
  // (location.state as {...}) 의 as는 TypeScript에게 "이 값을 이런 타입으로 봐줘"라고 알려주는 표시입니다.
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // ── 상태(state) 선언 ──
  // useState는 [현재값, 값을 바꾸는 함수] 쌍을 돌려줍니다. setXxx를 호출하면 화면이 다시 그려집니다.
  // 주의: 상태값을 form.email = '...' 처럼 직접 바꾸면 안 됩니다. 반드시 setForm(...)을 써야 React가 변화를 알아챕니다.
  const [step, setStep] = useState<LoginStep>('method'); // 현재 화면 단계. 처음엔 'method'(방식 선택).
  const [form, setForm] = useState({ email: '', password: '' }); // 이메일 로그인 폼 입력값(이메일/비밀번호).
  const [error, setError] = useState(''); // 사용자에게 표시할 에러 메시지. 빈 문자열이면 에러 없음.
  const [loading, setLoading] = useState(false); // 이메일 로그인 요청이 진행 중인지(중복 클릭 방지/버튼 비활성화에 사용).

  // OAuth 콜백 에러 감지 (소셜 로그인 리다이렉트가 실패하면 돌아온 URL에 error 파라미터가 붙어 옵니다)
  // useEffect: 화면이 처음 그려진 뒤 한 번 실행되는 부수효과. (아래 빈 배열 [] 때문에 "한 번만" 실행됨)
  useEffect(() => {
    // window.location.search: 현재 URL의 물음표(?) 뒤 쿼리스트링 부분(예: "?error=...&error_description=...").
    // URLSearchParams: 그 쿼리스트링을 다루기 쉽게 만들어 주는 도구. params.get('키')로 값을 꺼냅니다.
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error'); // 에러 코드(없으면 null)
    const errorDesc = params.get('error_description'); // 에러 상세 설명(없으면 null)
    if (errorCode) {
      // 에러 설명(errorDesc)이 있으면 그대로 쓰고, 없으면 코드로 기본 메시지를 만들어 보여줍니다.
      // 백틱(`)으로 감싼 문자열은 "템플릿 리터럴"로, ${...} 안의 값을 문자열에 끼워 넣습니다.
      setError(errorDesc || `로그인 오류: ${errorCode}`);
      // URL 정리
      // 에러가 붙은 쿼리 파라미터를 주소창에서 지웁니다. 이렇게 안 하면 사용자가 새로고침하거나
      // 주소를 공유했을 때 에러가 또 떠 보일 수 있습니다.
      // replaceState: 현재 히스토리 항목을 새 주소로 "교체"(뒤로가기 기록을 추가하지 않음).
      // pathname + hash 만 남기고 쿼리(?...)는 제거합니다(해시 #...는 그대로 보존).
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
  }, []); // 의존성 배열이 비어 있음([]) → 컴포넌트가 처음 화면에 나타날(mount) 때 딱 1회만 실행.

  // 이미 로그인된 상태면 이 로그인 페이지를 보여주지 않고, 목적지(from)로 바로 이동시킵니다.
  // replace: true → 브라우저 히스토리를 "대체"해서, 사용자가 뒤로가기를 눌러도 로그인 페이지로 다시 오지 않게 함.
  // 주의: 컴포넌트 본문에서 곧장 navigate를 호출하는 건 단순해 보이지만, 더 안전한 방식은
  //   useEffect 안에서 이동시키는 것입니다(렌더 도중 부수효과는 경고를 부를 수 있음). 다만 바로 아래에서
  //   null을 반환해 화면을 그리지 않으므로 여기서는 동작합니다.
  if (isLoggedIn) {
    navigate(from, { replace: true });
    return null; // 화면을 아무것도 그리지 않음(이미 다른 곳으로 이동 중이므로).
  }

  // 이메일/비밀번호 로그인 제출 핸들러.
  // async: 이 함수 안에서 await(기다리기)를 쓸 수 있는 "비동기 함수"라는 표시.
  // 매개변수 e: 폼 제출 이벤트 정보. 반환: 없음(부수효과로 로그인 시도 + 화면 상태 변경).
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault(); // 폼 기본 동작(제출 시 페이지 새로고침)을 막습니다. 안 막으면 화면이 깜빡 새로고침됩니다.
    if (!form.email || !form.password) return; // 둘 중 하나라도 비어 있으면 서버에 요청하지 않고 종료(빈 값 방어).
    setLoading(true);  // 로딩 시작 → 버튼이 비활성화되어 중복 클릭을 막습니다.
    setError('');      // 이전 에러 메시지를 지웁니다(이번 시도 결과로 새로 채울 것이므로).
    try {
      // Supabase에 이메일/비밀번호 로그인을 요청하고, 끝날 때까지 기다립니다(await).
      // await 덕분에 로그인이 "완료된 뒤"에 다음 줄(navigate)이 실행됩니다.
      await signInWithEmail(form.email, form.password);
      navigate(from, { replace: true }); // 성공 시 원래 가려던 곳으로 이동.
    } catch (err) {
      // 로그인 실패(비밀번호 틀림, 네트워크 오류 등) 시 여기로 옵니다.
      // (err as Error).message: 잡힌 오류를 Error 타입으로 보고 그 메시지를 꺼냅니다.
      // 메시지가 비어 있으면 번역된 기본 문구(t('auth.loginError'))를 대신 보여줍니다.
      setError((err as Error).message || t('auth.loginError'));
    } finally {
      // finally: 성공하든 실패하든 "항상" 실행됩니다. 어떤 경우든 로딩 상태를 반드시 풀어줍니다.
      setLoading(false);
    }
  };

  // 소셜 로그인 핸들러 (Google/Kakao).
  // OAuth는 외부 사이트로 페이지가 통째로 이동(리다이렉트)하는 방식이라, 성공하면 이 페이지를 아예 떠납니다.
  // 매개변수 provider: 'google' 또는 'kakao' 중 하나만 받을 수 있도록 타입으로 제한.
  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setError(''); // 이전 에러 초기화
    try {
      // 선택한 제공자에 맞는 OAuth 흐름을 시작합니다(보통 외부 로그인 화면으로 리다이렉트됨).
      if (provider === 'google') await signInWithGoogle();
      else if (provider === 'kakao') await signInWithKakao();
    } catch (err) {
      // 여기서 잡히는 건 "리다이렉트가 시작되기도 전"의 에러(설정 누락 등)뿐입니다.
      // 외부 사이트에 다녀온 뒤 발생하는 콜백 에러는 이 함수가 아니라 위쪽 useEffect에서 처리합니다.
      // (이미 페이지를 떠났다가 돌아오기 때문에 이 try/catch로는 잡을 수 없음)
      setError((err as Error).message || t('auth.loginError'));
    }
  };

  // ── 화면 그리기(JSX) ──
  // 아래 return 안은 JSX입니다. HTML과 비슷하지만 실제로는 JavaScript이며,
  // 중괄호 { } 안에는 JavaScript 값/표현식을 넣을 수 있습니다.
  // <> ... </>는 "Fragment"로, 여러 요소를 의미 없는 껍데기 없이 하나로 묶을 때 씁니다(JSX는 최상위가 1개여야 함).
  return (
    <>
    {/* 로그인 페이지는 검색엔진 색인 제외(noindex) — 검색 결과에 노출될 필요가 없는 화면이라서 */}
    <SEOHead title="로그인" path="/login" noindex />
    <section className="auth-fullpage">
      <div className="auth-center-wrapper">
        <div className="auth-card-google">
          {/* 브랜드 로고 영역(DreamIT Biz). {' '}는 단어 사이 공백 한 칸을 의미(JSX는 줄바꿈 공백을 무시하므로 명시) */}
          <div className="auth-logo-area">
            <span className="brand-dream">Dream</span>
            <span className="brand-it">IT</span>{' '}
            <span className="brand-biz">Biz</span>
          </div>
          {/* t(...)로 현재 언어에 맞는 제목/부제목 문구를 가져와 표시 */}
          <h2 className="auth-heading">{t('auth.loginTitle')}</h2>
          <p className="auth-sub">{t('auth.loginSubtitle')}</p>

          {/* 계정 차단/탈퇴 안내: accountBlock에 값이 있을 때"만" 이 블록을 그립니다.
              {조건 && <JSX>} 패턴: 조건이 참이면 뒤의 JSX를 그리고, 거짓이면 아무것도 안 그립니다(조건부 렌더링). */}
          {accountBlock && (
            <div className="auth-error" style={{ marginBottom: '16px' }}>
              {/* 차단(banned) 상태일 때만 표시. 사유(reason)가 있으면 함께 노출 */}
              {accountBlock.status === 'banned' && (
                <>
                  계정이 차단되었습니다.
                  {accountBlock.reason && <> 사유: {accountBlock.reason}</>}
                </>
              )}
              {/* 탈퇴(deleted) 상태일 때만 표시 */}
              {accountBlock.status === 'deleted' && (
                <>탈퇴 처리된 계정입니다.</>
              )}
              {/* 안내 닫기 버튼: 누르면 컨텍스트에 저장된 차단 정보를 비워(clearAccountBlock) 이 안내가 사라짐 */}
              <button
                onClick={clearAccountBlock}
                style={{
                  display: 'block', marginTop: '8px', background: 'none',
                  border: 'none', textDecoration: 'underline', cursor: 'pointer',
                  color: 'inherit', fontSize: '14px', padding: 0,
                }}
              >
                닫기
              </button>
            </div>
          )}

          {/* 단계 분기(삼항 연산자 조건 ? A : B): step이 'method'면 방식 선택 화면을, 아니면 이메일 입력 폼을 그림 */}
          {step === 'method' ? (
            <>
              {/* 소셜/이메일 로그인 방식 버튼 모음 */}
              <div className="auth-methods">
                {/* Google 소셜 로그인 버튼.
                    onClick={() => handleSocialLogin('google')}: 화살표 함수로 "감싸서" 클릭 시점에 호출되게 함.
                    주의: onClick={handleSocialLogin('google')}처럼 쓰면 클릭 전에 즉시 실행되어 버립니다(괄호 차이!). */}
                <button className="auth-method-btn google" onClick={() => handleSocialLogin('google')}>
                  {/* 아래 <svg>는 구글 로고를 그리는 벡터 그래픽(이미지 파일 없이 코드로 그린 그림) */}
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>
                {/* Kakao 소셜 로그인 버튼(동작 방식은 Google과 동일, provider만 'kakao') */}
                <button className="auth-method-btn kakao" onClick={() => handleSocialLogin('kakao')}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.8 5.22 4.52 6.6-.2.74-.72 2.68-.82 3.1-.13.5.18.49.38.36.16-.1 2.5-1.7 3.5-2.4.78.12 1.58.18 2.42.18 5.52 0 10-3.58 10-7.9S17.52 3 12 3z" fill="#3C1E1E"/>
                  </svg>
                  <span>Kakao</span>
                </button>
                {/* 이메일 로그인 버튼: 클릭하면 step을 'email'로 바꿔 같은 페이지에서 입력 폼으로 전환 */}
                <button className="auth-method-btn email" onClick={() => setStep('email')}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span>Email</span>
                </button>
              </div>

              {/* 에러 메시지: error가 빈 문자열이 아닐 때만 표시(소셜 로그인 시작 실패 또는 OAuth 콜백 에러) */}
              {error && <div className="auth-error">{error}</div>}

              {/* 아직 계정이 없는 사용자를 위한 회원가입 링크. Link는 새로고침 없이 /register로 이동 */}
              <div className="auth-bottom-link">
                <span>{t('auth.noAccount')}</span>
                <Link to="/register">{t('auth.signUp')}</Link>
              </div>
            </>
          ) : (
            <>
              {/* 이메일/비밀번호 로그인 폼.
                  onSubmit={handleEmailLogin}: 폼이 제출될 때(엔터 또는 제출 버튼) 위에서 만든 핸들러를 실행 */}
              <form onSubmit={handleEmailLogin} className="auth-email-form">
                <div className="auth-input-group">
                  {/* 이메일 입력칸.
                      value={form.email} + onChange로 입력값을 상태에 저장 = "제어 컴포넌트"(입력값을 React가 관리).
                      onChange의 { ...form, email: e.target.value }: 기존 form을 복사(...전개)하고 email만 새 값으로 덮어씀.
                        → 이렇게 새 객체를 만드는 이유: 상태는 직접 수정하지 않고(불변성) 항상 새 값으로 교체해야 React가 변화를 감지함.
                      required: 비어 있으면 브라우저가 제출을 막아줌. autoFocus: 폼이 뜨면 자동으로 이 칸에 커서가 감. */}
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    autoFocus
                  />
                </div>
                <div className="auth-input-group">
                  {/* 비밀번호 입력칸. type="password"라 입력 글자가 점(•)으로 가려짐. password만 갱신(이메일과 동일한 불변성 패턴) */}
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                </div>

                {/* 로그인 실패 에러 메시지(error가 있을 때만) */}
                {error && <div className="auth-error">{error}</div>}

                <div className="auth-form-actions">
                  {/* 뒤로 버튼: type="button"이라 폼을 제출하지 않음(기본값 submit과 구분!).
                      클릭 시 step을 'method'로 되돌리고 에러 메시지도 비웁니다. */}
                  <button type="button" className="auth-back-btn" onClick={() => { setStep('method'); setError(''); }}>
                    {/* t('auth.back')가 없을 경우(번역 누락) 기본 문구 '뒤로'를 대신 표시 */}
                    {t('auth.back') || '뒤로'}
                  </button>
                  {/* 제출 버튼: type="submit"이라 누르면 위 form의 onSubmit이 실행됨.
                      disabled={loading}: 로그인 진행 중이면 비활성화해 중복 제출을 막음.
                      loading 중에는 "로그인 중" 문구, 아니면 "로그인" 문구를 보여줌(삼항 연산자). */}
                  <button type="submit" className="auth-next-btn" disabled={loading}>
                    {loading ? t('auth.loggingIn') : t('auth.login')}
                  </button>
                </div>
              </form>

              {/* 비밀번호를 잊은 사용자를 위한 "비밀번호 찾기" 링크 */}
              <div className="auth-forgot-link" style={{ textAlign: 'center', marginBottom: '12px' }}>
                <Link to="/forgot-password" style={{ fontSize: '15px', color: 'var(--text-light)' }}>
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              {/* 미가입자용 회원가입 링크(방식 선택 화면과 동일) */}
              <div className="auth-bottom-link">
                <span>{t('auth.noAccount')}</span>
                <Link to="/register">{t('auth.signUp')}</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
    </>
  );
};

// 이 파일의 기본(default) 내보내기. 다른 파일에서 import Login from '...' 으로 가져다 라우터에 연결합니다.
export default Login;
