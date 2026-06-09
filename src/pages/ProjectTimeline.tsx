/**
 * ProjectTimeline.tsx — 프로젝트 일정 · 마일스톤
 *  - PROJECT_MILESTONES(주차별 4단계)를 실제 날짜와 항목별 상세 설명으로 안내한다.
 *  - 날짜를 크게 강조하고, 각 할 일에 상세 설명을 붙여 한눈에 이해하도록 한다.
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
          <p>팀구성 확정(6/9) ~ <strong>종강 6/22(월) 최종 발표</strong>까지 4단계로 진행합니다. 단계별 날짜·목표·할 일을 확인하고 <Link to="/project-checklist" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>수행 점검</Link>으로 진행 상황을 체크하세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {PROJECT_MILESTONES.map((m, i) => {
            const color = PHASE_COLOR[m.phase] || 'var(--primary-blue)';
            return (
              <div key={i} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderTop: `5px solid ${color}`, borderRadius: '14px', overflow: 'hidden', color: 'var(--text-primary)' }}>
                {/* 상단: (왼쪽) 단계 번호·이름 / (오른쪽 끝) 큰 날짜 강조 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px 12px', background: `${color}0d`, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '50%', background: color, color: '#fff', fontSize: '15px', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, padding: '2px 10px', borderRadius: '999px', background: color, color: '#fff' }}>{m.phase}</span>
                    <strong style={{ fontSize: '15px' }}>{m.title}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>· {m.week}</span>
                  </div>
                  {/* ★ 날짜 오른쪽 끝 크게 강조 */}
                  <div style={{ fontSize: '21px', fontWeight: 800, color, letterSpacing: '-0.01em', lineHeight: 1.2, marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>{m.period}</div>
                </div>

                {/* 본문: 목표 + 항목별 상세 설명 */}
                <div style={{ padding: '14px 20px 18px' }}>
                  <p style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>🎯 {m.goal}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {m.items.map((it, j) => (
                      <div key={j} style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ flexShrink: 0, fontSize: '12px', fontWeight: 800, color, marginTop: '2px' }}>{i + 1}-{j + 1}</span>
                        <div>
                          <div style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '2px' }}>{it.label}</div>
                          <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{it.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4px' }}>
            ※ 2026 AI Reboot 1기 일정 — <strong>종강 6/22(월) 최종 발표</strong>. 세부 일정 변경 시 공지를 확인하세요.
          </p>
        </div>
      </section>
    </>
  );
};

export default ProjectTimeline;
