import { useState, type ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import { coursePhases } from '../config/curriculum';

const Curriculum = (): ReactElement => {
  const { t } = useLanguage();
  const [activePhase, setActivePhase] = useState<string>('all');

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
          {/* 과정 필터 */}
          <div className="curriculum-filter">
            <button className={`filter-btn ${activePhase === 'all' ? 'active' : ''}`} onClick={() => setActivePhase('all')}>전체</button>
            {coursePhases.map(p => (
              <button key={p.id} className={`filter-btn ${activePhase === p.id ? 'active' : ''}`}
                onClick={() => setActivePhase(p.id)} style={activePhase === p.id ? { background: p.color, borderColor: p.color } : {}}>
                {p.icon} {p.name} ({p.hours}H)
              </button>
            ))}
          </div>

          {/* 과정 목록 */}
          {filteredPhases.map((phase) => (
            <div key={phase.id} className="curriculum-phase">
              <div className="phase-header" style={{ borderLeftColor: phase.color }}>
                <span className="phase-icon">{phase.icon}</span>
                <div>
                  <h3>{phase.name} <span className="phase-hours">({phase.hours}H)</span></h3>
                  <p>{phase.description}</p>
                </div>
              </div>
              <div className="phase-days">
                {phase.days.map((day) => (
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
