import { useState, useEffect, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Project } from '../../types';

const TABLES = { projects: `${site.dbPrefix}projects` };
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };

const AdminProjects = (): ReactElement => {
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
      <SEOHead title="프로젝트 관리" path="/admin/projects" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h2>프로젝트 관리</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>제목</th><th>유형</th><th>상태</th><th>LLM</th><th>등록일</th></tr></thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td>{p.title}</td><td>{p.category}</td>
                      <td><span className={`project-status ${p.status}`}>{statusLabels[p.status] || p.status}</span></td>
                      <td>{(Array.isArray(p.llm_used) ? p.llm_used : []).join(', ')}</td>
                      <td>{new Date(p.created_at).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProjects;
