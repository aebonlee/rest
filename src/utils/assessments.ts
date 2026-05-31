/**
 * 학습평가 성적 저장/조회 — rest_assessments 테이블
 * 채점형 평가(선수평가·사후평가)만 대상. 진단평가는 자습용이라 저장하지 않음.
 */
import getSupabase from './supabase';
import site from '../config/site';

export const ASSESSMENTS_TABLE = `${site.dbPrefix}assessments`;

export type GradedType = 'prerequisite' | 'summative';

export interface AssessmentRecord {
  id?: string;
  student_id: string;
  student_name: string;
  student_email: string;
  type: GradedType;
  score: number;      // 100점 만점 환산
  correct: number;
  total: number;
  passed: boolean;
  answers?: Record<number, number>;
  submitted_at?: string;
}

/** 채점 결과 저장(업서트). Supabase 미설정/비로그인 시 saved:false 반환 */
export async function saveAssessmentResult(
  rec: AssessmentRecord
): Promise<{ saved: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { saved: false, error: 'supabase-not-configured' };

  const { error } = await client.from(ASSESSMENTS_TABLE).upsert(
    {
      student_id: rec.student_id,
      student_name: rec.student_name,
      student_email: rec.student_email,
      type: rec.type,
      score: rec.score,
      correct: rec.correct,
      total: rec.total,
      passed: rec.passed,
      answers: rec.answers ?? {},
      submitted_at: new Date().toISOString(),
    },
    { onConflict: 'student_id,type' }
  );

  if (error) return { saved: false, error: error.message };
  return { saved: true };
}

/** 본인 평가 성적 조회 */
export async function getMyAssessments(studentId: string): Promise<AssessmentRecord[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from(ASSESSMENTS_TABLE)
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });
  if (error) {
    console.error('getMyAssessments error:', error);
    return [];
  }
  return (data ?? []) as AssessmentRecord[];
}

/** 관리자: 전체 수강생 평가 성적 조회 (RLS로 관리자만 전체 조회 가능) */
export async function getAllAssessments(): Promise<AssessmentRecord[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from(ASSESSMENTS_TABLE)
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) {
    console.error('getAllAssessments error:', error);
    return [];
  }
  return (data ?? []) as AssessmentRecord[];
}
