import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Announcement } from '../../types';

const TABLES = { announcements: `${site.dbPrefix}announcements` };

const AdminAnnouncements = (): ReactElement => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', is_pinned: false });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    const { data } = await client.from(TABLES.announcements).select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    if (data) setItems(data as Announcement[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const client = getSupabase();
      if (!client || !user) throw new Error('Not ready');
      const { error } = await client.from(TABLES.announcements).insert({ ...form, author_id: user.id, author_name: profile?.display_name || '' });
      if (error) throw error;
      showToast('공지사항이 등록되었습니다.', 'success');
      setShowForm(false);
      setForm({ title: '', content: '', category: 'general', is_pinned: false });
      await loadData();
    } catch (err) { showToast((err as Error).message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const client = getSupabase();
    if (!client) return;
    await client.from(TABLES.announcements).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    await loadData();
  };

  return (
    <>
      <SEOHead title="공지사항 관리" path="/admin/announcements" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="admin-header-row"><h2>공지사항 관리</h2><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '공지 등록'}</button></div>

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              <div className="form-group"><label>내용</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={5} required /></div>
              <div className="form-row">
                <div className="form-group"><label>카테고리</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="general">일반</option><option value="important">중요</option><option value="schedule">일정</option>
                  </select>
                </div>
                <div className="form-group"><label>상단 고정</label><input type="checkbox" checked={form.is_pinned} onChange={e => setForm({...form, is_pinned: e.target.checked})} /></div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>고정</th><th>제목</th><th>카테고리</th><th>작성자</th><th>등록일</th><th>관리</th></tr></thead>
                <tbody>
                  {items.map(a => (
                    <tr key={a.id}>
                      <td>{a.is_pinned ? '📌' : ''}</td><td>{a.title}</td><td>{a.category}</td>
                      <td>{a.author_name}</td><td>{new Date(a.created_at).toLocaleDateString('ko-KR')}</td>
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

export default AdminAnnouncements;
