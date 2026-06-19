/**
 * CompetitionPreEval.tsx — 경진대회 · 프로젝트 사전평가
 *
 * [역할]
 *  - 수강생(로그인 사용자)이 23개 팀 프로젝트를 5개 항목(각 20점, 합 100점)으로 평가한다.
 *    · 주제 / 아이디어 / 사업화 가능성 / 구현1·디자인 / 구현2·프로그래밍 + 종합평(자유 서술)
 *  - 화면 아래쪽에 프로젝트별 집계 결과(평균 점수·순위)를 바로 보여 준다.
 *
 * [핵심 책임]
 *  - 1인 1프로젝트 1건(재평가 시 갱신) — utils/projectEval.upsertEval에 위임.
 *  - 본인이 속한 팀은 평가에서 제외(공정성) — 이름 매칭으로 판별해 비활성화.
 *  - 점수 입력은 0~20으로 제한, 합계/평균은 화면에서 계산.
 *
 * [주요 export]
 *  - default CompetitionPreEval
 *
 * [초보자 메모]
 *  - 이 파일은 리액트 컴포넌트(화면 한 조각을 만드는 함수)다. 끝에서 JSX(설계도)를 return 한다.
 *  - 상태(state): 화면이 기억하는 값. 바뀌면 화면이 다시 그려진다(useState).
 *  - 데이터 저장/조회는 직접 하지 않고 utils/projectEval 함수에 맡긴다(역할 분리).
 */
import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import { EmojiIcon } from '../utils/emojiIcon';
import { TEAM_PROJECTS } from '../data/teamProjects';
import {
  listEvals, upsertEval, deleteEval, totalOf,
  EVAL_CRITERIA, MAX_PER_CRITERION, MAX_TOTAL,
  type ProjectEval, type EvalScores,
} from '../utils/projectEval';

// 점수 5개 항목 0으로 초기화한 빈 점수.
const ZERO_SCORES: EvalScores = {
  score_topic: 0, score_idea: 0, score_biz: 0, score_design: 0, score_program: 0,
};

// 한 프로젝트 카드의 임시 입력값(저장 전 로컬 상태).
type Draft = EvalScores & { comment: string };

// 이름 정규화(공백 제거·소문자) — 본인 팀 판별 시 표기 차이를 무시하기 위함.
const norm = (s: string): string => (s || '').replace(/\s+/g, '').toLowerCase();

const CompetitionPreEval = (): ReactElement => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();

  // ── 상태 ──
  const [evals, setEvals] = useState<ProjectEval[]>([]);     // 전체 평가(집계 + 내 평가 판별)
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);     // 저장/삭제 중인 project_id(중복 클릭 방지)
  const [drafts, setDrafts] = useState<Record<number, Draft>>({}); // 프로젝트별 임시 입력값

  // 내 표시 이름(저장·본인 팀 판별에 사용).
  const userName = profile?.name || profile?.display_name || user?.email || '수강생';

  // 서버에서 전체 평가를 다시 불러와 상태/드래프트를 동기화.
  const reload = useCallback(async () => {
    setLoading(true);
    const list = await listEvals();
    setEvals(list);
    // 내 평가를 드래프트 초기값으로 채운다(없으면 0).
    if (user) {
      const mine = list.filter((e) => e.evaluator_id === user.id);
      const next: Record<number, Draft> = {};
      for (const e of mine) {
        next[e.project_id] = {
          score_topic: e.score_topic, score_idea: e.score_idea, score_biz: e.score_biz,
          score_design: e.score_design, score_program: e.score_program, comment: e.comment || '',
        };
      }
      setDrafts(next);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  // 내 평가를 project_id로 빠르게 찾기 위한 맵.
  const myEvalByProject = useMemo(() => {
    const m = new Map<number, ProjectEval>();
    if (user) for (const e of evals) if (e.evaluator_id === user.id) m.set(e.project_id, e);
    return m;
  }, [evals, user]);

  // 프로젝트별 집계(평가 수·항목 평균·총점 평균) — 화면 아래 결과표용.
  const results = useMemo(() => {
    const byProject = new Map<number, ProjectEval[]>();
    for (const e of evals) {
      const arr = byProject.get(e.project_id) || [];
      arr.push(e); byProject.set(e.project_id, arr);
    }
    const rows = TEAM_PROJECTS.map((p) => {
      const arr = byProject.get(p.id) || [];
      const n = arr.length;
      // 항목별 평균(평가 없으면 0).
      const avgBy = EVAL_CRITERIA.map((c) => ({
        key: c.key, label: c.label,
        avg: n ? arr.reduce((s, e) => s + (e[c.key] || 0), 0) / n : 0,
      }));
      const avgTotal = n ? arr.reduce((s, e) => s + totalOf(e), 0) / n : 0;
      return { project: p, count: n, avgBy, avgTotal };
    });
    // 평가가 1건 이상인 항목을 총점 평균 내림차순으로(동점이면 평가 수 많은 순) 정렬.
    return rows
      .filter((r) => r.count > 0)
      .sort((a, b) => b.avgTotal - a.avgTotal || b.count - a.count);
  }, [evals]);

  // 내 평가 진행 수(저장된 것 기준).
  const myDoneCount = myEvalByProject.size;

  // 특정 프로젝트의 현재 드래프트(없으면 0점 + 빈 종합평).
  const draftOf = (pid: number): Draft => drafts[pid] || { ...ZERO_SCORES, comment: '' };

  // 점수 입력 변경(0~20으로 보정).
  const setScore = (pid: number, key: keyof EvalScores, raw: string) => {
    let v = Math.round(Number(raw));
    if (!Number.isFinite(v)) v = 0;
    v = Math.max(0, Math.min(MAX_PER_CRITERION, v));
    setDrafts((prev) => ({ ...prev, [pid]: { ...draftOf(pid), [key]: v } }));
  };

  // 종합평 변경.
  const setComment = (pid: number, text: string) => {
    setDrafts((prev) => ({ ...prev, [pid]: { ...draftOf(pid), comment: text } }));
  };

  // 평가 저장(업서트).
  const handleSave = async (pid: number) => {
    if (!user) { showToast('로그인 후 평가할 수 있습니다.', 'warning'); return; }
    const d = draftOf(pid);
    setBusy(pid);
    const res = await upsertEval({ project_id: pid, evaluator_id: user.id, evaluator_name: userName, ...d });
    setBusy(null);
    if (res.ok) { showToast(`${pid}번 프로젝트 평가를 저장했습니다.`, 'success'); reload(); }
    else showToast('저장 실패: ' + (res.error || ''), 'error');
  };

  // 내 평가 삭제.
  const handleDelete = async (pid: number) => {
    if (!user) return;
    if (!confirm(`${pid}번 프로젝트에 대한 내 평가를 삭제할까요?`)) return;
    setBusy(pid);
    const res = await deleteEval(pid, user.id);
    setBusy(null);
    if (res.ok) {
      // 드래프트도 비워 둔다.
      setDrafts((prev) => { const n = { ...prev }; delete n[pid]; return n; });
      showToast('평가를 삭제했습니다.', 'info'); reload();
    } else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  // ── 스타일(ProjectVote와 동일 톤) ──
  const card: React.CSSProperties = {
    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
    borderRadius: '14px', padding: '18px 20px', color: 'var(--text-primary)',
  };
  const scoreInput: React.CSSProperties = {
    width: '64px', padding: '8px 10px', fontSize: '15px', textAlign: 'center', boxSizing: 'border-box',
    border: '1px solid var(--border-light)', borderRadius: '8px',
    background: 'var(--bg-white)', color: 'var(--text-primary)',
  };
  const chip = (bg: string, color: string): React.CSSProperties => ({
    fontSize: '12.5px', padding: '3px 10px', borderRadius: '999px', background: bg, color, whiteSpace: 'nowrap',
  });

  return (
    <>
      <SEOHead title="프로젝트 사전평가 — AI 리부트 경진대회" path="/competition/pre-eval" noindex />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 사전평가</h2>
          <p>
            23개 팀 프로젝트를 <strong>주제 · 아이디어 · 사업화 가능성 · 구현1(디자인) · 구현2(프로그래밍)</strong>
            {' '}5개 항목(각 20점, 합 100점)으로 평가해 주세요. 저장 후 아래에서 집계 결과를 볼 수 있습니다.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1080px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 진행 요약 */}
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                내 평가 진행: <strong style={{ color: 'var(--primary-blue)' }}>{myDoneCount}</strong> / {TEAM_PROJECTS.length}개
                <span style={{ marginLeft: '10px' }}>· 각 항목 0~{MAX_PER_CRITERION}점 · 합계 {MAX_TOTAL}점</span>
              </div>

              {isAdmin && (
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-light-gray)', borderRadius: '8px', padding: '10px 14px' }}>
                  강사 계정도 평가를 입력할 수 있습니다(참고용). 본인 팀 자동 제외는 수강생 기준이라 강사에게는 적용되지 않습니다.
                </div>
              )}

              {/* ── 평가 입력 카드 목록 ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '16px', alignItems: 'start' }}>
                {TEAM_PROJECTS.map((p) => {
                  const d = draftOf(p.id);
                  const saved = myEvalByProject.get(p.id);
                  const total = totalOf(d);
                  // 본인 팀 판별: 내 이름이 이 프로젝트 팀원 명단에 있으면 평가 제외(강사는 제외 안 함).
                  const isMyTeam = !isAdmin && !!user && p.members.some((m) => norm(m) === norm(userName));
                  const disabled = isMyTeam || busy === p.id;
                  return (
                    <div key={p.id} style={{ ...card, borderLeft: saved ? '4px solid var(--primary-blue)' : '1px solid var(--border-light)' }}>
                      {/* 헤더: 번호 · 제목 · 상태 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-blue)' }}>{p.id}팀</span>
                        <h3 style={{ margin: 0, fontSize: '16px', flex: 1, minWidth: 0 }}>{p.title}</h3>
                        {isMyTeam && <span style={chip('#fef3c7', '#92400e')}>우리 팀 · 평가 제외</span>}
                        {saved && !isMyTeam && <span style={chip('#dbeafe', '#1e3a8a')}>저장됨 {totalOf(saved)}점</span>}
                      </div>
                      <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.tagline}</p>

                      {/* 5개 항목 점수 입력 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {EVAL_CRITERIA.map((c) => (
                          <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: '14px', fontWeight: 600 }}>{c.label}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{c.desc}</span>
                            </div>
                            <input
                              type="number" min={0} max={MAX_PER_CRITERION} step={1}
                              style={{ ...scoreInput, opacity: disabled ? 0.5 : 1 }}
                              value={d[c.key]} disabled={disabled}
                              onChange={(e) => setScore(p.id, c.key, e.target.value)}
                            />
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '28px' }}>/{MAX_PER_CRITERION}</span>
                          </div>
                        ))}
                      </div>

                      {/* 합계 */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>합계</span>
                        <strong style={{ fontSize: '20px', color: 'var(--primary-blue)' }}>{total}</strong>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {MAX_TOTAL}점</span>
                      </div>

                      {/* 종합평 */}
                      <textarea
                        placeholder="종합평 (자유 서술 · 선택)"
                        value={d.comment} disabled={disabled}
                        onChange={(e) => setComment(p.id, e.target.value)}
                        style={{
                          width: '100%', minHeight: '60px', padding: '10px 12px', fontSize: '14px',
                          boxSizing: 'border-box', borderRadius: '8px', border: '1px solid var(--border-light)',
                          background: 'var(--bg-white)', color: 'var(--text-primary)', resize: 'vertical',
                          opacity: disabled ? 0.5 : 1, marginBottom: '12px',
                        }}
                      />

                      {/* 액션 */}
                      {isMyTeam ? (
                        <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>본인이 속한 팀이라 평가할 수 없습니다.</p>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }} disabled={busy === p.id} onClick={() => handleSave(p.id)}>
                            {saved ? '평가 수정' : '평가 저장'}
                          </button>
                          {saved && (
                            <button onClick={() => handleDelete(p.id)} disabled={busy === p.id} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>
                              삭제
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── 집계 결과 ── */}
              <div style={{ ...card, marginTop: '10px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}><EmojiIcon char="📊" /> 평가 결과 (집계)</h3>
                <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  현재까지 등록된 평가의 프로젝트별 평균 점수입니다. 평가가 추가될 때마다 자동으로 갱신됩니다.
                </p>
                {results.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>아직 등록된 평가가 없습니다. 위에서 첫 평가를 남겨 보세요.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', minWidth: '720px' }}>
                      <thead>
                        <tr style={{ textAlign: 'center', color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-light)' }}>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>순위</th>
                          <th style={{ padding: '8px 6px', textAlign: 'left' }}>프로젝트</th>
                          {EVAL_CRITERIA.map((c) => (
                            <th key={c.key} style={{ padding: '8px 6px' }}>{c.label.replace(' · ', '·')}</th>
                          ))}
                          <th style={{ padding: '8px 6px' }}>평균 총점</th>
                          <th style={{ padding: '8px 6px' }}>평가 수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, idx) => (
                          <tr key={r.project.id} style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'center' }}>
                            <td style={{ padding: '8px 6px', fontWeight: 800, color: idx < 3 ? 'var(--primary-blue)' : 'var(--text-secondary)' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 6px', textAlign: 'left' }}>
                              <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{r.project.id}팀</span>{' '}
                              <span>{r.project.title}</span>
                            </td>
                            {r.avgBy.map((a) => (
                              <td key={a.key} style={{ padding: '8px 6px', color: 'var(--text-secondary)' }}>{a.avg.toFixed(1)}</td>
                            ))}
                            <td style={{ padding: '8px 6px', fontWeight: 800, color: 'var(--primary-blue)' }}>{r.avgTotal.toFixed(1)}</td>
                            <td style={{ padding: '8px 6px', color: 'var(--text-secondary)' }}>{r.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default CompetitionPreEval;
