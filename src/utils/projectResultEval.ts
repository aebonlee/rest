/**
 * 프로젝트 결과평가 유틸 (경진대회 · 최종)
 *  - 테이블: rest_project_result_evals
 *  - 사전평가(projectEval)와 동일 구조. 다만 평가 항목이 10개(각 0~20점, 합 200점).
 *  - 평가 대상은 '사전평가 상위 10팀'(집계 기준). 대상 산정은 화면(페이지)에서 처리.
 *
 * [평가 10개 항목]
 *  주제 / 아이디어 / 팀역량(AI리터러시·협업) / 사업화 가능성 / 디자인 /
 *  프로그래밍 / AI 기능개발 / Solar 활용 / 완성도 / 발표·시연
 *
 * [주요 export]
 *  - 상수: RESULT_EVALS_TABLE, RESULT_CRITERIA, RESULT_MAX_PER_CRITERION, RESULT_MAX_TOTAL
 *  - 타입: ProjectResultEval, ResultScores, ProjectResultAgg
 *  - 함수: listResultEvals, upsertResultEval, deleteResultEval, totalOfResult, aggregateResultEvals
 */
import getSupabase from './supabase';
import site from '../config/site';

// 사이트 접두사를 붙인 실제 테이블명 (예: 'rest_project_result_evals')
export const RESULT_EVALS_TABLE = `${site.dbPrefix}project_result_evals`;

// 항목당 만점 / 전체 만점 (사전평가와 동일한 항목당 20점, 10항목 → 200점)
export const RESULT_MAX_PER_CRITERION = 20;
export const RESULT_MAX_TOTAL = 200;

// 결과평가 10개 항목 — 화면 라벨/순서/설명의 단일 진실 공급원. key는 DB 컬럼명과 1:1.
export const RESULT_CRITERIA = [
  { key: 'score_topic',      label: '주제',         desc: '문제 정의의 명확성·시의성' },
  { key: 'score_idea',       label: '아이디어',      desc: '창의성·차별성' },
  { key: 'score_team',       label: '팀역량',        desc: 'AI 리터러시·협업' },
  { key: 'score_biz',        label: '사업화 가능성',  desc: '시장성·실현 가능성' },
  { key: 'score_design',     label: '디자인',        desc: 'UI/UX 완성도' },
  { key: 'score_program',    label: '프로그래밍',     desc: '기능 동작·기술 구현' },
  { key: 'score_ai',         label: 'AI 기능개발',    desc: 'AI 핵심 기능의 구현·활용도' },
  { key: 'score_solar',      label: 'Solar 활용',    desc: '국내 LLM(Solar) 활용 정도(가산)' },
  { key: 'score_completion', label: '완성도',        desc: '서비스 완성도·실사용성' },
  { key: 'score_present',    label: '발표·시연',      desc: '발표 전달력·데모' },
] as const;

// 점수 10개 항목만 모은 타입.
export type ResultScores = {
  score_topic: number;
  score_idea: number;
  score_team: number;
  score_biz: number;
  score_design: number;
  score_program: number;
  score_ai: number;
  score_solar: number;
  score_completion: number;
  score_present: number;
};

// 결과평가 한 건.
export interface ProjectResultEval extends ResultScores {
  id?: string;
  project_id: number;     // 평가 대상 프로젝트(팀) 번호 1~23 (= TEAM_PROJECTS.id)
  evaluator_id: string;
  evaluator_name: string;
  comment: string;        // 종합평
  created_at?: string;
  updated_at?: string;
}

// 점수 10개 항목 합계(0~200).
export function totalOfResult(s: Partial<ResultScores>): number {
  return RESULT_CRITERIA.reduce((sum, c) => sum + (Number(s[c.key]) || 0), 0);
}

// 한 프로젝트(팀)의 결과평가 집계.
export interface ProjectResultAgg {
  project_id: number;
  count: number;
  avgBy: { key: keyof ResultScores; label: string; avg: number }[];
  avgTotal: number;
  comments: { name: string; comment: string; total: number }[];
}

/** 전체 결과평가 조회. */
export async function listResultEvals(): Promise<ProjectResultEval[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(RESULT_EVALS_TABLE).select('*');
  if (error) { console.error('listResultEvals', error); return []; }
  return (data ?? []) as ProjectResultEval[];
}

/** 결과평가 1건 저장(업서트, (project_id, evaluator_id) 충돌 시 갱신). */
export async function upsertResultEval(
  e: ResultScores & { project_id: number; evaluator_id: string; evaluator_name: string; comment: string },
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(RESULT_EVALS_TABLE)
    .upsert(
      {
        project_id: e.project_id,
        evaluator_id: e.evaluator_id,
        evaluator_name: e.evaluator_name,
        score_topic: e.score_topic,
        score_idea: e.score_idea,
        score_team: e.score_team,
        score_biz: e.score_biz,
        score_design: e.score_design,
        score_program: e.score_program,
        score_ai: e.score_ai,
        score_solar: e.score_solar,
        score_completion: e.score_completion,
        score_present: e.score_present,
        comment: e.comment,
      },
      { onConflict: 'project_id,evaluator_id' },
    );
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 전체 결과평가를 프로젝트별로 집계(점수표 + 피드백). */
export function aggregateResultEvals(evals: ProjectResultEval[]): Map<number, ProjectResultAgg> {
  const byProject = new Map<number, ProjectResultEval[]>();
  for (const e of evals) {
    const arr = byProject.get(e.project_id) || [];
    arr.push(e); byProject.set(e.project_id, arr);
  }
  const out = new Map<number, ProjectResultAgg>();
  for (const [pid, arr] of byProject) {
    const n = arr.length;
    const avgBy = RESULT_CRITERIA.map((c) => ({
      key: c.key as keyof ResultScores, label: c.label,
      avg: n ? arr.reduce((s, e) => s + (e[c.key] || 0), 0) / n : 0,
    }));
    const avgTotal = n ? arr.reduce((s, e) => s + totalOfResult(e), 0) / n : 0;
    const comments = arr
      .filter((e) => (e.comment || '').trim())
      .map((e) => ({ name: e.evaluator_name || '익명', comment: e.comment.trim(), total: totalOfResult(e) }))
      .sort((a, b) => b.total - a.total);
    out.set(pid, { project_id: pid, count: n, avgBy, avgTotal, comments });
  }
  return out;
}

/** 내가 작성한 특정 프로젝트 결과평가 삭제(RLS로 본인 것만). */
export async function deleteResultEval(projectId: number, evaluatorId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(RESULT_EVALS_TABLE).delete()
    .eq('project_id', projectId).eq('evaluator_id', evaluatorId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
