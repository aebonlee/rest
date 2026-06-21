/**
 * AdminProjects.tsx
 *
 * 역할:
 *   관리자(Admin) "프로젝트 관리" 페이지 — 프로젝트 평가 점수 뷰어.
 *   상단에서 평가 종류를 [사전평가 / 결과평가] 2개 탭으로 구분하고,
 *   각 탭 상단의 1팀~23팀 버튼으로 팀을 선택하면 그 팀에 대해
 *   '평가자별로 준 점수'를 표로 나열한다. (발표/심사 현장 확인용)
 *
 * 데이터 출처(모두 Supabase, RLS 적용):
 *   - 사전평가: rest_project_evals        (utils/projectEval)        — 5개 항목, 총점 100
 *   - 결과평가: rest_project_result_evals  (utils/projectResultEval)  — 10개 항목, 총점 100
 *   팀 메타(번호·제목·팀원)는 정적 데이터 TEAM_PROJECTS(=팀 번호의 단일 진실 공급원).
 *
 * 주요 export:
 *   - default export: AdminProjects
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
type TabKey = 'pre' | 'result';

/**
 * AdminProjects — 사전/결과평가 2개 탭 + 팀(1~23) 선택으로 평가자별 점수 표시.
 */
const AdminProjects = (): ReactElement => {
  const [preEvals, setPreEvals] = useState<EvalRow[]>([]);
  const [resultEvals, setResultEvals] = useState<EvalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('pre');     // 현재 평가 종류 탭
  const [teamId, setTeamId] = useState(1);           // 선택된 팀 번호(1~23)

  useEffect(() => {
    const load = async () => {
      const [pre, result] = await Promise.all([listEvals(), listResultEvals()]);
      setPreEvals(pre as unknown as EvalRow[]);
      setResultEvals(result as unknown as EvalRow[]);
      setLoading(false);
    };
    load();
  }, []);

  // 현재 탭에 해당하는 평가 설정(데이터·항목·총점 계산기·강조색)을 한 곳에 모은다.
  const view = tab === 'pre'
    ? { rows: preEvals, criteria: EVAL_CRITERIA as readonly Criterion[], totalFn: (r: EvalRow) => totalOf(r as Record<string, number>), maxTotal: PRE_MAX, accent: '#0046C8' }
    : { rows: resultEvals, criteria: RESULT_CRITERIA as readonly Criterion[], totalFn: (r: EvalRow) => totalOfResult(r as Record<string, number>), maxTotal: RESULT_MAX, accent: '#e1567c' };

  // 팀별 평가 건수(팀 버튼의 활성/흐림 표시에 사용).
  const countByTeam = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of view.rows) m.set(r.project_id, (m.get(r.project_id) || 0) + 1);
    return m;
  }, [view.rows]);

  // 선택된 팀의 평가 행 — 총점 내림차순.
  const teamRows = useMemo(
    () => view.rows.filter((r) => r.project_id === teamId).slice().sort((a, b) => view.totalFn(b) - view.totalFn(a)),
    [view.rows, view.totalFn, teamId],
  );
  const team = TEAM_PROJECTS.find((t) => t.id === teamId);
  const n = teamRows.length;
  const avgOf = (key: string): number => (n ? teamRows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / n : 0);
  const avgTotal = n ? teamRows.reduce((s, r) => s + view.totalFn(r), 0) / n : 0;

  return (
    <>
      <SEOHead title="프로젝트 관리" path="/admin/projects" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h2>프로젝트 관리 · 평가 점수</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* ── 1단계: 평가 종류 탭(사전평가 / 결과평가) ── */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--border-light)', marginBottom: 18 }}>
                {([
                  { key: 'pre' as TabKey, label: '사전평가', color: '#0046C8', total: preEvals.length },
                  { key: 'result' as TabKey, label: '결과평가', color: '#e1567c', total: resultEvals.length },
                ]).map((t) => {
                  const on = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      style={{
                        padding: '10px 22px', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700,
                        background: 'transparent', color: on ? t.color : 'var(--text-secondary)',
                        borderBottom: on ? `3px solid ${t.color}` : '3px solid transparent', marginBottom: -2,
                      }}
                    >
                      {t.label}
                      <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        ({t.total}건)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── 2단계: 팀 선택 버튼(1팀~23팀) ── */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
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
                        background: on ? view.accent : 'var(--bg-white)',
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

              {/* ── 3단계: 선택 팀의 평가자별 점수 표 ── */}
              <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>
                <span style={{ color: view.accent, fontWeight: 700 }}>{teamId}팀</span> {team?.title}
              </h3>
              <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: 13 }}>
                {team?.members?.join(', ')} · 평가 {n}명 · 총점 만점 {view.maxTotal}점
              </p>

              {n === 0 ? (
                <div style={{ padding: 24, background: '#f8fafc', borderRadius: 8, color: '#64748b' }}>
                  아직 이 팀에 대한 {tab === 'pre' ? '사전평가' : '결과평가'}가 없습니다.
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ fontSize: 13, minWidth: 480 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>평가자</th>
                        {view.criteria.map((c) => <th key={c.key}>{c.label}</th>)}
                        <th>총점</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamRows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ textAlign: 'left', fontWeight: 600 }}>{r.evaluator_name || '익명'}</td>
                          {view.criteria.map((c) => (
                            <td key={c.key} style={{ textAlign: 'center' }}>{Number(r[c.key]) || 0}</td>
                          ))}
                          <td style={{ textAlign: 'center', fontWeight: 700, color: view.accent }}>{view.totalFn(r)}</td>
                        </tr>
                      ))}
                      {/* 평균 행 */}
                      <tr style={{ background: '#f8fafc' }}>
                        <td style={{ textAlign: 'left', fontWeight: 700, color: '#475569' }}>평균</td>
                        {view.criteria.map((c) => (
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

export default AdminProjects;
