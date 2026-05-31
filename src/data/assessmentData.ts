/**
 * 학습평가 데이터 — 정규과정(13일, 52H) 기준
 *
 *  - 선수평가(prerequisite) : 채점형 20문항 · 문항당 5점(100점) · 합격 40점
 *  - 진단평가(diagnostic)   : 자습용 50문항 · 채점 없음 · 정답·해설 상시 공개
 *  - 사후평가(summative)    : 채점형 20문항 · 문항당 5점(100점) · 합격 60점
 *
 * 채점형 평가는 50문항 풀(pool)에서 대표 20문항을 선별해 1~20번으로 재번호합니다.
 * 모든 문항은 객관식 4지선다 + 해설 포함.
 */

export type AssessmentType = 'prerequisite' | 'diagnostic' | 'summative';

/** graded: 제출·채점·성적 저장 / practice: 정답·해설 상시 공개 자습 모드 */
export type AssessmentMode = 'graded' | 'practice';

export interface MCQuestion {
  no: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface AssessmentSet {
  type: AssessmentType;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  /** 100점 만점 환산 기준 합격 점수 (practice 모드는 0) */
  passingScore: number;
  mode: AssessmentMode;
  mcq: MCQuestion[];
}

/** 50문항 풀에서 지정한 원본 no 순서대로 골라 1~N으로 재번호 */
const pick = (pool: MCQuestion[], nos: number[]): MCQuestion[] =>
  nos.map((n, i) => {
    const q = pool.find((x) => x.no === n);
    if (!q) throw new Error(`assessment pick: 원본 ${n}번 문항을 찾을 수 없습니다`);
    return { ...q, no: i + 1 };
  });

/** 사전평가 선별 20문항 — Day 1~4 대표(바이브코딩·HTML·CSS·JS·React·Git·LLM 기초) */
const PREREQUISITE_SELECTION = [1, 2, 3, 4, 5, 6, 7, 10, 11, 16, 17, 18, 24, 25, 29, 31, 34, 39, 45, 49];

/** 사후평가 선별 20문항 — Day 1~13 종합(에이전트·Supabase·LLM·DevTools·배포·경진대회) */
const SUMMATIVE_SELECTION = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 19, 24, 26, 30, 41, 44, 50];

/* ════════════════════════════════════════════════════════════
 *  선수학습평가 (50문항) — 정규과정 Day 1~4 대비
 * ════════════════════════════════════════════════════════════ */
const prerequisitePool: MCQuestion[] = [
    {
      no: 1,
      question: '바이브코딩(Vibe Coding)의 핵심 개념으로 가장 적절한 것은?',
      options: [
        '컴파일러 최적화 기법',
        '자연어 대화로 AI와 함께 소프트웨어를 개발하는 방식',
        '디자인 시스템 운영 방법론',
        '서버리스 아키텍처 패턴',
      ],
      answer: 1,
      explanation: '바이브코딩은 자연어 대화를 1차 인터페이스로 두고 AI와 함께 소프트웨어를 만드는 방식입니다. Andrej Karpathy의 트윗에서 처음 대중화된 용어로, 인간은 "무엇을(What)" 표현하고 AI가 "어떻게(How)"의 코드를 제안합니다.',
    },
    {
      no: 2,
      question: '다음 중 AI 코딩 도구가 아닌 것은?',
      options: ['Cursor', 'Claude Code', 'GitHub Copilot', 'Photoshop'],
      answer: 3,
      explanation: 'Photoshop은 이미지 편집 도구입니다. Cursor(에디터), Claude Code(CLI), GitHub Copilot(VS Code 확장)은 모두 AI 코딩 도구입니다.',
    },
    {
      no: 3,
      question: 'HTML 문서의 구조 태그 중 시맨틱 태그가 아닌 것은?',
      options: ['<header>', '<nav>', '<div>', '<main>'],
      answer: 2,
      explanation: '<div>는 시맨틱 의미가 없는 일반 컨테이너 태그입니다. <header>·<nav>·<main>·<footer>·<article>·<section> 등은 의미를 가진 시맨틱 태그로, 접근성과 SEO에 유리합니다.',
    },
    {
      no: 4,
      question: 'CSS Flexbox의 주축(main-axis)을 결정하는 속성은?',
      options: ['justify-content', 'align-items', 'flex-direction', 'gap'],
      answer: 2,
      explanation: 'flex-direction이 주축을 결정합니다. row(가로) / column(세로) / row-reverse / column-reverse 값이 있습니다. justify-content는 주축 정렬, align-items는 교차축 정렬에 사용됩니다.',
    },
    {
      no: 5,
      question: '반응형 디자인 구현을 위해 가장 적절한 CSS 기능 조합은?',
      options: [
        'float + clear',
        'Flexbox/Grid + 미디어 쿼리',
        'position: absolute + z-index',
        'table 레이아웃',
      ],
      answer: 1,
      explanation: '현대 반응형 디자인의 표준은 Flexbox/Grid로 레이아웃을 만들고 @media 쿼리로 화면 크기별 다른 스타일을 적용하는 것입니다. float·table은 레거시 방식입니다.',
    },
    {
      no: 6,
      question: 'JavaScript에서 재할당이 불가능한 변수 선언 키워드는?',
      options: ['var', 'let', 'const', 'static'],
      answer: 2,
      explanation: 'const는 재할당 불가. 단, 객체·배열의 경우 참조만 고정되고 내부 속성은 변경 가능합니다. let은 재할당 가능, var는 함수 스코프(레거시), static은 JS에 없는 키워드입니다.',
    },
    {
      no: 7,
      question: '다음 JavaScript 배열 메서드 중 새 배열을 반환하지 않는 것은?',
      options: ['map', 'filter', 'forEach', 'concat'],
      answer: 2,
      explanation: 'forEach는 단순 순회용으로 반환값이 undefined입니다. map/filter/concat은 모두 새 배열을 반환합니다. 비동기 순회(await 필요)에도 forEach는 부적합 — for...of를 사용해야 합니다.',
    },
    {
      no: 8,
      question: 'ES6 화살표 함수 `(x) => x * 2`와 동일한 일반 함수 표현은?',
      options: [
        'function(x) { x * 2 }',
        'function(x) { return x * 2 }',
        'function() { return x * 2 }',
        'x => function() { x * 2 }',
      ],
      answer: 1,
      explanation: '화살표 함수의 한 줄 표현 (x) => x * 2는 암시적 return을 포함합니다. 일반 함수는 명시적으로 return을 작성해야 합니다.',
    },
    {
      no: 9,
      question: '비동기 처리에 사용되는 async/await의 설명으로 옳은 것은?',
      options: [
        'await는 동기 함수 안에서도 사용 가능하다',
        'async 함수는 항상 Promise를 반환한다',
        'await는 setTimeout을 자동으로 호출한다',
        'async/await는 콜백을 대체할 수 없다',
      ],
      answer: 1,
      explanation: 'async 함수는 명시적 return 값이 무엇이든 Promise로 감싸서 반환합니다. await는 async 함수 내부에서만 사용 가능합니다.',
    },
    {
      no: 10,
      question: 'React에서 컴포넌트 간 데이터를 전달할 때 사용하는 것은?',
      options: ['Props', 'Reducer', 'Mutation', 'Middleware'],
      answer: 0,
      explanation: 'Props(properties)는 부모에서 자식으로 단방향 데이터 흐름을 제공하는 React의 기본 메커니즘입니다. 읽기 전용이며, 자식이 부모 상태를 직접 변경할 수 없습니다.',
    },
    {
      no: 11,
      question: 'React의 useState Hook 사용법으로 올바른 것은?',
      options: [
        'const count = useState(0)',
        'const [count, setCount] = useState(0)',
        'useState({ count: 0 })',
        'this.state = useState(0)',
      ],
      answer: 1,
      explanation: 'useState는 [현재값, 갱신함수] 배열을 반환합니다. 구조 분해 할당으로 받는 것이 표준입니다. 0은 초기값입니다.',
    },
    {
      no: 12,
      question: 'JSX에서 클래스명을 지정할 때 사용하는 속성은?',
      options: ['class', 'className', 'classList', 'styleClass'],
      answer: 1,
      explanation: 'class는 JavaScript 예약어이므로 JSX에서는 className을 사용합니다. 마찬가지로 for는 htmlFor로 작성해야 합니다.',
    },
    {
      no: 13,
      question: 'Vite로 React 프로젝트를 새로 생성하는 명령은?',
      options: [
        'npx create-react-app my-app',
        'npm init react my-app',
        'npm create vite@latest my-app -- --template react',
        'vite new react my-app',
      ],
      answer: 2,
      explanation: 'Vite의 표준 생성 명령은 npm create vite@latest <이름> -- --template react입니다. create-react-app은 더 이상 권장되지 않는 레거시 방식입니다.',
    },
    {
      no: 14,
      question: '컴포넌트가 처음 마운트될 때 한 번만 실행하려면 useEffect를 어떻게 작성해야 하는가?',
      options: [
        'useEffect(() => { ... })',
        'useEffect(() => { ... }, [])',
        'useEffect(() => { ... }, null)',
        'useEffect(() => { ... }, [props])',
      ],
      answer: 1,
      explanation: '빈 의존성 배열 []은 마운트 시 1회만 실행을 의미합니다. 배열 생략은 매 렌더마다 실행, [props]는 props 변경 시마다 실행입니다.',
    },
    {
      no: 15,
      question: '바이브코딩 워크플로우에서 AI에게 코드 수정을 요청할 때 가장 효과적인 방법은?',
      options: [
        '모호한 한 단어 명령으로 요청한다',
        '역할·맥락·지시·출력 형식을 명확히 포함한 프롬프트를 작성한다',
        'AI 응답을 검토 없이 그대로 사용한다',
        '한 번에 모든 기능을 요구한다',
      ],
      answer: 1,
      explanation: '프롬프트의 4요소 R-C-I-F (Role·Context·Instruction·Format)를 명시할수록 AI 응답 품질이 70% 이상 향상됩니다. 컨텍스트가 풍부할수록 정확한 결과를 얻습니다.',
    },
    {
      no: 16,
      question: 'CSS Grid에서 가로 3열 동일 너비 그리드를 만드는 가장 표준적인 속성은?',
      options: [
        'grid-columns: 3',
        'grid-template-columns: repeat(3, 1fr)',
        'flex: 3',
        'display: grid-3',
      ],
      answer: 1,
      explanation: 'repeat(3, 1fr)은 1fr(fraction) 단위로 3열을 균등 분할합니다. 반응형으로 자동 조절하려면 repeat(auto-fit, minmax(280px, 1fr))을 사용합니다.',
    },
    {
      no: 17,
      question: 'JavaScript의 falsy 값이 아닌 것은?',
      options: ['0', '""(빈 문자열)', '[](빈 배열)', 'null'],
      answer: 2,
      explanation: 'falsy 값은 7가지: false, 0, -0, 0n, "", null, undefined, NaN입니다. 빈 배열 []과 빈 객체 {}는 truthy입니다.',
    },
    {
      no: 18,
      question: 'React에서 배열을 리스트로 렌더링할 때 반드시 추가해야 하는 prop은?',
      options: ['ref', 'id', 'key', 'name'],
      answer: 2,
      explanation: 'key prop은 React가 어떤 요소가 변경/추가/제거되었는지 추적하는 데 사용됩니다. 안정된 ID(예: item.id)를 사용해야 하며, index를 key로 쓰면 정렬·삭제 시 버그가 발생합니다.',
    },
    {
      no: 19,
      question: 'Vite로 생성된 프로젝트에서 개발 서버를 실행하는 표준 npm 스크립트는?',
      options: ['npm start', 'npm run serve', 'npm run dev', 'npm run launch'],
      answer: 2,
      explanation: 'Vite는 package.json의 dev 스크립트로 개발 서버를 실행합니다. 기본 포트는 5173입니다. start는 create-react-app의 관례입니다.',
    },
    {
      no: 20,
      question: 'AI에게 코드 결과물의 형식을 강제하고 싶을 때 가장 효과적인 프롬프트 기법은?',
      options: [
        '"잘 만들어줘"라고 모호하게 요청',
        '"JSON 형식으로, 다음 키를 포함하여 응답하라"처럼 출력 스키마를 명시',
        '대답 길이를 제한 없이 둔다',
        '예시 없이 자유롭게 작성하게 둔다',
      ],
      answer: 1,
      explanation: '출력 스키마(키, 타입, 형식)를 명시하면 AI 응답의 일관성과 파싱 가능성이 크게 향상됩니다. JSON·Markdown·표 형태 등을 명시적으로 요청하세요.',
    },
    {
      no: 21,
      question: 'Cursor에서 채팅 패널을 여는 단축키는?',
      options: ['Cmd/Ctrl + L', 'Cmd/Ctrl + K', 'Cmd/Ctrl + I', 'Cmd/Ctrl + P'],
      answer: 0,
      explanation: 'Cmd/Ctrl+L = 채팅 패널, Cmd/Ctrl+K = 인라인 편집, Cmd/Ctrl+I = 에이전트 모드, Cmd/Ctrl+P = 파일 빠른 열기입니다.',
    },
    {
      no: 22,
      question: 'Cursor와 Claude Code의 주요 차이로 가장 정확한 것은?',
      options: [
        '둘 다 같은 도구의 다른 이름이다',
        'Cursor는 GUI 에디터, Claude Code는 CLI 기반 에이전트',
        'Cursor만 무료이다',
        'Claude Code는 React 전용이다',
      ],
      answer: 1,
      explanation: 'Cursor는 VS Code 포크 기반 GUI 에디터, Claude Code는 터미널에서 동작하는 에이전틱 CLI입니다. 둘 다 유료이며 시나리오별로 선택해서 사용합니다.',
    },
    {
      no: 23,
      question: 'AI가 생성한 코드를 검수할 때 가장 우선적으로 확인해야 할 것은?',
      options: [
        '코드 줄 수',
        'import 경로의 정확성과 사용한 함수/패키지의 실존 여부',
        '들여쓰기 일관성',
        '주석의 분량',
      ],
      answer: 1,
      explanation: 'AI는 존재하지 않는 라이브러리나 함수를 그럴듯하게 만들어내는 "환각(hallucination)"을 자주 일으킵니다. npm·공식 docs로 실존 확인이 최우선 검수 항목입니다.',
    },
    {
      no: 24,
      question: 'HTML 문서에서 <title> 태그가 위치해야 하는 곳은?',
      options: ['<body> 안', '<head> 안', '<html> 바로 아래', '아무 곳이나'],
      answer: 1,
      explanation: '<title>은 <head> 안에 위치해야 하며, 브라우저 탭과 검색 결과의 페이지 제목으로 사용됩니다. SEO에 매우 중요한 요소입니다.',
    },
    {
      no: 25,
      question: 'CSS에서 padding이 width에 포함되도록 하려면 어떤 속성을 사용해야 하는가?',
      options: [
        'box-sizing: border-box',
        'padding-box: true',
        'width-include: padding',
        'overflow: hidden',
      ],
      answer: 0,
      explanation: 'box-sizing: border-box는 width/height에 padding과 border를 포함시킵니다. 기본값인 content-box는 padding/border가 width에 추가되어 실제 폭이 늘어납니다.',
    },
    {
      no: 26,
      question: 'CSS 선택자 우선순위에서 ID(#id)와 클래스(.class) 중 더 강한 것은?',
      options: ['클래스가 강함', 'ID가 강함 (10배)', '같음', 'CSS 파일 위치에 따라 다름'],
      answer: 1,
      explanation: 'Specificity 점수: ID=100, 클래스=10, 태그=1. 즉 ID 1개가 클래스 9개를 이깁니다. !important는 모든 우선순위를 무시하지만 남용 시 디버깅 지옥이 됩니다.',
    },
    {
      no: 27,
      question: 'CSS Flexbox/Grid에서 자식 요소 간 간격을 조절하는 최신 표준 속성은?',
      options: ['margin: 0 8px', 'gap', 'padding', 'spacing'],
      answer: 1,
      explanation: 'gap은 Flexbox(2021+)와 Grid에서 모두 지원되는 표준 간격 속성입니다. margin보다 깔끔하고 첫·마지막 요소 처리가 자동입니다.',
    },
    {
      no: 28,
      question: '다크모드를 CSS로 구현할 때 가장 권장되는 방식은?',
      options: [
        '모든 컴포넌트에 dark 클래스 추가',
        'CSS 변수 + [data-theme="dark"] 또는 prefers-color-scheme',
        'JavaScript로 모든 색을 직접 변경',
        '다크모드 전용 별도 페이지 작성',
      ],
      answer: 1,
      explanation: 'CSS 변수로 색을 정의하고 [data-theme="dark"]나 @media (prefers-color-scheme: dark)로 오버라이드하면 한 곳 수정으로 전체 다크모드를 처리할 수 있습니다.',
    },
    {
      no: 29,
      question: 'Flexbox에서 가로 정렬을 양 끝으로 분산하는 justify-content 값은?',
      options: ['flex-start', 'center', 'space-between', 'stretch'],
      answer: 2,
      explanation: 'space-between은 첫·마지막 요소를 양 끝에 두고 나머지는 균등 분배합니다. space-around는 양 끝에도 여백을, space-evenly는 모든 간격을 동일하게 만듭니다.',
    },
    {
      no: 30,
      question: 'Flexbox vs Grid 선택 기준으로 가장 정확한 것은?',
      options: [
        'Flexbox는 항상 Grid보다 성능이 좋다',
        '1차원 정렬은 Flexbox, 2차원(행+열) 레이아웃은 Grid',
        'Grid는 모바일에서 동작하지 않는다',
        'Flexbox는 IE만 지원한다',
      ],
      answer: 1,
      explanation: '1차원(가로 메뉴, 한 줄 정렬)은 Flexbox, 2차원(대시보드, 카드 갤러리 자동 줄바꿈)은 Grid가 더 적합합니다. 두 기술 모두 모든 모던 브라우저에서 동작합니다.',
    },
    {
      no: 31,
      question: 'var와 let의 스코프 차이로 옳은 것은?',
      options: [
        'var는 함수 스코프, let은 블록 스코프',
        'var는 전역만, let은 함수만',
        '둘 다 블록 스코프',
        '둘 다 함수 스코프',
      ],
      answer: 0,
      explanation: 'var는 함수 스코프(또는 전역)이고 for/if 블록 안에서도 외부에서 접근 가능합니다. let/const는 블록 스코프로 {...} 안에서만 유효합니다. var는 레거시 코드 외에 쓰지 마세요.',
    },
    {
      no: 32,
      question: 'JavaScript의 호이스팅(Hoisting)에 대한 설명으로 옳은 것은?',
      options: [
        'var는 undefined로 호이스팅, let/const는 TDZ에 들어감',
        '모든 변수는 사용 전에 항상 선언해야 함 (호이스팅 없음)',
        '호이스팅은 ES6+에서 사라졌다',
        'const만 호이스팅 된다',
      ],
      answer: 0,
      explanation: 'var는 호이스팅되어 선언 전 접근 시 undefined를 반환합니다. let/const는 호이스팅되지만 TDZ(Temporal Dead Zone)에 들어가 선언 전 접근 시 ReferenceError가 발생합니다.',
    },
    {
      no: 33,
      question: '다음 구조 분해 할당 코드의 결과는? `const {name, age = 0} = {name: "홍길동"};`',
      options: [
        'name = "홍길동", age = undefined',
        'name = "홍길동", age = 0',
        'name = undefined, age = 0',
        'TypeError 발생',
      ],
      answer: 1,
      explanation: '구조 분해 시 객체에 키가 없으면 기본값이 적용됩니다. age는 객체에 없으므로 기본값 0이 할당됩니다. = 으로 기본값을 지정할 수 있습니다.',
    },
    {
      no: 34,
      question: '전개 연산자 `[...arr1, ...arr2]`의 결과로 옳은 것은? (arr1=[1,2], arr2=[3,4])',
      options: ['[[1,2],[3,4]]', '[1,2,3,4]', '[1,3,2,4]', 'TypeError'],
      answer: 1,
      explanation: '전개 연산자(...)는 배열의 요소를 펼쳐서 새 배열에 삽입합니다. [...arr1, ...arr2]는 [1,2,3,4]가 됩니다. 객체에도 사용 가능합니다: {...obj1, ...obj2}.',
    },
    {
      no: 35,
      question: '옵셔널 체이닝(?.)의 동작으로 옳은 것은?',
      options: [
        '값이 0이면 fallback',
        '값이 undefined·null이면 전체가 undefined 반환',
        '항상 true 반환',
        'try-catch와 동일',
      ],
      answer: 1,
      explanation: 'user?.profile?.email은 user나 profile이 undefined·null이면 전체가 undefined를 반환합니다. 깊은 객체 접근 시 안전 가드 역할을 합니다.',
    },
    {
      no: 36,
      question: 'Nullish Coalescing (??)과 OR (||)의 차이로 옳은 것은?',
      options: [
        '둘 다 동일하게 동작',
        '??는 undefined·null만 fallback, ||는 모든 falsy 값 fallback',
        '??는 React 전용',
        '||는 TypeScript에서 동작 안 함',
      ],
      answer: 1,
      explanation: '0 || 10 → 10 (0이 falsy), 0 ?? 10 → 0 (undefined·null만 fallback). 숫자 0이나 빈 문자열이 유효한 값일 때 ??가 필요합니다.',
    },
    {
      no: 37,
      question: 'fetch가 4xx·5xx 응답을 받았을 때의 동작으로 옳은 것은?',
      options: [
        '자동으로 reject',
        '정상 resolve되며 res.ok로 직접 확인 필요',
        '브라우저가 자동 알림',
        '재시도 자동',
      ],
      answer: 1,
      explanation: 'fetch는 네트워크 실패에만 reject하고 HTTP 상태 코드(4xx, 5xx)는 정상 resolve합니다. if (!res.ok) throw new Error()로 직접 확인해야 합니다.',
    },
    {
      no: 38,
      question: 'JSX에서 두 개 이상의 요소를 반환해야 할 때 사용하는 것은?',
      options: ['Array.from()', 'Fragment <>...</> 또는 <React.Fragment>', '<div> 강제 사용', 'JSX는 한 요소만 반환 가능 (해결책 없음)'],
      answer: 1,
      explanation: 'Fragment(<>...</>)는 추가 DOM 노드 없이 여러 요소를 그룹화합니다. <div>로 감싸지 않아도 되어 불필요한 HTML 계층을 줄입니다.',
    },
    {
      no: 39,
      question: 'React 컴포넌트 이름의 첫 글자는 대문자/소문자 중 어느 것이어야 하는가?',
      options: ['대문자', '소문자', '상관없음', '숫자'],
      answer: 0,
      explanation: '대문자로 시작해야 React가 사용자 정의 컴포넌트로 인식합니다. 소문자는 HTML 태그(<div>, <span> 등)로 처리됩니다.',
    },
    {
      no: 40,
      question: 'React Hook의 호출 규칙으로 옳은 것은?',
      options: [
        '조건문·반복문 안에서 호출 가능',
        '항상 컴포넌트 최상단에서 같은 순서로 호출',
        '클래스 컴포넌트에서도 가능',
        '한 컴포넌트에 1개만',
      ],
      answer: 1,
      explanation: 'Hook은 반드시 함수형 컴포넌트의 최상단에서 동일 순서로 호출해야 합니다. 조건문·반복문 안에서 호출하면 "Rendered fewer hooks than expected" 에러가 발생합니다.',
    },
    {
      no: 41,
      question: 'React에서 버튼 클릭 핸들러를 전달하는 올바른 방법은?',
      options: [
        '<button onClick={handleClick()}>',
        '<button onClick={handleClick}>',
        '<button click={handleClick}>',
        '<button onclick={handleClick}>',
      ],
      answer: 1,
      explanation: '함수 참조 자체를 전달해야 합니다. handleClick()처럼 ()를 붙이면 렌더 즉시 실행됩니다. 인자 전달 시는 () => handleClick(id)처럼 화살표 함수로 감싸세요.',
    },
    {
      no: 42,
      question: 'JSX에서 조건부 렌더링 시 && 단축의 함정으로 옳은 것은?',
      options: [
        'undefined가 화면에 표시됨',
        '0이 falsy이지만 화면에 "0"이 표시됨',
        'true가 화면에 표시됨',
        '함정 없음',
      ],
      answer: 1,
      explanation: '{count && <p>...</p>}에서 count가 0이면 "0"이 화면에 표시됩니다. {count > 0 && ...}처럼 boolean으로 변환하거나 삼항 연산자를 사용하세요.',
    },
    {
      no: 43,
      question: 'React state를 직접 변경(count++)하면 안 되는 이유는?',
      options: [
        'React 라이선스 위반',
        '같은 참조이므로 리렌더를 트리거하지 않음',
        '브라우저가 다운됨',
        'TypeScript 에러',
      ],
      answer: 1,
      explanation: 'React는 참조 비교(===)로 변경을 감지합니다. count++는 같은 참조이므로 리렌더가 발생하지 않습니다. setCount(c => c + 1)처럼 함수형 업데이트를 사용하세요.',
    },
    {
      no: 44,
      question: 'Vite에서 환경변수를 클라이언트에서 접근하려면 어떤 접두사가 필요한가?',
      options: ['REACT_APP_', 'VITE_', 'PUBLIC_', '접두사 불필요'],
      answer: 1,
      explanation: 'Vite는 VITE_로 시작하는 환경변수만 import.meta.env로 접근 가능합니다. 보안상 다른 변수는 클라이언트 코드에 포함되지 않습니다.',
    },
    {
      no: 45,
      question: 'Git에서 작업 중 변경 내용을 확인하는 명령은?',
      options: ['git status', 'git push', 'git clone', 'git init'],
      answer: 0,
      explanation: 'git status는 현재 변경된 파일·스테이징 상태를 보여줍니다. git diff는 실제 내용 차이를 보여줍니다. git log는 커밋 이력을 봅니다.',
    },
    {
      no: 46,
      question: 'GitHub Pages에 SPA를 배포할 때 가장 흔히 사용하는 npm 패키지는?',
      options: ['vercel', 'gh-pages', 'netlify-cli', 'aws-cli'],
      answer: 1,
      explanation: 'gh-pages 패키지가 dist 폴더를 gh-pages 브랜치에 자동 푸시합니다. "deploy": "gh-pages -d dist" 형태로 사용합니다.',
    },
    {
      no: 47,
      question: '.gitignore에 반드시 포함해야 할 항목으로 옳은 것은?',
      options: [
        'src/, public/',
        'node_modules/, .env, dist/',
        'package.json, README.md',
        'index.html, App.tsx',
      ],
      answer: 1,
      explanation: 'node_modules(용량), .env(비밀키), dist(빌드 산출물)는 반드시 gitignore에 포함해야 합니다. src·package.json은 커밋해야 합니다.',
    },
    {
      no: 48,
      question: '프롬프트 4요소 R-C-I-F가 의미하는 것은?',
      options: [
        'Read·Check·Iterate·Fix',
        'Role·Context·Instruction·Format',
        'React·CSS·In·Frontend',
        'Random·Concrete·Insert·Final',
      ],
      answer: 1,
      explanation: 'Role(역할), Context(맥락), Instruction(지시), Format(출력 형식). 이 4요소를 명시할수록 AI 응답 품질이 크게 향상됩니다.',
    },
    {
      no: 49,
      question: 'LLM의 환각(Hallucination)이란?',
      options: [
        'AI가 한국어를 못 알아듣는 현상',
        '존재하지 않는 정보·함수·라이브러리를 사실인 것처럼 생성',
        'AI가 응답을 거부하는 현상',
        '응답이 너무 길어지는 현상',
      ],
      answer: 1,
      explanation: 'LLM은 통계적으로 그럴듯한 토큰을 예측할 뿐 사실 검증 능력이 없습니다. 존재하지 않는 npm 패키지·React Hook 등을 만들어내는 사례가 흔하므로 항상 검증 필요.',
    },
    {
      no: 50,
      question: 'AI 코드 검수의 5단계 우선순위로 가장 적절한 것은?',
      options: [
        '들여쓰기 → 주석 → 변수명 → 색상 → 폰트',
        'import 정확성 → 타입 안전성 → React 룰 → 에러 처리 → 보안·성능',
        '동작만 되면 OK',
        '컴파일만 통과하면 OK',
      ],
      answer: 1,
      explanation: '검수 5단계: ①import 경로 ②TypeScript 타입 ③React 룰(Hook·key·의존성) ④에러 처리 ⑤보안·성능. 이 순서로 체크하면 진짜 문제를 빠르게 발견할 수 있습니다.',
    },
];

const prerequisite: AssessmentSet = {
  type: 'prerequisite',
  title: '선수평가',
  subtitle: '정규과정 시작 전 사전 평가 (20문항 · 100점 만점)',
  description:
    '정규과정 Day 1~4(바이브코딩 개론·HTML/CSS·JavaScript·React 기초)를 대비한 사전 평가입니다. 객관식 20문항, 문항당 5점(100점 만점), 합격 기준 40점. 제출하면 자동 채점되어 성적에 반영됩니다.',
  duration: '40분',
  passingScore: 40,
  mode: 'graded',
  mcq: pick(prerequisitePool, PREREQUISITE_SELECTION),
};

/* ════════════════════════════════════════════════════════════
 *  진단평가 (50문항) — 정규과정 Day 5~9
 * ════════════════════════════════════════════════════════════ */
const diagnosticPool: MCQuestion[] = [
    {
      no: 1,
      question: 'React Router v6의 라우트 정의로 올바른 것은?',
      options: [
        '<Switch><Route component={Home} /></Switch>',
        '<Routes><Route path="/" element={<Home />} /></Routes>',
        '<Router path="/" render={Home} />',
        '<Route exact path="/" component={Home} />',
      ],
      answer: 1,
      explanation: 'v6에서는 Switch가 Routes로, component/render prop이 element로 변경되었습니다. v5 문법은 더 이상 동작하지 않습니다.',
    },
    {
      no: 2,
      question: 'React Router에서 동적 라우트 파라미터를 읽는 Hook은?',
      options: ['useNavigate', 'useLocation', 'useParams', 'useRouteMatch'],
      answer: 2,
      explanation: 'useParams는 /users/:id 같은 URL의 :id 값을 객체로 반환합니다. const { id } = useParams() 형태로 사용합니다.',
    },
    {
      no: 3,
      question: 'React Context API의 주된 용도로 가장 적절한 것은?',
      options: [
        '컴포넌트 간 전역 상태 공유',
        '서버 사이드 렌더링',
        '코드 스플리팅',
        '폼 유효성 검증',
      ],
      answer: 0,
      explanation: 'Context는 props drilling(여러 단계 prop 전달)을 피하고 인증·테마·언어 등 전역 상태를 공유하는 데 사용됩니다. 자주 변하는 값은 성능 주의.',
    },
    {
      no: 4,
      question: 'React에서 코드 스플리팅을 구현할 때 사용하는 API는?',
      options: [
        'React.memo + useCallback',
        'React.lazy + Suspense',
        'useReducer + Context',
        'forwardRef + useImperativeHandle',
      ],
      answer: 1,
      explanation: 'React.lazy(() => import("./Page"))로 동적 import하고 <Suspense fallback={...}>로 감싸 로딩 UI를 표시합니다. 초기 번들 크기를 크게 줄일 수 있습니다.',
    },
    {
      no: 5,
      question: 'Supabase에서 제공하는 핵심 기능이 아닌 것은?',
      options: ['Auth', 'PostgreSQL Database', 'Storage', '온프레미스 GPU 학습'],
      answer: 3,
      explanation: 'Supabase는 PostgreSQL + Auth + Storage + Realtime + Edge Functions를 제공하는 BaaS입니다. GPU 학습 인프라는 제공하지 않습니다.',
    },
    {
      no: 6,
      question: 'Supabase의 RLS(Row Level Security)에 대한 설명으로 옳은 것은?',
      options: [
        '서버 응답을 캐싱하는 기능이다',
        '행 단위로 접근 권한을 제어하는 PostgreSQL 보안 기능이다',
        '클라이언트의 라우팅 보호 기능이다',
        '결제 검증 기능이다',
      ],
      answer: 1,
      explanation: 'RLS는 PostgreSQL의 표준 기능으로, 각 행에 대한 SELECT/INSERT/UPDATE/DELETE 권한을 SQL 정책(policy)으로 제어합니다. anon key가 노출되어도 데이터는 안전합니다.',
    },
    {
      no: 7,
      question: 'Supabase JavaScript 클라이언트로 테이블에서 행을 조회하는 코드는?',
      options: [
        "supabase.query('posts').get()",
        "supabase.table('posts').read()",
        "supabase.from('posts').select('*')",
        'supabase.posts.find()',
      ],
      answer: 2,
      explanation: 'supabase.from(테이블).select(컬럼)이 표준 문법입니다. .eq(), .gt(), .order() 등으로 체이닝합니다.',
    },
    {
      no: 8,
      question: 'AI 서비스 기획 단계에서 PRD(Product Requirements Document)의 역할은?',
      options: [
        '서버 인프라 설정 명세서',
        '제품의 목표·사용자·기능·범위를 정의한 요구사항 문서',
        '소스코드 빌드 스크립트',
        '결제 정산 보고서',
      ],
      answer: 1,
      explanation: 'PRD는 1~2페이지짜리 제품 요구사항 문서로, 팀 전체가 같은 목표를 공유하기 위한 단일 진실 공급원(Single Source of Truth)입니다.',
    },
    {
      no: 9,
      question: 'MVP(Minimum Viable Product) 정의로 가장 적절한 것은?',
      options: [
        '모든 기능이 완성된 최종 제품',
        '핵심 가치를 검증할 수 있는 최소 기능의 제품',
        '광고용 데모 영상',
        '내부 직원용 백오피스 도구',
      ],
      answer: 1,
      explanation: 'MVP는 가설(이 제품에 시장이 있는가)을 가장 적은 비용·시간으로 검증하는 제품입니다. 4주 프로젝트는 MVP의 좋은 예입니다.',
    },
    {
      no: 10,
      question: 'LLM API 호출 시 응답의 무작위성·창의성을 조절하는 파라미터는?',
      options: ['top_k', 'temperature', 'max_tokens', 'stop_sequence'],
      answer: 1,
      explanation: 'temperature 0.0~2.0 사이 값으로 조절. 0에 가까울수록 결정적, 1 이상은 창의적·랜덤합니다. 코드 생성은 0, 자유 글쓰기는 0.7~1.0 권장.',
    },
    {
      no: 11,
      question: 'LLM 대화형 API에서 시스템 프롬프트(system prompt)의 역할로 가장 적절한 것은?',
      options: [
        '사용자에게 보여줄 안내 문구',
        '모델의 역할·말투·제약을 지정',
        '결제 검증 토큰',
        '데이터베이스 스키마 정의',
      ],
      answer: 1,
      explanation: 'system role 메시지로 "너는 친절한 진로 코치다"처럼 모델의 페르소나를 정의합니다. 보통 대화 첫 메시지로 1번만 두며, 전체 대화에 영향을 미칩니다.',
    },
    {
      no: 12,
      question: 'LLM 응답을 토큰 단위로 점진적으로 표시하는 기법은?',
      options: ['배치 처리', '폴링', '스트리밍', '롱-폴링'],
      answer: 2,
      explanation: '스트리밍(SSE - Server-Sent Events)은 응답을 토큰 단위로 점진적으로 받습니다. ChatGPT처럼 글자가 한 글자씩 표시되어 체감 응답 속도가 크게 향상됩니다.',
    },
    {
      no: 13,
      question: 'fetch로 LLM API에 POST 요청을 보낼 때 반드시 포함되는 항목이 아닌 것은?',
      options: [
        'method: "POST"',
        'headers (Authorization, Content-Type)',
        'body (JSON.stringify(...))',
        'cookie: "session=..."',
      ],
      answer: 3,
      explanation: 'LLM API는 Authorization 헤더(Bearer 토큰)로 인증하며 cookie는 필요 없습니다. method, headers, body 3가지가 표준입니다.',
    },
    {
      no: 14,
      question: '재사용 가능한 UI 컴포넌트 설계 원칙으로 가장 적절한 것은?',
      options: [
        '한 컴포넌트에 모든 화면 로직을 모은다',
        '단일 책임 원칙으로 작게 분리하고 Props로 제어한다',
        '비즈니스 로직과 UI를 항상 한 파일에 둔다',
        '컴포넌트는 항상 default export만 사용한다',
      ],
      answer: 1,
      explanation: 'Atomic Design 같은 단일 책임 원칙으로 컴포넌트를 작게 나누고 props로 변형을 제어해야 재사용·테스트·유지보수가 쉽습니다.',
    },
    {
      no: 15,
      question: 'CSS 반응형 브레이크포인트 사용 방식으로 적절한 것은?',
      options: [
        '@media (max-width: 1024px) { ... }',
        '@if (width < 1024) { ... }',
        '@responsive 1024 { ... }',
        '.responsive { @1024px ... }',
      ],
      answer: 0,
      explanation: 'CSS 미디어 쿼리는 @media (조건) { 스타일 } 형태입니다. 모바일 퍼스트는 min-width를 데스크탑 퍼스트는 max-width를 주로 사용합니다.',
    },
    {
      no: 16,
      question: 'React Router에서 로그인이 필요한 페이지를 보호할 때 가장 적절한 패턴은?',
      options: [
        '컴포넌트 내부에서 alert만 띄우기',
        '인증 상태를 검사하고 비로그인 시 Navigate로 리다이렉트하는 AuthGuard 래퍼',
        'window.location.href를 직접 변경',
        '서버 응답에서 401만 받고 별도 처리 없음',
      ],
      answer: 1,
      explanation: 'AuthGuard 패턴: 인증 검사 → 미로그인 시 <Navigate to="/login" state={{ from: location }} replace />. 로그인 성공 후 원래 가려던 페이지로 복귀시킬 수 있습니다.',
    },
    {
      no: 17,
      question: 'Supabase 클라이언트 초기화 시 필요한 두 가지 인자는?',
      options: [
        'username, password',
        'project URL, anon key',
        'API endpoint, secret key',
        'host, port',
      ],
      answer: 1,
      explanation: 'createClient(SUPABASE_URL, ANON_KEY) 형태로 초기화합니다. anon key는 RLS 보호 하에 노출 가능하지만, service_role key는 절대 클라이언트에 두지 마세요.',
    },
    {
      no: 18,
      question: 'OpenAI 호환 LLM API 응답에서 어시스턴트의 텍스트 콘텐츠가 위치하는 일반적인 JSON 경로는?',
      options: [
        'response.text',
        'data.result',
        'choices[0].message.content',
        'output.value',
      ],
      answer: 2,
      explanation: 'OpenAI 표준 응답 구조는 { choices: [{ message: { content: "..." }}] } 입니다. Solar 등 호환 API도 동일 구조를 따릅니다.',
    },
    {
      no: 19,
      question: 'AI 응답을 한국어로만 유도하기에 가장 적절한 시스템 프롬프트는?',
      options: [
        '"한국 사람이야"',
        '"반드시 한국어로만 답하라. 영어 단어를 사용하지 말 것."',
        '"되도록 한국어"',
        '시스템 프롬프트 없이 한국어로 질문만 던진다',
      ],
      answer: 1,
      explanation: 'LLM은 모호한 지시를 회피하지 못합니다. "반드시 ___로만", "절대 ___하지 말 것" 같은 명시적·강한 표현이 효과적입니다.',
    },
    {
      no: 20,
      question: '컴포넌트 props로 함수(이벤트 핸들러)를 전달할 때 권장되는 명명 규칙은?',
      options: [
        'click, change 처럼 동사형',
        'onClick, onChange 처럼 on 접두사 + 이벤트명',
        'handle 접두사만 단독 사용 (handle)',
        '명사형으로 click_func 처럼 작성',
      ],
      answer: 1,
      explanation: 'React 표준 컨벤션: prop은 on* (onClick, onChange, onSubmit), 내부 핸들러는 handle* (handleClick, handleChange). 일관성이 협업에 매우 중요합니다.',
    },
    {
      no: 21,
      question: 'React Router를 사용하려면 어떤 컴포넌트로 앱을 감싸야 하는가?',
      options: ['<Router>', '<BrowserRouter>', '<RouterProvider>', '<Provider>'],
      answer: 1,
      explanation: '<BrowserRouter>는 HTML5 History API를 사용하는 표준 라우터입니다. <HashRouter>는 # 기반 URL을 사용하며 정적 호스팅에 유용합니다.',
    },
    {
      no: 22,
      question: 'useNavigate와 Link의 가장 큰 차이는?',
      options: [
        '동일 기능',
        'Link는 <a> 태그(접근성·SEO 좋음), useNavigate는 함수형 이동(이벤트 핸들러 안)',
        'useNavigate만 React Router에 있음',
        'Link는 모바일에서 동작 안 함',
      ],
      answer: 1,
      explanation: 'Link는 시맨틱 <a>로 렌더링되어 접근성·SEO·우클릭 새 탭이 좋습니다. useNavigate는 로그인 성공 후 자동 이동 같은 프로그래매틱 이동에 사용합니다.',
    },
    {
      no: 23,
      question: 'React Router의 Outlet 컴포넌트의 용도는?',
      options: [
        '버튼 만들기',
        '중첩 라우트에서 자식 라우트의 렌더링 위치 표시',
        '로딩 표시',
        '에러 처리',
      ],
      answer: 1,
      explanation: 'Outlet은 부모 라우트 안에서 자식 라우트가 렌더링될 자리를 표시합니다. 레이아웃 컴포넌트에 자식 페이지를 끼워 넣을 때 사용합니다.',
    },
    {
      no: 24,
      question: 'Context value가 변경되면 어떤 일이 발생하는가?',
      options: [
        '아무 일도 일어나지 않음',
        '그 Context를 구독하는 모든 컴포넌트가 리렌더',
        'App 전체가 새로고침',
        'Provider만 리렌더',
      ],
      answer: 1,
      explanation: 'Context value가 바뀌면 useContext()로 구독하는 모든 컴포넌트가 리렌더됩니다. 자주 변하는 값을 Context에 두면 성능 문제. useMemo로 value를 안정화하세요.',
    },
    {
      no: 25,
      question: 'useMemo와 useCallback의 차이로 옳은 것은?',
      options: [
        '동일한 Hook',
        'useMemo는 값 메모이제이션, useCallback은 함수 메모이제이션',
        'useMemo는 비동기 전용',
        'useCallback은 클래스 컴포넌트 전용',
      ],
      answer: 1,
      explanation: 'useMemo(() => 계산, deps)는 계산 결과(값)를 캐싱, useCallback(fn, deps)는 함수 자체를 캐싱. useCallback = useMemo(() => fn, deps)와 동등합니다.',
    },
    {
      no: 26,
      question: 'React.memo의 적절한 사용 시점은?',
      options: [
        '모든 컴포넌트에 무조건 적용',
        'Profiler로 리렌더 비용이 큰 컴포넌트를 발견했을 때',
        '클래스 컴포넌트만',
        'useState가 있는 컴포넌트만',
      ],
      answer: 1,
      explanation: 'React.memo는 자체 비용이 있으므로 측정 후 적용합니다. 단순 컴포넌트나 자주 변하는 props에는 오히려 느려질 수 있습니다. Profiler로 진짜 병목 식별이 우선.',
    },
    {
      no: 27,
      question: 'Supabase에서 이메일 회원가입을 위한 메서드는?',
      options: [
        'supabase.signup(email, password)',
        'supabase.auth.signUp({ email, password })',
        'supabase.users.create(email, password)',
        'supabase.register(email, password)',
      ],
      answer: 1,
      explanation: 'supabase.auth.signUp({ email, password, options: { data } })이 표준입니다. data로 user_metadata 추가, emailRedirectTo로 콜백 URL 지정 가능.',
    },
    {
      no: 28,
      question: 'Supabase에서 Google OAuth 로그인 메서드는?',
      options: [
        'supabase.auth.signInWithGoogle()',
        'supabase.auth.signInWithOAuth({ provider: "google" })',
        'supabase.google.login()',
        'supabase.oauth("google")',
      ],
      answer: 1,
      explanation: 'signInWithOAuth({ provider: "google" | "kakao" | "github" | ... })가 통합 메서드입니다. provider만 바꿔 다양한 OAuth를 처리합니다.',
    },
    {
      no: 29,
      question: 'Supabase 인증 상태 변화를 구독하는 메서드는?',
      options: [
        'supabase.auth.subscribe(callback)',
        'supabase.auth.onAuthStateChange(callback)',
        'supabase.auth.watch(callback)',
        'supabase.auth.listen(callback)',
      ],
      answer: 1,
      explanation: 'onAuthStateChange((event, session) => {...})로 SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED 등을 구독합니다. AuthContext의 핵심 메커니즘.',
    },
    {
      no: 30,
      question: 'Supabase RLS 정책을 SELECT에 적용하는 SQL은?',
      options: [
        'CREATE RULE ... ON posts FOR SELECT',
        'CREATE POLICY ... ON posts FOR SELECT USING (...)',
        'GRANT SELECT ON posts',
        'ALTER TABLE posts ADD SELECT',
      ],
      answer: 1,
      explanation: 'CREATE POLICY "이름" ON 테이블 FOR SELECT USING (조건). USING으로 행 가시성 결정. INSERT는 WITH CHECK, UPDATE는 USING+WITH CHECK 둘 다 권장.',
    },
    {
      no: 31,
      question: 'Supabase Storage에서 파일을 묶어 보관하는 단위는?',
      options: ['폴더', '버킷(Bucket)', '컨테이너', '볼륨'],
      answer: 1,
      explanation: 'Storage는 버킷 단위로 파일을 보관합니다. 버킷은 public 또는 private으로 설정하며, RLS 정책으로 접근 권한을 제어합니다.',
    },
    {
      no: 32,
      question: 'Supabase Edge Function의 주된 용도는?',
      options: [
        '클라이언트 측 라우팅',
        'LLM API 키 등 비밀 보호 + 서버 측 비즈니스 로직',
        'CSS 처리',
        '이미지 압축',
      ],
      answer: 1,
      explanation: 'Edge Function은 Deno로 작성된 서버 코드로 글로벌 엣지에서 실행됩니다. LLM API 키 등 클라이언트에 노출하면 안 되는 비밀과 결제 검증 등에 사용합니다.',
    },
    {
      no: 33,
      question: 'LLM messages 배열의 role 값 3가지는?',
      options: [
        'user, admin, guest',
        'system, user, assistant',
        'sender, receiver, broadcaster',
        'prompt, response, error',
      ],
      answer: 1,
      explanation: 'system(모델 역할 지정), user(사용자 메시지), assistant(모델 응답). 대화가 진행됨에 따라 user-assistant가 번갈아 누적됩니다.',
    },
    {
      no: 34,
      question: 'LLM 스트리밍 응답의 종료 신호로 일반적으로 사용되는 문자열은?',
      options: ['"END"', '"[DONE]"', '"\\0"', '"FINISH"'],
      answer: 1,
      explanation: 'OpenAI 호환 SSE 스트림은 마지막에 "data: [DONE]"을 보냅니다. 이를 받으면 reader.read() 루프를 종료합니다.',
    },
    {
      no: 35,
      question: 'LLM temperature를 0으로 설정하면?',
      options: [
        '응답이 빨라진다',
        '응답이 거의 결정적(같은 입력 → 같은 출력)이 된다',
        '무작위 응답',
        '에러 발생',
      ],
      answer: 1,
      explanation: 'temperature=0은 가장 확률 높은 토큰만 선택해 결정적 응답에 가깝게 만듭니다. 분류·정형 출력에 적합. 대화·창의적 작업은 0.7~1.0이 일반적.',
    },
    {
      no: 36,
      question: 'LLM max_tokens 파라미터의 효과는?',
      options: [
        '응답 속도 향상',
        '응답 최대 길이 제한 → 비용·시간 제어',
        '모델 정확도 향상',
        '한국어 강제',
      ],
      answer: 1,
      explanation: 'max_tokens는 응답이 생성할 최대 토큰 수를 제한합니다. 비용 절감과 응답 길이 제어에 사용. 챗봇 1024, 짧은 요약 256 등 작업별로 조정.',
    },
    {
      no: 37,
      question: 'LLM 비용 절감을 위한 캐싱 전략으로 가장 효과적인 것은?',
      options: [
        '모든 응답 캐싱',
        '자주 묻는 질문 상위 N개만 캐싱 (key=user message)',
        '캐싱 불가',
        '응답 길이 줄이기',
      ],
      answer: 1,
      explanation: 'FAQ는 동일 질문이 반복되므로 캐싱 효과 큼. 사용자 입력을 key로 메모리·Redis·DB에 저장. TTL 1시간~24시간으로 갱신. 비용 30~50% 절감 가능.',
    },
    {
      no: 38,
      question: 'LLM 폴백(Fallback) 패턴의 표준 구조는?',
      options: [
        '항상 한 모델만 사용',
        '1순위 모델 실패 시 2순위 → 최종 정적 응답',
        '랜덤하게 모델 선택',
        '여러 모델 동시 호출 후 다수결',
      ],
      answer: 1,
      explanation: '운영 안정성을 위해 try { Solar } catch { try { HyperCLOVA } catch { 정적 응답 } } 패턴으로 3중 안전망 구축. 사용자는 항상 응답을 받음.',
    },
    {
      no: 39,
      question: 'LLM 호출 비용 계산식으로 옳은 것은?',
      options: [
        '응답 토큰 × 단가',
        '(입력 토큰 × 입력 단가 + 출력 토큰 × 출력 단가) / 1000',
        '월 정액',
        '요청 횟수만으로 결정',
      ],
      answer: 1,
      explanation: '입력·출력 토큰이 각각 다른 단가로 과금됩니다. 출력이 보통 3배 비쌉니다. system 프롬프트는 매번 입력되므로 누적 비용 주의.',
    },
    {
      no: 40,
      question: '사용자 스토리 INVEST 원칙 중 S가 의미하는 것은?',
      options: ['Smart', 'Small (작은 단위로 1~2일 안에 구현 가능)', 'System', 'Secure'],
      answer: 1,
      explanation: 'Independent·Negotiable·Valuable·Estimable·Small·Testable. Small은 1~2일 안에 완료 가능한 크기. 너무 크면 분할 필요.',
    },
    {
      no: 41,
      question: 'MoSCoW 우선순위에서 W가 의미하는 것은?',
      options: [
        'Want (원함)',
        'Won\'t (이번엔 안 함)',
        'Wait (대기)',
        'Warning (경고)',
      ],
      answer: 1,
      explanation: 'Must(필수) / Should(있으면 좋음) / Could(여유 시간) / Won\'t(이번엔 안 함). Won\'t를 명시하면 욕심 부리지 않고 MVP 범위를 지킬 수 있습니다.',
    },
    {
      no: 42,
      question: 'Crazy 8s 브레인스토밍 기법의 핵심 규칙은?',
      options: [
        '8명이 모여 8시간 토론',
        '8분 안에 1분당 1개씩 8개 솔루션 스케치',
        '8주간 진행',
        '8개 도구 사용',
      ],
      answer: 1,
      explanation: 'A4 종이를 8칸으로 접고 타이머 8분 → 1칸당 1분씩 8개 아이디어 스케치. 양 먼저(질은 나중), 침묵 + 시각화. 발산-수렴 분리의 표준 기법.',
    },
    {
      no: 43,
      question: '페르소나 작성 시 가장 중요한 원칙은?',
      options: [
        '익명·일반화 ("사용자")',
        '구체적 이름·나이·배경·좌절점·행동 패턴',
        '한 줄 요약',
        '예쁜 이미지',
      ],
      answer: 1,
      explanation: '"김민지, 28세, 1년 공백 비전공자"처럼 구체적일수록 팀이 같은 사람을 머릿속에 그릴 수 있습니다. 추상적 페르소나는 의사결정 기준이 안 됩니다.',
    },
    {
      no: 44,
      question: '와이어프레임 작성에 가장 빠르고 무료인 도구는?',
      options: [
        '종이·펜 또는 Excalidraw (excalidraw.com)',
        'Photoshop',
        'Premiere Pro',
        '없음 (디자이너 의뢰)',
      ],
      answer: 0,
      explanation: '저충실도 와이어는 종이가 가장 빠르고, 디지털은 Excalidraw가 가입 불필요로 즉시 사용 가능. 디테일이 필요하면 Figma·Whimsical로 진행.',
    },
    {
      no: 45,
      question: 'Atomic Design 5단계의 두 번째 단계는?',
      options: ['Atom', 'Molecule', 'Organism', 'Template'],
      answer: 1,
      explanation: 'Atom(버튼·입력) → Molecule(SearchBar = Input+Button) → Organism(Navbar·Card) → Template(Layout) → Page. 본 강의는 ui/feature/page 3단계로 단순화 권장.',
    },
    {
      no: 46,
      question: '디자인 토큰을 CSS 변수로 정의하는 주된 이점은?',
      options: [
        '코드 줄 수 증가',
        '일관성·다크모드·테마 변경을 한 곳에서 관리',
        '브라우저 호환성 향상',
        '폰트 자동 다운로드',
      ],
      answer: 1,
      explanation: '--primary, --space-4 등으로 추상화하면 한 줄 수정으로 전체 스타일 변경 가능. 다크모드는 [data-theme="dark"]로 오버라이드만 하면 됨.',
    },
    {
      no: 47,
      question: '비동기 데이터를 가진 컴포넌트의 4가지 상태는?',
      options: [
        '시작/진행/완료/취소',
        '로딩/에러/빈/성공',
        'A/B/C/D',
        '입력/처리/출력/저장',
      ],
      answer: 1,
      explanation: '모든 비동기 컴포넌트는 4가지 상태를 모두 처리해야 합니다. 빈 상태(empty state)는 가장 흔히 누락되는 부분 — 첫 사용자 경험에 매우 중요.',
    },
    {
      no: 48,
      question: '모바일 터치 타깃의 최소 권장 크기는?',
      options: ['24×24px', '32×32px', '44×44px (Apple HIG)', '60×60px'],
      answer: 2,
      explanation: 'Apple HIG는 44×44pt, Google Material은 48×48dp 권장. 그 이하면 손가락이 인접 요소를 잘못 누르는 빈도 증가. 폼 입력은 56px 이상 추천.',
    },
    {
      no: 49,
      question: '디자인 시안 영감을 얻기 좋은 사이트는?',
      options: [
        'YouTube',
        'Mobbin (실제 앱 UI 패턴) / Dribbble (디자이너 갤러리)',
        'Netflix',
        'Wikipedia',
      ],
      answer: 1,
      explanation: 'Mobbin은 실제 앱 스크린샷 카탈로그, Dribbble은 디자이너 작품 갤러리. Refactoring UI, Awwwards도 영감 사이트로 추천.',
    },
    {
      no: 50,
      question: '컴포넌트 분할의 가장 중요한 원칙은?',
      options: [
        '파일을 최대한 작게 (10줄 이하)',
        '단일 책임 원칙 — 한 컴포넌트는 한 역할만',
        '한 파일에 모두 작성',
        '랜덤하게 분할',
      ],
      answer: 1,
      explanation: 'Single Responsibility Principle. 한 컴포넌트가 너무 많은 일을 하면 재사용·테스트·이해가 어려움. 200줄 넘어가면 분할 검토.',
    },
];

const diagnostic: AssessmentSet = {
  type: 'diagnostic',
  title: '진단평가',
  subtitle: '사후평가 대비 자습용 오픈 문제 (50문항 · 정답·해설 공개)',
  description:
    '사후평가(총괄평가)를 보기 전에 스스로 풀어보는 자습용 평가입니다. React 심화·Supabase·AI 서비스 설계·LLM API 등 핵심 50문항을 채점 없이 정답과 해설을 바로 확인하며 학습할 수 있습니다.',
  duration: '제한 없음',
  passingScore: 0,
  mode: 'practice',
  mcq: diagnosticPool,
};

/* ════════════════════════════════════════════════════════════
 *  총괄평가 (50문항) — 정규과정 Day 1~13 종합
 * ════════════════════════════════════════════════════════════ */
const summativePool: MCQuestion[] = [
    {
      no: 1,
      question: '바이브코딩 프로젝트에서 AI 코딩 에이전트가 가장 잘 수행하는 작업이 아닌 것은?',
      options: [
        '반복적 보일러플레이트 생성',
        '컴포넌트 스캐폴딩',
        '비즈니스 도메인의 전략적 의사결정',
        '에러 메시지 기반 디버깅 제안',
      ],
      answer: 2,
      explanation: 'AI는 패턴 매칭에 강하지만 사용자 문제 정의·차별성 결정·비즈니스 우선순위 같은 전략적 판단은 인간의 역할입니다. AI는 실행, 인간은 결정.',
    },
    {
      no: 2,
      question: 'Supabase 백엔드와 React 프론트엔드를 연결할 때 반드시 환경변수로 분리해야 하는 값은?',
      options: [
        '컴포넌트 이름',
        'CSS 변수',
        'SUPABASE_URL, SUPABASE_ANON_KEY',
        '라우트 경로',
      ],
      answer: 2,
      explanation: '프로젝트 URL과 ANON_KEY는 환경(dev·staging·prod)별로 다르고 비밀로 관리해야 하므로 환경변수로 분리합니다. .env.local에 저장하고 gitignore 처리.',
    },
    {
      no: 3,
      question: 'PRD에 반드시 포함되어야 하는 항목으로 가장 거리가 먼 것은?',
      options: [
        '문제 정의 및 사용자',
        '핵심 기능 및 범위',
        '성공 지표(KPI)',
        '발표자의 사진 크기',
      ],
      answer: 3,
      explanation: 'PRD 8섹션: Problem·Target User·Solution·Key Features·Tech Stack·LLM Usage·MVP Scope·Success Metric. 사진 크기 같은 무관 정보는 포함 X.',
    },
    {
      no: 4,
      question: 'LLM 응답이 사실과 다른 정보를 만들어내는 현상의 명칭은?',
      options: ['오버피팅', '할루시네이션', '드리프트', '백프로파게이션'],
      answer: 1,
      explanation: 'Hallucination(환각)은 LLM이 통계적으로 그럴듯한 토큰을 예측할 뿐이라 발생. 코드·법률·의료 분야는 반드시 검증 필요. RAG·도구 사용으로 보완.',
    },
    {
      no: 5,
      question: 'Chrome DevTools에서 네트워크 요청·응답을 확인하는 탭은?',
      options: ['Sources', 'Console', 'Network', 'Performance'],
      answer: 2,
      explanation: 'Network 탭은 모든 HTTP 요청·응답·시간·헤더·본문을 보여줍니다. Slow 3G throttling, Preserve log 옵션이 유용. API 디버깅의 시작점.',
    },
    {
      no: 6,
      question: 'React DevTools의 주된 용도로 가장 적절한 것은?',
      options: [
        'CSS 색상 추출',
        '컴포넌트 트리·Props·State 확인',
        '데이터베이스 모니터링',
        '운영체제 자원 사용량 측정',
      ],
      answer: 1,
      explanation: 'Chrome 확장으로 설치. Components 탭에서 트리·props·state·hooks 검사, Profiler로 리렌더 원인 추적. React 디버깅 필수 도구.',
    },
    {
      no: 7,
      question: 'Lighthouse가 측정하지 않는 항목은?',
      options: ['Performance', 'Accessibility', 'SEO', '데이터베이스 인덱스 효율'],
      answer: 3,
      explanation: 'Lighthouse 4지표: Performance·Accessibility·Best Practices·SEO. DB는 별도 모니터링 도구(pg_stat 등) 필요.',
    },
    {
      no: 8,
      question: 'GitHub Pages 배포 시 `npm run build` 명령이 산출하는 결과물은?',
      options: [
        '/src 폴더 압축본',
        '/dist (또는 build) 정적 자산',
        '/node_modules 캐시',
        '/public 환경 설정 파일',
      ],
      answer: 1,
      explanation: 'Vite는 dist/, CRA는 build/. tsc 타입 체크 + Rollup 번들링 + minify + 해시 부여한 정적 자산이 출력. 이걸 gh-pages에 푸시.',
    },
    {
      no: 9,
      question: 'GitHub Pages에 정적 사이트를 배포할 때 흔히 사용하는 도구는?',
      options: ['gh-pages 패키지', 'pm2', 'docker-compose', 'kubectl'],
      answer: 0,
      explanation: 'gh-pages는 dist 폴더 내용을 gh-pages 브랜치에 force push해주는 npm 패키지. GitHub Actions 자동 배포로 발전시킬 수도 있음.',
    },
    {
      no: 10,
      question: 'GitHub Pages에서 커스텀 도메인을 설정하기 위해 저장소에 두는 파일명은?',
      options: ['domain.txt', 'CNAME', 'config.json', 'robots.txt'],
      answer: 1,
      explanation: 'public/CNAME 파일에 도메인 1줄(예: rest.dreamitbiz.com). 빌드 시 dist/CNAME으로 복사 → gh-pages가 자동 처리. DNS는 CNAME 또는 A 레코드 설정.',
    },
    {
      no: 11,
      question: 'AI 리부트 경진대회 평가 기준에서 가장 큰 가중치(30%)를 차지하는 항목은?',
      options: ['UI/UX 완성도', '발표력', '서비스의 문제 해결력', '기술 구현력'],
      answer: 2,
      explanation: '평가: 문제 해결력 30% > 국내 LLM 활용도 25% > UI/UX 20% > 기술 15% > 발표력 10%. 명확한 문제 정의가 가장 중요.',
    },
    {
      no: 12,
      question: '경진대회 출품 조건상 반드시 활용해야 하는 LLM의 분류는?',
      options: [
        '해외 클로즈드 모델만',
        '국내 LLM (Solar, HyperCLOVA X, EXAONE 등)',
        '오픈소스 이미지 모델',
        '음성 인식 모델',
      ],
      answer: 1,
      explanation: '경진대회는 국산 LLM 활용도가 평가 기준의 25%. Solar(업스테이지)·HyperCLOVA X(네이버)·EXAONE(LG) 중 하나 이상을 핵심 기능에 통합 필수.',
    },
    {
      no: 13,
      question: '팀 프로젝트의 README에 포함하기에 가장 부적절한 항목은?',
      options: [
        '프로젝트 소개와 사용 방법',
        '기술 스택과 폴더 구조',
        '배포 URL과 데모 영상',
        '팀원의 주민등록번호',
      ],
      answer: 3,
      explanation: '주민등록번호 같은 개인정보는 절대 GitHub에 노출 X. README에는 공개해도 무방한 정보만. 이메일·LinkedIn은 OK.',
    },
    {
      no: 14,
      question: 'AI 서비스 배포 후 운영 단계에서 우선적으로 모니터링해야 할 지표가 아닌 것은?',
      options: [
        'API 비용/토큰 사용량',
        '응답 지연 시간',
        '오류율',
        '담당자의 키보드 종류',
      ],
      answer: 3,
      explanation: 'LLM 서비스 운영 핵심 지표: 비용·지연·오류율·사용자 이탈률. 키보드 같은 무관 항목은 모니터링 대상 아님.',
    },
    {
      no: 15,
      question: '5~10분 발표 구성을 준비할 때 가장 권장되는 순서는?',
      options: [
        '코드 줄 단위 설명 → 인사 → 마무리',
        '문제 정의 → 솔루션 → 기술 스택 → 데모 → 향후 계획',
        '결론 → 결론 → 결론',
        '경쟁사 비방 → 자랑 → Q&A',
      ],
      answer: 1,
      explanation: '청중이 "왜 이게 중요한가"부터 이해해야 함. 문제 → 솔루션 → 어떻게 만들었나 → 실제 보여주기 → 다음 단계의 흐름이 표준.',
    },
    {
      no: 16,
      question: 'React.lazy로 코드 스플리팅을 적용할 때, 비동기 컴포넌트가 로딩되는 동안 표시할 UI를 지정하는 컴포넌트는?',
      options: ['React.Fallback', 'React.Loader', 'Suspense', 'ErrorBoundary'],
      answer: 2,
      explanation: '<Suspense fallback={<Spinner />}>로 lazy 컴포넌트를 감싸면 로딩 중 fallback이 표시됩니다. ErrorBoundary는 청크 로드 실패 등 에러 처리용.',
    },
    {
      no: 17,
      question: 'AI 리부트 경진대회 출품 시 PRD(제품 요구사항 문서)에 반드시 포함되어야 하는 항목은?',
      options: [
        '발표자 셀카 사진',
        '문제 정의 / 사용자 / 핵심 기능 / 사용 LLM / MVP 범위',
        '경쟁사 단점 분석만',
        '서버 비밀 키 목록',
      ],
      answer: 1,
      explanation: 'PRD 핵심: 문제·페르소나·솔루션·기능·LLM·MVP 범위. 평가위원이 이 5가지로 프로젝트 타당성을 평가합니다.',
    },
    {
      no: 18,
      question: 'gh-pages 패키지로 GitHub Pages에 dist 폴더를 자동 배포하는 npm 스크립트 구성으로 가장 일반적인 것은?',
      options: [
        '"deploy": "git push origin gh-pages"',
        '"deploy": "gh-pages -d dist"',
        '"deploy": "vercel deploy"',
        '"deploy": "scp -r dist server:/var/www"',
      ],
      answer: 1,
      explanation: '"deploy": "gh-pages -d dist"와 "predeploy": "npm run build" 조합. npm run deploy로 빌드+푸시 자동 진행.',
    },
    {
      no: 19,
      question: 'Supabase의 `VITE_SUPABASE_ANON_KEY`가 빌드 산출물에 노출되어도 비교적 안전한 이유는?',
      options: [
        '키가 임의로 만료되기 때문',
        'anon key는 RLS 정책에 의해 권한이 제한되어 있어 직접 데이터를 마음대로 변경할 수 없기 때문',
        'GitHub Pages가 자동으로 암호화하기 때문',
        '실제로는 키가 아니기 때문',
      ],
      answer: 1,
      explanation: 'anon key는 anonymous role 권한만 가지며, RLS 정책이 데이터 접근을 제어. RLS 없이는 모든 데이터 노출되므로 RLS 활성화가 필수.',
    },
    {
      no: 20,
      question: '발표 자료 첫 슬라이드(타이틀)에 가장 적합한 구성은?',
      options: [
        '소스코드 전체 스크린샷',
        '서비스명 + 한 줄 가치 제안(Value Proposition) + 팀명',
        '경쟁사 비방',
        '아무 내용 없는 빈 화면',
      ],
      answer: 1,
      explanation: '첫 5초가 청중 인상을 결정. 큰 글씨로 서비스명 + 부제로 가치 제안 + 하단에 팀명·발표일. 작은 글씨로 가득 채우면 안 됨.',
    },
    {
      no: 21,
      question: '바이브코딩 학습의 1주차에 흔히 발생하는 함정은?',
      options: [
        'AI를 너무 안 씀',
        'AI 응답을 무비판적으로 그대로 사용 ("이게 다 되네?")',
        '코드를 작성하지 않음',
        '문서를 너무 많이 읽음',
      ],
      answer: 1,
      explanation: '1주차 충격 → 2주차 환멸(잘못된 코드에 데임) → 3주차 균형(검수 중요성 체득) → 4주차 숙련. 검수 단계를 건너뛰면 사고로 이어집니다.',
    },
    {
      no: 22,
      question: 'AI 코드 검수에서 가장 우선적으로 확인해야 할 핵심은?',
      options: [
        '들여쓰기',
        'import한 모듈·함수가 실존하는가 + React 룰 준수',
        '주석 분량',
        '변수명 길이',
      ],
      answer: 1,
      explanation: '환각으로 인한 가짜 모듈·함수와 Hook 호출 규칙 위반이 가장 흔한 버그 원인. 동작 안 하는 코드를 검수가 잡아주는 1순위 영역.',
    },
    {
      no: 23,
      question: 'Cursor의 에이전트 모드를 여는 단축키와 용도는?',
      options: [
        'Cmd+L — 채팅',
        'Cmd+I — 다파일 자동 편집 (에이전트)',
        'Cmd+P — 파일 검색',
        'Cmd+S — 저장',
      ],
      answer: 1,
      explanation: 'Cmd/Ctrl+I 에이전트 모드는 여러 파일을 자동으로 분석·수정. 일반 채팅(Cmd+L)보다 자율적이며, 대규모 리팩토링·기능 통합에 강력.',
    },
    {
      no: 24,
      question: '웹 접근성에서 가장 기본이 되는 항목은?',
      options: [
        '많은 애니메이션',
        '시맨틱 HTML + 모든 이미지에 alt 텍스트',
        '큰 폰트만 사용',
        '단색 디자인',
      ],
      answer: 1,
      explanation: '<header>·<nav>·<main> 시맨틱 태그 사용, <img alt="">, <label for=""> 연결. 스크린리더 사용자와 SEO 모두에게 유리.',
    },
    {
      no: 25,
      question: 'CSS @media (prefers-color-scheme: dark)의 용도는?',
      options: [
        '브라우저 다크모드',
        '사용자 OS 설정의 다크모드 감지',
        '시간 기반 자동 전환',
        '서버 측 렌더링',
      ],
      answer: 1,
      explanation: '사용자 OS·브라우저 다크모드 설정을 자동 감지. localStorage와 결합해 명시적 설정 우선, 없으면 OS 설정 따르는 패턴이 일반적.',
    },
    {
      no: 26,
      question: 'Promise.all과 Promise.allSettled의 차이는?',
      options: [
        '동일',
        'all은 하나라도 실패하면 전체 reject, allSettled는 결과 모두 반환',
        'allSettled가 느리다',
        'all만 async 함수 안에서 동작',
      ],
      answer: 1,
      explanation: 'Promise.all([p1,p2,p3])은 하나 실패시 전체 reject. allSettled는 [{status:"fulfilled", value:...}, {status:"rejected", reason:...}, ...] 반환.',
    },
    {
      no: 27,
      question: 'useEffect cleanup 함수의 용도는?',
      options: [
        '아무 용도 없음',
        '구독 해제·타이머 정리·진행 중 fetch 취소 등 자원 정리',
        '에러 처리',
        '컴포넌트 리렌더',
      ],
      answer: 1,
      explanation: 'useEffect에서 return하는 함수가 cleanup. 언마운트 또는 effect 재실행 직전에 호출. setInterval·event listener·subscription 정리에 필수.',
    },
    {
      no: 28,
      question: '조건문 안에서 Hook 호출하면 발생하는 에러는?',
      options: [
        'TypeError',
        'Rendered fewer hooks than expected',
        'Hook 무시됨',
        '아무 일도 일어나지 않음',
      ],
      answer: 1,
      explanation: 'React는 Hook을 호출 순서로 추적하므로 매 렌더 동일한 순서가 필요. 조건문 안에서 호출하면 순서가 깨져 위 에러 발생. 항상 컴포넌트 최상단에서 호출.',
    },
    {
      no: 29,
      question: '보호된 라우트(인증 필요) 표준 패턴의 이름은?',
      options: ['Gateway', 'AuthGuard 또는 RequireAuth', 'Sentinel', 'Sentry'],
      answer: 1,
      explanation: 'AuthGuard 또는 RequireAuth로 명명. 인증 검사 → 비로그인시 <Navigate to="/login" state={{from}} replace />. 로그인 성공시 원래 페이지로 복귀.',
    },
    {
      no: 30,
      question: 'Supabase RLS에서 일반적으로 작성하는 정책의 종류 4가지는?',
      options: [
        'CREATE/READ/UPDATE/DELETE',
        'SELECT/INSERT/UPDATE/DELETE',
        'GET/POST/PUT/DELETE',
        'GRANT/REVOKE/ALTER/DROP',
      ],
      answer: 1,
      explanation: 'SQL 표준 4가지: SELECT(조회), INSERT(생성), UPDATE(수정), DELETE(삭제). 각각 USING 또는 WITH CHECK 조건을 명시.',
    },
    {
      no: 31,
      question: 'Supabase의 service_role key를 클라이언트에 노출하면 안 되는 이유는?',
      options: [
        '키가 너무 길어서',
        'RLS를 우회하여 모든 데이터 무제한 접근 가능',
        '키가 한 번만 쓸 수 있어서',
        '아무 문제 없음',
      ],
      answer: 1,
      explanation: 'service_role은 RLS를 우회하는 관리자 키. 노출시 모든 사용자 데이터 노출·수정·삭제 가능. 반드시 서버(Edge Function)에서만 사용.',
    },
    {
      no: 32,
      question: 'LLM messages 배열에서 system 메시지의 일반적 위치는?',
      options: [
        '마지막',
        '맨 첫 번째 (1개만)',
        '여러 개 분산',
        'user 다음마다',
      ],
      answer: 1,
      explanation: 'system은 보통 첫 메시지에 1개. 모델의 페르소나·제약을 전체 대화에 일관 적용. 도중에 변경하면 컨텍스트 혼란 가능.',
    },
    {
      no: 33,
      question: 'LLM 스트리밍 응답 구현 시 사용하는 Web API는?',
      options: [
        'XMLHttpRequest 동기 모드',
        'fetch + ReadableStream (Server-Sent Events 파싱)',
        'WebSocket only',
        'navigator.send',
      ],
      answer: 1,
      explanation: 'fetch로 stream:true 요청 → res.body.getReader()로 ReadableStream 읽기 → "data: " 줄 파싱 → JSON 추출. WebSocket은 양방향 통신에 더 적합.',
    },
    {
      no: 34,
      question: 'LLM 비용 절감에 가장 효과적인 3가지 조합은?',
      options: [
        '한 가지 모델만 사용',
        '캐싱 + 짧은 system 프롬프트 + max_tokens 제한',
        '응답 무한 길이',
        '모든 호출에 stream',
      ],
      answer: 1,
      explanation: '캐싱(50%↓) + 시스템 프롬프트 축약(누적 비용↓) + max_tokens(출력 비용 상한). 라우팅(Mini 모델로 분류, Pro로 생성)도 효과적.',
    },
    {
      no: 35,
      question: 'MoSCoW의 Won\'t 항목을 명시하는 이유는?',
      options: [
        '시간 채우기',
        '욕심 방지 + 명확한 MVP 경계 + 팀 합의',
        '평가위원에게 자랑',
        '필수 항목',
      ],
      answer: 1,
      explanation: 'Won\'t를 명시하지 않으면 "있으면 좋지 않을까?"로 범위 폭증. "결제는 이번에 안 함"처럼 명시하면 팀 모두 동일 기준 적용.',
    },
    {
      no: 36,
      question: '와이어프레임 작성 시 가장 먼저 결정해야 할 것은?',
      options: [
        '색상',
        '핵심 페이지 5개와 페이지 간 흐름(User Flow)',
        '폰트',
        '아이콘',
      ],
      answer: 1,
      explanation: '저충실도 와이어는 구조 우선. 어떤 페이지가 필요한지·어떻게 이동하는지 정의 후 각 페이지 내부 레이아웃 작업. 색·폰트는 마지막.',
    },
    {
      no: 37,
      question: '디자인 토큰 6개 카테고리에 해당하지 않는 것은?',
      options: ['Color', 'Typography', 'Spacing', 'Animation Frame Rate'],
      answer: 3,
      explanation: '표준 카테고리: Color·Typography·Spacing·Radius·Shadow·Z-index. 프레임률은 토큰이 아닌 성능 지표. transition 시간은 Animation 토큰으로 별도 분류 가능.',
    },
    {
      no: 38,
      question: '모바일에서 햄버거 메뉴를 토글하는 React 코드의 핵심은?',
      options: [
        'window.alert',
        'useState로 isOpen 토글 + className 조건부',
        'document.write',
        'XMLHttpRequest',
      ],
      answer: 1,
      explanation: 'const [isOpen, setOpen] = useState(false); <ul className={`nav-menu ${isOpen ? "open" : ""}`}>. 라우트 변경시 자동 닫기·외부 클릭·Escape 키 처리 추가.',
    },
    {
      no: 39,
      question: 'Chrome DevTools Performance 탭에서 빨간 막대(Long Task)의 의미는?',
      options: [
        '에러',
        '50ms 이상 메인 스레드 블로킹 작업 → 사용자 인터랙션 지연',
        '네트워크 빠름',
        '메모리 부족',
      ],
      answer: 1,
      explanation: '50ms 이상 작업은 사용자가 클릭·스크롤 지연을 체감. React 컴포넌트 분할, useMemo, 무거운 계산은 Web Worker로 옮기는 등으로 개선.',
    },
    {
      no: 40,
      question: 'React DevTools Profiler에서 "Why did this render?"의 가능한 답이 아닌 것은?',
      options: [
        'Hooks changed',
        'Props changed',
        'Parent re-rendered',
        '컴퓨터가 느려서',
      ],
      answer: 3,
      explanation: '진짜 원인: Hooks/Props/Context/Parent. 하드웨어와 무관. 진짜 원인 식별 후 React.memo·useMemo·useCallback으로 최적화.',
    },
    {
      no: 41,
      question: 'Lighthouse Core Web Vitals 3가지는?',
      options: [
        'CPU, RAM, GPU',
        'LCP, INP, CLS',
        'FPS, BPM, RPM',
        'TCP, UDP, HTTP',
      ],
      answer: 1,
      explanation: 'LCP(Largest Contentful Paint, <2.5s) · INP(Interaction to Next Paint, <200ms) · CLS(Cumulative Layout Shift, <0.1). Google 검색 순위에 영향.',
    },
    {
      no: 42,
      question: 'Vitest로 컴포넌트 테스트 시 클릭 이벤트를 시뮬레이션하는 API는?',
      options: [
        'click(button)',
        'fireEvent.click(element) 또는 userEvent.click(element)',
        'dispatch.click(...)',
        'simulateClick(...)',
      ],
      answer: 1,
      explanation: 'Testing Library의 fireEvent.click 또는 userEvent.click 사용. userEvent가 실제 사용자 행동에 가까운 시뮬레이션을 제공해 권장됨.',
    },
    {
      no: 43,
      question: 'Vite 빌드 시 manualChunks를 사용하는 주된 이유는?',
      options: [
        '청크 수 감소',
        'vendor 라이브러리 분리로 캐싱 효율 향상',
        '빌드 속도 단축',
        '에러 방지',
      ],
      answer: 1,
      explanation: 'react·supabase 등 잘 안 변하는 라이브러리를 별도 청크로 분리하면, 페이지 코드만 바뀌어도 라이브러리는 브라우저 캐시 유지 → 빠른 재방문.',
    },
    {
      no: 44,
      question: 'GitHub Pages의 SPA 404 트릭에서 사용하는 파일명은?',
      options: ['error.html', '404.html', 'not-found.html', 'fallback.html'],
      answer: 1,
      explanation: 'GitHub Pages가 매칭되는 파일 없을 때 자동으로 404.html을 서빙. 이 파일에 JS로 모든 경로를 index.html로 리다이렉트 + React Router가 처리하게 함.',
    },
    {
      no: 45,
      question: 'GitHub Actions로 자동 배포 설정 시 secrets에 등록해야 할 것은?',
      options: [
        '코드 자체',
        '환경변수 (SUPABASE_URL, ANON_KEY 등)',
        '커밋 메시지',
        '브랜치 이름',
      ],
      answer: 1,
      explanation: 'Settings → Secrets and variables → Actions에서 환경변수 등록. workflow에서 ${{ secrets.NAME }}로 사용. 로그에도 자동 마스킹.',
    },
    {
      no: 46,
      question: '발표 시작 30초를 외워두는 이유로 가장 적절한 것은?',
      options: [
        '시간 절약',
        '첫 30초의 떨림을 극복하면 이후가 자연스러워짐',
        '청중에게 잘 보이기 위해',
        '필수 규정',
      ],
      answer: 1,
      explanation: '발표 떨림의 90%는 첫 30초. 외워두면 자동으로 흘러가고, 그 사이 호흡·청중 눈맞춤 정리. 이후는 슬라이드 따라 자연스럽게.',
    },
    {
      no: 47,
      question: '라이브 데모의 가장 강력한 안전장치는?',
      options: [
        '데모 생략',
        '미리 녹화한 백업 영상 + 핵심 GIF',
        '운명에 맡기기',
        '시간 단축',
      ],
      answer: 1,
      explanation: '인터넷 끊김·서버 다운·계정 문제 등 다양한 사고. Plan A(Live) + Plan B(녹화 영상) + Plan C(GIF) + Plan D(스크린샷) 4중 안전망 권장.',
    },
    {
      no: 48,
      question: '피어 리뷰의 SBI 패턴이 의미하는 것은?',
      options: [
        'Sales-Business-Income',
        'Situation-Behavior-Impact',
        'Speed-Balance-Insight',
        'Start-Build-Iterate',
      ],
      answer: 1,
      explanation: 'S(어떤 상황에서) - B(어떤 행동을 했고) - I(어떤 영향이 있었다). 모호한 "잘했어요" 대신 구체적이고 행동 가능한 피드백 제공.',
    },
    {
      no: 49,
      question: '바이브코딩 학습 곡선의 4단계 중 3주차는?',
      options: [
        '충격',
        '환멸',
        '균형 (검수의 중요성 체득)',
        '숙련',
      ],
      answer: 2,
      explanation: '1주차 충격(만능 신화) → 2주차 환멸(실수에 데임) → 3주차 균형(검수 + 본인 판단) → 4주차 숙련(AI를 도구로). 3주차가 가장 큰 성장.',
    },
    {
      no: 50,
      question: '경진대회 출품 직전 최우선 점검 항목은?',
      options: [
        '발표 자료 디자인',
        '실제 서비스가 공개 URL에서 정상 동작 + 국내 LLM 핵심 기능 통합 + RLS 보안',
        '팀원 옷차림',
        '서류 양식',
      ],
      answer: 1,
      explanation: '평가위원은 README와 Live Demo URL을 먼저 봄. 동작 안 하면 0점. 30개 체크리스트 통과 + 8종 출품 자료 모두 준비가 표준.',
    },
];

const summative: AssessmentSet = {
  type: 'summative',
  title: '사후평가',
  subtitle: '정규과정 최종 평가 (20문항 · 100점 만점)',
  description:
    '정규과정 Day 1~13 전체(바이브코딩~배포·발표)를 종합한 최종 평가입니다. 객관식 20문항, 문항당 5점(100점 만점), 합격 기준 60점. 제출하면 자동 채점되어 성적에 반영되며 경진대회 출품 자격 판정에 활용됩니다.',
  duration: '40분',
  passingScore: 60,
  mode: 'graded',
  mcq: pick(summativePool, SUMMATIVE_SELECTION),
};

export const assessmentSets: Record<AssessmentType, AssessmentSet> = {
  prerequisite,
  diagnostic,
  summative,
};

export const assessmentList: AssessmentSet[] = [prerequisite, diagnostic, summative];
