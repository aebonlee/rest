import { type ReactElement } from 'react';
import SEOHead from '../../components/SEOHead';
import { TEAM_PROJECTS } from '../../data/teamProjects';

/** 각 팀의 실제 배포 앱 URL (개별 레포 GitHub Pages) */
const liveUrl = (id: number) => `https://aebonlee.github.io/project${String(id).padStart(2, '0')}/`;

const AppGallery = (): ReactElement => {
  return (
    <>
      <SEOHead title="팀 프로젝트 앱" path="/projects/apps" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀 프로젝트 앱</h2>
          <p>AI 리부트 14개 팀이 정한 주제로 만든 실전 배포 앱입니다. 카드를 누르면 새 창에서 실행됩니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {TEAM_PROJECTS.map((p) => (
              <a
                key={p.id}
                href={liveUrl(p.id)}
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
                  <span style={{ fontSize: '11px', fontWeight: 800, color: p.color }}>PROJECT {String(p.id).padStart(2, '0')}</span>
                </div>
                <strong style={{ fontSize: '15.5px', lineHeight: 1.35 }}>{p.title}</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.55, flex: 1 }}>{p.tagline}</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #9ca3af)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '64%' }}>
                    {p.members.join(' · ')}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px',
                    background: '#d1fae5', color: '#065f46',
                  }}>실행 ↗</span>
                </div>
              </a>
            ))}
          </div>

          <p style={{ marginTop: '20px', fontSize: '12.5px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center' }}>
            각 앱은 팀별 GitHub 저장소(project01~14)에서 자동 배포됩니다.
          </p>
        </div>
      </section>
    </>
  );
};

export default AppGallery;
