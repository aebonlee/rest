/**
 * Register.tsx
 * -----------------------------------------------------------------------------
 * 역할/책임:
 *   - 신규 사용자 회원가입 페이지 컴포넌트.
 *   - 표시이름/이메일/비밀번호/비밀번호 확인을 입력받아 클라이언트 측 검증 후
 *     Supabase 인증(signUp)으로 계정 생성을 요청한다.
 *   - 이미 로그인된 사용자는 홈으로 리다이렉트한다.
 *   - 가입 성공 시 이메일 인증 안내 화면을 표시한다.
 *
 * 주요 export:
 *   - default Register: 회원가입 라우트 페이지(React 컴포넌트).
 *
 * 의존성:
 *   - LanguageContext(t): 다국어 라벨/메시지 번역 함수.
 *   - AuthContext(isLoggedIn): 현재 로그인 여부.
 *   - utils/auth(signUp): Supabase 회원가입 호출 래퍼.
 *   - SEOHead: 페이지 메타 태그(여기서는 noindex로 검색엔진 색인 제외).
 * -----------------------------------------------------------------------------
 */
import { useState, type ReactElement, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { signUp } from '../utils/auth';
import SEOHead from '../components/SEOHead';
import '../styles/auth.css';

// 회원가입 페이지 컴포넌트. 로그인 상태면 null을 반환하며 리다이렉트한다.
const Register = (): ReactElement | null => {
  const { t } = useLanguage();          // 다국어 번역 함수
  const { isLoggedIn } = useAuth();     // 현재 로그인 여부(인증 컨텍스트)
  const navigate = useNavigate();       // 프로그래밍적 라우팅 이동

  // 폼 입력 상태: 하나의 객체로 4개 필드를 묶어 관리(부분 업데이트는 스프레드로 갱신)
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', displayName: '' });
  const [error, setError] = useState('');     // 검증/가입 실패 시 표시할 에러 메시지
  const [loading, setLoading] = useState(false);   // 가입 요청 진행 중 여부(중복 제출 방지/버튼 비활성)
  const [success, setSuccess] = useState(false);   // 가입 성공 시 안내 화면 전환 플래그

  // 이미 로그인한 사용자는 회원가입 페이지에 머물 필요가 없으므로 홈으로 보낸다.
  // replace: true 로 히스토리를 대체하여 뒤로가기로 다시 돌아오지 못하게 한다.
  // 렌더 단계에서 navigate 호출 후 null 반환으로 화면을 그리지 않음(엣지케이스 처리).
  if (isLoggedIn) {
    navigate('/', { replace: true });
    return null;
  }

  // 폼 제출 핸들러: 클라이언트 검증 → Supabase 회원가입(비동기) 처리.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();   // 기본 폼 제출(페이지 새로고침) 차단
    // 1차 검증: 비밀번호와 비밀번호 확인 일치 여부
    if (form.password !== form.passwordConfirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    // 2차 검증: 비밀번호 정책 정규식.
    //   (?=.*[a-zA-Z]) 영문 1자 이상, (?=.*\d) 숫자 1자 이상, .{8,} 전체 8자 이상.
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(form.password)) {
      setError('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.');
      return;
    }
    setLoading(true);   // 요청 시작: 로딩 표시
    setError('');       // 이전 에러 초기화
    try {
      // Supabase 회원가입 호출(비동기). 성공 시 보통 이메일 인증 메일이 발송된다.
      await signUp(form.email, form.password, form.displayName);
      setSuccess(true);   // 성공 안내 화면으로 전환
    } catch (err) {
      // 실패 메시지: 에러 객체의 message 우선, 없으면 번역된 기본 메시지 사용
      setError((err as Error).message || t('auth.signUpError'));
    } finally {
      setLoading(false);   // 성공/실패와 무관하게 로딩 해제
    }
  };

  // 가입 성공 화면: 이메일 인증 안내와 로그인 페이지 이동 링크를 표시.
  if (success) {
    return (
      <section className="auth-fullpage">
        <div className="auth-center-wrapper">
          <div className="auth-card-google">
            <div className="auth-success">
              {/* 성공을 나타내는 체크 아이콘(인라인 SVG) */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h2>{t('auth.signUpSuccess')}</h2>
              <p>{t('auth.checkEmail')}</p>
              {/* 이메일 인증 후 로그인할 수 있도록 로그인 페이지로 안내 */}
              <Link to="/login" className="auth-next-btn auth-btn-full">
                {t('auth.goToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 기본(입력) 화면: 회원가입 폼 렌더링.
  return (
    <>
    {/* noindex: 회원가입 페이지는 검색엔진 색인에서 제외 */}
    <SEOHead title="회원가입" path="/register" noindex />
    <section className="auth-fullpage">
      <div className="auth-center-wrapper">
        <div className="auth-card-google">
          {/* 브랜드 로고 영역(DreamIT Biz) */}
          <div className="auth-logo-area">
            <span className="brand-dream">Dream</span>
            <span className="brand-it">IT</span>{' '}
            <span className="brand-biz">Biz</span>
          </div>
          <h2 className="auth-heading">{t('auth.signUpTitle')}</h2>
          <p className="auth-sub">{t('auth.signUpSubtitle')}</p>

          {/* 회원가입 입력 폼: 제출 시 handleSubmit 실행 */}
          <form onSubmit={handleSubmit} className="auth-email-form">
            <div className="auth-input-group">
              {/* 표시이름 입력. autoFocus로 진입 시 첫 입력란에 포커스 */}
              <input
                type="text"
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                placeholder={t('auth.displayNamePlaceholder')}
                required
                autoFocus
              />
            </div>
            <div className="auth-input-group">
              {/* 이메일 입력(type=email로 브라우저 기본 형식 검증) */}
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder={t('auth.emailPlaceholder')}
                required
              />
            </div>
            <div className="auth-input-group">
              {/* 비밀번호 입력(minLength=8은 브라우저 1차 가드, 상세 검증은 handleSubmit 정규식) */}
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={t('auth.passwordPlaceholder')}
                minLength={8}
                required
              />
            </div>
            <div className="auth-input-group">
              {/* 비밀번호 확인 입력(handleSubmit에서 password와 일치 검사) */}
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={e => setForm({ ...form, passwordConfirm: e.target.value })}
                placeholder={t('auth.passwordConfirmPlaceholder')}
                required
              />
            </div>

            {/* 에러 메시지: error 상태가 있을 때만 표시(조건부 렌더) */}
            {error && <div className="auth-error">{error}</div>}

            {/* 제출 버튼: 로딩 중에는 비활성화하고 진행 중 라벨 표시 */}
            <button type="submit" className="auth-next-btn auth-btn-full" disabled={loading}>
              {loading ? t('auth.signingUp') : t('auth.signUp')}
            </button>
          </form>

          {/* 이미 계정이 있는 사용자를 위한 로그인 링크 */}
          <div className="auth-bottom-link">
            <span>{t('auth.hasAccount')}</span>
            <Link to="/login">{t('auth.login')}</Link>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Register;
