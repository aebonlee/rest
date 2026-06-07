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
 */
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Announcement } from '../../types';

// 사이트별 DB 테이블 접두사(site.dbPrefix)를 붙여 실제 announcements 테이블명을 구성한다.
// (예: 접두사가 'rest_'이면 'rest_announcements'). 멀티 프로젝트가 같은 Supabase를 공유할 때 충돌 방지용.
const TABLES = { announcements: `${site.dbPrefix}announcements` };

/**
 * AdminAnnouncements
 *   공지사항 관리 페이지를 렌더링하는 컴포넌트.
 *
 * 매개변수: 없음
 * 반환값: ReactElement (관리자 레이아웃 + 등록 폼 + 공지 목록 테이블)
 * 부수효과: 마운트 시 Supabase에서 공지 목록 조회, 폼 제출/삭제 시 DB 쓰기 및 Toast 표시.
 */
const AdminAnnouncements = (): ReactElement => {
  // 인증 컨텍스트에서 현재 로그인 사용자(user)와 프로필(profile) 정보 획득. 등록 시 작성자 정보로 사용.
  const { user, profile } = useAuth();
  // 전역 Toast 표시 함수.
  const { showToast } = useToast();
  // 화면에 표시할 공지사항 목록 상태.
  const [items, setItems] = useState<Announcement[]>([]);
  // 목록 로딩 중 여부(스피너 표시 제어).
  const [loading, setLoading] = useState(true);
  // 공지 등록 폼의 표시 여부 토글 상태.
  const [showForm, setShowForm] = useState(false);
  // 등록 폼 입력값 상태. category 기본값은 'general'(일반).
  const [form, setForm] = useState({ title: '', content: '', category: 'general', is_pinned: false });
  // 폼 제출(insert) 진행 중 여부(중복 제출 방지 및 버튼 비활성화용).
  const [submitting, setSubmitting] = useState(false);

  /**
   * loadData
   *   Supabase에서 공지사항 전체를 조회해 items 상태에 반영한다.
   *
   * 매개변수: 없음
   * 반환값: Promise<void>
   * 부수효과: items / loading 상태 갱신.
   * 비고: is_pinned 내림차순(고정 공지 먼저) → created_at 내림차순(최신 먼저) 순으로 정렬.
   *       Supabase 클라이언트가 없으면(미설정 등) 로딩만 해제하고 종료(엣지케이스).
   */
  const loadData = async () => {
    const client = getSupabase();
    // 클라이언트 미초기화 시 조기 반환(네트워크/설정 누락 방어).
    if (!client) { setLoading(false); return; }
    // 고정 공지 우선 + 최신순 정렬로 전체 컬럼 조회.
    const { data } = await client.from(TABLES.announcements).select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    if (data) setItems(data as Announcement[]);
    setLoading(false);
  };

  // 마운트 시 1회만 공지 목록을 로드한다(의존성 배열 빈 값).
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
    e.preventDefault(); // 기본 폼 전송(페이지 새로고침) 방지.
    setSubmitting(true);
    try {
      const client = getSupabase();
      // 클라이언트 또는 로그인 사용자가 없으면 진행 불가(에러로 처리해 catch에서 Toast).
      if (!client || !user) throw new Error('Not ready');
      // 폼 값에 작성자 식별/표시 정보를 합쳐 insert. display_name이 없으면 빈 문자열로 대체.
      const { error } = await client.from(TABLES.announcements).insert({ ...form, author_id: user.id, author_name: profile?.display_name || '' });
      if (error) throw error; // Supabase 에러는 catch로 전달.
      showToast('공지사항이 등록되었습니다.', 'success');
      setShowForm(false); // 등록 성공 시 폼 닫기.
      setForm({ title: '', content: '', category: 'general', is_pinned: false }); // 입력값 초기화.
      await loadData(); // 목록 갱신.
    } catch (err) { showToast((err as Error).message, 'error'); } // 모든 실패는 에러 Toast로 통일.
    finally { setSubmitting(false); } // 성공/실패 무관하게 제출 상태 해제.
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
    // 실수 방지용 확인창. 취소 시 즉시 반환.
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const client = getSupabase();
    if (!client) return; // 클라이언트 미초기화 방어.
    // id가 일치하는 행 삭제(RLS 정책에 따라 권한 없으면 서버에서 차단됨).
    await client.from(TABLES.announcements).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    await loadData(); // 삭제 후 목록 갱신.
  };

  return (
    <>
      {/* 검색엔진 비노출(noindex): 관리자 전용 페이지이므로 인덱싱 금지 */}
      <SEOHead title="공지사항 관리" path="/admin/announcements" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 헤더 영역: 제목 + 등록/취소 토글 버튼 (showForm 상태에 따라 라벨 전환) */}
          <div className="admin-header-row"><h2>공지사항 관리</h2><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '공지 등록'}</button></div>

          {/* showForm이 true일 때만 등록 폼 렌더링 */}
          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              {/* 제목 입력 (필수) */}
              <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              {/* 내용 입력 (필수, 여러 줄) */}
              <div className="form-group"><label>내용</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={5} required /></div>
              <div className="form-row">
                {/* 카테고리 선택: 일반/중요/일정 */}
                <div className="form-group"><label>카테고리</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="general">일반</option><option value="important">중요</option><option value="schedule">일정</option>
                  </select>
                </div>
                {/* 상단 고정 여부 체크박스 (is_pinned) */}
                <div className="form-group"><label>상단 고정</label><input type="checkbox" checked={form.is_pinned} onChange={e => setForm({...form, is_pinned: e.target.checked})} /></div>
              </div>
              {/* 제출 버튼: 제출 중에는 비활성화 및 라벨 변경 */}
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </form>
          )}

          {/* 로딩 중이면 스피너, 아니면 공지 목록 테이블 표시 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>고정</th><th>제목</th><th>카테고리</th><th>작성자</th><th>등록일</th><th>관리</th></tr></thead>
                <tbody>
                  {/* 공지 목록을 행으로 매핑. key는 고유 id 사용 */}
                  {items.map(a => (
                    <tr key={a.id}>
                      {/* 고정 공지면 📌 아이콘 표시, 아니면 빈칸 */}
                      <td>{a.is_pinned ? '📌' : ''}</td><td>{a.title}</td><td>{a.category}</td>
                      {/* 등록일은 한국 로케일 날짜 형식으로 표시 */}
                      <td>{a.author_name}</td><td>{new Date(a.created_at).toLocaleDateString('ko-KR')}</td>
                      {/* 삭제 버튼: 해당 공지 id로 handleDelete 호출 */}
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
