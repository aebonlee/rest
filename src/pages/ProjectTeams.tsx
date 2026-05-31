import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import {
  listTeams, findMyTeam, createTeam, joinTeam, leaveTeam, MAX_TEAM_SIZE,
} from '../utils/projectTeams';
import type { Team, TeamMember } from '../types';

const ProjectTeams = (): ReactElement => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');

  const me = (): TeamMember => ({
    id: user!.id,
    name: profile?.name || profile?.display_name || user!.email || '수강생',
    email: profile?.email || user!.email || '',
    role: '팀원',
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setTeams(await listTeams());
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const myTeam = user ? findMyTeam(teams, user.id) : null;

  const handleCreate = async () => {
    if (!name.trim() || !topic.trim()) { showToast('팀 이름과 프로젝트 주제를 입력하세요.', 'warning'); return; }
    setBusy(true);
    const res = await createTeam(name.trim(), topic.trim(), { ...me(), role: '팀장' });
    setBusy(false);
    if (res.ok) { showToast('팀이 생성되었습니다.', 'success'); setName(''); setTopic(''); reload(); }
    else showToast('팀 생성 실패: ' + (res.error || ''), 'error');
  };

  const handleJoin = async (team: Team) => {
    setBusy(true);
    const res = await joinTeam(team, me());
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

  const memberList = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);

  const card: React.CSSProperties = {
    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
    borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '11px 13px', fontSize: '16px', boxSizing: 'border-box',
    border: '1px solid var(--border-light)', borderRadius: '8px',
    background: 'var(--bg-white)', color: 'var(--text-primary)',
  };

  return (
    <>
      <SEOHead title="프로젝트 구성" path="/project-teams" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 구성</h2>
          <p>팀을 만들거나 합류해 경진대회 프로젝트를 준비하세요. (팀당 최대 {MAX_TEAM_SIZE}명)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 내 팀 또는 팀 만들기 */}
              {myTeam ? (
                <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>내 팀</span>
                      <h3 style={{ margin: '4px 0 2px', fontSize: '20px' }}>{myTeam.name}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '15px' }}>주제: {myTeam.project_topic || '미정'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to="/project-board" className="btn btn-primary" style={{ padding: '10px 18px' }}>팀 게시판 →</Link>
                      <button className="btn btn-secondary" style={{ padding: '10px 18px' }} disabled={busy} onClick={() => handleLeave(myTeam)}>팀 나가기</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {memberList(myTeam).map((m, i) => (
                      <span key={i} style={{
                        fontSize: '14px', padding: '4px 12px', borderRadius: '999px',
                        background: 'var(--bg-light-gray)', color: 'var(--text-primary)',
                      }}>
                        {m.name}{m.role === '팀장' && <strong style={{ color: 'var(--primary-blue)' }}> · 팀장</strong>}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={card}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>새 팀 만들기</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '520px' }}>
                    <input style={input} placeholder="팀 이름 (예: 리부트 1팀)" value={name} onChange={(e) => setName(e.target.value)} />
                    <input style={input} placeholder="프로젝트 주제 (예: AI 학습 도우미 챗봇)" value={topic} onChange={(e) => setTopic(e.target.value)} />
                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px' }} disabled={busy} onClick={handleCreate}>팀 생성</button>
                  </div>
                </div>
              )}

              {/* 전체 팀 목록 */}
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: '18px', color: 'var(--text-primary)' }}>전체 팀 ({teams.length})</h3>
                {teams.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>아직 생성된 팀이 없습니다. 첫 팀을 만들어 보세요!</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {teams.map((team) => {
                      const list = memberList(team);
                      const mine = user ? list.some((m) => m.id === user.id) : false;
                      const full = list.length >= MAX_TEAM_SIZE;
                      return (
                        <div key={team.id} style={{ ...card, opacity: mine ? 1 : undefined }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '17px' }}>{team.name}</h4>
                            <span style={{ fontSize: '13px', color: full ? '#ef4444' : 'var(--text-secondary)' }}>{list.length}/{MAX_TEAM_SIZE}</span>
                          </div>
                          <p style={{ margin: '6px 0 12px', fontSize: '14px', color: 'var(--text-secondary)', minHeight: '20px' }}>{team.project_topic || '주제 미정'}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                            {list.map((m, i) => (
                              <span key={i} style={{ fontSize: '13px', padding: '3px 9px', borderRadius: '999px', background: 'var(--bg-light-gray)', color: 'var(--text-secondary)' }}>{m.name}</span>
                            ))}
                          </div>
                          {mine ? (
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>✓ 내 팀</span>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '8px 16px', fontSize: '14px', opacity: (busy || !!myTeam || full) ? 0.5 : 1 }}
                              disabled={busy || !!myTeam || full}
                              onClick={() => handleJoin(team)}
                              title={myTeam ? '이미 다른 팀에 속해 있습니다' : full ? '정원이 가득 찼습니다' : ''}
                            >
                              {full ? '정원 마감' : '합류'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectTeams;
