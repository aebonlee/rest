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
 */
import { useState, type ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import { coursePhases } from '../config/curriculum';

// Curriculum — 과정 단계/일자를 렌더하고 단계 필터를 제공하는 페이지.
const Curriculum = (): ReactElement => {
  const { t } = useLanguage();   // i18n 번역 함수
  // activePhase: 'all'이면 전체, 그 외엔 해당 단계 id만 표시.
  const [activePhase, setActivePhase] = useState<string>('all');

  // 현재 필터에 맞는 단계 목록(파생값) — 'all'이면 전체, 아니면 id 일치 항목만.
  const filteredPhases = activePhase === 'all'
    ? coursePhases
    : coursePhases.filter(p => p.id === activePhase);

  return (
    <>
      <SEOHead title="커리큘럼" path="/curriculum" />

      <section className="page-header">
        <div className="container">
          <h2>{t('site.curriculum.title')}</h2>
          <p>{t('site.curriculum.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 과정 필터 — '전체' + 단계별 버튼. 활성 버튼은 단계 색을 배경으로 강조 */}
          <div className="curriculum-filter">
            <button className={`filter-btn ${activePhase === 'all' ? 'active' : ''}`} onClick={() => setActivePhase('all')}>전체</button>
            {coursePhases.map(p => (
              <button key={p.id} className={`filter-btn ${activePhase === p.id ? 'active' : ''}`}
                onClick={() => setActivePhase(p.id)} style={activePhase === p.id ? { background: p.color, borderColor: p.color } : {}}>
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
                    <div className="day-number" style={{ background: phase.color }}>
                      Day {day.day}
                    </div>
                    <div className="day-info">
                      <div className="day-date">{day.date}</div>
                      <h4 className="day-title">{day.title}</h4>
                      <ul className="day-topics">
                        {day.topics.map((topic, i) => (
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
