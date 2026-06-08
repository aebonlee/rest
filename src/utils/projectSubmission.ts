/**
 * 팀 프로젝트 산출물 제출 DAO (Supabase)
 *  - 테이블: rest_team_submission (team_id 고유, data JSONB)
 *  - data: { summary, demo_url, slides_url, repo_url } — 팀이 제출하는 최종 산출물 링크/요약
 *  - 배포 앱(github project번호)·패들렛은 팀 번호로 자동 생성되므로 여기에 저장하지 않는다.
 *  - RLS: 조회는 로그인 전체(결과 허브/강사), 쓰기는 해당 팀원만(SQL 정책에서 강제).
 */
import getSupabase from './supabase';
import site from '../config/site';

export const TEAM_SUBMISSION_TABLE = `${site.dbPrefix}team_submission`;

// 산출물 제출 내용.
export interface SubmissionData {
  summary: string;     // 한 줄 소개/회고
  demo_url: string;    // 데모/배포 URL(자체 배포가 따로 있으면)
  slides_url: string;  // 발표자료 URL
  repo_url: string;    // 소스 저장소 URL
}

export interface TeamSubmissionRow {
  team_id: string;
  data: SubmissionData;
}

// 빈 제출 기본값.
export const EMPTY_SUBMISSION: SubmissionData = { summary: '', demo_url: '', slides_url: '', repo_url: '' };

/**
 * 전체 팀의 제출물을 "team_id → data"로 조회한다.
 */
export async function listSubmissions(): Promise<Record<string, SubmissionData>> {
  const client = getSupabase();
  if (!client) return {};
  const { data, error } = await client.from(TEAM_SUBMISSION_TABLE).select('team_id, data');
  if (error) { console.error('listSubmissions', error); return {}; }
  const map: Record<string, SubmissionData> = {};
  (data ?? []).forEach((r) => {
    const row = r as TeamSubmissionRow;
    map[row.team_id] = { ...EMPTY_SUBMISSION, ...(row.data || {}) };
  });
  return map;
}

/**
 * 한 팀의 제출물을 저장(upsert)한다.
 * @param teamId 대상 팀 id
 * @param data 제출 내용
 */
export async function saveSubmission(teamId: string, data: SubmissionData): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client
    .from(TEAM_SUBMISSION_TABLE)
    .upsert({ team_id: teamId, data }, { onConflict: 'team_id' });
  return error ? { ok: false, error: error.message } : { ok: true };
}
