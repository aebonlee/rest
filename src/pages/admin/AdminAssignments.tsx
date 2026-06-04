import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Assignment } from '../../types';

const TABLES = { assignments: `${site.dbPrefix}assignments` };

const EMPTY = { title: '', description: '', category: 'general', day_number: 1, due_date: '', max_score: 100, is_team: false };

// ISO → datetime-local 입력값(YYYY-MM-DDTHH:mm, 로컬 기준)
const toLocalInput = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const AdminAssignments = (): ReactElement => {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    const { data } = await client.from(TABLES.assignments).select('*').order('day_number');
    if (data) setAssignments(data as Assignment[]);
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const resetForm = () => { setForm({ ...EMPTY }); setEditingId(null); setShowForm(false); };

  const startNew = () => { if (showForm && !editingId) { resetForm(); return; } setForm({ ...EMPTY }); setEditingId(null); setShowForm(true); };

  const startEdit = (a: Assignment) => {
    setForm({
      title: a.title, description: a.description || '', category: a.category || 'general',
      day_number: a.day_number, due_date: toLocalInput(a.due_date), max_score: a.max_score, is_team: !!a.is_team,
    });
    setEditingId(a.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const client = getSupabase();
      if (!client) throw new Error('Not ready');
      const payload = { ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : null };
      if (editingId) {
        const { error } = await client.from(TABLES.assignments).update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('과제가 수정되었습니다.', 'success');
      } else {
        const { error } = await client.from(TABLES.assignments).insert(payload);
        if (error) throw error;
        showToast('과제가 등록되었습니다.', 'success');
      }
      resetForm();
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
    if (editingId === id) resetForm();
    await loadData();
  };

  return (
    <>
      <SEOHead title="과제 관리" path="/admin/assignments" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="admin-header-row"><h2>과제 관리</h2><button className="btn btn-primary" onClick={startNew}>{showForm && !editingId ? '취소' : '과제 등록'}</button></div>

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--primary-blue, #0046C8)' }}>{editingId ? '✏️ 과제 수정' : '➕ 새 과제 등록'}</div>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '저장 중...' : editingId ? '수정 저장' : '등록'}</button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>취소</button>
              </div>
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
                    <tr key={a.id} style={editingId === a.id ? { background: 'rgba(0,70,200,0.06)' } : undefined}>
                      <td>{a.day_number}</td><td>{a.title}</td><td>{a.is_team ? '팀' : '개인'}</td>
                      <td>{a.max_score}</td><td>{a.due_date ? new Date(a.due_date).toLocaleString('ko-KR') : '-'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn-secondary-sm" style={{ marginRight: '6px' }} onClick={() => startEdit(a)}>수정</button>
                        <button className="btn-danger-sm" onClick={() => handleDelete(a.id)}>삭제</button>
                      </td>
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
