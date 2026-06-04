import { useState, useEffect, useMemo, type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Announcement } from '../types';

const TABLE = `${site.dbPrefix}announcements`;

const CATEGORY_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'general', label: '일반' },
  { key: 'important', label: '중요' },
  { key: 'schedule', label: '일정' },
];

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
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (q && !`${a.title} ${a.content}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, category]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: items.length };
    for (const a of items) m[a.category] = (m[a.category] || 0) + 1;
    return m;
  }, [items]);

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
          {/* 검색 + 카테고리 필터 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #9ca3af)', fontSize: '14px' }}>🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목·내용 검색"
                style={{
                  width: '100%', padding: '10px 14px 10px 36px', fontSize: '14px',
                  border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '10px',
                  background: 'var(--bg-white, #fff)', color: 'var(--text-primary)', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORY_FILTERS.map((c) => {
                const on = category === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    style={{
                      padding: '8px 14px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                      borderRadius: '999px', border: '1px solid',
                      borderColor: on ? 'var(--primary-blue, #0046C8)' : 'var(--border-light, #e5e7eb)',
                      background: on ? 'var(--primary-blue, #0046C8)' : 'var(--bg-white, #fff)',
                      color: on ? '#fff' : 'var(--text-secondary, #6b7280)',
                    }}
                  >
                    {c.label} {counts[c.key] ? `(${counts[c.key]})` : '(0)'}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length > 0 ? (
            <div style={{ border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px', overflow: 'hidden' }}>
              {filtered.map((a, idx) => {
                const open = openId === a.id;
                return (
                  <div key={a.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--border-light, #f1f3f5)' }}>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : a.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px',
                        background: a.is_pinned ? 'var(--bg-light-gray, #f8f9fa)' : 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit',
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
                      <span style={{
                        color: 'var(--text-secondary, #9ca3af)', fontSize: '12px', flexShrink: 0,
                        transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
                      }}>▼</span>
                    </button>
                    {open && (
                      <div style={{
                        padding: '4px 18px 22px 66px', background: a.is_pinned ? 'var(--bg-light-gray, #f8f9fa)' : 'transparent',
                      }}>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)', marginBottom: '10px' }}>
                          {a.author_name && <span>작성자 {a.author_name} · </span>}
                          {new Date(a.created_at).toLocaleString('ko-KR')}
                        </div>
                        <div style={{ fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {a.content}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>
              {items.length === 0 ? '등록된 공지사항이 없습니다.' : '검색 결과가 없습니다.'}
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default Announcements;
