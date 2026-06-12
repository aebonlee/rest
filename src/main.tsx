/**
 * main.tsx — 애플리케이션 진입점(엔트리 포인트)
 *
 * [이 파일이 뭐예요?]
 *   웹 브라우저가 우리 사이트를 열 때 "가장 먼저 실행되는 코드"가 들어 있는 파일입니다.
 *   비유하자면 건물의 "정문"이자 "전원 스위치"예요. 여기서 React 앱에 전원을 넣어
 *   화면에 그림을 그리기 시작합니다.
 *
 * [왜 필요해요?]
 *   브라우저는 그냥 HTML 파일(index.html)만 열 줄 압니다. 그런데 그 HTML 안에는
 *   거의 아무것도 없고(텅 빈 <div id="root"></div> 하나뿐), 진짜 화면은 JavaScript가
 *   그려넣습니다. 그 "그려넣는 작업"을 시작시키는 게 바로 이 파일입니다.
 *
 * [꼭 알아야 할 용어 — 쉬운 말로]
 *   - DOM: 브라우저가 화면에 보여주는 HTML 요소들을 코드로 다룰 수 있게 만든 "객체 트리".
 *          쉽게 말해 "지금 화면에 떠 있는 HTML을 코드로 만지는 통로"예요.
 *   - 마운트(mount): React가 만든 화면을 실제 브라우저 DOM에 "붙이는" 것.
 *   - 컴포넌트(component): 화면의 한 조각(버튼, 카드, 페이지 등)을 만드는 함수.
 *                          여기서 <App />이 모든 조각을 품은 "최상위 조각"입니다.
 *   - Vite: 우리 코드를 모아 브라우저가 이해할 형태로 묶어주는 빌드 도구.
 *           Vite는 이 main.tsx를 "출발점"으로 삼아 연결된 모든 파일을 따라갑니다.
 *
 * [이 파일이 하는 일 — 순서대로]
 *   1. 전역 스타일시트(index.css)를 불러온다(앱 전체에 적용되는 기본 디자인).
 *   2. index.html 안의 #root 요소를 찾아 React가 그릴 "도화지(루트)"를 만든다.
 *   3. <App />(앱 전체)을 StrictMode로 감싸 그 도화지에 그린다.
 *
 * [수출(export) 하는 게 있나요?]
 *   없습니다. 이 파일은 "import 되는 순간 그냥 실행되어 화면을 그리는" 역할만 합니다.
 *   (이런 걸 "부수효과(side effect)만 있는 모듈"이라고 불러요. 값을 돌려주지 않고
 *    실행 자체가 목적인 코드라는 뜻입니다.)
 */

// [import 란?] 다른 파일에 있는 기능을 이 파일로 "가져오는" 문법입니다.

// StrictMode: 개발 중 실수를 잡아주는 React의 "안전 모드" 래퍼 컴포넌트.
//   - 화면에 보이는 무언가를 추가하지는 않고, 개발 중에만 검사를 도와줍니다.
import { StrictMode } from 'react'
// createRoot: React 18부터 쓰는 "렌더링 시작" 함수.
//   - 화면을 그릴 도화지(루트)를 만들어 주는 도구라고 생각하세요.
//   - 'react-dom/client'에서 가져옵니다(브라우저 화면 담당 패키지).
import { createRoot } from 'react-dom/client'
// 전역 CSS 파일. 값을 가져오는 게 아니라 "이 스타일을 앱에 포함시켜라"라는 명령입니다.
//   - from 없이 경로만 import 하면, 그 파일의 효과(여기선 스타일 적용)만 발생합니다.
import './index.css'
// Font Awesome 코어 CSS를 직접 포함하고 자동 주입을 끈다.
//   - 이렇게 해야 아이콘이 "거대하게 깜빡였다 작아지는" FOUC 현상을 방지한다(권장 패턴).
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
// App: 우리 애플리케이션의 "최상위 컴포넌트". 모든 화면/페이지가 이 안에 들어 있습니다.
//   - 중괄호 { } 없이 가져오는 건 "default export"(파일이 대표로 내보낸 하나)이기 때문.
import App from './App'

// 여기서부터 "실제로 앱을 화면에 띄우는" 단 한 줄(여러 줄로 줄바꿈됨)의 핵심 코드입니다.
//
// 한 줄씩 풀어서 읽으면:
//   ① document.getElementById('root')
//        → 브라우저에 떠 있는 HTML에서 id가 "root"인 요소를 찾습니다(= index.html의 <div id="root">).
//   ② document.getElementById('root')!
//        → 끝의 '!' 는 TypeScript의 "non-null assertion(널 아님 단언)".
//          getElementById는 못 찾으면 null을 줄 수 있는데, "여기엔 분명히 있으니 null 아님"이라고
//          TypeScript에게 약속하는 표시입니다(타입 검사용일 뿐, 실행 동작을 바꾸진 않음).
//        ※ 주의: 만약 index.html에 id="root"가 정말 없다면, ! 로 우겨도 실행 중에 에러가 납니다.
//                "Cannot read properties of null" 같은 오류를 보면 #root가 있는지 먼저 확인하세요.
//   ③ createRoot(...)
//        → 찾은 #root를 도화지로 삼아 React 렌더 루트를 만듭니다.
//   ④ .render(...)
//        → 그 도화지에 무엇을 그릴지 전달합니다. 여기서는 <StrictMode>로 감싼 <App />.
//
// 부수효과: 이 호출 한 번으로 실제 브라우저 DOM이 바뀌며 화면이 나타납니다.
//          반환값(루트 객체)은 여기서 따로 변수에 담아 쓰지 않습니다.
createRoot(document.getElementById('root')!).render(
  // StrictMode: 개발 모드에서 잠재적 버그를 찾기 위해 일부 함수를 "일부러 두 번" 호출합니다.
  //   - 그래서 콘솔 로그가 두 번 찍히는 걸 볼 수 있는데, 이는 버그가 아니라 의도된 동작입니다.
  //   - 실제 배포(프로덕션) 빌드에서는 이 이중 호출이 일어나지 않으니 걱정하지 마세요.
  //   ※ 개념: <StrictMode> ... </StrictMode> 처럼 다른 컴포넌트를 감싸는 것을 JSX라고 하며,
  //           JSX는 "JavaScript 안에 HTML처럼 생긴 문법을 쓰는 것"입니다.
  <StrictMode>
    {/* JSX 안에서 주석은 이렇게 중괄호+슬래시스타 형태로 씁니다. */}
    {/* <App /> : 우리 앱 전체. 이 한 줄이 모든 페이지와 컴포넌트를 불러오는 출발점입니다. */}
    <App />
  </StrictMode>,
)
