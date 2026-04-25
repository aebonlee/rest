import { useState, useEffect, type ReactElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Project } from '../types';

const TABLES = { projects: `${site.dbPrefix}projects` };
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };

const ProjectDetail = (): ReactElement => {
  useAuth();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client || !id) { setLoading(false); return; }
      const { data } = await client.from(TABLES.projects).select('*').eq('id', id).single();
      if (data) setProject(data as Project);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="loading-spinner"></div></div>;
  if (!project) return <div style={{ textAlign: 'center', padding: '100px 0' }}>프로젝트를 찾을 수 없습니다.</div>;

  return (
    <>
      <SEOHead title={project.title} path={`/projects/${id}`} noindex />
      <section className="page-header">
        <div className="container">
          <Link to="/projects" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>← 프로젝트 목록</Link>
          <h2>{project.title}</h2>
          <p>{statusLabels[project.status] || project.status}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="project-detail">
            <div className="project-detail-body">
              <h3>프로젝트 설명</h3>
              <p>{project.description}</p>
            </div>
            <div className="project-detail-meta">
              <h3>프로젝트 정보</h3>
              <div className="meta-list">
                {project.repo_url && <p><strong>GitHub:</strong> <a href={project.repo_url} target="_blank" rel="noopener noreferrer">{project.repo_url}</a></p>}
                {project.demo_url && <p><strong>데모:</strong> <a href={project.demo_url} target="_blank" rel="noopener noreferrer">{project.demo_url}</a></p>}
                {project.presentation_url && <p><strong>발표자료:</strong> <a href={project.presentation_url} target="_blank" rel="noopener noreferrer">보기</a></p>}
                <p><strong>사용 LLM:</strong> {(Array.isArray(project.llm_used) ? project.llm_used : []).join(', ') || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectDetail;
