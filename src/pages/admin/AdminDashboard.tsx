import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';

const TABLES = {
  attendance: `${site.dbPrefix}attendance`,
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
  teams: `${site.dbPrefix}teams`,
  projects: `${site.dbPrefix}projects`,
};

const AdminDashboard = (): ReactElement => {
  const [stats, setStats] = useState({ students: 0, assignments: 0, submissions: 0, teams: 0, projects: 0 });

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client) return;
      const [profileRes, assignRes, subRes, teamRes, projRes] = await Promise.all([
        client.from('user_profiles').select('id', { count: 'exact' }).like('visited_sites', '%rest.dreamitbiz.com%'),
        client.from(TABLES.assignments).select('id', { count: 'exact' }),
        client.from(TABLES.submissions).select('id', { count: 'exact' }),
        client.from(TABLES.teams).select('id', { count: 'exact' }),
        client.from(TABLES.projects).select('id', { count: 'exact' }),
      ]);
      setStats({
        students: profileRes.count || 0,
        assignments: assignRes.count || 0,
        submissions: subRes.count || 0,
        teams: teamRes.count || 0,
        projects: projRes.count || 0,
      });
    };
    load();
  }, []);

  return (
    <>
      <SEOHead title="관리자 대시보드" path="/admin" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h2>관리자 대시보드</h2>
          <div className="admin-stats">
            <div className="admin-stat-card"><div className="stat-value">{stats.students}</div><div className="stat-label">수강생</div></div>
            <div className="admin-stat-card"><div className="stat-value">{stats.assignments}</div><div className="stat-label">과제</div></div>
            <div className="admin-stat-card"><div className="stat-value">{stats.submissions}</div><div className="stat-label">제출물</div></div>
            <div className="admin-stat-card"><div className="stat-value">{stats.teams}</div><div className="stat-label">팀</div></div>
            <div className="admin-stat-card"><div className="stat-value">{stats.projects}</div><div className="stat-label">프로젝트</div></div>
          </div>
          <div className="admin-quick-links">
            <h3>바로가기</h3>
            <div className="quick-links">
              <Link to="/admin/students" className="quick-link-card">👥 수강생 관리</Link>
              <Link to="/admin/materials" className="quick-link-card">📁 자료 관리</Link>
              <Link to="/admin/assignments" className="quick-link-card">📝 과제 관리</Link>
              <Link to="/admin/attendance" className="quick-link-card">✅ 출석 관리</Link>
              <Link to="/admin/announcements" className="quick-link-card">📢 공지사항</Link>
              <Link to="/admin/teams" className="quick-link-card">🤝 팀 편성</Link>
              <Link to="/admin/projects" className="quick-link-card">🚀 프로젝트</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
