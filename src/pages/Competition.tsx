/**
 * Competition.tsx
 *
 * [이 파일이 무엇인가요?]
 *   "AI 리부트 아카데미 LMS"라는 학습 관리 시스템(LMS) 안에 있는
 *   "AI 리부트 경진대회" 안내 페이지입니다.
 *   화면에 대회 개요, 참가 혜택, 사용할 수 있는 LLM 목록 같은
 *   "정해진(=정적인) 정보"를 보여 주기만 하는 페이지예요.
 *
 * [초보자를 위한 배경 용어]
 *   - 컴포넌트(Component): React에서 화면의 한 조각을 만드는 함수예요.
 *     이 함수가 JSX(아래 설명)를 돌려주면, React가 그것을 실제 화면으로 그려 줍니다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 문법을 쓸 수 있게 해 주는 것.
 *     예) <h2>제목</h2> 처럼 보이지만 사실은 자바스크립트입니다.
 *   - LMS(Learning Management System): 강의/학습을 관리하는 웹사이트.
 *   - LLM(Large Language Model): ChatGPT, Claude, Gemini, Solar 같은
 *     "대규모 언어 모델" = 글을 이해하고 생성하는 AI를 말합니다.
 *   - 다국어(i18n): 한국어/영어 등 여러 언어로 글자를 바꿔서 보여 주는 기능.
 *
 * [이 파일의 핵심 책임]
 *   - 페이지 제목/부제는 직접 글자로 쓰지 않고, useLanguage의 t() 함수를 통해
 *     "번역 키"로 가져옵니다. (언어를 바꾸면 글자도 자동으로 바뀌게 하려고)
 *   - 대회 개요/혜택/LLM 카드 등 본문을 section, div 같은 태그로 구성합니다.
 *   - SEOHead 컴포넌트로 이 페이지만의 메타데이터(브라우저 탭 제목, 주소 경로)를 넣습니다.
 *
 * [주요 export]
 *   - default: Competition 컴포넌트.
 *     라우팅(주소-페이지 연결) 설정에서 "/competition" 주소에 이 페이지를 매핑합니다.
 *
 * [참고]
 *   - 이 컴포넌트는 "순수 프레젠테이션 컴포넌트"입니다.
 *     즉, 서버에서 데이터를 불러오거나(fetch) 로그인 확인(인증) 같은 일은 하지 않고,
 *     화면을 그리기만 합니다. 그래서 useState/useEffect 같은 상태/부수효과가 없습니다.
 */

// import: 다른 파일에 있는 기능을 이 파일로 "가져오기" 하는 문장입니다.

// type ReactElement: "React가 그릴 수 있는 화면 요소"를 뜻하는 타입(자료형 이름).
//   - 여기서 'type' 키워드는 "이건 값이 아니라 타입만 가져온다"는 표시예요(TypeScript 문법).
//   - 컴포넌트가 무엇을 반환하는지 타입으로 명시하기 위해 가져옵니다.
import { type ReactElement } from 'react';
// useLanguage: 현재 언어와 번역 함수 t를 꺼내 쓰게 해 주는 "커스텀 훅".
import { useLanguage } from '../contexts/LanguageContext';
// SEOHead: 페이지의 제목/주소 같은 메타데이터를 설정해 주는 컴포넌트.
import SEOHead from '../components/SEOHead';

/**
 * Competition
 * 경진대회 안내 페이지를 그리는 "함수형 컴포넌트"입니다.
 *
 * [무엇을 하나요?]
 *   화면에 보여 줄 JSX(헤더 + 대회 정보 섹션들)를 만들어서 돌려줍니다.
 *
 * [왜 이렇게 하나요?]
 *   React에서는 화면을 "컴포넌트 함수가 JSX를 반환하는 방식"으로 만듭니다.
 *   함수가 호출될 때마다 최신 데이터(여기서는 번역 글자)로 화면을 다시 계산해요.
 *
 * @returns {ReactElement} 페이지 헤더와 대회 정보 섹션을 담은 화면 요소.
 * @sideeffect 없음 (화면을 그리는 것 외에 외부 상태를 바꾸거나 통신하지 않음).
 */
const Competition = (): ReactElement => {
  // [훅(Hook)이란?] use로 시작하는 특별한 함수로, 컴포넌트에 기능을 "꽂아" 줍니다.
  //   주의: 훅은 컴포넌트 함수의 "맨 위"에서, 조건문/반복문 없이 호출해야 합니다(React 규칙).
  //
  // useLanguage()가 돌려주는 객체에서 t만 꺼내 옵니다(이걸 '구조 분해 할당'이라고 해요).
  //   - t는 "번역 키를 넣으면 현재 언어에 맞는 글자를 돌려주는 함수"입니다.
  //   - 이 훅을 쓰면 언어 컨텍스트를 "구독"하게 되어, 언어가 바뀌면
  //     이 컴포넌트가 자동으로 다시 그려져서(리렌더) 글자도 함께 바뀝니다.
  const { t } = useLanguage();

  // return 안에 화면에 그릴 JSX를 적습니다.
  return (
    // <> ... </> 는 "Fragment(프래그먼트)"입니다.
    //   - JSX는 반드시 하나의 부모로 감싸야 하는데, 의미 없는 <div>를 추가로 만들기 싫을 때
    //     빈 태그 <></>로 묶어 줍니다. 실제 화면(HTML)에는 아무 요소도 추가되지 않아요.
    <>
      {/* JSX 안에서 주석은 이렇게 중괄호+슬래시별표 형태로 씁니다. */}
      {/* SEOHead: 이 페이지의 브라우저 탭 제목(title)과 주소 경로(path)를 설정합니다. */}
      {/* title/path 처럼 컴포넌트에 넘기는 값을 'props(속성)'라고 부릅니다. */}
      <SEOHead title="AI 리부트 경진대회" path="/competition" />

      {/* 페이지 상단 헤더 영역. className은 HTML의 class와 같은 것(CSS 스타일 연결용)입니다. */}
      {/* 주의: JSX에서는 'class'가 아니라 'className'이라고 써야 합니다(class는 JS 예약어라서). */}
      <section className="page-header">
        <div className="container">
          {/* {t('...')}: 중괄호 {} 안에는 자바스크립트 표현식을 넣을 수 있습니다. */}
          {/* 여기서는 t() 함수로 'site.competition.title' 키에 해당하는 번역 글자를 가져와 제목으로 출력. */}
          <h2>{t('site.competition.title')}</h2>
          {/* 부제도 같은 방식으로 번역 키를 통해 표시합니다. */}
          <p>{t('site.competition.subtitle')}</p>
        </div>
      </section>

      {/* 본문 섹션: 대회 개요 / 참가 혜택 / 활용 가능 LLM 카드, 이 세 묶음을 담습니다. */}
      <section className="section">
        <div className="container">
          <div className="competition-overview">
            {/* 카드 1: 대회 기본 정보(대회명/주최/주제/우대사항)를 표 형태(그리드)로 보여 줌. */}
            <div className="competition-info-card">
              <h3>📋 대회 개요</h3>
              <div className="info-grid">
                {/* info-item 하나가 "항목 이름(strong) + 값(span)" 한 쌍을 나타냅니다. */}
                <div className="info-item">
                  <strong>대회명</strong>
                  <span>AI 리부트 경진대회</span>
                </div>
                <div className="info-item">
                  <strong>주최</strong>
                  <span>과학기술정보통신부 / 정보통신산업진흥원(NIPA)</span>
                </div>
                <div className="info-item">
                  <strong>주제</strong>
                  <span>AI를 활용한 사회문제 해결 서비스 개발</span>
                </div>
                <div className="info-item">
                  <strong>우대 사항</strong>
                  {/* 국내 LLM(Solar 등)을 쓰면 심사에서 가산점(추가 점수)을 준다는 안내입니다. */}
                  <span>국내 LLM(Solar 등) 활용 가산점</span>
                </div>
              </div>
            </div>

            {/* 카드 2: 참가자가 받는 혜택을 목록(ul > li)으로 나열합니다. */}
            <div className="competition-info-card">
              <h3>🎁 참가 혜택</h3>
              {/* ul = 순서 없는 목록(점 목록), li = 목록의 각 항목. */}
              <ul className="benefit-list">
                <li>Claude 유료 플랜 1개월 제공 (6월 한 달)</li>
                <li>국내 LLM API 비용 지원 (Solar 등)</li>
                <li>전문 기술코칭 8시간 지원</li>
                <li>프로젝트 포트폴리오 완성</li>
                <li>수상 시 상금 및 인증서</li>
              </ul>
            </div>

            {/* 카드 3: 사용할 수 있는 LLM 안내. */}
            {/*   - 국내 LLM(Solar)은 가산점 대상이라 '추천' 배지를 답니다. */}
            {/*   - 나머지(ChatGPT/Gemini/Claude)는 '해외' 배지를 답니다. */}
            <div className="competition-info-card">
              <h3>🤖 활용 가능 LLM</h3>
              <div className="llm-cards">
                {/* Solar: 국내 대표 LLM. recommended 클래스가 추가되어 '추천' 배지가 강조 스타일로 표시됩니다. */}
                <div className="llm-card">
                  <h4>☀️ Solar (Upstage)</h4>
                  <p>국내 대표 LLM - 가산점 적용</p>
                  {/* className에 'recommended'를 함께 적어, 기본 배지와 다른 강조 스타일을 줍니다. */}
                  <span className="llm-badge recommended">추천</span>
                </div>
                <div className="llm-card">
                  <h4>💬 ChatGPT (OpenAI)</h4>
                  <p>범용 LLM</p>
                  <span className="llm-badge">해외</span>
                </div>
                <div className="llm-card">
                  <h4>✨ Gemini (Google)</h4>
                  <p>멀티모달 LLM</p>
                  <span className="llm-badge">해외</span>
                </div>
                <div className="llm-card">
                  <h4>🧠 Claude (Anthropic)</h4>
                  <p>안전한 AI 어시스턴트 — 유료 플랜 1개월 제공 (6월 한 달)</p>
                  <span className="llm-badge">해외</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// export default: 이 파일의 "대표 결과물"을 내보냅니다.
//   라우터(주소-페이지 연결 설정)에서 이 컴포넌트를 가져와 "/competition" 주소에 연결합니다.
export default Competition;
