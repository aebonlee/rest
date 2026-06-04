import { Suspense, type ReactElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppScaffold from '../../components/AppScaffold';
import { getTeamProject } from '../../data/teamProjects';
import { APP_COMPONENTS } from './registry';

/** /projects/app/:id — id 에 맞는 팀 앱을 렌더. 미구현이면 안내 표시. */
const ProjectApp = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const project = getTeamProject(pid);

  if (!project) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <p className="empty-message">존재하지 않는 프로젝트입니다.</p>
          <Link to="/projects/apps" className="btn btn-primary" style={{ marginTop: '16px' }}>팀 프로젝트 갤러리</Link>
        </div>
      </section>
    );
  }

  const Comp = APP_COMPONENTS[pid];
  if (!Comp) {
    return (
      <AppScaffold project={project}>
        <div style={{
          textAlign: 'center', padding: '48px 20px', borderRadius: '12px',
          border: '1px dashed var(--border-light, #e5e7eb)', background: 'var(--bg-light-gray, #f8f9fa)',
          color: 'var(--text-secondary, #6b7280)',
        }}>
          <p style={{ margin: 0, fontSize: '15px' }}>이 팀의 앱은 곧 추가될 예정입니다. 🛠️</p>
        </div>
      </AppScaffold>
    );
  }

  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>}>
      <Comp />
    </Suspense>
  );
};

export default ProjectApp;
