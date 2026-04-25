import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { QnAItem } from '../types';

const TABLES = { qna: `${site.dbPrefix}qna` };

const QnA = (): ReactElement => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<QnAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const loadItems = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    const { data } = await client.from(TABLES.qna).select('*').order('created_at', { ascending: false });
    if (data) setItems(data as QnAItem[]);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const client = getSupabase();
      if (!client || !user) throw new Error('Not ready');
      const { error } = await client.from(TABLES.qna).insert({
        title: title.trim(), content: content.trim(), category,
        author_id: user.id, author_name: profile?.display_name || profile?.name || '',
      });
      if (error) throw error;
      showToast('질문이 등록되었습니다.', 'success');
      setTitle(''); setContent(''); setShowForm(false);
      await loadItems();
    } catch (err) {
      showToast((err as Error).message || '등록에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (itemId: string) => {
    if (!replyContent.trim()) return;
    try {
      const client = getSupabase();
      if (!client) throw new Error('Not ready');
      const { error } = await client.from(TABLES.qna).update({
        reply_content: replyContent.trim(),
        reply_author: profile?.display_name || '',
        replied_at: new Date().toISOString(),
        is_resolved: true,
      }).eq('id', itemId);
      if (error) throw error;
      showToast('답변이 등록되었습니다.', 'success');
      setReplyingId(null); setReplyContent('');
      await loadItems();
    } catch (err) {
      showToast((err as Error).message || '답변 등록에 실패했습니다.', 'error');
    }
  };

  return (
    <>
      <SEOHead title="Q&A" path="/qna" noindex />
      <section className="page-header">
        <div className="container">
          <h2>Q&A</h2>
          <p>수업 관련 질문과 답변</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '질문하기'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="qna-form">
              <div className="form-group">
                <label>카테고리</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="general">일반</option>
                  <option value="assignment">과제</option>
                  <option value="project">프로젝트</option>
                  <option value="tech">기술</option>
                </select>
              </div>
              <div className="form-group">
                <label>제목</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="질문 제목" required />
              </div>
              <div className="form-group">
                <label>내용</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="질문 내용을 입력하세요..." required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '질문 등록'}</button>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : items.length > 0 ? (
            <div className="qna-list">
              {items.map(item => (
                <div key={item.id} className={`qna-item ${item.is_resolved ? 'resolved' : ''}`}>
                  <div className="qna-header">
                    <span className={`qna-status ${item.is_resolved ? 'resolved' : 'pending'}`}>
                      {item.is_resolved ? '답변완료' : '대기중'}
                    </span>
                    <span className="qna-category">{item.category}</span>
                  </div>
                  <h4 className="qna-title">{item.title}</h4>
                  <p className="qna-content">{item.content}</p>
                  <div className="qna-meta">
                    <span>{item.author_name}</span>
                    <span>{new Date(item.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {item.reply_content && (
                    <div className="qna-reply">
                      <strong>답변 ({item.reply_author}):</strong>
                      <p>{item.reply_content}</p>
                    </div>
                  )}
                  {isAdmin && !item.reply_content && (
                    <>
                      {replyingId === item.id ? (
                        <div className="qna-reply-form">
                          <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={3} placeholder="답변을 입력하세요..." />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => handleReply(item.id)}>답변 등록</button>
                            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setReplyingId(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', marginTop: '8px' }} onClick={() => setReplyingId(item.id)}>답변하기</button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 질문이 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default QnA;
