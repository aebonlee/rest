import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { groupByPerson } from '../../utils/people';
import type { UserProfile } from '../../types';

const REST_HOSTNAME = new URL(site.url).hostname; // 'rest.dreamitbiz.com'

type Scope = 'signup' | 'visited';

const AdminStudents = (): ReactElement => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<Scope>('signup');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const client = getSupabase();
      if (!client) { setLoading(false); return; }

      const query = client
        .from('user_profiles')
        .select('*')
        .order('last_sign_in_at', { ascending: false });

      // 본 사이트 가입자만 / 또는 방문 이력 포함
      if (scope === 'signup') {
        query.eq('signup_domain', REST_HOSTNAME);
      } else {
        query.contains('visited_sites', [REST_HOSTNAME]);
      }

      const { data } = await query;
      if (data) setStudents(data as UserProfile[]);
      setLoading(false);
    };
    load();
  }, [scope]);

  // 동일인(전화/이름 기준) 통합 — 이메일 2개여도 한 명으로 표시
  const people = useMemo(() => groupByPerson(students), [students]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return people;
    const k = keyword.trim().toLowerCase();
    return people.filter(g =>
      g.emails.some(e => e.toLowerCase().includes(k)) ||
      g.accounts.some(a =>
        (a.display_name || '').toLowerCase().includes(k) ||
        (a.name || '').toLowerCase().includes(k)
      ) ||
      (g.phone || '').includes(k)
    );
  }, [people, keyword]);

  return (
    <>
      <SEOHead title="수강생 관리" path="/admin/students" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>수강생 관리</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                <strong>rest.dreamitbiz.com</strong>{scope === 'signup' ? '에서 가입한 회원' : '에 접속한 회원'}만 표시됩니다.
              </p>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              총 {filtered.length}명{keyword && ` (전체 ${people.length}명 중)`}
              {people.length !== students.length && (
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}>
                  {' '}· 계정 {students.length}개(동일인 통합)
                </span>
              )}
            </div>
          </div>

          {/* 필터 컨트롤 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px',
            padding: '12px 16px',
            background: 'var(--bg-secondary, #f8f9fa)',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setScope('signup')}
                style={{
                  padding: '8px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  background: scope === 'signup' ? 'var(--primary-blue, #0046C8)' : 'transparent',
                  color: scope === 'signup' ? '#fff' : 'var(--text-primary, #1a1a1a)',
                  cursor: 'pointer',
                }}
              >본 사이트 가입자</button>
              <button
                type="button"
                onClick={() => setScope('visited')}
                style={{
                  padding: '8px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  background: scope === 'visited' ? 'var(--primary-blue, #0046C8)' : 'transparent',
                  color: scope === 'visited' ? '#fff' : 'var(--text-primary, #1a1a1a)',
                  cursor: 'pointer',
                }}
              >본 사이트 방문자</button>
            </div>
            <input
              type="search"
              placeholder="이름·이메일·전화 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '6px',
                background: 'var(--bg-card, #fff)',
                color: 'var(--text-primary, #1a1a1a)',
              }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-secondary, #f8f9fa)',
              borderRadius: '12px',
              color: 'var(--text-secondary, #6b7280)',
            }}>
              {keyword
                ? '검색 결과가 없습니다.'
                : scope === 'signup'
                  ? '본 사이트에서 가입한 회원이 아직 없습니다.'
                  : '본 사이트에 방문한 회원이 아직 없습니다.'}
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr><th>이름</th><th>이메일</th><th>전화번호</th><th>가입방식</th><th>가입처</th><th>역할</th><th>최근접속</th></tr>
                </thead>
                <tbody>
                  {filtered.map(g => {
                    const s = g.primary;
                    return (
                      <tr key={g.key}>
                        <td>
                          {g.name}
                          {g.isMerged && (
                            <span title={`동일 전화번호 ${g.phone}로 ${g.accounts.length}개 계정`} style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 7px',
                              borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                            }}>동일인 {g.accounts.length}계정</span>
                          )}
                        </td>
                        <td>
                          {g.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '13px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                          ))}
                        </td>
                        <td>{g.phone || '-'}</td>
                        <td>{Array.from(new Set(g.accounts.map(a => a.provider).filter(Boolean))).join(', ') || '-'}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                          {s.signup_domain || '-'}
                        </td>
                        <td><span className={`role-badge ${s.role}`}>{s.role}</span></td>
                        <td>{s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminStudents;
