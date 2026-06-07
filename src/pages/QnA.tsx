/**
 * QnA.tsx — 수업 관련 질문/답변(Q&A) 페이지 컴포넌트
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
 *
 * 주요 export:
 *   - default: QnA (React 페이지 컴포넌트)
 *
 * 인증/권한(RLS) 참고:
 *   - 질문 등록은 로그인 사용자(user) 필요. author_id에 user.id를 기록한다.
 *   - 답변 영역은 isAdmin 사용자에게만 노출되며, 실제 쓰기 권한은 Supabase RLS 정책으로 보장된다.
 */
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { QnAItem } from '../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 Q&A 테이블명을 구성한다.
// (여러 사이트가 같은 Supabase 인스턴스를 공유할 때 테이블 충돌 방지)
const TABLES = { qna: `${site.dbPrefix}qna` };

/**
 * QnA — Q&A 게시판 페이지 컴포넌트
 *
 * 매개변수: 없음
 * 반환값: ReactElement (Q&A 헤더 + 질문 등록 폼 + 질문/답변 목록)
 * 부수효과:
 *   - 마운트 시 Supabase에서 질문 목록을 조회한다(loadItems).
 *   - 질문 등록/답변 등록 시 DB 쓰기 및 Toast 알림 발생.
 */
const QnA = (): ReactElement => {
  // 인증 컨텍스트: 현재 사용자, 프로필(표시 이름 등), 관리자 여부.
  const { user, profile, isAdmin } = useAuth();
  // 토스트 알림 트리거 함수.
  const { showToast } = useToast();
  const [items, setItems] = useState<QnAItem[]>([]);   // 조회된 질문 목록
  const [loading, setLoading] = useState(true);        // 목록 로딩 중 여부
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
   * 반환값: Promise<void>
   * 부수효과: items / loading 상태 갱신.
   * 엣지케이스: Supabase 클라이언트가 없으면(미초기화) 로딩만 해제하고 조기 반환.
   */
  const loadItems = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    // created_at 내림차순(최신 글이 위)으로 전체 컬럼 조회.
    const { data } = await client.from(TABLES.qna).select('*').order('created_at', { ascending: false });
    if (data) setItems(data as QnAItem[]);
    setLoading(false);
  };

  // 최초 마운트 시 한 번만 질문 목록을 로드한다(의존성 배열 빈 값).
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
    e.preventDefault();
    // 공백만 입력된 경우는 유효하지 않은 질문으로 보고 무시.
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const client = getSupabase();
      // 클라이언트 또는 로그인 사용자가 없으면 등록 불가(RLS상 author_id 필요).
      if (!client || !user) throw new Error('Not ready');
      const { error } = await client.from(TABLES.qna).insert({
        title: title.trim(), content: content.trim(), category,
        // author_name: 표시 이름 우선, 없으면 name, 둘 다 없으면 빈 문자열.
        author_id: user.id, author_name: profile?.display_name || profile?.name || '',
      });
      if (error) throw error;
      showToast('질문이 등록되었습니다.', 'success');
      // 등록 성공 시 입력값과 폼을 초기화하고 목록을 새로고침.
      setTitle(''); setContent(''); setShowForm(false);
      await loadItems();
    } catch (err) {
      // 에러 메시지가 있으면 노출, 없으면 기본 실패 문구.
      showToast((err as Error).message || '등록에 실패했습니다.', 'error');
    } finally {
      // 성공/실패와 무관하게 제출 잠금 해제.
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
      const { error } = await client.from(TABLES.qna).update({
        reply_content: replyContent.trim(),
        reply_author: profile?.display_name || '',
        replied_at: new Date().toISOString(), // 답변 시각을 ISO 문자열로 기록.
        is_resolved: true,                    // 답변이 달리면 해결 완료로 표시.
      }).eq('id', itemId); // 대상 질문 한 건만 갱신.
      if (error) throw error;
      showToast('답변이 등록되었습니다.', 'success');
      // 답변 입력 UI 닫고 입력값 초기화 후 목록 갱신.
      setReplyingId(null); setReplyContent('');
      await loadItems();
    } catch (err) {
      showToast((err as Error).message || '답변 등록에 실패했습니다.', 'error');
    }
  };

  return (
    <>
      {/* 검색엔진 비노출(noindex) Q&A 페이지의 SEO 메타 설정 */}
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
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '질문하기'}
            </button>
          </div>

          {/* showForm이 true일 때만 질문 등록 폼을 렌더링 */}
          {showForm && (
            <form onSubmit={handleSubmit} className="qna-form">
              <div className="form-group">
                <label>카테고리</label>
                {/* 카테고리 선택: 값은 영문 코드, 표시 라벨은 한국어 */}
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="general">일반</option>
                  <option value="assignment">과제</option>
                  <option value="project">프로젝트</option>
                  <option value="tech">기술</option>
                </select>
              </div>
              <div className="form-group">
                <label>제목</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="질문 제목" required />
              </div>
              <div className="form-group">
                <label>내용</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="질문 내용을 입력하세요..." required />
              </div>
              {/* 제출 중에는 버튼 비활성화 + 라벨 변경(중복 제출 방지) */}
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '질문 등록'}</button>
            </form>
          )}

          {/* 로딩 중 → 스피너 / 목록 있음 → 리스트 / 목록 없음 → 빈 메시지 (3분기) */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : items.length > 0 ? (
            <div className="qna-list">
              {items.map(item => (
                // is_resolved에 따라 'resolved' 클래스를 추가해 스타일 구분
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
                    <span>{new Date(item.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {/* 답변이 존재하면 답변 블록 표시 */}
                  {item.reply_content && (
                    <div className="qna-reply">
                      <strong>답변 ({item.reply_author}):</strong>
                      <p>{item.reply_content}</p>
                    </div>
                  )}
                  {/* 관리자이면서 아직 답변이 없는 질문에만 답변 UI 노출 */}
                  {isAdmin && !item.reply_content && (
                    <>
                      {/* 현재 이 질문에 답변 작성 중이면 입력 폼, 아니면 '답변하기' 버튼 */}
                      {replyingId === item.id ? (
                        <div className="qna-reply-form">
                          <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={3} placeholder="답변을 입력하세요..." />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            {/* 답변 등록 → handleReply 호출 / 취소 → 작성 모드 해제 */}
                            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '16px' }} onClick={() => handleReply(item.id)}>답변 등록</button>
                            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '16px' }} onClick={() => setReplyingId(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                        // 클릭 시 해당 질문을 답변 작성 대상으로 설정
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '15px', marginTop: '8px' }} onClick={() => setReplyingId(item.id)}>답변하기</button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 질문이 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default QnA;
