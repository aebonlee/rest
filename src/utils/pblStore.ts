/**
 * PBL 활동 제출 저장/조회 — Supabase (snu_pbl_submissions, user당 1행).
 *  - content  jsonb: { [stageKey]: { [fieldId]: string } }  (학생 작성)
 *  - auto     jsonb: { [stageKey]: number(0~100) }           (자동 평가 점수, 학생 본인)
 *  - scores   jsonb: { [stageKey]: number }                  (강사 평가)
 *  - feedback jsonb: { [stageKey]: string }                  (강사 피드백)
 */
import getSupabase from './supabase';
import site from '../config/site';

export const PBL_TABLE = `${site.dbPrefix}pbl_submissions`;

export interface PblInfo {
  student_name: string;
  student_no: string;
  college: string;
  department: string;
  major: string;
  roster_matched: boolean;
  phone: string;
  region: string;
  topic_key: string;
  track: string;
  course_type?: string;
  major_type?: string;
}

export interface PblSubmission {
  user_id: string;
  email: string;
  student_name: string;
  student_no: string;
  college?: string;
  department?: string;
  major: string;
  course_type?: string;
  major_type?: string;
  roster_matched?: boolean;
  phone: string;
  team_name: string;
  region: string;
  topic_key: string;
  track: string;
  content: Record<string, Record<string, string>>;
  auto: Record<string, number>;
  scores: Record<string, number>;
  feedback: Record<string, string>;
  updated_at?: string;
}

type AuthUser = { id: string; email?: string } | null | undefined;

export async function getMySubmission(user: AuthUser): Promise<PblSubmission | null> {
  const client = getSupabase();
  if (!client || !user) return null;
  const { data } = await client.from(PBL_TABLE).select('*').eq('user_id', user.id).maybeSingle();
  return (data as PblSubmission) || null;
}

/** 기본정보 저장(upsert) */
export async function saveInfo(user: AuthUser, info: PblInfo): Promise<void> {
  const client = getSupabase();
  if (!client || !user) throw new Error('로그인이 필요합니다.');
  const core = {
    user_id: user.id,
    email: user.email || '',
    student_name: info.student_name || '',
    student_no: info.student_no || '',
    major: info.major || '',
    phone: info.phone || '',
    region: info.region || '',
    topic_key: info.topic_key || '',
    track: info.track || '',
    updated_at: new Date().toISOString(),
  };
  const full = {
    ...core,
    college: info.college || '',
    department: info.department || '',
    course_type: info.course_type || '',
    major_type: info.major_type || '',
    roster_matched: !!info.roster_matched,
  };
  // 신규 컬럼(college 등)이 아직 없으면 핵심 정보만 저장(폴백)
  let { error } = await client.from(PBL_TABLE).upsert(full, { onConflict: 'user_id' });
  if (error) {
    const res = await client.from(PBL_TABLE).upsert(core, { onConflict: 'user_id' });
    error = res.error;
  }
  if (error) throw error;
}

/** 단계 콘텐츠 + 자동 평가 점수 저장 — 해당 단계만 병합 후 upsert */
export async function saveStageContent(
  user: AuthUser, stageKey: string, fields: Record<string, string>, autoScore?: number | null,
): Promise<void> {
  const client = getSupabase();
  if (!client || !user) throw new Error('로그인이 필요합니다.');
  const current = await getMySubmission(user);
  const content = { ...(current?.content || {}), [stageKey]: fields };
  const auto = { ...(current?.auto || {}) };
  if (typeof autoScore === 'number') auto[stageKey] = autoScore;
  const row = {
    user_id: user.id,
    email: user.email || '',
    content,
    auto,
    updated_at: new Date().toISOString(),
  };
  const { error } = await client.from(PBL_TABLE).upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}

/** 강사 평가 저장 — 특정 학생 행의 단계 점수·피드백 병합(관리자 RLS) */
export async function saveGrade(
  target: PblSubmission, stageKey: string, score: number | null, feedback: string,
): Promise<void> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase 미연결');
  const scores = { ...(target.scores || {}) };
  if (score === null || Number.isNaN(score)) delete scores[stageKey];
  else scores[stageKey] = score;
  const fb = { ...(target.feedback || {}), [stageKey]: feedback };
  const { error } = await client
    .from(PBL_TABLE)
    .update({ scores, feedback: fb, updated_at: new Date().toISOString() })
    .eq('user_id', target.user_id);
  if (error) throw error;
}

/** 전체 제출 조회 (관리자 전용 — RLS가 관리자에게만 전체 반환) */
export async function getAllSubmissions(): Promise<PblSubmission[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data } = await client
    .from(PBL_TABLE).select('*')
    .order('team_name', { ascending: true })
    .order('student_name', { ascending: true });
  return (data as PblSubmission[]) || [];
}
