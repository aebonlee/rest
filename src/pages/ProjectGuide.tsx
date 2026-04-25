import { useState, useEffect, type ReactElement } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { PROJECT_DATA, type ProjectData } from '../data/projectDetails';
import FlowDiagram from '../components/FlowDiagram';

const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <section className="pgd-section">
    <h2><span className="pgd-section-icon">{icon}</span> {title}</h2>
    <div className="pgd-card">{children}</div>
  </section>
);

const ProjectDetail = ({ project }: { project: ProjectData }): ReactElement => (
  <>
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
        <FlowDiagram projectId={project.id} color={project.color} />
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
  </>
);

const ProjectGuide = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(id ? Number(id) : 1);

  useEffect(() => {
    if (id) setSelectedId(Number(id));
  }, [id]);

  const project = PROJECT_DATA.find(p => p.id === selectedId) || PROJECT_DATA[0];

  const handleSelect = (projectId: number) => {
    setSelectedId(projectId);
    navigate(`/project-guide/${projectId}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEOHead title={project.title} path={`/project-guide/${selectedId}`} />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 안내</h2>
          <p>AI 리부트 경진대회를 위한 7가지 프로젝트 가이드입니다. Solar LLM을 활용한 실전 프로젝트를 확인하세요.</p>
        </div>
      </section>

      <div className="sidebar-layout">
        <aside className="sidebar">
          <nav className="sidebar-menu">
            {PROJECT_DATA.map(p => (
              <button
                key={p.id}
                className={`sidebar-item ${p.id === selectedId ? 'active' : ''}`}
                onClick={() => handleSelect(p.id)}
              >
                <span className="sidebar-item-text">{p.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="sidebar-content">
          <div className="pgd-hero-card" style={{ borderLeftColor: project.color }}>
            <span className="pgd-hero-icon" style={{ background: `${project.color}18`, color: project.color }}>{project.icon}</span>
            <div>
              <h3 className="pgd-hero-title">{project.title}</h3>
              <p className="pgd-hero-subtitle">{project.subtitle}</p>
              <div className="pg-card-tags" style={{ marginTop: '8px' }}>
                {project.solarApi.endpoints.map((ep, i) => (
                  <span key={i} className="pg-tag">{ep.name.split(' (')[0]}</span>
                ))}
              </div>
            </div>
          </div>

          <ProjectDetail project={project} />
        </div>
      </div>
    </>
  );
};

export default ProjectGuide;
