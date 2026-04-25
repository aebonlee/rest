import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Material } from '../../types';

const TABLES = { materials: `${site.dbPrefix}materials` };

const AdminMaterials = (): ReactElement => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'ai_basic', file_url: '', file_type: 'pdf', file_size: 0, day_number: 1 });
  const [submitting, setSubmitting] = useState(false);

  const loadMaterials = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    const { data } = await client.from(TABLES.materials).select('*').order('day_number').order('created_at', { ascending: false });
    if (data) setMaterials(data as Material[]);
    setLoading(false);
  };

  useEffect(() => { loadMaterials(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const client = getSupabase();
      if (!client || !user) throw new Error('Not ready');
      const { error } = await client.from(TABLES.materials).insert({ ...form, author_id: user.id });
      if (error) throw error;
      showToast('자료가 등록되었습니다.', 'success');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'ai_basic', file_url: '', file_type: 'pdf', file_size: 0, day_number: 1 });
      await loadMaterials();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const client = getSupabase();
    if (!client) return;
    await client.from(TABLES.materials).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    await loadMaterials();
  };

  return (
    <>
      <SEOHead title="자료 관리" path="/admin/materials" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="admin-header-row">
            <h2>자료 관리</h2>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '자료 등록'}</button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                <div className="form-group"><label>Day</label><input type="number" value={form.day_number} onChange={e => setForm({...form, day_number: Number(e.target.value)})} min={1} max={20} /></div>
              </div>
              <div className="form-group"><label>설명</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
              <div className="form-row">
                <div className="form-group"><label>카테고리</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="prerequisite">선수과정</option><option value="ai_basic">AI기본</option><option value="llm_practice">LLM실습</option>
                    <option value="automation">자동화</option><option value="planning">기획</option><option value="design">설계</option>
                    <option value="implementation">구현</option><option value="debugging">디버깅</option><option value="coaching">코칭</option>
                  </select>
                </div>
                <div className="form-group"><label>파일 URL</label><input type="url" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} /></div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Day</th><th>제목</th><th>카테고리</th><th>등록일</th><th>관리</th></tr></thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td>{m.day_number}</td><td>{m.title}</td><td>{m.category}</td>
                      <td>{new Date(m.created_at).toLocaleDateString('ko-KR')}</td>
                      <td><button className="btn-danger-sm" onClick={() => handleDelete(m.id)}>삭제</button></td>
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

export default AdminMaterials;
