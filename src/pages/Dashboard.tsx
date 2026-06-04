import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import { getMyAssessments, type AssessmentRecord } from '../utils/assessments';

const TABLES = {
  announcements: `${site.dbPrefix}announcements`,
  attendance: `${site.dbPrefix}attendance`,
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
};

const ASSESSMENT_LABEL: Record<string, string> = {
  prerequisite: '선수평가',
  summative: '사후평가',
};

const Dashboard = (): ReactElement => {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; created_at: string; is_pinned: boolean }[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [grades, setGrades] = useState<AssessmentRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client || !user) return;

      const [annRes, attRes, assignRes, subRes, gradeRes] = await Promise.all([
        client.from(TABLES.announcements).select('id, title, created_at, is_pinned').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5),
        client.from(TABLES.attendance).select('id', { count: 'exact' }).eq('student_id', user.id).eq('status', 'present'),
        client.from(TABLES.assignments).select('id', { count: 'exact' }),
        client.from(TABLES.submissions).select('id', { count: 'exact' }).eq('student_id', user.id),
        getMyAssessments(user.id),
      ]);

      if (annRes.data) setAnnouncements(annRes.data);
      if (attRes.count != null) setAttendanceCount(attRes.count);
      if (assignRes.count != null) setAssignmentCount(assignRes.count);
      if (subRes.count != null) setSubmissionCount(subRes.count);
      setGrades(gradeRes);
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

          <div className="dashboard-section" style={{ marginBottom: '24px' }}>
            <h3>🎯 내 학습평가 성적</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {(['prerequisite', 'summative'] as const).map((t) => {
                const g = grades.find((x) => x.type === t);
                return (
                  <div key={t} style={{
                    border: '1px solid var(--border-light, #e5e7eb)',
                    borderLeft: `4px solid ${g ? (g.passed ? '#10b981' : '#ef4444') : 'var(--border-light, #e5e7eb)'}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '16px 18px',
                    background: 'var(--bg-white, #fff)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '16px' }}>{ASSESSMENT_LABEL[t]}</strong>
                      {g && (
                        <span style={{
                          fontSize: '13px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                          background: g.passed ? '#d1fae5' : '#fee2e2',
                          color: g.passed ? '#065f46' : '#991b1b',
                        }}>{g.passed ? '합격' : '불합격'}</span>
                      )}
                    </div>
                    {g ? (
                      <>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: g.passed ? '#10b981' : '#ef4444' }}>
                          {g.score}<span style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)' }}>점</span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                          {g.correct}/{g.total} 정답 · {g.submitted_at ? new Date(g.submitted_at).toLocaleDateString('ko-KR') : ''}
                        </div>
                      </>
                    ) : (
                      <Link to={`/assessment/${t}`} style={{ fontSize: '15px', color: 'var(--primary-blue, #0046C8)', fontWeight: 600 }}>
                        아직 응시하지 않았습니다 → 평가 보기
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginTop: '10px' }}>
              💡 <Link to="/assessment/diagnostic" style={{ color: 'var(--primary-blue, #0046C8)' }}>진단평가</Link>는 사후평가 전 자습용으로, 정답·해설이 공개되어 있고 성적에는 반영되지 않습니다.
            </p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3>📢 공지사항</h3>
                <Link to="/announcements" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)', textDecoration: 'none' }}>전체보기 →</Link>
              </div>
              {announcements.length > 0 ? (
                <ul className="dashboard-list">
                  {announcements.map(a => (
                    <li key={a.id} className={a.is_pinned ? 'pinned' : ''}>
                      {a.is_pinned && <span className="pin-badge">고정</span>}
                      <Link to={`/announcements/${a.id}`} className="list-title" style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
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
                <Link to="/announcements" className="quick-link-card">📢 공지사항</Link>
                <Link to="/materials" className="quick-link-card">📁 강의자료</Link>
                <Link to="/assignments" className="quick-link-card">📝 과제</Link>
                <Link to="/project-vote" className="quick-link-card">🧩 팀구성</Link>
                <Link to="/project-board" className="quick-link-card">🗂️ 프로젝트 관리</Link>
                <Link to="/qna" className="quick-link-card">❓ Q&A</Link>
                <Link to="/classroom" className="quick-link-card">💻 온라인강의실</Link>
                <Link to="/mypage" className="quick-link-card">👤 마이페이지</Link>
                <a href="https://padlet.com/aebon/rest01" target="_blank" rel="noopener noreferrer" className="quick-link-card">📌 공유 게시판</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
