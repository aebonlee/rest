/**
 * AdminProjects.tsx
 *
 * 역할:
 *   관리자(Admin) "프로젝트 관리" 페이지.
 *   1) 팀별 '사전평가' 점수를 평가자별로 나열한 표
 *   2) 팀별 '결과평가' 점수를 평가자별로 나열한 표
 *   3) (참고) 등록된 포트폴리오 프로젝트 목록
 *   을 한 화면에서 보여 준다. 발표/심사 현장에서 누가 몇 점을 줬는지 한눈에 확인하는 용도.
 *
 * 데이터 출처(모두 Supabase, RLS 적용):
 *   - 사전평가: rest_project_evals   (utils/projectEval)        — 5개 항목, 총점 100
 *   - 결과평가: rest_project_result_evals (utils/projectResultEval) — 10개 항목, 총점 100
 *   - 포트폴리오: rest_projects
 *   팀 메타(번호·제목·팀원)는 정적 데이터 TEAM_PROJECTS(=팀 번호의 단일 진실 공급원).
 *
 * 주요 export:
 *   - default export: AdminProjects
 */
import { useState, useEffect, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Project } from '../../types';
import { TEAM_PROJECTS } from '../../data/teamProjects';
import { listEvals, EVAL_CRITERIA, totalOf, MAX_TOTAL as PRE_MAX } from '../../utils/projectEval';
import {
  listResultEvals, RESULT_CRITERIA, totalOfResult, RESULT_MAX_TOTAL as RESULT_MAX,
} from '../../utils/projectResultEval';

const TABLES = { projects: `${site.dbPrefix}projects` };
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };

// 사전/결과평가를 한 가지 렌더러로 그리기 위한 최소 공통 형태.
//  - criteria: 항목 목록(컬럼). key는 평가 행의 점수 컬럼명과 1:1.
//  - rows: 평가 한 건(평가자 1명이 한 팀에 준 점수). 동적 컬럼 접근을 위해 느슨한 타입.
type Criterion = { readonly key: string; readonly label: string };
type EvalRow = { project_id: number; evaluator_name?: string } & Record<string, unknown>;

/**
 * EvalByTeam — 한 평가 종류(사전 or 결과)를 "팀별 → 평가자별" 표로 나열한다.
 * 평가가 1건이라도 있는 팀만 보여 주며, 팀 안에서는 총점 높은 순으로 정렬한다.
 * 각 표 맨 아래에 항목별 '평균' 행을 덧붙여 빠른 비교를 돕는다.
 */
const EvalByTeam = ({ title, criteria, rows, totalFn, maxTotal, accent }: {
  title: string;
  criteria: readonly Criterion[];
  rows: EvalRow[];
  totalFn: (r: EvalRow) => number;
  maxTotal: number;
  accent: string;
}): ReactElement => {
  // project_id(팀 번호) 기준으로 평가 행을 묶는다.
  const byTeam = new Map<number, EvalRow[]>();
  for (const r of rows) {
    const arr = byTeam.get(r.project_id) || [];
    arr.push(r); byTeam.set(r.project_id, arr);
  }
  // 보여 줄 팀: 평가가 있는 팀만, 팀 번호 순서대로.
  const teams = TEAM_PROJECTS.filter((t) => byTeam.has(t.id));

  return (
    <section style={{ marginBottom: 40 }}>
      <h3 style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 10, margin: '0 0 4px' }}>{title}</h3>
      <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 13 }}>
        총 {rows.length}건 · {teams.length}개 팀 · 항목당 만점/총점 기준 {maxTotal}점
      </p>

      {teams.length === 0 ? (
        <div style={{ padding: 24, background: '#f8fafc', borderRadius: 8, color: '#64748b' }}>
          아직 등록된 평가가 없습니다.
        </div>
      ) : (
        teams.map((team) => {
          // 한 팀의 평가 행을 총점 내림차순으로 정렬.
          const teamRows = (byTeam.get(team.id) || []).slice().sort((a, b) => totalFn(b) - totalFn(a));
          // 항목별 평균(평균 행에 사용).
          const n = teamRows.length;
          const avgOf = (key: string): number =>
            n ? teamRows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / n : 0;
          const avgTotal = n ? teamRows.reduce((s, r) => s + totalFn(r), 0) / n : 0;

          return (
            <div key={team.id} style={{ marginBottom: 22 }}>
              <h4 style={{ margin: '0 0 6px', fontSize: 15 }}>
                <span style={{ color: accent, fontWeight: 700 }}>{team.id}팀</span>{' '}
                {team.title}
                <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 13 }}>
                  {' '}· {team.members?.join(', ')} · 평가 {n}명
                </span>
              </h4>
              <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ fontSize: 13, minWidth: 480 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>평가자</th>
                      {criteria.map((c) => <th key={c.key}>{c.label}</th>)}
                      <th>총점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamRows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>{r.evaluator_name || '익명'}</td>
                        {criteria.map((c) => (
                          <td key={c.key} style={{ textAlign: 'center' }}>{Number(r[c.key]) || 0}</td>
                        ))}
                        <td style={{ textAlign: 'center', fontWeight: 700, color: accent }}>{totalFn(r)}</td>
                      </tr>
                    ))}
                    {/* 평균 행 */}
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ textAlign: 'left', fontWeight: 700, color: '#475569' }}>평균</td>
                      {criteria.map((c) => (
                        <td key={c.key} style={{ textAlign: 'center', color: '#475569' }}>{avgOf(c.key).toFixed(1)}</td>
                      ))}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>{avgTotal.toFixed(1)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
};

/**
 * AdminProjects — 관리자 프로젝트 관리 페이지.
 * 마운트 시 사전평가·결과평가·포트폴리오 프로젝트를 한 번에 로드한다.
 */
const AdminProjects = (): ReactElement => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [preEvals, setPreEvals] = useState<EvalRow[]>([]);
  const [resultEvals, setResultEvals] = useState<EvalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // 평가 데이터는 utils의 DAO로(권한/테이블명 일관), 포트폴리오 목록은 직접 조회.
      const [pre, result] = await Promise.all([listEvals(), listResultEvals()]);
      setPreEvals(pre as unknown as EvalRow[]);
      setResultEvals(result as unknown as EvalRow[]);

      const client = getSupabase();
      if (client) {
        const { data } = await client.from(TABLES.projects).select('*').order('created_at', { ascending: false });
        if (data) setProjects(data as Project[]);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <SEOHead title="프로젝트 관리" path="/admin/projects" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h2>프로젝트 관리</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 1) 사전평가 — 팀별 평가자 점수 */}
              <EvalByTeam
                title="사전평가 — 팀별 평가자 점수"
                criteria={EVAL_CRITERIA}
                rows={preEvals}
                totalFn={(r) => totalOf(r as Record<string, number>)}
                maxTotal={PRE_MAX}
                accent="#0046C8"
              />

              {/* 2) 결과평가 — 팀별 평가자 점수 */}
              <EvalByTeam
                title="결과평가 — 팀별 평가자 점수"
                criteria={RESULT_CRITERIA}
                rows={resultEvals}
                totalFn={(r) => totalOfResult(r as Record<string, number>)}
                maxTotal={RESULT_MAX}
                accent="#e1567c"
              />

              {/* 3) (참고) 등록된 포트폴리오 프로젝트 목록 */}
              <section>
                <h3 style={{ borderLeft: '4px solid #94a3b8', paddingLeft: 10, margin: '0 0 16px' }}>
                  등록 프로젝트 목록
                </h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead><tr><th>제목</th><th>유형</th><th>상태</th><th>LLM</th><th>등록일</th></tr></thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p.id}>
                          <td>{p.title}</td><td>{p.category}</td>
                          <td><span className={`project-status ${p.status}`}>{statusLabels[p.status] || p.status}</span></td>
                          <td>{(Array.isArray(p.llm_used) ? p.llm_used : []).join(', ')}</td>
                          <td>{new Date(p.created_at).toLocaleDateString('ko-KR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProjects;
