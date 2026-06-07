/*
 * AssignmentDetail.tsx
 * ----------------------------------------------------------------------------
 * [이 파일이 무엇인가요?]
 *   - "과제 상세 페이지" 화면을 그리는 React 컴포넌트 파일입니다.
 *   - 학생이 과제 목록에서 특정 과제 하나를 클릭하면, 그 과제의 자세한 내용과
 *     "제출 폼(form)"이 보이는 화면이 바로 이 파일이 만드는 페이지입니다.
 *
 * [초보자를 위한 배경/용어]
 *   - 컴포넌트(component): 화면의 한 조각을 만들어 주는 함수. 여기서는 파일 하나가
 *     페이지 전체(컴포넌트 하나)를 담당합니다.
 *   - 라우트 파라미터(route parameter): 주소(URL) 안에 들어 있는 값. 예를 들어
 *     "/assignments/42" 라는 주소에서 "42"가 과제 id 입니다. 이 값을 useParams로 꺼냅니다.
 *   - 상태(state): 화면이 기억하고 있어야 하는 값. 값이 바뀌면 React가 화면을 다시 그립니다.
 *   - Supabase: 백엔드(데이터베이스 + 인증)를 대신 제공해 주는 서비스. 우리는 코드로
 *     "이 테이블에서 이런 데이터 가져와줘 / 저장해줘" 라고 요청합니다.
 *   - 테이블(table): 엑셀 표처럼 행(row)과 열(column)로 데이터를 저장하는 곳.
 *     여기서는 assignments(과제) 테이블과 submissions(제출물) 테이블을 씁니다.
 *
 * 역할:
 *   - 단일 과제(Assignment)의 상세 정보를 표시하고, 로그인한 학생이 해당 과제를
 *     제출/수정할 수 있게 하는 페이지 컴포넌트.
 *
 * 핵심 책임:
 *   - URL 파라미터(id)로 과제 1건과, 현재 사용자의 기존 제출물(있다면)을 함께 조회.
 *   - 과제 설명, 마감일, 마감 초과 여부, 채점 결과(점수/피드백)를 렌더링.
 *   - 제출 폼(내용 + 파일/링크 URL)을 통해 신규 제출(insert) 또는 기존 제출 수정(update) 처리.
 *   - 이미 채점된(score != null) 경우 입력/제출을 비활성화.
 *     (한 번 점수를 받은 과제는 학생이 더 이상 고칠 수 없도록 막는 것)
 *
 * 주요 export:
 *   - default: AssignmentDetail (React 페이지 컴포넌트)
 *
 * 데이터 접근:
 *   - Supabase 클라이언트(getSupabase)를 통해 assignments / submissions 테이블에 접근.
 *   - 테이블명은 site.dbPrefix 접두사를 붙여 환경별로 분리(RLS 정책이 student_id 기준으로
 *     본인 제출물만 접근하도록 가정).
 *   - RLS(Row Level Security): "행 단위 보안". 데이터베이스 쪽에서 "이 사용자는 자기
 *     데이터만 볼 수 있다" 같은 규칙을 강제하는 기능. 그래서 다른 학생의 제출물은
 *     코드에서 요청해도 데이터베이스가 막아 줍니다(보안의 2중 안전장치).
 */

// [import 설명] 다른 파일/라이브러리에 있는 기능을 이 파일로 "가져오는" 구문입니다.
// useState/useEffect는 React의 "훅(Hook)" — 함수 컴포넌트에서 상태나 부수효과를 다루게 해주는 도구.
// type ReactElement, type FormEvent 처럼 'type'이 붙은 것은 "타입(TypeScript용 데이터 모양 정보)"만
// 가져온다는 뜻이라 실제 실행 코드에는 포함되지 않습니다.
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
// useParams: 주소(URL) 안의 파라미터를 꺼내는 훅. Link: 페이지 이동용 링크 컴포넌트(<a> 대신 사용).
import { useParams, Link } from 'react-router-dom';
// useAuth: 로그인 정보(현재 사용자/프로필)를 어디서든 꺼내 쓰게 해주는 우리가 만든 훅.
import { useAuth } from '../contexts/AuthContext';
// useToast: 화면 구석에 잠깐 떴다 사라지는 알림(toast) 메시지를 띄우는 훅.
import { useToast } from '../contexts/ToastContext';
// SEOHead: 페이지 제목/검색엔진 노출 설정 등 <head> 메타 정보를 넣어주는 컴포넌트.
import SEOHead from '../components/SEOHead';
// getSupabase: Supabase 데이터베이스에 접근할 수 있는 "클라이언트" 객체를 돌려주는 함수.
import getSupabase from '../utils/supabase';
// site: 사이트 전역 설정(테이블 접두사 등)이 담긴 설정 객체.
import site from '../config/site';
// Assignment, Submission: 과제/제출물 데이터가 어떤 모양인지 정의한 타입(실행 코드 아님).
import type { Assignment, Submission } from '../types';

// DB 테이블명 매핑: site.dbPrefix를 접두사로 붙여 환경(프로젝트)별 테이블을 구분한다.
// [개념] 백틱(`)으로 감싼 문자열은 "템플릿 리터럴" — ${...} 안의 값을 문자열에 끼워 넣을 수 있다.
//   예) dbPrefix가 "rest_" 이면 결과는 "rest_assignments", "rest_submissions" 가 된다.
// 주의: 백틱 문자열 안에는 주석을 절대 넣지 말 것(그대로 출력되어 테이블명이 깨짐).
const TABLES = {
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
};

/**
 * AssignmentDetail
 * 과제 상세 + 제출 폼 페이지 컴포넌트.
 * - 매개변수: 없음 (라우트 파라미터 id는 useParams로 획득).
 * - 반환값: 페이지 ReactElement (로딩 스피너 / 없음 안내 / 상세 화면).
 * - 부수효과: 마운트/의존성 변경 시 과제·제출물 조회, 폼 제출 시 DB insert/update 및 토스트.
 *   ([개념] "부수효과(side effect)" = 화면을 그리는 것 외에 일어나는 일.
 *    예: 데이터베이스에서 데이터 가져오기, 저장하기, 알림 띄우기 등.)
 */
const AssignmentDetail = (): ReactElement => {
  // 라우트에서 과제 id 추출 (예: /assignments/:id)
  // [개념] 구조 분해 할당: { id } 는 useParams()가 돌려준 객체에서 id 속성만 꺼내는 문법.
  const { id } = useParams<{ id: string }>();
  // 인증 컨텍스트: 현재 로그인 사용자(user)와 프로필(profile)
  // user: 로그인 계정 정보(고유 id 등). profile: 표시명/이름 등 추가 프로필 정보.
  const { user, profile } = useAuth();
  // 토스트 알림 표시 함수 (성공/실패 메시지를 잠깐 띄울 때 사용)
  const { showToast } = useToast();

  // [개념] useState(초기값)은 [현재값, 값을 바꾸는 함수] 쌍을 돌려준다.
  //   setXxx(...)를 호출하면 React가 그 값을 기억하고 화면을 다시 그린다.
  //   주의: 값을 바꿀 때 assignment = ... 처럼 직접 대입하면 안 되고 반드시 setAssignment(...)를 써야 한다.

  // 조회한 과제 데이터 (없으면 null) — 제네릭 <Assignment | null>은 "Assignment 타입이거나 null"이란 뜻.
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  // 현재 사용자의 기존 제출물 (없으면 null → 신규 제출 흐름)
  const [submission, setSubmission] = useState<Submission | null>(null);
  // 제출 폼: 내용 입력값 (초기값은 빈 문자열)
  const [content, setContent] = useState('');
  // 제출 폼: 파일/링크 URL 입력값
  const [fileUrl, setFileUrl] = useState('');
  // 제출 진행 중 여부 (버튼 비활성화/문구 제어) — 중복 제출(따닥 클릭)을 막는 데도 쓰임.
  const [submitting, setSubmitting] = useState(false);
  // 초기 데이터 로딩 중 여부 (true면 스피너를 보여줌)
  const [loading, setLoading] = useState(true);

  // 마운트 시 및 id/user 변경 시 과제와 본인 제출물을 병렬 조회.
  // 부수효과: assignment/submission/content/fileUrl/loading 상태 갱신.
  // [개념] useEffect(함수, [의존성]): 컴포넌트가 처음 화면에 나타날 때(마운트) 그리고
  //   [의존성] 배열 안의 값이 바뀔 때마다 첫 번째 함수를 실행한다.
  //   여기 의존성은 [id, user] → 주소의 과제 id가 바뀌거나 로그인 사용자가 바뀌면 다시 조회.
  useEffect(() => {
    // [개념] async 함수: 안에서 await로 "끝날 때까지 기다리는" 비동기 작업을 다룰 수 있다.
    //   주의: useEffect의 콜백 자체는 async로 만들 수 없어서, 안에 async 함수(load)를 만들고 아래서 호출한다.
    const load = async () => {
      const client = getSupabase();
      // 클라이언트/식별자/로그인 정보가 없으면 조회 불가 → 로딩만 종료하고 반환
      // (예: 아직 로그인 안 됨, 주소에 id 없음 등. 이때 무리하게 요청하지 않고 안전하게 빠져나온다.)
      if (!client || !id || !user) { setLoading(false); return; }
      // 과제 1건과 본인 제출물을 동시에 요청해 지연을 최소화.
      // [개념] Promise.all([A, B]): A와 B를 동시에 시작하고 둘 다 끝나면 결과를 한꺼번에 받는다.
      //   하나씩 await 하는 것보다 빠르다(직렬 대기 → 병렬 대기).
      // - 과제: single() (정확히 1건 기대 — 없거나 2건 이상이면 에러)
      // - 제출물: maybeSingle() (없을 수 있으므로 0건 허용 — 0건이면 data가 null)
      //   student_id로 필터링하여 RLS와 별개로 본인 제출물만 조회.
      //   ([개념] .eq('컬럼', 값) = "컬럼이 값과 같은 행만" 이라는 SQL의 WHERE 조건.)
      const [assignRes, subRes] = await Promise.all([
        client.from(TABLES.assignments).select('*').eq('id', id).single(),
        client.from(TABLES.submissions).select('*').eq('assignment_id', id).eq('student_id', user.id).maybeSingle(),
      ]);
      // 과제 데이터가 있으면 상태에 저장. (as Assignment: "이 데이터를 Assignment 타입으로 취급" 단언)
      if (assignRes.data) setAssignment(assignRes.data as Assignment);
      if (subRes.data) {
        // 기존 제출물이 있으면 상태에 반영하고, 폼 입력값을 기존 값으로 프리필.
        // (프리필 = 미리 채워두기. 학생이 예전에 쓴 내용을 다시 보여줘 "수정" 흐름을 만든다.)
        const s = subRes.data as Submission;
        setSubmission(s);
        // [개념] s.content || '' : content가 null/undefined/빈 값이면 대신 빈 문자열 ''을 쓴다.
        //   textarea의 value는 절대 null이 되면 안 되기 때문(React 경고 발생).
        setContent(s.content || '');
        setFileUrl(s.file_url || '');
      }
      // 성공/실패 여부와 관계없이 로딩 상태는 끝낸다 → 스피너 사라지고 실제 화면 표시.
      setLoading(false);
    };
    load(); // 위에서 정의한 async 함수를 실제로 실행. (정의만 하면 아무 일도 안 일어난다.)
  }, [id, user]);
  // 주의: 의존성 배열([id, user])을 빼먹으면 데이터가 갱신되지 않거나 무한 반복될 수 있다.

  /**
   * handleSubmit
   * 제출 폼 submit 핸들러. 기존 제출물 유무에 따라 update 또는 insert 수행.
   * - 매개변수: e (FormEvent) — 기본 동작(페이지 새로고침) 방지에 사용.
   * - 반환값: Promise<void>.  (async 함수라 자동으로 Promise를 돌려준다.)
   * - 부수효과: DB insert/update, 성공/실패 토스트, submission/submitting 상태 갱신.
   * - 엣지케이스: 내용과 파일 URL이 모두 비어 있으면 제출을 막고 에러 토스트.
   */
  const handleSubmit = async (e: FormEvent) => {
    // [개념] e.preventDefault(): 폼을 submit하면 브라우저가 기본으로 페이지를 새로고침한다.
    //   그러면 우리가 만든 화면 상태가 다 날아가므로, 그 기본 동작을 막고 우리 코드로 처리한다.
    e.preventDefault();
    // 내용과 파일 URL이 둘 다 비어 있으면 제출 불가 (둘 중 하나는 필수)
    // [개념] .trim()은 앞뒤 공백 제거. 공백만 입력한 경우도 "빈 값"으로 처리하기 위함.
    if (!content.trim() && !fileUrl.trim()) { showToast('내용 또는 파일 URL을 입력해주세요.', 'error'); return; }
    setSubmitting(true); // 제출 시작 표시 → 버튼 비활성화 + "제출 중..." 문구로 바뀜.
    // [개념] try/catch/finally:
    //   try 안에서 에러가 나면 catch로 점프하고, finally는 성공/실패와 무관하게 항상 실행된다.
    try {
      const client = getSupabase();
      // 클라이언트/사용자/과제 id 중 하나라도 없으면 진행 불가
      // throw로 에러를 던지면 곧바로 아래 catch 블록으로 넘어간다.
      if (!client || !user || !id) throw new Error('Not ready');
      // 제출/수정에 사용할 공통 페이로드(서버로 보낼 데이터 묶음).
      // [개념] profile?.display_name : 옵셔널 체이닝. profile이 null/undefined면 에러 없이 undefined가 된다.
      //   profile?.display_name || profile?.name || '' : 표시명 우선, 없으면 이름, 그것도 없으면 빈 문자열.
      const payload = {
        assignment_id: id,
        student_id: user.id,
        student_name: profile?.display_name || profile?.name || '',
        content: content.trim(),
        file_url: fileUrl.trim(),
        // [개념] new Date().toISOString(): 현재 시각을 "2026-06-07T12:34:56.789Z" 같은 표준 문자열로 변환.
        //   데이터베이스에 시간을 저장할 때 흔히 쓰는 형식.
        submitted_at: new Date().toISOString(),
      };
      if (submission) {
        // 이미 제출한 적이 있으면(=submission이 있으면) 해당 행을 갱신(update).
        // [개념] 구조 분해로 { error }만 꺼낸다. Supabase는 결과를 { data, error } 형태로 돌려준다.
        const { error } = await client.from(TABLES.submissions).update(payload).eq('id', submission.id);
        if (error) throw error; // 에러가 있으면 던져서 catch로 보냄.
        showToast('과제가 수정되었습니다.', 'success');
      } else {
        // 최초 제출이면(=submission이 없으면) 새 행 삽입(insert).
        const { error } = await client.from(TABLES.submissions).insert(payload);
        if (error) throw error;
        showToast('과제가 제출되었습니다.', 'success');
      }
      // 저장 후 최신 제출물을 다시 조회해 상태(점수/피드백 등 포함)를 동기화.
      // (방금 저장한 결과를 서버에서 한 번 더 읽어와, 화면 상태를 최신으로 맞춰주는 단계.)
      const { data } = await client.from(TABLES.submissions).select('*').eq('assignment_id', id).eq('student_id', user.id).maybeSingle();
      if (data) setSubmission(data as Submission);
    } catch (err) {
      // 에러 메시지가 있으면 그대로, 없으면 기본 실패 문구로 토스트.
      // [개념] (err as Error): catch로 잡힌 err의 타입이 unknown이라, Error로 단언해 .message에 접근.
      showToast((err as Error).message || '제출에 실패했습니다.', 'error');
    } finally {
      // 성공/실패와 무관하게 제출 진행 상태 해제. (버튼이 다시 눌리도록 복구)
      setSubmitting(false);
    }
  };

  // [개념] "조기 반환(early return)": 조건에 따라 본격적인 화면 대신 다른 화면을 먼저 돌려주고 끝낸다.
  // 로딩 중에는 중앙 정렬된 스피너만 표시.
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="loading-spinner"></div></div>;
  // 과제 조회 실패(없음) 시 안내 문구 표시. (여기를 통과해야만 아래에서 assignment를 안심하고 사용 가능)
  if (!assignment) return <div style={{ textAlign: 'center', padding: '100px 0' }}>과제를 찾을 수 없습니다.</div>;

  // 현재 시각이 마감일을 지났는지 여부 (경고 표시용)
  // [개념] Date 객체끼리 > 비교가 가능 → "지금 시각"이 "마감 시각"보다 뒤면 마감 초과(true).
  const isOverdue = new Date() > new Date(assignment.due_date);

  // [개념] return 안의 < ... > 부분이 JSX — JavaScript 안에서 HTML처럼 화면 구조를 쓰는 문법.
  //   <>...</> 는 "프래그먼트"로, 불필요한 <div> 없이 여러 요소를 한 묶음으로 반환할 때 쓴다.
  //   JSX 안에서는 주석을 {/* ... */} 형태로만 작성한다.
  return (
    <>
      {/* 검색엔진 비노출(noindex) 처리된 SEO 메타 헤더 (과제 페이지는 검색 결과에 안 뜨게 함) */}
      {/* [개념] path={`...`} 처럼 중괄호 {} 안에는 JS 표현식을 넣는다. 여기선 템플릿 리터럴로 경로를 만듦. */}
      <SEOHead title={assignment.title} path={`/assignments/${id}`} noindex />
      {/* 페이지 상단 헤더: 뒤로가기 링크, 과제 제목, 메타 정보 */}
      <section className="page-header">
        <div className="container">
          {/* 과제 목록으로 돌아가는 링크 ([개념] <Link>는 새로고침 없이 화면만 바꿔 더 빠르다) */}
          <Link to="/assignments" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '16px' }}>← 과제 목록</Link>
          <h2>{assignment.title}</h2>
          {/* Day 번호 / 팀·개인 과제 구분 / 배점 표시 */}
          {/* [개념] {조건 ? 'A' : 'B'} 는 삼항 연산자: 조건이 참이면 A, 거짓이면 B를 보여준다. */}
          <p>Day {assignment.day_number} | {assignment.is_team ? '팀 과제' : '개인 과제'} | 배점: {assignment.max_score}점</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="assignment-detail-grid">
            {/* 좌측: 과제 설명 영역 */}
            <div className="assignment-content">
              <h3>과제 설명</h3>
              <div className="assignment-body">{assignment.description}</div>
              <div className="assignment-meta-detail">
                {/* 마감일을 한국 로케일 형식으로 표시 (toLocaleString('ko-KR') → 한국식 날짜/시간 문자열) */}
                <p><strong>마감일:</strong> {new Date(assignment.due_date).toLocaleString('ko-KR')}</p>
                {/* 마감 초과 시 경고 문구 */}
                {/* [개념] {조건 && JSX} : 조건이 참일 때만 뒤의 JSX를 보여준다(거짓이면 아무것도 안 그림). */}
                {isOverdue && <p style={{ color: '#DC2626' }}>⚠️ 마감 기한이 지났습니다.</p>}
              </div>
            </div>

            {/* 우측: 제출/채점 영역 */}
            <div className="submission-section">
              {/* 기존 제출물 유무에 따라 제목 전환 (제출했으면 '제출 내용', 아니면 '과제 제출') */}
              <h3>{submission ? '제출 내용' : '과제 제출'}</h3>
              {/* 채점 완료(score가 null/undefined가 아님) 시 점수와 피드백 표시 */}
              {/* 주의: score가 0점일 수도 있으므로 단순히 (submission?.score)로 판단하면 안 된다. */}
              {/*   0은 거짓으로 취급되어 0점 채점이 안 보일 수 있다 → null/undefined를 명시적으로 비교한다. */}
              {submission?.score !== null && submission?.score !== undefined && (
                <div className="grade-display">
                  <span className="grade-score">{submission.score}/{assignment.max_score}</span>
                  <p className="grade-feedback">{submission.feedback}</p>
                </div>
              )}
              {/* [개념] <form onSubmit={...}>: 폼이 제출될 때 handleSubmit 함수가 실행되도록 연결. */}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>내용</label>
                  {/* [개념] "제어 컴포넌트": value는 상태(content)에서 받고, 입력이 바뀌면 onChange로 상태를 갱신.
                      이렇게 하면 화면에 보이는 값과 코드가 기억하는 값이 항상 일치한다.
                      e.target.value = 사용자가 방금 입력한 글자들. */}
                  {/* 채점 완료(score != null) 시 수정 불가하도록 비활성화 */}
                  {/* 주의: != 는 null과 undefined를 둘 다 걸러낸다(느슨한 비교). 즉 점수가 매겨졌을 때만 true. */}
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
                    placeholder="과제 내용을 작성하세요..." disabled={submission?.score != null} />
                </div>
                <div className="form-group">
                  <label>파일/링크 URL (선택)</label>
                  {/* type="url"로 형식 검증(브라우저가 http(s):// 형식인지 확인), 채점 완료 시 비활성화 */}
                  <input type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)}
                    placeholder="https://..." disabled={submission?.score != null} />
                </div>
                {/* 아직 채점 전(score == null)일 때만 제출/수정 버튼 노출 (채점되면 버튼 자체가 사라짐) */}
                {submission?.score == null && (
                  // disabled={submitting} : 제출 중에는 버튼을 눌러도 반응하지 않게 해 중복 제출 방지.
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                    {/* 제출 중 / 기존 제출물 있으면 수정 / 없으면 제출 문구 (중첩 삼항 연산자) */}
                    {submitting ? '제출 중...' : submission ? '수정하기' : '제출하기'}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// [개념] export default: 이 파일의 "대표" 내보내기. 다른 파일에서 원하는 이름으로 import 할 수 있다.
export default AssignmentDetail;
