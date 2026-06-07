/**
 * App.tsx
 *
 * ┌─ 이 파일이 뭐예요? (초보자용 한눈에 보기) ─────────────────────────────┐
 * │ 이 파일은 우리 웹 애플리케이션(React 앱)의 "가장 바깥쪽 껍데기"입니다.   │
 * │ 비유하자면 집을 지을 때 가장 먼저 세우는 '뼈대'와 같아요.               │
 * │ 화면에 보이는 구체적인 페이지(예: 로그인, 대시보드)는 여기 없지만,      │
 * │ 그 페이지들이 공통으로 사용할 "전역 환경"을 여기서 한 번에 깔아 줍니다.  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 미리 알아두면 좋은 용어 (처음 보면 헷갈리는 단어들):
 *   - 컴포넌트(Component): 화면을 구성하는 재사용 가능한 부품. 함수로 만들며,
 *     화면에 그릴 내용(JSX)을 반환한다. App도 하나의 컴포넌트다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 문법을 쓰는 것. <div>...</div> 같은 것.
 *   - Context(컨텍스트): "전역 변수 상자". 멀리 떨어진 컴포넌트끼리도
 *     props를 일일이 넘기지 않고 값을 공유할 수 있게 해 주는 React 기능.
 *   - Provider(프로바이더): 그 Context 값을 "공급"해 주는 컴포넌트.
 *     Provider로 감싼 영역 안에서만 그 값을 꺼내 쓸 수 있다.
 *   - 라우팅(Routing): 주소(URL)에 따라 어떤 화면을 보여줄지 정하는 일.
 *
 * 역할:
 *   - 애플리케이션의 최상위 루트 컴포넌트로, 전역 Context Provider들과 라우터를 조립한다.
 *     ("조립한다"는 말은, 직접 화면을 그리기보다 여러 도구를 겹겹이 감싸 준비한다는 뜻.)
 *
 * 핵심 책임:
 *   - 전역 상태/설정 Provider를 올바른 중첩 순서로 감싼다.
 *     (ThemeProvider → LanguageProvider → AuthProvider → ToastProvider)
 *     바깥쪽 Provider가 안쪽보다 먼저 초기화되며, 안쪽 Provider/컴포넌트는
 *     바깥쪽 Context 값에 접근할 수 있다.
 *     ※ 왜 순서가 중요한가? 안쪽 도구가 바깥쪽 도구의 값을 "꺼내 쓰기" 때문이다.
 *       예를 들어 ToastProvider(알림)가 AuthProvider(로그인 정보)를 쓰려면
 *       반드시 AuthProvider '안쪽'에 있어야 한다. 순서를 바꾸면 값이 안 보여 오류가 난다.
 *   - BrowserRouter(Router)로 클라이언트 사이드 라우팅을 활성화한다.
 *     (= 페이지를 새로 불러오지(새로고침) 않고, 브라우저 안에서 화면만 바꿔치기하는 방식.)
 *   - 모든 경로("*")를 PublicLayout으로 위임하여 실제 페이지 라우팅은
 *     레이아웃 내부에서 처리하도록 한다.
 *     ("위임한다" = 세부 결정을 다른 컴포넌트에게 맡긴다는 뜻.)
 *
 * 주요 export:
 *   - default: App 컴포넌트 (다른 파일에서 이 App을 가져다 화면에 띄운다. 보통 main.tsx에서.)
 */

// ── import: 다른 파일에 정의된 기능들을 이 파일로 "가져오기" ──────────────
// react-router-dom: 페이지 이동(라우팅)을 도와주는 외부 라이브러리.
//   - BrowserRouter를 Router라는 짧은 별칭(as Router)으로 이름을 바꿔 가져온다.
//   - Routes: 여러 Route(경로 규칙)를 담는 컨테이너.
//   - Route: "이 주소면 이 화면을 보여줘"라는 규칙 하나.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 아래 4개는 우리가 직접 만든 전역 설정 Provider들이다. (./contexts 폴더에 있음)
import { ThemeProvider } from './contexts/ThemeContext';      // 테마(다크/라이트 모드 등)
import { LanguageProvider } from './contexts/LanguageContext'; // 다국어(언어 선택)
import { AuthProvider } from './contexts/AuthContext';         // 로그인/인증 상태
import { ToastProvider } from './contexts/ToastContext';       // 토스트(잠깐 떴다 사라지는 알림)
// PublicLayout: 실제 페이지들의 공통 틀(헤더/푸터 등)과 세부 라우팅을 담당하는 컴포넌트.
import PublicLayout from './layouts/PublicLayout';
// ReactElement: "React가 화면에 그릴 결과물"을 가리키는 TypeScript 타입(자료형) 이름.
//   - 'import type'은 "타입 정보만" 가져온다는 뜻. 실제 실행 코드에는 포함되지 않아 가볍다.
//   - TypeScript: 자바스크립트에 '타입(자료형) 검사'를 더한 언어. 실수를 미리 잡아 준다.
import type { ReactElement } from 'react';

/**
 * App
 *
 * 무엇을 하는지:
 *   전역 Provider와 라우터를 조립해 앱의 전체 컴포넌트 트리를 구성한다.
 *   (트리 = 컴포넌트들이 부모-자식으로 겹겹이 쌓인 구조. 나무 가지처럼 뻗어 나간다.)
 *
 * 왜 이렇게 하는지:
 *   페이지마다 테마/언어/로그인/알림 기능을 따로따로 설정하면 중복되고 실수가 잦다.
 *   그래서 "가장 바깥에서 한 번만" 감싸 두면, 그 안의 모든 페이지가 자동으로
 *   같은 설정을 공유할 수 있다. (DRY: 같은 코드를 반복하지 말자는 원칙.)
 *
 * 매개변수: 없음
 *   (App은 부모로부터 받는 props가 없다. 최상위라서 위에서 넘겨줄 부모가 없기 때문.)
 *
 * 반환값:
 *   ReactElement — Provider/라우터로 감싼 최상위 엘리먼트 트리
 *   (함수가 'return'으로 돌려주는 JSX가 곧 화면에 그려질 내용이다.)
 *
 * 부수효과:
 *   없음(순수 렌더링). 단, 내부 Provider들이 각자 초기화 부수효과를 가질 수 있다.
 *   (부수효과 = 화면 그리기 외에 추가로 벌어지는 일. 예: 서버에서 로그인 정보 불러오기.)
 */
function App(): ReactElement {
  // return 뒤에 오는 (...) 안의 JSX가 바로 "화면 구조"다.
  // 아래는 Provider들을 인형 안에 인형을 넣듯(러시아 마트료시카처럼) 겹겹이 중첩한다.
  return (
    // 테마(다크/라이트 등) 전역 설정 — 가장 바깥에서 모든 하위에 적용
    // 주의: 가장 바깥에 둔 이유는, 테마가 앱 전체 색상에 영향을 주므로 가장 먼저 깔려야 하기 때문.
    <ThemeProvider>
      {/* 참고: JSX 안에서 주석을 쓸 땐 중괄호로 감싼 블록 주석 형태를 사용한다. */}
      {/* 다국어(언어 선택) 전역 설정 */}
      <LanguageProvider>
        {/* 인증 상태/세션 전역 관리 (Supabase 인증 및 RLS 기반 접근 제어의 기준) */}
        {/* 용어: Supabase = 백엔드(서버/DB) 서비스. RLS(Row Level Security)는 DB가
            "이 사용자가 이 데이터를 볼 권한이 있나?"를 줄(row) 단위로 검사하는 보안 기능.
            즉, 로그인한 사람이 누구냐에 따라 보이는 데이터가 달라진다. AuthProvider가 그 기준점. */}
        <AuthProvider>
          {/* 토스트 알림 전역 제공 — 인증 컨텍스트 내부에 두어 알림에서 인증 정보 활용 가능 */}
          {/* 주의: ToastProvider가 AuthProvider '안쪽'에 있어야 알림 코드에서 로그인 정보를 읽을 수 있다.
              만약 둘의 위치를 바꾸면(토스트를 바깥에 두면) 인증 값을 못 찾아 에러가 날 수 있다. */}
          <ToastProvider>
            {/* 클라이언트 사이드 라우팅 활성화 */}
            {/* Router로 감싼 영역 안에서만 주소(URL)에 따른 화면 전환이 동작한다. */}
            <Router>
              {/* 화면 전체를 감싸는 컨테이너 div. className="App"은 CSS 스타일을 붙이기 위한 이름표. */}
              <div className="App">
                {/* Routes: 아래 Route 규칙들 중 현재 주소와 맞는 '하나'를 골라 보여 준다. */}
                <Routes>
                  {/* 모든 경로를 PublicLayout으로 위임 — 세부 라우팅은 레이아웃 내부에서 처리 */}
                  {/* path="*" 의 별(*)은 "어떤 주소든 전부 일치"라는 와일드카드 의미.
                      즉 사용자가 어떤 URL로 들어오든 일단 PublicLayout을 띄우고,
                      그 안에서 "그래서 정확히 어떤 페이지를 보일지"를 다시 정한다.
                      element={...} 에는 그 주소일 때 그릴 컴포넌트를 넣는다. */}
                  <Route path="*" element={<PublicLayout />} />
                </Routes>
              </div>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// 이 파일의 '대표(default) 내보내기'로 App을 지정한다.
// 다른 파일(보통 main.tsx)에서  import App from './App'  처럼 이름 없이 가져다 쓸 수 있다.
export default App;
