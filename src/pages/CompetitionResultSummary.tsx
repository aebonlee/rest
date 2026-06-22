/**
 * CompetitionResultSummary.tsx — 경진대회 · 프로젝트 결과평가 집계표
 *
 * [역할]
 *  - 사전평가 상위 10팀(대상)을 버튼으로 나열하고, 클릭한 팀의 결과평가 집계를 보여 준다.
 *  - 상단 TOP 10(결과평가 평균 총점 순) + 선택 팀: 평균 총점·순위 + 레이더 차트 2개
 *    (10개 항목을 '기획·비즈니스'/'구현·기술' 2계열 각 5축으로 분할) + 항목별 평균 막대 + 피드백(종합평).
 *  - 구조·UX는 사전평가 집계표(CompetitionEvalSummary)와 동일, 항목만 10개.
 *
 * [주요 export]
 *  - default CompetitionResultSummary
 */
import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import { EmojiIcon } from '../utils/emojiIcon';
import { TEAM_PROJECTS, getTeamProject } from '../data/teamProjects';
import { listEvals, aggregateEvals } from '../utils/projectEval'; // 사전평가 → 대상 10팀
import {
  listResultEvals, aggregateResultEvals,
  RESULT_MAX_PER_CRITERION, RESULT_MAX_TOTAL, RESULT_CRITERIA_GROUPS, type ProjectResultAgg,
} from '../utils/projectResultEval';

const CX = 150, CY = 145, R = 100;
const angleFor = (i: number, n: number): number => (-90 + (360 / n) * i) * (Math.PI / 180);
const pointAt = (val: number, i: number, n: number): [number, number] => {
  const r = (Math.max(0, Math.min(RESULT_MAX_PER_CRITERION, val)) / RESULT_MAX_PER_CRITERION) * R;
  return [CX + r * Math.cos(angleFor(i, n)), CY + r * Math.sin(angleFor(i, n))];
};
const toPoints = (pts: [number, number][]): string => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

// 한 계열(항목 n개)의 레이더 차트. avgBy의 부분집합을 받아 n각형으로 그린다.
type AvgItem = { key: string; label: string; avg: number };
const RadarChart = ({ items, accent, title }: { items: AvgItem[]; accent: string; title: string }): ReactElement => {
  const n = items.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: '13px', fontWeight: 800, color: accent, marginBottom: '2px' }}>{title}</div>
      <svg viewBox="0 0 300 290" width="100%" style={{ maxWidth: '300px' }} role="img" aria-label={`${title} 레이더 차트`}>
        {[0.25, 0.5, 0.75, 1].map((lv) => (
          <polygon key={lv}
            points={toPoints(items.map((_, i) => pointAt(lv * RESULT_MAX_PER_CRITERION, i, n)))}
            fill="none" stroke="var(--border-light)" strokeWidth={1} />
        ))}
        {items.map((_, i) => {
          const [x, y] = pointAt(RESULT_MAX_PER_CRITERION, i, n);
          return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--border-light)" strokeWidth={1} />;
        })}
        <polygon
          points={toPoints(items.map((c, i) => pointAt(c.avg, i, n)))}
          fill={accent} fillOpacity={0.22} stroke={accent} strokeWidth={2.5} strokeLinejoin="round" />
        {items.map((c, i) => {
          const [x, y] = pointAt(c.avg, i, n);
          return <circle key={i} cx={x} cy={y} r={3} fill={accent} />;
        })}
        {items.map((c, i) => {
          const [lx, ly] = pointAt(RESULT_MAX_PER_CRITERION + 3.4, i, n);
          const anchor = lx > CX + 8 ? 'start' : lx < CX - 8 ? 'end' : 'middle';
          return (
            <text key={i} x={lx} y={ly} fontSize={10} fontWeight={600} fill="var(--text-secondary)"
              textAnchor={anchor} dominantBaseline="middle">{c.label}</text>
          );
        })}
      </svg>
    </div>
  );
};

const CompetitionResultSummary = (): ReactElement => {
  const { isAdmin } = useAuth();
  const [preEvals, setPreEvals] = useState<Awaited<ReturnType<typeof listEvals>>>([]);
  const [evals, setEvals] = useState<Awaited<ReturnType<typeof listResultEvals>>>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [pre, list] = await Promise.all([listEvals(), listResultEvals()]);
    setPreEvals(pre); setEvals(list);
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  // 결과평가 집계 맵.
  const agg = useMemo(() => aggregateResultEvals(evals), [evals]);

  // 대상 10팀: 사전평가 상위 10팀.
  const targetProjects = useMemo(() => {
    const a = aggregateEvals(preEvals);
    return TEAM_PROJECTS
      .map((p) => ({ p, agg: a.get(p.id) }))
      .filter((x) => x.agg && x.agg.count > 0)
      .sort((x, y) => (y.agg!.avgTotal - x.agg!.avgTotal) || (y.agg!.count - x.agg!.count))
      .slice(0, 10)
      .map((x) => x.p);
  }, [preEvals]);

  // 결과평가 순위(대상 10팀 중 결과평가가 있는 팀, 총점 평균 내림차순).
  const { ranking, rankOf, evaluatedCount, totalCount } = useMemo(() => {
    const list = targetProjects
      .map((p) => ({ p, a: agg.get(p.id) }))
      .filter((x): x is { p: typeof x.p; a: ProjectResultAgg } => !!x.a && x.a.count > 0)
      .sort((a, b) => b.a.avgTotal - a.a.avgTotal || b.a.count - a.a.count);
    const rank = new Map<number, number>();
    list.forEach((x, i) => rank.set(x.p.id, i + 1));
    return { ranking: list, rankOf: rank, evaluatedCount: list.length, totalCount: evals.length };
  }, [agg, targetProjects, evals.length]);

  const effId = selected ?? ranking[0]?.p.id ?? targetProjects[0]?.id;
  const project = effId ? getTeamProject(effId) : undefined;
  const a = effId ? agg.get(effId) : undefined;

  const card: React.CSSProperties = {
    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
    borderRadius: '16px', padding: '22px 24px', color: 'var(--text-primary)',
  };
  const accent = project?.color || '#0046C8';

  return (
    <>
      <SEOHead title="프로젝트 결과평가 집계표 — AI 리부트 경진대회" path="/competition/result-summary" noindex />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 결과평가 집계표</h2>
          <p>사전평가 상위 10팀의 결과평가 집계입니다. 팀 번호를 눌러 평균 점수·항목별 차트·피드백을 확인하세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : targetProjects.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>아직 대상 팀(사전평가 상위 10팀)이 선정되지 않았습니다.</p>
              <Link to="/competition/eval-summary" className="btn btn-secondary" style={{ marginTop: '12px', padding: '8px 18px', fontSize: '14px' }}>사전평가 집계표 보기 →</Link>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                결과평가된 팀 <strong style={{ color: 'var(--primary-blue)' }}>{evaluatedCount}</strong> / {targetProjects.length}개
                {' · '}총 평가 <strong style={{ color: 'var(--primary-blue)' }}>{totalCount}</strong>건
              </div>

              {/* ── TOP 10(결과평가) ── */}
              {ranking.length > 0 && (
                <div style={{ ...card, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: '0 0 3px', fontSize: '17px' }}><EmojiIcon char="🏆" /> 결과평가 순위 TOP 10</h3>
                    <Link to="/competition/result-ranking" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)', textDecoration: 'none', flexShrink: 0 }}>전체 등수표 보기 →</Link>
                  </div>
                  <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>결과평가 평균 총점 기준 · 행을 누르면 상세 집계가 열립니다.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {ranking.slice(0, 10).map((x, i) => {
                      const rank = i + 1;
                      const on = x.p.id === effId;
                      const medalBg = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#c2812f' : 'var(--bg-light-gray)';
                      const medalFg = rank <= 3 ? '#fff' : 'var(--text-secondary)';
                      return (
                        <button key={x.p.id} onClick={() => setSelected(x.p.id)} title={x.p.title}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', cursor: 'pointer',
                            padding: '8px 12px', borderRadius: '10px',
                            border: on ? `1px solid ${x.p.color}` : '1px solid transparent',
                            background: on ? 'var(--bg-light-gray)' : 'transparent',
                          }}>
                          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: medalBg, color: medalFg, fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{rank}</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: x.p.color, flexShrink: 0, width: '38px' }}>{x.p.id}팀</span>
                          <span style={{ flex: 1, minWidth: 0, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.p.title}</span>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', flexShrink: 0 }}>평가 {x.a.count}건</span>
                          <strong style={{ fontSize: '16px', color: x.p.color, flexShrink: 0, width: '54px', textAlign: 'right' }}>{x.a.avgTotal.toFixed(1)}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>/ {RESULT_MAX_TOTAL}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 팀 선택 버튼(대상 10팀) ── */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {targetProjects.map((p) => {
                  const has = (agg.get(p.id)?.count || 0) > 0;
                  const on = p.id === effId;
                  return (
                    <button key={p.id} onClick={() => setSelected(p.id)} title={p.title}
                      style={{
                        minWidth: '54px', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                        fontSize: '14px', fontWeight: 700,
                        border: on ? '2px solid transparent' : '1px solid var(--border-light)',
                        background: on ? accent : 'var(--bg-white)',
                        color: on ? '#fff' : has ? 'var(--text-primary)' : 'var(--text-secondary)',
                        opacity: has || on ? 1 : 0.45,
                        boxShadow: on ? '0 4px 14px rgba(0,0,0,0.15)' : 'none', transition: 'all .15s',
                      }}>
                      {p.id}팀
                    </button>
                  );
                })}
              </div>

              {/* ── 선택 팀 집계 패널 ── */}
              {!a || a.count === 0 ? (
                <div style={{ ...card, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{effId}팀 · {project?.title}</strong>
                  <p style={{ margin: '8px 0 0', fontSize: '14px' }}>아직 이 팀에 대한 결과평가가 없습니다.</p>
                </div>
              ) : (
                <div style={{ ...card, borderTop: `4px solid ${accent}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: accent }}>{effId}팀</span>
                        {rankOf.get(effId) && (
                          <span style={{ fontSize: '12.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: '#fef3c7', color: '#92400e' }}>
                            결과 {rankOf.get(effId)}위 / {evaluatedCount}팀
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: '6px 0 4px', fontSize: '19px' }}>{project?.title}</h3>
                      <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)' }}>{project?.tagline}</p>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>평균 총점</div>
                      <div style={{ fontSize: '40px', fontWeight: 800, color: accent, lineHeight: 1.1 }}>{a.avgTotal.toFixed(1)}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {RESULT_MAX_TOTAL}점 · 평가 {a.count}건</div>
                    </div>
                  </div>

                  {/* 레이더 차트 — 10개 항목을 2개 계열(각 5축)로 분할 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '20px' }}>
                    {RESULT_CRITERIA_GROUPS.map((g) => (
                      <RadarChart key={g.title} title={g.title} accent={accent}
                        items={g.keys.map((k) => a.avgBy.find((c) => c.key === k)).filter((c): c is typeof a.avgBy[number] => !!c)} />
                    ))}
                  </div>

                  {/* 항목별 평균 막대 — 계열 순서대로 2열 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px 28px', marginTop: '22px' }}>
                    {RESULT_CRITERIA_GROUPS.flatMap((g) => g.keys)
                      .map((k) => a.avgBy.find((c) => c.key === k))
                      .filter((c): c is typeof a.avgBy[number] => !!c)
                      .map((c) => (
                        <div key={c.key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>{c.label}</span>
                            <span style={{ color: 'var(--text-secondary)' }}><strong style={{ color: accent }}>{c.avg.toFixed(1)}</strong> / {RESULT_MAX_PER_CRITERION}</span>
                          </div>
                          <div style={{ height: '9px', borderRadius: '999px', background: 'var(--bg-light-gray)', overflow: 'hidden' }}>
                            <div style={{ width: `${(c.avg / RESULT_MAX_PER_CRITERION) * 100}%`, height: '100%', borderRadius: '999px', background: accent, transition: 'width .4s' }} />
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* 피드백 */}
                  <div style={{ marginTop: '22px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '15px' }}>피드백 · 종합평 ({a.comments.length})</h4>
                    {a.comments.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)' }}>작성된 종합평이 없습니다.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {a.comments.map((cm, i) => (
                          <div key={i} style={{ background: 'var(--bg-light-gray)', borderRadius: '10px', padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700 }}>{cm.name}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: '#dbeafe', color: '#1e3a8a' }}>{cm.total}점</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{cm.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isAdmin && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  ※ 점수·피드백은 모든 로그인 사용자에게 공개됩니다. 평가 기간 중 비공개가 필요하면 말씀해 주세요.
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default CompetitionResultSummary;
