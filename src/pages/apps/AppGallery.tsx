import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import { TEAM_PROJECTS } from '../../data/teamProjects';
import { IMPLEMENTED_APP_IDS } from './registry';

const AppGallery = (): ReactElement => {
  return (
    <>
      <SEOHead title="팀 프로젝트 앱" path="/projects/apps" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀 프로젝트 앱</h2>
          <p>AI 리부트 14개 팀이 정한 주제로 만든 실전 프로젝트입니다. 카드를 눌러 앱을 실행해 보세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {TEAM_PROJECTS.map((p) => {
              const ready = IMPLEMENTED_APP_IDS.has(p.id);
              return (
                <Link
                  key={p.id}
                  to={`/projects/app/${p.id}`}
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
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #9ca3af)' }}>
                      {p.members.join(' · ')}
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px',
                      background: ready ? '#d1fae5' : '#f1f3f5', color: ready ? '#065f46' : '#9ca3af',
                    }}>{ready ? '실행 ▶' : '준비 중'}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default AppGallery;
