/*
 * ForgotPassword.tsx
 * -----------------------------------------------------------------------------
 * 이 파일의 역할:
 *   비밀번호 재설정(찾기) 페이지 컴포넌트. 사용자가 이메일을 입력하면
 *   재설정 링크를 발송하도록 요청하고, 발송 성공/실패 상태를 화면에 보여준다.
 *
 * 핵심 책임:
 *   - 이메일 입력 폼 렌더링 및 입력값 상태 관리
 *   - resetPassword(auth 유틸)를 호출하여 비밀번호 재설정 메일 발송 요청
 *   - 로딩/전송완료(sent)/에러 상태에 따른 UI 분기 표시
 *   - 다국어(useLanguage)와 SEO(SEOHead) 처리
 *
 * 주요 export:
 *   - default export: ForgotPassword (React 페이지 컴포넌트)
 *
 * -----------------------------------------------------------------------------
 * 초보자를 위한 배경 지식 (처음 보는 용어 풀이):
 *   - "컴포넌트(component)": 화면의 한 조각을 만들어 내는 함수. 이 함수가 돌려주는
 *     JSX(HTML처럼 생긴 코드)가 실제 화면이 된다. 이 파일 전체가 컴포넌트 1개다.
 *   - "JSX": 자바스크립트 안에서 HTML처럼 화면 구조를 적는 문법. <div>...</div> 같은
 *     태그를 함수가 return으로 돌려주면 React가 이를 진짜 화면으로 그려준다.
 *   - "state(상태)": 시간이 지나며 바뀌는 값(예: 입력한 이메일, 로딩 여부). 상태가
 *     바뀌면 React가 화면을 자동으로 다시 그린다(=리렌더링). useState로 만든다.
 *   - "비밀번호 재설정 흐름": 사용자가 비밀번호를 잊었을 때, 본인 이메일로 '재설정
 *     링크'를 보내준다. 그 링크를 눌러 새 비밀번호를 정하는 방식. 이 페이지는 그
 *     첫 단계(이메일을 받아 링크 발송을 요청)만 담당한다.
 *   - "controlled input(제어 컴포넌트)": 입력창의 값을 React state가 직접 들고 있고,
 *     입력이 바뀔 때마다 state를 갱신하는 방식. 화면과 데이터가 항상 일치한다.
 * -----------------------------------------------------------------------------
 */

// React에서 필요한 도구들을 가져온다.
//  - useState: 컴포넌트 안에서 '바뀌는 값(상태)'을 만들고 관리하는 훅(Hook).
//    (개념: 훅이란 함수형 컴포넌트에 기능을 붙여주는 React 전용 함수. 이름이 use로 시작)
//  - type ReactElement: 컴포넌트가 돌려주는 'JSX 결과물'의 타입(TypeScript용 표시).
//  - type FormEvent: <form> 제출 등에서 전달되는 '이벤트 객체'의 타입.
//    주의: `type` 키워드로 가져온 것은 '타입(설명표시)'일 뿐 실제 코드로는 안 들어간다.
import { useState, type ReactElement, type FormEvent } from 'react';
// Link: 페이지 새로고침 없이 다른 경로로 이동하는 링크 컴포넌트(react-router-dom 제공).
//  (일반 <a> 태그와 달리 전체 페이지를 다시 불러오지 않아 빠르다)
import { Link } from 'react-router-dom';
// useLanguage: 현재 언어에 맞는 번역 문구를 꺼내주는 커스텀 훅(직접 만든 Context 훅).
import { useLanguage } from '../contexts/LanguageContext';
// resetPassword: 입력한 이메일로 '비밀번호 재설정 메일'을 보내달라고 백엔드에 요청하는 함수.
//  (인증 관련 로직은 utils/auth에 모아두고, 화면 파일에서는 이 함수만 호출한다)
import { resetPassword } from '../utils/auth';
// SEOHead: 페이지의 제목/검색엔진 색인 여부 등 <head> 메타 정보를 설정하는 컴포넌트.
import SEOHead from '../components/SEOHead';
// 인증 화면 공통 스타일(CSS). import만 해도 스타일이 적용된다(클래스명으로 연결).
import '../styles/auth.css';

/**
 * ForgotPassword
 * 비밀번호 재설정 요청 페이지 컴포넌트.
 *
 * 매개변수: 없음
 * 반환값: ReactElement (재설정 폼 또는 전송완료 안내 화면)
 * 부수효과: 제출 시 resetPassword 호출(비밀번호 재설정 메일 발송 API 요청)
 */
const ForgotPassword = (): ReactElement => {
  // 다국어 번역 함수 t (LanguageContext에서 제공)
  const { t } = useLanguage();
  // 아래 4개는 모두 useState로 만든 '상태'다.
  //  useState('초기값')은 [현재값, 값을바꾸는함수] 두 개를 배열로 돌려준다.
  //  이를 [email, setEmail] 처럼 구조분해해서 받는다. setXxx를 호출하면 화면이 다시 그려진다.
  //  주의: email 값을 바꾸고 싶을 때 email = '...' 처럼 직접 대입하면 안 된다.
  //        반드시 setEmail('...')을 써야 React가 변경을 감지하고 화면을 갱신한다.

  // email: 입력된 이메일 주소(빈 문자열로 시작)
  const [email, setEmail] = useState('');
  // loading: 재설정 메일 발송 요청 진행 중 여부(버튼 비활성/문구 전환에 사용)
  //  네트워크 요청은 시간이 걸리므로, 그 사이 사용자가 버튼을 또 누르지 못하게 막는 용도.
  const [loading, setLoading] = useState(false);
  // sent: 발송 성공 여부(true면 폼 대신 완료 안내 화면 표시)
  const [sent, setSent] = useState(false);
  // error: 발송 실패 시 표시할 에러 메시지(빈 문자열이면 에러 영역을 숨긴다)
  const [error, setError] = useState('');

  /**
   * handleSubmit
   * 폼 제출 핸들러. 입력된 이메일로 비밀번호 재설정 메일 발송을 요청한다.
   *
   * 매개변수: e (FormEvent) - 폼 제출 이벤트(브라우저가 자동으로 넘겨준다)
   * 반환값: Promise<void> (async 함수라 자동으로 Promise를 반환하지만 의미 있는 값은 없음)
   * 부수효과: loading/error/sent 상태 변경, resetPassword 비동기 호출
   *
   * 개념: async/await
   *   - async 함수 안에서 await을 쓰면 "이 작업이 끝날 때까지 기다렸다가 다음 줄 실행"이 된다.
   *   - 네트워크 요청처럼 시간이 걸리는 일을, 마치 순서대로 적은 것처럼 읽기 쉽게 해준다.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 기본 폼 제출(페이지 새로고침) 방지
    //  주의: <form>은 원래 제출되면 페이지를 새로고침한다. 그러면 입력값/상태가 다 날아간다.
    //        preventDefault()로 그 기본 동작을 막고, 우리가 직접 JS로 처리한다.

    if (!email) return; // 이메일이 비어 있으면 요청하지 않음(엣지케이스 방어)
    //  (!email: 빈 문자열은 '거짓'으로 취급되므로 비어있으면 여기서 함수를 즉시 끝낸다)

    setLoading(true); // 요청 시작: 로딩 상태 on (버튼 비활성화 + '전송 중' 문구로 전환됨)
    setError(''); // 이전 에러 메시지 초기화 (다시 시도할 때 묵은 에러가 남지 않도록)

    // try/catch/finally: 비동기 요청의 성공/실패/마무리를 나눠서 처리한다.
    try {
      // 비밀번호 재설정 메일 발송 요청(인증 백엔드 호출).
      //  await이라 메일 발송 요청이 끝날 때까지 여기서 기다린다. 실패하면 catch로 점프한다.
      await resetPassword(email);
      setSent(true); // 성공 시 완료 안내 화면으로 전환(sent=true → 아래 JSX에서 폼 대신 안내 표시)
    } catch (err) {
      // 실패 시 에러 메시지 표시(메시지 없으면 기본 영문 문구 사용)
      //  (err as Error): TypeScript에게 "err를 Error 타입으로 봐줘"라고 알려주는 단언(assertion).
      //  .message가 비어 있으면(||) 'Failed to send reset email'을 대신 보여준다.
      setError((err as Error).message || 'Failed to send reset email');
    } finally {
      // finally는 성공이든 실패든 '항상' 실행된다.
      setLoading(false); // 성공/실패와 무관하게 로딩 상태 off (버튼을 다시 누를 수 있게 복구)
    }
  };

  // 아래 return이 실제로 화면에 그려질 JSX다.
  //  <> ... </>: 'Fragment(빈 묶음 태그)'. 여러 요소를 불필요한 <div> 없이 하나로 묶을 때 사용.
  //  (개념: 컴포넌트는 반드시 '하나의' 최상위 요소만 돌려줘야 해서 이렇게 묶는다)
  return (
    <>
    {/* SEO: 검색엔진 색인 제외(noindex) - 인증 관련 페이지이므로 비공개 처리 */}
    {/* (noindex: 구글 같은 검색엔진이 이 페이지를 검색결과에 노출하지 않도록 막는 표시) */}
    <SEOHead title="비밀번호 찾기" path="/forgot-password" noindex />
    <section className="auth-fullpage">
      <div className="auth-center-wrapper">
        <div className="auth-card-google">
          {/* 브랜드 로고 영역(DreamIT Biz) */}
          {/* {' '}: JSX에서는 줄바꿈 사이 공백이 사라질 수 있어 '의도적인 한 칸 띄움'을 명시 */}
          <div className="auth-logo-area">
            <span className="brand-dream">Dream</span>
            <span className="brand-it">IT</span>{' '}
            <span className="brand-biz">Biz</span>
          </div>
          {/* 페이지 제목/부제(다국어). {t('...')}로 현재 언어에 맞는 문구를 꽂아 넣는다 */}
          <h2 className="auth-heading">{t('auth.forgotPasswordTitle')}</h2>
          <p className="auth-sub">{t('auth.forgotPasswordSubtitle')}</p>

          {/* sent 상태에 따라 완료 안내 화면 또는 입력 폼을 분기 렌더링 */}
          {/* 개념: JSX 안에서 { 조건 ? A : B } 는 삼항 연산자. 조건이 참이면 A, 거짓이면 B를 그린다 */}
          {sent ? (
            // 발송 완료 안내 화면 (sent === true 일 때)
            // 주의: style={{ ... }}는 '객체'를 넘기는 문법. 바깥 {}는 JSX 표현식, 안쪽 {}는 객체.
            //       CSS 속성명은 케밥-케이스가 아니라 카멜케이스(textAlign, borderRadius 등)로 쓴다.
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {/* 성공 체크 아이콘 원형 배경 */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                {/* 체크마크 SVG(초록색). polyline의 points는 'V' 모양 체크 표시의 좌표들 */}
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {/* 발송 완료 메시지(다국어) */}
              <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {t('auth.resetEmailSent')}
              </p>
              {/* 이메일 확인 안내 메시지(다국어) */}
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {t('auth.checkEmailForReset')}
              </p>
              {/* 로그인 페이지로 돌아가기 링크. to="/login" 경로로 이동 */}
              <Link to="/login" className="auth-next-btn" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            // 비밀번호 재설정 요청 입력 폼 (sent === false 일 때)
            // onSubmit={handleSubmit}: 폼이 제출되면(엔터 또는 버튼 클릭) 위의 handleSubmit 실행
            <form onSubmit={handleSubmit} className="auth-email-form">
              <div className="auth-input-group">
                {/* 이메일 입력 필드(controlled input). required+autoFocus 적용 */}
                {/* - type="email": 브라우저가 이메일 형식인지 기본 검사를 해준다 */}
                {/* - value={email}: 입력창에 보이는 값을 email 상태가 직접 통제(제어 컴포넌트) */}
                {/* - onChange: 키를 누를 때마다 setEmail로 상태 갱신 → 화면도 즉시 반영 */}
                {/*   주의: value만 있고 onChange가 없으면 글자가 안 써진다(읽기전용처럼 됨) */}
                {/* - required: 빈 값이면 제출 막음 / autoFocus: 화면 열리면 자동으로 커서 위치 */}
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  autoFocus
                />
              </div>

              {/* 에러가 있을 때만 에러 메시지 영역 표시 */}
              {/* 개념: {조건 && JSX} 는 조건이 참일 때만 뒤의 JSX를 그린다(거짓이면 아무것도 안 그림) */}
              {/* error가 빈 문자열('')이면 거짓이라 숨겨지고, 메시지가 차면 보인다 */}
              {error && <div className="auth-error">{error}</div>}

              <div className="auth-form-actions">
                {/* 로그인으로 돌아가기 링크 */}
                <Link to="/login" className="auth-back-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                  {t('auth.backToLogin')}
                </Link>
                {/* 제출 버튼: 로딩 중에는 비활성화하고 '전송 중' 문구로 전환 */}
                {/* disabled={loading}: 요청 중(loading=true)엔 버튼을 못 누르게 막아 중복 전송 방지 */}
                {/* {loading ? ... : ...}: 로딩 중이면 '전송 중' 문구, 아니면 '재설정 링크 보내기' 문구 */}
                <button type="submit" className="auth-next-btn" disabled={loading}>
                  {loading ? t('auth.sending') : t('auth.sendResetLink')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
    </>
  );
};

// 이 컴포넌트를 다른 파일에서 import해서 라우터에 연결할 수 있도록 기본 내보내기(default export).
//  (default export는 파일당 1개만 가능하며, import 시 이름을 자유롭게 붙일 수 있다)
export default ForgotPassword;
