import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Assignment, Submission } from '../types';

const TABLES = {
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
};

const Assignments = (): ReactElement => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client || !user) { setLoading(false); return; }
      const [assignRes, subRes] = await Promise.all([
        client.from(TABLES.assignments).select('*').order('day_number').order('due_date'),
        client.from(TABLES.submissions).select('*').eq('student_id', user.id),
      ]);
      if (assignRes.data) setAssignments(assignRes.data as Assignment[]);
      if (subRes.data) setSubmissions(subRes.data as Submission[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const getSubmission = (assignmentId: string) => submissions.find(s => s.assignment_id === assignmentId);

  const getStatusBadge = (assignment: Assignment) => {
    const sub = getSubmission(assignment.id);
    if (sub) {
      if (sub.score !== null) return <span className="status-badge graded">채점완료 ({sub.score}/{assignment.max_score})</span>;
      return <span className="status-badge submitted">제출완료</span>;
    }
    const now = new Date();
    const due = new Date(assignment.due_date);
    if (now > due) return <span className="status-badge overdue">기한초과</span>;
    return <span className="status-badge pending">미제출</span>;
  };

  return (
    <>
      <SEOHead title="과제" path="/assignments" noindex />
      <section className="page-header">
        <div className="container">
          <h2>과제</h2>
          <p>과제 목록 및 제출 현황입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : assignments.length > 0 ? (
            <div className="assignments-list">
              {assignments.map((a) => (
                <Link key={a.id} to={`/assignments/${a.id}`} className="assignment-card">
                  <div className="assignment-header">
                    <h4>{a.title}</h4>
                    {getStatusBadge(a)}
                  </div>
                  <p className="assignment-desc">{a.description}</p>
                  <div className="assignment-meta">
                    <span>Day {a.day_number}</span>
                    <span>{a.is_team ? '팀 과제' : '개인 과제'}</span>
                    <span>배점: {a.max_score}점</span>
                    <span>마감: {new Date(a.due_date).toLocaleDateString('ko-KR')}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 과제가 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Assignments;
