import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Project } from '../types';

const TABLES = { projects: `${site.dbPrefix}projects` };

const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };
const categoryLabels: Record<string, string> = { 'mini-personal': '개인 미니', 'mini-team': '팀 미니', real: '실전' };

const Projects = (): ReactElement => {
  useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client) { setLoading(false); return; }
      const { data } = await client.from(TABLES.projects).select('*').order('created_at', { ascending: false });
      if (data) setProjects(data as Project[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <SEOHead title="프로젝트" path="/projects" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트</h2>
          <p>진행 중인 프로젝트 현황입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : projects.length > 0 ? (
            <div className="projects-grid">
              {projects.map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
                  <div className="project-header">
                    <span className={`project-status ${p.status}`}>{statusLabels[p.status] || p.status}</span>
                    <span className="project-category">{categoryLabels[p.category] || p.category}</span>
                  </div>
                  <h4>{p.title}</h4>
                  <p>{p.description}</p>
                  <div className="project-llm">
                    {(Array.isArray(p.llm_used) ? p.llm_used : []).map((llm, i) => (
                      <span key={i} className="llm-tag">{llm}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 프로젝트가 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Projects;
