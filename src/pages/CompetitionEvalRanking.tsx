/**
 * CompetitionEvalRanking.tsx — 경진대회 · 프로젝트 사전평가 등수표
 *
 * [역할]
 *  - 평가가 1건 이상 있는 모든 팀을 "총점 평균 내림차순" 한 장의 순위 표로 보여 준다.
 *  - 집계표(CompetitionEvalSummary)가 'TOP 10 + 선택 팀 상세'라면,
 *    이 페이지는 '전체 팀 등수'를 한눈에 비교하는 데 초점을 둔다.
 *
 * [핵심 책임]
 *  - 집계 계산은 utils/projectEval.aggregateEvals에 위임(집계표·입력 페이지와 동일 로직 재사용).
 *  - 표 렌더링은 공용 RankingTable 컴포넌트에 위임.
 *
 * [주요 export]
 *  - default CompetitionEvalRanking
 */
import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdminSidebar from '../components/AdminSidebar';
import RankingTable, { type RankingRow } from '../components/RankingTable';
import { TEAM_PROJECTS } from '../data/teamProjects';
import { listEvals, aggregateEvals, EVAL_CRITERIA, MAX_PER_CRITERION, MAX_TOTAL, type ProjectAgg } from '../utils/projectEval';

// 표 항목 컬럼: 사전평가 5개 항목(짧은 라벨).
const CRITERIA = EVAL_CRITERIA.map((c) => ({ key: c.key, label: c.label.replace(' · ', '·') }));

// admin=true 면 관리자 레이아웃(사이드바 유지) 안에서, 아니면 공개 페이지로 렌더.
const CompetitionEvalRanking = ({ admin = false }: { admin?: boolean }): ReactElement => {
  const navigate = useNavigate();
  const [evals, setEvals] = useState<Awaited<ReturnType<typeof listEvals>>>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setEvals(await listEvals());
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const agg = useMemo(() => aggregateEvals(evals), [evals]);

  // 평가 1건 이상인 팀, 총점 평균 내림차순(동점은 평가 건수 많은 순).
  const rows = useMemo<RankingRow[]>(() => (
    TEAM_PROJECTS
      .map((p) => ({ p, a: agg.get(p.id) }))
      .filter((x): x is { p: typeof x.p; a: ProjectAgg } => !!x.a && x.a.count > 0)
      .sort((a, b) => b.a.avgTotal - a.a.avgTotal || b.a.count - a.a.count)
      .map((x) => ({
        project: { id: x.p.id, title: x.p.title, color: x.p.color, members: x.p.members },
        avgBy: x.a.avgBy,
        avgTotal: x.a.avgTotal,
        count: x.a.count,
      }))
  ), [agg]);

  // 집계표 경로: 관리자 화면이면 관리자 집계표, 공개면 경진대회 집계표.
  const summaryPath = admin ? '/admin/projects/pre-eval' : '/competition/eval-summary';

  // 본문(요약줄 + 표 + 안내) — 공개/관리자 공용.
  const body = loading ? (
    <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
  ) : (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          순위에 오른 팀 <strong style={{ color: 'var(--primary-blue)' }}>{rows.length}</strong> / {TEAM_PROJECTS.length}개
          {' · '}총 평가 <strong style={{ color: 'var(--primary-blue)' }}>{evals.length}</strong>건
        </div>
        <Link to={summaryPath} className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '13.5px' }}>
          상세 집계표 보기 →
        </Link>
      </div>

      {rows.length === 0 ? (
        <div style={{
          background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px',
          padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)',
        }}>
          아직 등록된 사전평가가 없습니다.
        </div>
      ) : (
        <RankingTable
          rows={rows}
          criteria={CRITERIA}
          maxPerCriterion={MAX_PER_CRITERION}
          maxTotal={MAX_TOTAL}
          showMembers={admin}
          onRowClick={() => navigate(summaryPath)}
        />
      )}

      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
        ※ 순위는 <strong>총점 평균</strong> 기준입니다(동점은 같은 순위). 항목별 숫자는 각 항목의 평균 점수(만점 {MAX_PER_CRITERION})입니다.
      </p>
    </>
  );

  // ── 관리자 레이아웃(사이드바 유지) ──
  if (admin) {
    return (
      <>
        <SEOHead title="프로젝트 사전평가 등수표 — 관리자" path="/admin/projects/pre-ranking" noindex />
        <div className="admin-layout">
          <AdminSidebar />
          <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ borderLeft: '5px solid #0046C8', paddingLeft: 12 }}>프로젝트 사전평가 등수표</h2>
            {body}
          </div>
        </div>
      </>
    );
  }

  // ── 공개 페이지 레이아웃 ──
  return (
    <>
      <SEOHead title="프로젝트 사전평가 등수표 — AI 리부트 경진대회" path="/competition/eval-ranking" noindex />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 사전평가 등수표</h2>
          <p>평가된 모든 팀의 순위를 한 표로 확인하세요. 행을 누르면 해당 팀의 상세 집계로 이동합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1080px' }}>
          {body}
        </div>
      </section>
    </>
  );
};

export default CompetitionEvalRanking;
