import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Assignment, Submission } from '../types';

const TABLES = {
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
};

const AssignmentDetail = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client || !id || !user) { setLoading(false); return; }
      const [assignRes, subRes] = await Promise.all([
        client.from(TABLES.assignments).select('*').eq('id', id).single(),
        client.from(TABLES.submissions).select('*').eq('assignment_id', id).eq('student_id', user.id).maybeSingle(),
      ]);
      if (assignRes.data) setAssignment(assignRes.data as Assignment);
      if (subRes.data) {
        const s = subRes.data as Submission;
        setSubmission(s);
        setContent(s.content || '');
        setFileUrl(s.file_url || '');
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !fileUrl.trim()) { showToast('내용 또는 파일 URL을 입력해주세요.', 'error'); return; }
    setSubmitting(true);
    try {
      const client = getSupabase();
      if (!client || !user || !id) throw new Error('Not ready');
      const payload = {
        assignment_id: id,
        student_id: user.id,
        student_name: profile?.display_name || profile?.name || '',
        content: content.trim(),
        file_url: fileUrl.trim(),
        submitted_at: new Date().toISOString(),
      };
      if (submission) {
        const { error } = await client.from(TABLES.submissions).update(payload).eq('id', submission.id);
        if (error) throw error;
        showToast('과제가 수정되었습니다.', 'success');
      } else {
        const { error } = await client.from(TABLES.submissions).insert(payload);
        if (error) throw error;
        showToast('과제가 제출되었습니다.', 'success');
      }
      const { data } = await client.from(TABLES.submissions).select('*').eq('assignment_id', id).eq('student_id', user.id).maybeSingle();
      if (data) setSubmission(data as Submission);
    } catch (err) {
      showToast((err as Error).message || '제출에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="loading-spinner"></div></div>;
  if (!assignment) return <div style={{ textAlign: 'center', padding: '100px 0' }}>과제를 찾을 수 없습니다.</div>;

  const isOverdue = new Date() > new Date(assignment.due_date);

  return (
    <>
      <SEOHead title={assignment.title} path={`/assignments/${id}`} noindex />
      <section className="page-header">
        <div className="container">
          <Link to="/assignments" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px' }}>← 과제 목록</Link>
          <h2>{assignment.title}</h2>
          <p>Day {assignment.day_number} | {assignment.is_team ? '팀 과제' : '개인 과제'} | 배점: {assignment.max_score}점</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="assignment-detail-grid">
            <div className="assignment-content">
              <h3>과제 설명</h3>
              <div className="assignment-body">{assignment.description}</div>
              <div className="assignment-meta-detail">
                <p><strong>마감일:</strong> {new Date(assignment.due_date).toLocaleString('ko-KR')}</p>
                {isOverdue && <p style={{ color: '#DC2626' }}>⚠️ 마감 기한이 지났습니다.</p>}
              </div>
            </div>

            <div className="submission-section">
              <h3>{submission ? '제출 내용' : '과제 제출'}</h3>
              {submission?.score !== null && submission?.score !== undefined && (
                <div className="grade-display">
                  <span className="grade-score">{submission.score}/{assignment.max_score}</span>
                  <p className="grade-feedback">{submission.feedback}</p>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>내용</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
                    placeholder="과제 내용을 작성하세요..." disabled={submission?.score != null} />
                </div>
                <div className="form-group">
                  <label>파일/링크 URL (선택)</label>
                  <input type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)}
                    placeholder="https://..." disabled={submission?.score != null} />
                </div>
                {submission?.score == null && (
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                    {submitting ? '제출 중...' : submission ? '수정하기' : '제출하기'}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AssignmentDetail;
