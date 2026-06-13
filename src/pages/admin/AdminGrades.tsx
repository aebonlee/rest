/**
 * AdminGrades.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * 역할:
 *   관리자(superadmin/admin)용 "학습평가 성적" 페이지.
 *   본 사이트(rest) 수강생들의 선수평가/사후평가 채점 결과를 집계·표시하고,
 *   성적표(Excel/PDF) 다운로드 기능을 제공한다.
 *
 * 핵심 책임:
 *   1) Supabase에서 본 사이트 수강생 프로필 + 전체 평가기록을 로드.
 *   2) 동일인(전화/이름 기준) 여러 계정을 한 명으로 통합하고, 평가별 최고점을 채택.
 *   3) 평가별 요약 통계(응시/합격/평균) 계산.
 *   4) "고아 점수"(기록은 있으나 수강생 목록에 매칭 안 된 평가) 경고 표시.
 *   5) 선수/사후 × Excel/PDF 성적표 다운로드.
 *
 * 주요 export:
 *   - default: AdminGrades (React 컴포넌트)
 *
 * 부수효과:
 *   - 마운트 시 Supabase 조회(user_profiles, assessments).
 *   - 다운로드 버튼 클릭 시 exportTableExcel / exportTablePdf 로 파일 생성.
 *
 * ── 초보자를 위한 배경 지식 ──
 *   • React 컴포넌트: 화면의 한 조각을 만들어 내는 "함수". 이 함수는 JSX(아래 return 부분의
 *     HTML처럼 생긴 코드)를 돌려주고, React 가 그것을 실제 화면으로 그린다.
 *   • TSX 파일: TypeScript(JS에 타입을 더한 언어) + JSX 를 함께 쓰는 파일 확장자.
 *     타입(예: UserProfile)은 "이 값은 이런 모양이어야 한다"는 약속이라 오타·실수를 미리 잡아준다.
 *   • Supabase: 백엔드(데이터베이스 + 인증) 서비스. 여기서는 학생 정보(user_profiles)와
 *     평가 점수(assessments) 같은 데이터를 클라우드 DB 에서 읽어온다.
 *   • RLS(Row Level Security): Supabase DB 의 "행 단위 접근 권한" 기능. 로그인한 사용자가
 *     누구냐에 따라 어떤 행을 읽을 수 있는지 서버가 제한한다. 그래서 관리자만 다른 사람의
 *     점수를 조회할 수 있도록 보장된다(이 보안은 DB 쪽 설정이며 이 파일 코드만으로 끝나지 않음).
 *   • 훅(Hook): useState/useEffect/useMemo 처럼 이름이 use 로 시작하는 React 기능.
 *     컴포넌트에 "상태(state)"나 "생명주기(언제 실행)" 같은 능력을 붙여준다.
 *     주의: 훅은 항상 컴포넌트 최상단에서만, 조건문/반복문 밖에서 호출해야 한다(React 규칙).
 */
// React 핵심 훅과 타입을 가져온다.
//   useState  : 변하는 값(상태)을 저장. 값이 바뀌면 화면이 자동으로 다시 그려진다.
//   useEffect : 특정 시점(예: 화면에 처음 나타날 때)에 부수 작업(데이터 로딩 등)을 실행.
//   useMemo   : 비싼 계산 결과를 기억(캐시)해 두고, 의존하는 값이 안 바뀌면 다시 계산하지 않는다.
//   type ReactElement : "JSX 한 덩어리"의 타입. 함수가 화면 요소를 반환한다는 표시에 쓴다.
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import { EmojiIcon } from '../../utils/emojiIcon';
import AdminSidebar from '../../components/AdminSidebar'; // 관리자 좌측 메뉴 컴포넌트
import SEOHead from '../../components/SEOHead'; // <head> 의 제목·메타태그를 설정하는 컴포넌트
import getSupabase from '../../utils/supabase'; // Supabase 클라이언트(연결 객체)를 만들어주는 함수
import site from '../../config/site'; // 이 사이트의 설정값(이름, url 등)
import { getAllAssessments, type AssessmentRecord } from '../../utils/assessments'; // 평가기록 로더 + 기록 타입
import { groupByPerson } from '../../utils/people'; // 여러 계정을 "동일인" 단위로 묶어주는 함수
import { exportTableExcel, exportTablePdf, type Cell } from '../../utils/exportTable'; // 표 → 파일 변환 함수 + 셀 타입
import { ADMIN_EMAILS } from '../../config/admin'; // 관리자 이메일 목록(수강생 집계에서 제외)
import type { UserProfile } from '../../types'; // 사용자 프로필의 타입(모양) 정의

// 본 사이트 호스트명 (예: rest.dreamitbiz.com) — 수강생 소속 판별 기준값.
// new URL(...).hostname 은 전체 주소에서 "도메인 부분"만 뽑아낸다.
// (예: "https://rest.dreamitbiz.com/path" → "rest.dreamitbiz.com")
const REST_HOSTNAME = new URL(site.url).hostname;
// 수강생 집계에서 제외할 운영진 역할. (이 역할을 가진 계정은 학생이 아님)
const STAFF_ROLES = ['admin', 'superadmin'];
// 점수로 집계하는 평가 종류(진단평가 제외) — 표시 순서이기도 함.
// as const : 이 배열을 "읽기 전용 + 정확한 문자열 타입"으로 고정한다.
//   → 덕분에 typeof GRADED_TYPES[number] 가 'prerequisite' | 'summative' 로 좁혀져 오타를 막는다.
const GRADED_TYPES = ['prerequisite', 'summative'] as const;
// 평가 종류(영문 코드) → 한글 라벨 매핑.
// Record<string, string> : "문자열 키 → 문자열 값" 형태의 객체라는 타입 표기.
const TYPE_LABEL: Record<string, string> = { prerequisite: '선수평가', summative: '사후평가' };

/**
 * AdminGrades — 학습평가 성적 관리 페이지 컴포넌트.
 * 매개변수: 없음.
 * 반환값: 성적 요약/고아 경고/다운로드/성적표 테이블을 포함한 ReactElement.
 * 부수효과: 마운트 시 Supabase 데이터 로드, 다운로드 버튼 클릭 시 파일 생성.
 *
 * 참고: 화살표 함수로 컴포넌트를 정의했다. `(): ReactElement =>` 는
 *       "매개변수 없이 호출되고 ReactElement(화면 조각)를 반환한다"는 뜻이다.
 */
const AdminGrades = (): ReactElement => {
  // ── 상태(state) 선언 ──
  // useState 는 [현재값, 값을바꾸는함수] 한 쌍을 돌려준다.
  // 예: setStudents(...)를 부르면 students 가 바뀌고, React 가 화면을 다시 그린다.
  // 주의: students = [...] 처럼 직접 대입하면 화면이 갱신되지 않는다. 반드시 set 함수를 써야 한다.

  // 본 사이트 수강생(운영진/관리자 제외 전) 프로필 목록. <UserProfile[]> 는 "프로필 배열" 타입.
  const [students, setStudents] = useState<UserProfile[]>([]);
  // 전체 평가기록(선수/사후/진단 등 모든 종류 포함).
  const [grades, setGrades] = useState<AssessmentRecord[]>([]);
  // 초기 로딩 상태 — 스피너/빈 상태 분기에 사용. 처음엔 true(로딩 중)로 시작.
  const [loading, setLoading] = useState(true);

  // useEffect(실행할함수, 의존성배열)
  //   의존성 배열이 [](빈 배열)이면 "컴포넌트가 화면에 처음 나타날 때 딱 1번"만 실행된다.
  //   여기서는 그 1번에 데이터를 불러온다(= 마운트 시 데이터 로딩).
  useEffect(() => {
    // 마운트 시 1회: 수강생 프로필 + 평가기록을 비동기 로드.
    // async 함수: 안에서 await 로 "네트워크 응답을 기다렸다가" 다음 줄을 실행할 수 있다.
    // (DB 조회처럼 시간이 걸리는 작업을, 화면을 멈추지 않고 처리하기 위함)
    const load = async () => {
      const client = getSupabase(); // Supabase 연결 객체 생성(설정이 없으면 null 일 수 있음)
      // Supabase 미설정 환경(빌드/프리뷰 등)에서는 로딩만 해제하고 종료.
      // 주의: 이 가드(early return)가 없으면 아래에서 null.from(...) 호출로 에러가 난다.
      if (!client) { setLoading(false); return; }
      const gradeList = await getAllAssessments(); // 모든 평가기록을 기다렸다가 받아온다.
      // 본 사이트 수강생: signup_domain 일치 OR visited_sites 에 호스트 포함
      // (다른 dreamitbiz 사이트로 가입했지만 rest 에서 평가를 본 사람도 포함)
      // .or() 안의 cs.{...} 는 배열 컬럼 contains 연산 (visited_sites 에 호스트 포함 여부).
      //   - signup_domain.eq.X  : signup_domain 컬럼이 X 와 같음
      //   - visited_sites.cs.{X}: visited_sites(배열 컬럼)가 X 를 포함함(cs = contains)
      // 주의: .or() 인자는 콤마로 구분된 "조건 문자열"이며, 띄어쓰기를 넣으면 깨질 수 있다.
      const { data: base } = await client
        .from('user_profiles') // user_profiles 테이블에서
        .select('*') // 모든 컬럼을
        .or(`signup_domain.eq.${REST_HOSTNAME},visited_sites.cs.{${REST_HOSTNAME}}`); // 위 두 조건 중 하나라도 맞는 행만
      // [...(...)] : 펼침(spread) 연산자로 배열을 "새 배열로 복사"한다(불변성 유지 — 원본을 직접 건드리지 않음).
      // base 가 null/undefined 일 수 있어 (base || []) 로 빈 배열을 대비한다.
      const merged = [...((base || []) as UserProfile[])];
      // 이미 포함된 계정 id 집합 — 중복 보강 방지용.
      // Set: 중복 없는 값 모음. 어떤 id 가 이미 있는지 빠르게(has) 확인할 수 있어 중복 추가를 막는다.
      const seen = new Set(merged.map((u) => u.id));
      // 평가기록은 있으나 위 목록에 없는 계정(타 도메인 가입 등)은 student_id 로 직접 보강 → 점수 누락 방지
      //   1) gradeList 의 student_id 들을 new Set 으로 한 번 중복 제거한 뒤 다시 배열로 펼치고
      //   2) 값이 있고(id &&) 아직 목록에 없는(!seen.has(id)) 것만 남긴다.
      const missingIds = [...new Set(gradeList.map((g) => g.student_id))].filter((id) => id && !seen.has(id));
      if (missingIds.length) { // 보강할 id 가 하나라도 있으면(length 가 0보다 크면)
        // 누락된 id 들의 프로필을 추가 조회해 merged 에 합침(이미 본 id는 건너뜀).
        // .in('id', missingIds) : id 가 missingIds 목록 중 하나인 행들을 가져온다.
        const { data: byId } = await client.from('user_profiles').select('*').in('id', missingIds);
        // 가져온 프로필을 돌면서, 아직 안 본 id 만 seen 에 등록하고 merged 에 추가한다(중복 방지).
        for (const u of (byId || []) as UserProfile[]) if (!seen.has(u.id)) { seen.add(u.id); merged.push(u); }
      }
      // 총괄관리자·관리자(역할) + 백진주 등 관리자 이메일(ADMIN_EMAILS) 제외 → 순수 수강생만
      // 정렬: 표시 이름 우선순위(display_name → name → email)로 한글 로캘 가나다 정렬.
      const list = merged
        // filter: 조건이 true 인 항목만 남긴다. 여기선 운영진 역할도 아니고 관리자 이메일도 아닌 사람.
        // (u.email || '') : email 이 없을 때 빈 문자열로 대체 → .toLowerCase() 에서 에러 방지.
        // 대소문자를 통일(toLowerCase)해 비교해야 'Admin@x' 같은 표기도 제대로 걸러진다.
        .filter((u) => !STAFF_ROLES.includes(u.role) && !ADMIN_EMAILS.includes((u.email || '').toLowerCase()))
        // sort: 두 항목 a,b 를 비교해 순서를 정한다. localeCompare 는 한글 가나다 순서를 올바르게 처리한다.
        // a.display_name || a.name || a.email || '' : 앞의 값이 비어 있으면 다음 값을 쓰는 "대체 사슬".
        .sort((a, b) => (a.display_name || a.name || a.email || '').localeCompare(b.display_name || b.name || b.email || ''));
      setStudents(list); // 정제된 수강생 목록을 상태에 저장(→ 화면 갱신)
      setGrades(gradeList); // 평가기록 전체를 상태에 저장
      setLoading(false); // 로딩 끝 표시(스피너 사라지고 표가 나타남)
    };
    load(); // 위에서 정의한 비동기 함수를 실제로 실행.
    // 주의: useEffect 의 콜백 자체는 async 로 만들 수 없어, 안에서 load() 를 따로 정의해 호출하는 패턴을 쓴다.
  }, []); // ← 빈 의존성 배열: "최초 1회만 실행"이라는 뜻.

  // 동일인(전화/이름) 통합 — 이메일 2개여도 한 명, 성적은 두 계정 중 최고점 채택
  // groupByPerson: 계정 목록을 사람 단위(person)로 묶음. students 변경 시에만 재계산.
  // useMemo(계산함수, [students]) : students 가 바뀔 때만 다시 계산하고, 아니면 이전 결과를 재사용한다.
  // 주의: 의존성 배열에 students 를 빠뜨리면, 학생이 새로 로드돼도 people 이 갱신되지 않는 버그가 생긴다.
  const people = useMemo(() => groupByPerson(students), [students]);

  /**
   * pickBest — 같은 사람의 여러 계정(student_id) 중, 한 평가종류에서 최고점 기록 선택.
   * 매개변수: g1(기존 누적 기록|undefined), g2(비교 대상 기록).
   * 반환값: 더 나은(높은 점수, 동점이면 더 최근) AssessmentRecord.
   * 부수효과: 없음(순수 함수 — 같은 입력이면 항상 같은 결과, 바깥 값을 바꾸지 않음).
   */
  const pickBest = (g1: AssessmentRecord | undefined, g2: AssessmentRecord): AssessmentRecord => {
    if (!g1) return g2; // 아직 누적된 기록이 없으면(undefined) 비교 대상이 곧 최고.
    if (g2.score !== g1.score) return g2.score > g1.score ? g2 : g1; // 점수가 다르면 더 높은 쪽 선택.
    // 동점이면 더 최근 제출
    // submitted_at 은 ISO 날짜 문자열(예: "2026-06-01T..."). 이 형식은 문자열끼리 > 비교해도 시간 순서가 맞다.
    // (|| '') 로 값이 없을 때 빈 문자열 처리 → 비교 에러 방지.
    return (g2.submitted_at || '') > (g1.submitted_at || '') ? g2 : g1;
  };

  /** personKey → { type → 성적(동일인 합산) } 매핑 */
  // grades 또는 people 변경 시 재계산. 각 사람의 모든 계정 id를 훑어 종류별 최고점만 남김.
  // 결과 구조: Map( 사람키 → { 'prerequisite': 기록, 'summative': 기록 } )
  const gradeMap = useMemo(() => {
    // Map: 키→값 저장소(객체와 비슷하지만 키 종류가 자유롭고 순서·크기 다루기 편함).
    const m = new Map<string, Record<string, AssessmentRecord>>();
    people.forEach((p) => { // 사람 한 명씩 처리.
      // 이 사람에 속한 계정 id 집합. (Set 으로 만들어 has 검사로 빠르게 매칭)
      const idSet = new Set(p.ids);
      const byType: Record<string, AssessmentRecord> = {}; // 이 사람의 "종류별 최고점" 임시 보관함.
      grades.forEach((g) => { // 모든 평가기록을 훑으며
        // 이 사람의 계정이 아니면 무시.
        if (!idSet.has(g.student_id)) return;
        // 같은 평가종류에서 더 나은 기록으로 갱신. (기존값 byType[g.type] 과 새 g 중 pickBest 가 고른 것)
        byType[g.type] = pickBest(byType[g.type], g);
      });
      m.set(p.key, byType); // 사람키 → 종류별 최고점 을 Map 에 저장.
    });
    return m;
  }, [grades, people]); // grades 또는 people 둘 중 하나라도 바뀌면 다시 계산.

  /**
   * 고아 점수 — 평가기록은 있으나 표시된 수강생 목록에 매칭되는 계정이 없는 경우.
   * (signup_domain 불일치·관리자필터·프로필 누락 등으로 student_id 가 안 잡힘 →
   *  점수가 DB엔 있는데 표에서 조용히 사라지던 문제를 드러냄)
   * "왜 필요한가": 점수가 보이지 않으면 채점 누락처럼 보여 혼란이 생긴다. 그래서 매칭 실패 건을
   *  숨기지 않고 별도 경고로 드러내, 관리자가 원인(가입 도메인 등)을 점검하게 한다.
   */
  const orphanGrades = useMemo(() => {
    // 표에 표시되는 모든 사람의 계정 id 집합 구성.
    const known = new Set<string>();
    people.forEach((p) => p.ids.forEach((id) => known.add(id))); // 사람마다 가진 모든 계정 id 를 known 에 모은다.
    // 알려진 id에 속하지 않는 평가기록만 추려 경고로 노출.
    return grades.filter((g) => !known.has(g.student_id));
  }, [grades, people]);

  /** 평가별 통계 (응시 인원 / 합격 인원 / 평균) — 동일인 1명 기준 */
  // gradeMap 변경 시 재계산.
  const stats = useMemo(() => {
    // GRADED_TYPES 의 각 종류('prerequisite','summative')에 대해 통계 객체를 하나씩 만든다.
    return GRADED_TYPES.map((t) => {
      // 해당 종류 기록만 추출(미응시자는 undefined → filter(Boolean) 로 제거).
      // filter(Boolean): 값이 "참 같은(truthy)" 것만 남긴다 → undefined/null 같은 빈 값 제거.
      // as AssessmentRecord[] : 필터 후 남은 값들은 확실히 기록 배열이라고 TS 에게 알려주는 단언.
      const rows = Array.from(gradeMap.values()).map((byType) => byType[t]).filter(Boolean) as AssessmentRecord[];
      const passed = rows.filter((g) => g.passed).length; // 합격(passed === true)인 기록 개수.
      // 평균은 정수 반올림, 응시자 0명이면 0.
      // 주의: rows.length 가 0이면 0으로 나누게 되어 NaN(숫자 아님)이 나온다. 그래서 0명이면 0으로 막는다.
      // reduce((누적합 s, 현재 g) => s + g.score, 0): 모든 점수를 0부터 더해 총합을 구한다.
      const avg = rows.length ? Math.round(rows.reduce((s, g) => s + g.score, 0) / rows.length) : 0;
      return { type: t, taken: rows.length, passed, avg }; // 한 종류의 통계 한 덩어리.
    });
  }, [gradeMap]);

  // ── 성적표 다운로드 (선수평가 / 사후평가 × Excel / PDF) ──
  // 다운로드 파일의 헤더 컬럼 순서. (아래 buildGradeRows 가 만드는 각 행의 값 순서와 1:1로 맞아야 한다)
  const GRADE_COLUMNS = ['No.', '이름', '이메일', '점수', '합격여부', '정답수', '총문항', '응시일시'];
  // 평가 종류별 합격 기준 점수(부제목 표기용).
  const PASS_SCORE: Record<string, number> = { prerequisite: 40, summative: 60 };

  /**
   * buildGradeRows — 특정 평가종류의 성적표 행(2차원 셀 배열) 생성.
   * 매개변수: type(평가 종류).
   * 반환값: 사람 1명 = 1행인 Cell[][] (미응시자도 빈/미응시로 포함).
   * 부수효과: 없음.
   * 참고: typeof GRADED_TYPES[number] 는 'prerequisite' | 'summative' 두 값만 허용한다는 타입.
   */
  const buildGradeRows = (type: typeof GRADED_TYPES[number]): Cell[][] =>
    // people.map((사람, 인덱스) => 한 줄) → 사람 수만큼의 행 배열을 만든다.
    people.map((g, idx) => {
      // 이 사람의 해당 종류 기록(없으면 undefined).
      // (gradeMap.get(g.key) || {}) : 맵에 없으면 빈 객체로 대체 → [type] 접근 시 에러 방지.
      const rec = (gradeMap.get(g.key) || {})[type];
      return [
        idx + 1, // No. (인덱스는 0부터라 +1)
        g.name, // 이름
        g.emails.join(' / '), // 이메일 여러 개를 " / " 로 이어 한 칸에 표시
        rec ? rec.score : '', // 점수(미응시면 빈칸)
        rec ? (rec.passed ? '합격' : '불합격') : '미응시', // 합격여부(미응시 구분)
        rec ? rec.correct : '', // 정답수
        rec ? rec.total : '', // 총문항
        // 옵셔널 체이닝(rec?.submitted_at): rec 가 없으면(undefined) 통째로 undefined 가 되어 에러 없이 넘어간다.
        // 값이 있으면 ISO 문자열을 Date 로 만들고 한국식(ko-KR) 날짜·시간 문자열로 변환.
        rec?.submitted_at ? new Date(rec.submitted_at).toLocaleString('ko-KR') : '',
      ];
    });

  /**
   * subtitleFor — PDF 성적표 상단 부제목 문자열 생성(학원명·종류·합격기준·인원·발행일).
   * 매개변수: type(평가 종류). 반환값: 부제목 string. 부수효과: 없음.
   * 참고: 백틱(`...`)은 템플릿 문자열로, ${...} 안의 값을 문장에 끼워 넣는다.
   * 주의: 백틱 문자열 안에는 주석을 넣지 않는다(주석 문자가 그대로 출력돼 버린다).
   */
  const subtitleFor = (type: typeof GRADED_TYPES[number]): string =>
    `AI Reboot Academy · ${TYPE_LABEL[type]} · 합격기준 ${PASS_SCORE[type]}점 · 수강생 ${people.length}명 · 발행 ${new Date().toLocaleDateString('ko-KR')}`;

  /** downloadExcel — 해당 종류 성적표를 .xlsx 로 내보냄. 부수효과: 파일 다운로드. */
  // 파일명·시트명·헤더·행데이터를 넘기면 exportTableExcel 이 실제 엑셀 파일을 만들어 받게 한다.
  const downloadExcel = (type: typeof GRADED_TYPES[number]) =>
    exportTableExcel(`${TYPE_LABEL[type]}_성적표.xlsx`, TYPE_LABEL[type], GRADE_COLUMNS, buildGradeRows(type));
  /** downloadPdf — 해당 종류 성적표를 PDF 로 내보냄. 부수효과: 파일 다운로드. */
  const downloadPdf = (type: typeof GRADED_TYPES[number]) =>
    exportTablePdf(`${TYPE_LABEL[type]} 성적표`, GRADE_COLUMNS, buildGradeRows(type), subtitleFor(type));

  /**
   * scoreCell — 점수 셀 렌더러. 미응시면 회색 "미응시", 응시면 점수+합격/불합격 배지.
   * 매개변수: g(평가기록|undefined). 반환값: ReactElement. 부수효과: 없음.
   * 참고: "렌더러"란 데이터를 받아 화면에 그릴 JSX 조각을 돌려주는 함수를 말한다.
   *       이렇게 함수로 빼두면 같은 표시를 여러 곳(표/고아경고)에서 재사용할 수 있다.
   */
  const scoreCell = (g: AssessmentRecord | undefined): ReactElement => {
    // 기록이 없으면(미응시) 회색 "미응시" 텍스트만 보여준다.
    // style 의 'var(--text-secondary, #9ca3af)' : CSS 변수 값이 있으면 그것을, 없으면 #9ca3af 를 쓴다.
    if (!g) return <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>미응시</span>;
    return (
      // 합격이면 초록(#10b981), 불합격이면 빨강(#ef4444) 으로 점수를 강조.
      <span style={{ fontWeight: 700, color: g.passed ? '#10b981' : '#ef4444' }}>
        {/* {g.score} 처럼 중괄호 안에 넣으면 변수 값이 화면에 출력된다(JSX 표현식). */}
        {g.score}점
        {/* 합격/불합격 배지: 둥근(borderRadius 999px) 알약 모양 라벨. 합격/불합격에 따라 색을 바꾼다. */}
        <span style={{
          marginLeft: '6px', fontSize: '12px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px',
          background: g.passed ? '#d1fae5' : '#fee2e2', color: g.passed ? '#065f46' : '#991b1b',
        }}>{g.passed ? '합격' : '불합격'}</span>
      </span>
    );
  };

  // ── 화면(JSX) 반환 ──
  // 아래부터는 실제로 그려질 화면 구조. HTML 과 비슷하지만 class 대신 className 을 쓰고,
  // 중괄호 {} 안에 JS 값/표현식을 끼워 넣을 수 있다.
  return (
    // <> ... </> : Fragment(빈 껍데기). 불필요한 div 를 추가하지 않고 여러 요소를 묶을 때 쓴다.
    <>
      {/* noindex: 관리자 전용 페이지라 검색엔진 색인 제외 */}
      <SEOHead title="학습평가 성적" path="/admin/grades" noindex />
      <div className="admin-layout">
        <AdminSidebar /> {/* 좌측 관리자 메뉴 */}
        <div className="admin-content">
          {/* 헤더: 제목/설명 + 우측 수강생 수(계정 통합 여부 표시) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>학습평가 성적</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                <strong>선수평가</strong>(합격 40점) · <strong>사후평가</strong>(합격 60점) 채점 결과입니다. 진단평가는 자습용이라 집계되지 않습니다.
              </p>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              수강생 {people.length}명 {/* 통합된 "사람" 수 */}
              {/* 통합 후 사람 수와 원본 계정 수가 다르면 "동일인 통합" 안내 노출 */}
              {/* {조건 && <JSX>} : 조건이 참일 때만 뒤의 JSX 를 그린다(조건부 렌더링). 거짓이면 아무것도 안 나옴. */}
              {people.length !== students.length && (
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}>
                  {/* {' '} : JSX 에서 의도적으로 공백 한 칸을 넣는 방법(자동으로 사라지는 공백 방지). */}
                  {' '}· 계정 {students.length}개(동일인 통합)
                </span>
              )}
            </div>
          </div>

          {/* 평가별 요약 */}
          {/* gridTemplateColumns 의 auto-fit/minmax: 카드들이 화면 폭에 맞춰 자동으로 줄바꿈·채움 된다(반응형). */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {/* stats 배열을 돌며 평가 종류별 요약 카드를 만든다. */}
            {/* key={s.type}: 리스트의 각 항목을 React 가 구분하는 고유값. 없으면 갱신 시 경고/오작동이 생긴다. */}
            {stats.map((s) => (
              <div key={s.type} style={{
                border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px',
                padding: '16px 18px', background: 'var(--bg-white, #fff)',
              }}>
                <strong style={{ fontSize: '14.5px' }}>{TYPE_LABEL[s.type]}</strong>
                <div style={{ display: 'flex', gap: '18px', marginTop: '8px', fontSize: '13.5px' }}>
                  <span>응시 <strong>{s.taken}</strong></span>
                  <span>합격 <strong style={{ color: '#10b981' }}>{s.passed}</strong></span>
                  <span>평균 <strong>{s.avg}점</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* 고아 점수 경고 — 기록은 있으나 수강생 목록에 매칭 안 된 평가 */}
          {/* 로딩 완료 후 + 고아 기록이 있을 때만 표시 */}
          {/* 주의: 단순히 orphanGrades.length 만 쓰면 0일 때 화면에 숫자 0 이 찍힌다. */}
          {/*       그래서 > 0 으로 "true/false" 를 만들어 0 출력 사고를 막는다. */}
          {!loading && orphanGrades.length > 0 && (
            <div style={{
              marginBottom: '24px', padding: '14px 16px', borderRadius: '12px',
              background: '#fff7ed', border: '1px solid #fdba74',
            }}>
              <strong style={{ fontSize: '14px', color: '#9a3412' }}>
                <EmojiIcon char="⚠" /> 매칭 안 된 평가기록 {orphanGrades.length}건
              </strong>
              <p style={{ margin: '4px 0 10px', fontSize: '12.5px', color: '#9a3412' }}>
                점수는 저장돼 있으나 수강생 계정과 연결되지 않았습니다. 가입 도메인이 다르거나(다른 사이트로 가입),
                프로필이 없는 계정으로 응시한 경우입니다. 아래 이메일로 가입 상태를 확인하세요.
              </p>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>이름</th><th>이메일</th><th>평가</th><th>점수</th><th>응시일시</th><th>student_id</th></tr></thead>
                  <tbody>
                    {/* key: student_id+type 조합으로 한 사람의 여러 평가도 고유 보장 */}
                    {/* (한 사람이 선수+사후 둘 다 고아면 행이 2개 → id 만으론 key 중복이라 type 을 붙임) */}
                    {orphanGrades.map((g) => (
                      <tr key={`${g.student_id}-${g.type}`}>
                        {/* g.student_name || '-' : 이름이 없으면 '-' 표시. */}
                        <td>{g.student_name || '-'}</td>
                        <td>{g.student_email || '-'}</td>
                        {/* TYPE_LABEL[g.type] || g.type : 한글 라벨이 없으면 원본 코드를 그대로 표시. */}
                        <td>{TYPE_LABEL[g.type] || g.type}</td>
                        <td>{scoreCell(g)}</td>
                        <td>{g.submitted_at ? new Date(g.submitted_at).toLocaleString('ko-KR') : '-'}</td>
                        {/* 매칭 디버깅용 원본 student_id 노출(monospace) */}
                        {/* (관리자가 어느 계정이 안 잡혔는지 DB에서 추적할 수 있도록 원본 id 를 보여줌) */}
                        <td style={{ fontSize: '11px', color: 'var(--text-secondary, #9ca3af)', fontFamily: 'monospace' }}>{g.student_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 성적표 다운로드 */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '24px',
            padding: '14px 16px', background: 'var(--bg-light-gray, #f8f9fa)',
            border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px',
          }}>
            {/* 평가 종류별로 Excel/PDF 버튼 한 쌍씩 생성 */}
            {GRADED_TYPES.map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '13.5px' }}>{TYPE_LABEL[t]} 성적표</strong>
                {/* 로딩 중이거나 수강생이 없으면 다운로드 비활성화 */}
                {/* onClick={() => downloadExcel(t)} : 클릭 "그 순간에" 함수를 부르려고 화살표로 감쌌다. */}
                {/* 주의: onClick={downloadExcel(t)} 처럼 쓰면 렌더링 중에 즉시 실행돼 버려 잘못된다. */}
                <button type="button" onClick={() => downloadExcel(t)} disabled={loading || people.length === 0} style={{
                  padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: 'none', borderRadius: '7px', background: '#107c41', color: '#fff',
                }}><EmojiIcon char="⬇" /> Excel</button>
                <button type="button" onClick={() => downloadPdf(t)} disabled={loading || people.length === 0} style={{
                  padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: 'none', borderRadius: '7px', background: '#b91c1c', color: '#fff',
                }}><EmojiIcon char="⬇" /> PDF</button>
              </div>
            ))}
          </div>

          {/* 본문: 로딩 중 → 스피너 / 수강생 0명 → 안내 / 그 외 → 성적 테이블 */}
          {/* 삼항 연산자 중첩(조건1 ? A : 조건2 ? B : C): 상황에 따라 셋 중 하나만 그린다. */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : people.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: 'var(--bg-light-gray, #f8f9fa)',
              borderRadius: '12px', color: 'var(--text-secondary, #6b7280)',
            }}>
              본 사이트에 가입한 학생이 없습니다.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th style={{ width: '48px', textAlign: 'center' }}>No.</th><th>이름</th><th>이메일</th><th>선수평가</th><th>사후평가</th><th>최근 응시</th></tr></thead>
                <tbody>
                  {/* 사람(통합 단위) 1명 = 1행 */}
                  {people.map((g, idx) => {
                    // 이 사람의 종류별 최고점 맵.
                    const byType = gradeMap.get(g.key) || {};
                    // 응시한 평가들의 제출일시만 모아(undefined 제거)…
                    // byType[t]?.submitted_at : 그 종류 기록이 없으면 옵셔널 체이닝으로 안전하게 undefined.
                    const dates = GRADED_TYPES.map((t) => byType[t]?.submitted_at).filter(Boolean) as string[];
                    // …문자열(ISO) 정렬 후 가장 마지막 = 최근 응시일.
                    // ISO 문자열은 사전순 정렬 = 시간순 정렬이라 sort() 후 slice(-1)(맨 끝 1개)이 가장 최근.
                    const latest = dates.sort().slice(-1)[0];
                    return (
                      // key={g.key}: 사람 고유키. 행을 안정적으로 추적하기 위함.
                      <tr key={g.key}>
                        <td style={{ textAlign: 'center', color: 'var(--text-secondary, #6b7280)' }}>{idx + 1}</td>
                        <td>
                          {g.name}
                          {/* 동일인 통합된 사람은 계정 수 배지 표시(툴팁에 합산 설명) */}
                          {/* title 속성: 마우스를 올리면 뜨는 설명(툴팁). */}
                          {g.isMerged && (
                            <span title={`동일인 ${g.accounts.length}계정 — 최고점 합산`} style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 7px',
                              borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                            }}>동일인 {g.accounts.length}계정</span>
                          )}
                        </td>
                        <td>
                          {/* 여러 이메일을 줄바꿈 표시. 두 번째부터는 작고 흐리게(보조 계정) */}
                          {/* i > 0 ? {...작은스타일} : undefined → 첫 줄(주 이메일)만 기본 스타일. */}
                          {g.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '13px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                          ))}
                        </td>
                        <td>{scoreCell(byType.prerequisite)}</td> {/* 선수평가 점수 셀 */}
                        <td>{scoreCell(byType.summative)}</td> {/* 사후평가 점수 셀 */}
                        <td>{latest ? new Date(latest).toLocaleDateString('ko-KR') : '-'}</td> {/* 최근 응시일(없으면 '-') */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 이 파일의 기본 내보내기. 다른 곳에서 `import AdminGrades from '.../AdminGrades'` 로 불러 쓴다.
export default AdminGrades;
