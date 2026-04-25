import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';

const TABLES = {
  announcements: `${site.dbPrefix}announcements`,
  attendance: `${site.dbPrefix}attendance`,
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
};

const Dashboard = (): ReactElement => {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; created_at: string; is_pinned: boolean }[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client || !user) return;

      const [annRes, attRes, assignRes, subRes] = await Promise.all([
        client.from(TABLES.announcements).select('id, title, created_at, is_pinned').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5),
        client.from(TABLES.attendance).select('id', { count: 'exact' }).eq('student_id', user.id).eq('status', 'present'),
        client.from(TABLES.assignments).select('id', { count: 'exact' }),
        client.from(TABLES.submissions).select('id', { count: 'exact' }).eq('student_id', user.id),
      ]);

      if (annRes.data) setAnnouncements(annRes.data);
      if (attRes.count != null) setAttendanceCount(attRes.count);
      if (assignRes.count != null) setAssignmentCount(assignRes.count);
      if (subRes.count != null) setSubmissionCount(subRes.count);
    };
    load();
  }, [user]);

  return (
    <>
      <SEOHead title="대시보드" path="/dashboard" noindex />
      <section className="page-header">
        <div className="container">
          <h2>대시보드</h2>
          <p>안녕하세요, {profile?.display_name || '수강생'}님!</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{attendanceCount}</div>
              <div className="stat-label">출석 일수</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{submissionCount}/{assignmentCount}</div>
              <div className="stat-label">과제 제출</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{assignmentCount > 0 ? Math.round((submissionCount / assignmentCount) * 100) : 0}%</div>
              <div className="stat-label">진행률</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-section">
              <h3>📢 공지사항</h3>
              {announcements.length > 0 ? (
                <ul className="dashboard-list">
                  {announcements.map(a => (
                    <li key={a.id} className={a.is_pinned ? 'pinned' : ''}>
                      {a.is_pinned && <span className="pin-badge">고정</span>}
                      <span className="list-title">{a.title}</span>
                      <span className="list-date">{new Date(a.created_at).toLocaleDateString('ko-KR')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">공지사항이 없습니다.</p>
              )}
            </div>

            <div className="dashboard-section">
              <h3>🔗 바로가기</h3>
              <div className="quick-links">
                <Link to="/materials" className="quick-link-card">📁 학습자료</Link>
                <Link to="/assignments" className="quick-link-card">📝 과제</Link>
                <Link to="/teams" className="quick-link-card">🤝 팀</Link>
                <Link to="/projects" className="quick-link-card">🚀 프로젝트</Link>
                <Link to="/qna" className="quick-link-card">❓ Q&A</Link>
                <Link to="/schedule" className="quick-link-card">📅 일정표</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
