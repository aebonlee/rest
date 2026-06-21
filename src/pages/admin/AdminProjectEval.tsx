/**
 * AdminProjectEval.tsx
 *
 * 역할:
 *   관리자(Admin) "프로젝트 사전/결과평가 집계표" 페이지의 공용 컴포넌트.
 *   `mode` prop으로 평가 종류를 구분하며, 같은 화면 구조를 두 메뉴가 공유한다.
 *     - mode="pre"    → 프로젝트 사전평가 집계표 (rest_project_evals, 5개 항목)
 *     - mode="result" → 프로젝트 결과평가 집계표 (rest_project_result_evals, 10개 항목)
 *
 *   상단에서 1팀~23팀을 탭으로 선택하면, 그 팀에 대해 평가자별로 준 점수를 표로 나열한다.
 *   (행 = 평가자, 열 = 항목별 점수 + 총점, 총점 내림차순 + 맨 아래 평균 행)
 *
 * 데이터 출처(모두 Supabase, RLS 적용):
 *   - 사전평가: rest_project_evals        (utils/projectEval)
 *   - 결과평가: rest_project_result_evals  (utils/projectResultEval)
 *   팀 메타(번호·제목·팀원)는 정적 데이터 TEAM_PROJECTS(=팀 번호의 단일 진실 공급원).
 *
 * 주요 export:
 *   - default export: AdminProjectEval (mode prop을 받는 React 컴포넌트)
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { TEAM_PROJECTS } from '../../data/teamProjects';
import { listEvals, EVAL_CRITERIA, totalOf, MAX_TOTAL as PRE_MAX } from '../../utils/projectEval';
import {
  listResultEvals, RESULT_CRITERIA, totalOfResult, RESULT_MAX_TOTAL as RESULT_MAX,
} from '../../utils/projectResultEval';

// 평가 한 건(평가자 1명이 한 팀에 준 점수). 동적 컬럼 접근을 위해 느슨한 타입.
type EvalRow = { project_id: number; evaluator_name?: string } & Record<string, unknown>;
type Criterion = { readonly key: string; readonly label: string };
export type EvalMode = 'pre' | 'result';

// 평가 종류별 설정(제목·경로·항목·총점 계산기·강조색)을 한 곳에 모은 표.
const MODE_META: Record<EvalMode, {
  title: string; path: string; criteria: readonly Criterion[];
  totalFn: (r: EvalRow) => number; maxTotal: number; accent: string;
}> = {
  pre: {
    title: '프로젝트 사전평가 집계표', path: '/admin/projects/pre-eval',
    criteria: EVAL_CRITERIA as readonly Criterion[],
    totalFn: (r) => totalOf(r as Record<string, number>), maxTotal: PRE_MAX, accent: '#0046C8',
  },
  result: {
    title: '프로젝트 결과평가 집계표', path: '/admin/projects/result-eval',
    criteria: RESULT_CRITERIA as readonly Criterion[],
    totalFn: (r) => totalOfResult(r as Record<string, number>), maxTotal: RESULT_MAX, accent: '#e1567c',
  },
};

/**
 * AdminProjectEval — 팀(1~23) 선택 탭 + 선택 팀의 평가자별 점수 표.
 * @param mode 'pre'(사전평가) | 'result'(결과평가)
 */
const AdminProjectEval = ({ mode }: { mode: EvalMode }): ReactElement => {
  const meta = MODE_META[mode];
  const [rows, setRows] = useState<EvalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState(1); // 선택된 팀 번호(1~23)

  useEffect(() => {
    // mode가 바뀌면 해당 평가 종류를 다시 로드.
    let alive = true;
    setLoading(true);
    const load = async () => {
      const data = mode === 'pre' ? await listEvals() : await listResultEvals();
      if (!alive) return;
      setRows(data as unknown as EvalRow[]);
      setLoading(false);
    };
    load();
    return () => { alive = false; };
  }, [mode]);

  // 팀별 평가 건수(팀 버튼의 활성/흐림 표시에 사용).
  const countByTeam = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of rows) m.set(r.project_id, (m.get(r.project_id) || 0) + 1);
    return m;
  }, [rows]);

  // 선택된 팀의 평가 행 — 총점 내림차순.
  const teamRows = useMemo(
    () => rows.filter((r) => r.project_id === teamId).slice().sort((a, b) => meta.totalFn(b) - meta.totalFn(a)),
    [rows, meta, teamId],
  );
  const team = TEAM_PROJECTS.find((t) => t.id === teamId);
  const n = teamRows.length;
  const avgOf = (key: string): number => (n ? teamRows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / n : 0);
  const avgTotal = n ? teamRows.reduce((s, r) => s + meta.totalFn(r), 0) / n : 0;

  return (
    <>
      <SEOHead title={meta.title} path={meta.path} noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h2 style={{ borderLeft: `5px solid ${meta.accent}`, paddingLeft: 12 }}>{meta.title}</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* ── 상단: 팀 선택 탭(1팀~23팀) ── */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0 22px' }}>
                {TEAM_PROJECTS.map((p) => {
                  const has = (countByTeam.get(p.id) || 0) > 0;
                  const on = p.id === teamId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setTeamId(p.id)}
                      title={p.title}
                      style={{
                        minWidth: 54, padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                        fontSize: 14, fontWeight: 700,
                        border: on ? '2px solid transparent' : '1px solid var(--border-light)',
                        background: on ? meta.accent : 'var(--bg-white)',
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

              {/* ── 선택 팀의 평가자별 점수 표 ── */}
              <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>
                <span style={{ color: meta.accent, fontWeight: 700 }}>{teamId}팀</span> {team?.title}
              </h3>
              <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: 13 }}>
                {team?.members?.join(', ')} · 평가 {n}명 · 총점 만점 {meta.maxTotal}점
              </p>

              {n === 0 ? (
                <div style={{ padding: 24, background: '#f8fafc', borderRadius: 8, color: '#64748b' }}>
                  아직 이 팀에 대한 평가가 없습니다.
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ fontSize: 13, minWidth: 480 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>평가자</th>
                        {meta.criteria.map((c) => <th key={c.key}>{c.label}</th>)}
                        <th>총점</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamRows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ textAlign: 'left', fontWeight: 600 }}>{r.evaluator_name || '익명'}</td>
                          {meta.criteria.map((c) => (
                            <td key={c.key} style={{ textAlign: 'center' }}>{Number(r[c.key]) || 0}</td>
                          ))}
                          <td style={{ textAlign: 'center', fontWeight: 700, color: meta.accent }}>{meta.totalFn(r)}</td>
                        </tr>
                      ))}
                      {/* 평균 행 */}
                      <tr style={{ background: '#f8fafc' }}>
                        <td style={{ textAlign: 'left', fontWeight: 700, color: '#475569' }}>평균</td>
                        {meta.criteria.map((c) => (
                          <td key={c.key} style={{ textAlign: 'center', color: '#475569' }}>{avgOf(c.key).toFixed(1)}</td>
                        ))}
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>{avgTotal.toFixed(1)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProjectEval;
