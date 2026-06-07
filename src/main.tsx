/**
 * main.tsx — 애플리케이션 진입점(엔트리 포인트)
 *
 * 역할:
 *   - React 애플리케이션을 브라우저 DOM에 마운트하는 부트스트랩 파일.
 *   - Vite 빌드 설정의 진입점으로, 최상위 루트 컴포넌트(App)를 렌더링한다.
 *
 * 핵심 책임:
 *   1. 전역 스타일시트(index.css)를 로드한다.
 *   2. index.html의 #root 엘리먼트를 찾아 React 18 createRoot로 렌더 루트를 생성한다.
 *   3. <App />을 StrictMode로 감싸 렌더링한다.
 *
 * 주요 export: 없음(부수효과만 수행하는 모듈 — import 시점에 렌더링을 시작한다).
 */

// React 개발 모드 검사를 활성화하는 래퍼 컴포넌트.
import { StrictMode } from 'react'
// React 18의 동시성 렌더링 루트 생성 API.
import { createRoot } from 'react-dom/client'
// 전역 CSS. import만으로 번들에 포함되는 부수효과성 import.
import './index.css'
// 애플리케이션의 최상위 루트 컴포넌트.
import App from './App'

// #root DOM 노드에 React 루트를 생성하고 앱을 렌더링한다.
// 부수효과: 브라우저 DOM을 변경(마운트)한다. 반환값은 사용하지 않는다.
// 비고: getElementById는 null을 반환할 수 있으므로 '!'(non-null assertion)로
//       #root가 항상 존재함을 단언한다. index.html에 #root가 없으면 런타임 에러가 난다.
createRoot(document.getElementById('root')!).render(
  // StrictMode: 개발 중 잠재적 문제 감지를 위해 일부 로직을 이중 호출한다(프로덕션 빌드에는 영향 없음).
  <StrictMode>
    {/* 애플리케이션 전체를 구성하는 최상위 컴포넌트 */}
    <App />
  </StrictMode>,
)
