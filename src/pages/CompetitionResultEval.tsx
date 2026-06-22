/**
 * CompetitionResultEval.tsx — 경진대회 · 프로젝트 결과평가(최종)
 *
 * [역할]
 *  - 사전평가 상위 10팀을 대상으로, 10개 항목(각 20점, 합 200점)으로 최종 평가한다.
 *    주제 / 아이디어 / 팀역량 / 사업화 가능성 / 디자인 / 프로그래밍 /
 *    AI 기능개발 / Solar 활용 / 완성도 / 발표·시연 + 종합평
 *  - 구조·UX는 사전평가(CompetitionPreEval)와 동일. 집계는 별도 '결과평가 집계표'에서.
 *
 * [대상 팀]
 *  - 사전평가 집계 상위 10팀을 자동 선정(데이터가 쌓이면 자동 반영, 확정 전엔 잠정).
 *
 * [주요 export]
 *  - default CompetitionResultEval
 */
import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import { EmojiIcon } from '../utils/emojiIcon';
import { TEAM_PROJECTS } from '../data/teamProjects';
import { listEvals, aggregateEvals } from '../utils/projectEval'; // 사전평가 → 상위 10팀 산정
import {
  listResultEvals, upsertResultEval, deleteResultEval, totalOfResult, selectResultTargets,
  RESULT_CRITERIA, RESULT_MAX_PER_CRITERION, RESULT_MAX_TOTAL,
  type ProjectResultEval, type ResultScores,
} from '../utils/projectResultEval';

// 점수 10개 항목 0으로 초기화.
const ZERO_SCORES: ResultScores = {
  score_topic: 0, score_idea: 0, score_team: 0, score_biz: 0, score_design: 0,
  score_program: 0, score_ai: 0, score_solar: 0, score_completion: 0, score_present: 0,
};

type Draft = ResultScores & { comment: string };

const norm = (s: string): string => (s || '').replace(/\s+/g, '').toLowerCase();

const CompetitionResultEval = (): ReactElement => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [preEvals, setPreEvals] = useState<Awaited<ReturnType<typeof listEvals>>>([]); // 사전평가(대상 산정용)
  const [evals, setEvals] = useState<ProjectResultEval[]>([]);                          // 결과평가
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});

  const userName = profile?.name || profile?.display_name || user?.email || '수강생';

  const reload = useCallback(async () => {
    setLoading(true);
    const [pre, list] = await Promise.all([listEvals(), listResultEvals()]);
    setPreEvals(pre);
    setEvals(list);
    if (user) {
      const mine = list.filter((e) => e.evaluator_id === user.id);
      const next: Record<number, Draft> = {};
      for (const e of mine) {
        next[e.project_id] = {
          score_topic: e.score_topic, score_idea: e.score_idea, score_team: e.score_team,
          score_biz: e.score_biz, score_design: e.score_design, score_program: e.score_program,
          score_ai: e.score_ai, score_solar: e.score_solar, score_completion: e.score_completion,
          score_present: e.score_present, comment: e.comment || '',
        };
      }
      setDrafts(next);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  // 사전평가 상위 10팀(+ 수동 보정). 선정 로직은 selectResultTargets로 일원화.
  const targetProjects = useMemo(
    () => selectResultTargets(aggregateEvals(preEvals), TEAM_PROJECTS),
    [preEvals],
  );

  const myEvalByProject = useMemo(() => {
    const m = new Map<number, ProjectResultEval>();
    if (user) for (const e of evals) if (e.evaluator_id === user.id) m.set(e.project_id, e);
    return m;
  }, [evals, user]);

  const myDoneCount = useMemo(
    () => targetProjects.filter((p) => myEvalByProject.has(p.id)).length,
    [targetProjects, myEvalByProject],
  );

  const draftOf = (pid: number): Draft => drafts[pid] || { ...ZERO_SCORES, comment: '' };

  const setScore = (pid: number, key: keyof ResultScores, raw: string) => {
    let v = Math.round(Number(raw));
    if (!Number.isFinite(v)) v = 0;
    v = Math.max(0, Math.min(RESULT_MAX_PER_CRITERION, v));
    setDrafts((prev) => ({ ...prev, [pid]: { ...draftOf(pid), [key]: v } }));
  };

  const setComment = (pid: number, text: string) => {
    setDrafts((prev) => ({ ...prev, [pid]: { ...draftOf(pid), comment: text } }));
  };

  const handleSave = async (pid: number) => {
    if (!user) { showToast('로그인 후 평가할 수 있습니다.', 'warning'); return; }
    const d = draftOf(pid);
    setBusy(pid);
    const res = await upsertResultEval({ project_id: pid, evaluator_id: user.id, evaluator_name: userName, ...d });
    setBusy(null);
    if (res.ok) { showToast(`${pid}번 프로젝트 결과평가를 저장했습니다.`, 'success'); reload(); }
    else showToast('저장 실패: ' + (res.error || ''), 'error');
  };

  const handleDelete = async (pid: number) => {
    if (!user) return;
    if (!confirm(`${pid}번 프로젝트에 대한 내 결과평가를 삭제할까요?`)) return;
    setBusy(pid);
    const res = await deleteResultEval(pid, user.id);
    setBusy(null);
    if (res.ok) {
      setDrafts((prev) => { const n = { ...prev }; delete n[pid]; return n; });
      showToast('결과평가를 삭제했습니다.', 'info'); reload();
    } else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

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
      <SEOHead title="프로젝트 결과평가 — AI 리부트 경진대회" path="/competition/result" noindex />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 결과평가</h2>
          <p>
            사전평가 상위 10팀을 대상으로 <strong>10개 항목(각 {RESULT_MAX_PER_CRITERION}점, 합 {RESULT_MAX_TOTAL}점)</strong>으로 최종 평가합니다.
            저장 후 <strong>결과평가 집계표</strong>에서 결과를 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1080px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 대상 안내 */}
              <div style={{ fontSize: '13.5px', color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px' }}>
                <EmojiIcon char="🏅" /> 결과평가 대상은 <strong>사전평가 상위 10팀</strong>입니다. 대상 팀은 사전평가 집계 기준으로 자동 선정되며, 집계가 확정되기 전에는 잠정 순위입니다.
              </div>

              {targetProjects.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>아직 대상 팀이 선정되지 않았습니다. <strong>사전평가</strong>가 집계되면 상위 10팀이 자동으로 표시됩니다.</p>
                  <Link to="/competition/eval-summary" className="btn btn-secondary" style={{ marginTop: '12px', padding: '8px 18px', fontSize: '14px' }}>사전평가 집계표 보기 →</Link>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                    내 평가 진행: <strong style={{ color: 'var(--primary-blue)' }}>{myDoneCount}</strong> / {targetProjects.length}개
                    <span style={{ marginLeft: '10px' }}>· 각 항목 0~{RESULT_MAX_PER_CRITERION}점 · 합계 {RESULT_MAX_TOTAL}점</span>
                  </div>

                  {isAdmin && (
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-light-gray)', borderRadius: '8px', padding: '10px 14px' }}>
                      강사 계정도 평가를 입력할 수 있습니다(참고용). 본인 팀 자동 제외는 수강생 기준이라 강사에게는 적용되지 않습니다.
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '16px', alignItems: 'start' }}>
                    {targetProjects.map((p, rankIdx) => {
                      const d = draftOf(p.id);
                      const saved = myEvalByProject.get(p.id);
                      const total = totalOfResult(d);
                      const isMyTeam = !isAdmin && !!user && p.members.some((m) => norm(m) === norm(userName));
                      const disabled = isMyTeam || busy === p.id;
                      return (
                        <div key={p.id} style={{ ...card, borderLeft: saved ? '4px solid var(--primary-blue)' : '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={chip('#fef3c7', '#92400e')}>사전 {rankIdx + 1}위</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-blue)' }}>{p.id}팀</span>
                            <h3 style={{ margin: 0, fontSize: '16px', flex: 1, minWidth: 0 }}>{p.title}</h3>
                            {isMyTeam && <span style={chip('#fde68a', '#92400e')}>우리 팀 · 평가 제외</span>}
                            {saved && !isMyTeam && <span style={chip('#dbeafe', '#1e3a8a')}>저장됨 {totalOfResult(saved)}점</span>}
                          </div>
                          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.tagline}</p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                            {RESULT_CRITERIA.map((c) => (
                              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{c.label}</span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{c.desc}</span>
                                </div>
                                <input
                                  type="number" min={0} max={RESULT_MAX_PER_CRITERION} step={1}
                                  style={{ ...scoreInput, opacity: disabled ? 0.5 : 1 }}
                                  value={d[c.key]} disabled={disabled}
                                  onChange={(e) => setScore(p.id, c.key, e.target.value)}
                                />
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '28px' }}>/{RESULT_MAX_PER_CRITERION}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>합계</span>
                            <strong style={{ fontSize: '20px', color: 'var(--primary-blue)' }}>{total}</strong>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {RESULT_MAX_TOTAL}점</span>
                          </div>

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

                  <div style={{ ...card, marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}><EmojiIcon char="📊" /> 결과평가 집계가 궁금하신가요?</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>팀별 평균 점수·차트·피드백은 <strong>프로젝트 결과평가 집계표</strong>에서 확인하세요.</p>
                    </div>
                    <Link to="/competition/result-summary" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '14px', whiteSpace: 'nowrap' }}>집계표 보기 →</Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default CompetitionResultEval;
