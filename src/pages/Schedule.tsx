/**
 * Schedule.tsx
 *
 * [이 파일이 무엇인가요?]
 *   - AI Reboot Academy LMS(학습관리시스템)의 "일정표(Schedule)" 페이지를 그려내는 화면 조각입니다.
 *   - 강의 커리큘럼은 여러 "단계(phase)"로 나뉘고, 각 단계 안에는 여러 "일자(day)"가 들어 있습니다.
 *     이 페이지는 그 모든 단계와 일자를 하나의 큰 표(table)로 펼쳐서 한눈에 보여줍니다.
 *
 * [초보자가 알아야 할 배경/용어]
 *   - React: 화면(UI)을 "컴포넌트"라는 작은 부품들로 조립해서 만드는 라이브러리입니다.
 *     컴포넌트는 결국 "화면을 그려주는 함수"라고 생각하면 됩니다.
 *   - 컴포넌트(Component): UI를 그리는 함수. 이름은 항상 대문자로 시작합니다(예: Schedule).
 *   - JSX: 자바스크립트 안에 HTML처럼 생긴 문법을 섞어 쓰는 방식입니다.
 *     예) <h2>{변수}</h2> 처럼 중괄호 {} 안에 자바스크립트 값을 넣을 수 있습니다.
 *   - TypeScript(.tsx): 자바스크립트에 "타입(자료형)"을 더한 언어입니다.
 *     예) (): ReactElement => 는 "이 함수는 화면 요소를 반환한다"는 뜻을 타입으로 명시한 것입니다.
 *   - props/데이터: 이 페이지는 사용자가 입력하는 데이터가 아니라,
 *     미리 정의된 커리큘럼 데이터(coursePhases)를 읽어서 보여주기만 하는 "읽기 전용" 화면입니다.
 *
 * [주요 export]
 *   - default: Schedule (React 함수형 컴포넌트)
 *     => 이 파일은 Schedule 컴포넌트 하나를 "기본 내보내기(default export)"합니다.
 *        그래서 다른 파일에서 import Schedule from './pages/Schedule' 처럼 가져다 쓸 수 있습니다.
 *
 * [의존성 — 이 파일이 빌려 쓰는 것들]
 *   - useLanguage(): 다국어 번역 함수 t 를 제공하는 "훅(hook)". (훅이 무엇인지는 아래에서 설명)
 *   - SEOHead: 페이지별 메타데이터(브라우저 탭 제목, 주소 경로 등)를 설정하는 컴포넌트.
 *   - coursePhases: 단계/일자 데이터의 원천(config/curriculum 파일에 정의됨).
 */

// import: 다른 파일에 정의된 기능을 이 파일로 가져옵니다.
// 'type ReactElement'에서 type 키워드는 "이건 실제 값이 아니라 타입(자료형)만 가져온다"는 뜻입니다.
// ReactElement는 "화면에 그려질 React 요소"를 가리키는 타입입니다.
import { type ReactElement } from 'react';
import { EmojiIcon } from '../utils/emojiIcon';
// 다국어(번역) 기능을 쓰기 위한 커스텀 훅을 가져옵니다.
import { useLanguage } from '../contexts/LanguageContext';
// 페이지의 SEO(검색엔진 최적화) 메타정보를 설정하는 컴포넌트를 가져옵니다.
import SEOHead from '../components/SEOHead';
// 강의 단계/일자 데이터(상수)를 가져옵니다. 이 데이터를 표로 펼쳐 보여줄 것입니다.
import { coursePhases } from '../config/curriculum';

// 일정표 페이지 컴포넌트: 단계별 일정을 단일 테이블로 변환해 렌더링한다.
// - 화살표 함수 형태로 정의한 컴포넌트입니다. 이름이 대문자(Schedule)인 점이 React 컴포넌트의 규칙입니다.
// - (): ReactElement 는 "매개변수는 없고, 화면 요소(ReactElement)를 반환한다"는 타입 표기입니다.
const Schedule = (): ReactElement => {
  // 다국어 번역 함수: t('키') 형태로 현재 언어에 맞는 문자열을 반환
  // - useLanguage()는 "훅(hook)"입니다. 훅이란 React의 기능(여기서는 언어 설정 공유)을 컴포넌트 안에서 꺼내 쓰는 함수입니다.
  // - { t } 는 "구조 분해 할당"입니다. useLanguage()가 돌려준 객체에서 t 라는 속성만 꺼내옵니다.
  //   주의: 훅은 반드시 컴포넌트 함수의 최상단(조건문/반복문 안이 아닌 곳)에서 호출해야 합니다.
  const { t } = useLanguage();

  // 모든 단계(phase)의 일자(day)를 평탄화해 단일 배열로 만든다.
  //  - flatMap: phase별 days 배열을 펼쳐 하나의 리스트로 합침
  //    (map은 [[a,b],[c,d]] 처럼 배열의 배열을 만들지만, flatMap은 [a,b,c,d]로 한 단계 펼쳐줍니다)
  //  - 각 day에 소속 단계의 메타 정보(phaseName/phaseColor/phaseIcon)를 주입해
  //    테이블에서 단계 배지를 표시할 수 있게 한다.
  //    => { ...day, ... } 의 ...day 는 "전개(spread) 문법"으로, 기존 day의 모든 속성을 그대로 복사한 뒤
  //       phaseName 등 새 속성을 덧붙입니다. (불변성: 원본 day를 바꾸지 않고 "복사본"을 새로 만드는 방식입니다.
  //       원본을 직접 수정하지 않는 것이 React에서 권장되는 안전한 방식입니다.)
  //  - filter: '사전학습' 일자는 정규 일정표에서 제외(엣지케이스 처리)
  //    => d.date !== '사전학습' 가 true인 항목만 남깁니다. (!== 는 "값이 다르다"는 비교 연산자)
  const allDays = coursePhases.flatMap(phase =>
    phase.days.map(day => ({ ...day, phaseName: phase.name, phaseColor: phase.color, phaseIcon: phase.icon }))
  ).filter(d => d.date !== '사전학습');

  // return 안에 있는 것이 바로 화면에 그려질 내용(JSX)입니다.
  return (
    // <> ... </> 는 "프래그먼트(Fragment)"입니다.
    // React 컴포넌트는 하나의 최상위 요소만 반환할 수 있는데, 불필요한 <div>를 추가하지 않고
    // 여러 요소를 묶기 위해 빈 태그(<></>)로 감쌉니다.
    <>
      {/* 페이지 SEO 메타데이터 설정(브라우저 탭 제목 및 경로) */}
      {/* SEOHead 컴포넌트에 title, path를 props(속성)로 전달합니다. props는 컴포넌트에 넘기는 입력값입니다. */}
      <SEOHead title="일정표" path="/schedule" />

      {/* 페이지 상단 헤더: 번역된 제목/부제목 표시 */}
      <section className="page-header">
        {/* 주의: HTML의 class 속성은 JSX에서 className 으로 써야 합니다(class는 JS 예약어이기 때문). */}
        <div className="container">
          {/* {t('...')} : 중괄호 안의 자바스크립트(번역 함수 호출) 결과를 화면에 출력합니다. */}
          <h2>{t('site.schedule.title')}</h2>
          <p>{t('site.schedule.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 단계 범례: 각 단계의 색상 점(dot)과 아이콘+이름을 나열 */}
          <div className="schedule-legend">
            {/* coursePhases.map(...) : 배열의 각 단계 p마다 화면 요소를 하나씩 만들어 목록으로 그립니다.
                => 배열을 화면 요소 배열로 변환하는 것이 React에서 목록을 그리는 기본 패턴입니다. */}
            {coursePhases.map(p => (
              // key: React가 목록의 각 항목을 구별하기 위해 필요한 고유 식별자입니다.
              //      key가 없으면 목록이 바뀔 때 화면을 효율적으로 갱신하지 못합니다.
              //      여기서는 단계의 고유 id(p.id)를 key로 사용합니다(가장 안정적인 선택).
              <div key={p.id} className="legend-item">
                {/* 인라인 style로 단계 고유 색상(p.color)을 배경에 적용 */}
                {/* 주의: JSX의 style은 문자열이 아니라 객체로 줍니다. 그래서 중괄호가 두 개({{ }})입니다.
                    바깥 {}는 "JS 표현식 시작", 안쪽 {}는 "객체 리터럴"을 뜻합니다. */}
                <span className="legend-dot" style={{ background: p.color }}></span>
                {/* p.icon 과 p.name 을 한 줄에 함께 표시(예: "🎯 기초 단계") */}
                <span><EmojiIcon char={p.icon} /> {p.name}</span>
              </div>
            ))}
          </div>

          {/* 가로 스크롤 래퍼: 좁은 화면에서 테이블이 넘칠 때 스크롤 처리 */}
          {/* (CSS에서 이 래퍼에 overflow 처리를 해두면, 표가 화면보다 넓어도 가로로 스크롤할 수 있습니다.) */}
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              {/* thead: 표의 머리글(컬럼 제목) 영역 */}
              <thead>
                <tr>
                  <th>일정</th>
                  <th>과정</th>
                  <th>주제</th>
                  <th>내용</th>
                  <th>시간</th>
                  <th>프로젝트</th>
                </tr>
              </thead>
              {/* tbody: 표의 본문(실제 데이터 행들) 영역 */}
              <tbody>
                {/* 평탄화된 전체 일자를 한 행(tr)씩 렌더링. key는 인덱스 i 사용 */}
                {/* map의 두 번째 인자 i 는 "현재 항목의 순서 번호(0,1,2...)"입니다.
                    주의: 인덱스를 key로 쓰는 것은 목록의 순서가 바뀌거나 항목이 추가/삭제되면 문제가 될 수 있습니다.
                    다만 이 일정표는 한 번 만들어진 뒤 순서가 바뀌지 않는 "고정 목록"이라 인덱스 key를 써도 무방합니다. */}
                {allDays.map((day, i) => (
                  <tr key={i}>
                    {/* 일정(날짜) */}
                    <td><strong>{day.date}</strong></td>
                    {/* 과정: 단계 색상을 배경으로 한 배지 + 아이콘/이름 */}
                    <td>
                      {/* day.phaseColor 등은 위 flatMap 단계에서 각 day에 주입해 둔 단계 메타 정보입니다. */}
                      <span className="schedule-badge" style={{ background: day.phaseColor }}>
                        {day.phaseIcon} {day.phaseName}
                      </span>
                    </td>
                    {/* 주제(해당 일자의 제목) */}
                    <td><strong>{day.title}</strong></td>
                    {/* 내용: 해당 일자의 세부 토픽 목록 */}
                    <td>
                      <ul className="schedule-topics">
                        {/* 한 일자(day) 안의 여러 topic을 다시 map으로 펼쳐 <li> 목록으로 그립니다.
                            (이것은 "중첩 반복": 바깥은 일자 목록, 안쪽은 그 일자의 토픽 목록) */}
                        {day.topics.map((topic, j) => (
                          // 안쪽 목록도 각자 고유 key가 필요합니다. 여기서는 토픽의 순서 번호 j를 사용합니다.
                          <li key={j}>{topic}</li>
                        ))}
                      </ul>
                    </td>
                    {/* 시간: 학습 시간(단위 H) */}
                    {/* {day.hours}H 처럼 변수 뒤에 글자(H)를 붙이면 "3H"와 같이 단위를 함께 출력합니다. */}
                    <td>{day.hours}H</td>
                    {/* 프로젝트: 값이 없으면 '-'로 대체 표시 */}
                    {/* day.project || '-' : day.project가 비어있거나(빈 문자열/undefined 등 falsy) 없으면 '-'를 대신 보여줍니다.
                        => || 는 "왼쪽 값이 falsy면 오른쪽 값을 사용"하는 연산자입니다(기본값 지정에 자주 쓰임). */}
                    <td>{day.project || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};

// 이 컴포넌트를 다른 파일(주로 라우터 설정)에서 가져다 쓸 수 있도록 기본 내보내기 합니다.
export default Schedule;
