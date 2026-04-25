import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Assignment } from '../../types';

const TABLES = { assignments: `${site.dbPrefix}assignments` };

const AdminAssignments = (): ReactElement => {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'general', day_number: 1, due_date: '', max_score: 100, is_team: false });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    const { data } = await client.from(TABLES.assignments).select('*').order('day_number');
    if (data) setAssignments(data as Assignment[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const client = getSupabase();
      if (!client) throw new Error('Not ready');
      const { error } = await client.from(TABLES.assignments).insert(form);
      if (error) throw error;
      showToast('과제가 등록되었습니다.', 'success');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'general', day_number: 1, due_date: '', max_score: 100, is_team: false });
      await loadData();
    } catch (err) { showToast((err as Error).message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const client = getSupabase();
    if (!client) return;
    await client.from(TABLES.assignments).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    await loadData();
  };

  return (
    <>
      <SEOHead title="과제 관리" path="/admin/assignments" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="admin-header-row"><h2>과제 관리</h2><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '과제 등록'}</button></div>

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                <div className="form-group"><label>Day</label><input type="number" value={form.day_number} onChange={e => setForm({...form, day_number: Number(e.target.value)})} min={1} /></div>
              </div>
              <div className="form-group"><label>설명</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} required /></div>
              <div className="form-row">
                <div className="form-group"><label>마감일</label><input type="datetime-local" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required /></div>
                <div className="form-group"><label>배점</label><input type="number" value={form.max_score} onChange={e => setForm({...form, max_score: Number(e.target.value)})} min={1} /></div>
                <div className="form-group"><label>팀 과제</label><input type="checkbox" checked={form.is_team} onChange={e => setForm({...form, is_team: e.target.checked})} /></div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Day</th><th>제목</th><th>유형</th><th>배점</th><th>마감일</th><th>관리</th></tr></thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a.id}>
                      <td>{a.day_number}</td><td>{a.title}</td><td>{a.is_team ? '팀' : '개인'}</td>
                      <td>{a.max_score}</td><td>{new Date(a.due_date).toLocaleDateString('ko-KR')}</td>
                      <td><button className="btn-danger-sm" onClick={() => handleDelete(a.id)}>삭제</button></td>
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

export default AdminAssignments;
