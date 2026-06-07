/**
 * Register.tsx
 * -----------------------------------------------------------------------------
 * 이 파일은 무엇인가요? (초보자용 한 줄 요약)
 *   - "회원가입(Sign Up) 화면" 하나를 그리는 React 컴포넌트입니다.
 *   - 사용자가 이름/이메일/비밀번호를 입력하면, 간단한 검사를 한 뒤
 *     서버(Supabase)에 "이 사람으로 계정을 만들어 주세요" 라고 요청합니다.
 *
 * 꼭 알아둘 배경 용어 (처음 보는 단어 정리):
 *   - 컴포넌트(Component): 화면의 한 조각을 만들어 내는 함수.
 *     이 함수가 "JSX(HTML처럼 생긴 코드)"를 반환하면 그게 화면에 그려집니다.
 *   - 상태(State): 컴포넌트가 기억하는 값. 값이 바뀌면 화면이 자동으로 다시 그려집니다.
 *     (예: 입력한 이메일, 에러 메시지, 로딩 중인지 여부)
 *   - 훅(Hook): 이름이 use~ 로 시작하는 특수 함수. 상태나 기능을 컴포넌트에 "연결"해 줍니다.
 *     (예: useState = 상태 만들기, useNavigate = 페이지 이동 기능 가져오기)
 *   - Supabase: 백엔드(서버/DB/인증)를 대신 처리해 주는 서비스. 여기선 "인증(로그인/가입)"에 사용.
 *   - 비동기(async/await): 서버 응답처럼 "시간이 걸리는 작업"을 기다렸다가 다음 줄로 넘어가는 방식.
 *   - RLS / 인증 흐름: 회원가입 후 보통 "이메일 인증 메일"을 받고, 그 메일의 링크를 눌러야
 *     계정이 활성화됩니다. 그래서 가입 성공 화면에서 "메일을 확인하세요" 라고 안내합니다.
 *
 * 역할/책임:
 *   - 표시이름/이메일/비밀번호/비밀번호 확인을 입력받아 클라이언트 측 검증 후
 *     Supabase 인증(signUp)으로 계정 생성을 요청한다.
 *   - 이미 로그인된 사용자는 홈으로 리다이렉트한다.
 *   - 가입 성공 시 이메일 인증 안내 화면을 표시한다.
 *
 * 주요 export:
 *   - default Register: 회원가입 라우트 페이지(React 컴포넌트).
 *
 * 의존성(이 파일이 빌려 쓰는 다른 코드들):
 *   - LanguageContext(t): 다국어 라벨/메시지 번역 함수. t('키')를 넣으면 현재 언어의 문구가 나온다.
 *   - AuthContext(isLoggedIn): 현재 로그인 여부.
 *   - utils/auth(signUp): Supabase 회원가입 호출 래퍼(복잡한 호출을 함수 하나로 감싼 것).
 *   - SEOHead: 페이지 메타 태그(여기서는 noindex로 검색엔진 색인 제외).
 * -----------------------------------------------------------------------------
 */

// ───────────── import: 이 파일에서 사용할 도구들을 다른 파일에서 가져오기 ─────────────
// useState: 상태를 만드는 훅.
// type ReactElement / type FormEvent: "타입"만 가져오는 import(TypeScript용 표시).
//   - 'type' 키워드가 붙으면 "실제 코드가 아니라 타입 정보일 뿐"이라는 뜻 → 빌드 결과물에서 제거됨.
//   - ReactElement: 컴포넌트가 반환하는 "화면 한 조각"의 타입.
//   - FormEvent: 폼(form)에서 일어나는 이벤트(예: 제출)의 타입.
import { useState, type ReactElement, type FormEvent } from 'react';
// Link: 페이지 새로고침 없이 이동하는 링크(<a> 대신 사용). useNavigate: 코드로 직접 이동시키는 훅.
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { signUp } from '../utils/auth';
import SEOHead from '../components/SEOHead';
import '../styles/auth.css';   // CSS 파일 import: 이 페이지에 적용할 스타일을 불러온다(반환값은 없음).

// 회원가입 페이지 컴포넌트.
// 반환 타입 ReactElement | null: "화면 조각"을 그리거나(ReactElement),
//   아무것도 그리지 않거나(null) 둘 중 하나라는 뜻. (로그인 상태면 null을 반환함)
const Register = (): ReactElement | null => {
  // ── 훅 호출: 필요한 기능들을 컴포넌트에 연결한다 ──
  // 주의: 훅(use~)은 항상 컴포넌트 "맨 위"에서, if/for 안이 아닌 곳에서 호출해야 한다(React 규칙).
  const { t } = useLanguage();          // 다국어 번역 함수. t('auth.login') 처럼 키를 주면 문구 반환.
  const { isLoggedIn } = useAuth();     // 현재 로그인 여부(true/false). 인증 컨텍스트에서 가져옴.
  const navigate = useNavigate();       // navigate('/경로') 형태로 코드에서 페이지를 이동시키는 함수.

  // ── 상태(State) 선언 ──
  // useState(초기값)은 [현재값, 값을바꾸는함수] 형태의 배열을 돌려준다(이를 "구조 분해"로 받음).
  // setForm 같은 setter를 호출해야만 화면이 다시 그려진다(변수에 직접 대입하면 안 됨).

  // 폼 입력 상태: 4개의 입력칸을 객체 하나로 묶어 관리한다.
  // 주의(불변성): 한 칸만 바꿀 때도 기존 객체를 직접 수정하지 말고,
  //   { ...form, 바꿀칸: 새값 } 처럼 "복사본을 새로 만들어" 교체해야 React가 변경을 알아챈다.
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', displayName: '' });
  const [error, setError] = useState('');     // 검증/가입 실패 시 사용자에게 보여줄 에러 메시지(빈 문자열이면 에러 없음).
  const [loading, setLoading] = useState(false);   // 가입 요청 진행 중 여부. true면 버튼을 비활성화해 중복 제출을 막는다.
  const [success, setSuccess] = useState(false);   // 가입 성공 여부. true가 되면 "안내 화면"으로 전환된다.

  // 이미 로그인한 사용자는 회원가입 페이지에 머물 필요가 없으므로 홈('/')으로 보낸다.
  // replace: true → 브라우저 방문 기록을 "대체"한다. 즉 회원가입 페이지를 기록에 남기지 않아
  //   사용자가 '뒤로가기'를 눌러도 다시 이 페이지로 돌아오지 않는다.
  // 그리고 return null 로 이 페이지의 화면은 그리지 않는다(이동만 시키고 끝).
  // 주의: 렌더 도중 navigate를 호출하는 것은 "리다이렉트" 용도의 흔한 패턴이지만,
  //   이 if 문은 위의 훅들이 모두 호출된 뒤에 와야 한다(훅보다 먼저 return하면 규칙 위반).
  if (isLoggedIn) {
    navigate('/', { replace: true });
    return null;
  }

  // 폼 제출 핸들러: 사용자가 "가입" 버튼을 누르면 실행된다.
  // async: 이 함수 안에서 await(기다리기)를 쓸 수 있게 해준다(서버 응답을 기다려야 하므로).
  // 매개변수 e: 제출 이벤트 정보. 반환값은 없음(상태만 바꾸는 부수효과를 일으킨다).
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();   // 폼의 기본 동작(=페이지 새로고침)을 막는다. 이게 없으면 화면이 깜빡이며 리로드됨.

    // 1차 검증: 비밀번호와 "비밀번호 확인"이 같은지 본다. 다르면 메시지 띄우고 return(함수 종료).
    if (form.password !== form.passwordConfirm) {
      setError(t('auth.passwordMismatch'));
      return;   // 여기서 멈춰서 아래 서버 요청까지 가지 않도록 한다.
    }

    // 2차 검증: 비밀번호 정책을 정규식(글자 패턴 검사 규칙)으로 확인한다.
    //   /^...$/        : ^ 처음부터 $ 끝까지 전체가 규칙에 맞는지 검사.
    //   (?=.*[a-zA-Z]) : (앞을 내다보는 검사) 어딘가에 영문 알파벳이 최소 1자 있어야 함.
    //   (?=.*\d)       : 어딘가에 숫자(\d)가 최소 1자 있어야 함.
    //   .{8,}          : 아무 문자나 8자 이상.
    //   .test(값)      : 값이 규칙에 맞으면 true, 아니면 false 반환.
    //   앞의 ! 는 "반대로". 즉 "규칙에 맞지 않으면" 에러 처리한다는 뜻.
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(form.password)) {
      setError('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.');
      return;
    }

    setLoading(true);   // 요청 시작: 로딩 상태 켜기(버튼 비활성화 + "가입 중..." 표시에 사용).
    setError('');       // 이전에 떠 있던 에러 메시지를 비운다(새 시도이므로 깨끗이).
    try {
      // Supabase 회원가입 호출(시간이 걸리는 비동기 작업이라 await로 결과를 기다린다).
      // 성공하면 보통 입력한 이메일로 "인증 메일"이 발송된다.
      // await 다음 줄(setSuccess)은 가입이 끝난 뒤에야 실행된다.
      await signUp(form.email, form.password, form.displayName);
      setSuccess(true);   // 성공 → 아래의 "성공 안내 화면"으로 전환되도록 플래그를 켠다.
    } catch (err) {
      // 가입 중 문제가 생기면(이미 가입된 이메일 등) 이 블록으로 온다.
      // (err as Error).message: err를 Error 타입으로 보고 그 안의 message를 꺼낸다.
      //   || 뒤는 "앞이 없을 때의 대체값". message가 비어 있으면 번역된 기본 메시지를 쓴다.
      setError((err as Error).message || t('auth.signUpError'));
    } finally {
      // finally: 성공이든 실패든 "항상" 마지막에 실행된다. 로딩 상태를 반드시 끈다.
      // 이렇게 해야 어떤 경우에도 버튼이 영원히 비활성화된 채 멈추지 않는다.
      setLoading(false);
    }
  };

  // ── 화면 분기 1: 가입 성공 화면 ──
  // success가 true면 입력 폼 대신 "메일을 확인하세요" 안내를 보여준다.
  // (이 if 보다 위에 있는 훅들은 이미 모두 호출되었으므로 여기서 early return 해도 안전하다.)
  if (success) {
    return (
      <section className="auth-fullpage">
        <div className="auth-center-wrapper">
          <div className="auth-card-google">
            <div className="auth-success">
              {/* 성공을 나타내는 체크 아이콘(인라인 SVG = 코드로 직접 그린 그림) */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {/* {t('...')}: 중괄호 안은 "자바스크립트 값"을 화면에 끼워 넣는 자리. 번역된 문구가 들어간다. */}
              <h2>{t('auth.signUpSuccess')}</h2>
              <p>{t('auth.checkEmail')}</p>
              {/* 이메일 인증을 마친 뒤 로그인할 수 있도록 로그인 페이지로 안내하는 링크 */}
              <Link to="/login" className="auth-next-btn auth-btn-full">
                {t('auth.goToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── 화면 분기 2: 기본(입력) 화면 ──
  // 위의 두 if(로그인됨/가입성공)에 해당하지 않을 때 회원가입 폼을 그린다.
  return (
    // <> ... </>: "프래그먼트". 여러 요소를 불필요한 div 없이 하나로 묶기 위한 빈 태그.
    //   (컴포넌트는 반드시 "하나의" 최상위 요소만 반환할 수 있어서 이렇게 묶는다.)
    <>
    {/* noindex: 회원가입 페이지는 검색엔진 검색 결과에 나오지 않도록 색인에서 제외한다. */}
    <SEOHead title="회원가입" path="/register" noindex />
    <section className="auth-fullpage">
      <div className="auth-center-wrapper">
        <div className="auth-card-google">
          {/* 브랜드 로고 영역(DreamIT Biz). 글자 색만 다른 span 3개로 구성. */}
          <div className="auth-logo-area">
            <span className="brand-dream">Dream</span>
            {/* {' '}: JSX에서 "의도적인 공백 한 칸". 줄바꿈만으로는 공백이 사라지므로 직접 넣는다. */}
            <span className="brand-it">IT</span>{' '}
            <span className="brand-biz">Biz</span>
          </div>
          <h2 className="auth-heading">{t('auth.signUpTitle')}</h2>
          <p className="auth-sub">{t('auth.signUpSubtitle')}</p>

          {/* 회원가입 입력 폼. onSubmit={handleSubmit}: 폼이 제출될 때 위의 handleSubmit 실행. */}
          <form onSubmit={handleSubmit} className="auth-email-form">
            <div className="auth-input-group">
              {/* 표시이름 입력칸.
                  - value={form.displayName}: 입력값을 "상태"가 통제한다(제어 컴포넌트).
                  - onChange: 글자를 칠 때마다 호출되어 상태를 갱신한다.
                    e.target.value = 사용자가 방금 입력칸에 적은 현재 글자.
                    {...form, displayName: 새값} → 나머지는 그대로 두고 이름만 바꾼 새 객체로 교체.
                  - required: 비우고 제출하면 브라우저가 막아준다.
                  - autoFocus: 페이지가 뜨자마자 이 칸에 커서를 둔다(첫 입력 편의). */}
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
              {/* 이메일 입력칸. type="email"이면 브라우저가 "@ 포함 형식" 같은 기본 검사를 해준다. */}
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder={t('auth.emailPlaceholder')}
                required
              />
            </div>
            <div className="auth-input-group">
              {/* 비밀번호 입력칸. type="password"면 입력 글자가 점(●)으로 가려진다.
                  minLength={8}은 브라우저의 1차 가드일 뿐, 영문+숫자 같은 상세 규칙은
                  위 handleSubmit의 정규식에서 최종 검사한다(클라이언트 검증은 보조 수단임에 유의). */}
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
              {/* 비밀번호 "확인" 입력칸. handleSubmit에서 위 password와 같은지 비교한다. */}
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={e => setForm({ ...form, passwordConfirm: e.target.value })}
                placeholder={t('auth.passwordConfirmPlaceholder')}
                required
              />
            </div>

            {/* 조건부 렌더: error가 빈 문자열이 아닐 때(=내용이 있을 때)만 에러 박스를 보여준다.
                {조건 && <요소>} 패턴: 조건이 참이면 뒤의 요소를, 거짓이면 아무것도 안 그린다. */}
            {error && <div className="auth-error">{error}</div>}

            {/* 제출 버튼.
                disabled={loading}: 가입 요청 중이면 버튼을 눌러도 동작하지 않게 잠근다(중복 제출 방지).
                {loading ? A : B}: 삼항 연산자. 로딩 중이면 "가입 중..." 문구, 아니면 "가입" 문구. */}
            <button type="submit" className="auth-next-btn auth-btn-full" disabled={loading}>
              {loading ? t('auth.signingUp') : t('auth.signUp')}
            </button>
          </form>

          {/* 이미 계정이 있는 사용자를 위한 로그인 페이지 링크 */}
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

// 이 컴포넌트를 다른 파일(주로 라우터 설정)에서 가져다 쓸 수 있도록 "기본 내보내기"한다.
export default Register;
