/**
 * AdminAssignments.tsx
 *
 * [역할]
 * 관리자 전용 "과제 관리" 페이지 컴포넌트. Supabase의 과제(assignments) 테이블에 대해
 * 목록 조회 / 등록 / 수정 / 삭제(CRUD)를 수행하는 화면을 제공한다.
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
 * - 테이블명은 site.dbPrefix 접두사를 붙여 환경별 분리를 지원한다.
 */
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Assignment } from '../../types';

// 사용할 Supabase 테이블명 매핑. site.dbPrefix로 환경별(스테이징/운영 등) 접두사를 붙인다.
const TABLES = { assignments: `${site.dbPrefix}assignments` };

// 폼 초기값(빈 과제). 신규 등록 시작/취소 시 이 값으로 폼을 리셋한다.
const EMPTY = { title: '', description: '', category: 'general', day_number: 1, due_date: '', max_score: 100, is_team: false };

/**
 * ISO 날짜 문자열을 <input type="datetime-local">이 요구하는 형식으로 변환한다.
 *
 * @param iso - ISO 8601 날짜 문자열(없을 수 있음)
 * @returns "YYYY-MM-DDTHH:mm" 형식의 로컬 기준 문자열. 입력이 없거나 잘못된 경우 ''
 * @부수효과 없음(순수 함수)
 *
 * 동작: UTC 기준 toISOString() 결과를 타임존 오프셋만큼 보정하여 "로컬 시각"으로 맞춘 뒤
 *       앞 16자("YYYY-MM-DDTHH:mm")만 잘라낸다. 이렇게 해야 input에 사용자 로컬 시각이 표시된다.
 */
// ISO → datetime-local 입력값(YYYY-MM-DDTHH:mm, 로컬 기준)
const toLocalInput = (iso?: string): string => {
  if (!iso) return ''; // 값이 없으면 빈 문자열
  const d = new Date(iso);
  if (isNaN(d.getTime())) return ''; // 파싱 실패(유효하지 않은 날짜) 시 빈 문자열로 안전 처리
  // getTimezoneOffset()(분 단위)을 ms로 환산해 빼주어 로컬 시각으로 보정 후 16자리만 사용
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

/**
 * AdminAssignments
 *
 * 관리자 과제 관리 페이지 컴포넌트.
 * @returns ReactElement - 과제 목록 표와 등록/수정 폼을 포함한 관리자 화면
 * @부수효과 - 마운트 시 Supabase에서 과제 목록을 조회하고, 폼 제출/삭제 시 DB를 변경한다.
 */
const AdminAssignments = (): ReactElement => {
  const { showToast } = useToast(); // 전역 토스트 알림 함수
  const [assignments, setAssignments] = useState<Assignment[]>([]); // 조회된 과제 목록
  const [loading, setLoading] = useState(true); // 목록 로딩 중 여부
  const [showForm, setShowForm] = useState(false); // 등록/수정 폼 표시 여부
  const [editingId, setEditingId] = useState<string | null>(null); // 수정 중인 과제 id(없으면 신규)
  const [form, setForm] = useState({ ...EMPTY }); // 폼 입력 상태(EMPTY 복사본으로 초기화)
  const [submitting, setSubmitting] = useState(false); // 폼 저장(등록/수정) 진행 중 여부

  /**
   * loadData
   * 과제 목록을 day_number 오름차순으로 조회하여 상태에 반영한다.
   * @returns Promise<void>
   * @부수효과 - assignments/loading 상태 갱신, Supabase 조회 수행
   */
  const loadData = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; } // 클라이언트 미준비 시 로딩만 종료
    const { data } = await client.from(TABLES.assignments).select('*').order('day_number');
    if (data) setAssignments(data as Assignment[]); // 데이터가 있을 때만 목록 갱신
    setLoading(false);
  };
  // 마운트 시 1회 과제 목록 로드(의존성 배열 비어 있음)
  useEffect(() => { loadData(); }, []);

  /**
   * resetForm
   * 폼을 초기 상태로 되돌리고 폼을 닫는다.
   * @부수효과 - form/editingId/showForm 상태 초기화
   */
  const resetForm = () => { setForm({ ...EMPTY }); setEditingId(null); setShowForm(false); };

  /**
   * startNew
   * "과제 등록" 버튼 동작. 신규 등록 폼을 연다.
   * @부수효과 - 폼 상태 변경
   *
   * 엣지케이스: 이미 신규 등록 폼이 열려 있는 상태(showForm && !editingId)에서 다시 누르면
   *            토글처럼 폼을 닫는다(resetForm). 그 외에는 빈 폼으로 새로 연다.
   */
  const startNew = () => { if (showForm && !editingId) { resetForm(); return; } setForm({ ...EMPTY }); setEditingId(null); setShowForm(true); };

  /**
   * startEdit
   * 특정 과제를 수정 모드로 폼에 채운다.
   * @param a - 수정할 과제 객체
   * @부수효과 - form/editingId/showForm 상태 변경, 화면 최상단으로 스크롤
   */
  const startEdit = (a: Assignment) => {
    setForm({
      // null 가능 필드는 기본값으로 대체하여 controlled input 경고를 방지한다
      title: a.title, description: a.description || '', category: a.category || 'general',
      day_number: a.day_number, due_date: toLocalInput(a.due_date), max_score: a.max_score, is_team: !!a.is_team,
    });
    setEditingId(a.id); // 수정 대상 id 지정
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 폼이 보이도록 상단으로 부드럽게 이동
  };

  /**
   * handleSubmit
   * 폼 제출 핸들러. editingId 유무에 따라 update 또는 insert를 수행한다.
   * @param e - 폼 제출 이벤트
   * @returns Promise<void>
   * @부수효과 - DB update/insert, 토스트 알림, 폼 리셋 및 목록 재조회, submitting 상태 토글
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 기본 폼 제출(페이지 새로고침) 방지
    setSubmitting(true);
    try {
      const client = getSupabase();
      if (!client) throw new Error('Not ready'); // 클라이언트 미준비 시 오류 처리
      // due_date는 datetime-local 문자열 → ISO로 변환. 빈 값이면 null 저장
      const payload = { ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : null };
      if (editingId) {
        // 수정: editingId에 해당하는 행 업데이트
        const { error } = await client.from(TABLES.assignments).update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('과제가 수정되었습니다.', 'success');
      } else {
        // 신규: 새 행 삽입
        const { error } = await client.from(TABLES.assignments).insert(payload);
        if (error) throw error;
        showToast('과제가 등록되었습니다.', 'success');
      }
      resetForm();        // 성공 시 폼 닫기/초기화
      await loadData();   // 변경 사항 반영을 위해 목록 재조회
    } catch (err) { showToast((err as Error).message, 'error'); } // 실패 시 에러 메시지 토스트
    finally { setSubmitting(false); } // 성공/실패 무관하게 제출 상태 해제
  };

  /**
   * handleDelete
   * 과제 삭제 핸들러. 확인 다이얼로그 후 해당 과제를 삭제한다.
   * @param id - 삭제할 과제 id
   * @returns Promise<void>
   * @부수효과 - DB delete, 토스트 알림, (수정 중이던 항목이면) 폼 리셋, 목록 재조회
   */
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return; // 사용자 확인 없으면 중단
    const client = getSupabase();
    if (!client) return; // 클라이언트 미준비 시 무동작
    await client.from(TABLES.assignments).delete().eq('id', id);
    showToast('삭제되었습니다.', 'success');
    if (editingId === id) resetForm(); // 삭제 대상이 현재 수정 중인 항목이면 폼을 정리
    await loadData(); // 목록 재조회
  };

  return (
    <>
      {/* 관리자 페이지 SEO 헤드: noindex로 검색엔진 색인 제외 */}
      <SEOHead title="과제 관리" path="/admin/assignments" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 상단 헤더: 제목 + 등록/취소 토글 버튼(신규 폼이 열려 있으면 '취소'로 표시) */}
          <div className="admin-header-row"><h2>과제 관리</h2><button className="btn btn-primary" onClick={startNew}>{showForm && !editingId ? '취소' : '과제 등록'}</button></div>

          {/* 등록/수정 폼: showForm이 true일 때만 렌더링 */}
          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              {/* 폼 헤더: editingId 유무로 수정/신규 표시 전환 */}
              <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--primary-blue, #0046C8)' }}>{editingId ? '✏️ 과제 수정' : '➕ 새 과제 등록'}</div>
              <div className="form-row">
                {/* 제목(필수) */}
                <div className="form-group"><label>제목</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                {/* Day 번호: Number로 변환해 숫자 상태 유지, 최소 1 */}
                <div className="form-group"><label>Day</label><input type="number" value={form.day_number} onChange={e => setForm({...form, day_number: Number(e.target.value)})} min={1} /></div>
              </div>
              {/* 설명(필수) */}
              <div className="form-group"><label>설명</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} required /></div>
              <div className="form-row">
                {/* 마감일: datetime-local 입력. 제출 시 ISO로 변환됨 */}
                <div className="form-group"><label>마감일</label><input type="datetime-local" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required /></div>
                {/* 배점: 숫자 변환, 최소 1 */}
                <div className="form-group"><label>배점</label><input type="number" value={form.max_score} onChange={e => setForm({...form, max_score: Number(e.target.value)})} min={1} /></div>
                {/* 팀 과제 여부 체크박스 */}
                <div className="form-group"><label>팀 과제</label><input type="checkbox" checked={form.is_team} onChange={e => setForm({...form, is_team: e.target.checked})} /></div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* 제출 버튼: 진행 중 비활성화, 라벨은 진행/수정/등록 상태별 전환 */}
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '저장 중...' : editingId ? '수정 저장' : '등록'}</button>
                {/* 취소 버튼: 폼 초기화 및 닫기 */}
                <button type="button" className="btn btn-secondary" onClick={resetForm}>취소</button>
              </div>
            </form>
          )}

          {/* 목록 영역: 로딩 중에는 스피너, 완료 후 표 렌더링 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Day</th><th>제목</th><th>유형</th><th>배점</th><th>마감일</th><th>관리</th></tr></thead>
                <tbody>
                  {/* 과제 목록을 행으로 매핑. 현재 수정 중인 행은 배경색으로 강조 */}
                  {assignments.map(a => (
                    <tr key={a.id} style={editingId === a.id ? { background: 'rgba(0,70,200,0.06)' } : undefined}>
                      {/* is_team 값에 따라 '팀'/'개인' 유형 표시 */}
                      <td>{a.day_number}</td><td>{a.title}</td><td>{a.is_team ? '팀' : '개인'}</td>
                      {/* 마감일은 한국 로케일로 표시, 없으면 '-' */}
                      <td>{a.max_score}</td><td>{a.due_date ? new Date(a.due_date).toLocaleString('ko-KR') : '-'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {/* 수정: 해당 과제를 폼에 로드 */}
                        <button className="btn-secondary-sm" style={{ marginRight: '6px' }} onClick={() => startEdit(a)}>수정</button>
                        {/* 삭제: 확인 후 DB에서 제거 */}
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

export default AdminAssignments;
