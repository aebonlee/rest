/**
 * CompetitionResultRanking.tsx — 경진대회 · 프로젝트 결과평가 등수표
 *
 * [역할]
 *  - 결과평가 대상(사전평가 상위 10팀) 중 결과평가가 있는 팀을 총점 평균 순 한 표로 보여 준다.
 *  - 집계표(CompetitionResultSummary)가 'TOP 10 + 선택 팀 상세'라면,
 *    이 페이지는 '최종 순위'를 한눈에 비교하는 데 초점을 둔다.
 *
 * [핵심 책임]
 *  - 대상 10팀 선정은 사전평가(aggregateEvals) 상위 10팀, 집계는 aggregateResultEvals에 위임
 *    (결과평가 집계표와 동일 로직 재사용).
 *  - 표 렌더링은 공용 RankingTable 컴포넌트에 위임(결과평가는 10개 항목).
 *
 * [주요 export]
 *  - default CompetitionResultRanking
 */
import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import RankingTable, { type RankingRow } from '../components/RankingTable';
import { TEAM_PROJECTS } from '../data/teamProjects';
import { listEvals, aggregateEvals } from '../utils/projectEval'; // 사전평가 → 대상 10팀
import {
  listResultEvals, aggregateResultEvals, RESULT_CRITERIA,
  RESULT_MAX_PER_CRITERION, RESULT_MAX_TOTAL, type ProjectResultAgg,
} from '../utils/projectResultEval';

// 표 항목 컬럼: 결과평가 10개 항목(짧은 라벨).
const CRITERIA = RESULT_CRITERIA.map((c) => ({ key: c.key, label: c.label.replace(' · ', '·') }));

const CompetitionResultRanking = (): ReactElement => {
  const navigate = useNavigate();
  const [preEvals, setPreEvals] = useState<Awaited<ReturnType<typeof listEvals>>>([]);
  const [evals, setEvals] = useState<Awaited<ReturnType<typeof listResultEvals>>>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [pre, list] = await Promise.all([listEvals(), listResultEvals()]);
    setPreEvals(pre); setEvals(list);
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const agg = useMemo(() => aggregateResultEvals(evals), [evals]);

  // 대상 10팀: 사전평가 상위 10팀(결과평가 집계표와 동일 기준).
  const targetProjects = useMemo(() => {
    const a = aggregateEvals(preEvals);
    return TEAM_PROJECTS
      .map((p) => ({ p, agg: a.get(p.id) }))
      .filter((x) => x.agg && x.agg.count > 0)
      .sort((x, y) => (y.agg!.avgTotal - x.agg!.avgTotal) || (y.agg!.count - x.agg!.count))
      .slice(0, 10)
      .map((x) => x.p);
  }, [preEvals]);

  // 대상 10팀 중 결과평가가 있는 팀, 총점 평균 내림차순.
  const rows = useMemo<RankingRow[]>(() => (
    targetProjects
      .map((p) => ({ p, a: agg.get(p.id) }))
      .filter((x): x is { p: typeof x.p; a: ProjectResultAgg } => !!x.a && x.a.count > 0)
      .sort((a, b) => b.a.avgTotal - a.a.avgTotal || b.a.count - a.a.count)
      .map((x) => ({
        project: { id: x.p.id, title: x.p.title, color: x.p.color },
        avgBy: x.a.avgBy,
        avgTotal: x.a.avgTotal,
        count: x.a.count,
      }))
  ), [agg, targetProjects]);

  return (
    <>
      <SEOHead title="프로젝트 결과평가 등수표 — AI 리부트 경진대회" path="/competition/result-ranking" noindex />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 결과평가 등수표</h2>
          <p>사전평가 상위 10팀의 결과평가 최종 순위입니다. 행을 누르면 해당 팀의 상세 집계로 이동합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1180px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : targetProjects.length === 0 ? (
            <div style={{
              background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px',
              padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)',
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>아직 대상 팀(사전평가 상위 10팀)이 선정되지 않았습니다.</p>
              <Link to="/competition/eval-ranking" className="btn btn-secondary" style={{ marginTop: '12px', padding: '8px 18px', fontSize: '14px' }}>사전평가 등수표 보기 →</Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  순위에 오른 팀 <strong style={{ color: 'var(--primary-blue)' }}>{rows.length}</strong> / {targetProjects.length}개
                  {' · '}총 평가 <strong style={{ color: 'var(--primary-blue)' }}>{evals.length}</strong>건
                </div>
                <Link to="/competition/result-summary" className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '13.5px' }}>
                  상세 집계표 보기 →
                </Link>
              </div>

              {rows.length === 0 ? (
                <div style={{
                  background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px',
                  padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)',
                }}>
                  아직 등록된 결과평가가 없습니다.
                </div>
              ) : (
                <RankingTable
                  rows={rows}
                  criteria={CRITERIA}
                  maxPerCriterion={RESULT_MAX_PER_CRITERION}
                  maxTotal={RESULT_MAX_TOTAL}
                  onRowClick={() => navigate('/competition/result-summary')}
                />
              )}

              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                ※ 순위는 <strong>총점 평균</strong> 기준입니다(동점은 같은 순위). 항목별 숫자는 각 항목의 평균 점수(만점 {RESULT_MAX_PER_CRITERION})입니다.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default CompetitionResultRanking;
