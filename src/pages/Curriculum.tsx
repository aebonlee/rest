/**
 * Curriculum.tsx — 커리큘럼(과정 일정) 페이지
 *
 * 역할:
 *  - 전체 과정을 단계(phase)별로 보여주고, 단계 필터로 좁혀 볼 수 있는 페이지.
 *
 * 핵심 책임:
 *  - coursePhases(설정 데이터)를 단계 카드 + 일자(day) 카드 형태로 렌더.
 *  - 상단 필터 버튼으로 특정 단계만 보기(activePhase) 토글.
 *
 * 주요 export:
 *  - default: Curriculum (React 페이지 컴포넌트)
 *
 * ──────────────────────────────────────────────────────────────────────────
 * 처음 보는 사람을 위한 배경 설명:
 *  - 이 파일은 ".tsx" 확장자입니다. TS(TypeScript) + JSX를 합친 형식이에요.
 *    · TypeScript: 자바스크립트에 "타입(자료형)" 검사를 더한 언어. 실수를 미리 잡아줍니다.
 *    · JSX: 자바스크립트 안에서 HTML처럼 생긴 화면 구조를 적을 수 있게 해주는 문법.
 *  - "컴포넌트(component)"란 화면의 한 조각을 만들어 돌려주는 함수입니다.
 *    이 함수가 돌려주는 JSX가 곧 화면에 그려집니다.
 *  - 이 페이지는 "데이터를 받아서 화면으로 그리기만" 합니다. 서버 호출이나
 *    로그인 같은 복잡한 처리는 없고, 미리 준비된 데이터(coursePhases)를 보여줄 뿐입니다.
 *  - 용어 정리:
 *    · phase(단계): 커리큘럼을 묶는 큰 덩어리(예: 1단계 기초, 2단계 응용 …).
 *    · day(일자): 한 단계 안의 하루치 수업 내용.
 *    · 필터(filter): 보고 싶은 단계만 골라서 화면에 남기는 기능.
 * ──────────────────────────────────────────────────────────────────────────
 */
// import: 다른 파일에 있는 기능을 이 파일로 "가져와서" 쓰겠다는 선언입니다.
// - useState: React가 제공하는 "훅(hook)". 화면이 기억해야 하는 값(상태)을 다룰 때 씁니다.
//   훅(hook)이란? 컴포넌트 함수 안에서만 쓰는 특별한 함수로, 이름이 보통 use~ 로 시작합니다.
// - type ReactElement: "이 함수는 화면 요소(JSX)를 돌려준다"는 것을 알려주는 타입 표시.
//   앞에 'type'을 붙이면 "실행 코드가 아니라 타입 정보만 가져온다"는 뜻이라 빌드 결과가 가벼워집니다.
import { useState, type ReactElement } from 'react';
// useLanguage: 우리가 직접 만든 "다국어(i18n) 기능" 훅. 현재 언어에 맞는 글자를 꺼내 줍니다.
//   (i18n = internationalization, 국제화. 한국어/영어 등 여러 언어를 지원하는 것.)
import { useLanguage } from '../contexts/LanguageContext';
// SEOHead: 페이지 제목/검색엔진용 정보(<title> 등)를 설정해 주는 우리 컴포넌트.
//   (SEO = 검색엔진 최적화. 구글 같은 곳에서 페이지가 잘 보이도록 정보를 넣는 것.)
import SEOHead from '../components/SEOHead';
// coursePhases: 커리큘럼 데이터(단계 + 일자 목록)가 담긴 배열. 화면에 그릴 "재료"입니다.
//   실제 데이터는 src/config/curriculum 파일에 있어요. 화면과 데이터를 분리해 두면
//   내용을 바꿀 때 이 파일은 건드리지 않고 데이터 파일만 고치면 되어 관리가 편합니다.
import { coursePhases } from '../config/curriculum';

// Curriculum — 과정 단계/일자를 렌더하고 단계 필터를 제공하는 페이지.
// (): ReactElement => { ... } 의 의미:
//  - (): 이 함수는 입력값(매개변수)을 받지 않는다는 뜻.
//  - : ReactElement: 이 함수가 "화면 요소(JSX)"를 돌려준다는 반환 타입 표시.
//  - => : 화살표 함수(arrow function). function 키워드 대신 쓰는 짧은 함수 작성법.
const Curriculum = (): ReactElement => {
  // useLanguage()를 호출하면 여러 도구가 담긴 객체가 돌아오는데, 그중 t(번역 함수)만 꺼내 씁니다.
  //   { t } 처럼 중괄호로 꺼내는 문법을 "구조 분해 할당(destructuring)"이라고 합니다.
  //   t('키이름')을 부르면 현재 언어에 맞는 문구를 돌려줍니다. (t = translate, 번역)
  const { t } = useLanguage();   // i18n 번역 함수
  // activePhase: 'all'이면 전체, 그 외엔 해당 단계 id만 표시.
  //   useState('all') 설명:
  //   - '상태(state)'는 화면이 기억하고 있어야 하는 값입니다. 이 값이 바뀌면 화면이 다시 그려집니다.
  //   - useState('all')의 'all'은 "처음 시작할 때의 값(초기값)"입니다.
  //   - 돌아오는 배열을 [현재값, 바꾸는함수] 순서로 받습니다.
  //       · activePhase     → 지금 선택된 단계 값(처음엔 'all').
  //       · setActivePhase  → 이 값을 바꾸고 화면을 다시 그리게 하는 함수.
  //   - <string>은 "이 상태에 들어갈 값은 문자열이다"라고 알려주는 타입 표시입니다.
  //   주의: 값을 바꿀 때는 반드시 setActivePhase(...)를 써야 합니다.
  //         activePhase = '...' 처럼 직접 대입하면 화면이 다시 그려지지 않아 동작하지 않습니다.
  const [activePhase, setActivePhase] = useState<string>('all');

  // 현재 필터에 맞는 단계 목록(파생값) — 'all'이면 전체, 아니면 id 일치 항목만.
  //   '파생값(derived value)'이란? 이미 가진 값(activePhase, coursePhases)에서 계산해 낸 값입니다.
  //   이런 값은 따로 상태로 저장하지 않고, 그릴 때마다 다시 계산하는 게 더 단순하고 실수가 적습니다.
  //   아래는 '삼항 연산자(조건 ? A : B)'입니다. 조건이 참이면 A, 거짓이면 B를 고릅니다.
  //   - activePhase === 'all' 이 참 → coursePhases 전체를 그대로 사용.
  //   - 거짓 → filter(...)로 id가 선택한 단계와 같은 항목만 골라낸 새 배열을 사용.
  //   filter는 원본을 바꾸지 않고 조건을 통과한 것만 모은 '새 배열'을 돌려줍니다(불변성 유지).
  //   p => p.id === activePhase 는 "각 단계 p의 id가 선택값과 같은가?"를 검사하는 짧은 함수입니다.
  const filteredPhases = activePhase === 'all'
    ? coursePhases
    : coursePhases.filter(p => p.id === activePhase);

  // return 안에 적은 JSX가 실제로 화면에 그려질 내용입니다.
  // <> ... </>는 'Fragment(프래그먼트)'입니다. 여러 요소를 묶되, 화면에 불필요한 태그를
  //   추가로 만들지 않으려고 쓰는 "빈 껍데기"라고 생각하면 됩니다.
  //   (return은 하나의 묶음만 돌려줄 수 있어서, 여러 개를 한 번에 감쌀 때 필요합니다.)
  return (
    <>
      {/* 이 페이지의 브라우저 탭 제목과 주소(경로) 정보를 설정 */}
      <SEOHead title="커리큘럼" path="/curriculum" />

      {/* page-header: 페이지 상단 제목 영역 */}
      <section className="page-header">
        <div className="container">
          {/* {t('...')}: 중괄호 {}는 JSX 안에서 "여기 자바스크립트 값을 넣겠다"는 표시입니다. */}
          {/* 화면에 글자를 직접 적는 대신, 번역 함수가 돌려준 현재 언어의 문구를 보여줍니다. */}
          <h2>{t('site.curriculum.title')}</h2>
          <p>{t('site.curriculum.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 과정 필터 — '전체' + 단계별 버튼. 활성 버튼은 단계 색을 배경으로 강조 */}
          <div className="curriculum-filter">
            {/* className에 백틱(`)으로 만든 문자열을 넣어 조건부로 클래스를 붙입니다. */}
            {/* `filter-btn ${...}` 안의 ${...}는 '템플릿 리터럴'로, 그 안의 값을 글자에 끼워 넣습니다. */}
            {/* 지금 선택이 'all'이면 'active'를, 아니면 빈 문자열을 붙여 강조 여부를 결정합니다. */}
            {/* onClick={() => setActivePhase('all')}: 누르면 선택 단계를 'all'로 바꿔 전체 보기로. */}
            {/*   주의: onClick={setActivePhase('all')} 처럼 적으면 클릭 전에 즉시 실행돼 버립니다. */}
            {/*   그래서 () => 로 감싸 "클릭했을 때 실행할 함수"를 넘겨줍니다. */}
            <button className={`filter-btn ${activePhase === 'all' ? 'active' : ''}`} onClick={() => setActivePhase('all')}>전체</button>
            {/* coursePhases.map(...): 배열의 각 단계를 하나씩 버튼으로 변환합니다. */}
            {/*   map은 "배열의 각 요소를 다른 모양으로 바꿔 새 배열을 만드는" 메서드입니다. */}
            {/*   여기서는 각 단계(p)를 <button>로 바꿔, 단계 개수만큼 버튼을 만듭니다. */}
            {coursePhases.map(p => (
              // key={p.id}: 목록을 그릴 때 React가 각 항목을 구분하려고 요구하는 고유 식별자입니다.
              //   주의: key는 형제 항목들 사이에서 서로 겹치지 않아야 합니다. 여기선 단계 id가 고유값.
              //   key가 없으면 React가 항목 변화를 정확히 추적하지 못해 경고가 나고 버그가 생길 수 있습니다.
              <button key={p.id} className={`filter-btn ${activePhase === p.id ? 'active' : ''}`}
                // style={조건 ? {...} : {}}: 선택된 버튼에만 그 단계의 색을 인라인 스타일로 입힙니다.
                //   선택되지 않은 버튼에는 빈 객체 {}를 주어 별도 인라인 스타일을 적용하지 않습니다.
                onClick={() => setActivePhase(p.id)} style={activePhase === p.id ? { background: p.color, borderColor: p.color } : {}}>
                {/* 버튼 안 글자: 아이콘 + 단계 이름 + 시간(H). {p.hours}처럼 데이터 값을 끼워 넣습니다. */}
                {p.icon} {p.name} ({p.hours}H)
              </button>
            ))}
          </div>

          {/* 과정 목록 — 단계마다 헤더 + 일자 카드 그리드 */}
          {filteredPhases.map((phase) => (
            <div key={phase.id} className="curriculum-phase">
              {/* 단계 헤더: 좌측 보더/아이콘에 단계 색 적용 */}
              <div className="phase-header" style={{ borderLeftColor: phase.color }}>
                <span className="phase-icon">{phase.icon}</span>
                <div>
                  <h3>{phase.name} <span className="phase-hours">({phase.hours}H)</span></h3>
                  <p>{phase.description}</p>
                </div>
              </div>
              <div className="phase-days">
                {phase.days.map((day) => (
                  // key는 phase+day 조합으로 고유화(같은 day 번호가 단계별로 중복될 수 있음)
                  <div key={`${phase.id}-${day.day}`} className="day-card">
                    {/* 날짜 동그라미 배경에 단계 색을 입혀, 어느 단계의 일자인지 색으로 구분되게 함 */}
                    <div className="day-number" style={{ background: phase.color }}>
                      Day {day.day}
                    </div>
                    <div className="day-info">
                      <div className="day-date">{day.date}</div>
                      <h4 className="day-title">{day.title}</h4>
                      <ul className="day-topics">
                        {/* day.topics: 그날 배우는 주제 문자열들의 배열. 각 주제를 <li>로 그립니다. */}
                        {day.topics.map((topic, i) => (
                          // key={i}는 '배열 순번(index)'을 key로 쓴 경우입니다.
                          //   주의: 순번 key는 목록이 고정(추가/삭제/순서변경 없음)일 때만 안전합니다.
                          //   바뀌는 목록에선 엉뚱한 항목을 재사용해 버그가 날 수 있어요. 여기 주제는 안 바뀌어 안전.
                          <li key={i}>{topic}</li>
                        ))}
                      </ul>
                      {/* 프로젝트가 있는 일자만 🎯 배지 표시 */}
                      {day.project && (
                        <div className="day-project">
                          <span>🎯 {day.project}</span>
                        </div>
                      )}
                      <span className="day-hours">{day.hours}시간</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Curriculum;
