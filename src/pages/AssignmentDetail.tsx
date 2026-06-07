/*
 * AssignmentDetail.tsx
 * ----------------------------------------------------------------------------
 * 역할:
 *   - 단일 과제(Assignment)의 상세 정보를 표시하고, 로그인한 학생이 해당 과제를
 *     제출/수정할 수 있게 하는 페이지 컴포넌트.
 *
 * 핵심 책임:
 *   - URL 파라미터(id)로 과제 1건과, 현재 사용자의 기존 제출물(있다면)을 함께 조회.
 *   - 과제 설명, 마감일, 마감 초과 여부, 채점 결과(점수/피드백)를 렌더링.
 *   - 제출 폼(내용 + 파일/링크 URL)을 통해 신규 제출(insert) 또는 기존 제출 수정(update) 처리.
 *   - 이미 채점된(score != null) 경우 입력/제출을 비활성화.
 *
 * 주요 export:
 *   - default: AssignmentDetail (React 페이지 컴포넌트)
 *
 * 데이터 접근:
 *   - Supabase 클라이언트(getSupabase)를 통해 assignments / submissions 테이블에 접근.
 *   - 테이블명은 site.dbPrefix 접두사를 붙여 환경별로 분리(RLS 정책이 student_id 기준으로
 *     본인 제출물만 접근하도록 가정).
 */
import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Assignment, Submission } from '../types';

// DB 테이블명 매핑: site.dbPrefix를 접두사로 붙여 환경(프로젝트)별 테이블을 구분한다.
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
 */
const AssignmentDetail = (): ReactElement => {
  // 라우트에서 과제 id 추출 (예: /assignments/:id)
  const { id } = useParams<{ id: string }>();
  // 인증 컨텍스트: 현재 로그인 사용자(user)와 프로필(profile)
  const { user, profile } = useAuth();
  // 토스트 알림 표시 함수
  const { showToast } = useToast();
  // 조회한 과제 데이터 (없으면 null)
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  // 현재 사용자의 기존 제출물 (없으면 null → 신규 제출 흐름)
  const [submission, setSubmission] = useState<Submission | null>(null);
  // 제출 폼: 내용 입력값
  const [content, setContent] = useState('');
  // 제출 폼: 파일/링크 URL 입력값
  const [fileUrl, setFileUrl] = useState('');
  // 제출 진행 중 여부 (버튼 비활성화/문구 제어)
  const [submitting, setSubmitting] = useState(false);
  // 초기 데이터 로딩 중 여부
  const [loading, setLoading] = useState(true);

  // 마운트 시 및 id/user 변경 시 과제와 본인 제출물을 병렬 조회.
  // 부수효과: assignment/submission/content/fileUrl/loading 상태 갱신.
  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      // 클라이언트/식별자/로그인 정보가 없으면 조회 불가 → 로딩만 종료하고 반환
      if (!client || !id || !user) { setLoading(false); return; }
      // 과제 1건과 본인 제출물을 동시에 요청해 지연을 최소화.
      // - 과제: single() (정확히 1건 기대)
      // - 제출물: maybeSingle() (없을 수 있으므로 0건 허용)
      //   student_id로 필터링하여 RLS와 별개로 본인 제출물만 조회.
      const [assignRes, subRes] = await Promise.all([
        client.from(TABLES.assignments).select('*').eq('id', id).single(),
        client.from(TABLES.submissions).select('*').eq('assignment_id', id).eq('student_id', user.id).maybeSingle(),
      ]);
      if (assignRes.data) setAssignment(assignRes.data as Assignment);
      if (subRes.data) {
        // 기존 제출물이 있으면 상태에 반영하고, 폼 입력값을 기존 값으로 프리필.
        const s = subRes.data as Submission;
        setSubmission(s);
        setContent(s.content || '');
        setFileUrl(s.file_url || '');
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  /**
   * handleSubmit
   * 제출 폼 submit 핸들러. 기존 제출물 유무에 따라 update 또는 insert 수행.
   * - 매개변수: e (FormEvent) — 기본 동작(페이지 새로고침) 방지에 사용.
   * - 반환값: Promise<void>.
   * - 부수효과: DB insert/update, 성공/실패 토스트, submission/submitting 상태 갱신.
   * - 엣지케이스: 내용과 파일 URL이 모두 비어 있으면 제출을 막고 에러 토스트.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // 내용과 파일 URL이 둘 다 비어 있으면 제출 불가 (둘 중 하나는 필수)
    if (!content.trim() && !fileUrl.trim()) { showToast('내용 또는 파일 URL을 입력해주세요.', 'error'); return; }
    setSubmitting(true);
    try {
      const client = getSupabase();
      // 클라이언트/사용자/과제 id 중 하나라도 없으면 진행 불가
      if (!client || !user || !id) throw new Error('Not ready');
      // 제출/수정에 사용할 공통 페이로드. student_name은 표시명 우선, 없으면 이름 사용.
      const payload = {
        assignment_id: id,
        student_id: user.id,
        student_name: profile?.display_name || profile?.name || '',
        content: content.trim(),
        file_url: fileUrl.trim(),
        submitted_at: new Date().toISOString(),
      };
      if (submission) {
        // 이미 제출한 적이 있으면 해당 행을 갱신
        const { error } = await client.from(TABLES.submissions).update(payload).eq('id', submission.id);
        if (error) throw error;
        showToast('과제가 수정되었습니다.', 'success');
      } else {
        // 최초 제출이면 새 행 삽입
        const { error } = await client.from(TABLES.submissions).insert(payload);
        if (error) throw error;
        showToast('과제가 제출되었습니다.', 'success');
      }
      // 저장 후 최신 제출물을 다시 조회해 상태(점수/피드백 등 포함)를 동기화.
      const { data } = await client.from(TABLES.submissions).select('*').eq('assignment_id', id).eq('student_id', user.id).maybeSingle();
      if (data) setSubmission(data as Submission);
    } catch (err) {
      // 에러 메시지가 있으면 그대로, 없으면 기본 실패 문구로 토스트.
      showToast((err as Error).message || '제출에 실패했습니다.', 'error');
    } finally {
      // 성공/실패와 무관하게 제출 진행 상태 해제.
      setSubmitting(false);
    }
  };

  // 로딩 중에는 중앙 정렬된 스피너만 표시.
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="loading-spinner"></div></div>;
  // 과제 조회 실패(없음) 시 안내 문구 표시.
  if (!assignment) return <div style={{ textAlign: 'center', padding: '100px 0' }}>과제를 찾을 수 없습니다.</div>;

  // 현재 시각이 마감일을 지났는지 여부 (경고 표시용)
  const isOverdue = new Date() > new Date(assignment.due_date);

  return (
    <>
      {/* 검색엔진 비노출(noindex) 처리된 SEO 메타 헤더 */}
      <SEOHead title={assignment.title} path={`/assignments/${id}`} noindex />
      {/* 페이지 상단 헤더: 뒤로가기 링크, 과제 제목, 메타 정보 */}
      <section className="page-header">
        <div className="container">
          {/* 과제 목록으로 돌아가는 링크 */}
          <Link to="/assignments" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '16px' }}>← 과제 목록</Link>
          <h2>{assignment.title}</h2>
          {/* Day 번호 / 팀·개인 과제 구분 / 배점 표시 */}
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
                {/* 마감일을 한국 로케일 형식으로 표시 */}
                <p><strong>마감일:</strong> {new Date(assignment.due_date).toLocaleString('ko-KR')}</p>
                {/* 마감 초과 시 경고 문구 */}
                {isOverdue && <p style={{ color: '#DC2626' }}>⚠️ 마감 기한이 지났습니다.</p>}
              </div>
            </div>

            {/* 우측: 제출/채점 영역 */}
            <div className="submission-section">
              {/* 기존 제출물 유무에 따라 제목 전환 */}
              <h3>{submission ? '제출 내용' : '과제 제출'}</h3>
              {/* 채점 완료(score가 null/undefined가 아님) 시 점수와 피드백 표시 */}
              {submission?.score !== null && submission?.score !== undefined && (
                <div className="grade-display">
                  <span className="grade-score">{submission.score}/{assignment.max_score}</span>
                  <p className="grade-feedback">{submission.feedback}</p>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>내용</label>
                  {/* 채점 완료(score != null) 시 수정 불가하도록 비활성화 */}
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
                    placeholder="과제 내용을 작성하세요..." disabled={submission?.score != null} />
                </div>
                <div className="form-group">
                  <label>파일/링크 URL (선택)</label>
                  {/* type="url"로 형식 검증, 채점 완료 시 비활성화 */}
                  <input type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)}
                    placeholder="https://..." disabled={submission?.score != null} />
                </div>
                {/* 아직 채점 전(score == null)일 때만 제출/수정 버튼 노출 */}
                {submission?.score == null && (
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                    {/* 제출 중 / 기존 제출물 있으면 수정 / 없으면 제출 문구 */}
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

export default AssignmentDetail;
