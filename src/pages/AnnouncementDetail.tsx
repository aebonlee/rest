import { useState, useEffect, type ReactElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Announcement } from '../types';
import { CategoryBadge } from './Announcements';

const TABLE = `${site.dbPrefix}announcements`;

const AnnouncementDetail = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client || !id) { setLoading(false); setNotFound(true); return; }
      const { data } = await client.from(TABLE).select('*').eq('id', id).maybeSingle();
      if (data) setItem(data as Announcement);
      else setNotFound(true);
      setLoading(false);
    };
    load();
  }, [id]);

  return (
    <>
      <SEOHead title={item ? `공지 · ${item.title}` : '공지사항'} path={`/announcements/${id ?? ''}`} noindex />
      <section className="page-header">
        <div className="container">
          <h2>공지사항</h2>
          <p>AI Reboot Academy 전체 공지입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <Link to="/announcements" style={{ fontSize: '14px', color: 'var(--primary-blue, #0046C8)', textDecoration: 'none' }}>
            ← 공지사항 목록
          </Link>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : notFound || !item ? (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>존재하지 않는 공지입니다.</p>
          ) : (
            <article style={{
              marginTop: '16px', border: '1px solid var(--border-light, #e5e7eb)',
              borderRadius: '12px', padding: '28px 26px', background: 'var(--bg-white, #fff)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {item.is_pinned && <span style={{ fontSize: '14px' }}>📌</span>}
                <CategoryBadge category={item.category} />
              </div>
              <h2 style={{ margin: '12px 0 8px', fontSize: '24px', lineHeight: 1.35 }}>{item.title}</h2>
              <div style={{
                display: 'flex', gap: '14px', flexWrap: 'wrap', paddingBottom: '18px',
                borderBottom: '1px solid var(--border-light, #e5e7eb)',
                fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)',
              }}>
                {item.author_name && <span>작성자 {item.author_name}</span>}
                <span>{new Date(item.created_at).toLocaleString('ko-KR')}</span>
              </div>
              <div style={{
                marginTop: '20px', fontSize: '15.5px', lineHeight: 1.8,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {item.content}
              </div>
            </article>
          )}
        </div>
      </section>
    </>
  );
};

export default AnnouncementDetail;
