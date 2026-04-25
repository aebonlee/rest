import { type ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import { coursePhases } from '../config/curriculum';

const Schedule = (): ReactElement => {
  const { t } = useLanguage();

  const allDays = coursePhases.flatMap(phase =>
    phase.days.map(day => ({ ...day, phaseName: phase.name, phaseColor: phase.color, phaseIcon: phase.icon }))
  ).filter(d => d.date !== '사전학습');

  return (
    <>
      <SEOHead title="일정표" path="/schedule" />

      <section className="page-header">
        <div className="container">
          <h2>{t('site.schedule.title')}</h2>
          <p>{t('site.schedule.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="schedule-legend">
            {coursePhases.map(p => (
              <div key={p.id} className="legend-item">
                <span className="legend-dot" style={{ background: p.color }}></span>
                <span>{p.icon} {p.name}</span>
              </div>
            ))}
          </div>

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
                {allDays.map((day, i) => (
                  <tr key={i}>
                    <td><strong>{day.date}</strong></td>
                    <td>
                      <span className="schedule-badge" style={{ background: day.phaseColor }}>
                        {day.phaseIcon} {day.phaseName}
                      </span>
                    </td>
                    <td><strong>{day.title}</strong></td>
                    <td>
                      <ul className="schedule-topics">
                        {day.topics.map((topic, j) => (
                          <li key={j}>{topic}</li>
                        ))}
                      </ul>
                    </td>
                    <td>{day.hours}H</td>
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
