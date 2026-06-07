/**
 * AdminAnnouncements.tsx
 *
 * 역할:
 *   관리자(Admin) 영역의 "공지사항 관리" 페이지 컴포넌트.
 *   Supabase에 저장된 공지사항(announcements) 데이터를 조회/등록/삭제(CRUD 중 R·C·D)하는 화면을 제공한다.
 *
 * 핵심 책임:
 *   - Supabase에서 공지사항 목록을 불러와 상단 고정(is_pinned)·최신순으로 정렬해 표로 표시
 *   - 신규 공지 등록 폼(제목/내용/카테고리/상단고정) 제공 및 insert 처리
 *   - 공지 삭제(확인 후 delete) 처리
 *   - 작업 결과를 Toast로 사용자에게 피드백
 *
 * 주요 export:
 *   - default: AdminAnnouncements (React 함수형 컴포넌트)
 *
 * ───────────────────────────────────────────────────────────────────────────
 * [초보자를 위한 배경 지식]
 *
 * • React 컴포넌트란?
 *   화면의 한 조각(여기서는 "공지사항 관리 페이지" 전체)을 만들어 내는 함수다.
 *   이 함수가 JSX(아래 return 안의 HTML처럼 생긴 코드)를 돌려주면 React가 그걸 실제 화면으로 그려 준다.
 *
 * • CRUD란?
 *   데이터를 다루는 4가지 기본 동작. Create(생성)·Read(조회)·Update(수정)·Delete(삭제).
 *   이 파일은 그중 조회(R)·생성(C)·삭제(D) 세 가지를 담당한다(수정 기능은 없음).
 *
 * • Supabase란?
 *   클라우드에 있는 데이터베이스 + 인증 서비스. 코드에서 "client"를 통해 SQL 없이 메서드 호출만으로
 *   데이터를 읽고 쓸 수 있다. (예: client.from('테이블').select('*'))
 *
 * • RLS(Row Level Security, 행 수준 보안)란?
 *   Supabase(PostgreSQL)에서 "누가 어떤 행을 읽고/쓰고/지울 수 있는지"를 DB 서버 쪽에서 강제하는 규칙.
 *   즉, 화면 코드에서 막지 않아도 서버가 권한 없는 요청을 거부한다. 보안의 핵심 안전장치.
 *
 * • async/await란?
 *   네트워크 요청처럼 "결과가 나중에 오는" 작업을 다루는 문법. await를 붙이면 그 줄에서 결과가
 *   올 때까지 기다렸다가 다음 줄로 넘어간다. async 함수 안에서만 await를 쓸 수 있다.
 *
 * • Toast란?
 *   화면 구석에 잠깐 떴다 사라지는 알림 메시지(예: "등록되었습니다."). 사용자 피드백용.
 * ───────────────────────────────────────────────────────────────────────────
 */

// React에서 자주 쓰는 도구들을 가져온다.
//  - useState: 컴포넌트 안에서 "변하는 값(상태)"을 보관하는 훅(Hook).
//  - useEffect: 화면이 그려진 뒤(또는 특정 값이 바뀔 때) 실행할 동작을 등록하는 훅.
//  - type ReactElement / type FormEvent: '타입'만 가져온다는 표시(type 키워드).
//    TypeScript에서 "이 변수는 어떤 모양이어야 한다"를 알려주는 용도라 실제 코드 동작에는 영향이 없다.
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';   // 관리자 페이지 좌측 메뉴(사이드바) 컴포넌트.
import SEOHead from '../../components/SEOHead';             // <head> 태그(제목, 검색엔진 설정 등)를 관리하는 컴포넌트.
import { useAuth } from '../../contexts/AuthContext';       // 로그인 사용자 정보를 어디서나 꺼내 쓰게 해주는 훅.
import { useToast } from '../../contexts/ToastContext';     // 전역 Toast 알림을 띄우는 훅.
import getSupabase from '../../utils/supabase';             // Supabase 클라이언트(서버 연결 객체)를 얻는 함수.
import site from '../../config/site';                       // 사이트 설정값(테이블 접두사 등) 모음.
import type { Announcement } from '../../types';            // 공지사항 한 건의 데이터 형태를 정의한 타입.

// 사이트별 DB 테이블 접두사(site.dbPrefix)를 붙여 실제 announcements 테이블명을 구성한다.
// (예: 접두사가 'rest_'이면 'rest_announcements'). 멀티 프로젝트가 같은 Supabase를 공유할 때 충돌 방지용.
// 참고: `${...}`는 템플릿 리터럴(template literal). 백틱(`) 안에서 ${변수}로 값을 문자열에 끼워 넣는 문법.
const TABLES = { announcements: `${site.dbPrefix}announcements` };

/**
 * AdminAnnouncements
 *   공지사항 관리 페이지를 렌더링하는 컴포넌트.
 *
 * 매개변수: 없음
 * 반환값: ReactElement (관리자 레이아웃 + 등록 폼 + 공지 목록 테이블)
 * 부수효과: 마운트 시 Supabase에서 공지 목록 조회, 폼 제출/삭제 시 DB 쓰기 및 Toast 표시.
 *
 * 참고: '(): ReactElement =>' 부분은 "매개변수 없음(빈 괄호), 반환 타입은 ReactElement"라는 뜻의
 *       화살표 함수(arrow function) + TypeScript 타입 표기다.
 */
const AdminAnnouncements = (): ReactElement => {
  // 인증 컨텍스트에서 현재 로그인 사용자(user)와 프로필(profile) 정보 획득. 등록 시 작성자 정보로 사용.
  // 참고: '{ user, profile } ='는 구조 분해 할당(destructuring). 객체에서 필요한 속성만 골라 변수로 꺼내는 문법.
  const { user, profile } = useAuth();
  // 전역 Toast 표시 함수. showToast('메시지', '타입') 형태로 호출한다.
  const { showToast } = useToast();
  // 화면에 표시할 공지사항 목록 상태.
  //  - items: 현재 값(공지 배열), setItems: 이 값을 바꾸는 함수.
  //  - useState<Announcement[]>([])는 "Announcement들의 배열" 타입이고 초깃값은 빈 배열([]).
  //  - 주의: 상태를 바꿀 땐 반드시 setItems(...)를 써야 한다. items에 직접 대입하면 화면이 다시 그려지지 않는다.
  const [items, setItems] = useState<Announcement[]>([]);
  // 목록 로딩 중 여부(스피너 표시 제어). 처음엔 true(불러오는 중)로 시작한다.
  const [loading, setLoading] = useState(true);
  // 공지 등록 폼의 표시 여부 토글 상태. true면 폼을 보여 주고 false면 숨긴다.
  const [showForm, setShowForm] = useState(false);
  // 등록 폼 입력값 상태. 입력칸 4개를 하나의 객체로 묶어 관리한다. category 기본값은 'general'(일반).
  const [form, setForm] = useState({ title: '', content: '', category: 'general', is_pinned: false });
  // 폼 제출(insert) 진행 중 여부(중복 제출 방지 및 버튼 비활성화용).
  // 주의: 이 값이 없으면 사용자가 등록 버튼을 빠르게 여러 번 눌러 같은 공지가 중복 저장될 수 있다.
  const [submitting, setSubmitting] = useState(false);

  /**
   * loadData
   *   Supabase에서 공지사항 전체를 조회해 items 상태에 반영한다.
   *
   * 매개변수: 없음
   * 반환값: Promise<void> (async 함수라 자동으로 Promise를 반환. 따로 돌려주는 값은 없음)
   * 부수효과: items / loading 상태 갱신.
   * 비고: is_pinned 내림차순(고정 공지 먼저) → created_at 내림차순(최신 먼저) 순으로 정렬.
   *       Supabase 클라이언트가 없으면(미설정 등) 로딩만 해제하고 종료(엣지케이스).
   */
  const loadData = async () => {
    const client = getSupabase(); // 서버와 통신할 Supabase 연결 객체를 가져온다.
    // 클라이언트 미초기화 시 조기 반환(네트워크/설정 누락 방어).
    // 주의: 여기서 막지 않으면 아래 client.from(...) 에서 "null의 속성을 읽을 수 없음" 오류가 난다.
    if (!client) { setLoading(false); return; }
    // 고정 공지 우선 + 최신순 정렬로 전체 컬럼 조회.
    //  - from(테이블명): 어떤 테이블에서 가져올지 지정.
    //  - select('*'): 모든 컬럼(열)을 가져온다.
    //  - order('is_pinned', { ascending: false }): is_pinned 기준 내림차순(true→false), 즉 고정 공지가 위로.
    //  - .order('created_at', ...): 같은 고정 여부 안에서는 생성 시각이 최신인 것부터.
    //  - await: 서버 응답이 올 때까지 기다린 뒤 결과(data 등)를 받는다.
    const { data } = await client.from(TABLES.announcements).select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    // data가 있을 때만 상태에 반영. data as Announcement[] 는 "이 데이터를 Announcement 배열로 취급하라"는 타입 단언.
    if (data) setItems(data as Announcement[]);
    setLoading(false); // 조회가 끝났으니 로딩 상태 해제 → 스피너 대신 표가 보인다.
  };

  // 마운트 시 1회만 공지 목록을 로드한다(의존성 배열 빈 값).
  //  - useEffect(실행할함수, 의존성배열) 형태.
  //  - 두 번째 인자가 빈 배열([])이면 "이 컴포넌트가 처음 화면에 나타날 때 딱 한 번만" 실행된다.
  //  - 만약 []를 빼면 화면이 다시 그려질 때마다 매번 실행되어 무한 호출이 될 수 있으니 주의.
  useEffect(() => { loadData(); }, []);

  /**
   * handleSubmit
   *   등록 폼 제출 핸들러. 새 공지사항을 Supabase에 insert한다.
   *
   * 매개변수:
   *   - e: FormEvent — 폼 제출 이벤트(기본 동작 방지에 사용).
   * 반환값: Promise<void>
   * 부수효과: submitting 토글, DB insert, Toast 표시, 성공 시 폼 닫기·초기화·목록 재조회.
   * 인증/RLS: author_id에 현재 user.id를 넣어 RLS(작성자 기반 정책) 통과 및 소유권을 기록.
   */
  const handleSubmit = async (e: FormEvent) => {
    // e.preventDefault(): 폼을 제출하면 브라우저가 기본으로 페이지를 새로고침/이동하는데, 그 기본 동작을 막는다.
    // (막지 않으면 화면이 통째로 새로고침되어 React 상태가 다 날아간다.)
    e.preventDefault();
    setSubmitting(true); // 제출 시작 → 버튼 비활성화, 중복 제출 방지.
    try {
      const client = getSupabase();
      // 클라이언트 또는 로그인 사용자가 없으면 진행 불가(에러로 처리해 catch에서 Toast).
      // throw로 일부러 에러를 던지면 아래 catch 블록으로 흐름이 넘어간다.
      if (!client || !user) throw new Error('Not ready');
      // 폼 값에 작성자 식별/표시 정보를 합쳐 insert.
      //  - {...form, ...}: 스프레드(spread) 문법. form 객체의 모든 속성을 펼쳐 복사한 뒤 뒤의 속성을 덧붙인다.
      //  - author_id: user.id → 누가 썼는지 기록(RLS 정책에서 작성자 확인에 사용됨).
      //  - profile?.display_name: 옵셔널 체이닝(?.). profile이 null/undefined면 오류 없이 undefined를 돌려준다.
      //  - || '': display_name이 없을(빈 값일) 때 빈 문자열로 대체.
      const { error } = await client.from(TABLES.announcements).insert({ ...form, author_id: user.id, author_name: profile?.display_name || '' });
      if (error) throw error; // Supabase가 에러를 돌려주면 catch로 전달해 사용자에게 알린다.
      showToast('공지사항이 등록되었습니다.', 'success'); // 성공 알림.
      setShowForm(false); // 등록 성공 시 폼 닫기.
      // 입력값 초기화. 같은 객체 모양으로 다시 세팅해 다음 입력을 빈 폼에서 시작하게 한다.
      setForm({ title: '', content: '', category: 'general', is_pinned: false });
      await loadData(); // 방금 추가한 공지가 보이도록 목록을 다시 불러온다.
    } catch (err) { showToast((err as Error).message, 'error'); } // 모든 실패(연결 오류·권한 오류 등)는 에러 Toast로 통일.
    // finally: try/catch의 성공·실패와 무관하게 항상 실행되는 블록.
    finally { setSubmitting(false); } // 제출 상태 해제 → 버튼이 다시 활성화된다.
  };

  /**
   * handleDelete
   *   특정 공지사항을 삭제한다.
   *
   * 매개변수:
   *   - id: string — 삭제할 공지의 기본키 id.
   * 반환값: Promise<void>
   * 부수효과: 확인 다이얼로그 표시, DB delete, Toast 표시, 목록 재조회.
   * 엣지케이스: 사용자가 확인을 취소하거나 클라이언트가 없으면 아무 작업 없이 종료.
   */
  const handleDelete = async (id: string) => {
    // 실수 방지용 확인창. confirm은 [확인]을 누르면 true, [취소]를 누르면 false를 돌려준다.
    // !confirm(...) 이 true(=취소를 눌렀을 때)면 return으로 즉시 함수를 끝내 삭제하지 않는다.
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const client = getSupabase();
    if (!client) return; // 클라이언트 미초기화 방어.
    // id가 일치하는 행 삭제(RLS 정책에 따라 권한 없으면 서버에서 차단됨).
    //  - delete(): 삭제 동작.
    //  - .eq('id', id): "id 컬럼이 인자 id와 같은(equal) 행"만 대상으로 한다.
    //  - 주의: .eq 조건을 빠뜨리면 테이블 전체가 삭제될 수 있으니 매우 조심해야 한다.
    await client.from(TABLES.announcements).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    await loadData(); // 삭제된 결과가 화면에 반영되도록 목록을 다시 불러온다.
  };

  // 아래 return이 실제로 화면에 그려질 내용(JSX). HTML과 비슷하지만 JavaScript 표현식을 {} 안에 넣을 수 있다.
  return (
    // <> ... </>는 Fragment(빈 껍데기 태그). 여러 요소를 불필요한 div 없이 하나로 묶을 때 쓴다.
    <>
      {/* 검색엔진 비노출(noindex): 관리자 전용 페이지이므로 인덱싱 금지 */}
      <SEOHead title="공지사항 관리" path="/admin/announcements" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 헤더 영역: 제목 + 등록/취소 토글 버튼 (showForm 상태에 따라 라벨 전환) */}
          {/* onClick={() => setShowForm(!showForm)}: 버튼을 누르면 showForm 값을 반대로 뒤집어 폼을 열고/닫는다. */}
          {/* {showForm ? '취소' : '공지 등록'}: 삼항 연산자. showForm이 true면 '취소', 아니면 '공지 등록' 표시. */}
          <div className="admin-header-row"><h2>공지사항 관리</h2><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '공지 등록'}</button></div>

          {/* showForm이 true일 때만 등록 폼 렌더링 */}
          {/* {조건 && <JSX>}: 조건이 true면 뒤의 JSX를 그리고, false면 아무것도 안 그리는 흔한 패턴(조건부 렌더링). */}
          {showForm && (
            // onSubmit={handleSubmit}: 폼이 제출될 때(엔터/등록 버튼) 위에서 정의한 handleSubmit이 실행된다.
            <form onSubmit={handleSubmit} className="admin-form">
              {/* 제목 입력 (필수) */}
              {/* value={form.title} + onChange로 입력값을 상태와 동기화하는 '제어 컴포넌트(controlled component)' 방식. */}
              {/* setForm({...form, title: ...}): 기존 form을 복사하고 title만 바꾼 '새 객체'를 만들어 넣는다(불변성 유지). */}
              {/* 주의: 불변성 — 기존 form 객체를 직접 수정하지 않고 항상 새 객체로 교체해야 React가 변경을 감지한다. */}
              {/* required: 비어 있으면 브라우저가 제출을 막는 HTML 기본 검증. */}
              <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              {/* 내용 입력 (필수, 여러 줄) — textarea는 rows로 보이는 줄 수를 지정. */}
              <div className="form-group"><label>내용</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={5} required /></div>
              <div className="form-row">
                {/* 카테고리 선택: 일반/중요/일정 (select의 value가 현재 선택값) */}
                <div className="form-group"><label>카테고리</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="general">일반</option><option value="important">중요</option><option value="schedule">일정</option>
                  </select>
                </div>
                {/* 상단 고정 여부 체크박스 (is_pinned) */}
                {/* 체크박스는 value가 아니라 checked로 상태를 표현하고, e.target.checked(true/false)로 값을 읽는다. */}
                <div className="form-group"><label>상단 고정</label><input type="checkbox" checked={form.is_pinned} onChange={e => setForm({...form, is_pinned: e.target.checked})} /></div>
              </div>
              {/* 제출 버튼: 제출 중에는 비활성화 및 라벨 변경 */}
              {/* disabled={submitting}: 제출 중이면 버튼을 눌러도 동작하지 않게 막아 중복 제출을 방지. */}
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </form>
          )}

          {/* 로딩 중이면 스피너, 아니면 공지 목록 테이블 표시 (삼항 연산자로 둘 중 하나만 그린다) */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>고정</th><th>제목</th><th>카테고리</th><th>작성자</th><th>등록일</th><th>관리</th></tr></thead>
                <tbody>
                  {/* 공지 목록을 행으로 매핑. items.map(...)은 배열의 각 항목을 <tr>로 변환해 여러 행을 만든다. */}
                  {/* key={a.id}: 목록을 그릴 때 React가 각 항목을 구분하는 고유 식별자. 빠른 갱신을 위해 필요하다. */}
                  {/* 주의: key는 형제들 사이에서 유일해야 한다. 배열 index보다 변하지 않는 고유 id 사용을 권장. */}
                  {items.map(a => (
                    <tr key={a.id}>
                      {/* 고정 공지면 📌 아이콘 표시, 아니면 빈칸 (삼항 연산자) */}
                      <td>{a.is_pinned ? '📌' : ''}</td><td>{a.title}</td><td>{a.category}</td>
                      {/* 등록일은 한국 로케일 날짜 형식으로 표시 */}
                      {/* new Date(문자열): DB의 날짜 문자열을 Date 객체로 변환. toLocaleDateString('ko-KR')로 한국식 날짜 표기. */}
                      <td>{a.author_name}</td><td>{new Date(a.created_at).toLocaleDateString('ko-KR')}</td>
                      {/* 삭제 버튼: 해당 공지 id로 handleDelete 호출 */}
                      {/* onClick={() => handleDelete(a.id)}: 화살표 함수로 감싸야 '클릭할 때' 호출된다. */}
                      {/* 주의: onClick={handleDelete(a.id)} 처럼 쓰면 렌더링 시 즉시 실행되어 버린다(흔한 실수). */}
                      <td><button className="btn-danger-sm" onClick={() => handleDelete(a.id)}>삭제</button></td>
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

export default AdminAnnouncements;
