/**
 * 프로젝트 사전평가 유틸 (경진대회)
 *  - 테이블: rest_project_evals
 *  - 1인이 한 프로젝트(팀)에 1건(UNIQUE(project_id, evaluator_id)) — 재평가 시 upsert로 갱신
 *  - 5개 항목(각 0~20점, 합 100점) + 종합평(comment)
 *
 * [파일 역할]
 *  수강생이 23개 팀 프로젝트를 평가한 내용을 Supabase에 읽고 쓰는
 *  데이터 접근 계층(DAO). 화면(CompetitionPreEval)은 이 함수들에게만 의존한다.
 *
 * [초보자 메모]
 *  - DAO : "데이터를 어떻게 가져오고 저장하는가"만 담당하는 코드 묶음. 화면 코드와 분리.
 *  - upsert : "있으면 UPDATE, 없으면 INSERT"를 한 번에. 여기서는 (project_id, evaluator_id)가
 *    겹치면 점수/종합평을 갱신한다 → 같은 사람이 같은 프로젝트를 다시 평가하면 '수정'이 된다.
 *  - RLS : 권한 검사는 DB(Supabase) 정책이 한다. 본인 평가만 쓰기/수정/삭제 가능.
 *
 * [주요 export]
 *  - 상수: EVALS_TABLE, EVAL_CRITERIA, MAX_PER_CRITERION, MAX_TOTAL
 *  - 타입: ProjectEval, EvalScores
 *  - 함수: listEvals, upsertEval, deleteEval, totalOf
 */
import getSupabase from './supabase';
import site from '../config/site';

// 사이트 접두사를 붙인 실제 테이블명 (예: 'rest_project_evals')
export const EVALS_TABLE = `${site.dbPrefix}project_evals`;

// 항목당 만점 / 전체 만점
export const MAX_PER_CRITERION = 20;
export const MAX_TOTAL = 100;

// 평가 5개 항목 정의 — 화면 라벨/순서/설명의 단일 진실 공급원.
// key는 DB 컬럼명과 1:1로 일치한다.
export const EVAL_CRITERIA = [
  { key: 'score_topic',   label: '주제',            desc: '문제 정의의 명확성·시의성' },
  { key: 'score_idea',    label: '아이디어',         desc: '창의성·차별성' },
  { key: 'score_biz',     label: '사업화 가능성',     desc: '시장성·실현 가능성' },
  { key: 'score_design',  label: '구현1 · 디자인',    desc: 'UI/UX 완성도' },
  { key: 'score_program', label: '구현2 · 프로그래밍', desc: '기능 동작·기술 구현' },
] as const;

// 점수 5개 항목만 모은 타입(EVAL_CRITERIA의 key들).
export type EvalScores = {
  score_topic: number;
  score_idea: number;
  score_biz: number;
  score_design: number;
  score_program: number;
};

// 평가 한 건의 데이터 형태.
export interface ProjectEval extends EvalScores {
  id?: string;            // 행 PK(서버 생성, 조회 시에만 존재)
  project_id: number;     // 평가 대상 프로젝트(팀) 번호 1~23 (= TEAM_PROJECTS.id)
  evaluator_id: string;   // 평가자 user_id
  evaluator_name: string; // 평가자 표시 이름
  comment: string;        // 종합평(자유 서술)
  created_at?: string;
  updated_at?: string;
}

// 점수 5개 항목 합계(0~100). 누락/비정상 값은 0으로 방어.
export function totalOf(s: Partial<EvalScores>): number {
  return EVAL_CRITERIA.reduce((sum, c) => sum + (Number(s[c.key]) || 0), 0);
}

/**
 * 전체 평가 목록 조회(집계 + 내 평가 판별에 사용).
 * @returns ProjectEval 배열(클라이언트 없음/에러 시 빈 배열)
 */
export async function listEvals(): Promise<ProjectEval[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(EVALS_TABLE).select('*');
  if (error) { console.error('listEvals', error); return []; }
  return (data ?? []) as ProjectEval[];
}

/**
 * 평가 1건 저장(업서트). (project_id, evaluator_id) 충돌 시 점수/종합평 갱신.
 * @returns { ok, error? }
 */
export async function upsertEval(
  e: EvalScores & { project_id: number; evaluator_id: string; evaluator_name: string; comment: string },
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(EVALS_TABLE)
    .upsert(
      {
        project_id: e.project_id,
        evaluator_id: e.evaluator_id,
        evaluator_name: e.evaluator_name,
        score_topic: e.score_topic,
        score_idea: e.score_idea,
        score_biz: e.score_biz,
        score_design: e.score_design,
        score_program: e.score_program,
        comment: e.comment,
      },
      { onConflict: 'project_id,evaluator_id' },
    );
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * 내가 작성한 특정 프로젝트 평가 삭제(RLS로 본인 것만 삭제됨).
 * @returns { ok, error? }
 */
export async function deleteEval(projectId: number, evaluatorId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(EVALS_TABLE).delete()
    .eq('project_id', projectId).eq('evaluator_id', evaluatorId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
