/**
 * AdminSidebar.tsx
 *
 * ────────────────────────────────────────────────────────────────────────
 * [이 파일이 무엇인가 — 초보자용 한눈에 보기]
 *   관리자(어드민) 화면의 "왼쪽 메뉴 막대"를 그리는 React 컴포넌트입니다.
 *   대시보드 / 수강생 관리 / 자료 관리 같은 관리자 전용 페이지로 이동하는
 *   링크들을 세로로 나열하고, 지금 보고 있는 페이지의 메뉴를 강조해 줍니다.
 *
 * [왜 필요한가]
 *   관리자가 여러 페이지를 오갈 때, 매번 주소창에 URL을 직접 입력하지 않고
 *   메뉴를 클릭만 하면 되도록 "네비게이션(길안내)" 역할을 합니다.
 *   또 "지금 내가 어느 페이지에 있는지"를 색/스타일로 보여줘서 길을 잃지 않게 합니다.
 *
 * [초보자가 알아야 할 배경 용어]
 *   - 컴포넌트(Component): 화면의 한 조각을 만드는 함수. 이 함수가 JSX를 반환하면
 *                         React가 그것을 실제 화면(HTML)으로 그려 줍니다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 문법을 쓸 수 있게 해 주는 것.
 *         예) <aside>...</aside> 는 JSX이며, 결국 화면의 태그가 됩니다.
 *   - SPA(Single Page Application): 페이지를 통째로 새로 불러오지(새로고침) 않고,
 *         필요한 부분만 자바스크립트로 바꿔치기하는 방식의 웹앱. 화면 전환이 빠릅니다.
 *   - 라우팅(Routing): URL 경로(예: /admin/students)에 따라 어떤 화면을 보여줄지
 *         정하는 규칙. react-router-dom 라이브러리가 이 일을 담당합니다.
 *   - 훅(Hook): 이름이 use~ 로 시작하는 특별한 함수. 컴포넌트에 "기능"을 붙여 줍니다.
 *         (예: useLocation 은 "현재 URL 정보"라는 기능을 가져옵니다.)
 *
 * 역할:
 *   - 관리자(어드민) 화면 좌측에 고정으로 표시되는 사이드바 네비게이션 컴포넌트.
 *   - 관리자 전용 페이지들(대시보드, 수강생 관리, 자료 관리 등)로 이동하는 링크 목록을 렌더링한다.
 *
 * 핵심 책임:
 *   - adminMenuItems 배열을 순회하여 각 메뉴 링크를 생성한다.
 *   - 현재 URL 경로(useLocation)와 메뉴 경로를 비교하여 활성(active) 메뉴를 강조한다.
 *   - 하단 푸터에 일반 사이트로 돌아가는 링크를 제공한다.
 *
 * 주요 export:
 *   - default export: AdminSidebar (React 함수형 컴포넌트)
 * ────────────────────────────────────────────────────────────────────────
 */

// [import = 다른 파일/라이브러리의 기능을 가져오기]
// react-router-dom: SPA 라우팅용 라이브러리.
//   - Link: <a> 태그처럼 보이지만, 클릭해도 "페이지 전체 새로고침"이 일어나지 않고
//           SPA 방식으로 필요한 부분만 바꿔서 빠르게 화면을 이동시켜 준다.
//     주의: 라우터 안에서 페이지 이동은 일반 <a href> 대신 반드시 Link를 써야
//           SPA의 장점(빠른 전환, 상태 유지)이 유지된다.
//   - useLocation: 현재 어떤 URL(경로)에 있는지 정보를 알려주는 훅.
import { Link, useLocation } from 'react-router-dom';
// [type import = "타입"만 가져오기 — TypeScript 전용]
// ReactElement: 컴포넌트가 "화면 요소를 반환한다"는 것을 타입으로 명시할 때 쓰는 타입.
//   'import type' 으로 가져오면 실제 실행 코드에는 포함되지 않고(번들 크기 절약),
//   오직 타입 검사(컴파일 단계)에만 사용된다.
//   (TypeScript: 자바스크립트에 "이 값은 어떤 종류다"라는 타입 정보를 더해
//    실수를 미리 잡아 주는 언어. .tsx 확장자가 그 증거다.)
import type { ReactElement } from 'react';

// [메뉴 데이터를 코드와 분리해 둔 이유]
// 화면에 보여줄 메뉴를 "배열(목록 데이터)"로 따로 정의한다.
// 이렇게 데이터로 빼두면, 메뉴를 추가/삭제/순서변경할 때 JSX(화면 그리는 부분)는
// 건드리지 않고 이 배열만 고치면 되어 유지보수가 쉽다. (데이터 ↔ 화면 분리)
//
// 각 항목(객체)의 의미:
//  - path : 이동할 라우트 경로. (활성 메뉴인지 비교하는 기준값으로도 쓰임)
//  - label: 화면에 표시될 한글 메뉴명
//  - icon : 메뉴 옆에 표시할 이모지 아이콘 (그냥 글자라서 별도 이미지 파일이 필요 없음)
const adminMenuItems = [
  { path: '/admin', label: '대시보드', icon: '📊' },
  { path: '/admin/students', label: '수강생 관리', icon: '👥' },
  { path: '/admin/roster', label: '명단 대조', icon: '🧾' },
  { path: '/admin/materials', label: '자료 관리', icon: '📁' },
  { path: '/admin/assignments', label: '과제 관리', icon: '📝' },
  { path: '/admin/attendance', label: '출석 관리', icon: '✅' },
  { path: '/admin/grades', label: '학습평가 성적', icon: '🎯' },
  { path: '/admin/announcements', label: '공지사항', icon: '📢' },
  { path: '/admin/teams', label: '팀 편성', icon: '🤝' },
  { path: '/admin/projects', label: '프로젝트', icon: '🚀' },
];

/**
 * AdminSidebar
 *
 * 무엇을 하는지: 관리자 메뉴 항목들을 링크 형태로 렌더링하고, 현재 경로에 해당하는
 *               메뉴에 'active' 클래스를 부여하여 시각적으로 강조한다.
 * 왜 이렇게 하는지: 사용자가 "지금 어느 메뉴에 있는지"를 한눈에 알 수 있어야
 *               길을 잃지 않기 때문. 강조는 CSS 클래스('active')로 처리한다.
 * 매개변수: 없음 (props 미사용 — 부모로부터 받는 값이 없다)
 * 반환값: ReactElement — 사이드바 전체를 감싸는 <aside> 엘리먼트
 * 부수효과: 없음 (데이터를 바꾸거나 서버를 호출하지 않는 "순수 렌더링" 컴포넌트)
 *
 * 참고: 함수형 컴포넌트는 그냥 "JSX를 돌려주는 함수"다. 이름은 반드시 대문자로
 *       시작해야 React가 일반 함수가 아닌 "컴포넌트"로 인식한다.
 */
const AdminSidebar = (): ReactElement => {
  // [useLocation 훅] 현재 활성화된 라우트(URL) 정보를 객체로 가져온다.
  // 반환된 location 객체 안의 location.pathname(예: "/admin/students")을
  // 아래에서 각 메뉴의 path와 비교해 "지금 이 메뉴가 켜진 상태인가?"를 판단한다.
  // 주의: 훅(useLocation 등)은 컴포넌트 함수의 "맨 위"에서만 호출해야 한다.
  //       if문/반복문/중첩함수 안에서 호출하면 React 규칙 위반으로 오류가 난다.
  const location = useLocation();

  // [return 안의 내용이 곧 화면이 된다] 아래 JSX가 실제 HTML로 그려진다.
  return (
    // <aside>: "본문 곁가지 영역"을 뜻하는 시맨틱(의미를 가진) HTML 태그.
    // className: HTML의 class와 같다. (JSX에서는 class가 예약어라서 className으로 쓴다)
    //            이 이름으로 CSS에서 스타일을 입힌다.
    <aside className="admin-sidebar">
      {/* 사이드바 상단 헤더: 영역 제목 표시 */}
      <div className="admin-sidebar-header">
        <h3>관리자 메뉴</h3>
      </div>
      {/* 메뉴 네비게이션 영역: adminMenuItems를 순회하며 링크 목록을 자동 생성 */}
      <nav className="admin-sidebar-nav">
        {/*
          [배열.map()으로 목록 그리기 — React의 핵심 패턴]
          map은 배열의 각 항목(item)을 다른 형태로 "1:1 변환"해 새 배열을 만든다.
          여기서는 각 메뉴 데이터(item)를 <Link> JSX로 변환한다.
          => 데이터가 10개면 <Link>도 10개가 만들어져 화면에 나열된다.
          (반복문을 직접 쓰지 않고 map을 쓰는 이유: JSX 안에서는 표현식만 넣을 수 있어
           for문 대신 "값을 돌려주는" map이 자연스럽기 때문)
        */}
        {adminMenuItems.map((item) => (
          <Link
            // [key] 목록의 각 항목을 React가 구분하기 위한 "고유 이름표".
            // React는 key로 어떤 항목이 추가/삭제/변경됐는지 빠르게 알아내 화면을
            // 효율적으로 다시 그린다. path는 메뉴마다 유일하므로 key로 적합하다.
            // 주의: key는 형제 항목들 사이에서 중복되면 안 된다. (index 사용은 가급적 피한다)
            key={item.path}
            // to: Link가 이동할 목적지 경로. (일반 <a>의 href에 해당)
            to={item.path}
            // [활성 메뉴 강조 로직 — 한 줄씩 풀어보기]
            // className 값으로 "템플릿 리터럴"(백틱 `` 문자열)을 사용한다.
            //   템플릿 리터럴: ${ } 안에 자바스크립트 값을 끼워 넣을 수 있는 문자열.
            // location.pathname === item.path
            //   → 현재 URL 경로가 이 메뉴의 경로와 "정확히 같은가?"를 비교(=== 는 엄격 비교).
            // ? 'active' : ''  → 삼항 연산자. 조건이 참이면 'active', 거짓이면 빈 문자열''.
            // 결과적으로 현재 페이지의 메뉴에만 'active' 클래스가 붙어 CSS로 강조된다.
            // 주의: '==='는 "완전 일치"라서, 예를 들어 URL이 '/admin/students/3' 처럼
            //       하위 경로일 때는 '/admin/students' 메뉴가 active로 켜지지 않는다.
            //       (부분 일치로 켜고 싶다면 startsWith 같은 다른 비교가 필요하다)
            className={`admin-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {/* 메뉴 아이콘(이모지). { } 안은 자바스크립트 값을 화면에 출력하는 구역이다. */}
            <span className="admin-sidebar-icon">{item.icon}</span>
            {/* 메뉴 텍스트 라벨 */}
            <span className="admin-sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* 사이드바 하단 푸터: 관리자 영역을 벗어나 일반 사이트 홈('/')으로 돌아가는 링크.
          이 링크는 메뉴 배열에 없는 "고정 링크"이므로 map이 아니라 직접 작성한다. */}
      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-sidebar-item">
          <span className="admin-sidebar-icon">🏠</span>
          <span className="admin-sidebar-label">사이트로 돌아가기</span>
        </Link>
      </div>
    </aside>
  );
};

// [export default] 이 파일의 "대표 결과물"로 AdminSidebar를 내보낸다.
// 다른 파일에서는 'import AdminSidebar from "..."' 형태로 이름을 자유롭게 정해
// 가져다 쓸 수 있다. (관리자 레이아웃 등에서 import하여 화면에 배치한다.)
export default AdminSidebar;
