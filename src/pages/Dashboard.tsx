/**
 * Dashboard.tsx
 *
 * [이 파일이 무엇인가? — 한 줄 요약]
 *  - 로그인한 수강생이 가장 먼저 보게 되는 "메인 대시보드" 화면을 그리는 React 컴포넌트 파일이다.
 *
 * [초보자를 위한 배경 지식]
 *  - React 컴포넌트(component): 화면의 한 조각을 만드는 "함수" 또는 "클래스". 이 파일은 함수형 컴포넌트를 쓴다.
 *    함수가 JSX(아래 설명)를 return 하면, React가 그것을 실제 HTML로 바꿔 브라우저에 그려준다.
 *  - JSX: 자바스크립트 안에서 HTML처럼 보이는 문법(예: <div>...</div>). 사실은 함수 호출로 변환되는 "코드"다.
 *    HTML과 다른 점: class 대신 className을 쓰고, 중괄호 { }를 쓰면 그 안에 자바스크립트 값을 끼워 넣을 수 있다.
 *  - 상태(state): 화면에 보여줄, "시간에 따라 바뀌는 값"(예: 출석 일수). useState로 만들고, 값이 바뀌면 화면이 자동 갱신된다.
 *  - 부수효과(side effect): 화면을 그리는 것 외에 일어나는 일(예: 서버에서 데이터 가져오기). useEffect로 처리한다.
 *  - Supabase: 데이터베이스 + 인증을 제공하는 백엔드 서비스. 여기서는 DB에서 공지/출석/과제 등을 읽어온다.
 *  - RLS(Row Level Security): DB가 "이 사용자는 자기 데이터만 볼 수 있다"를 강제하는 보안 규칙.
 *    그래서 코드에서 user.id로 한 번 더 필터링하고, DB 차원에서도 본인 데이터만 내려준다(이중 안전장치).
 *
 * [역할]
 *  - 로그인한 수강생에게 보여지는 메인 대시보드 페이지 컴포넌트.
 *  - 출석/과제/진행률 통계, 학습평가(선수·사후) 성적, 공지사항, 바로가기 링크를 한 화면에 모아서 제공한다.
 *
 * [핵심 책임]
 *  1) 인증된 사용자(user) 기준으로 Supabase에서 대시보드 데이터를 병렬 조회한다.
 *     - 최근 공지사항 5건 (고정글 우선)
 *     - 본인의 출석 일수(status='present' 카운트)
 *     - 전체 과제 수 / 본인 제출 수
 *     - 본인의 학습평가 성적 레코드(선수평가/사후평가)
 *  2) 조회 결과를 통계 카드 및 성적 카드, 공지 목록으로 렌더링한다.
 *
 * [주요 export]
 *  - default: Dashboard (React 함수형 컴포넌트)
 *
 * [의존성/부수효과]
 *  - useAuth(): 현재 로그인 사용자/프로필 정보. 데이터 조회의 RLS 기준이 되는 user.id를 제공.
 *  - getSupabase(): Supabase 클라이언트(미구성 시 null일 수 있음 → 가드 처리).
 *  - 테이블명은 site.dbPrefix 접두사를 붙여 환경별 테이블 분리를 지원.
 */

// import: 다른 파일에서 만든 기능을 이 파일로 가져온다.
// - useState/useEffect: React의 "훅(Hook)". 함수형 컴포넌트에 상태와 부수효과 기능을 더해주는 특수 함수.
// - type ReactElement: 타입스크립트(TS) "타입"만 가져온다는 표시. 실제 코드가 아니라 "이 변수는 이런 모양"이라는 설명용.
//   (TS는 자바스크립트에 "타입 검사"를 더한 언어. 잘못된 값 사용을 미리 잡아준다.)
import { useState, useEffect, type ReactElement } from 'react';
// Link: 페이지 새로고침 없이 화면만 바꿔주는 라우터 링크 컴포넌트. <a>와 달리 SPA 내부 이동에 사용.
import { Link } from 'react-router-dom';
// useAuth: 우리 앱이 만든 "인증 컨텍스트"에서 로그인 정보(user, profile)를 꺼내 쓰는 커스텀 훅.
import { useAuth } from '../contexts/AuthContext';
// SEOHead: 페이지의 제목/검색엔진 노출 설정(meta 태그)을 넣어주는 컴포넌트.
import SEOHead from '../components/SEOHead';
// getSupabase: Supabase 클라이언트를 돌려주는 함수. 환경설정이 없으면 null을 줄 수 있어 항상 체크 필요.
import getSupabase from '../utils/supabase';
// site: 사이트 전역 설정(예: DB 테이블 접두사 dbPrefix)을 담은 객체.
import site from '../config/site';
// getMyAssessments: 본인 학습평가 성적을 가져오는 유틸 함수. AssessmentRecord는 그 결과 한 건의 타입.
import { getMyAssessments, type AssessmentRecord } from '../utils/assessments';

// 대시보드에서 사용하는 Supabase 테이블 이름 매핑.
// site.dbPrefix(환경별 접두사)를 붙여 실제 테이블명을 구성한다.
// 백틱(`)으로 감싼 문자열은 "템플릿 리터럴"이라 하며, ${ } 안의 값을 문자열에 끼워 넣는다.
// 예: dbPrefix가 "rest_"라면 `${site.dbPrefix}announcements` → "rest_announcements".
// 이렇게 하면 개발용/운영용 등 환경마다 테이블을 분리해서 쓸 수 있다.
// 주의: 백틱 문자열 안에는 주석을 넣으면 안 된다(문자열 출력값이 바뀌어 버린다).
const TABLES = {
  announcements: `${site.dbPrefix}announcements`,
  attendance: `${site.dbPrefix}attendance`,
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
};

// 학습평가 type 값(prerequisite/summative)을 화면 표시용 한국어 라벨로 변환하는 맵.
// Record<string, string>은 TS 타입으로 "키도 문자열, 값도 문자열인 객체"라는 뜻.
// 사용 예: ASSESSMENT_LABEL['prerequisite'] → '선수평가'.
const ASSESSMENT_LABEL: Record<string, string> = {
  prerequisite: '선수평가',
  summative: '사후평가',
};

/**
 * Dashboard 컴포넌트
 *
 * 무엇을 하는지: 로그인 사용자의 대시보드 화면(통계/성적/공지/바로가기)을 렌더링한다.
 * 매개변수: 없음 (인증 정보는 useAuth 컨텍스트에서 가져옴).
 * 반환값: ReactElement (대시보드 페이지 전체 JSX).
 * 부수효과: 마운트 및 user 변경 시 Supabase에서 대시보드 데이터를 비동기 로드(useEffect).
 *
 * 참고: 컴포넌트는 곧 "함수"다. 이 함수는 호출될 때마다 위에서 아래로 실행되고,
 *      마지막에 화면(JSX)을 return 한다. 상태가 바뀌면 React가 이 함수를 다시 호출해 화면을 새로 그린다.
 */
const Dashboard = (): ReactElement => {
  // 현재 로그인한 사용자(user)와 프로필(profile, 표시 이름 등)을 인증 컨텍스트에서 가져온다.
  // { user, profile }는 "구조 분해 할당"이라 한다. useAuth()가 돌려준 객체에서 두 값만 꺼내 변수로 만든다.
  const { user, profile } = useAuth();

  // ── 아래 useState들: 화면에 보여줄 "바뀌는 값"을 만든다. ──
  // useState(초깃값)는 [현재값, 값을바꾸는함수] 두 개를 배열로 돌려준다.
  // 예: const [a, setA] = useState(0) → a로 읽고, setA(새값)으로 바꾼다(setA를 호출하면 화면이 다시 그려짐).
  // <...>는 TS 제네릭으로, 그 상태에 들어갈 값의 "모양(타입)"을 미리 알려준다.

  // 최근 공지사항 목록 상태(최대 5건, 고정글 우선). 초깃값은 빈 배열 [].
  // 각 항목은 id/title/created_at/is_pinned 필드를 가진 객체다.
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; created_at: string; is_pinned: boolean }[]>([]);
  // 본인 출석 일수(present 상태 카운트) 상태. 초깃값 0.
  const [attendanceCount, setAttendanceCount] = useState(0);
  // 전체 과제 수 상태(진행률 계산의 분모). 초깃값 0.
  const [assignmentCount, setAssignmentCount] = useState(0);
  // 본인 제출 과제 수 상태(진행률 계산의 분자). 초깃값 0.
  const [submissionCount, setSubmissionCount] = useState(0);
  // 본인 학습평가 성적 레코드 목록 상태(선수/사후평가 등). 초깃값 빈 배열.
  const [grades, setGrades] = useState<AssessmentRecord[]>([]);

  // user가 준비되면 대시보드 데이터를 일괄 로드한다.
  // useEffect(콜백, 의존성배열): 화면이 그려진 "직후"에 콜백을 실행한다(데이터 가져오기 같은 부수효과 담당).
  // 의존성 배열이 [user]이므로: 첫 렌더링 때 한 번 + 이후 user 값이 바뀔 때마다 콜백이 다시 실행된다.
  //  → 로그인하거나 사용자가 바뀌면 데이터를 다시 조회한다는 뜻.
  // 주의: 의존성 배열을 비우면([]), 한 번만 실행되어 로그인 후에도 데이터가 안 들어올 수 있다.
  useEffect(() => {
    // useEffect의 콜백 자체는 async로 만들 수 없어서(반환 규칙 때문), 안에 async 함수 load를 따로 정의해 호출한다.
    // async/await: "비동기" 코드를 동기처럼 위에서 아래로 읽히게 해주는 문법.
    //   await는 "이 작업(서버 응답)이 끝날 때까지 기다린 뒤 다음 줄로" 라는 의미.
    const load = async () => {
      const client = getSupabase();
      // Supabase 미구성이거나 미로그인 상태면 조회하지 않고 종료(가드).
      // 가드(guard): 진행하면 안 되는 상황을 함수 앞부분에서 걸러 일찍 return 하는 방어 코드.
      // 주의: 이 체크가 없으면 client가 null일 때 .from(...) 호출에서 에러가 난다.
      if (!client || !user) return;

      // 여러 쿼리를 Promise.all로 병렬 실행해 로딩 지연을 최소화한다.
      // Promise: "나중에 끝날 작업"을 나타내는 객체. await으로 결과를 기다릴 수 있다.
      // Promise.all([...]): 여러 작업을 동시에 시작하고, 모두 끝나면 결과를 "배열"로 한 번에 돌려준다.
      //   순서대로 하나씩 await 하는 것보다 훨씬 빠르다(다섯 작업이 동시에 진행됨).
      // 결과 배열을 [annRes, attRes, ...]로 구조 분해해 각각의 응답에 이름을 붙인다.
      // 주의: Promise.all은 하나라도 실패(reject)하면 전체가 실패한다. 여기서는 Supabase가 보통 에러도
      //       값(객체)으로 돌려주므로 throw 없이 진행되지만, 실제 운영에선 try/catch 고려가 필요할 수 있다.
      // - 카운트 쿼리는 { count: 'exact' }로 정확한 건수를 받음.
      // - 출석/제출 쿼리는 user.id로 필터링(RLS와 더불어 본인 데이터만 집계).
      const [annRes, attRes, assignRes, subRes, gradeRes] = await Promise.all([
        // 공지사항: 고정글(is_pinned) 우선, 그다음 최신순 정렬, 5건 제한.
        // .order(컬럼, { ascending: false })는 내림차순 정렬. order를 두 번 쓰면 1차/2차 정렬 기준이 된다.
        //  → is_pinned가 true인 글(고정)이 먼저, 같은 그룹 안에서는 created_at이 큰(최신) 순서.
        // .limit(5): 최대 5건만 가져온다(대시보드는 미리보기이므로).
        client.from(TABLES.announcements).select('id, title, created_at, is_pinned').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5),
        // 출석: 본인(student_id) + status='present' 건수만 카운트.
        // .eq(컬럼, 값): "컬럼 = 값" 필터. 여기서는 student_id가 내 id이고 status가 'present'인 행만.
        // select('id', { count: 'exact' }): 행 데이터 대신 "정확한 개수"를 받기 위한 옵션.
        client.from(TABLES.attendance).select('id', { count: 'exact' }).eq('student_id', user.id).eq('status', 'present'),
        // 과제: 전체 과제 수 카운트(필터 없음 → 진행률 분모).
        client.from(TABLES.assignments).select('id', { count: 'exact' }),
        // 제출: 본인(student_id)이 제출한 과제 수 카운트(진행률 분자).
        client.from(TABLES.submissions).select('id', { count: 'exact' }).eq('student_id', user.id),
        // 성적: 별도 유틸을 통해 본인 학습평가 레코드 조회. (이 함수도 Promise를 반환하므로 함께 await 가능)
        getMyAssessments(user.id),
      ]);

      // 각 응답을 검증 후 상태에 반영.
      // Supabase 응답은 보통 { data, count, error } 형태다. 데이터가 있을 때만 상태에 넣어 안전하게 처리한다.
      // 카운트는 count가 null이 아닐 때만 반영하여 0으로 덮어쓰는 사고를 방지.
      // 주의: != null은 "null도 undefined도 아님"을 한 번에 검사하는 관용 표현(=== 두 개와 다름).
      //       만약 if (attRes.count) 처럼 쓰면, 실제 출석이 0건일 때도 거짓이 되어 갱신을 건너뛰는 미묘한 버그가 생긴다.
      if (annRes.data) setAnnouncements(annRes.data);
      if (attRes.count != null) setAttendanceCount(attRes.count);
      if (assignRes.count != null) setAssignmentCount(assignRes.count);
      if (subRes.count != null) setSubmissionCount(subRes.count);
      // 성적은 유틸이 배열을 반환하므로 그대로 설정.
      setGrades(gradeRes);
    };
    // 위에서 정의한 async 함수를 실제로 실행. (정의만 하면 실행되지 않으므로 호출이 필요)
    // 주의: load()는 Promise를 돌려주지만 여기서 await 하지 않는다. useEffect 콜백은 동기여야 하기 때문.
    //       "결과를 기다리지 않고 시작만" 시키는 패턴이며, 데이터가 도착하면 setState가 화면을 갱신한다.
    load();
  }, [user]);

  // 아래는 화면(JSX)을 그려서 돌려주는 부분이다.
  // <> ... </>는 "프래그먼트(Fragment)". 여러 요소를 묶되, 불필요한 <div>를 만들지 않으려고 쓰는 빈 껍데기 태그.
  return (
    <>
      {/* JSX 안의 주석은 이렇게 {/* ... *​/} 형태로 쓴다. (일반 // 주석은 JSX 사이에 못 씀) */}
      {/* SEO 메타: 대시보드는 비공개 페이지이므로 noindex 처리 */}
      {/* noindex: 검색엔진(구글 등)이 이 페이지를 색인하지 말라는 신호. 로그인 후 개인 화면이라 검색 노출 불필요. */}
      <SEOHead title="대시보드" path="/dashboard" noindex />
      {/* 페이지 헤더: 인사말에 프로필 표시 이름 사용(없으면 '수강생' 대체) */}
      <section className="page-header">
        <div className="container">
          <h2>대시보드</h2>
          {/* profile?.display_name: 옵셔널 체이닝(?.). profile이 null/undefined여도 에러 없이 undefined를 반환. */}
          {/* || '수강생': 앞 값이 비어있으면(없거나 빈 문자열) '수강생'을 대신 보여준다(기본값 처리). */}
          <p>안녕하세요, {profile?.display_name || '수강생'}님!</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 상단 통계 카드 영역: 출석/과제 제출/진행률 */}
          <div className="dashboard-stats">
            {/* 출석 일수 카드 */}
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              {/* { } 안에 상태값을 넣으면 그 값이 화면에 글자로 표시된다. */}
              <div className="stat-value">{attendanceCount}</div>
              <div className="stat-label">출석 일수</div>
            </div>
            {/* 과제 제출 카드: 제출 수 / 전체 과제 수 (예: 3/10) */}
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{submissionCount}/{assignmentCount}</div>
              <div className="stat-label">과제 제출</div>
            </div>
            {/* 진행률 카드: 과제가 0건이면 0%로 처리(0 나눗셈 방지) */}
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              {/* 삼항 연산자(조건 ? A : B): 조건이 참이면 A, 거짓이면 B. */}
              {/* assignmentCount가 0이면 (submissionCount / 0)은 무한대/NaN이 되므로, 0보다 클 때만 계산하고 아니면 0. */}
              {/* Math.round(...): 소수점을 반올림해 정수 퍼센트로 만든다. */}
              <div className="stat-value">{assignmentCount > 0 ? Math.round((submissionCount / assignmentCount) * 100) : 0}%</div>
              <div className="stat-label">진행률</div>
            </div>
          </div>

          {/* 학습평가 성적 영역: 선수평가/사후평가 카드 */}
          {/* style={{ ... }}: JSX에서 인라인 스타일은 "객체"로 준다. 바깥 { }는 JS 표현식, 안쪽 { }는 객체. */}
          <div className="dashboard-section" style={{ marginBottom: '24px' }}>
            <h3>🎯 내 학습평가 성적</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {/* 선수/사후평가 두 종류를 순회하며 카드 생성 */}
              {/* .map(함수): 배열의 각 원소를 변환해 "JSX 요소들의 배열"을 만든다. React는 그 배열을 차례로 렌더링한다. */}
              {/* as const: 이 배열을 읽기 전용 + 정확한 문자열 타입('prerequisite'|'summative')으로 고정하는 TS 표현. */}
              {(['prerequisite', 'summative'] as const).map((t) => {
                // 해당 type의 성적 레코드를 찾는다(없으면 미응시 상태).
                // .find(조건): 배열에서 조건을 처음 만족하는 원소 하나를 반환. 없으면 undefined.
                //  → g가 undefined이면 "아직 응시 안 함", 값이 있으면 "응시 완료"로 분기한다.
                const g = grades.find((x) => x.type === t);
                return (
                  // 좌측 컬러 보더로 합격(초록)/불합격(빨강)/미응시(회색)를 시각화
                  // key={t}: 목록을 그릴 때 React가 각 항목을 구분하려고 요구하는 고유 식별자. (성능/정확성에 중요)
                  // 주의: .map으로 만든 형제 요소에는 반드시 서로 다른 key를 줘야 한다(없으면 경고/버그).
                  <div key={t} style={{
                    border: '1px solid var(--border-light, #e5e7eb)',
                    // 중첩 삼항: g가 있으면(응시) passed에 따라 초록/빨강, g가 없으면(미응시) 회색 테두리.
                    borderLeft: `4px solid ${g ? (g.passed ? '#10b981' : '#ef4444') : 'var(--border-light, #e5e7eb)'}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '16px 18px',
                    background: 'var(--bg-white, #fff)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      {/* 평가 종류 라벨(선수평가/사후평가) — 위에서 정의한 ASSESSMENT_LABEL 맵으로 한국어 변환 */}
                      <strong style={{ fontSize: '16px' }}>{ASSESSMENT_LABEL[t]}</strong>
                      {/* 성적이 있을 때만 합격/불합격 배지 표시 */}
                      {/* {조건 && <JSX/>}: 조건이 참일 때만 뒤의 JSX를 렌더링하는 패턴. 거짓이면 아무것도 안 그린다. */}
                      {/* 주의: 0이나 '' 같은 값을 조건으로 쓰면 화면에 0이 찍힐 수 있다. 여기서 g는 객체/undefined라 안전. */}
                      {g && (
                        <span style={{
                          fontSize: '13px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                          background: g.passed ? '#d1fae5' : '#fee2e2',
                          color: g.passed ? '#065f46' : '#991b1b',
                        }}>{g.passed ? '합격' : '불합격'}</span>
                      )}
                    </div>
                    {/* 성적 유무에 따른 분기: 있으면 점수/정답수/제출일, 없으면 응시 유도 링크 */}
                    {g ? (
                      // 프래그먼트(<> </>)로 두 줄(점수/정답·날짜)을 묶어 함께 반환.
                      <>
                        {/* 점수: 합격 여부에 따라 색상 구분 */}
                        <div style={{ fontSize: '28px', fontWeight: 800, color: g.passed ? '#10b981' : '#ef4444' }}>
                          {g.score}<span style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)' }}>점</span>
                        </div>
                        {/* 정답 수와 제출일(제출일 없으면 빈 문자열). 날짜는 한국 로캘로 표기 */}
                        {/* new Date(문자열): 날짜 문자열을 Date 객체로 변환. toLocaleDateString('ko-KR')은 "2026. 6. 7." 같은 한국식 표기. */}
                        {/* g.submitted_at ? ... : '' → 제출일이 없으면 빈 문자열을 보여줘 에러를 방지(가드). */}
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                          {g.correct}/{g.total} 정답 · {g.submitted_at ? new Date(g.submitted_at).toLocaleDateString('ko-KR') : ''}
                        </div>
                      </>
                    ) : (
                      // 미응시 시 해당 평가 페이지로 이동하는 링크
                      // to={`/assessment/${t}`}: t가 'prerequisite'면 '/assessment/prerequisite'로 이동(템플릿 리터럴로 경로 조립).
                      <Link to={`/assessment/${t}`} style={{ fontSize: '15px', color: 'var(--primary-blue, #0046C8)', fontWeight: 600 }}>
                        아직 응시하지 않았습니다 → 평가 보기
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            {/* 진단평가 안내: 자습용이며 성적 미반영임을 명시 */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginTop: '10px' }}>
              💡 <Link to="/assessment/diagnostic" style={{ color: 'var(--primary-blue, #0046C8)' }}>진단평가</Link>는 사후평가 전 자습용으로, 정답·해설이 공개되어 있고 성적에는 반영되지 않습니다.
            </p>
          </div>

          {/* 하단 2열 그리드: 공지사항 + 바로가기 */}
          <div className="dashboard-grid">
            {/* 공지사항 영역 */}
            <div className="dashboard-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3>📢 공지사항</h3>
                {/* 공지사항 전체 목록 페이지로 이동 */}
                <Link to="/announcements" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)', textDecoration: 'none' }}>전체보기 →</Link>
              </div>
              {/* 공지가 있으면 목록, 없으면 안내 문구 */}
              {/* announcements.length > 0: 배열에 항목이 하나라도 있으면 참 → 목록(<ul>)을, 아니면 빈 메시지를 보여준다. */}
              {announcements.length > 0 ? (
                <ul className="dashboard-list">
                  {/* 공지 배열을 순회하며 각 항목을 <li>로 변환 */}
                  {announcements.map(a => (
                    // 고정글이면 pinned 클래스 부여 + '고정' 배지 표시
                    // className={조건 ? 'pinned' : ''}: 고정글일 때만 'pinned' CSS 클래스를 붙여 강조 스타일 적용.
                    <li key={a.id} className={a.is_pinned ? 'pinned' : ''}>
                      {/* 고정글일 때만 '고정' 배지 렌더링 (조건 && JSX 패턴) */}
                      {a.is_pinned && <span className="pin-badge">고정</span>}
                      {/* 개별 공지 상세 페이지로 이동 (a.id를 경로에 끼워 해당 글로 연결) */}
                      <Link to={`/announcements/${a.id}`} className="list-title" style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                      {/* 작성일(한국 로캘) */}
                      <span className="list-date">{new Date(a.created_at).toLocaleDateString('ko-KR')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">공지사항이 없습니다.</p>
              )}
            </div>

            {/* 바로가기 영역: 주요 기능 페이지 링크 모음 */}
            <div className="dashboard-section">
              <h3>🔗 바로가기</h3>
              <div className="quick-links">
                {/* 내부 페이지 이동은 <Link>를 쓴다(새로고침 없이 빠르게 화면 전환). */}
                <Link to="/announcements" className="quick-link-card">📢 공지사항</Link>
                <Link to="/materials" className="quick-link-card">📁 강의자료</Link>
                <Link to="/assignments" className="quick-link-card">📝 과제</Link>
                <Link to="/project-vote" className="quick-link-card">🧩 팀구성</Link>
                <Link to="/project-board" className="quick-link-card">🗂️ 프로젝트 관리</Link>
                <Link to="/qna" className="quick-link-card">❓ Q&A</Link>
                <Link to="/classroom" className="quick-link-card">💻 온라인강의실</Link>
                <Link to="/mypage" className="quick-link-card">👤 마이페이지</Link>
                {/* 외부 Padlet 공유 게시판: 새 탭 + noopener로 보안 처리 */}
                {/* 외부 사이트라 <Link>가 아닌 일반 <a>를 사용한다. */}
                {/* target="_blank": 새 탭에서 열기. rel="noopener noreferrer": 새 탭 페이지가 원래 창을 조작하지 못하게 막는 보안 설정. */}
                <a href="https://padlet.com/aebon/rest01" target="_blank" rel="noopener noreferrer" className="quick-link-card">📌 공유 게시판</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// export default: 이 파일의 "대표 내보내기". 다른 파일에서 import Dashboard from './Dashboard' 로 가져다 쓴다.
export default Dashboard;
