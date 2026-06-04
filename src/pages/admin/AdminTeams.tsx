import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { groupByPerson } from '../../utils/people';
import { CONFIRMED_TEAMS, teamName } from '../../config/teamRoster';
import type { Team, UserProfile } from '../../types';

const TABLES = { teams: `${site.dbPrefix}teams` };
const REST_HOSTNAME = new URL(site.url).hostname;
const norm = (s?: string | null) => (s || '').toLowerCase().replace(/\s+/g, '').trim();

interface Person { id: string; name: string; email: string; }

const AdminTeams = (): ReactElement => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    const [tRes, pRes] = await Promise.all([
      client.from(TABLES.teams).select('*').order('created_at'),
      client.from('user_profiles').select('*').or(`signup_domain.eq.${REST_HOSTNAME},visited_sites.cs.{${REST_HOSTNAME}}`),
    ]);
    if (tRes.data) setTeams(tRes.data as Team[]);
    if (pRes.data) setProfiles(pRes.data as UserProfile[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // 이름(실명·표시명·동일인 별칭) → 대표 계정 매핑
  const nameToPerson = useMemo(() => {
    const m = new Map<string, Person>();
    groupByPerson(profiles).forEach((g) => {
      const p: Person = { id: g.primary.id, name: g.name, email: g.emails[0] || '' };
      m.set(norm(g.name), p);
      g.accounts.forEach((a) => { if (a.name) m.set(norm(a.name), p); if (a.display_name) m.set(norm(a.display_name), p); });
    });
    return m;
  }, [profiles]);

  // 확정 명단 매칭 미리보기
  const preview = useMemo(() => CONFIRMED_TEAMS.map((t) => ({
    ...t,
    matched: t.members.map((name) => ({ name, person: nameToPerson.get(norm(name)) || null })),
  })), [nameToPerson]);
  const unmatchedCount = preview.reduce((s, t) => s + t.matched.filter((x) => !x.person).length, 0);
  const matchedCount = preview.reduce((s, t) => s + t.matched.filter((x) => x.person).length, 0);

  const seed = async () => {
    if (!confirm(`확정 명단으로 ${CONFIRMED_TEAMS.length}개 팀을 생성합니다.\n기존 팀은 모두 삭제됩니다. (미매칭 ${unmatchedCount}명은 이름만 등록)\n계속할까요?`)) return;
    const client = getSupabase();
    if (!client) return;
    setBusy(true); setMsg('');
    const { error: delErr } = await client.from(TABLES.teams).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) { setMsg(`삭제 실패: ${delErr.message}`); setBusy(false); return; }
    const rows = preview.map((t) => ({
      name: teamName(t.no),
      project_topic: t.topic,
      description: '',
      members: t.matched.map((x) => ({ id: x.person?.id || `unmatched:${norm(x.name)}`, name: x.name, email: x.person?.email || '', role: '팀원' })),
    }));
    const { error: insErr } = await client.from(TABLES.teams).insert(rows);
    setMsg(insErr ? `생성 실패: ${insErr.message}` : `✅ ${rows.length}개 팀 생성 완료 (매칭 ${matchedCount}명 · 미매칭 ${unmatchedCount}명)`);
    setBusy(false);
    if (!insErr) { setLoading(true); await load(); }
  };

  return (
    <>
      <SEOHead title="팀 편성 관리" path="/admin/teams" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h2>팀 편성 관리</h2>

          <div style={{ border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px', padding: '16px 18px', marginBottom: '24px', background: 'var(--bg-light-gray, #f8f9fa)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '15px' }}>📋 확정 명단으로 팀 정리</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                  {CONFIRMED_TEAMS.length}개 팀 · 매칭 {matchedCount}명
                  {unmatchedCount > 0 && <span style={{ color: '#d97706' }}> · 미매칭 {unmatchedCount}명</span>}
                </p>
              </div>
              <button onClick={seed} disabled={busy || loading} style={{ padding: '9px 16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', borderRadius: '8px', background: 'var(--primary-blue, #0046C8)', color: '#fff' }}>
                {busy ? '처리 중…' : '이 명단으로 팀 생성 (기존 대체)'}
              </button>
            </div>
            {msg && <p style={{ margin: '10px 0 0', fontSize: '13px', fontWeight: 600 }}>{msg}</p>}
            {unmatchedCount > 0 && (
              <p style={{ margin: '10px 0 0', fontSize: '12.5px', color: '#d97706' }}>
                ⚠ 미매칭(가입 계정 없음): {preview.flatMap((t) => t.matched.filter((x) => !x.person).map((x) => `${teamName(t.no)} ${x.name}`)).join(', ')}
              </p>
            )}
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-secondary, #9ca3af)' }}>※ 팀장은 미지정으로 생성됩니다. 학생이 팀구성 화면에서 먼저 ‘내가 팀장 할게요’를 누른 1명이 팀장이 됩니다.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : teams.length > 0 ? (
            <div className="teams-grid">
              {teams.map(team => {
                const ms = Array.isArray(team.members) ? team.members : [];
                const leader = ms.find((m) => m.role === '팀장');
                return (
                  <div key={team.id} className="team-card">
                    <h3>{team.name}</h3>
                    <p>{team.project_topic || team.description}</p>
                    <div className="team-members">
                      <h4>팀원 ({ms.length}명) {leader ? `· 팀장 ${leader.name}` : '· 팀장 미정'}</h4>
                      <ul>{ms.map((m, i) => <li key={i}>{m.name} {m.role === '팀장' ? '👑 팀장' : ''}{String(m.id).startsWith('unmatched:') ? ' ⚠미매칭' : ''}</li>)}</ul>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-message">팀이 아직 편성되지 않았습니다. 위 ‘확정 명단으로 팀 생성’을 눌러 편성하세요.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminTeams;
