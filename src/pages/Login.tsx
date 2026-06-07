/**
 * Login.tsx — 로그인 페이지 컴포넌트
 *
 * [역할/책임]
 * - 사용자 로그인 화면을 렌더링하는 라우트 페이지 컴포넌트.
 * - 두 단계(step) UI 제공: 'method'(소셜/이메일 선택) → 'email'(이메일·비밀번호 입력 폼).
 * - 소셜 로그인(Google/Kakao) 및 이메일/비밀번호 로그인을 처리한다.
 * - OAuth 콜백 리다이렉트 실패 시 URL 쿼리 파라미터의 에러를 감지해 표시한다.
 * - 이미 로그인된 사용자는 원래 가려던 경로(from) 또는 홈으로 리다이렉트한다.
 * - 차단/탈퇴 계정(accountBlock) 안내 메시지를 노출한다.
 *
 * [주요 export]
 * - default: Login (React 컴포넌트)
 *
 * [의존성]
 * - useLanguage: 다국어 번역 함수 t 제공
 * - useAuth: 로그인 상태(isLoggedIn) 및 계정 차단 정보(accountBlock) 제공
 * - utils/auth: signInWithGoogle / signInWithKakao / signInWithEmail (Supabase 인증 래퍼)
 */
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signInWithKakao, signInWithEmail } from '../utils/auth';
import SEOHead from '../components/SEOHead';
import '../styles/auth.css';

// 로그인 화면의 단계 타입: 'method'(로그인 방식 선택) | 'email'(이메일 폼 입력)
type LoginStep = 'method' | 'email';

const Login = (): ReactElement | null => {
  const { t } = useLanguage(); // 다국어 번역 함수
  // 인증 컨텍스트: 로그인 여부, 계정 차단 정보, 차단 안내 해제 함수
  const { isLoggedIn, accountBlock, clearAccountBlock } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // 보호된 라우트에서 리다이렉트되어 온 경우 원래 목적지 경로(from)를 추출. 없으면 홈('/').
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [step, setStep] = useState<LoginStep>('method'); // 현재 화면 단계
  const [form, setForm] = useState({ email: '', password: '' }); // 이메일 로그인 폼 입력값
  const [error, setError] = useState(''); // 사용자에게 표시할 에러 메시지
  const [loading, setLoading] = useState(false); // 이메일 로그인 요청 진행 중 여부

  // OAuth 콜백 에러 감지 (리다이렉트 실패 시 URL에 error 파라미터 포함)
  useEffect(() => {
    // 현재 URL의 쿼리스트링에서 OAuth 제공자가 돌려준 에러 코드/설명을 파싱
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error');
    const errorDesc = params.get('error_description');
    if (errorCode) {
      // 에러 설명이 있으면 그대로, 없으면 코드 기반 기본 메시지를 표시
      setError(errorDesc || `로그인 오류: ${errorCode}`);
      // URL 정리
      // 쿼리 파라미터를 제거해 새로고침/공유 시 에러가 다시 노출되지 않도록 함(해시는 유지)
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
  }, []); // 마운트 시 1회만 실행

  // 이미 로그인된 상태면 로그인 페이지를 보여주지 않고 목적지로 즉시 리다이렉트(히스토리 대체)
  if (isLoggedIn) {
    navigate(from, { replace: true });
    return null; // 렌더링 생략
  }

  // 이메일/비밀번호 로그인 제출 핸들러
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault(); // 폼 기본 제출(페이지 새로고침) 방지
    if (!form.email || !form.password) return; // 빈 값이면 요청하지 않음(엣지케이스 방어)
    setLoading(true);
    setError('');
    try {
      // Supabase 이메일 로그인 시도. 성공하면 목적지로 이동.
      await signInWithEmail(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      // 실패 시 에러 메시지 노출(메시지가 없으면 번역된 기본 문구 사용)
      setError((err as Error).message || t('auth.loginError'));
    } finally {
      setLoading(false); // 성공/실패와 무관하게 로딩 해제
    }
  };

  // 소셜 로그인 핸들러 (Google/Kakao). OAuth 리다이렉트 방식이므로 성공 시 페이지를 떠난다.
  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setError('');
    try {
      // 제공자에 따라 해당 OAuth 흐름 시작
      if (provider === 'google') await signInWithGoogle();
      else if (provider === 'kakao') await signInWithKakao();
    } catch (err) {
      // 리다이렉트 시작 전 에러(설정 누락 등)만 여기서 잡힘. 실제 콜백 에러는 useEffect에서 처리.
      setError((err as Error).message || t('auth.loginError'));
    }
  };

  return (
    <>
    {/* 로그인 페이지는 검색엔진 색인 제외(noindex) */}
    <SEOHead title="로그인" path="/login" noindex />
    <section className="auth-fullpage">
      <div className="auth-center-wrapper">
        <div className="auth-card-google">
          {/* 브랜드 로고 영역(DreamIT Biz) */}
          <div className="auth-logo-area">
            <span className="brand-dream">Dream</span>
            <span className="brand-it">IT</span>{' '}
            <span className="brand-biz">Biz</span>
          </div>
          <h2 className="auth-heading">{t('auth.loginTitle')}</h2>
          <p className="auth-sub">{t('auth.loginSubtitle')}</p>

          {/* 계정 차단/탈퇴 안내: 인증 컨텍스트에서 차단 정보가 있을 때만 표시 */}
          {accountBlock && (
            <div className="auth-error" style={{ marginBottom: '16px' }}>
              {/* 차단(banned) 상태: 사유가 있으면 함께 노출 */}
              {accountBlock.status === 'banned' && (
                <>
                  계정이 차단되었습니다.
                  {accountBlock.reason && <> 사유: {accountBlock.reason}</>}
                </>
              )}
              {/* 탈퇴(deleted) 상태 안내 */}
              {accountBlock.status === 'deleted' && (
                <>탈퇴 처리된 계정입니다.</>
              )}
              {/* 안내 닫기: 컨텍스트의 차단 정보를 초기화 */}
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

          {/* 단계 분기: 'method'면 로그인 방식 선택, 아니면 이메일 입력 폼 */}
          {step === 'method' ? (
            <>
              {/* 소셜/이메일 로그인 방식 버튼 모음 */}
              <div className="auth-methods">
                {/* Google 소셜 로그인 */}
                <button className="auth-method-btn google" onClick={() => handleSocialLogin('google')}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>
                {/* Kakao 소셜 로그인 */}
                <button className="auth-method-btn kakao" onClick={() => handleSocialLogin('kakao')}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.8 5.22 4.52 6.6-.2.74-.72 2.68-.82 3.1-.13.5.18.49.38.36.16-.1 2.5-1.7 3.5-2.4.78.12 1.58.18 2.42.18 5.52 0 10-3.58 10-7.9S17.52 3 12 3z" fill="#3C1E1E"/>
                  </svg>
                  <span>Kakao</span>
                </button>
                {/* 이메일 로그인: 클릭 시 'email' 단계로 전환 */}
                <button className="auth-method-btn email" onClick={() => setStep('email')}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span>Email</span>
                </button>
              </div>

              {/* 에러 메시지(소셜 로그인 시작 실패 또는 OAuth 콜백 에러) */}
              {error && <div className="auth-error">{error}</div>}

              {/* 미가입자용 회원가입 링크 */}
              <div className="auth-bottom-link">
                <span>{t('auth.noAccount')}</span>
                <Link to="/register">{t('auth.signUp')}</Link>
              </div>
            </>
          ) : (
            <>
              {/* 이메일/비밀번호 로그인 폼 */}
              <form onSubmit={handleEmailLogin} className="auth-email-form">
                <div className="auth-input-group">
                  {/* 이메일 입력: 진입 시 자동 포커스 */}
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
                  {/* 비밀번호 입력 */}
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                </div>

                {/* 로그인 실패 에러 메시지 */}
                {error && <div className="auth-error">{error}</div>}

                <div className="auth-form-actions">
                  {/* 뒤로: 방식 선택 단계로 복귀하며 에러 초기화 */}
                  <button type="button" className="auth-back-btn" onClick={() => { setStep('method'); setError(''); }}>
                    {t('auth.back') || '뒤로'}
                  </button>
                  {/* 제출 버튼: 로딩 중이면 비활성화 및 로딩 문구 표시 */}
                  <button type="submit" className="auth-next-btn" disabled={loading}>
                    {loading ? t('auth.loggingIn') : t('auth.login')}
                  </button>
                </div>
              </form>

              {/* 비밀번호 찾기 링크 */}
              <div className="auth-forgot-link" style={{ textAlign: 'center', marginBottom: '12px' }}>
                <Link to="/forgot-password" style={{ fontSize: '15px', color: 'var(--text-light)' }}>
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              {/* 미가입자용 회원가입 링크 */}
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

export default Login;
