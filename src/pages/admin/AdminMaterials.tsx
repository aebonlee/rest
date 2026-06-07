/**
 * AdminMaterials.tsx
 *
 * 역할:
 *   - 관리자 전용 "자료 관리" 페이지 컴포넌트.
 *   - 강의 자료(Material) 목록 조회, 신규 등록, 삭제 기능을 제공한다.
 *
 * 핵심 책임:
 *   - Supabase의 materials 테이블에서 자료 목록을 day_number/created_at 기준으로 로드.
 *   - 폼을 통해 새 자료를 등록(insert)하고, 작성자(author_id)를 현재 로그인 사용자로 기록.
 *   - 테이블의 각 행에서 자료를 삭제(delete).
 *   - 로딩/제출 상태 및 폼 표시 여부 등 UI 상태 관리, 토스트로 사용자 피드백 제공.
 *
 * 주요 export:
 *   - default export: AdminMaterials (React 함수형 컴포넌트)
 *
 * ── 초보자를 위한 배경 지식 ──────────────────────────────────────────────
 *  • React 컴포넌트: 화면의 한 조각을 만드는 "함수"다. JSX(HTML처럼 생긴 문법)를
 *    반환하면 React가 그것을 실제 화면(DOM)으로 그려준다.
 *  • 상태(state): 시간이 지나며 바뀌는 값(예: 입력칸 내용, 로딩 여부).
 *    state가 바뀌면 React가 컴포넌트를 "다시 그려서" 화면을 자동으로 갱신한다.
 *  • Supabase: 클라우드 데이터베이스 + 인증 서비스. 여기서는 자료를 저장/조회하는
 *    DB로 쓴다. SQL을 직접 쓰지 않고 .from().select() 같은 메서드 체인으로 다룬다.
 *  • RLS(Row Level Security, 행 수준 보안): DB가 "이 행을 이 사용자가 읽거나 바꿀 수
 *    있는가?"를 행 단위로 검사하는 규칙. 그래서 로그인/작성자 정보가 중요하다.
 *  • async/await: 시간이 걸리는 작업(네트워크 통신 등)을 "기다렸다가" 다음 줄로
 *    넘어가게 해 주는 문법. await가 붙은 함수는 반드시 async 함수 안에 있어야 한다.
 *  • 토스트(toast): 화면 구석에 잠깐 떴다 사라지는 알림 메시지.
 * ────────────────────────────────────────────────────────────────────────
 */

// ── import: 다른 파일에서 만들어 둔 기능들을 가져온다 ──
// React의 핵심 훅(useState/useEffect)과 "타입"만 가져오는 type import.
// (type import는 빌드 결과물에 코드로 남지 않고 타입 검사에만 쓰인다.)
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';   // 관리자 좌측 메뉴
import SEOHead from '../../components/SEOHead';             // <head> 메타태그 설정용
import { useAuth } from '../../contexts/AuthContext';       // 로그인 사용자 정보 훅
import { useToast } from '../../contexts/ToastContext';     // 알림(토스트) 표시 훅
import getSupabase from '../../utils/supabase';             // Supabase 클라이언트 생성 함수
import site from '../../config/site';                       // 사이트 설정(접두사 등)
import type { Material } from '../../types';                // 자료 1건의 데이터 형태(타입)

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 테이블명을 구성.
// 여러 프로젝트가 동일 Supabase를 공유할 때 테이블 충돌을 방지하기 위함.
// 주의: `${...}`는 템플릿 리터럴(백틱 문자열)로, 변수 값을 문자열에 끼워 넣는 문법이다.
//       예: dbPrefix가 "rest_"라면 결과는 "rest_materials"가 된다.
const TABLES = { materials: `${site.dbPrefix}materials` };

/**
 * AdminMaterials
 *   - 관리자 자료 관리 화면을 렌더링하는 함수형 컴포넌트.
 *   - 매개변수: 없음.
 *   - 반환값: ReactElement (전체 페이지 레이아웃 + 등록 폼 + 자료 테이블).
 *   - 부수효과: 마운트 시 자료 목록을 비동기로 로드하고, 등록/삭제 시 DB를 변경한다.
 *     (부수효과 = 화면을 그리는 것 외에 외부 세계를 건드리는 일. 여기선 DB 통신.)
 */
const AdminMaterials = (): ReactElement => {
  // ── 훅(hook) 호출 영역 ──
  // 훅은 React 기능을 함수 컴포넌트에서 쓰게 해 주는 특수 함수다(이름이 use~).
  // 주의: 훅은 항상 컴포넌트 "최상단"에서, 조건문/반복문 없이 호출해야 한다.

  // 현재 로그인한 사용자 정보(등록 시 author_id로 사용). 로그인 안 했으면 보통 null.
  const { user } = useAuth();
  // 성공/실패 알림 토스트 표시 함수.
  const { showToast } = useToast();

  // useState: [현재값, 값을 바꾸는 함수] 한 쌍을 돌려준다.
  // <Material[]>는 "이 상태는 Material 객체들의 배열"이라는 TypeScript 타입 표기.
  // 조회된 자료 목록 상태(처음엔 빈 배열).
  const [materials, setMaterials] = useState<Material[]>([]);
  // 초기 로딩 및 재조회 시의 로딩 표시 상태(처음엔 true → 스피너 표시).
  const [loading, setLoading] = useState(true);
  // 등록 폼 표시 여부 토글 상태(true면 폼이 보임).
  const [showForm, setShowForm] = useState(false);
  // 등록 폼의 입력값 상태(초기값 = 빈 폼 / 기본 카테고리·파일타입·Day).
  // 주의: 여러 입력칸을 하나의 객체로 묶어서 관리한다(필드별로 useState 안 만들고).
  const [form, setForm] = useState({ title: '', description: '', category: 'ai_basic', file_url: '', file_type: 'pdf', file_size: 0, day_number: 1 });
  // 폼 제출(insert) 진행 중 여부(버튼 중복 클릭 방지·문구 변경용).
  const [submitting, setSubmitting] = useState(false);

  /**
   * loadMaterials
   *   - materials 테이블에서 전체 자료를 조회해 상태에 반영한다.
   *   - 매개변수: 없음.
   *   - 반환값: Promise<void> (async 함수는 항상 Promise를 반환한다).
   *   - 부수효과: setMaterials, setLoading 상태 갱신.
   *   - 정렬: day_number 오름차순 → created_at 내림차순(같은 Day 내 최신 자료 우선).
   */
  const loadMaterials = async () => {
    // Supabase와 통신할 "클라이언트" 객체를 얻는다(환경설정이 없으면 null일 수 있음).
    const client = getSupabase();
    // Supabase 클라이언트가 없으면(미초기화 등) 로딩만 종료하고 조회를 건너뜀.
    // 주의: 이 가드(방어 코드)가 없으면 아래에서 null.from(...) 호출로 에러가 난다.
    if (!client) { setLoading(false); return; }
    // await: 서버 응답이 올 때까지 기다린 뒤 결과를 받는다.
    //   .from(테이블) → 어떤 테이블을, .select('*') → 모든 컬럼을 가져와라.
    //   .order('day_number') → Day 번호 오름차순(기본값)으로 정렬.
    //   .order('created_at', { ascending: false }) → 같은 Day 안에서는 최신순(내림차순).
    //   { data } 는 구조 분해 할당: 응답 객체에서 data 속성만 꺼내 쓴다.
    const { data } = await client.from(TABLES.materials).select('*').order('day_number').order('created_at', { ascending: false });
    // 데이터가 있을 때만 목록 갱신(에러로 data가 null인 경우 기존 목록 유지).
    // as Material[] 는 "이 데이터를 Material 배열로 간주하라"는 타입 단언.
    if (data) setMaterials(data as Material[]);
    // 성공/실패와 무관하게 로딩 종료(스피너 숨김).
    setLoading(false);
  };

  // useEffect: 컴포넌트가 화면에 나타난 뒤 "부수효과"를 실행하는 훅.
  // 두 번째 인자(의존성 배열)가 빈 [] 이면 → 처음 마운트될 때 딱 1번만 실행.
  // 주의: 여기서 데이터를 불러오므로, 빈 배열이 아니면 불필요하게 반복 호출될 수 있다.
  useEffect(() => { loadMaterials(); }, []);

  /**
   * handleSubmit
   *   - 등록 폼 제출 핸들러. 폼 내용을 materials 테이블에 insert한다.
   *   - 매개변수: e (FormEvent) — 기본 제출 동작(새로고침) 방지에 사용.
   *   - 반환값: Promise<void>.
   *   - 부수효과: DB insert, 토스트 표시, 폼 닫기·초기화, 목록 재조회, submitting 상태 갱신.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 폼 기본 제출(페이지 리로드) 방지. 안 하면 화면이 새로고침된다.
    setSubmitting(true); // 제출 시작 → 버튼 비활성화/문구 변경에 사용.
    // try/catch/finally: 에러가 나도 앱이 죽지 않게 감싸고, 끝에 정리 작업을 보장한다.
    try {
      const client = getSupabase();
      // 클라이언트 또는 로그인 사용자가 없으면 등록 불가(RLS상 author_id 필요).
      // throw로 에러를 던지면 즉시 아래 catch 블록으로 점프한다.
      if (!client || !user) throw new Error('Not ready');
      // 폼 값에 author_id(현재 사용자)를 합쳐 새 행 삽입.
      // { ...form, author_id: user.id } : 스프레드(...)로 form의 모든 필드를 복사한 새
      //   객체를 만들고 author_id를 덧붙인다(원본 form은 그대로 두는 불변성 방식).
      const { error } = await client.from(TABLES.materials).insert({ ...form, author_id: user.id });
      // Supabase는 실패해도 throw하지 않고 error 속성에 담아 주므로 직접 확인 후 던진다.
      if (error) throw error;
      showToast('자료가 등록되었습니다.', 'success');
      setShowForm(false); // 등록 성공 시 폼 닫기.
      // 폼을 초기 기본값으로 리셋(다음 등록을 깨끗한 상태에서 시작).
      setForm({ title: '', description: '', category: 'ai_basic', file_url: '', file_type: 'pdf', file_size: 0, day_number: 1 });
      await loadMaterials(); // 방금 추가된 자료까지 반영되도록 최신 목록으로 갱신.
    } catch (err) {
      // 인증/RLS/네트워크 등 모든 오류를 토스트로 표시.
      // (err as Error): err 타입이 unknown이라 Error로 단언해 .message에 접근한다.
      showToast((err as Error).message, 'error');
    } finally {
      // 성공/실패와 무관하게 제출 상태 해제(버튼 다시 활성화).
      setSubmitting(false);
    }
  };

  /**
   * handleDelete
   *   - 지정한 id의 자료를 삭제한다.
   *   - 매개변수: id (string) — 삭제할 자료의 PK(기본 키, 각 행의 고유 식별자).
   *   - 반환값: Promise<void>.
   *   - 부수효과: 사용자 확인(confirm) 후 DB delete, 토스트 표시, 목록 재조회.
   */
  const handleDelete = async (id: string) => {
    // 실수 삭제 방지를 위한 확인창. 취소를 누르면 confirm이 false → 즉시 함수 종료.
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const client = getSupabase();
    if (!client) return; // 클라이언트 없으면 아무 것도 하지 않고 종료(방어 코드).
    // id가 일치하는 단일 행 삭제(RLS 정책에 따라 권한 검증됨).
    // .eq('id', id) : "id 컬럼이 인자 id와 같은(equal) 행"이라는 조건 필터.
    // 주의: .eq 같은 조건을 빼면 테이블 전체가 삭제될 수 있으니 항상 조건을 명시!
    await client.from(TABLES.materials).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    await loadMaterials(); // 삭제 결과를 화면에 반영하도록 목록 재조회.
  };

  // ── 화면(JSX) 반환 ──
  // <> ... </> 는 Fragment: 여러 요소를 "보이지 않는 한 겹"으로 묶는 용도.
  //   컴포넌트는 하나의 최상위 요소만 반환할 수 있어서 이렇게 묶는다.
  return (
    <>
      {/* 검색엔진 비노출(noindex) 관리자 페이지용 SEO 헤드.
          noindex: 구글 등 검색엔진이 이 페이지를 색인하지 말라는 표시(관리자 화면이므로). */}
      <SEOHead title="자료 관리" path="/admin/materials" noindex />
      <div className="admin-layout">
        {/* 관리자 좌측 네비게이션 사이드바 */}
        <AdminSidebar />
        <div className="admin-content">
          <div className="admin-header-row">
            <h2>자료 관리</h2>
            {/* 등록 폼 표시/숨김 토글 버튼.
                onClick에서 !showForm(현재값의 반대)로 바꿔 켜고 끄기를 반복한다.
                삼항연산자 (조건 ? A : B): showForm이 true면 '취소', 아니면 '자료 등록' 표시. */}
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '자료 등록'}</button>
          </div>

          {/* showForm && (...) : showForm이 true일 때만 뒤의 폼을 렌더링.
              (false면 아무 것도 안 그려진다. JSX에서 흔한 "조건부 렌더링" 패턴) */}
          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                {/* 제목(required: 비우면 제출 불가).
                    "제어 컴포넌트": value를 state(form.title)와 묶고, onChange로 state를
                    갱신한다. 입력칸의 진짜 값은 항상 state가 가지고 있는 구조다.
                    {...form, title: ...} : 기존 form을 복사하고 title만 바꾼 새 객체로 교체. */}
                <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                {/* Day 번호(1~20 범위, 숫자형으로 변환하여 저장).
                    주의: input 값은 항상 문자열이라 Number(...)로 숫자로 변환해야 DB 타입과 맞는다. */}
                <div className="form-group"><label>Day</label><input type="number" value={form.day_number} onChange={e => setForm({...form, day_number: Number(e.target.value)})} min={1} max={20} /></div>
              </div>
              {/* 설명(선택, 멀티라인). textarea는 여러 줄 입력용 입력칸. */}
              <div className="form-group"><label>설명</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
              <div className="form-row">
                <div className="form-group"><label>카테고리</label>
                  {/* 자료 분류 선택. value는 DB 저장값(영문 코드), 화면 표시는 한글 라벨.
                      select의 value가 form.category와 같은 option이 자동으로 선택된다. */}
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="prerequisite">선수과정</option><option value="ai_basic">AI기본</option><option value="llm_practice">LLM실습</option>
                    <option value="automation">자동화</option><option value="planning">기획</option><option value="design">설계</option>
                    <option value="implementation">구현</option><option value="debugging">디버깅</option><option value="coaching">코칭</option>
                  </select>
                </div>
                {/* 파일 URL(type="url"이라 브라우저가 URL 형식을 기본 검증해 준다). */}
                <div className="form-group"><label>파일 URL</label><input type="url" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} /></div>
              </div>
              {/* 제출 버튼: 제출 중(submitting)에는 disabled로 비활성화 + 문구 변경.
                  → 사용자가 같은 자료를 두 번 등록(중복 클릭)하는 것을 막는다. */}
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </form>
          )}

          {/* 로딩 중에는 스피너, 완료 후에는 자료 테이블 표시(삼항연산자로 분기). */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Day</th><th>제목</th><th>카테고리</th><th>등록일</th><th>관리</th></tr></thead>
                <tbody>
                  {/* 조회된 자료 목록을 .map으로 한 건씩 <tr>(표의 한 행)로 변환해 렌더링.
                      key={m.id}: React가 각 행을 구별하는 고유 식별자(목록 렌더링 시 필수).
                      주의: key를 배열 index로 쓰면 정렬/삭제 시 버그가 생기기 쉬우니 고유 id 사용. */}
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td>{m.day_number}</td><td>{m.title}</td><td>{m.category}</td>
                      {/* 생성일(문자열)을 Date 객체로 만든 뒤 한국어 로캘 날짜 형식으로 표시.
                          예: 2026. 6. 7. 형태. */}
                      <td>{new Date(m.created_at).toLocaleDateString('ko-KR')}</td>
                      {/* 해당 행 자료 삭제 버튼.
                          주의: onClick={handleDelete(m.id)} 처럼 쓰면 렌더링 즉시 실행돼 버린다.
                          그래서 () => handleDelete(m.id) 형태로 "클릭 시 호출할 함수"를 넘긴다. */}
                      <td><button className="btn-danger-sm" onClick={() => handleDelete(m.id)}>삭제</button></td>
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

// 이 컴포넌트를 다른 파일(라우터 등)에서 import해 쓸 수 있도록 기본 내보내기.
export default AdminMaterials;
