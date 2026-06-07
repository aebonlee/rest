/**
 * QnA.tsx — 수업 관련 질문/답변(Q&A) 페이지 컴포넌트
 *
 * [이 파일이 무엇인가? 한 줄 요약]
 *   수강생이 질문을 올리고, 관리자(선생님)가 답변을 다는 "게시판 화면"을 그리는 파일이다.
 *
 * [초보자를 위한 배경 지식]
 *   - React 컴포넌트: 화면의 한 부분을 만드는 함수다. 이 함수가 JSX(HTML처럼 생긴 코드)를
 *     반환하면, React가 그것을 진짜 화면(DOM)으로 그려준다.
 *   - "페이지 컴포넌트": 한 화면(=URL 한 개, 여기서는 /qna)을 통째로 담당하는 큰 컴포넌트를 말한다.
 *   - Supabase: 클라우드에 있는 데이터베이스 + 인증 서비스다. 우리는 코드에서 Supabase에
 *     "이 테이블의 글 목록 줘", "이 글 새로 저장해줘" 같은 요청을 보낸다.
 *   - CRUD: 데이터 다루는 4가지 기본 동작. Create(생성)/Read(조회)/Update(수정)/Delete(삭제).
 *     이 파일은 그중 생성(질문 등록)/조회(목록 보기)/수정(답변 달기)을 사용한다.
 *
 * 이 파일의 역할:
 *   - 수강생이 질문을 등록하고, 관리자가 답변을 다는 Q&A 게시판 화면을 렌더링한다.
 *   - Supabase의 `{dbPrefix}qna` 테이블을 직접 읽고 쓰는 CRUD(생성/조회/답변 업데이트) 흐름을 담당.
 *
 * 핵심 책임:
 *   - 질문 목록 조회(최신순) 및 로딩 상태 관리.
 *   - 로그인 사용자의 질문 등록(insert).
 *   - 관리자(isAdmin)의 답변 등록(update: reply_content, replied_at, is_resolved 등).
 *   - 등록/답변 결과를 Toast로 사용자에게 피드백.
 *     (Toast = 화면 구석에 잠깐 떴다 사라지는 작은 알림 메시지)
 *
 * 주요 export:
 *   - default: QnA (React 페이지 컴포넌트)
 *
 * 인증/권한(RLS) 참고:
 *   - 질문 등록은 로그인 사용자(user) 필요. author_id에 user.id를 기록한다.
 *   - 답변 영역은 isAdmin 사용자에게만 노출되며, 실제 쓰기 권한은 Supabase RLS 정책으로 보장된다.
 *
 * [용어: RLS(Row Level Security, 행 수준 보안)]
 *   - 데이터베이스 쪽에서 "누가 어떤 행(데이터)을 읽고 쓸 수 있는지"를 강제하는 규칙이다.
 *   - 주의: 화면에서 답변 버튼을 숨기는 것(isAdmin 체크)만으로는 진짜 보안이 아니다.
 *     누군가 코드를 우회해 요청을 보낼 수도 있기 때문이다. 그래서 DB의 RLS가 최종 방어선이 된다.
 *     즉 "UI 숨김 + RLS"의 이중 보호 구조다.
 */

// React에서 자주 쓰는 도구들을 불러온다(import = 다른 파일의 기능을 가져오기).
//   - useState : 컴포넌트가 기억해야 할 "변하는 값(상태)"을 만든다.
//   - useEffect: 특정 시점(예: 화면이 처음 뜰 때)에 코드를 실행하게 해준다.
//   - type ReactElement / type FormEvent: "타입"만 가져오는 것(TypeScript용 설명표).
//       JSX 결과물의 타입(ReactElement), 폼 제출 이벤트의 타입(FormEvent)을 가리킨다.
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';    // 로그인 사용자/권한 정보를 꺼내 쓰는 훅
import { useToast } from '../contexts/ToastContext';  // 알림 메시지를 띄우는 훅
import SEOHead from '../components/SEOHead';           // 페이지 <head> 메타정보(제목 등) 설정 컴포넌트
import getSupabase from '../utils/supabase';          // Supabase 연결 객체를 얻는 함수
import site from '../config/site';                    // 사이트 설정값(접두사 등)
import type { QnAItem } from '../types';              // 질문 한 건의 데이터 모양(타입) 정의

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 Q&A 테이블명을 구성한다.
// (여러 사이트가 같은 Supabase 인스턴스를 공유할 때 테이블 충돌 방지)
//   예) dbPrefix가 'rest_' 이면 실제 테이블명은 'rest_qna' 가 된다.
//   `${...}` 는 템플릿 리터럴: 백틱(`) 문자열 안에 변수 값을 끼워 넣는 문법이다.
const TABLES = { qna: `${site.dbPrefix}qna` };

/**
 * QnA — Q&A 게시판 페이지 컴포넌트
 *
 * 매개변수: 없음
 * 반환값: ReactElement (Q&A 헤더 + 질문 등록 폼 + 질문/답변 목록)
 * 부수효과:
 *   - 마운트 시 Supabase에서 질문 목록을 조회한다(loadItems).
 *     ("마운트" = 컴포넌트가 화면에 처음 나타나는 순간)
 *   - 질문 등록/답변 등록 시 DB 쓰기 및 Toast 알림 발생.
 */
const QnA = (): ReactElement => {
  // 인증 컨텍스트: 현재 사용자, 프로필(표시 이름 등), 관리자 여부.
  //   (구조 분해 할당: 객체에서 user, profile, isAdmin 세 값만 꺼내 변수로 만든다.)
  const { user, profile, isAdmin } = useAuth();
  // 토스트 알림 트리거 함수. showToast('메시지', '종류') 형태로 호출한다.
  const { showToast } = useToast();

  // --- 아래는 모두 useState로 만든 "상태"들이다. ---
  // useState 개념: const [값, 값을바꾸는함수] = useState(초기값)
  //   - 상태 값을 바꿀 때는 반드시 "바꾸는 함수"(예: setItems)를 써야 한다.
  //   - 주의: 변수에 직접 대입(items = ...)하면 화면이 다시 그려지지 않는다.
  //     setItems(...)를 호출해야 React가 "값이 바뀌었네" 하고 화면을 갱신한다.
  const [items, setItems] = useState<QnAItem[]>([]);   // 조회된 질문 목록 (QnAItem 배열)
  const [loading, setLoading] = useState(true);        // 목록 로딩 중 여부 (처음엔 true=로딩중)
  const [showForm, setShowForm] = useState(false);     // 질문 등록 폼 표시 여부
  const [title, setTitle] = useState('');              // 질문 제목 입력값
  const [content, setContent] = useState('');          // 질문 내용 입력값
  const [category, setCategory] = useState('general'); // 질문 카테고리(기본: 일반)
  const [submitting, setSubmitting] = useState(false); // 질문 등록 처리 중 여부(중복 제출 방지)
  const [replyingId, setReplyingId] = useState<string | null>(null); // 현재 답변 작성 중인 질문 id(null이면 미작성)
  const [replyContent, setReplyContent] = useState(''); // 답변 입력값

  /**
   * loadItems — Q&A 목록을 Supabase에서 조회하여 상태에 반영한다.
   *
   * 매개변수: 없음
   * 반환값: Promise<void> (async 함수라 자동으로 Promise를 반환. 반환 데이터는 없음)
   * 부수효과: items / loading 상태 갱신.
   * 엣지케이스: Supabase 클라이언트가 없으면(미초기화) 로딩만 해제하고 조기 반환.
   *
   * [async/await 개념]
   *   - 네트워크 요청(DB 조회)은 시간이 걸린다. async 함수 안에서 await를 쓰면
   *     "이 줄의 결과가 올 때까지 기다렸다가" 다음 줄로 넘어간다. (화면은 멈추지 않음)
   */
  const loadItems = async () => {
    const client = getSupabase();
    // client가 null/undefined일 수 있으므로 먼저 확인한다.
    // 없으면 더 진행할 수 없으니 로딩 표시만 끄고 함수를 즉시 끝낸다(조기 반환).
    if (!client) { setLoading(false); return; }
    // created_at 내림차순(최신 글이 위)으로 전체 컬럼 조회.
    //   - .from(테이블명): 어느 테이블을 다룰지 지정
    //   - .select('*'): 모든 컬럼(*)을 가져온다
    //   - .order('created_at', { ascending: false }): 작성시각 기준 내림차순(최신→과거)
    //   - await: 결과가 올 때까지 기다림. 결과 객체에서 data만 구조 분해로 꺼낸다.
    const { data } = await client.from(TABLES.qna).select('*').order('created_at', { ascending: false });
    // data가 있을 때만 상태에 넣는다. (as QnAItem[]: TS에게 "이건 QnAItem 배열이야"라고 알려주는 타입 단언)
    if (data) setItems(data as QnAItem[]);
    setLoading(false); // 조회가 끝났으니 로딩 표시 끄기.
  };

  // 최초 마운트 시 한 번만 질문 목록을 로드한다(의존성 배열 빈 값).
  //   [useEffect 개념] useEffect(실행할함수, 의존성배열)
  //     - 의존성 배열 []가 "비어 있으면" → 화면이 처음 뜰 때 딱 한 번만 실행된다.
  //     - 만약 배열 안에 어떤 값을 넣으면, 그 값이 바뀔 때마다 다시 실행된다.
  //   주의: 여기서 [] 대신 의존성을 빠뜨리면(=두 번째 인자 자체를 안 쓰면)
  //         매 렌더마다 실행돼 무한 조회가 일어날 수 있다.
  useEffect(() => { loadItems(); }, []);

  /**
   * handleSubmit — 질문 등록 폼 제출 핸들러.
   *
   * 매개변수:
   *   - e: FormEvent (폼 제출 이벤트; 기본 새로고침 방지에 사용)
   * 반환값: Promise<void>
   * 부수효과: qna 테이블 insert, 입력값/폼 상태 초기화, 목록 재조회, Toast 알림.
   * 엣지케이스: 제목/내용이 공백이면 등록하지 않음. 클라이언트/사용자 미준비 시 에러 처리.
   */
  const handleSubmit = async (e: FormEvent) => {
    // 주의: HTML 폼은 제출되면 기본적으로 페이지를 새로고침한다.
    //       preventDefault()로 그 기본 동작을 막아야 우리가 직접 DB에 저장할 수 있다.
    e.preventDefault();
    // 공백만 입력된 경우는 유효하지 않은 질문으로 보고 무시.
    //   .trim()은 앞뒤 공백을 제거한다. 빈 문자열('')은 거짓(falsy)이므로 !로 뒤집어 검사.
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true); // 제출 시작 → 버튼 잠금(아래 finally에서 다시 풀어준다)
    try {
      const client = getSupabase();
      // 클라이언트 또는 로그인 사용자가 없으면 등록 불가(RLS상 author_id 필요).
      //   throw로 에러를 던지면 아래 catch 블록으로 점프한다.
      if (!client || !user) throw new Error('Not ready');
      // insert: 새 행(질문 한 건)을 테이블에 추가한다. 결과에서 error만 꺼내 확인.
      const { error } = await client.from(TABLES.qna).insert({
        title: title.trim(), content: content.trim(), category,
        // author_name: 표시 이름 우선, 없으면 name, 둘 다 없으면 빈 문자열.
        //   ?.(옵셔널 체이닝): profile이 null/undefined여도 에러 없이 undefined를 돌려준다.
        //   ||(논리 OR): 앞 값이 비어 있으면(falsy) 다음 값을 쓴다 → 빈 칸 방지용 단계적 대체.
        author_id: user.id, author_name: profile?.display_name || profile?.name || '',
      });
      // Supabase는 실패해도 예외를 던지지 않고 error 필드에 담아 돌려주는 경우가 많다.
      // 그래서 직접 검사해 error가 있으면 던져서 catch로 보낸다.
      if (error) throw error;
      showToast('질문이 등록되었습니다.', 'success');
      // 등록 성공 시 입력값과 폼을 초기화하고 목록을 새로고침.
      setTitle(''); setContent(''); setShowForm(false);
      // await: 새로 추가한 글이 포함된 최신 목록을 다시 받아온 뒤 끝낸다.
      await loadItems();
    } catch (err) {
      // 에러 메시지가 있으면 노출, 없으면 기본 실패 문구.
      //   (err as Error): TS에게 err를 Error 타입으로 보겠다고 알려 .message에 접근.
      showToast((err as Error).message || '등록에 실패했습니다.', 'error');
    } finally {
      // 성공/실패와 무관하게 제출 잠금 해제.
      //   finally는 try/catch 결과와 상관없이 "항상" 실행된다 → 버튼이 영영 잠기는 사고 방지.
      setSubmitting(false);
    }
  };

  /**
   * handleReply — 관리자 답변 등록 핸들러.
   *
   * 매개변수:
   *   - itemId: string (답변을 달 질문의 id)
   * 반환값: Promise<void>
   * 부수효과: qna 테이블 update(답변 내용/작성자/시각, is_resolved=true), 답변 상태 초기화, 목록 재조회, Toast 알림.
   * 엣지케이스: 답변이 공백이면 무시. 권한은 UI 노출(isAdmin) + Supabase RLS로 이중 보호.
   */
  const handleReply = async (itemId: string) => {
    // 공백 답변은 등록하지 않음.
    if (!replyContent.trim()) return;
    try {
      const client = getSupabase();
      if (!client) throw new Error('Not ready');
      // update: 이미 있는 행의 일부 컬럼을 수정한다(새로 만드는 insert와 다름).
      const { error } = await client.from(TABLES.qna).update({
        reply_content: replyContent.trim(),
        reply_author: profile?.display_name || '',
        replied_at: new Date().toISOString(), // 답변 시각을 ISO 문자열로 기록.
        //   ISO 문자열 예: "2026-06-07T12:34:56.000Z" — 시간대 혼동 없는 표준 형식이라 DB 저장에 적합.
        is_resolved: true,                    // 답변이 달리면 해결 완료로 표시.
      }).eq('id', itemId); // 대상 질문 한 건만 갱신.
      //   주의: .eq('id', itemId)(= "id가 itemId인 행만")가 없으면
      //         테이블의 모든 행이 수정될 수 있다. 범위 지정은 필수다.
      if (error) throw error;
      showToast('답변이 등록되었습니다.', 'success');
      // 답변 입력 UI 닫고 입력값 초기화 후 목록 갱신.
      setReplyingId(null); setReplyContent('');
      await loadItems();
    } catch (err) {
      showToast((err as Error).message || '답변 등록에 실패했습니다.', 'error');
    }
  };

  // 아래 return 안의 내용이 실제로 화면에 그려질 JSX다.
  //   <>...</> 는 "프래그먼트": 여러 요소를 묶되 화면에 불필요한 박스를 만들지 않는 빈 껍데기다.
  return (
    <>
      {/* 검색엔진 비노출(noindex) Q&A 페이지의 SEO 메타 설정 */}
      {/* noindex: 검색엔진이 이 페이지를 색인하지 말라는 표시(내부용 페이지라 검색 노출 불필요) */}
      <SEOHead title="Q&A" path="/qna" noindex />
      <section className="page-header">
        <div className="container">
          <h2>Q&A</h2>
          <p>수업 관련 질문과 답변</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            {/* 질문 등록 폼 토글 버튼: 열려 있으면 '취소', 닫혀 있으면 '질문하기' */}
            {/* onClick에서 setShowForm(!showForm): 현재 값을 반대로 뒤집어 열기/닫기를 전환 */}
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {/* JSX 안의 { }는 "여기서부터 자바스크립트 값/식을 넣는다"는 표시다. */}
              {showForm ? '취소' : '질문하기'}
            </button>
          </div>

          {/* showForm이 true일 때만 질문 등록 폼을 렌더링 */}
          {/* {조건 && JSX} 패턴: 조건이 참이면 뒤의 JSX를 그리고, 거짓이면 아무것도 안 그린다. */}
          {showForm && (
            <form onSubmit={handleSubmit} className="qna-form">
              <div className="form-group">
                <label>카테고리</label>
                {/* 카테고리 선택: 값은 영문 코드, 표시 라벨은 한국어 */}
                {/* "제어 컴포넌트" 패턴: value는 상태(category)에서 오고,
                    바뀌면 onChange가 setCategory로 상태를 갱신한다 → 화면과 상태가 항상 일치. */}
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="general">일반</option>
                  <option value="assignment">과제</option>
                  <option value="project">프로젝트</option>
                  <option value="tech">기술</option>
                </select>
              </div>
              <div className="form-group">
                <label>제목</label>
                {/* 입력값(value)은 title 상태와 연결. required는 빈 칸 제출을 막는 HTML 기본 검사. */}
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="질문 제목" required />
              </div>
              <div className="form-group">
                <label>내용</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="질문 내용을 입력하세요..." required />
              </div>
              {/* 제출 중에는 버튼 비활성화 + 라벨 변경(중복 제출 방지) */}
              {/* disabled={submitting}: 처리 중이면 버튼을 눌러도 동작하지 않게 막는다. */}
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '질문 등록'}</button>
            </form>
          )}

          {/* 로딩 중 → 스피너 / 목록 있음 → 리스트 / 목록 없음 → 빈 메시지 (3분기) */}
          {/* 삼항연산자(조건 ? A : B)를 두 번 겹쳐 세 가지 경우를 나눈다. */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : items.length > 0 ? (
            <div className="qna-list">
              {/* .map(): 배열의 각 항목(item)을 하나씩 화면 요소(JSX)로 변환한다. */}
              {items.map(item => (
                // is_resolved에 따라 'resolved' 클래스를 추가해 스타일 구분
                // 주의: 목록을 .map으로 그릴 때는 각 요소에 고유한 key가 꼭 필요하다.
                //       key가 있어야 React가 어떤 항목이 바뀌었는지 빠르고 정확하게 추적한다.
                <div key={item.id} className={`qna-item ${item.is_resolved ? 'resolved' : ''}`}>
                  <div className="qna-header">
                    {/* 상태 배지: 답변 여부에 따라 '답변완료' / '대기중' */}
                    <span className={`qna-status ${item.is_resolved ? 'resolved' : 'pending'}`}>
                      {item.is_resolved ? '답변완료' : '대기중'}
                    </span>
                    <span className="qna-category">{item.category}</span>
                  </div>
                  <h4 className="qna-title">{item.title}</h4>
                  <p className="qna-content">{item.content}</p>
                  <div className="qna-meta">
                    <span>{item.author_name}</span>
                    {/* 작성일을 한국 로케일 날짜 형식으로 표시 */}
                    {/* DB의 날짜 문자열을 Date 객체로 바꾼 뒤, 한국식(YYYY. MM. DD.)으로 보기 좋게 변환 */}
                    <span>{new Date(item.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {/* 답변이 존재하면 답변 블록 표시 (reply_content가 비어 있으면 안 그림) */}
                  {item.reply_content && (
                    <div className="qna-reply">
                      <strong>답변 ({item.reply_author}):</strong>
                      <p>{item.reply_content}</p>
                    </div>
                  )}
                  {/* 관리자이면서 아직 답변이 없는 질문에만 답변 UI 노출 */}
                  {/* isAdmin && !item.reply_content: 둘 다 참일 때만 → 관리자 + 미답변 질문 */}
                  {isAdmin && !item.reply_content && (
                    <>
                      {/* 현재 이 질문에 답변 작성 중이면 입력 폼, 아니면 '답변하기' 버튼 */}
                      {/* replyingId === item.id: "지금 펼쳐진 답변창이 바로 이 질문인가?"를 비교 */}
                      {replyingId === item.id ? (
                        <div className="qna-reply-form">
                          <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={3} placeholder="답변을 입력하세요..." />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            {/* 답변 등록 → handleReply 호출 / 취소 → 작성 모드 해제 */}
                            {/* onClick={() => handleReply(item.id)}: 화살표 함수로 감싸야
                                "클릭할 때" 실행된다. handleReply(item.id)만 쓰면 렌더 중 즉시 실행돼 버린다. */}
                            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '16px' }} onClick={() => handleReply(item.id)}>답변 등록</button>
                            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '16px' }} onClick={() => setReplyingId(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                        // 클릭 시 해당 질문을 답변 작성 대상으로 설정(replyingId에 이 질문의 id 저장)
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '15px', marginTop: '8px' }} onClick={() => setReplyingId(item.id)}>답변하기</button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // 위 두 조건이 모두 거짓 = 로딩도 끝났고 목록도 비어 있을 때
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 질문이 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

// 이 컴포넌트를 다른 파일에서 import해 쓸 수 있도록 기본 내보내기(default export).
//   (라우터가 /qna 경로에서 이 QnA를 불러와 화면에 연결한다.)
export default QnA;
