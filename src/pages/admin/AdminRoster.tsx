import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { ROSTER, ROSTER_COUNT, type RosterStudent } from '../../data/rosterData';
import type { UserProfile } from '../../types';

const REST_HOSTNAME = new URL(site.url).hostname;
const STAFF_ROLES = ['admin', 'superadmin'];

const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '').trim();

interface RosterRow {
  student: RosterStudent;
  profile: UserProfile | null;
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
      const list = ((data || []) as UserProfile[]).filter((u) => !STAFF_ROLES.includes(u.role));
      setProfiles(list);
      setLoading(false);
    };
    load();
  }, []);

  const { rows, notInRoster, matchedCount } = useMemo(() => {
    const byName = new Map<string, UserProfile>();
    profiles.forEach((p) => {
      if (p.name) byName.set(norm(p.name), p);
      if (p.display_name) byName.set(norm(p.display_name), p);
    });
    const used = new Set<string>();
    const rows: RosterRow[] = ROSTER.map((student) => {
      const profile = byName.get(norm(student.name)) || null;
      if (profile) used.add(profile.id);
      return { student, profile };
    });
    return {
      rows,
      matchedCount: rows.filter((r) => r.profile).length,
      notInRoster: profiles.filter((p) => !used.has(p.id)),
    };
  }, [profiles]);

  const notSignedUp = rows.filter((r) => !r.profile);

  // 경험 수준 분포
  const levelDist = useMemo(() => {
    const d: Record<string, number> = { 입문: 0, 기초: 0, 경험자: 0 };
    ROSTER.forEach((s) => { d[s.level] += 1; });
    return d;
  }, []);

  const summary = [
    { label: '명단 인원', val: ROSTER_COUNT, color: 'var(--text-primary, #1a1a1a)' },
    { label: '가입 회원', val: profiles.length, color: 'var(--primary-blue, #0046C8)' },
    { label: '일치(가입완료)', val: matchedCount, color: '#10b981' },
    { label: '미가입', val: notSignedUp.length, color: '#ef4444' },
    { label: '명단외 가입', val: notInRoster.length, color: '#d97706' },
  ];

  return (
    <>
      <SEOHead title="수강생 명단 대조" path="/admin/roster" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>수강생 명단 ↔ 회원가입 대조</h2>
            <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)' }}>
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
                <div style={{ fontSize: '22px', fontWeight: 800, color: c.color }}>{c.val}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* 경험 수준 분포 */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '13px' }}>
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
                <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '24px' }}>✓ 명단 전원이 가입을 완료했습니다.</p>
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
                  <h3 style={{ margin: '8px 0 10px', color: '#d97706' }}>명단외 가입 ({notInRoster.length}) — 가입했으나 명단에 이름 없음</h3>
                  <div className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
                    <table className="admin-table">
                      <thead><tr><th>이름</th><th>이메일</th><th>전화</th><th>가입경로</th></tr></thead>
                      <tbody>
                        {notInRoster.map((p) => (
                          <tr key={p.id}>
                            <td>{p.display_name || p.name || '-'}</td>
                            <td>{p.email}</td>
                            <td>{p.phone || '-'}</td>
                            <td style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>{p.provider || '-'}</td>
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
                    {rows.map((r) => (
                      <tr key={r.student.no}>
                        <td>{r.student.no}</td>
                        <td>{r.student.name}</td>
                        <td>{r.student.gender}</td>
                        <td>{r.student.major}</td>
                        <td>{r.student.majorCategory}</td>
                        <td style={{ color: levelColor[r.student.level], fontWeight: 700 }}>{r.student.level}</td>
                        <td>
                          <span style={{
                            fontSize: '11.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                            background: r.profile ? '#d1fae5' : '#fee2e2',
                            color: r.profile ? '#065f46' : '#991b1b',
                          }}>{r.profile ? '가입' : '미가입'}</span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>{r.profile?.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && profiles.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)', marginTop: '12px' }}>
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
