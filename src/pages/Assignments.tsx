/**
 * Assignments.tsx
 *
 * 역할:
 *   - 로그인한 학생에게 과제 목록과 본인의 제출/채점 현황을 보여주는 페이지 컴포넌트.
 *   - 각 과제 카드를 클릭하면 상세 페이지(/assignments/:id)로 이동한다.
 *
 * 핵심 책임:
 *   - Supabase에서 과제(assignments) 전체 목록과 현재 사용자의 제출(submissions) 내역을 병렬로 로드.
 *   - 과제별 제출 상태(채점완료/제출완료/기한초과/미제출)를 계산해 배지로 표시.
 *   - 로딩/빈 목록/정상 목록 상태에 따른 UI 분기.
 *
 * 주요 export:
 *   - default export: Assignments (페이지 컴포넌트)
 *
 * 부수효과:
 *   - 마운트 시 및 user 변경 시 Supabase 조회(useEffect). 제출 내역은 student_id로 필터링되어
 *     RLS와 함께 본인 데이터만 보이도록 동작한다.
 */
import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Assignment, Submission } from '../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙인 실제 테이블명 매핑.
// 여러 프로젝트가 같은 Supabase를 공유할 때 테이블 충돌을 막기 위한 접두사 규칙.
const TABLES = {
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
};

/**
 * Assignments
 * 과제 목록 페이지 컴포넌트.
 * 매개변수: 없음
 * 반환값: ReactElement (과제 목록 UI)
 * 부수효과: useEffect를 통한 Supabase 데이터 로드(상태 갱신).
 */
const Assignments = (): ReactElement => {
  // 인증 컨텍스트에서 현재 로그인 사용자 정보를 가져온다(없으면 null).
  const { user } = useAuth();
  // 과제 전체 목록 상태.
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  // 현재 사용자의 제출 내역 상태.
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  // 초기/조회 중 로딩 표시 상태.
  const [loading, setLoading] = useState(true);

  // 마운트 및 user 변경 시 과제·제출 데이터를 로드한다.
  useEffect(() => {
    // 비동기 로더: Supabase 클라이언트와 user가 있어야만 조회를 수행한다.
    const load = async () => {
      const client = getSupabase();
      // 클라이언트 미초기화 또는 비로그인 상태면 로딩만 종료하고 조회 생략(엣지케이스).
      if (!client || !user) { setLoading(false); return; }
      // 과제 목록과 본인 제출 내역을 병렬 조회해 대기시간을 줄인다.
      const [assignRes, subRes] = await Promise.all([
        // 과제: day_number 우선, 같은 날짜 내에서는 due_date 순으로 정렬.
        client.from(TABLES.assignments).select('*').order('day_number').order('due_date'),
        // 제출: 현재 사용자(student_id)의 것만 조회(RLS와 함께 본인 데이터만 노출).
        client.from(TABLES.submissions).select('*').eq('student_id', user.id),
      ]);
      // 각 조회 결과가 존재할 때만 상태에 반영(오류/널 응답 방어).
      if (assignRes.data) setAssignments(assignRes.data as Assignment[]);
      if (subRes.data) setSubmissions(subRes.data as Submission[]);
      setLoading(false);
    };
    load();
  }, [user]);

  /**
   * getSubmission
   * 특정 과제 id에 해당하는 현재 사용자의 제출 객체를 찾는다.
   * 매개변수: assignmentId - 과제 식별자
   * 반환값: 일치하는 Submission 또는 undefined(미제출).
   */
  const getSubmission = (assignmentId: string) => submissions.find(s => s.assignment_id === assignmentId);

  /**
   * getStatusBadge
   * 과제의 현재 상태를 계산해 상태 배지 JSX를 반환한다.
   * 매개변수: assignment - 대상 과제
   * 반환값: 상태에 맞는 <span> 배지 엘리먼트
   * 상태 우선순위: 채점완료(score 존재) > 제출완료(제출했으나 미채점) > 기한초과 > 미제출
   */
  const getStatusBadge = (assignment: Assignment) => {
    const sub = getSubmission(assignment.id);
    // 제출 내역이 있으면 채점 여부에 따라 분기.
    if (sub) {
      // score가 null이 아니면 채점이 끝난 상태(점수/배점 표시).
      if (sub.score !== null) return <span className="status-badge graded">채점완료 ({sub.score}/{assignment.max_score})</span>;
      // 제출은 했으나 아직 채점 전.
      return <span className="status-badge submitted">제출완료</span>;
    }
    // 미제출 상태: 현재 시각과 마감일을 비교해 기한초과 여부 판단.
    const now = new Date();
    const due = new Date(assignment.due_date);
    if (now > due) return <span className="status-badge overdue">기한초과</span>;
    return <span className="status-badge pending">미제출</span>;
  };

  return (
    <>
      {/* 검색엔진 비노출(noindex) 처리된 과제 페이지 SEO 헤더 */}
      <SEOHead title="과제" path="/assignments" noindex />
      <section className="page-header">
        <div className="container">
          <h2>과제</h2>
          <p>과제 목록 및 제출 현황입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 로딩 중에는 스피너, 데이터가 있으면 목록, 없으면 빈 메시지를 표시 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : assignments.length > 0 ? (
            <div className="assignments-list">
              {/* 과제 목록을 카드로 렌더링. 카드 전체가 상세 페이지 링크 */}
              {assignments.map((a) => (
                <Link key={a.id} to={`/assignments/${a.id}`} className="assignment-card">
                  <div className="assignment-header">
                    <h4>{a.title}</h4>
                    {/* 과제별 제출/채점 상태 배지 */}
                    {getStatusBadge(a)}
                  </div>
                  <p className="assignment-desc">{a.description}</p>
                  <div className="assignment-meta">
                    <span>Day {a.day_number}</span>
                    {/* 팀/개인 과제 구분 */}
                    <span>{a.is_team ? '팀 과제' : '개인 과제'}</span>
                    <span>배점: {a.max_score}점</span>
                    {/* 마감일을 한국 로케일 날짜 형식으로 표시 */}
                    <span>마감: {new Date(a.due_date).toLocaleDateString('ko-KR')}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 과제가 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Assignments;
