/**
 * AdminAssignments.tsx
 *
 * [이 파일은 무엇인가요?]
 * 관리자(선생님/운영자)만 사용하는 "과제 관리" 화면입니다.
 * 데이터베이스에 저장된 과제 목록을 보여주고, 새 과제를 만들고(등록), 고치고(수정),
 * 지우는(삭제) 기능을 한 화면에서 모두 제공합니다.
 * 이렇게 "목록 보기 + 만들기 + 고치기 + 지우기" 네 가지를 묶어서 CRUD라고 부릅니다.
 *   - C(Create) = 등록, R(Read) = 조회, U(Update) = 수정, D(Delete) = 삭제
 *
 * [초보자를 위한 배경 용어]
 * - 컴포넌트(Component): 화면의 한 조각을 만들어 내는 함수입니다. React는 이 함수가
 *   돌려주는(return) JSX를 실제 화면으로 바꿔줍니다.
 * - JSX: 자바스크립트 안에 HTML처럼 생긴 태그를 적는 문법입니다. (<div>...</div> 같은 것)
 * - 상태(State): 화면이 기억해야 하는 "변하는 값"입니다. 상태가 바뀌면 React가 화면을 다시 그립니다.
 * - Supabase: 인터넷 너머에 있는 데이터베이스(자료 저장소) 서비스입니다.
 * - 비동기(async/await): DB에 다녀오는 일은 시간이 걸리므로, 결과를 기다렸다가 다음 줄을 실행합니다.
 *
 * [핵심 책임]
 * - 과제 목록을 day_number 순으로 불러와 표 형태로 렌더링
 * - 인라인 폼을 통한 신규 과제 등록 및 기존 과제 수정
 * - 과제 삭제(확인 다이얼로그 포함)
 * - 마감일(due_date)의 ISO 문자열 ↔ datetime-local 입력값 간 변환 처리
 * - 작업 결과를 토스트(Toast)로 사용자에게 피드백
 *
 * [주요 export]
 * - default: AdminAssignments 컴포넌트 (관리자 과제 관리 페이지)
 *
 * [비고]
 * - 데이터 접근은 getSupabase()로 얻은 클라이언트를 통해 이뤄지며,
 *   실제 권한 제어(RLS)는 Supabase 정책에 위임된다(클라이언트는 단순히 쿼리만 수행).
 *   주의: 프런트엔드에서 버튼을 숨기는 것만으로는 보안이 완성되지 않습니다.
 *         진짜 차단은 반드시 서버(RLS, 행 단위 보안 규칙)에서 이뤄져야 합니다.
 * - 테이블명은 site.dbPrefix 접두사를 붙여 환경별 분리를 지원한다.
 */
// import: 다른 파일에 있는 기능을 이 파일로 가져오는 문법입니다.
//  - useState: 컴포넌트가 기억할 "상태 값"을 만드는 훅(Hook).
//  - useEffect: 화면이 처음 나타날 때 등 특정 시점에 코드를 실행하는 훅.
//  - type ReactElement, type FormEvent: 'type'을 붙이면 실행 코드가 아니라 타입(자료의 종류) 정보만 가져옵니다.
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { EmojiIcon } from '../../utils/emojiIcon';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Assignment } from '../../types';

// 사용할 Supabase 테이블명 매핑. site.dbPrefix로 환경별(스테이징/운영 등) 접두사를 붙인다.
// 예: dbPrefix가 'rest_'이면 테이블명은 'rest_assignments'가 됩니다.
// 백틱(`)으로 감싸고 ${...}를 쓰면 문자열 안에 변수 값을 끼워 넣을 수 있습니다(템플릿 리터럴).
const TABLES = { assignments: `${site.dbPrefix}assignments` };

// 폼 초기값(빈 과제). 신규 등록 시작/취소 시 이 값으로 폼을 리셋한다.
// 주의: EMPTY를 직접 폼 상태로 쓰지 않고 항상 { ...EMPTY }처럼 "복사본"을 만들어 씁니다.
//       그래야 폼을 수정해도 원본 EMPTY가 오염되지 않습니다(다음 등록 때 깨끗한 상태 유지).
const EMPTY = { title: '', description: '', category: 'general', day_number: 1, due_date: '', max_score: 100, is_team: false };

/**
 * ISO 날짜 문자열을 <input type="datetime-local">이 요구하는 형식으로 변환한다.
 *
 * [왜 필요한가?]
 * DB는 날짜를 ISO 8601 형식(예: "2026-06-07T12:00:00.000Z")으로 저장합니다.
 * 그런데 화면의 날짜 입력칸(datetime-local)은 "YYYY-MM-DDTHH:mm" 형식만 받습니다.
 * 그래서 DB 값을 입력칸에 보여주려면 형식을 바꿔줘야 합니다.
 *
 * @param iso - ISO 8601 날짜 문자열(없을 수 있어서 ? 가 붙음 = 선택적 매개변수)
 * @returns "YYYY-MM-DDTHH:mm" 형식의 로컬 기준 문자열. 입력이 없거나 잘못된 경우 ''
 * @부수효과 없음(순수 함수: 같은 입력이면 항상 같은 출력, 바깥 세상을 건드리지 않음)
 *
 * 동작: UTC 기준 toISOString() 결과를 타임존 오프셋만큼 보정하여 "로컬 시각"으로 맞춘 뒤
 *       앞 16자("YYYY-MM-DDTHH:mm")만 잘라낸다. 이렇게 해야 input에 사용자 로컬 시각이 표시된다.
 */
// ISO → datetime-local 입력값(YYYY-MM-DDTHH:mm, 로컬 기준)
const toLocalInput = (iso?: string): string => {
  if (!iso) return ''; // 값이 없으면(undefined·빈 문자열 등) 빈 문자열로 끝낸다 = 빈 입력칸
  const d = new Date(iso); // 문자열을 Date(날짜 객체)로 변환
  // isNaN(d.getTime()): 날짜로 해석할 수 없는 값이면 getTime()이 NaN(숫자 아님)이 됩니다.
  // "잘못된 날짜"인지 검사하는 흔한 방법입니다. 잘못됐으면 빈 문자열로 안전하게 끝냄.
  if (isNaN(d.getTime())) return '';
  // getTimezoneOffset()은 로컬과 UTC의 차이를 분 단위로 줍니다(한국은 -540분).
  // 60000을 곱해 밀리초로 바꾼 뒤 그만큼 빼서 시각을 로컬 기준으로 옮기고,
  // toISOString()으로 다시 문자열을 만든 다음 slice(0,16)으로 앞 16글자만 남깁니다.
  // 주의: 이 보정을 안 하면 입력칸에 UTC 시각이 떠서 한국 사용자에게 9시간 어긋나 보입니다.
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

/**
 * AdminAssignments
 *
 * 관리자 과제 관리 페이지 컴포넌트.
 * (컴포넌트 = 화면 한 덩어리를 만드는 함수. 이름 첫 글자를 대문자로 쓰는 게 약속입니다.)
 * @returns ReactElement - 과제 목록 표와 등록/수정 폼을 포함한 관리자 화면
 * @부수효과 - 마운트(화면에 처음 나타남) 시 Supabase에서 과제 목록을 조회하고, 폼 제출/삭제 시 DB를 변경한다.
 */
const AdminAssignments = (): ReactElement => {
  const { showToast } = useToast(); // 전역 토스트 알림 함수(어디서든 알림을 띄울 수 있게 해줌)

  // useState 사용법: const [값, 값을바꾸는함수] = useState(초기값)
  // 값을 바꿀 때는 반드시 "값을바꾸는함수"를 써야 React가 화면을 다시 그립니다.
  // 주의: assignments = [...] 처럼 직접 대입하면 화면이 갱신되지 않습니다. setAssignments(...)를 쓰세요.
  const [assignments, setAssignments] = useState<Assignment[]>([]); // 조회된 과제 목록(처음엔 빈 배열)
  const [loading, setLoading] = useState(true); // 목록 로딩 중 여부(처음엔 true: 불러오는 중)
  const [showForm, setShowForm] = useState(false); // 등록/수정 폼 표시 여부
  const [editingId, setEditingId] = useState<string | null>(null); // 수정 중인 과제 id(null이면 신규 등록 모드)
  const [form, setForm] = useState({ ...EMPTY }); // 폼 입력 상태(EMPTY 복사본으로 초기화)
  const [submitting, setSubmitting] = useState(false); // 폼 저장(등록/수정) 진행 중 여부(중복 클릭 방지용)

  /**
   * loadData
   * 과제 목록을 day_number 오름차순으로 조회하여 상태에 반영한다.
   * @returns Promise<void> (async 함수라 자동으로 Promise를 돌려줌. 반환값 자체는 없음)
   * @부수효과 - assignments/loading 상태 갱신, Supabase 조회 수행
   */
  const loadData = async () => {
    const client = getSupabase(); // DB에 명령을 보내는 도구(클라이언트)를 가져옴
    if (!client) { setLoading(false); return; } // 클라이언트 미준비 시 로딩만 끄고 종료
    // await: 데이터가 도착할 때까지 기다림. select('*')는 모든 칼럼 조회, .order('day_number')는 오름차순 정렬.
    // 결과는 { data, error } 형태로 오며, 여기서는 구조 분해 할당으로 data만 꺼내 씁니다.
    const { data } = await client.from(TABLES.assignments).select('*').order('day_number');
    // data as Assignment[]: "이 데이터를 Assignment 배열로 취급하라"는 타입 단언(TypeScript용).
    if (data) setAssignments(data as Assignment[]); // 데이터가 있을 때만 목록 갱신(null이면 그대로 둠)
    setLoading(false); // 다 불러왔으니 로딩 표시를 끔
  };
  // 마운트 시 1회 과제 목록 로드.
  // useEffect(함수, [의존성배열]): 의존성 배열이 비어 있으면([]) 처음 한 번만 실행됩니다.
  // 주의: [] 자체를 빼면 매 렌더마다 실행되어 무한 호출이 될 수 있습니다.
  useEffect(() => { loadData(); }, []);

  /**
   * resetForm
   * 폼을 초기 상태로 되돌리고 폼을 닫는다.
   * @부수효과 - form/editingId/showForm 상태 초기화
   */
  // { ...EMPTY }로 새 복사본을 넣어 폼을 비우고, editingId를 null(신규 모드), showForm을 false(닫힘)로.
  const resetForm = () => { setForm({ ...EMPTY }); setEditingId(null); setShowForm(false); };

  /**
   * startNew
   * "과제 등록" 버튼 동작. 신규 등록 폼을 연다.
   * @부수효과 - 폼 상태 변경
   *
   * 엣지케이스: 이미 신규 등록 폼이 열려 있는 상태(showForm && !editingId)에서 다시 누르면
   *            토글처럼 폼을 닫는다(resetForm). 그 외에는 빈 폼으로 새로 연다.
   *            (즉 이 버튼은 "열기/닫기"를 번갈아 하는 토글 역할을 겸합니다.)
   */
  const startNew = () => { if (showForm && !editingId) { resetForm(); return; } setForm({ ...EMPTY }); setEditingId(null); setShowForm(true); };

  /**
   * startEdit
   * 특정 과제를 수정 모드로 폼에 채운다.
   * @param a - 수정할 과제 객체(목록의 한 행에 해당하는 데이터)
   * @부수효과 - form/editingId/showForm 상태 변경, 화면 최상단으로 스크롤
   */
  const startEdit = (a: Assignment) => {
    setForm({
      // null 가능 필드는 기본값으로 대체하여 controlled input 경고를 방지한다.
      // controlled input: 입력칸의 값을 React 상태로 직접 통제하는 방식. 값이 null/undefined가 되면
      // React가 "통제 ↔ 비통제 전환" 경고를 냅니다.
      // a.description || '' : description이 비어 있으면(null 등) 대신 빈 문자열을 씁니다(|| = OR 기본값).
      title: a.title, description: a.description || '', category: a.category || 'general',
      // toLocalInput으로 DB의 ISO 마감일을 입력칸 형식으로 변환.
      // !!a.is_team : 값을 확실한 true/false(불리언)로 바꾸는 흔한 기법(!를 두 번).
      day_number: a.day_number, due_date: toLocalInput(a.due_date), max_score: a.max_score, is_team: !!a.is_team,
    });
    setEditingId(a.id); // 수정 대상 id를 기억(이 값이 있으면 저장 시 insert가 아니라 update를 함)
    setShowForm(true); // 폼을 화면에 표시
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 폼이 보이도록 화면 맨 위로 부드럽게 스크롤
  };

  /**
   * handleSubmit
   * 폼 제출 핸들러. editingId 유무에 따라 update(수정) 또는 insert(신규)를 수행한다.
   * @param e - 폼 제출 이벤트(브라우저가 폼 전송 시 전달하는 정보 객체)
   * @returns Promise<void>
   * @부수효과 - DB update/insert, 토스트 알림, 폼 리셋 및 목록 재조회, submitting 상태 토글
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 폼 제출 시 브라우저가 기본으로 하는 페이지 새로고침을 막음(JS로 직접 처리)
    setSubmitting(true); // 저장 시작 표시(버튼 비활성화 → 중복 제출 방지)
    try {
      const client = getSupabase();
      if (!client) throw new Error('Not ready'); // 클라이언트가 없으면 오류를 던져 아래 catch로 보냄
      // 저장할 데이터(payload)를 만듭니다. form을 펼쳐 복사(...form)한 뒤 due_date만 덮어씁니다:
      // 값이 있으면 입력칸 문자열을 ISO로 변환, 비었으면 null로 저장.
      // 주의: form을 직접 바꾸지 않고 새 객체를 만들어(불변성 유지) DB로 보냅니다.
      const payload = { ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : null };
      if (editingId) {
        // editingId가 있으면 "수정": id가 일치하는(.eq) 행만 update. 응답에서 error만 꺼내 검사.
        const { error } = await client.from(TABLES.assignments).update(payload).eq('id', editingId);
        if (error) throw error; // 오류가 있으면 던져서 catch로 이동
        showToast('과제가 수정되었습니다.', 'success');
      } else {
        // editingId가 없으면 "신규": 새 행을 insert.
        const { error } = await client.from(TABLES.assignments).insert(payload);
        if (error) throw error;
        showToast('과제가 등록되었습니다.', 'success');
      }
      resetForm();        // 성공 시 폼 닫기/초기화
      await loadData();   // 변경 사항을 화면에 반영하려고 목록을 다시 불러옴(재조회)
    } catch (err) {
      // 위에서 던진 어떤 오류든 여기서 잡아 사용자에게 메시지로 보여줍니다.
      // (err as Error).message : err를 Error 타입으로 보고 그 안의 메시지 문구를 꺼냄.
      showToast((err as Error).message, 'error');
    }
    finally { setSubmitting(false); } // finally는 성공/실패와 무관하게 항상 실행 → 버튼을 다시 살림
  };

  /**
   * handleDelete
   * 과제 삭제 핸들러. 확인 다이얼로그 후 해당 과제를 삭제한다.
   * @param id - 삭제할 과제 id
   * @returns Promise<void>
   * @부수효과 - DB delete, 토스트 알림, (수정 중이던 항목이면) 폼 리셋, 목록 재조회
   */
  const handleDelete = async (id: string) => {
    // confirm: 브라우저 기본 확인창. "확인"이면 true, "취소"면 false.
    // 사용자가 취소하면 return으로 함수를 즉시 끝내 삭제하지 않습니다(실수 방지).
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const client = getSupabase();
    if (!client) return; // 클라이언트 미준비 시 무동작
    // id가 일치하는(.eq) 행을 삭제. await로 삭제가 끝날 때까지 기다림.
    await client.from(TABLES.assignments).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    // 지운 항목이 지금 폼에서 수정 중이던 바로 그 항목이면, 더 이상 없으므로 폼을 정리(닫고 비움)합니다.
    if (editingId === id) resetForm();
    await loadData(); // 목록을 다시 불러와 삭제 결과를 화면에 반영
  };

  // 아래 return이 실제로 화면에 그려질 내용(JSX)입니다.
  // <> ... </>는 "프래그먼트": 여러 요소를 하나로 묶되 불필요한 div를 추가하지 않는 빈 껍데기 태그입니다.
  return (
    <>
      {/* 관리자 페이지 SEO 헤드: noindex로 검색엔진 색인 제외(관리자 화면은 검색 노출 불필요) */}
      <SEOHead title="과제 관리" path="/admin/assignments" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 상단 헤더: 제목 + 등록/취소 토글 버튼(신규 폼이 열려 있으면 '취소'로 표시).
              { 조건 ? A : B } 는 삼항 연산자: 조건이 참이면 A, 거짓이면 B를 보여줍니다. */}
          <div className="admin-header-row"><h2>과제 관리</h2><button className="btn btn-primary" onClick={startNew}>{showForm && !editingId ? '취소' : '과제 등록'}</button></div>

          {/* 등록/수정 폼: showForm이 true일 때만 렌더링.
              {조건 && (JSX)} 는 "조건이 참일 때만 뒤의 JSX를 그린다"는 흔한 패턴입니다. */}
          {showForm && (
            // onSubmit에 handleSubmit 연결: 폼 안에서 Enter를 누르거나 제출 버튼을 누르면 실행됨.
            <form onSubmit={handleSubmit} className="admin-form">
              {/* 폼 헤더: editingId 유무로 수정/신규 표시 전환 */}
              <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--primary-blue, #0046C8)' }}>{editingId ? <><EmojiIcon char="✏️" /> 과제 수정</> : <><EmojiIcon char="➕" /> 새 과제 등록</>}</div>
              <div className="form-row">
                {/* 제목(필수). value와 onChange가 짝을 이루는 controlled input입니다.
                    {...form, title: ...} : 기존 form을 복사하고 title만 새 값으로 바꿔 불변성을 지킵니다.
                    required: 비어 있으면 브라우저가 제출을 막아주는 HTML 기본 검증입니다. */}
                <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                {/* Day 번호: 입력칸의 값은 항상 문자열이라 Number(...)로 숫자로 변환해 상태에 저장, 최소 1 */}
                <div className="form-group"><label>Day</label><input type="number" value={form.day_number} onChange={e => setForm({...form, day_number: Number(e.target.value)})} min={1} /></div>
              </div>
              {/* 설명(필수). textarea는 여러 줄 입력칸, rows={3}은 기본 높이를 3줄로. */}
              <div className="form-group"><label>설명</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} required /></div>
              <div className="form-row">
                {/* 마감일: datetime-local 입력. 화면엔 로컬 시각으로 보이고, 제출 시 handleSubmit에서 ISO로 변환됨 */}
                <div className="form-group"><label>마감일</label><input type="datetime-local" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required /></div>
                {/* 배점: 숫자 변환, 최소 1 */}
                <div className="form-group"><label>배점</label><input type="number" value={form.max_score} onChange={e => setForm({...form, max_score: Number(e.target.value)})} min={1} /></div>
                {/* 팀 과제 여부 체크박스: 체크박스는 value가 아니라 checked로 켜짐/꺼짐을 다루고,
                    onChange에서는 e.target.checked(true/false)를 읽습니다. */}
                <div className="form-group"><label>팀 과제</label><input type="checkbox" checked={form.is_team} onChange={e => setForm({...form, is_team: e.target.checked})} /></div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* 제출 버튼: 진행 중 disabled로 비활성화(중복 제출 방지), 라벨은 진행/수정/등록 상태별 전환 */}
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '저장 중...' : editingId ? '수정 저장' : '등록'}</button>
                {/* 취소 버튼: type="button"으로 두어 폼 제출을 일으키지 않게 하고, 폼 초기화 및 닫기.
                    주의: 버튼의 기본 type은 "submit"이라, 폼 안 버튼은 의도가 다르면 꼭 type="button"을 지정해야 합니다. */}
                <button type="button" className="btn btn-secondary" onClick={resetForm}>취소</button>
              </div>
            </form>
          )}

          {/* 목록 영역: 로딩 중에는 스피너, 완료 후 표 렌더링(loading ? 스피너 : 표 형태의 삼항 연산자) */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Day</th><th>제목</th><th>유형</th><th>배점</th><th>마감일</th><th>관리</th></tr></thead>
                <tbody>
                  {/* 과제 목록(배열)을 .map으로 돌며 한 건당 표의 한 행(<tr>)을 만듭니다.
                      현재 수정 중인 행(editingId === a.id)은 옅은 배경색으로 강조합니다. */}
                  {assignments.map(a => (
                    // key={a.id}: 목록을 그릴 때 React가 각 항목을 구별하도록 주는 고유 식별자.
                    // 주의: key가 없거나 중복되면 React가 항목을 잘못 갱신할 수 있습니다. 보통 DB의 id를 씁니다.
                    <tr key={a.id} style={editingId === a.id ? { background: 'rgba(0,70,200,0.06)' } : undefined}>
                      {/* is_team 값(true/false)에 따라 '팀'/'개인' 유형 표시 */}
                      <td>{a.day_number}</td><td>{a.title}</td><td>{a.is_team ? '팀' : '개인'}</td>
                      {/* 마감일은 있으면 한국 로케일(ko-KR)로 표시, 없으면(null) '-' */}
                      <td>{a.max_score}</td><td>{a.due_date ? new Date(a.due_date).toLocaleString('ko-KR') : '-'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {/* 수정 버튼: 이 과제(a)를 폼에 로드. onClick={() => startEdit(a)} 처럼 화살표 함수로 감싸야
                            "클릭할 때" 실행됩니다.
                            주의: onClick={startEdit(a)} 라고 쓰면 렌더 즉시 실행돼 버립니다(괄호 호출 금지). */}
                        <button className="btn-secondary-sm" style={{ marginRight: '6px' }} onClick={() => startEdit(a)}>수정</button>
                        {/* 삭제 버튼: 확인 후 DB에서 제거. 마찬가지로 화살표 함수로 감싸 클릭 시점에 실행. */}
                        <button className="btn-danger-sm" onClick={() => handleDelete(a.id)}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 이 컴포넌트를 다른 파일(주로 라우터 설정)에서 가져다 쓸 수 있도록 기본 내보내기(default export) 합니다.
export default AdminAssignments;
