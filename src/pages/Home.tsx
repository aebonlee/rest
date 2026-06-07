/**
 * Home.tsx — 메인(홈) 페이지
 *
 * [이 파일은 무엇인가?]
 *  - 사용자가 사이트에 처음 들어왔을 때 보게 되는 "첫 화면(홈 페이지)"을 그리는 React 컴포넌트다.
 *  - 화면은 여러 개의 "섹션(section)"으로 나뉜다: 히어로(맨 위 큰 소개 영역) / 과정 개요 /
 *    프로젝트 산출물 / 경진대회 안내 / 교육 대상(특이사항) 섹션.
 *
 * [초보자가 알아두면 좋은 배경 용어]
 *  - 컴포넌트(Component): 화면의 한 조각을 만들어내는 "함수"다. 이 함수가 화면(JSX)을 돌려주면(return)
 *    React가 그걸 실제 HTML로 그려준다. 여기서는 Home 이라는 함수가 곧 컴포넌트다.
 *  - JSX: 자바스크립트 안에 HTML처럼 생긴 문법을 섞어 쓰는 것. <div>, <section> 같은 태그가 그것.
 *    실제로는 자바스크립트로 변환되어 실행된다. (HTML과 달리 class 대신 className 을 쓴다.)
 *  - i18n(국제화, internationalization): 화면 문구를 여러 언어로 바꿔 보여주는 기능.
 *    여기서는 t('키이름') 함수로 "키"에 해당하는 번역 문장을 가져온다.
 *  - 설정 데이터: 화면에 반복해서 보여줄 내용(과정 단계, 프로젝트 예시 등)을 코드와 분리해
 *    config 파일(curriculum)에 배열로 저장해 둔 것. 코드가 그 배열을 읽어 카드로 그린다.
 *
 * [이 파일은 "표시 전용"이다]
 *  - 데이터를 서버에서 불러오거나(useEffect/fetch) 상태를 바꾸는(useState) 로직이 없다.
 *  - 받은 데이터/번역을 화면에 보여주기만 하는, 가장 이해하기 쉬운 형태의 컴포넌트다.
 *
 * 주요 export:
 *  - default: Home (React 페이지 컴포넌트)
 */
// react-router-dom의 Link: 페이지를 "새로고침 없이" 이동시키는 링크 태그.
// 일반 <a href> 와 달리 화면 전체를 다시 불러오지 않아서 빠르다. to="/경로" 로 이동할 곳을 지정.
import { Link } from 'react-router-dom';
// useLanguage: 현재 언어 정보와 번역 함수 t 를 꺼내 쓰는 "커스텀 훅"(Context 기반).
// (훅 = use 로 시작하는 특별한 함수. 컴포넌트 안에서만 호출할 수 있다.)
import { useLanguage } from '../contexts/LanguageContext';
// SEOHead: 페이지의 <title>이나 메타 설명 등 검색엔진/공유용 정보를 넣어주는 컴포넌트.
import SEOHead from '../components/SEOHead';
// site: 사이트 이름/설명 등 전역 설정값이 담긴 객체.
import site from '../config/site';
// coursePhases(과정 단계 배열), projectExamples(프로젝트 예시 배열) — 화면에 반복 렌더할 데이터.
import { coursePhases, projectExamples } from '../config/curriculum';
// type 으로 가져오는 import: 실제 코드가 아니라 "타입(자료형) 정보"만 가져온다는 표시.
// ReactElement = 컴포넌트가 돌려주는 "화면 한 덩어리"의 타입. (TS에서 반환형을 명시하기 위함)
import type { ReactElement } from 'react';

// Home — 홈 화면 전체를 렌더하는 표시용 컴포넌트.
// (): ReactElement => { ... } 는 "매개변수 없고, ReactElement(화면)를 반환하는 화살표 함수"라는 뜻.
const Home = (): ReactElement => {
  // useLanguage()가 돌려주는 객체에서 t(번역 함수)만 꺼낸다(구조 분해 할당).
  // t('site.home.title') 처럼 키를 넣으면 현재 언어에 맞는 문장을 돌려준다.
  const { t } = useLanguage();   // i18n 번역 함수

  // 아래 return 이 "이 컴포넌트가 그릴 화면(JSX)"이다.
  // <> ... </> 는 Fragment(빈 껍데기): 불필요한 <div> 없이 여러 요소를 한 덩어리로 묶을 때 쓴다.
  // 주의: React 컴포넌트는 반드시 "하나의" 최상위 요소만 반환해야 하므로, 여러 섹션을 Fragment로 감쌌다.
  return (
    <>
      {/* SEOHead: 검색/공유용 제목·설명을 설정. 백틱(``)은 template literal — ${} 안의 값을 문자열에 끼워 넣는다. */}
      {/* 예) `${site.name} | ${site.nameKo}` → "영문이름 | 한글이름" 형태가 된다. */}
      <SEOHead title={`${site.name} | ${site.nameKo}`} description={site.description} />

      {/* Hero — 타이틀/설명/핵심 정보 카드/CTA 버튼 */}
      {/* CTA(Call To Action) = 사용자가 누르길 유도하는 버튼(예: "커리큘럼 보기"). */}
      <section className="hero">
        <div className="hero-bg-effect">
          {/* 장식용 파티클 20개 — 위치/크기/애니메이션 타이밍을 랜덤으로 부여(순수 시각 효과) */}
          <div className="particles">
            {/*
              Array.from({ length: 20 }, (_, i) => ...) 설명:
               - { length: 20 } 은 "길이가 20인 비어 있는 배열"처럼 동작한다.
               - 두 번째 인자(콜백)는 각 칸마다 호출된다. (_, i) 에서 첫 인자는 값(여기선 안 씀 → 관례상 _),
                 i 는 인덱스(0,1,2,...,19). 즉 div 20개를 만들어 배열로 돌려준다.
              JSX에서 배열을 그리면 그 안의 요소들이 차례로 화면에 나열된다.
            */}
            {Array.from({ length: 20 }, (_, i) => (
              // key: 리스트의 각 항목을 React가 구분하기 위한 고유 표식. 반복 렌더 시 필수.
              // 주의: 여기선 항목 순서가 절대 안 바뀌는 단순 장식이라 index(i)를 key로 써도 무방하다.
              //       (순서가 바뀌거나 추가/삭제되는 목록에서는 index를 key로 쓰면 버그가 날 수 있다.)
              <div key={i} className="particle" style={{
                // style={{ ... }} : JSX에서 인라인 스타일은 "객체"로 준다(바깥 {}는 JS표현식, 안쪽 {}는 객체).
                // Math.random() 은 0 이상 1 미만의 난수. 100을 곱해 0~100% 위치를 랜덤으로 만든다.
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                // 3 + (0~6) → 3px~9px 사이의 랜덤 크기. (너무 작거나 0이 되지 않게 최소 3을 더함)
                width: `${3 + Math.random() * 6}px`,
                height: `${3 + Math.random() * 6}px`,
                // 시작 지연 0~20초: 파티클마다 다른 시점에 움직이게 해 자연스럽게 보이게 함.
                animationDelay: `${Math.random() * 20}s`,
                // 한 바퀴 도는 시간 15~25초: 제각각 속도로 떠다니게 함.
                animationDuration: `${15 + Math.random() * 10}s`,
              }} />
            ))}
          </div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              {/* {t('...')} : 중괄호 안은 자바스크립트 표현식. 번역된 문장이 이 자리에 들어간다. */}
              <span className="title-line">{t('site.home.title')}</span>
              <span className="title-line"><span className="highlight">{t('site.home.subtitle')}</span></span>
            </h1>
            <p className="hero-description">{t('site.home.description')}</p>
            {/* 핵심 정보 카드: 기간/시간/방식/목표 (아래 4개는 고정 문구라 t 대신 직접 적음) */}
            <div className="hero-info-cards">
              <div className="hero-info-card">
                <span className="hero-info-icon">📅</span>
                {/* <br/> 는 줄바꿈. JSX에서는 닫는 슬래시(/)를 꼭 붙여야 한다(<br/>). */}
                <div><strong>교육 기간</strong><br/>2026.6.1 ~ 6.22</div>
              </div>
              <div className="hero-info-card">
                <span className="hero-info-icon">⏱️</span>
                <div><strong>총 교육시간</strong><br/>80H (선수20H+정규52H+코칭8H)</div>
              </div>
              <div className="hero-info-card">
                <span className="hero-info-icon">💻</span>
                <div><strong>교육 방식</strong><br/>오프라인 집중 교육</div>
              </div>
              <div className="hero-info-card">
                <span className="hero-info-icon">🏆</span>
                <div><strong>목표</strong><br/>AI 리부트 경진대회 출품</div>
              </div>
            </div>
            <div className="hero-buttons">
              {/* Link to="/curriculum" : 클릭하면 /curriculum 경로로 (새로고침 없이) 이동. */}
              <Link to="/curriculum" className="btn btn-primary">{t('site.home.viewCurriculum')}</Link>
              <Link to="/classroom" className="btn btn-secondary">{t('site.nav.classroom')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 과정 개요 — coursePhases를 카드로(단계 색을 상단 보더로) */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('site.home.courseOverview')}</h2>
            <p className="section-subtitle">{t('site.home.courseOverviewDesc')}</p>
          </div>
          <div className="course-cards">
            {/* coursePhases 배열의 각 원소(phase)를 카드(JSX)로 변환. 데이터 개수만큼 카드가 자동 생성된다. */}
            {coursePhases.map((phase) => (
              // key={phase.id} : 각 단계의 고유 id를 key로 사용(index보다 안전한 권장 방식).
              // style의 borderTopColor: 카드마다 단계 색을 윗 테두리에 입힌다.
              <div key={phase.id} className="course-card" style={{ borderTopColor: phase.color }}>
                <div className="course-card-icon">{phase.icon}</div>
                <h3 className="course-card-title">{phase.name}</h3>
                {/* phase.hours 숫자 뒤에 "시간"이 붙어 출력된다. */}
                <p className="course-card-hours">{phase.hours}시간</p>
                <p className="course-card-desc">{phase.description}</p>
                {/* phase.days 는 일자 배열. .length 로 며칠짜리 과정인지 개수를 구해 표시. */}
                <div className="course-card-days">{phase.days.length}일 과정</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 프로젝트 산출물 — 3단계 타임라인 + 프로젝트 예시 카드 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('site.home.projectOutputs')}</h2>
            <p className="section-subtitle">{t('site.home.projectOutputsDesc')}</p>
          </div>
          {/* 타임라인 3단계: 아래 세 항목은 고정 내용이라 배열 map 대신 직접 나열했다. 마커 숫자/색만 다름. */}
          <div className="project-timeline">
            <div className="timeline-item">
              <div className="timeline-marker" style={{ background: '#10B981' }}>1</div>
              <div className="timeline-content">
                <h4>개인 미니프로젝트</h4>
                <p>1~3일차 | AI 자동화 도구를 활용한 개인 프로젝트</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker" style={{ background: '#3B82F6' }}>2</div>
              <div className="timeline-content">
                <h4>팀 미니프로젝트</h4>
                <p>4~5일차 | 바이브코딩 기반 팀 협업 프로젝트</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker" style={{ background: '#0D2B5E' }}>3</div>
              <div className="timeline-content">
                <h4>실전 프로젝트</h4>
                <p>6~13일차 | AI 리부트 경진대회 출품작 개발</p>
              </div>
            </div>
          </div>
          {/* 프로젝트 예시 — 설정 데이터(projectExamples) 매핑 */}
          <div className="project-examples">
            <h3>프로젝트 예시</h3>
            <div className="example-cards">
              {projectExamples.map((ex, i) => (
                <div key={i} className="example-card">
                  <h4>{ex.title}</h4>
                  <p>{ex.description}</p>
                  <span className="example-llm">LLM: {ex.llm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI 리부트 대회 안내 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('site.home.competition')}</h2>
            <p className="section-subtitle">{t('site.home.competitionDesc')}</p>
          </div>
          <div className="competition-highlight">
            <div className="competition-card">
              <h3>AI 리부트 경진대회</h3>
              <p>국내 LLM(Solar 등)을 활용한 서비스 개발 경진대회에 출품합니다.</p>
              <ul>
                <li>국내 LLM 활용 가산점</li>
                <li>Claude 유료 플랜 1개월 제공(6월 한달)</li>
                <li>국내 LLM API 비용 지원</li>
              </ul>
              <Link to="/competition" className="btn btn-primary">대회 상세 보기</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 특이사항 — 교육 대상/지원/혜택 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('site.home.eligibility')}</h2>
          </div>
          <div className="eligibility-cards">
            <div className="eligibility-card">
              <h4>교육 대상</h4>
              <p>고용보험 미가입, 아르바이트/계약직에 비참여 중인 청년</p>
            </div>
            <div className="eligibility-card">
              <h4>AI 도구 지원</h4>
              <p>Claude 유료 플랜 1개월 제공(6월 한달) + 국내 LLM API 비용 지원</p>
            </div>
            <div className="eligibility-card">
              <h4>수료 후 혜택</h4>
              <p>AI 리부트 경진대회 출품 + 포트폴리오 완성</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// 이 컴포넌트를 다른 파일(주로 라우터 설정)에서 import 해 쓸 수 있도록 기본(default) 내보내기.
// default export는 import 시 이름을 자유롭게 붙일 수 있다(예: import Home from './pages/Home').
export default Home;
