/**
 * ProjectChecklist.tsx — 팀 프로젝트 "수행 점검 · 할 일"
 *
 * [역할]
 *  - 학생(팀원): 내 팀의 표준 마일스톤을 체크/완료하며 진행률(%)을 확인한다.
 *  - 강사(isAdmin): 전체 팀의 진행 현황(진행률·단계별 완료)을 한눈에 모니터링한다.
 *
 * [데이터]
 *  - 표준 항목: data/projectChecklist.ts (CHECKLIST_ITEMS / CHECKLIST_PHASES)
 *  - 팀별 체크 상태: utils/projectChecklist.ts → rest_team_checklist (items JSONB)
 *  - 팀 목록: utils/projectTeams.ts (listTeams)
 */
import { useState, useEffect, useCallback, type ReactElement, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import { listTeams } from '../utils/projectTeams';
import { listCustomTopics, type CustomTopic } from '../utils/projectVote';
import { listChecklists, setChecklistItem } from '../utils/projectChecklist';
import { CHECKLIST_ITEMS, CHECKLIST_PHASES, checklistProgress } from '../data/projectChecklist';
import { buildTeamNumbers } from '../utils/teamNumber';
import type { Team } from '../types';

const ProjectChecklist = (): ReactElement => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  // teams: 전체 팀, checklists: team_id → { itemKey: 완료여부 } 맵
  const [teams, setTeams] = useState<Team[]>([]);
  const [topics, setTopics] = useState<CustomTopic[]>([]); // 미등록 주제 번호 산출용(생성순)
  const [checklists, setChecklists] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // 서버에서 팀·주제·체크상태를 함께 불러온다.
  const reload = useCallback(async () => {
    setLoading(true);
    const [t, tp, c] = await Promise.all([listTeams(), listCustomTopics(), listChecklists()]);
    setTeams(t); setTopics(tp); setChecklists(c);
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  // 팀 t의 팀원 배열을 안전하게 꺼낸다(배열 아니면 빈 배열).
  const members = (t: Team) => (Array.isArray(t.members) ? t.members : []);
  // 내가 속한 팀들(강사는 팀에 포함되지 않으므로 빈 배열).
  const myTeams = user ? teams.filter((t) => members(t).some((m) => m.id === user.id)) : [];
  // 주제 제목 → 고정 번호(미등록 새 주제는 빈 슬롯→22+). 모든 화면과 동일 기준(custom 생성순).
  const teamNos = buildTeamNumbers(teams, topics);

  // 항목 토글: 낙관적으로 화면을 먼저 갱신하고, 실패 시 되돌린다.
  const toggle = async (teamId: string, itemKey: string, done: boolean) => {
    const current = checklists[teamId] || {};
    setBusy(true);
    setChecklists((prev) => ({ ...prev, [teamId]: { ...(prev[teamId] || {}), [itemKey]: done } }));
    const res = await setChecklistItem(teamId, itemKey, done, current);
    setBusy(false);
    if (!res.ok) {
      // 실패 → 원래 상태로 롤백 + 안내
      setChecklists((prev) => ({ ...prev, [teamId]: current }));
      showToast('저장 실패: ' + (res.error || ''), 'error');
    }
  };

  // ── 스타일 ──
  const card: CSSProperties = { background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '18px 20px', color: 'var(--text-primary)' };
  const chip = (bg: string, color: string): CSSProperties => ({ fontSize: '12px', padding: '2px 9px', borderRadius: '999px', background: bg, color, fontWeight: 700 });

  // 진행률 막대 + 라벨.
  const ProgressBar = ({ percent }: { percent: number }): ReactElement => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--bg-light-gray)', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? '#10b981' : 'var(--primary-blue)', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 800, color: percent === 100 ? '#10b981' : 'var(--primary-blue)', minWidth: '42px', textAlign: 'right' }}>{percent}%</span>
    </div>
  );

  // 한 팀의 체크리스트(단계별 그룹). editable면 토글 가능(팀원/강사), 아니면 읽기 전용.
  const TeamChecklist = ({ team, editable }: { team: Team; editable: boolean }): ReactElement => {
    const items = checklists[team.id] || {};
    const { done, total, percent } = checklistProgress(items);
    const leader = members(team).find((m) => m.role === '팀장');
    return (
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px' }}>{teamNos[team.id]}팀 · {team.project_topic}</h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              팀원 {members(team).length}명{leader ? ` · 팀장 ${leader.name}` : ' · 팀장 미정'} · 완료 {done}/{total}
            </p>
          </div>
        </div>
        <div style={{ margin: '12px 0 16px' }}><ProgressBar percent={percent} /></div>
        {/* 단계별로 항목을 묶어 표시 */}
        {CHECKLIST_PHASES.map((phase) => (
          <div key={phase} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '6px' }}>{phase}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {CHECKLIST_ITEMS.filter((it) => it.phase === phase).map((it) => {
                const checked = !!items[it.key];
                return (
                  <label key={it.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', cursor: editable ? 'pointer' : 'default', opacity: editable ? 1 : 0.95 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!editable || busy}
                      onChange={(e) => toggle(team.id, it.key, e.target.checked)}
                      style={{ width: '17px', height: '17px', marginTop: '1px', flexShrink: 0, cursor: editable ? 'pointer' : 'default' }}
                    />
                    <span>
                      <span style={{ fontSize: '14px', fontWeight: 600, textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{it.label}</span>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>{it.desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <SEOHead title="수행 점검 · 할 일" path="/project-checklist" noindex />
      <section className="page-header">
        <div className="container">
          <h2>수행 점검 · 할 일</h2>
          <p>팀 프로젝트를 단계별(기획 → 개발 → 배포·공유 → 발표)로 점검하며 진행하세요. 항목을 완료하면 진행률이 올라갑니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1080px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : isAdmin ? (
            // ── 강사: 전체 팀 진행 현황 모니터링 ──
            <>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-light-gray)', borderRadius: '8px', padding: '10px 14px' }}>
                강사 계정입니다. 전체 팀의 진행률을 모니터링합니다. (체크는 각 팀원이 직접 합니다)
              </div>
              {teams.length === 0 ? (
                <p className="empty-message">편성된 팀이 없습니다.</p>
              ) : (
                // 진행률 높은 순으로 정렬해 한눈에 보기
                [...teams]
                  .sort((a, b) => (teamNos[a.id] ?? 999) - (teamNos[b.id] ?? 999) || a.project_topic.localeCompare(b.project_topic))
                  .map((team) => {
                    const { done, total, percent } = checklistProgress(checklists[team.id]);
                    const items = checklists[team.id] || {};
                    return (
                      <div key={team.id} style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '15.5px' }}>{teamNos[team.id]}팀 · {team.project_topic}</h3>
                          <span style={chip(percent === 100 ? '#d1fae5' : '#dbeafe', percent === 100 ? '#065f46' : '#1e3a8a')}>{done}/{total} 완료</span>
                        </div>
                        <ProgressBar percent={percent} />
                        {/* 단계별 완료 표시(읽기 전용 칩) */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                          {CHECKLIST_ITEMS.map((it) => (
                            <span key={it.key} style={chip(items[it.key] ? '#dcfce7' : 'var(--bg-light-gray)', items[it.key] ? '#166534' : 'var(--text-secondary)')}>
                              {items[it.key] ? '✓' : '○'} {it.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
              )}
            </>
          ) : myTeams.length === 0 ? (
            // ── 학생인데 팀이 없을 때 ──
            <div style={card}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                아직 소속된 팀이 없습니다. <Link to="/project-vote" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>프로젝트 팀구성</Link>에서 주제를 고르고 팀을 만들거나 합류하세요.
              </p>
            </div>
          ) : (
            // ── 학생(팀원): 내 팀 체크리스트 ──
            <>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                내 팀: <strong style={{ color: 'var(--primary-blue)' }}>{myTeams.map((t) => t.name).join(', ')}</strong> · 항목을 체크하며 진행하세요.
              </div>
              {[...myTeams].sort((a, b) => (teamNos[a.id] ?? 999) - (teamNos[b.id] ?? 999)).map((team) => <TeamChecklist key={team.id} team={team} editable />)}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectChecklist;
