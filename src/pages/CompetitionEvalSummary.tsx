/**
 * CompetitionEvalSummary.tsx — 경진대회 · 프로젝트 사전평가 집계표
 *
 * [역할]
 *  - 23개 팀 버튼(1팀~23팀)을 상단에 나열하고, 클릭한 팀의 사전평가 집계를 보여 준다.
 *  - 선택 팀: 평균 총점·전체 순위 + 5개 항목 레이더 차트 + 항목별 평균 막대 + 피드백(종합평) 목록.
 *
 * [핵심 책임]
 *  - 집계 계산은 utils/projectEval.aggregateEvals에 위임(입력 페이지와 동일 로직 재사용).
 *  - 차트는 외부 라이브러리 없이 인라인 SVG(레이더) + CSS 막대로 직접 그린다.
 *
 * [주요 export]
 *  - default CompetitionEvalSummary
 *
 * [초보자 메모]
 *  - 레이더(방사형) 차트: 중심에서 5개 축으로 뻗어 각 항목 점수를 오각형으로 잇는 그래프.
 *    각 꼭짓점의 거리 = (항목 평균 / 20) × 반지름.
 */
import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import { TEAM_PROJECTS, getTeamProject } from '../data/teamProjects';
import { listEvals, aggregateEvals, MAX_PER_CRITERION, MAX_TOTAL, type ProjectAgg } from '../utils/projectEval';

// 레이더 차트 도형 좌표 계산 상수.
const CX = 150, CY = 145, R = 100;
// i번째 축 각도(맨 위에서 시작해 시계방향 72°씩). 라디안 반환.
const angleFor = (i: number, n: number): number => (-90 + (360 / n) * i) * (Math.PI / 180);
// 값(0~20)·축 인덱스 → SVG 좌표 [x, y].
const pointAt = (val: number, i: number, n: number): [number, number] => {
  const r = (Math.max(0, Math.min(MAX_PER_CRITERION, val)) / MAX_PER_CRITERION) * R;
  return [CX + r * Math.cos(angleFor(i, n)), CY + r * Math.sin(angleFor(i, n))];
};
// 좌표 배열 → polygon points 문자열.
const toPoints = (pts: [number, number][]): string => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

const CompetitionEvalSummary = (): ReactElement => {
  const { isAdmin } = useAuth();
  const [evals, setEvals] = useState<Awaited<ReturnType<typeof listEvals>>>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null); // 사용자가 고른 팀(없으면 자동=1위)

  const reload = useCallback(async () => {
    setLoading(true);
    setEvals(await listEvals());
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  // 프로젝트별 집계 맵.
  const agg = useMemo(() => aggregateEvals(evals), [evals]);

  // 전체 순위(평가 1건 이상, 총점 평균 내림차순). rank: project_id → 1-based 순위.
  const { ranking, rankOf, evaluatedCount, totalCount } = useMemo(() => {
    const list = TEAM_PROJECTS
      .map((p) => ({ p, a: agg.get(p.id) }))
      .filter((x): x is { p: typeof x.p; a: ProjectAgg } => !!x.a && x.a.count > 0)
      .sort((a, b) => b.a.avgTotal - a.a.avgTotal || b.a.count - a.a.count);
    const rank = new Map<number, number>();
    list.forEach((x, i) => rank.set(x.p.id, i + 1));
    return {
      ranking: list,
      rankOf: rank,
      evaluatedCount: list.length,
      totalCount: evals.length,
    };
  }, [agg, evals.length]);

  // 실제로 보여 줄 팀: 사용자 선택 → 없으면 1위 팀 → 그것도 없으면 1팀.
  const effId = selected ?? ranking[0]?.p.id ?? TEAM_PROJECTS[0].id;
  const project = getTeamProject(effId);
  const a = agg.get(effId);

  // ── 스타일 ──
  const card: React.CSSProperties = {
    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
    borderRadius: '16px', padding: '22px 24px', color: 'var(--text-primary)',
  };
  const accent = project?.color || '#0046C8';

  return (
    <>
      <SEOHead title="프로젝트 사전평가 집계표 — AI 리부트 경진대회" path="/competition/eval-summary" noindex />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 사전평가 집계표</h2>
          <p>팀 번호를 눌러 해당 팀의 평균 점수·항목별 차트·피드백을 확인하세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 상단 요약 */}
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                평가된 팀 <strong style={{ color: 'var(--primary-blue)' }}>{evaluatedCount}</strong> / {TEAM_PROJECTS.length}개
                {' · '}총 평가 <strong style={{ color: 'var(--primary-blue)' }}>{totalCount}</strong>건
              </div>

              {/* ── 팀 선택 버튼(1팀~23팀) ── */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TEAM_PROJECTS.map((p) => {
                  const has = (agg.get(p.id)?.count || 0) > 0;
                  const on = p.id === effId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p.id)}
                      title={p.title}
                      style={{
                        minWidth: '54px', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                        fontSize: '14px', fontWeight: 700,
                        border: on ? '2px solid transparent' : '1px solid var(--border-light)',
                        background: on ? accent : 'var(--bg-white)',
                        color: on ? '#fff' : has ? 'var(--text-primary)' : 'var(--text-secondary)',
                        opacity: has || on ? 1 : 0.45,
                        boxShadow: on ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all .15s',
                      }}
                    >
                      {p.id}팀
                    </button>
                  );
                })}
              </div>

              {/* ── 선택 팀 집계 패널 ── */}
              {!a || a.count === 0 ? (
                <div style={{ ...card, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{effId}팀 · {project?.title}</strong>
                  <p style={{ margin: '8px 0 0', fontSize: '14px' }}>아직 이 팀에 대한 평가가 없습니다.</p>
                </div>
              ) : (
                <div style={{ ...card, borderTop: `4px solid ${accent}` }}>
                  {/* 헤더 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: accent }}>{effId}팀</span>
                        {rankOf.get(effId) && (
                          <span style={{ fontSize: '12.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: '#fef3c7', color: '#92400e' }}>
                            전체 {rankOf.get(effId)}위 / {evaluatedCount}팀
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: '6px 0 4px', fontSize: '19px' }}>{project?.title}</h3>
                      <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)' }}>{project?.tagline}</p>
                    </div>
                    {/* 평균 총점 */}
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>평균 총점</div>
                      <div style={{ fontSize: '40px', fontWeight: 800, color: accent, lineHeight: 1.1 }}>{a.avgTotal.toFixed(1)}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {MAX_TOTAL}점 · 평가 {a.count}건</div>
                    </div>
                  </div>

                  {/* 차트 + 막대 (넓으면 2열) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px', alignItems: 'center' }}>
                    {/* 레이더 차트 */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <svg viewBox="0 0 300 290" width="100%" style={{ maxWidth: '320px' }} role="img" aria-label="항목별 평균 레이더 차트">
                        {/* 격자 링(25/50/75/100%) */}
                        {[0.25, 0.5, 0.75, 1].map((lv) => (
                          <polygon key={lv}
                            points={toPoints(a.avgBy.map((_, i) => pointAt(lv * MAX_PER_CRITERION, i, a.avgBy.length)))}
                            fill="none" stroke="var(--border-light)" strokeWidth={1} />
                        ))}
                        {/* 축선 */}
                        {a.avgBy.map((_, i) => {
                          const [x, y] = pointAt(MAX_PER_CRITERION, i, a.avgBy.length);
                          return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--border-light)" strokeWidth={1} />;
                        })}
                        {/* 데이터 폴리곤 */}
                        <polygon
                          points={toPoints(a.avgBy.map((c, i) => pointAt(c.avg, i, a.avgBy.length)))}
                          fill={accent} fillOpacity={0.22} stroke={accent} strokeWidth={2.5} strokeLinejoin="round" />
                        {/* 데이터 꼭짓점 */}
                        {a.avgBy.map((c, i) => {
                          const [x, y] = pointAt(c.avg, i, a.avgBy.length);
                          return <circle key={i} cx={x} cy={y} r={3.5} fill={accent} />;
                        })}
                        {/* 축 라벨 */}
                        {a.avgBy.map((c, i) => {
                          const [lx, ly] = pointAt(MAX_PER_CRITERION + 3.6, i, a.avgBy.length);
                          const anchor = lx > CX + 8 ? 'start' : lx < CX - 8 ? 'end' : 'middle';
                          return (
                            <text key={i} x={lx} y={ly} fontSize={11} fontWeight={600} fill="var(--text-secondary)"
                              textAnchor={anchor} dominantBaseline="middle">
                              {c.label.replace(' · ', '·')}
                            </text>
                          );
                        })}
                      </svg>
                    </div>

                    {/* 항목별 평균 막대 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {a.avgBy.map((c) => (
                        <div key={c.key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>{c.label}</span>
                            <span style={{ color: 'var(--text-secondary)' }}><strong style={{ color: accent }}>{c.avg.toFixed(1)}</strong> / {MAX_PER_CRITERION}</span>
                          </div>
                          <div style={{ height: '10px', borderRadius: '999px', background: 'var(--bg-light-gray)', overflow: 'hidden' }}>
                            <div style={{ width: `${(c.avg / MAX_PER_CRITERION) * 100}%`, height: '100%', borderRadius: '999px', background: accent, transition: 'width .4s' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 피드백(종합평) */}
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

export default CompetitionEvalSummary;
