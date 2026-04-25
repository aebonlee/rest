import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { PROJECT_DATA } from '../data/projectDetails';

const ProjectGuide = (): ReactElement => {
  const [filter, setFilter] = useState<string>('all');

  const filteredProjects = filter === 'all'
    ? PROJECT_DATA
    : PROJECT_DATA.filter(p =>
        p.solarApi.endpoints.some(ep => ep.name.toLowerCase().includes(filter))
      );

  return (
    <>
      <SEOHead title="프로젝트 안내" path="/project-guide" />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 안내</h2>
          <p>AI 리부트 경진대회를 위한 7가지 프로젝트 가이드입니다. Solar LLM을 활용한 실전 프로젝트를 확인하세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="pg-filter">
            <button className={`pg-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>전체</button>
            <button className={`pg-filter-btn ${filter === 'chat' ? 'active' : ''}`} onClick={() => setFilter('chat')}>Solar Chat</button>
            <button className={`pg-filter-btn ${filter === 'embed' ? 'active' : ''}`} onClick={() => setFilter('embed')}>Solar Embedding</button>
          </div>

          <div className="pg-grid">
            {filteredProjects.map(p => (
              <Link key={p.id} to={`/project-guide/${p.id}`} className="pg-card" style={{ borderLeftColor: p.color }}>
                <div className="pg-card-header">
                  <span className="pg-card-icon" style={{ background: `${p.color}15`, color: p.color }}>{p.icon}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p className="pg-card-subtitle">{p.subtitle}</p>
                  </div>
                </div>
                <div className="pg-card-tags">
                  {p.solarApi.endpoints.map((ep, i) => (
                    <span key={i} className="pg-tag">{ep.name.split(' (')[0]}</span>
                  ))}
                </div>
                <p className="pg-card-overview">{p.overview.slice(0, 100)}...</p>
                <span className="pg-card-link">상세 보기 &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectGuide;
