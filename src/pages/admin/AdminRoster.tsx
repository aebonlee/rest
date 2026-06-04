import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { ROSTER, ROSTER_COUNT, type RosterStudent } from '../../data/rosterData';
import { groupByPerson, type PersonGroup } from '../../utils/people';
import { SAME_PERSON_EMAIL_GROUPS } from '../../config/admin';
import type { UserProfile } from '../../types';

const REST_HOSTNAME = new URL(site.url).hostname;
const STAFF_ROLES = ['admin', 'superadmin'];

// 동일인 묶음에 등록된 이메일은 도메인 조건/STAFF 역할과 무관하게 항상 명단 대조에 포함한다.
// (다른 사이트로 가입했거나 관리자 역할이어도 '명단외 가입'에 보여야 하는 사람)
const INCLUDE_EMAILS = SAME_PERSON_EMAIL_GROUPS
  .flatMap((g) => g.emails)
  .map((e) => e.toLowerCase());
const INCLUDE_SET = new Set(INCLUDE_EMAILS);
const INCLUDE_NAMES = SAME_PERSON_EMAIL_GROUPS.map((g) => g.name).filter(Boolean) as string[];
const NAME_SET = new Set(INCLUDE_NAMES.map((n) => n.replace(/\s+/g, '')));

const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '').trim();

interface RosterRow {
  student: RosterStudent;
  person: PersonGroup | null;
}

const levelColor: Record<string, string> = { 입문: '#ef4444', 기초: '#d97706', 경험자: '#10b981' };

const AdminRoster = (): ReactElement => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client) { setLoading(false); return; }
      // 본 사이트 가입자: signup_domain 일치 OR visited_sites 에 호스트 포함
      const { data } = await client
        .from('user_profiles')
        .select('*')
        .or(`signup_domain.eq.${REST_HOSTNAME},visited_sites.cs.{${REST_HOSTNAME}}`);
      const merged = [...((data || []) as UserProfile[])];
      const seen = new Set(merged.map((u) => u.id));
      const addAll = (rows: UserProfile[] | null) => {
        for (const u of rows || []) if (!seen.has(u.id)) { seen.add(u.id); merged.push(u); }
      };

      // 동일인 묶음 이메일은 도메인 조건에 안 걸려도 별도 조회해 합친다 (예: 다른 사이트로 가입)
      if (INCLUDE_EMAILS.length) {
        const { data: byEmail } = await client.from('user_profiles').select('*').in('email', INCLUDE_EMAILS);
        addAll(byEmail as UserProfile[] | null);
      }
      // 이메일이 달라도 이름(예: 주윤미)으로도 추가 조회해 누락을 막는다
      if (INCLUDE_NAMES.length) {
        const nameOr = INCLUDE_NAMES.flatMap((n) => [`name.eq.${n}`, `display_name.eq.${n}`]).join(',');
        const { data: byName } = await client.from('user_profiles').select('*').or(nameOr);
        addAll(byName as UserProfile[] | null);
      }

      // STAFF 역할은 제외하되, 동일인 묶음 이메일/이름은 예외로 항상 포함
      const isIncluded = (u: UserProfile) =>
        INCLUDE_SET.has((u.email || '').toLowerCase()) ||
        NAME_SET.has((u.name || '').replace(/\s+/g, '')) ||
        NAME_SET.has((u.display_name || '').replace(/\s+/g, ''));
      const list = merged.filter((u) => !STAFF_ROLES.includes(u.role) || isIncluded(u));
      setProfiles(list);
      setLoading(false);
    };
    load();
  }, []);

  const { rows, notInRoster, matchedCount } = useMemo(() => {
    // 동일인(전화/이름) 통합 후 이름으로 매칭
    // 같은 이름 그룹이 여러 개면(전화번호 등으로 분리된 동일인 계정) 모두 매칭 처리해
    // 한 계정만 매칭되고 나머지가 '명단외'로 남는 문제를 방지한다.
    const people = groupByPerson(profiles);
    const byName = new Map<string, PersonGroup[]>();
    people.forEach((g) => {
      const names = new Set<string>();
      g.accounts.forEach((a) => { if (a.name) names.add(norm(a.name)); if (a.display_name) names.add(norm(a.display_name)); });
      names.forEach((n) => { const arr = byName.get(n) || []; arr.push(g); byName.set(n, arr); });
    });
    const usedKeys = new Set<string>();
    const rows: RosterRow[] = ROSTER.map((student) => {
      const groups = byName.get(norm(student.name)) || [];
      groups.forEach((g) => usedKeys.add(g.key));
      return { student, person: groups[0] || null };
    });
    return {
      rows,
      matchedCount: rows.filter((r) => r.person).length,
      notInRoster: people.filter((g) => !usedKeys.has(g.key)),
    };
  }, [profiles]);

  // 중도포기는 미가입 경고에서 제외 (출석 대상이 아니므로)
  const notSignedUp = rows.filter((r) => !r.person && !r.student.dropped);
  const droppedCount = useMemo(() => ROSTER.filter((s) => s.dropped).length, []);

  // 경험 수준 분포 (중도포기 제외 = 실제 수강 인원 기준)
  const levelDist = useMemo(() => {
    const d: Record<string, number> = { 입문: 0, 기초: 0, 경험자: 0 };
    ROSTER.filter((s) => !s.dropped).forEach((s) => { d[s.level] += 1; });
    return d;
  }, []);

  const summary = [
    { label: '명단 인원', val: ROSTER_COUNT - droppedCount, color: 'var(--text-primary, #1a1a1a)' },
    { label: '가입 회원', val: matchedCount + notInRoster.length, color: 'var(--primary-blue, #0046C8)' },
    { label: '일치(가입완료)', val: matchedCount, color: '#10b981' },
    { label: '미가입', val: notSignedUp.length, color: '#ef4444' },
    { label: '명단외 가입', val: notInRoster.length, color: '#d97706' },
    ...(droppedCount > 0 ? [{ label: '중도포기', val: droppedCount, color: '#6b7280' }] : []),
  ];

  return (
    <>
      <SEOHead title="수강생 명단 대조" path="/admin/roster" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>수강생 명단 ↔ 회원가입 대조</h2>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
              내장된 수강생 명단 <strong>{ROSTER_COUNT}명</strong>을 본 사이트 가입 회원과 <strong>이름 기준</strong>으로 대조합니다.
              (명단에 이메일이 없어 이름 매칭이며, 동명이인·닉네임 가입은 수동 확인이 필요합니다.)
            </p>
          </div>

          {/* 요약 카운트 */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {summary.map((c) => (
              <div key={c.label} style={{
                flex: '1 1 130px', border: '1px solid var(--border-light, #e5e7eb)',
                borderRadius: '10px', padding: '12px 14px', background: 'var(--bg-white, #fff)',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: c.color }}>{c.val}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* 경험 수준 분포 */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '13.5px' }}>
            {Object.entries(levelDist).map(([lvl, n]) => (
              <span key={lvl} style={{
                padding: '4px 12px', borderRadius: '999px', fontWeight: 700,
                background: 'var(--bg-light-gray, #f8f9fa)', color: levelColor[lvl],
                border: `1px solid ${levelColor[lvl]}`,
              }}>{lvl} {n}명</span>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 미가입 — 가장 중요 */}
              <h3 style={{ margin: '8px 0 10px', color: '#ef4444' }}>⚠ 미가입 ({notSignedUp.length}) — 명단에 있으나 회원가입 미확인</h3>
              {notSignedUp.length === 0 ? (
                <p style={{ color: '#10b981', fontSize: '14.5px', marginBottom: '24px' }}>✓ 명단 전원이 가입을 완료했습니다.</p>
              ) : (
                <div className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
                  <table className="admin-table">
                    <thead><tr><th>No</th><th>이름</th><th>성별</th><th>전공</th><th>수준</th></tr></thead>
                    <tbody>
                      {notSignedUp.map((r) => (
                        <tr key={r.student.no}>
                          <td>{r.student.no}</td>
                          <td>{r.student.name}</td>
                          <td>{r.student.gender}</td>
                          <td>{r.student.major}</td>
                          <td style={{ color: levelColor[r.student.level], fontWeight: 700 }}>{r.student.level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 명단외 가입 */}
              {notInRoster.length > 0 && (
                <>
                  <h3 style={{ margin: '8px 0 10px', color: '#d97706' }}>명단외 가입 ({notInRoster.length}) — 운영사 관리자</h3>
                  <div className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
                    <table className="admin-table">
                      <thead><tr><th>이름</th><th>이메일</th><th>전화</th><th>가입경로</th></tr></thead>
                      <tbody>
                        {notInRoster.map((g) => (
                          <tr key={g.key}>
                            <td>
                              {g.name}
                              {g.isMerged && (
                                <span title={`동일인 ${g.accounts.length}계정`} style={{
                                  marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                                  borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                                }}>동일인 {g.accounts.length}</span>
                              )}
                            </td>
                            <td>
                              {g.emails.map((e, i) => (
                                <div key={e} style={i > 0 ? { fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                              ))}
                            </td>
                            <td>{g.phone || '-'}</td>
                            <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{Array.from(new Set(g.accounts.map(a => a.provider).filter(Boolean))).join(', ') || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* 전체 명단 + 가입 상태 */}
              <h3 style={{ margin: '8px 0 10px' }}>전체 명단 ({ROSTER_COUNT})</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>No</th><th>이름</th><th>성별</th><th>전공</th><th>계열</th><th>수준</th><th>가입</th><th>가입 이메일</th></tr></thead>
                  <tbody>
                    {rows.map((r) => {
                      const dropped = !!r.student.dropped;
                      return (
                      <tr key={r.student.no} style={dropped ? { textDecoration: 'line-through', color: 'var(--text-secondary, #9ca3af)', opacity: 0.65 } : undefined}>
                        <td>{r.student.no}</td>
                        <td>
                          {r.student.name}
                          {dropped && (
                            <span style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                              borderRadius: '999px', background: '#f3f4f6', color: '#6b7280',
                              textDecoration: 'none', display: 'inline-block', verticalAlign: 'middle',
                            }}>중도포기</span>
                          )}
                        </td>
                        <td>{r.student.gender}</td>
                        <td>{r.student.major}</td>
                        <td>{r.student.majorCategory}</td>
                        <td style={{ color: dropped ? '#9ca3af' : levelColor[r.student.level], fontWeight: 700 }}>{r.student.level}</td>
                        <td>
                          <span style={{
                            fontSize: '12.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                            textDecoration: 'none',
                            background: dropped ? '#f3f4f6' : (r.person ? '#d1fae5' : '#fee2e2'),
                            color: dropped ? '#6b7280' : (r.person ? '#065f46' : '#991b1b'),
                          }}>{dropped ? '중도포기' : (r.person ? '가입' : '미가입')}</span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                          {r.person ? r.person.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '12px' } : undefined}>{e}</div>
                          )) : '-'}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!loading && profiles.length === 0 && (
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)', marginTop: '12px' }}>
                  ※ Supabase가 연결되지 않았거나 아직 가입한 회원이 없어 가입 데이터를 불러오지 못했습니다.
                  배포 환경(관리자 로그인 상태)에서 정확히 표시됩니다.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminRoster;
