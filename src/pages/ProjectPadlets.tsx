/**
 * ProjectPadlets.tsx — 팀별 패들렛 모음
 *  - 21개 팀(TEAM_PROJECTS)의 패들렛 보드(project01~21) 바로가기를 카드 그리드로 모은다.
 *  - 번호 = 보드 고정 번호 = 패들렛 project 번호(padletUrl).
 */
import { type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';
import { TEAM_PROJECTS } from '../data/teamProjects';

// 팀 번호 → 패들렛 보드 주소(2자리 0패딩). ProjectVote와 동일 규칙.
const padletUrl = (n: number) => `https://padlet.com/aebon/project${String(n).padStart(2, '0')}`;

const ProjectPadlets = (): ReactElement => {
  return (
    <>
      <SEOHead title="팀별 패들렛" path="/project-padlets" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀별 패들렛</h2>
          <p>각 팀의 패들렛 보드입니다. 진행 과정·자료·회의 내용을 팀 번호에 맞는 보드에 정리하세요. (번호 = 패들렛 project 번호)</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {TEAM_PROJECTS.map((p) => (
              <a
                key={p.id}
                href={padletUrl(p.id)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px 18px 16px',
                  borderRadius: '14px', textDecoration: 'none', color: 'var(--text-primary)',
                  border: '1px solid var(--border-light, #e5e7eb)', borderTop: `4px solid ${p.color}`,
                  background: 'var(--bg-white, #fff)', transition: 'transform 0.1s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '26px' }}>{p.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: p.color }}>{p.id}팀 · PROJECT {String(p.id).padStart(2, '0')}</span>
                </div>
                <strong style={{ fontSize: '15.5px', lineHeight: 1.35 }}>{p.title}</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.55, flex: 1 }}>{p.members.join(' · ')}</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: '#fef9c3', color: '#854d0e' }}>📌 패들렛 열기 ↗</span>
                </div>
              </a>
            ))}
          </div>
          <p style={{ marginTop: '20px', fontSize: '12.5px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center' }}>
            패들렛 보드는 padlet.com/aebon/project01~21 에 매칭됩니다.
          </p>
        </div>
      </section>
    </>
  );
};

export default ProjectPadlets;
