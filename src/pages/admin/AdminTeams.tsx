/**
 * AdminTeams.tsx
 * --------------------------------------------------------------------------
 * 역할:
 *   관리자 전용 "팀 편성 관리" 페이지. 사전에 확정된 팀 명단(CONFIRMED_TEAMS)을
 *   기준으로 DB의 팀 테이블을 일괄 생성/재구성하고, 현재 편성된 팀 목록을 조회·표시한다.
 *
 * 핵심 책임:
 *   1) Supabase에서 팀(teams) 및 사용자 프로필(user_profiles) 데이터를 로드.
 *   2) 확정 명단의 사람 이름을 실제 가입 계정(프로필)과 매칭하여 미리보기 제공.
 *   3) "이 명단으로 팀 생성" 시 기존 팀을 전부 삭제 후 확정 명단 기반으로 재삽입(seed).
 *   4) 현재 팀 카드(팀명·주제·팀원·팀장) 렌더링.
 *
 * 주요 export:
 *   - default AdminTeams: 관리자 팀 편성 관리 페이지 컴포넌트(ReactElement 반환).
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { groupByPerson } from '../../utils/people';
import { CONFIRMED_TEAMS, teamName } from '../../config/teamRoster';
import type { Team, UserProfile } from '../../types';

// 사이트별 DB 접두사를 적용한 실제 테이블명 매핑(멀티사이트에서 테이블 충돌 방지)
const TABLES = { teams: `${site.dbPrefix}teams` };
// 현재 사이트(rest)의 호스트명. 프로필을 이 사이트 소속만 필터링하는 데 사용.
const REST_HOSTNAME = new URL(site.url).hostname;
// 이름 정규화 함수: 소문자화 + 모든 공백 제거 + 트림 → 표기 차이를 무시한 동일성 비교용 키 생성.
const norm = (s?: string | null) => (s || '').toLowerCase().replace(/\s+/g, '').trim();

// 확정 명단 이름과 매칭된 대표 계정 정보를 담는 경량 타입.
interface Person { id: string; name: string; email: string; }

/**
 * AdminTeams 컴포넌트
 * - 매개변수: 없음.
 * - 반환값: 관리자 팀 편성 관리 화면(ReactElement).
 * - 부수효과: 마운트 시 Supabase에서 팀/프로필 로드, 버튼 클릭 시 DB 팀 일괄 재구성.
 */
const AdminTeams = (): ReactElement => {
  const [teams, setTeams] = useState<Team[]>([]);        // DB에서 조회한 현재 팀 목록
  const [profiles, setProfiles] = useState<UserProfile[]>([]); // 이 사이트 소속 사용자 프로필 목록
  const [loading, setLoading] = useState(true);          // 초기/재조회 로딩 상태
  const [busy, setBusy] = useState(false);               // seed(생성) 작업 진행 중 여부 → 버튼 잠금
  const [msg, setMsg] = useState('');                    // 작업 결과 메시지(성공/실패)

  /**
   * load
   * - 무엇: Supabase에서 팀과 사용자 프로필을 병렬로 가져와 상태에 반영.
   * - 매개변수: 없음.
   * - 반환값: Promise<void>.
   * - 부수효과: teams/profiles/loading 상태 갱신.
   */
  const load = async () => {
    const client = getSupabase();
    // Supabase 클라이언트가 없으면(설정 누락 등) 조용히 로딩만 종료.
    if (!client) { setLoading(false); return; }
    // 두 쿼리를 병렬 실행하여 대기 시간 단축.
    const [tRes, pRes] = await Promise.all([
      client.from(TABLES.teams).select('*').order('created_at'),
      // 이 사이트 소속 프로필만: 가입 도메인이 일치하거나 visited_sites 배열에 호스트명 포함(cs = contains).
      client.from('user_profiles').select('*').or(`signup_domain.eq.${REST_HOSTNAME},visited_sites.cs.{${REST_HOSTNAME}}`),
    ]);
    if (tRes.data) setTeams(tRes.data as Team[]);
    if (pRes.data) setProfiles(pRes.data as UserProfile[]);
    setLoading(false);
  };
  // 마운트 시 1회 데이터 로드.
  useEffect(() => { load(); }, []);

  // 이름(실명·표시명·동일인 별칭) → 대표 계정 매핑
  // - groupByPerson으로 동일인을 묶고, 그룹의 모든 이름 표기를 정규화 키로 등록.
  // - profiles가 바뀔 때만 재계산(useMemo)하여 매칭 비용 최소화.
  const nameToPerson = useMemo(() => {
    const m = new Map<string, Person>();
    groupByPerson(profiles).forEach((g) => {
      // 그룹의 대표 계정(primary)을 Person으로 추출. email은 첫 번째 이메일 사용.
      const p: Person = { id: g.primary.id, name: g.name, email: g.emails[0] || '' };
      m.set(norm(g.name), p);
      // 동일인의 모든 계정 이름/표시명도 같은 대표 계정으로 매핑(별칭 흡수).
      g.accounts.forEach((a) => { if (a.name) m.set(norm(a.name), p); if (a.display_name) m.set(norm(a.display_name), p); });
    });
    return m;
  }, [profiles]);

  // 확정 명단 매칭 미리보기
  // - 각 확정 팀의 멤버 이름을 nameToPerson으로 조회하여 매칭 결과(person 또는 null) 부착.
  const preview = useMemo(() => CONFIRMED_TEAMS.map((t) => ({
    ...t,
    matched: t.members.map((name) => ({ name, person: nameToPerson.get(norm(name)) || null })),
  })), [nameToPerson]);
  // 가입 계정과 매칭되지 않은(미매칭) 인원 수 합계.
  const unmatchedCount = preview.reduce((s, t) => s + t.matched.filter((x) => !x.person).length, 0);
  // 가입 계정과 매칭된 인원 수 합계.
  const matchedCount = preview.reduce((s, t) => s + t.matched.filter((x) => x.person).length, 0);

  /**
   * seed
   * - 무엇: 확정 명단 기준으로 팀 테이블을 전면 재구성(기존 전체 삭제 → 신규 일괄 삽입).
   * - 매개변수: 없음.
   * - 반환값: Promise<void>.
   * - 부수효과: 사용자 확인(confirm), DB 삭제/삽입, busy/msg/loading 상태 변경, 성공 시 재조회.
   * - 주의: 파괴적 작업(기존 팀 전부 삭제)이므로 confirm으로 의도 확인.
   */
  const seed = async () => {
    // 파괴적 작업 경고 및 사용자 확인. 취소 시 즉시 중단.
    if (!confirm(`확정 명단으로 ${CONFIRMED_TEAMS.length}개 팀을 생성합니다.\n기존 팀은 모두 삭제됩니다. (미매칭 ${unmatchedCount}명은 이름만 등록)\n계속할까요?`)) return;
    const client = getSupabase();
    if (!client) return;
    setBusy(true); setMsg('');
    // 기존 팀 전체 삭제. delete는 WHERE가 필요하므로 절대 존재하지 않을 더미 UUID로 "id != 더미" 조건을 걸어 전체 매칭.
    const { error: delErr } = await client.from(TABLES.teams).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // 삭제 실패 시 삽입을 진행하지 않고 종료(데이터 일관성 보호).
    if (delErr) { setMsg(`삭제 실패: ${delErr.message}`); setBusy(false); return; }
    // 확정 명단 미리보기를 DB 삽입용 행으로 변환.
    const rows = preview.map((t) => ({
      name: teamName(t.no),
      project_topic: t.topic,
      description: '',
      // 매칭된 사람은 실제 계정 id/email을, 미매칭은 'unmatched:정규화이름' 형태의 임시 id로 식별(이름만 등록).
      members: t.matched.map((x) => ({ id: x.person?.id || `unmatched:${norm(x.name)}`, name: x.name, email: x.person?.email || '', role: '팀원' })),
    }));
    const { error: insErr } = await client.from(TABLES.teams).insert(rows);
    // 삽입 결과 메시지: 실패 시 사유, 성공 시 생성 팀 수 및 매칭/미매칭 통계.
    setMsg(insErr ? `생성 실패: ${insErr.message}` : `✅ ${rows.length}개 팀 생성 완료 (매칭 ${matchedCount}명 · 미매칭 ${unmatchedCount}명)`);
    setBusy(false);
    // 성공 시 최신 상태 반영을 위해 재조회.
    if (!insErr) { setLoading(true); await load(); }
  };

  return (
    <>
      {/* 관리자 페이지 SEO 메타: noindex로 검색엔진 색인 차단 */}
      <SEOHead title="팀 편성 관리" path="/admin/teams" noindex />
      <div className="admin-layout">
        {/* 좌측 관리자 네비게이션 */}
        <AdminSidebar />
        <div className="admin-content">
          <h2>팀 편성 관리</h2>

          {/* 확정 명단 기반 팀 생성 컨트롤 패널 */}
          <div style={{ border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px', padding: '16px 18px', marginBottom: '24px', background: 'var(--bg-light-gray, #f8f9fa)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '15px' }}>📋 확정 명단으로 팀 정리</strong>
                {/* 팀 수 및 매칭 통계 요약. 미매칭이 있을 때만 경고색으로 별도 표시 */}
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                  {CONFIRMED_TEAMS.length}개 팀 · 매칭 {matchedCount}명
                  {unmatchedCount > 0 && <span style={{ color: '#d97706' }}> · 미매칭 {unmatchedCount}명</span>}
                </p>
              </div>
              {/* 팀 일괄 생성 버튼: 작업 중(busy) 또는 로딩 중(loading)이면 비활성화 */}
              <button onClick={seed} disabled={busy || loading} style={{ padding: '9px 16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', borderRadius: '8px', background: 'var(--primary-blue, #0046C8)', color: '#fff' }}>
                {busy ? '처리 중…' : '이 명단으로 팀 생성 (기존 대체)'}
              </button>
            </div>
            {/* 작업 결과 메시지(성공/실패)는 존재할 때만 표시 */}
            {msg && <p style={{ margin: '10px 0 0', fontSize: '13px', fontWeight: 600 }}>{msg}</p>}
            {/* 미매칭 인원이 있으면 "팀명 이름" 목록을 쉼표로 나열하여 안내 */}
            {unmatchedCount > 0 && (
              <p style={{ margin: '10px 0 0', fontSize: '12.5px', color: '#d97706' }}>
                ⚠ 미매칭(가입 계정 없음): {preview.flatMap((t) => t.matched.filter((x) => !x.person).map((x) => `${teamName(t.no)} ${x.name}`)).join(', ')}
              </p>
            )}
            {/* 팀장은 미지정으로 생성되며, 학생이 직접 지원해야 함을 안내 */}
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-secondary, #9ca3af)' }}>※ 팀장은 미지정으로 생성됩니다. 학생이 팀구성 화면에서 먼저 ‘내가 팀장 할게요’를 누른 1명이 팀장이 됩니다.</p>
          </div>

          {/* 상태별 렌더링: 로딩 중 → 스피너 / 팀 있음 → 그리드 / 팀 없음 → 빈 메시지 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : teams.length > 0 ? (
            <div className="teams-grid">
              {teams.map(team => {
                // members가 배열이 아닐 수 있으므로(데이터 방어) 안전하게 빈 배열로 폴백.
                const ms = Array.isArray(team.members) ? team.members : [];
                // 역할이 '팀장'인 멤버를 찾아 헤더에 표기(없으면 '팀장 미정').
                const leader = ms.find((m) => m.role === '팀장');
                return (
                  <div key={team.id} className="team-card">
                    <h3>{team.name}</h3>
                    {/* 프로젝트 주제 우선, 없으면 설명으로 폴백 */}
                    <p>{team.project_topic || team.description}</p>
                    <div className="team-members">
                      <h4>팀원 ({ms.length}명) {leader ? `· 팀장 ${leader.name}` : '· 팀장 미정'}</h4>
                      {/* 각 팀원: 이름 + 팀장 표시(👑) + 미매칭 표시(임시 id 'unmatched:' 접두 시 ⚠) */}
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
