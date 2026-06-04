import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Announcement } from '../types';

const TABLE = `${site.dbPrefix}announcements`;

export const CATEGORY_LABEL: Record<string, string> = {
  general: '일반',
  important: '중요',
  schedule: '일정',
};

export const CATEGORY_COLOR: Record<string, { bg: string; fg: string }> = {
  general: { bg: '#eef2ff', fg: '#3730a3' },
  important: { bg: '#fee2e2', fg: '#991b1b' },
  schedule: { bg: '#d1fae5', fg: '#065f46' },
};

export const CategoryBadge = ({ category }: { category: string }): ReactElement => {
  const c = CATEGORY_COLOR[category] || CATEGORY_COLOR.general;
  return (
    <span style={{
      fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px',
      background: c.bg, color: c.fg, whiteSpace: 'nowrap',
    }}>{CATEGORY_LABEL[category] || category}</span>
  );
};

const Announcements = (): ReactElement => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client) { setLoading(false); return; }
      const { data } = await client
        .from(TABLE)
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (data) setItems(data as Announcement[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <SEOHead title="공지사항" path="/announcements" noindex />
      <section className="page-header">
        <div className="container">
          <h2>공지사항</h2>
          <p>AI Reboot Academy 전체 공지입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : items.length > 0 ? (
            <div style={{ border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px', overflow: 'hidden' }}>
              {items.map((a, idx) => (
                <Link
                  key={a.id}
                  to={`/announcements/${a.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px',
                    textDecoration: 'none', color: 'inherit',
                    borderTop: idx === 0 ? 'none' : '1px solid var(--border-light, #f1f3f5)',
                    background: a.is_pinned ? 'var(--bg-light-gray, #f8f9fa)' : 'transparent',
                  }}
                >
                  <span style={{ width: '36px', textAlign: 'center', color: 'var(--text-secondary, #9ca3af)', fontSize: '14px' }}>
                    {a.is_pinned ? '📌' : idx + 1}
                  </span>
                  <CategoryBadge category={a.category} />
                  <span style={{ flex: 1, fontWeight: a.is_pinned ? 700 : 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.title}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary, #9ca3af)', whiteSpace: 'nowrap' }}>
                    {new Date(a.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 공지사항이 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Announcements;
