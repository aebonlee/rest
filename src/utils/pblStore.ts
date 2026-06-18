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
  phone: string;
  /** 학생이 정한 프로젝트 주제(자유 입력) */
  project_topic?: string;
  // 아래 항목들은 사이트별로 선택 사용 — rest는 사용하지 않으므로 모두 선택(optional).
  student_no?: string;
  college?: string;
  department?: string;
  major?: string;
  roster_matched?: boolean;
  region?: string;
  topic_key?: string;
  track?: string;
  course_type?: string;
  major_type?: string;
}

export interface PblSubmission {
  user_id: string;
  email: string;
  student_name: string;
  project_topic?: string;
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
    phone: info.phone || '',
    updated_at: new Date().toISOString(),
  };
  const full = {
    ...core,
    project_topic: info.project_topic || '',
    student_no: info.student_no || '',
    major: info.major || '',
    region: info.region || '',
    topic_key: info.topic_key || '',
    track: info.track || '',
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
  // select()로 반환 행을 함께 요청 → 저장이 실제로 반영됐는지 확인(저장됐다고 떴는데 사라지는 문제 방지)
  const { data, error } = await client
    .from(PBL_TABLE)
    .upsert(row, { onConflict: 'user_id' })
    .select('user_id')
    .maybeSingle();
  if (error) throw enrichSaveError(error);
  if (!data) {
    // 에러는 없지만 반영된 행이 없음 = RLS/제약 문제로 사실상 저장 실패. 조용히 사라지지 않도록 명시적으로 알림.
    throw new Error(
      '저장이 서버에 반영되지 않았습니다. 관리자에게 문의하세요. ' +
      '(Supabase rest_pbl_submissions 테이블/권한 설정 확인 필요)',
    );
  }
}

/** Supabase 저장 오류를 사람이 읽을 수 있는 메시지로 보강 (테이블 없음/제약 없음 등) */
function enrichSaveError(error: { code?: string; message?: string }): Error {
  const code = error?.code || '';
  const msg = error?.message || '';
  // 42P01: relation does not exist (테이블 미생성), 42P10/23505: onConflict 제약 문제
  if (code === '42P01' || /does not exist/i.test(msg)) {
    return new Error('저장 테이블(rest_pbl_submissions)이 아직 생성되지 않았습니다. 관리자: 마이그레이션 SQL을 실행하세요.');
  }
  if (/on conflict|unique or exclusion/i.test(msg)) {
    return new Error('저장 설정 오류(user_id 고유 제약 누락). 관리자: 복구 SQL을 실행하세요.');
  }
  return new Error(msg || '알 수 없는 저장 오류');
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
