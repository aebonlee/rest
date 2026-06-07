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
 * -----------------------------------------------------------------------------
 */

import { useState, type ReactElement, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { resetPassword } from '../utils/auth';
import SEOHead from '../components/SEOHead';
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
  // email: 입력된 이메일 주소
  const [email, setEmail] = useState('');
  // loading: 재설정 메일 발송 요청 진행 중 여부(버튼 비활성/문구 전환에 사용)
  const [loading, setLoading] = useState(false);
  // sent: 발송 성공 여부(true면 폼 대신 완료 안내 화면 표시)
  const [sent, setSent] = useState(false);
  // error: 발송 실패 시 표시할 에러 메시지
  const [error, setError] = useState('');

  /**
   * handleSubmit
   * 폼 제출 핸들러. 입력된 이메일로 비밀번호 재설정 메일 발송을 요청한다.
   *
   * 매개변수: e (FormEvent) - 폼 제출 이벤트
   * 반환값: Promise<void>
   * 부수효과: loading/error/sent 상태 변경, resetPassword 비동기 호출
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 기본 폼 제출(페이지 새로고침) 방지
    if (!email) return; // 이메일이 비어 있으면 요청하지 않음(엣지케이스 방어)
    setLoading(true); // 요청 시작: 로딩 상태 on
    setError(''); // 이전 에러 메시지 초기화
    try {
      // 비밀번호 재설정 메일 발송 요청(인증 백엔드 호출)
      await resetPassword(email);
      setSent(true); // 성공 시 완료 안내 화면으로 전환
    } catch (err) {
      // 실패 시 에러 메시지 표시(메시지 없으면 기본 영문 문구 사용)
      setError((err as Error).message || 'Failed to send reset email');
    } finally {
      setLoading(false); // 성공/실패와 무관하게 로딩 상태 off
    }
  };

  return (
    <>
    {/* SEO: 검색엔진 색인 제외(noindex) - 인증 관련 페이지이므로 비공개 처리 */}
    <SEOHead title="비밀번호 찾기" path="/forgot-password" noindex />
    <section className="auth-fullpage">
      <div className="auth-center-wrapper">
        <div className="auth-card-google">
          {/* 브랜드 로고 영역(DreamIT Biz) */}
          <div className="auth-logo-area">
            <span className="brand-dream">Dream</span>
            <span className="brand-it">IT</span>{' '}
            <span className="brand-biz">Biz</span>
          </div>
          {/* 페이지 제목/부제(다국어) */}
          <h2 className="auth-heading">{t('auth.forgotPasswordTitle')}</h2>
          <p className="auth-sub">{t('auth.forgotPasswordSubtitle')}</p>

          {/* sent 상태에 따라 완료 안내 화면 또는 입력 폼을 분기 렌더링 */}
          {sent ? (
            // 발송 완료 안내 화면
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {/* 성공 체크 아이콘 원형 배경 */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                {/* 체크마크 SVG(초록색) */}
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {/* 발송 완료 메시지 */}
              <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {t('auth.resetEmailSent')}
              </p>
              {/* 이메일 확인 안내 메시지 */}
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {t('auth.checkEmailForReset')}
              </p>
              {/* 로그인 페이지로 돌아가기 링크 */}
              <Link to="/login" className="auth-next-btn" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            // 비밀번호 재설정 요청 입력 폼
            <form onSubmit={handleSubmit} className="auth-email-form">
              <div className="auth-input-group">
                {/* 이메일 입력 필드(controlled input). required+autoFocus 적용 */}
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
              {error && <div className="auth-error">{error}</div>}

              <div className="auth-form-actions">
                {/* 로그인으로 돌아가기 링크 */}
                <Link to="/login" className="auth-back-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                  {t('auth.backToLogin')}
                </Link>
                {/* 제출 버튼: 로딩 중에는 비활성화하고 '전송 중' 문구로 전환 */}
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

export default ForgotPassword;
