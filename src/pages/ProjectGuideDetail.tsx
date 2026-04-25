import { type ReactElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { PROJECT_DATA, type ProjectData } from '../data/projectDetails';

const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <section className="pgd-section">
    <h2><span className="pgd-section-icon">{icon}</span> {title}</h2>
    <div className="pgd-card">{children}</div>
  </section>
);

const ProjectGuideDetail = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const project: ProjectData | undefined = PROJECT_DATA.find(p => p.id === Number(id));

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <p>프로젝트를 찾을 수 없습니다.</p>
        <Link to="/project-guide" className="btn btn-primary" style={{ marginTop: '16px' }}>목록으로</Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={project.title} path={`/project-guide/${id}`} />

      {/* Hero */}
      <section className="page-header">
        <div className="container">
          <Link to="/project-guide" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>&larr; 프로젝트 목록</Link>
          <div className="pgd-badge" style={{ background: `${project.color}20`, color: '#fff', marginTop: '12px' }}>
            {project.icon} Project {project.id}
          </div>
          <h2>{project.title}</h2>
          <p>{project.subtitle}</p>
        </div>
      </section>

      <div className="section">
        <div className="container pgd-content">

          {/* 프로젝트 개요 */}
          <Section icon="ℹ️" title="프로젝트 개요">
            <p className="pgd-overview">{project.overview}</p>
            <div className="pgd-meta-grid">
              <div>
                <h4>주요 대상</h4>
                <ul>{project.targetUsers.map((u, i) => <li key={i}>{u}</li>)}</ul>
              </div>
              <div>
                <h4>학습 목표</h4>
                <ul>{project.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
              </div>
            </div>
          </Section>

          {/* 시스템 아키텍처 */}
          <Section icon="🏗️" title="시스템 아키텍처">
            <p>{project.architecture.description}</p>
            <div className="pgd-diagram">
              <pre>{project.architecture.diagram}</pre>
            </div>
            <div className="pgd-components">
              {project.architecture.components.map((comp, i) => (
                <div key={i} className="pgd-component">
                  <h4>{comp.name}</h4>
                  <p>{comp.description}</p>
                  <span className="pgd-tech-badge">{comp.tech}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 데이터 파이프라인 */}
          <Section icon="🔄" title="데이터 파이프라인">
            <div className="pgd-pipeline">
              {project.pipeline.steps.map(step => (
                <div key={step.step} className="pgd-pipeline-step">
                  <div className="pgd-step-num" style={{ background: project.color }}>{step.step}</div>
                  <div className="pgd-step-body">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                    <span className="pgd-tech-badge">{step.tools}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Solar API 활용 */}
          <Section icon="☀️" title="Solar API 활용">
            <p>{project.solarApi.description}</p>
            {project.solarApi.endpoints.map((ep, i) => (
              <div key={i} className="pgd-api-endpoint">
                <h4>{ep.name}</h4>
                <p>{ep.purpose}</p>
                <div className="pgd-code-block"><code>{ep.example}</code></div>
              </div>
            ))}
          </Section>

          {/* 프롬프트 엔지니어링 */}
          <Section icon="✨" title="프롬프트 엔지니어링">
            <p>{project.prompts.description}</p>
            {project.prompts.examples.map((ex, i) => (
              <div key={i} className="pgd-prompt">
                <h4>{ex.title}</h4>
                <div className="pgd-prompt-block"><pre>{ex.prompt}</pre></div>
                <p className="pgd-prompt-note">💡 {ex.note}</p>
              </div>
            ))}
          </Section>

          {/* 구현 가이드 */}
          <Section icon="💻" title="구현 가이드">
            <div className="pgd-impl-grid">
              <div className="pgd-impl-item">
                <h3>🖥️ 프론트엔드</h3>
                <p>{project.implementation.frontend.description}</p>
                <span className="pgd-tech-badge">{project.implementation.frontend.stack}</span>
                <h4>주요 페이지</h4>
                <ul>{project.implementation.frontend.pages.map((pg, i) => <li key={i}>{pg}</li>)}</ul>
              </div>
              <div className="pgd-impl-item">
                <h3>⚙️ 백엔드</h3>
                <p>{project.implementation.backend.description}</p>
                <span className="pgd-tech-badge">{project.implementation.backend.stack}</span>
                <h4>API 엔드포인트</h4>
                <ul>{project.implementation.backend.apis.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            </div>
            <div className="pgd-db">
              <h3>🗄️ 데이터베이스</h3>
              <div className="pgd-db-tables">
                {project.implementation.database.tables.map((t, i) => (
                  <div key={i} className="pgd-db-table">
                    <h4>{t.name}</h4>
                    <code>{t.fields}</code>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* 배포 계획 */}
          <Section icon="🚀" title="배포 계획">
            <span className="pgd-tech-badge">{project.deployment.infra}</span>
            <ol className="pgd-deploy-steps">
              {project.deployment.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </Section>

          {/* 확장 가능성 */}
          <Section icon="🌟" title="확장 가능성">
            <ul className="pgd-expansion">
              {project.expansion.map((e, i) => (
                <li key={i}><span style={{ color: project.color }}>✓</span> {e}</li>
              ))}
            </ul>
          </Section>

        </div>
      </div>
    </>
  );
};

export default ProjectGuideDetail;
