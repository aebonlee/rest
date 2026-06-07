/**
 * App.tsx
 *
 * 역할:
 *   - 애플리케이션의 최상위 루트 컴포넌트로, 전역 Context Provider들과 라우터를 조립한다.
 *
 * 핵심 책임:
 *   - 전역 상태/설정 Provider를 올바른 중첩 순서로 감싼다.
 *     (ThemeProvider → LanguageProvider → AuthProvider → ToastProvider)
 *     바깥쪽 Provider가 안쪽보다 먼저 초기화되며, 안쪽 Provider/컴포넌트는
 *     바깥쪽 Context 값에 접근할 수 있다.
 *   - BrowserRouter(Router)로 클라이언트 사이드 라우팅을 활성화한다.
 *   - 모든 경로("*")를 PublicLayout으로 위임하여 실제 페이지 라우팅은
 *     레이아웃 내부에서 처리하도록 한다.
 *
 * 주요 export:
 *   - default: App 컴포넌트
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import PublicLayout from './layouts/PublicLayout';
import type { ReactElement } from 'react';

/**
 * App
 *
 * 무엇을 하는지:
 *   전역 Provider와 라우터를 조립해 앱의 전체 컴포넌트 트리를 구성한다.
 *
 * 매개변수: 없음
 *
 * 반환값:
 *   ReactElement — Provider/라우터로 감싼 최상위 엘리먼트 트리
 *
 * 부수효과:
 *   없음(순수 렌더링). 단, 내부 Provider들이 각자 초기화 부수효과를 가질 수 있다.
 */
function App(): ReactElement {
  return (
    // 테마(다크/라이트 등) 전역 설정 — 가장 바깥에서 모든 하위에 적용
    <ThemeProvider>
      {/* 다국어(언어 선택) 전역 설정 */}
      <LanguageProvider>
        {/* 인증 상태/세션 전역 관리 (Supabase 인증 및 RLS 기반 접근 제어의 기준) */}
        <AuthProvider>
          {/* 토스트 알림 전역 제공 — 인증 컨텍스트 내부에 두어 알림에서 인증 정보 활용 가능 */}
          <ToastProvider>
            {/* 클라이언트 사이드 라우팅 활성화 */}
            <Router>
              <div className="App">
                <Routes>
                  {/* 모든 경로를 PublicLayout으로 위임 — 세부 라우팅은 레이아웃 내부에서 처리 */}
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

export default App;
