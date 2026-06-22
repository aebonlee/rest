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
import type { ProjectAgg } from './projectEval';

// 사이트 접두사를 붙인 실제 테이블명 (예: 'rest_project_result_evals')
export const RESULT_EVALS_TABLE = `${site.dbPrefix}project_result_evals`;

// 항목당 만점 / 전체 만점 (항목당 10점, 10항목 → 100점)
export const RESULT_MAX_PER_CRITERION = 10;
export const RESULT_MAX_TOTAL = 100;

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

// 10개 항목을 2개 계열(각 5개)로 분할 — 집계표 레이더 차트를 계열별로 분리해 그리기 위함.
// 두 계열의 keys 합집합 = RESULT_CRITERIA 전체.
export const RESULT_CRITERIA_GROUPS = [
  { title: '기획·비즈니스', keys: ['score_topic', 'score_idea', 'score_team', 'score_biz', 'score_present'] },
  { title: '구현·기술',     keys: ['score_design', 'score_program', 'score_ai', 'score_solar', 'score_completion'] },
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

// ──────────────────────────────────────────────────────────────────────────
// 결과평가 대상(기본: 사전평가 상위 10팀) 선정 — 단일 진실 공급원
// ──────────────────────────────────────────────────────────────────────────

/**
 * RESULT_TARGET_OVERRIDE — 결과평가 대상(기본 10팀) 수동 보정 설정.
 *
 * [왜 필요?]
 *  - 동점/중복(예: 한 학생이 여러 팀으로 상위권을 차지) 등으로 자동 상위 10팀만으로는
 *    운영이 어려울 때, 순위 번호가 아니라 "팀 번호"로 보정한다.
 *    (라이브 점수가 바뀌어도 의도가 유지되도록 팀 id로 고정.)
 *
 * [필드]
 *  - include: 상위 10에 들지 못해도 결과평가 대상에 **추가로 넣을** 팀 id(예: 차순위 팀).
 *             기존 상위 10팀을 밀어내지 않고 그 위에 더한다(사전평가 등수 표시는 불변).
 *  - exclude: 결과평가 대상에서 **뺄** 팀 id(현재 미사용, 향후 필요 시).
 *
 * [운영 메모] 값만 바꾸면 결과평가 입력/집계표/등수표 모든 화면에 동시 반영된다.
 *   현재 운영: 한 학생(최윤정)이 사전평가 9·10·11위를 차지 → 빼지 않고 차순위 팀을
 *   결과발표 대상에 추가하기 위해 include에 차순위 팀 번호를 넣는다.
 */
export const RESULT_TARGET_OVERRIDE: { include: number[]; exclude: number[] } = {
  // 6팀(AI 자기소개서·면접 코치) = 사전평가 12위. 최윤정 학생이 9·10·11위를 차지해
  // 차순위인 6팀을 결과발표 대상에 추가(기존 상위 10팀은 유지, 사전평가 등수는 불변).
  include: [6],
  exclude: [],
};

/**
 * 사전평가 집계로부터 결과평가 대상 팀 목록을 산정한다.
 *  1) 사전평가 총점 평균 내림차순으로 정렬(동점은 평가 건수 많은 순) → 상위 size팀,
 *  2) include 팀을 (상위 size 밖이라도) **추가**(기존 팀을 밀어내지 않음 = 등수 불변),
 *  3) exclude 팀은 결과에서 제거.
 * → 반환 팀 수는 size + (추가된 include 수)일 수 있다.
 *
 * @param preAgg   aggregateEvals(사전평가) 결과 맵
 * @param projects 전체 팀 목록(id를 가진 객체 배열) — 반환은 이 배열의 부분집합
 * @param size     기본 대상 팀 수(기본 10)
 * @returns 대상 팀 객체 배열(사전평가 순위 순서, 추가 팀은 제 순위 위치에 삽입)
 */
export function selectResultTargets<T extends { id: number }>(
  preAgg: Map<number, ProjectAgg>,
  projects: T[],
  size = 10,
): T[] {
  const byId = new Map(projects.map((p) => [p.id, p]));

  // 사전평가가 1건 이상인 팀을 순위대로 나열.
  const ranked = projects
    .map((p) => ({ id: p.id, a: preAgg.get(p.id) }))
    .filter((x) => x.a && x.a.count > 0)
    .sort((x, y) => (y.a!.avgTotal - x.a!.avgTotal) || (y.a!.count - x.a!.count))
    .map((x) => x.id);

  const topSet = new Set(ranked.slice(0, size));                 // 자동 상위 size팀
  const included = new Set(RESULT_TARGET_OVERRIDE.include.filter((id) => byId.has(id)));
  const excluded = new Set(RESULT_TARGET_OVERRIDE.exclude);

  // 대상 = (상위 size ∪ 추가 팀) − 제외 팀. 순위 순서 유지.
  const targetIds = ranked.filter((id) => (topSet.has(id) || included.has(id)) && !excluded.has(id));
  // 사전평가가 없어 ranked에 없는 추가 팀은 맨 뒤에 붙인다.
  for (const id of included) if (!ranked.includes(id) && !excluded.has(id)) targetIds.push(id);

  return targetIds.map((id) => byId.get(id)!).filter(Boolean);
}

/** 내가 작성한 특정 프로젝트 결과평가 삭제(RLS로 본인 것만). */
export async function deleteResultEval(projectId: number, evaluatorId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(RESULT_EVALS_TABLE).delete()
    .eq('project_id', projectId).eq('evaluator_id', evaluatorId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
