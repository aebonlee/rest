/**
 * 학습평가 성적 저장/조회 — rest_assessments 테이블
 * 채점형 평가(선수평가·사후평가)만 대상. 진단평가는 자습용이라 저장하지 않음.
 *
 * [이 파일이 무엇인가 — 초보자용 한 줄 설명]
 *  - 학생이 본 시험(평가)의 "점수/정답 수/합격 여부"를 데이터베이스에 저장하고,
 *    나중에 다시 꺼내 보여주는(조회하는) "데이터 담당 모듈"이다.
 *  - 화면을 그리는 React 컴포넌트는 "어떻게 저장하는지"를 몰라도 되도록,
 *    여기에 있는 함수(saveAssessmentResult / getMyAssessments / getAllAssessments)만 불러 쓰면 된다.
 *
 * [꼭 알아둘 배경 용어]
 *  - Supabase: 클라우드 데이터베이스 + 인증 서비스. 우리는 이 안의 "테이블"에 성적을 저장한다.
 *  - 테이블/행(row)/컬럼(column): 엑셀 시트라고 생각하면 쉽다. 시트=테이블, 한 줄=행, 항목=컬럼.
 *  - upsert: "update + insert". 같은 데이터가 이미 있으면 갱신(덮어쓰기), 없으면 새로 추가.
 *  - RLS(Row Level Security, 행 수준 보안): DB 서버가 "이 사용자는 어떤 행을 볼/바꿀 수 있는지"를
 *    직접 검사하는 보안 규칙. 즉, 클라이언트 코드가 깜빡 실수해도 서버가 한 번 더 막아준다.
 *  - async/await: 시간이 걸리는 작업(DB 통신 등)을 "기다렸다가" 결과를 받는 비동기 문법.
 *    await가 붙은 줄은 그 작업이 끝날 때까지 다음 줄로 넘어가지 않는다.
 *  - 폴백(fallback): 일이 잘못됐을 때 앱이 멈추지 않도록 "대신 쓰는 안전한 기본값"(여기선 빈 배열 등).
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
 *
 * 참고: export 는 "이 값/함수를 다른 파일에서도 쓸 수 있게 공개한다"는 뜻이다.
 *       반대로 import 는 "다른 파일이 공개한 것을 가져온다"는 뜻.
 */
// Supabase 클라이언트 팩토리(미설정 시 null 반환 가능)
// getSupabase()를 호출하면 DB와 통신할 수 있는 "클라이언트 객체"를 돌려준다.
// 단, 환경설정이 없으면(예: 로컬에서 키 미입력) null 을 돌려줄 수 있으므로 항상 null 검사를 해야 한다.
import getSupabase from './supabase';
// 사이트 설정(테이블 prefix 등 환경별 값)
// 여러 강의 사이트가 하나의 DB를 공유하므로, 사이트마다 다른 접두어(prefix)를 붙여 테이블 이름을 구분한다.
import site from '../config/site';

// 평가 테이블명. 사이트별 dbPrefix를 붙여 다중 사이트가 같은 DB를 공유해도 충돌하지 않게 한다.
// 예: dbPrefix가 'rest_'이면 최종 테이블명은 'rest_assessments'가 된다.
// 백틱(`)으로 감싼 문자열은 템플릿 리터럴이라, ${...} 안의 값이 실제 값으로 치환되어 들어간다.
export const ASSESSMENTS_TABLE = `${site.dbPrefix}assessments`;

// 채점형 평가 유형: 선수평가(prerequisite)와 사후평가(summative)만 저장 대상.
// TS 개념(유니언 타입): 아래 타입의 값은 두 문자열 중 "딱 하나"만 될 수 있다.
//   다른 문자열(예: 'diagnostic')을 넣으면 컴파일 단계에서 에러로 잡아준다 → 오타/잘못된 값 예방.
export type GradedType = 'prerequisite' | 'summative';

// 평가 성적 한 건을 표현하는 레코드. DB 컬럼과 1:1로 대응한다.
// TS 개념(interface): "이 데이터는 어떤 항목(필드)을 어떤 타입으로 가져야 하는지"를 정의하는 설계도.
//   필드 이름 뒤의 ? 는 "있어도 되고 없어도 되는(선택적)" 항목이라는 뜻이다.
export interface AssessmentRecord {
  id?: string;              // DB 자동 생성 PK(저장 시에는 비워둠). PK=각 행을 구분하는 고유 번호.
  student_id: string;       // 학생 식별자(인증 사용자 ID)
  student_name: string;     // 학생 이름(표시용 비정규화 필드)
  student_email: string;    // 학생 이메일(표시/식별용 비정규화 필드)
  // 비정규화(denormalization): 이름/이메일은 다른 테이블에서 매번 합쳐 가져오는 대신,
  //   조회 편의를 위해 이 성적 행에 함께 복사해 둔 것이다(목록을 빠르게 보여주려는 의도).
  type: GradedType;         // 평가 유형(선수/사후) — 위에서 정의한 두 값 중 하나만 가능
  score: number;      // 100점 만점 환산
  correct: number;          // 맞힌 문항 수
  total: number;            // 전체 문항 수
  passed: boolean;          // 합격 여부(true=합격 / false=불합격)
  answers?: Record<number, number>; // 문항 인덱스 → 선택한 보기 인덱스 매핑(선택)
  // Record<number, number> 는 "키도 숫자, 값도 숫자인 객체"라는 뜻. 예: { 0: 2, 1: 0 }
  //   → 0번 문항에서 2번 보기를, 1번 문항에서 0번 보기를 골랐다는 의미.
  submitted_at?: string;    // 제출 시각(ISO 문자열, 저장 시 서버에서 갱신)
  // ISO 문자열 예: '2026-06-07T08:30:00.000Z' — 컴퓨터가 정렬/비교하기 쉬운 표준 날짜 형식.
}

/** 채점 결과 저장(업서트). Supabase 미설정/비로그인 시 saved:false 반환 */
// 무엇을 하나: 한 학생의 평가 결과 한 건을 DB에 저장(있으면 갱신, 없으면 추가)한다.
// 왜 이렇게 하나: 같은 학생이 같은 유형 시험을 또 보면 "새 행을 쌓는" 대신 "기존 행을 덮어써서"
//                항상 최신 성적 1줄만 깔끔하게 남기려는 것이다(아래 onConflict 설명 참고).
// 매개변수: rec — 저장할 평가 레코드(위 AssessmentRecord 형태).
// 반환값: { saved, error? } — 저장 성공 여부와 (실패 시) 사유 메시지.
// 부수효과: rest_assessments 테이블에 upsert(삽입 또는 갱신) 수행.
// 주의: async 함수는 항상 Promise(미래의 결과 약속)를 반환한다.
//       그래서 호출하는 쪽에서는 await saveAssessmentResult(...) 처럼 await로 결과를 기다려야 한다.
export async function saveAssessmentResult(
  rec: AssessmentRecord
): Promise<{ saved: boolean; error?: string }> {
  const client = getSupabase();
  // Supabase가 설정되지 않은 환경(로컬 미설정 등)에서는 저장하지 않고 조용히 실패 반환.
  // 주의: 여기서 막지 않고 그냥 진행하면 null.from(...) 호출에서 앱이 터진다(런타임 에러).
  //       그래서 client가 없으면 "저장 안 됨"을 정상적으로 알려주고 함수를 끝낸다(early return).
  if (!client) return { saved: false, error: 'supabase-not-configured' };

  // upsert: onConflict 'student_id,type' 기준으로 동일 학생·동일 유형이면 갱신,
  // 없으면 신규 삽입 → 학생당 평가 유형별 최신 1행만 유지된다(재응시 시 덮어쓰기).
  // await: DB 저장은 네트워크 통신이라 시간이 걸린다 → 끝날 때까지 기다렸다가 결과(error)를 받는다.
  // 구조 분해 할당 { error }: 반환된 응답 객체에서 error 항목만 꺼내 변수로 받는 문법.
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
      // ?? (널 병합 연산자): 왼쪽 값이 null 또는 undefined일 때만 오른쪽 기본값({})을 쓴다.
      //   주의: || 와 달리 0 이나 '' 같은 "값은 있는데 falsy한" 경우는 기본값으로 바꾸지 않는다.
      submitted_at: new Date().toISOString(), // 클라이언트 기준 제출 시각을 매 저장마다 갱신
      // new Date() = 지금 시각, .toISOString() = 그걸 표준 문자열로 변환. 저장할 때마다 현재 시각으로 새로 찍힌다.
    },
    { onConflict: 'student_id,type' } // 복합 유니크 키(학생+유형) 충돌 시 갱신 처리
    // onConflict: "이 컬럼들 조합이 이미 존재하면(=충돌하면)" 새로 넣지 말고 그 행을 갱신하라는 지시.
    //   주의: 이게 작동하려면 DB 테이블에 (student_id, type) 복합 유니크 제약이 실제로 걸려 있어야 한다.
  );

  // 쿼리 에러가 있으면 메시지와 함께 실패 반환, 없으면 성공.
  // error는 문제가 없을 때 null이므로, "if (error)"는 "에러가 있을 때만" 참이 된다.
  if (error) return { saved: false, error: error.message };
  return { saved: true };
}

/** 본인 평가 성적 조회 */
// 무엇을 하나: 특정 학생 1명의 평가 성적들을 최신순으로 가져온다.
// 왜 이렇게 하나: 학생이 "내 성적" 화면에서 자기가 본 시험 결과를 확인할 수 있게 하기 위함.
// 매개변수: studentId — 조회 대상 학생 ID.
// 반환값: 해당 학생의 평가 레코드 배열(제출 시각 내림차순). 미설정/오류 시 빈 배열.
// 부수효과: 없음(읽기 전용). RLS 정책에 의해 본인 행만 조회된다.
// 주의: 코드의 .eq(...) 필터에 더해, 서버의 RLS가 "남의 성적은 애초에 못 읽게" 한 번 더 막는다(이중 안전장치).
export async function getMyAssessments(studentId: string): Promise<AssessmentRecord[]> {
  const client = getSupabase();
  if (!client) return []; // 미설정 환경에서는 빈 결과로 폴백(빈 배열을 주면 화면은 "결과 없음"으로 자연스럽게 처리됨)
  // 아래는 한 줄짜리 SQL 같은 체이닝: 어디서(from) → 무엇을(select) → 어떤 조건(eq) → 어떻게 정렬(order).
  const { data, error } = await client
    .from(ASSESSMENTS_TABLE)
    .select('*')                                  // '*' = 모든 컬럼을 가져온다
    .eq('student_id', studentId) // 본인 학생 ID로 필터(추가로 RLS가 서버측 보호)
    // eq = equals. student_id 컬럼이 studentId와 "같은" 행만 골라낸다.
    .order('submitted_at', { ascending: false }); // 최신 제출이 먼저 오도록 정렬
    // ascending: false = 내림차순(큰 값=최신 날짜가 위로). 최근에 본 시험이 맨 위에 보인다.
  if (error) {
    // 조회 실패는 호출부 흐름을 막지 않도록 로깅 후 빈 배열로 폴백.
    // 주의: 여기서 throw(예외 던지기)를 하지 않는 이유는, 성적 조회 실패로 화면 전체가 깨지지 않게 하려는 것이다.
    console.error('getMyAssessments error:', error);
    return [];
  }
  // data가 null일 수 있으므로(결과 없음 등) ?? [] 로 항상 "배열"을 보장한다 → 호출부가 .map 등을 안전하게 쓸 수 있다.
  // as AssessmentRecord[]: TS에게 "이 데이터를 이 타입으로 취급하라"고 알려주는 타입 단언(런타임 변환은 아님).
  return (data ?? []) as AssessmentRecord[];
}

/** 관리자: 전체 수강생 평가 성적 조회 (RLS로 관리자만 전체 조회 가능) */
// 무엇을 하나: 모든 학생의 평가 성적을 최신순으로 한꺼번에 가져온다(관리자 대시보드용).
// 왜 이렇게 하나: 강사/운영자가 전체 수강생의 합격/점수 현황을 한 화면에서 보기 위함.
// 매개변수: 없음.
// 반환값: 모든 학생의 평가 레코드 배열(제출 시각 내림차순). 미설정/오류 시 빈 배열.
// 부수효과: 없음(읽기 전용). 학생 필터를 걸지 않으므로 전체 조회 권한은
//           전적으로 Supabase RLS 정책(관리자만 허용)에 의존한다.
// 주의(보안 핵심): 이 함수는 student_id로 거르지 않는다. 즉 "누구나 호출하면 전부 보이는" 코드처럼 보이지만,
//   실제 차단은 서버의 RLS가 한다. 그러므로 RLS 정책이 빠지면 일반 학생도 전체 성적을 보게 되는 사고가 난다.
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
