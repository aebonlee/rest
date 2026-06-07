/**
 * Schedule.tsx
 *
 * 역할/책임:
 *   - AI Reboot Academy LMS의 "일정표(Schedule)" 페이지 컴포넌트.
 *   - 커리큘럼 설정(coursePhases)에 정의된 모든 단계(phase)와 일자(day)를
 *     하나의 표로 펼쳐서 보여준다.
 *   - 상단에 단계별 범례(legend)를 표시하고, 본문 테이블에 일정/과정/주제/내용/시간/프로젝트를 렌더링한다.
 *
 * 주요 export:
 *   - default: Schedule (React 함수형 컴포넌트)
 *
 * 의존성:
 *   - useLanguage(): 다국어 번역 함수 t 제공 (제목/부제목 등)
 *   - SEOHead: 페이지별 메타데이터(title/path) 설정 컴포넌트
 *   - coursePhases: 단계/일자 데이터 소스 (config/curriculum)
 */
import { type ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import { coursePhases } from '../config/curriculum';

// 일정표 페이지 컴포넌트: 단계별 일정을 단일 테이블로 변환해 렌더링한다.
const Schedule = (): ReactElement => {
  // 다국어 번역 함수: t('키') 형태로 현재 언어에 맞는 문자열을 반환
  const { t } = useLanguage();

  // 모든 단계(phase)의 일자(day)를 평탄화해 단일 배열로 만든다.
  //  - flatMap: phase별 days 배열을 펼쳐 하나의 리스트로 합침
  //  - 각 day에 소속 단계의 메타 정보(phaseName/phaseColor/phaseIcon)를 주입해
  //    테이블에서 단계 배지를 표시할 수 있게 한다.
  //  - filter: '사전학습' 일자는 정규 일정표에서 제외(엣지케이스 처리)
  const allDays = coursePhases.flatMap(phase =>
    phase.days.map(day => ({ ...day, phaseName: phase.name, phaseColor: phase.color, phaseIcon: phase.icon }))
  ).filter(d => d.date !== '사전학습');

  return (
    <>
      {/* 페이지 SEO 메타데이터 설정(브라우저 탭 제목 및 경로) */}
      <SEOHead title="일정표" path="/schedule" />

      {/* 페이지 상단 헤더: 번역된 제목/부제목 표시 */}
      <section className="page-header">
        <div className="container">
          <h2>{t('site.schedule.title')}</h2>
          <p>{t('site.schedule.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 단계 범례: 각 단계의 색상 점(dot)과 아이콘+이름을 나열 */}
          <div className="schedule-legend">
            {coursePhases.map(p => (
              <div key={p.id} className="legend-item">
                {/* 인라인 style로 단계 고유 색상(p.color)을 배경에 적용 */}
                <span className="legend-dot" style={{ background: p.color }}></span>
                <span>{p.icon} {p.name}</span>
              </div>
            ))}
          </div>

          {/* 가로 스크롤 래퍼: 좁은 화면에서 테이블이 넘칠 때 스크롤 처리 */}
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
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
              <tbody>
                {/* 평탄화된 전체 일자를 한 행(tr)씩 렌더링. key는 인덱스 i 사용 */}
                {allDays.map((day, i) => (
                  <tr key={i}>
                    {/* 일정(날짜) */}
                    <td><strong>{day.date}</strong></td>
                    {/* 과정: 단계 색상을 배경으로 한 배지 + 아이콘/이름 */}
                    <td>
                      <span className="schedule-badge" style={{ background: day.phaseColor }}>
                        {day.phaseIcon} {day.phaseName}
                      </span>
                    </td>
                    {/* 주제(해당 일자의 제목) */}
                    <td><strong>{day.title}</strong></td>
                    {/* 내용: 해당 일자의 세부 토픽 목록 */}
                    <td>
                      <ul className="schedule-topics">
                        {day.topics.map((topic, j) => (
                          <li key={j}>{topic}</li>
                        ))}
                      </ul>
                    </td>
                    {/* 시간: 학습 시간(단위 H) */}
                    <td>{day.hours}H</td>
                    {/* 프로젝트: 값이 없으면 '-'로 대체 표시 */}
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

export default Schedule;
