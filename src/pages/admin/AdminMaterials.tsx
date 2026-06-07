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
 */
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Material } from '../../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 테이블명을 구성.
// 여러 프로젝트가 동일 Supabase를 공유할 때 테이블 충돌을 방지하기 위함.
const TABLES = { materials: `${site.dbPrefix}materials` };

/**
 * AdminMaterials
 *   - 관리자 자료 관리 화면을 렌더링하는 함수형 컴포넌트.
 *   - 매개변수: 없음.
 *   - 반환값: ReactElement (전체 페이지 레이아웃 + 등록 폼 + 자료 테이블).
 *   - 부수효과: 마운트 시 자료 목록을 비동기로 로드하고, 등록/삭제 시 DB를 변경한다.
 */
const AdminMaterials = (): ReactElement => {
  // 현재 로그인한 사용자 정보(등록 시 author_id로 사용).
  const { user } = useAuth();
  // 성공/실패 알림 토스트 표시 함수.
  const { showToast } = useToast();
  // 조회된 자료 목록 상태.
  const [materials, setMaterials] = useState<Material[]>([]);
  // 초기 로딩 및 재조회 시의 로딩 표시 상태.
  const [loading, setLoading] = useState(true);
  // 등록 폼 표시 여부 토글 상태.
  const [showForm, setShowForm] = useState(false);
  // 등록 폼의 입력값 상태(초기값 = 빈 폼 / 기본 카테고리·파일타입·Day).
  const [form, setForm] = useState({ title: '', description: '', category: 'ai_basic', file_url: '', file_type: 'pdf', file_size: 0, day_number: 1 });
  // 폼 제출(insert) 진행 중 여부(버튼 중복 클릭 방지·문구 변경용).
  const [submitting, setSubmitting] = useState(false);

  /**
   * loadMaterials
   *   - materials 테이블에서 전체 자료를 조회해 상태에 반영한다.
   *   - 매개변수: 없음.
   *   - 반환값: Promise<void>.
   *   - 부수효과: setMaterials, setLoading 상태 갱신.
   *   - 정렬: day_number 오름차순 → created_at 내림차순(같은 Day 내 최신 자료 우선).
   */
  const loadMaterials = async () => {
    const client = getSupabase();
    // Supabase 클라이언트가 없으면(미초기화 등) 로딩만 종료하고 조회를 건너뜀.
    if (!client) { setLoading(false); return; }
    const { data } = await client.from(TABLES.materials).select('*').order('day_number').order('created_at', { ascending: false });
    // 데이터가 있을 때만 목록 갱신(에러로 data가 null인 경우 기존 목록 유지).
    if (data) setMaterials(data as Material[]);
    setLoading(false);
  };

  // 마운트 시 1회 자료 목록을 로드(의존성 배열 비어있음).
  useEffect(() => { loadMaterials(); }, []);

  /**
   * handleSubmit
   *   - 등록 폼 제출 핸들러. 폼 내용을 materials 테이블에 insert한다.
   *   - 매개변수: e (FormEvent) — 기본 제출 동작(새로고침) 방지에 사용.
   *   - 반환값: Promise<void>.
   *   - 부수효과: DB insert, 토스트 표시, 폼 닫기·초기화, 목록 재조회, submitting 상태 갱신.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 폼 기본 제출(페이지 리로드) 방지.
    setSubmitting(true);
    try {
      const client = getSupabase();
      // 클라이언트 또는 로그인 사용자가 없으면 등록 불가(RLS상 author_id 필요).
      if (!client || !user) throw new Error('Not ready');
      // 폼 값에 author_id(현재 사용자)를 합쳐 새 행 삽입.
      const { error } = await client.from(TABLES.materials).insert({ ...form, author_id: user.id });
      if (error) throw error;
      showToast('자료가 등록되었습니다.', 'success');
      setShowForm(false); // 등록 성공 시 폼 닫기.
      // 폼을 초기 기본값으로 리셋.
      setForm({ title: '', description: '', category: 'ai_basic', file_url: '', file_type: 'pdf', file_size: 0, day_number: 1 });
      await loadMaterials(); // 최신 목록으로 갱신.
    } catch (err) {
      // 인증/RLS/네트워크 등 모든 오류를 토스트로 표시.
      showToast((err as Error).message, 'error');
    } finally {
      // 성공/실패와 무관하게 제출 상태 해제.
      setSubmitting(false);
    }
  };

  /**
   * handleDelete
   *   - 지정한 id의 자료를 삭제한다.
   *   - 매개변수: id (string) — 삭제할 자료의 PK.
   *   - 반환값: Promise<void>.
   *   - 부수효과: 사용자 확인(confirm) 후 DB delete, 토스트 표시, 목록 재조회.
   */
  const handleDelete = async (id: string) => {
    // 실수 삭제 방지를 위한 확인창. 취소 시 즉시 중단.
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const client = getSupabase();
    if (!client) return;
    // id가 일치하는 단일 행 삭제(RLS 정책에 따라 권한 검증됨).
    await client.from(TABLES.materials).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    await loadMaterials();
  };

  return (
    <>
      {/* 검색엔진 비노출(noindex) 관리자 페이지용 SEO 헤드 */}
      <SEOHead title="자료 관리" path="/admin/materials" noindex />
      <div className="admin-layout">
        {/* 관리자 좌측 네비게이션 사이드바 */}
        <AdminSidebar />
        <div className="admin-content">
          <div className="admin-header-row">
            <h2>자료 관리</h2>
            {/* 등록 폼 표시/숨김 토글 버튼(상태에 따라 라벨 변경) */}
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '자료 등록'}</button>
          </div>

          {/* showForm이 true일 때만 등록 폼 렌더링 */}
          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                {/* 제목(필수 입력) */}
                <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                {/* Day 번호(1~20 범위, 숫자형으로 변환하여 저장) */}
                <div className="form-group"><label>Day</label><input type="number" value={form.day_number} onChange={e => setForm({...form, day_number: Number(e.target.value)})} min={1} max={20} /></div>
              </div>
              {/* 설명(선택, 멀티라인) */}
              <div className="form-group"><label>설명</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
              <div className="form-row">
                <div className="form-group"><label>카테고리</label>
                  {/* 자료 분류 선택. value는 DB 저장값(영문 코드), 표시는 한글 라벨 */}
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="prerequisite">선수과정</option><option value="ai_basic">AI기본</option><option value="llm_practice">LLM실습</option>
                    <option value="automation">자동화</option><option value="planning">기획</option><option value="design">설계</option>
                    <option value="implementation">구현</option><option value="debugging">디버깅</option><option value="coaching">코칭</option>
                  </select>
                </div>
                {/* 파일 URL(url 타입 입력으로 형식 검증) */}
                <div className="form-group"><label>파일 URL</label><input type="url" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} /></div>
              </div>
              {/* 제출 버튼: 제출 중에는 비활성화 및 문구 변경 */}
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </form>
          )}

          {/* 로딩 중에는 스피너, 완료 후에는 자료 테이블 표시 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Day</th><th>제목</th><th>카테고리</th><th>등록일</th><th>관리</th></tr></thead>
                <tbody>
                  {/* 조회된 자료 목록을 행으로 렌더링(key=고유 id) */}
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td>{m.day_number}</td><td>{m.title}</td><td>{m.category}</td>
                      {/* 생성일을 한국어 로캘 날짜 형식으로 표시 */}
                      <td>{new Date(m.created_at).toLocaleDateString('ko-KR')}</td>
                      {/* 해당 행 자료 삭제 버튼 */}
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

export default AdminMaterials;
