/**
 * About.tsx — 회사소개 페이지 컴포넌트
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ 처음 보는 사람을 위한 배경 설명 (먼저 읽어두면 아래 코드가 쉬워집니다) │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * ▷ 이 파일은 무엇인가?
 *   이 파일 하나가 웹사이트의 "회사소개" 화면 한 장(/about 주소로 들어왔을 때 보이는 페이지)을
 *   통째로 그려냅니다. 즉, 사용자가 브라우저에서 .../about 으로 접속하면 이 코드가 만든 화면이 뜹니다.
 *
 * ▷ 알아두면 좋은 용어 (초보자용 한 줄 정리)
 *   - React        : 화면(UI)을 "컴포넌트"라는 조각으로 나눠 만드는 자바스크립트 라이브러리.
 *   - 컴포넌트      : 화면의 한 부분(또는 한 페이지)을 그리는 "함수". 이 파일의 About() 이 그 함수다.
 *   - JSX          : 함수 안에서 HTML처럼 생긴 코드를 바로 쓰는 문법. (예: <div>...</div>)
 *                    실제로는 자바스크립트라서, 중괄호 { } 안에 값/변수/표현식을 끼워 넣을 수 있다.
 *   - TypeScript   : 자바스크립트에 "타입(자료형)"을 붙인 언어. 파일 확장자가 .tsx 인 이유다.
 *                    (.tsx = TypeScript + JSX). 타입을 미리 정하면 실수를 미리 잡아준다.
 *   - props        : 컴포넌트에 넘겨주는 "입력값". 함수의 매개변수와 비슷하다.
 *   - 라우트(route): 주소(URL)와 화면을 짝지어 놓은 것. /about → About 컴포넌트.
 *
 * ▷ 이 컴포넌트의 성격: "정적(static) 표현 컴포넌트"
 *   - 화면에 보여줄 내용이 고정되어 있고, 버튼을 눌러 값이 바뀌거나(상태) 서버에서 데이터를
 *     불러오는(네트워크) 동작이 전혀 없다. 그래서 useState/useEffect 같은 훅도, async/await 도
 *     로그인(인증)·DB 권한(RLS) 같은 로직도 이 파일엔 없다. (다른 페이지를 볼 땐 등장할 수 있다.)
 *   - 데이터는 전부 아래 두 곳에서 온다:
 *       (1) 이 파일 안에 직접 적어둔 상수 배열(REASONS, BIZ_AREAS)
 *       (2) 외부 설정 파일 site (회사 상호·대표·연락처·패밀리 사이트 등)
 *
 * [핵심 책임]
 *   - SEOHead 로 페이지 메타데이터(브라우저 탭 제목·검색엔진용 설명·주소) 설정
 *   - site 설정에서 회사 정보(company)·패밀리 사이트 등 데이터를 읽어 출력
 *   - 상수 배열(REASONS, BIZ_AREAS)을 카드 그리드로 반복(map) 렌더링
 *
 * [주요 export]
 *   - default export: About() — 회사소개 페이지를 그리는 React 함수형 컴포넌트
 *     (default export = "이 파일의 대표 한 개". import 할 때 이름을 자유롭게 붙일 수 있다.)
 *
 * [부수효과]
 *   - 없음(순수 표현 컴포넌트). 상태/네트워크/인증 로직 없이 정적 데이터만 렌더링.
 *     ("부수효과"란 화면 그리기 외에 바깥 세상을 바꾸는 일 — 예: 서버 호출, 저장 — 을 말한다.)
 */

// ── import: 이 파일에서 쓸 외부 코드를 끌어오는 부분 ──
// SEOHead: 페이지의 제목/설명/주소를 <head>에 심어주는 우리 프로젝트의 컴포넌트.
import SEOHead from '../components/SEOHead';
// Link: 페이지를 새로고침 없이 부드럽게 이동시키는 react-router의 내부 링크 컴포넌트.
//       (일반 <a> 태그는 페이지를 통째로 새로고침하지만, <Link>는 그러지 않아 더 빠르다.)
import { Link } from 'react-router-dom';
// ReactElement: "JSX로 만든 화면 조각"을 가리키는 타입. 'type'만 가져오므로 실제 실행 코드는 없다.
//               (import type ... = 타입 정보만 가져오기. 빌드 결과물엔 안 들어가서 가볍다.)
import type { ReactElement } from 'react';
import site from '../config/site'; // 사이트 전역 설정(회사 정보·패밀리 사이트 등)

// interface = TypeScript에서 "객체(데이터 묶음)의 모양"을 미리 정해두는 설계도.
//   여기서 모양을 정해두면, 이 모양과 다른 데이터를 넣었을 때 에디터가 미리 빨간 줄로 알려준다.
// "왜 강사가 직접 사이트를 만들었나" 카드 한 장의 데이터 형태
interface ReasonItem {
  emoji: string; // 카드 상단 아이콘(이모지). string = 문자열(글자) 타입.
  title: string; // 카드 제목
  desc: string;  // 카드 본문 설명
}

// 회사 사업 영역 카드 한 장의 데이터 형태 (위 ReasonItem과 모양은 같지만 의미가 달라 따로 정의)
interface BizArea {
  emoji: string; // 카드 상단 아이콘(이모지)
  title: string; // 사업 영역 제목
  desc: string;  // 사업 영역 설명
}

// const = "다시 대입하지 않는 값". 한 번 정한 뒤 바뀌지 않는 데이터에 쓴다.
//   아래 두 배열은 화면에 늘 똑같이 나오는 고정 목록이라 컴포넌트 "밖"에 둔다.
//   주의: 컴포넌트 함수 안에 두면 화면을 다시 그릴 때마다 배열이 새로 만들어진다.
//         밖에 두면 딱 한 번만 만들어져 더 효율적이다. (정적 데이터는 밖에 두는 습관!)
// ": ReasonItem[]" 는 "ReasonItem 모양의 객체들로 이루어진 배열"이라는 타입 표기. ([] = 배열)
// "왜 강사가 직접 사이트를 만들었나" 섹션에 표시할 이유 카드 목록(정적 상수)
const REASONS: ReasonItem[] = [
  {
    emoji: '🧑‍🏫',
    title: '강사가 직접 운영합니다',
    desc: '이 사이트는 외주 제작이 아닌, 본 과정의 총괄 책임교수가 직접 설계·개발·운영합니다. 교육 내용과 동일한 기술 스택(React·Supabase·국내 LLM)으로 만들어 살아 있는 교재로 기능합니다.',
  },
  {
    emoji: '📚',
    title: '과정의 교재이자 결과물',
    desc: '강의 자료·과제·평가·팀 프로젝트가 한 곳에서 흐르도록 LMS 형태로 통합했습니다. 수강생이 학습하는 동안 사이트 자체가 “바이브코딩으로 무엇을 만들 수 있는가”의 살아 있는 사례가 됩니다.',
  },
  {
    emoji: '🤝',
    title: '교육 종료 후에도 이어집니다',
    desc: '강사의 회사(DreamIT Biz)가 지속적으로 사이트를 운영합니다. 단발성 강의가 아닌, 수강 이후의 커뮤니티·후속 코칭·경진대회 출품까지 함께 갑니다.',
  },
];

// 회사 사업 영역 섹션에 표시할 카드 목록(정적 상수). 위 REASONS와 같은 이유로 컴포넌트 밖에 둔다.
const BIZ_AREAS: BizArea[] = [
  {
    emoji: '🎓',
    title: '대학·기관 위탁교육',
    desc: '한신대학교 AI·SW대학을 포함한 교육기관과 협력하여 AI·SW 정규/특강 과정을 설계하고 운영합니다.',
  },
  {
    emoji: '🏢',
    title: '기업 맞춤형 AI 교육',
    desc: '국내 LLM과 바이브코딩 도구를 활용한 사내 교육·리스킬링 프로그램을 기업 요구에 맞게 설계·진행합니다.',
  },
  {
    emoji: '🌐',
    title: '교육 플랫폼 운영',
    desc: '대학 강의·자격증·진로·연구 등 분야별 90여 개의 교육 사이트를 자체 인프라(Supabase + GitHub Pages)로 운영 중입니다.',
  },
  {
    emoji: '📝',
    title: '교재·콘텐츠 출판',
    desc: 'AI·바이브코딩·경영정보 분야의 교육 자료와 도서, 온라인 강좌를 제작·배포합니다.',
  },
];

// 아래 두 개는 "인라인 스타일(요소에 직접 붙이는 CSS)" 묶음을 미리 만들어 둔 것이다.
//   React에서 style은 문자열이 아니라 객체로 준다. 예: { color: 'red' }
//   같은 스타일을 여러 곳(표의 여러 행)에서 재사용하려고 변수로 빼두면, 한 곳만 고쳐도 전부 반영된다.
// "React.CSSProperties" = "이 객체는 CSS 속성들의 모음"이라는 타입. 오타(예: colr)를 막아준다.
// 회사 정보 표의 "라벨(좌측 항목명)" 칸 공통 인라인 스타일
const ROW_LABEL: React.CSSProperties = {
  width: '120px',
  fontWeight: 600,
  // 'var(--text-secondary, #6b7280)' = CSS 변수 사용. 정의된 테마 색이 있으면 그 값을,
  //   없으면 뒤의 기본값(#6b7280 회색)을 쓴다. 이렇게 하면 다크모드 등 테마 전환이 쉬워진다.
  color: 'var(--text-secondary, #6b7280)',
  fontSize: '15px',
  flexShrink: 0, // 0 = 가로 공간이 부족해도 이 칸은 줄어들지 않게 고정(라벨 폭 유지).
};
// 회사 정보 표의 "값(우측 내용)" 칸 공통 인라인 스타일
const ROW_VALUE: React.CSSProperties = {
  color: 'var(--text-primary, #1a1a1a)',
  fontSize: '16px',
  lineHeight: 1.6,
};

/**
 * About — 회사소개 페이지 컴포넌트
 *
 * "export default function" = 이 파일의 대표 함수로 내보낸다는 뜻. 다른 곳(라우터 설정)에서
 *   import About from './pages/About' 처럼 가져와 /about 주소에 연결한다.
 * 함수형 컴포넌트의 규칙: JSX(화면 조각)를 return 으로 돌려주면 React가 그걸 실제 화면으로 그린다.
 *
 * @returns {ReactElement} 회사소개 페이지 전체 JSX 트리(화면 한 장)
 * @사이드이펙트 없음. site 설정에서 데이터를 읽어 정적으로 렌더링만 한다.
 */
export default function About(): ReactElement {
  // c 라는 짧은 별칭에 회사 정보 묶음을 담아둔다(상호·대표·연락처 등).
  //   매번 site.company.name 처럼 길게 쓰는 대신 c.name 으로 짧게 쓰기 위함이다.
  //   주의: c는 site.company를 "가리키는" 변수일 뿐, 복사가 아니다. 하지만 여기선 읽기만 하므로 안전하다.
  const c = site.company; // 회사 기본 정보 묶음(상호·대표·연락처 등)을 짧은 별칭으로 사용

  // return 안의 JSX가 곧 화면이다. 아래부터 끝까지가 "이 페이지가 어떻게 생겼는지" 설명한다.
  return (
    // <> ... </> = "프래그먼트(Fragment)". 의미 없는 <div>로 감싸지 않고 여러 요소를 한 덩어리로 묶는 빈 껍데기.
    //   규칙: 컴포넌트는 반드시 "하나의" 최상위 요소만 돌려줘야 해서, 여러 개를 묶을 때 이걸 쓴다.
    <>
      {/* JSX 안에서는 이렇게 중괄호 안에 주석을 적는다. */}
      {/* 페이지 SEO 메타데이터(브라우저 탭 제목·검색엔진 설명·canonical 경로) 설정 */}
      {/*   props로 title/description/path를 넘기면 SEOHead가 알아서 <head> 태그에 반영해 준다. */}
      <SEOHead
        title="회사소개 | AI Reboot Academy"
        description="본 사이트는 강사의 소속 회사 드림아이티비즈(DreamIT Biz)가 운영합니다. 회사 대표인 이애본 박사가 본 과정의 총괄 책임교수로 참여하며, 강의 운영을 위해 직접 사이트를 설계·개발했습니다."
        path="/about"
      />

      {/* 페이지 상단 헤더(제목 + 한 줄 소개). className은 CSS 파일의 스타일과 연결되는 이름표다. */}
      {/* 참고: HTML의 class를 JSX에서는 className 이라고 쓴다(class가 자바스크립트 예약어라서). */}
      <section className="page-header">
        <div className="container">
          <h1>회사소개</h1>
          <p>본 사이트를 운영하는 강사의 소속 회사 · 드림아이티비즈(DreamIT Biz)</p>
        </div>
      </section>

      <section className="section" style={{ padding: '60px 0' }}>
        {/* style={{ ... }} 의 바깥 {}는 "JS 표현식 시작", 안쪽 {}는 "객체". 그래서 중괄호가 두 겹이다. */}
        <div className="container">

          {/* ───── 이 사이트에 대해 (운영 주체 명시) ───── */}
          {/* 운영 주체(회사)와 사이트의 성격(LMS)을 강조하는 안내 박스 */}
          <div style={{
            background: 'var(--bg-secondary, #f8f9fa)',
            borderLeft: '4px solid var(--primary-blue, #0046C8)', // 왼쪽에 파란 막대를 그어 강조하는 디자인
            padding: '32px 36px',
            borderRadius: '0 12px 12px 0', // 네 모서리 둥글기(좌상/우상/우하/좌하). 왼쪽 위/아래만 각지게.
            marginBottom: '56px',
            lineHeight: 1.8,
            color: 'var(--text-primary, #1a1a1a)',
          }}>
            <p style={{
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--primary-blue, #0046C8)',
              margin: '0 0 12px',
            }}>ABOUT THIS SITE</p>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary, #1a1a1a)' }}>
              본 사이트는 강사의 회사가 직접 운영합니다.
            </h2>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {/* {' '} 는 줄바꿈된 텍스트 사이의 공백을 보존하기 위한 명시적 공백 표현 */}
              {/*   주의: JSX는 코드 줄바꿈을 사이 공백으로 인식하지 않을 때가 있어, 단어가 붙어버리는 걸 막는다. */}
              <strong>AI Reboot Academy</strong>는 본 과정의 총괄 책임교수인 <strong>이애본 박사</strong>가 대표로 있는{' '}
              <strong>드림아이티비즈(DreamIT Biz)</strong>가 운영합니다. 강사가 본 과정을 진행하기 위해
              직접 기획·설계·개발한 사이트로, 강의 자료·과제·평가·팀 프로젝트가 하나의 LMS로 통합되어 있습니다.
              따라서 회사 소개는 곧 <strong>본 강의의 운영 주체와 강사의 배경</strong>을 함께 설명하는 페이지입니다.
            </p>
          </div>

          {/* ───── 강사 프로필 카드 ───── */}
          {/* 총괄 책임교수 겸 운영사 대표(이애본 박사)의 프로필 카드 */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>총괄 책임교수 / 운영사 대표</span>
          </h3>
          <div style={{
            display: 'flex',   // flex = 자식들을 가로로 나란히 배치하는 레이아웃 방식
            gap: '24px',       // 자식들 사이 간격
            padding: '32px',
            background: 'var(--bg-card, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '12px',
            marginBottom: '56px',
            flexWrap: 'wrap',  // 화면이 좁으면 자식을 다음 줄로 자동 줄바꿈(=반응형). 모바일 대응의 핵심.
          }}>
            {/* 프로필 아바타(이모지로 대체한 원형 자리표시자) */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%', // 정사각형에 50%를 주면 완전한 원이 된다.
              background: 'var(--bg-secondary, #f0f4ff)',
              display: 'flex',
              alignItems: 'center',     // 세로 가운데 정렬
              justifyContent: 'center', // 가로 가운데 정렬 (이모지를 정중앙에 둔다)
              fontSize: '64px',
              lineHeight: 1,
              flexShrink: 0, // 좁아져도 원이 찌그러지지 않게 크기 고정
            }}>
              {/* role="img" + aria-label = 화면 낭독기(시각장애인용)가 이모지를 글자로 읽게 해주는 접근성 표시 */}
              <span role="img" aria-label="이애본 박사">👩‍🏫</span>
            </div>
            {/* 프로필 텍스트 영역(이름·직함·소개·태그·상세 링크) */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              {/* flex: 1 = 남는 가로 공간을 이 영역이 모두 차지. minWidth = 너무 좁아지면 줄바꿈되도록 최소폭 지정. */}
              <h4 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary, #1a1a1a)' }}>
                이애본 (Ph.D Aebon Lee)
              </h4>
              <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
                총괄 책임교수 · DreamIT Biz 대표
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.7 }}>
                {/* <br /> = 줄바꿈 태그. JSX에서는 반드시 끝에 슬래시(/)를 붙여 <br /> 로 닫아줘야 한다. */}
                한신대학교 AI·SW대학 겸임교수 · 드림아이티비즈 대표.<br />
                대학 강의와 기업 교육 현장에서 AI·SW·경영정보 분야를 가르치며, 본 과정은 회사 대표인 강사가 직접 설계하고
                운영하는 단기 집중 트랙입니다.
              </p>
              {/* 강사 전문 분야 태그 목록을 pill(알약) 형태로 반복 렌더링 */}
              {/* .map() = 배열의 각 항목을 하나씩 꺼내 "다른 모양(여기선 JSX)"으로 바꿔 새 배열을 만드는 함수. */}
              {/*   즉 문자열 5개 → <span> 5개로 변환해 화면에 줄줄이 그린다. (반복 렌더링의 기본 패턴) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {['AI·SW 교육', '바이브코딩', '경영정보학', '인적자원관리', '에듀테크 운영'].map((tag) => (
                  // key = React가 목록의 각 항목을 구분하는 "고유 이름표". 없으면 경고가 뜬다.
                  //   여기선 태그 글자 자체가 서로 겹치지 않으므로 key={tag} 로 써도 안전하다.
                  <span key={tag} style={{
                    padding: '4px 12px',
                    background: 'var(--bg-secondary, #f0f4ff)',
                    color: 'var(--primary-blue, #0046C8)',
                    borderRadius: '999px', // 아주 큰 값을 주면 양 끝이 완전히 둥근 알약 모양이 된다.
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>{tag}</span>
                ))}
              </div>
              {/* 강사진 상세 페이지(/instructor)로 이동하는 내부 라우터 링크 */}
              {/* <Link to="...">: 새로고침 없이 앱 안에서 화면만 바꿔 이동한다(SPA 방식). */}
              <Link to="/instructor" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '15.5px',
                fontWeight: 600,
                color: 'var(--primary-blue, #0046C8)',
                textDecoration: 'none', // 밑줄 제거
              }}>
                강사진 상세 보기 →
              </Link>
            </div>
          </div>

          {/* ───── 이 사이트를 강사가 직접 만든 이유 ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>
              왜 강사가 직접 사이트를 만들었나
            </span>
          </h3>
          {/* REASONS 상수를 반응형 그리드 카드로 매핑 렌더링 */}
          <div style={{
            display: 'grid', // grid = 자식들을 격자(행·열)로 배치하는 레이아웃
            // repeat(auto-fit, minmax(260px, 1fr)) = "한 칸 최소 260px, 남으면 균등(1fr)하게 늘려
            //   화면 폭에 맞춰 열 개수를 자동 조절". 넓으면 여러 열, 좁으면 한 열 → 자동 반응형.
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}>
            {/* key 로 배열 인덱스 i 사용 — 정적·불변 목록이라 재정렬 우려 없음 */}
            {/* 주의: 인덱스를 key로 쓰는 건 "목록 순서가 절대 바뀌지 않을 때만" 안전하다. */}
            {/*   추가/삭제/정렬이 일어나는 목록에 인덱스 key를 쓰면 화면이 엉킬 수 있어 권장하지 않는다. */}
            {/*   (r, i) = 콜백의 매개변수: r은 현재 항목(객체), i는 그 항목의 순번(0,1,2...) */}
            {REASONS.map((r, i) => (
              <div key={i} style={{
                padding: '24px',
                background: 'var(--bg-card, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
              }}>
                {/* 카드 아이콘(이모지) 영역 */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'var(--bg-secondary, #f0f4ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '28px',
                  lineHeight: 1,
                  marginBottom: '14px',
                }}>
                  {/* {r.emoji}: 중괄호 안에 변수를 넣으면 그 값이 화면에 출력된다(JSX의 값 끼워넣기). */}
                  <span role="img" aria-label={r.title}>{r.emoji}</span>
                </div>
                <strong style={{ fontSize: '17px', color: 'var(--text-primary, #1a1a1a)', display: 'block', marginBottom: '8px' }}>
                  {r.title}
                </strong>
                <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.7 }}>
                  {r.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ───── 소속 회사 소개 ───── */}
          {/* 강사가 대표로 있는 회사(드림아이티비즈) 소개 박스 */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>강사의 소속 회사</span>
          </h3>
          <div style={{
            padding: '32px 36px',
            background: 'var(--bg-card, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '12px',
            marginBottom: '24px',
            lineHeight: 1.8,
          }}>
            <p style={{
              fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em',
              color: 'var(--primary-blue, #0046C8)', margin: '0 0 8px',
            }}>COMPANY</p>
            <h4 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary, #1a1a1a)' }}>
              드림아이티비즈 (DreamIT Biz)
            </h4>
            <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.8 }}>
              드림아이티비즈는 본 과정의 강사가 대표로 운영하는 <strong>에듀테크 전문 회사</strong>입니다.
              대학·기관 위탁교육과 기업 맞춤형 AI 교육을 중심으로, 자체 인프라로 90여 개의 교육 사이트를
              설계·운영합니다. 본 과정 또한 회사의 교육 운영 사례 중 하나로, 강사가 대표 자격이자
              책임교수 자격으로 동시에 참여합니다.
            </p>
          </div>

          {/* 회사 사업 영역 */}
          {/* BIZ_AREAS 상수를 반응형 그리드 카드로 매핑 렌더링 (상단 보더로 강조) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '56px',
          }}>
            {/* key 로 배열 인덱스 i 사용 — 정적·불변 목록 (위 REASONS와 동일한 패턴/주의사항) */}
            {BIZ_AREAS.map((b, i) => (
              <div key={i} style={{
                padding: '20px 22px',
                background: 'var(--bg-card, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderTop: '3px solid var(--primary-blue, #0046C8)', // 카드 위쪽만 파란 굵은 선으로 포인트
                borderRadius: '10px',
              }}>
                <div style={{ fontSize: '28px', lineHeight: 1, marginBottom: '10px' }}>
                  <span role="img" aria-label={b.title}>{b.emoji}</span>
                </div>
                <strong style={{ fontSize: '16px', color: 'var(--text-primary, #1a1a1a)', display: 'block', marginBottom: '6px' }}>
                  {b.title}
                </strong>
                <p style={{ margin: 0, fontSize: '15.5px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.65 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ───── 회사 상세 정보 + 연락처 ───── */}
          {/* 좌: 회사 기본 정보 표 / 우: 연락처 카드 (2열 반응형 그리드) */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>회사 정보 / 문의</span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}>
            {/* 회사 기본 정보 표 카드 (라벨/값 행 구조, ROW_LABEL·ROW_VALUE 스타일 재사용) */}
            <div style={{
              padding: '28px 32px',
              background: 'var(--bg-card, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: '12px',
            }}>
              <p style={{
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--primary-blue, #0046C8)', margin: '0 0 16px',
              }}>회사 정보</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '16px' }}>
                {/* flexDirection: 'column' = 자식들을 세로로 쌓는다(여러 행을 위→아래로 나열). */}
                <div style={{ display: 'flex' }}>
                  {/* 위에서 만들어 둔 공통 스타일 객체를 그대로 꽂아 재사용한다(중복 제거). */}
                  <span style={ROW_LABEL}>상호</span>
                  <span style={ROW_VALUE}>{c.name}</span>
                </div>
                <div style={{ display: 'flex' }}>
                  <span style={ROW_LABEL}>대표자</span>
                  <span style={ROW_VALUE}>{c.ceo} (본 과정 책임교수 겸직)</span>
                </div>
                <div style={{ display: 'flex' }}>
                  <span style={ROW_LABEL}>사업자번호</span>
                  <span style={ROW_VALUE}>{c.bizNumber}</span>
                </div>
                {/* 조건부 렌더링: {조건 && JSX} 패턴. */}
                {/*   조건(c.salesNumber)이 "참 같은 값(값이 있음)"이면 뒤의 JSX를 그리고, */}
                {/*   "거짓 같은 값(빈 문자열·undefined 등)"이면 아무것도 그리지 않는다. */}
                {/*   → 설정에 값이 없으면 그 행 자체가 화면에서 사라진다(엣지케이스 처리). */}
                {/* 통신판매번호는 설정에 값이 있을 때만 행을 표시(엣지케이스: 값 없음) */}
                {c.salesNumber && (
                  <div style={{ display: 'flex' }}>
                    <span style={ROW_LABEL}>통신판매번호</span>
                    <span style={ROW_VALUE}>{c.salesNumber}</span>
                  </div>
                )}
                <div style={{ display: 'flex' }}>
                  <span style={ROW_LABEL}>주소</span>
                  <span style={ROW_VALUE}>{c.address}</span>
                </div>
                {/* 운영시간도 설정에 값이 있을 때만 조건부 렌더링(위와 동일한 && 패턴) */}
                {c.businessHours && (
                  <div style={{ display: 'flex' }}>
                    <span style={ROW_LABEL}>운영시간</span>
                    <span style={ROW_VALUE}>{c.businessHours}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 연락처 카드(이메일·전화·카카오·회사 본 사이트) */}
            <div style={{
              padding: '28px 32px',
              background: 'var(--bg-card, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: '12px',
            }}>
              <p style={{
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--primary-blue, #0046C8)', margin: '0 0 16px',
              }}>연락처</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '16px' }}>
                {/* 이메일: href="mailto:..." 를 누르면 사용자의 메일 프로그램이 열린다. */}
                {/*   href={`mailto:${c.email}`} 에서 백틱(``)은 "템플릿 리터럴" — 문자열 안에 ${변수}로 값을 끼워 넣는 문법. */}
                {/*   주의: 백틱 문자열 "안쪽"에는 절대 주석을 넣지 말 것. 넣으면 그 글자가 그대로 출력돼 버린다. */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="이메일">📧</span>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>이메일 (강사 직통)</div>
                    <a href={`mailto:${c.email}`} style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      {c.email}
                    </a>
                  </div>
                </div>

                {/* 전화: href="tel:..." 를 누르면(특히 휴대폰) 전화 걸기 화면이 뜬다. */}
                {/*   .replace(/-/g, '') = 정규식으로 하이픈(-)을 "전부" 제거. */}
                {/*     /-/  = 찾을 패턴(하이픈 한 글자), 끝의 g = global(첫 번째만 말고 모두 바꿈). */}
                {/*     예: '010-1234-5678' → '01012345678'. 전화 다이얼은 숫자만 받기 때문에 이렇게 정리한다. */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="전화">📞</span>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>전화</div>
                    <a href={`tel:${c.phone.replace(/-/g, '')}`} style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      {c.phone}
                    </a>
                  </div>
                </div>

                {/* 카카오톡 ID: 설정에 값이 있을 때만 조건부 표시(앞서 본 && 패턴과 동일) */}
                {c.kakao && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="카카오톡">💬</span>
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>카카오톡 ID</div>
                      {/* @{c.kakao} : 화면에 '@' 글자 뒤에 카카오 ID 값을 이어 붙여 보여준다. */}
                      <span style={{ color: 'var(--text-primary, #1a1a1a)', fontWeight: 600 }}>@{c.kakao}</span>
                    </div>
                  </div>
                )}

                {/* 회사 본 사이트: target="_blank"로 새 탭에서 연다. */}
                {/*   rel="noopener noreferrer" = 보안 옵션. 새 탭으로 열린 외부 사이트가 자바스크립트로 */}
                {/*   원래 우리 페이지를 조작하는 "탭 탈취(tabnabbing)"를 막아준다. 외부 링크엔 꼭 붙이는 습관! */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="본 사이트">🌐</span>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>회사 본 사이트</div>
                    <a href={site.parentSite.url} target="_blank" rel="noopener noreferrer"
                       style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      www.dreamitbiz.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ───── 회사가 운영하는 다른 사이트 ───── */}
          {/* 섹션 전체를 조건부로 렌더링한다. */}
          {/*   site.familySites && site.familySites.length > 0 의 의미: */}
          {/*     1) familySites 라는 값이 "존재"하고(설정에 아예 없을 수도 있으니 먼저 확인), */}
          {/*     2) 그 배열의 길이가 1 이상(빈 배열 [] 이면 보여줄 게 없으니 통째로 숨김). */}
          {/*   주의: familySites가 undefined일 때 곧장 .length를 읽으면 에러가 난다. */}
          {/*         그래서 앞에 "존재 확인"을 먼저 두는 순서가 중요하다(왼쪽이 거짓이면 오른쪽은 평가 안 됨). */}
          {site.familySites && site.familySites.length > 0 && (
            // 여기 <>...</>도 프래그먼트. 조건이 참일 때 h3+p+그리드 "여러 요소"를 한 덩어리로 그리려는 것.
            <>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary, #1a1a1a)' }}>
                <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>
                  회사가 운영하는 다른 교육 사이트
                </span>
              </h3>
              <p style={{ fontSize: '15.5px', color: 'var(--text-secondary, #6b7280)', margin: '0 0 20px', lineHeight: 1.7 }}>
                강사의 회사가 동일한 인프라로 운영 중인 사이트 예시입니다. 본 과정도 이 운영 체계 위에서 안정적으로 진행됩니다.
              </p>
              {/* 패밀리 사이트 목록을 외부 링크 카드로 그리드 렌더링 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                marginBottom: '32px',
              }}>
                {/* 각 패밀리 사이트는 새 탭 외부 링크. noopener noreferrer 로 보안 처리(위 설명 참고) */}
                {/*   (fs, i) = fs는 사이트 한 개 정보(이름·주소), i는 순번. fs.url/fs.name을 값으로 끼워 넣는다. */}
                {site.familySites.map((fs, i) => (
                  <a key={i} href={fs.url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '16px 20px',
                    background: 'var(--bg-card, #fff)',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: 'var(--text-primary, #1a1a1a)',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}>
                    <span role="img" aria-label="link" style={{ fontSize: '18px', lineHeight: 1 }}>🔗</span>
                    <span>{fs.name}</span>
                  </a>
                ))}
              </div>
            </>
          )}

          {/* ───── 저작권 ───── */}
          {/* 페이지 하단 저작권/운영 주체 명시 영역 */}
          <div style={{
            marginTop: '40px',
            padding: '20px',
            textAlign: 'center',
            fontSize: '14.5px',
            color: 'var(--text-muted, #9ca3af)',
            borderTop: '1px solid var(--border-color, #e5e7eb)',
          }}>
            {/* {c.name}, {c.ceo} 처럼 설정값을 끼워 넣으면, 회사명/대표명이 바뀌어도 이 화면이 자동으로 따라간다. */}
            Copyright © 2025-2026 {c.name}. All Rights Reserved.<br />
            본 사이트는 {c.ceo} 대표(총괄 책임교수)가 직접 설계·운영합니다.
          </div>
        </div>
      </section>
    </>
  );
}
