import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import { PRESET_TOPICS } from '../data/projectTopics';
import {
  listCustomTopics, listVotes, addTopic, deleteTopic, castVote, retractVote,
  type CustomTopic, type TopicVote,
} from '../utils/projectVote';
import {
  listTeams, findMyTeam, createTeam, joinTeam, leaveTeam, MAX_TEAM_SIZE,
} from '../utils/projectTeams';
import type { Team, TeamMember } from '../types';

interface Row {
  key: string;
  title: string;
  description: string;
  isPreset: boolean;
  ownerId?: string;
}

const ProjectVote = (): ReactElement => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [custom, setCustom] = useState<CustomTopic[]>([]);
  const [votes, setVotes] = useState<TopicVote[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const userName = profile?.name || profile?.display_name || user?.email || '수강생';
  const me = (role: string): TeamMember => ({
    id: user!.id, name: userName, email: profile?.email || user?.email || '', role,
  });

  const reload = useCallback(async () => {
    setLoading(true);
    const [c, v, t] = await Promise.all([listCustomTopics(), listVotes(), listTeams()]);
    setCustom(c); setVotes(v); setTeams(t);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const myVoteKey = useMemo(() => votes.find((v) => v.user_id === user?.id)?.topic_key, [votes, user]);
  const myTeam = useMemo(() => (user ? findMyTeam(teams, user.id) : null), [teams, user]);

  const votersByKey = useMemo(() => {
    const m: Record<string, string[]> = {};
    votes.forEach((v) => { (m[v.topic_key] ||= []).push(v.user_name || '익명'); });
    return m;
  }, [votes]);

  const rows: Row[] = useMemo(() => {
    const presetRows: Row[] = PRESET_TOPICS.map((t) => ({ key: t.key, title: t.title, description: t.description, isPreset: true }));
    const customRows: Row[] = custom.map((c) => ({ key: c.id, title: c.title, description: c.description, isPreset: false, ownerId: c.created_by }));
    return [...presetRows, ...customRows].sort((a, b) => (votersByKey[b.key]?.length || 0) - (votersByKey[a.key]?.length || 0));
  }, [custom, votersByKey]);

  const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);
  const teamForTitle = (title: string): Team | undefined =>
    teams.find((t) => (t.project_topic || '').trim() === title.trim());

  const handleVote = async (key: string) => {
    if (!user) return;
    setBusy(true);
    const res = myVoteKey === key ? await retractVote(user.id) : await castVote(key, user.id, userName);
    setBusy(false);
    if (res.ok) { showToast(myVoteKey === key ? '투표를 취소했습니다.' : '투표 완료!', 'success'); reload(); }
    else showToast('투표 실패: ' + (res.error || ''), 'error');
  };

  const handleCreateTeam = async (title: string) => {
    if (myTeam) { showToast('이미 다른 팀에 속해 있습니다.', 'warning'); return; }
    setBusy(true);
    const res = await createTeam(title, title, me('팀장'));
    setBusy(false);
    if (res.ok) { showToast(`'${title}' 팀이 만들어졌습니다!`, 'success'); reload(); }
    else showToast('팀 생성 실패: ' + (res.error || ''), 'error');
  };

  const handleJoin = async (team: Team) => {
    setBusy(true);
    const res = await joinTeam(team, me('팀원'));
    setBusy(false);
    if (res.ok) { showToast(`'${team.name}' 팀에 합류했습니다.`, 'success'); reload(); }
    else showToast(res.error === 'full' ? '정원이 가득 찼습니다.' : '합류 실패: ' + (res.error || ''), 'error');
  };

  const handleLeave = async (team: Team) => {
    if (!confirm(`'${team.name}' 팀에서 나가시겠습니까?`)) return;
    setBusy(true);
    const res = await leaveTeam(team, user!.id);
    setBusy(false);
    if (res.ok) { showToast('팀에서 나왔습니다.', 'info'); reload(); }
    else showToast('탈퇴 실패: ' + (res.error || ''), 'error');
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) { showToast('주제 제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    const res = await addTopic(newTitle.trim(), newDesc.trim(), user!.id, userName);
    setBusy(false);
    if (res.ok) { setNewTitle(''); setNewDesc(''); showToast('새 주제가 추가되었습니다.', 'success'); reload(); }
    else showToast('추가 실패: ' + (res.error || ''), 'error');
  };

  const handleDeleteTopic = async (key: string) => {
    if (!confirm('이 주제를 삭제할까요? (투표도 함께 사라집니다)')) return;
    const res = await deleteTopic(key);
    if (res.ok) { showToast('주제를 삭제했습니다.', 'info'); reload(); }
    else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  const card: React.CSSProperties = {
    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
    borderRadius: '14px', padding: '18px 20px', color: 'var(--text-primary)',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '11px 13px', fontSize: '16px', boxSizing: 'border-box',
    border: '1px solid var(--border-light)', borderRadius: '8px',
    background: 'var(--bg-white)', color: 'var(--text-primary)',
  };
  const chip = (bg: string, color: string): React.CSSProperties => ({
    fontSize: '13px', padding: '3px 10px', borderRadius: '999px', background: bg, color,
  });
  const maxCount = Math.max(1, ...rows.map((r) => votersByKey[r.key]?.length || 0));

  return (
    <>
      <SEOHead title="팀구성 — 주제 투표" path="/project-vote" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀구성 · 주제 투표</h2>
          <p>주제에 투표하면 관심 있는 사람이 모입니다. 바로 팀을 만들거나 합류해 보세요. (1인 1표)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '880px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                총 <strong style={{ color: 'var(--primary-blue)' }}>{votes.length}</strong>표 · 주제 {rows.length}개
                {myTeam && <span> · 내 팀: <strong style={{ color: 'var(--primary-blue)' }}>{myTeam.name}</strong> <Link to="/project-board" style={{ color: 'var(--primary-blue)' }}>(게시판)</Link></span>}
              </div>

              {rows.map((r, idx) => {
                const voters = votersByKey[r.key] || [];
                const mineVote = myVoteKey === r.key;
                const team = teamForTitle(r.title);
                const inThisTeam = !!team && !!user && members(team).some((m) => m.id === user.id);
                const full = !!team && members(team).length >= MAX_TEAM_SIZE;
                const canDelete = !r.isPreset && (r.ownerId === user?.id || isAdmin);
                return (
                  <div key={r.key} style={{ ...card, borderLeft: mineVote ? '4px solid var(--primary-blue)' : '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-blue)' }}>{idx + 1}위</span>
                          <h3 style={{ margin: 0, fontSize: '17px' }}>{r.title}</h3>
                          {!r.isPreset && <span style={chip('var(--bg-light-gray)', 'var(--text-secondary)')}>학생 제안</span>}
                          {team && <span style={chip('#dbeafe', '#1e3a8a')}>팀 결성됨 {members(team).length}/{MAX_TEAM_SIZE}</span>}
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.description}</p>
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: mineVote ? 'var(--primary-blue)' : 'var(--text-primary)' }}>{voters.length}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>표</div>
                      </div>
                    </div>

                    <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-light-gray)', overflow: 'hidden', margin: '12px 0' }}>
                      <div style={{ width: `${(voters.length / maxCount) * 100}%`, height: '100%', background: 'var(--primary-blue)', transition: 'width 0.3s' }} />
                    </div>

                    {/* 투표한 사람 */}
                    {voters.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>투표:</span>
                        {voters.map((n, i) => <span key={i} style={chip('var(--bg-light-gray)', 'var(--text-primary)')}>{n}</span>)}
                      </div>
                    )}

                    {/* 팀 결성 현황 */}
                    {team && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 700 }}>팀원:</span>
                        {members(team).map((m, i) => (
                          <span key={i} style={chip('#eff6ff', '#1e40af')}>{m.name}{m.role === '팀장' && ' · 팀장'}</span>
                        ))}
                      </div>
                    )}

                    {/* 액션 */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        className={mineVote ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ padding: '8px 18px', fontSize: '14px' }}
                        disabled={busy}
                        onClick={() => handleVote(r.key)}
                      >
                        {mineVote ? '✓ 내 투표 (취소)' : '이 주제에 투표'}
                      </button>

                      {!team && !myTeam && (
                        <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }} disabled={busy} onClick={() => handleCreateTeam(r.title)}>
                          이 주제로 팀 만들기
                        </button>
                      )}
                      {team && inThisTeam && (
                        <>
                          <Link to="/project-board" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>팀 게시판 →</Link>
                          <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '14px' }} disabled={busy} onClick={() => handleLeave(team)}>팀 나가기</button>
                        </>
                      )}
                      {team && !inThisTeam && !myTeam && (
                        <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '14px', opacity: full ? 0.5 : 1 }} disabled={busy || full} onClick={() => handleJoin(team)}>
                          {full ? '정원 마감' : '이 팀에 합류'}
                        </button>
                      )}

                      {canDelete && (
                        <button onClick={() => handleDeleteTopic(r.key)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>주제 삭제</button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 새 주제 추가 */}
              <div style={card}>
                <h3 style={{ margin: '0 0 12px', fontSize: '17px' }}>새 주제 제안</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input style={input} placeholder="주제 제목 (예: 우리 동네 안전 지도 앱)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <input style={input} placeholder="한 줄 설명 (선택)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px' }} disabled={busy} onClick={handleAdd}>주제 추가</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectVote;
