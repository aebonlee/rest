import { type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from './SEOHead';
import type { TeamProject } from '../data/teamProjects';

/**
 * 팀 프로젝트 앱 공통 틀 — 히어로 헤더(아이콘·제목·팀원) + 본문 영역.
 * 각 Project0X 컴포넌트는 children 으로 동작하는 핵심 기능만 넣는다.
 */
interface Props {
  project: TeamProject;
  children: ReactNode;
}

const AppScaffold = ({ project, children }: Props): ReactElement => {
  return (
    <>
      <SEOHead title={project.title} path={`/projects/app/${project.id}`} noindex />
      <section className="section">
        <div className="container" style={{ maxWidth: '880px' }}>
          <Link to="/projects/apps" style={{ fontSize: '14px', color: 'var(--primary-blue, #0046C8)', textDecoration: 'none' }}>
            ← 팀 프로젝트 갤러리
          </Link>

          <div style={{
            marginTop: '14px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            borderLeft: `5px solid ${project.color}`, background: 'var(--bg-light-gray, #f8f9fa)',
            borderRadius: '12px', padding: '20px 22px',
          }}>
            <span style={{
              fontSize: '30px', width: '58px', height: '58px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '14px', background: `${project.color}1a`,
            }}>{project.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: project.color }}>PROJECT {String(project.id).padStart(2, '0')}</span>
                {project.note && <span style={{ fontSize: '11px', color: 'var(--text-secondary, #9ca3af)' }}>· {project.note}</span>}
              </div>
              <h2 style={{ margin: '4px 0 6px', fontSize: '22px', lineHeight: 1.3 }}>{project.title}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>{project.tagline}</p>
              {project.members.length > 0 && (
                <p style={{ margin: '8px 0 0', fontSize: '12.5px', color: 'var(--text-secondary, #9ca3af)' }}>
                  팀원 {project.members.join(' · ')}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '22px' }}>{children}</div>

          <p style={{ marginTop: '28px', fontSize: '12px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center' }}>
            ※ 팀 프로젝트 시작용 스캐폴드입니다. 핵심 기능이 동작하며, 여기에 이어서 기능을 확장하세요.
          </p>
        </div>
      </section>
    </>
  );
};

export default AppScaffold;
