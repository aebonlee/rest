/**
 * ProjectTimeline.tsx — 프로젝트 일정 · 마일스톤
 *  - PROJECT_MILESTONES(주차별 단계·목표·할 일)를 타임라인 카드로 안내한다.
 *  - 수행 점검(체크리스트)·평가 루브릭과 연결되는 진행 흐름을 한눈에 보여준다.
 */
import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { PROJECT_MILESTONES } from '../data/projectSchedule';

// 단계별 강조 색.
const PHASE_COLOR: Record<string, string> = { '기획': '#0046C8', '개발': '#f59e0b', '배포·공유': '#10b981', '발표': '#9333ea' };

const ProjectTimeline = (): ReactElement => {
  return (
    <>
      <SEOHead title="프로젝트 일정 · 마일스톤" path="/project-schedule" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 일정 · 마일스톤</h2>
          <p>4단계(기획 → 개발 → 배포·공유 → 발표)로 진행합니다. 각 주차의 목표와 할 일을 확인하고 <Link to="/project-checklist" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>수행 점검</Link>으로 진행 상황을 체크하세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {PROJECT_MILESTONES.map((m, i) => {
            const color = PHASE_COLOR[m.phase] || 'var(--primary-blue)';
            return (
              <div key={i} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderLeft: `5px solid ${color}`, borderRadius: '12px', padding: '16px 18px', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color }}>{m.week}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: 'var(--bg-light-gray)', color }}>{m.phase}</span>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{m.title}</h3>
                </div>
                <p style={{ margin: '6px 0 8px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>🎯 {m.goal}</p>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {m.items.map((it, j) => <li key={j} style={{ fontSize: '14px' }}>{it}</li>)}
                </ul>
              </div>
            );
          })}
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4px' }}>
            ※ 주차는 기수 일정에 맞춰 운영합니다. 구체적 날짜는 공지를 확인하세요.
          </p>
        </div>
      </section>
    </>
  );
};

export default ProjectTimeline;
