/**
 * 학습평가 성적 저장/조회 — rest_assessments 테이블
 * 채점형 평가(선수평가·사후평가)만 대상. 진단평가는 자습용이라 저장하지 않음.
 *
 * [파일 역할]
 *  - LMS 학습평가의 채점 결과를 Supabase 테이블(rest_assessments)에 영속화하고 조회하는 유틸 모듈.
 *  - UI 컴포넌트에서 직접 Supabase 쿼리를 작성하지 않도록, 데이터 접근 로직을 한곳에 캡슐화한다.
 *
 * [핵심 책임]
 *  - 채점형 평가 결과의 업서트 저장(학생당 평가 유형별 1행 유지).
 *  - 본인 성적 조회 및 관리자용 전체 성적 조회.
 *  - Supabase 미설정/오류 등 비정상 상황에서 안전한 폴백값 반환.
 *
 * [주요 export]
 *  - ASSESSMENTS_TABLE : 평가 테이블명(사이트별 prefix 적용) 상수.
 *  - GradedType        : 채점형 평가 유형 타입('prerequisite' | 'summative').
 *  - AssessmentRecord  : 평가 성적 레코드 인터페이스.
 *  - saveAssessmentResult / getMyAssessments / getAllAssessments : 저장·조회 함수.
 */
// Supabase 클라이언트 팩토리(미설정 시 null 반환 가능)
import getSupabase from './supabase';
// 사이트 설정(테이블 prefix 등 환경별 값)
import site from '../config/site';

// 평가 테이블명. 사이트별 dbPrefix를 붙여 다중 사이트가 같은 DB를 공유해도 충돌하지 않게 한다.
export const ASSESSMENTS_TABLE = `${site.dbPrefix}assessments`;

// 채점형 평가 유형: 선수평가(prerequisite)와 사후평가(summative)만 저장 대상.
export type GradedType = 'prerequisite' | 'summative';

// 평가 성적 한 건을 표현하는 레코드. DB 컬럼과 1:1로 대응한다.
export interface AssessmentRecord {
  id?: string;              // DB 자동 생성 PK(저장 시에는 비워둠)
  student_id: string;       // 학생 식별자(인증 사용자 ID)
  student_name: string;     // 학생 이름(표시용 비정규화 필드)
  student_email: string;    // 학생 이메일(표시/식별용 비정규화 필드)
  type: GradedType;         // 평가 유형(선수/사후)
  score: number;      // 100점 만점 환산
  correct: number;          // 맞힌 문항 수
  total: number;            // 전체 문항 수
  passed: boolean;          // 합격 여부
  answers?: Record<number, number>; // 문항 인덱스 → 선택한 보기 인덱스 매핑(선택)
  submitted_at?: string;    // 제출 시각(ISO 문자열, 저장 시 서버에서 갱신)
}

/** 채점 결과 저장(업서트). Supabase 미설정/비로그인 시 saved:false 반환 */
// 매개변수: rec — 저장할 평가 레코드.
// 반환값: { saved, error? } — 저장 성공 여부와 실패 사유.
// 부수효과: rest_assessments 테이블에 upsert(삽입 또는 갱신) 수행.
export async function saveAssessmentResult(
  rec: AssessmentRecord
): Promise<{ saved: boolean; error?: string }> {
  const client = getSupabase();
  // Supabase가 설정되지 않은 환경(로컬 미설정 등)에서는 저장하지 않고 조용히 실패 반환.
  if (!client) return { saved: false, error: 'supabase-not-configured' };

  // upsert: onConflict 'student_id,type' 기준으로 동일 학생·동일 유형이면 갱신,
  // 없으면 신규 삽입 → 학생당 평가 유형별 최신 1행만 유지된다(재응시 시 덮어쓰기).
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
      answers: rec.answers ?? {}, // answers 미제공 시 빈 객체로 저장(널 방지)
      submitted_at: new Date().toISOString(), // 클라이언트 기준 제출 시각을 매 저장마다 갱신
    },
    { onConflict: 'student_id,type' } // 복합 유니크 키(학생+유형) 충돌 시 갱신 처리
  );

  // 쿼리 에러가 있으면 메시지와 함께 실패 반환, 없으면 성공.
  if (error) return { saved: false, error: error.message };
  return { saved: true };
}

/** 본인 평가 성적 조회 */
// 매개변수: studentId — 조회 대상 학생 ID.
// 반환값: 해당 학생의 평가 레코드 배열(제출 시각 내림차순). 미설정/오류 시 빈 배열.
// 부수효과: 없음(읽기 전용). RLS 정책에 의해 본인 행만 조회된다.
export async function getMyAssessments(studentId: string): Promise<AssessmentRecord[]> {
  const client = getSupabase();
  if (!client) return []; // 미설정 환경에서는 빈 결과로 폴백
  const { data, error } = await client
    .from(ASSESSMENTS_TABLE)
    .select('*')
    .eq('student_id', studentId) // 본인 학생 ID로 필터(추가로 RLS가 서버측 보호)
    .order('submitted_at', { ascending: false }); // 최신 제출이 먼저 오도록 정렬
  if (error) {
    // 조회 실패는 호출부 흐름을 막지 않도록 로깅 후 빈 배열로 폴백.
    console.error('getMyAssessments error:', error);
    return [];
  }
  return (data ?? []) as AssessmentRecord[];
}

/** 관리자: 전체 수강생 평가 성적 조회 (RLS로 관리자만 전체 조회 가능) */
// 매개변수: 없음.
// 반환값: 모든 학생의 평가 레코드 배열(제출 시각 내림차순). 미설정/오류 시 빈 배열.
// 부수효과: 없음(읽기 전용). 학생 필터를 걸지 않으므로 전체 조회 권한은
//           전적으로 Supabase RLS 정책(관리자만 허용)에 의존한다.
export async function getAllAssessments(): Promise<AssessmentRecord[]> {
  const client = getSupabase();
  if (!client) return []; // 미설정 환경에서는 빈 결과로 폴백
  // student_id 필터 없이 전체 행을 조회 — 비관리자 호출 시 RLS가 서버측에서 차단/필터.
  const { data, error } = await client
    .from(ASSESSMENTS_TABLE)
    .select('*')
    .order('submitted_at', { ascending: false }); // 최신 제출이 먼저 오도록 정렬
  if (error) {
    // 조회 실패는 호출부 흐름을 막지 않도록 로깅 후 빈 배열로 폴백.
    console.error('getAllAssessments error:', error);
    return [];
  }
  return (data ?? []) as AssessmentRecord[];
}
