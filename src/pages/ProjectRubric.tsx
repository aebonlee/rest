/**
 * ProjectRubric.tsx — 프로젝트 평가 기준 · 루브릭
 *  - PROJECT_RUBRIC(항목·배점·설명·수준)을 표/카드로 안내한다(총 RUBRIC_TOTAL점).
 */
import { type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';
import { PROJECT_RUBRIC, RUBRIC_TOTAL } from '../data/projectRubric';

const ProjectRubric = (): ReactElement => {
  return (
    <>
      <SEOHead title="평가 기준 · 루브릭" path="/project-rubric" noindex />
      <section className="page-header">
        <div className="container">
          <h2>평가 기준 · 루브릭</h2>
          <p>팀 프로젝트는 아래 5개 항목(총 {RUBRIC_TOTAL}점)으로 평가합니다. 항목별 기준을 참고해 준비하세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PROJECT_RUBRIC.map((c) => (
            <div key={c.key} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px 18px', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{c.title}</h3>
                <span style={{ fontSize: '13px', fontWeight: 800, padding: '3px 11px', borderRadius: '999px', background: '#dbeafe', color: '#1e3a8a' }}>{c.weight}점</span>
              </div>
              <p style={{ margin: '6px 0 10px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>{c.desc}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {c.levels.map((lv, i) => (
                  <span key={i} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '8px', background: 'var(--bg-light-gray)', color: 'var(--text-secondary)' }}>{lv}</span>
                ))}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 800, color: 'var(--primary-blue)', paddingRight: '4px' }}>합계 {RUBRIC_TOTAL}점</div>
        </div>
      </section>
    </>
  );
};

export default ProjectRubric;
