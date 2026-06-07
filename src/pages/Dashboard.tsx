/**
 * Dashboard.tsx
 *
 * [역할]
 *  - 로그인한 수강생에게 보여지는 메인 대시보드 페이지 컴포넌트.
 *  - 출석/과제/진행률 통계, 학습평가(선수·사후) 성적, 공지사항, 바로가기 링크를 한 화면에 모아서 제공한다.
 *
 * [핵심 책임]
 *  1) 인증된 사용자(user) 기준으로 Supabase에서 대시보드 데이터를 병렬 조회한다.
 *     - 최근 공지사항 5건 (고정글 우선)
 *     - 본인의 출석 일수(status='present' 카운트)
 *     - 전체 과제 수 / 본인 제출 수
 *     - 본인의 학습평가 성적 레코드(선수평가/사후평가)
 *  2) 조회 결과를 통계 카드 및 성적 카드, 공지 목록으로 렌더링한다.
 *
 * [주요 export]
 *  - default: Dashboard (React 함수형 컴포넌트)
 *
 * [의존성/부수효과]
 *  - useAuth(): 현재 로그인 사용자/프로필 정보. 데이터 조회의 RLS 기준이 되는 user.id를 제공.
 *  - getSupabase(): Supabase 클라이언트(미구성 시 null일 수 있음 → 가드 처리).
 *  - 테이블명은 site.dbPrefix 접두사를 붙여 환경별 테이블 분리를 지원.
 */
import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import { getMyAssessments, type AssessmentRecord } from '../utils/assessments';

// 대시보드에서 사용하는 Supabase 테이블 이름 매핑.
// site.dbPrefix(환경별 접두사)를 붙여 실제 테이블명을 구성한다.
const TABLES = {
  announcements: `${site.dbPrefix}announcements`,
  attendance: `${site.dbPrefix}attendance`,
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
};

// 학습평가 type 값(prerequisite/summative)을 화면 표시용 한국어 라벨로 변환하는 맵.
const ASSESSMENT_LABEL: Record<string, string> = {
  prerequisite: '선수평가',
  summative: '사후평가',
};

/**
 * Dashboard 컴포넌트
 *
 * 무엇을 하는지: 로그인 사용자의 대시보드 화면(통계/성적/공지/바로가기)을 렌더링한다.
 * 매개변수: 없음 (인증 정보는 useAuth 컨텍스트에서 가져옴).
 * 반환값: ReactElement (대시보드 페이지 전체 JSX).
 * 부수효과: 마운트 및 user 변경 시 Supabase에서 대시보드 데이터를 비동기 로드(useEffect).
 */
const Dashboard = (): ReactElement => {
  // 현재 로그인한 사용자(user)와 프로필(profile, 표시 이름 등)을 인증 컨텍스트에서 가져온다.
  const { user, profile } = useAuth();
  // 최근 공지사항 목록 상태(최대 5건, 고정글 우선).
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; created_at: string; is_pinned: boolean }[]>([]);
  // 본인 출석 일수(present 상태 카운트) 상태.
  const [attendanceCount, setAttendanceCount] = useState(0);
  // 전체 과제 수 상태(진행률 계산의 분모).
  const [assignmentCount, setAssignmentCount] = useState(0);
  // 본인 제출 과제 수 상태(진행률 계산의 분자).
  const [submissionCount, setSubmissionCount] = useState(0);
  // 본인 학습평가 성적 레코드 목록 상태(선수/사후평가 등).
  const [grades, setGrades] = useState<AssessmentRecord[]>([]);

  // user가 준비되면 대시보드 데이터를 일괄 로드한다.
  // 의존성 배열이 [user]이므로 로그인/사용자 변경 시마다 재조회된다.
  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      // Supabase 미구성이거나 미로그인 상태면 조회하지 않고 종료(가드).
      if (!client || !user) return;

      // 여러 쿼리를 Promise.all로 병렬 실행해 로딩 지연을 최소화한다.
      // - 카운트 쿼리는 { count: 'exact' }로 정확한 건수를 받음.
      // - 출석/제출 쿼리는 user.id로 필터링(RLS와 더불어 본인 데이터만 집계).
      const [annRes, attRes, assignRes, subRes, gradeRes] = await Promise.all([
        // 공지사항: 고정글(is_pinned) 우선, 그다음 최신순 정렬, 5건 제한.
        client.from(TABLES.announcements).select('id, title, created_at, is_pinned').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5),
        // 출석: 본인(student_id) + status='present' 건수만 카운트.
        client.from(TABLES.attendance).select('id', { count: 'exact' }).eq('student_id', user.id).eq('status', 'present'),
        // 과제: 전체 과제 수 카운트(필터 없음 → 진행률 분모).
        client.from(TABLES.assignments).select('id', { count: 'exact' }),
        // 제출: 본인(student_id)이 제출한 과제 수 카운트(진행률 분자).
        client.from(TABLES.submissions).select('id', { count: 'exact' }).eq('student_id', user.id),
        // 성적: 별도 유틸을 통해 본인 학습평가 레코드 조회.
        getMyAssessments(user.id),
      ]);

      // 각 응답을 검증 후 상태에 반영.
      // 카운트는 count가 null이 아닐 때만 반영하여 0으로 덮어쓰는 사고를 방지.
      if (annRes.data) setAnnouncements(annRes.data);
      if (attRes.count != null) setAttendanceCount(attRes.count);
      if (assignRes.count != null) setAssignmentCount(assignRes.count);
      if (subRes.count != null) setSubmissionCount(subRes.count);
      // 성적은 유틸이 배열을 반환하므로 그대로 설정.
      setGrades(gradeRes);
    };
    load();
  }, [user]);

  return (
    <>
      {/* SEO 메타: 대시보드는 비공개 페이지이므로 noindex 처리 */}
      <SEOHead title="대시보드" path="/dashboard" noindex />
      {/* 페이지 헤더: 인사말에 프로필 표시 이름 사용(없으면 '수강생' 대체) */}
      <section className="page-header">
        <div className="container">
          <h2>대시보드</h2>
          <p>안녕하세요, {profile?.display_name || '수강생'}님!</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 상단 통계 카드 영역: 출석/과제 제출/진행률 */}
          <div className="dashboard-stats">
            {/* 출석 일수 카드 */}
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{attendanceCount}</div>
              <div className="stat-label">출석 일수</div>
            </div>
            {/* 과제 제출 카드: 제출 수 / 전체 과제 수 */}
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{submissionCount}/{assignmentCount}</div>
              <div className="stat-label">과제 제출</div>
            </div>
            {/* 진행률 카드: 과제가 0건이면 0%로 처리(0 나눗셈 방지) */}
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{assignmentCount > 0 ? Math.round((submissionCount / assignmentCount) * 100) : 0}%</div>
              <div className="stat-label">진행률</div>
            </div>
          </div>

          {/* 학습평가 성적 영역: 선수평가/사후평가 카드 */}
          <div className="dashboard-section" style={{ marginBottom: '24px' }}>
            <h3>🎯 내 학습평가 성적</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {/* 선수/사후평가 두 종류를 순회하며 카드 생성 */}
              {(['prerequisite', 'summative'] as const).map((t) => {
                // 해당 type의 성적 레코드를 찾는다(없으면 미응시 상태).
                const g = grades.find((x) => x.type === t);
                return (
                  // 좌측 컬러 보더로 합격(초록)/불합격(빨강)/미응시(회색)를 시각화
                  <div key={t} style={{
                    border: '1px solid var(--border-light, #e5e7eb)',
                    borderLeft: `4px solid ${g ? (g.passed ? '#10b981' : '#ef4444') : 'var(--border-light, #e5e7eb)'}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '16px 18px',
                    background: 'var(--bg-white, #fff)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      {/* 평가 종류 라벨(선수평가/사후평가) */}
                      <strong style={{ fontSize: '16px' }}>{ASSESSMENT_LABEL[t]}</strong>
                      {/* 성적이 있을 때만 합격/불합격 배지 표시 */}
                      {g && (
                        <span style={{
                          fontSize: '13px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                          background: g.passed ? '#d1fae5' : '#fee2e2',
                          color: g.passed ? '#065f46' : '#991b1b',
                        }}>{g.passed ? '합격' : '불합격'}</span>
                      )}
                    </div>
                    {/* 성적 유무에 따른 분기: 있으면 점수/정답수/제출일, 없으면 응시 유도 링크 */}
                    {g ? (
                      <>
                        {/* 점수: 합격 여부에 따라 색상 구분 */}
                        <div style={{ fontSize: '28px', fontWeight: 800, color: g.passed ? '#10b981' : '#ef4444' }}>
                          {g.score}<span style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)' }}>점</span>
                        </div>
                        {/* 정답 수와 제출일(제출일 없으면 빈 문자열). 날짜는 한국 로캘로 표기 */}
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                          {g.correct}/{g.total} 정답 · {g.submitted_at ? new Date(g.submitted_at).toLocaleDateString('ko-KR') : ''}
                        </div>
                      </>
                    ) : (
                      // 미응시 시 해당 평가 페이지로 이동하는 링크
                      <Link to={`/assessment/${t}`} style={{ fontSize: '15px', color: 'var(--primary-blue, #0046C8)', fontWeight: 600 }}>
                        아직 응시하지 않았습니다 → 평가 보기
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            {/* 진단평가 안내: 자습용이며 성적 미반영임을 명시 */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginTop: '10px' }}>
              💡 <Link to="/assessment/diagnostic" style={{ color: 'var(--primary-blue, #0046C8)' }}>진단평가</Link>는 사후평가 전 자습용으로, 정답·해설이 공개되어 있고 성적에는 반영되지 않습니다.
            </p>
          </div>

          {/* 하단 2열 그리드: 공지사항 + 바로가기 */}
          <div className="dashboard-grid">
            {/* 공지사항 영역 */}
            <div className="dashboard-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3>📢 공지사항</h3>
                {/* 공지사항 전체 목록 페이지로 이동 */}
                <Link to="/announcements" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)', textDecoration: 'none' }}>전체보기 →</Link>
              </div>
              {/* 공지가 있으면 목록, 없으면 안내 문구 */}
              {announcements.length > 0 ? (
                <ul className="dashboard-list">
                  {announcements.map(a => (
                    // 고정글이면 pinned 클래스 부여 + '고정' 배지 표시
                    <li key={a.id} className={a.is_pinned ? 'pinned' : ''}>
                      {a.is_pinned && <span className="pin-badge">고정</span>}
                      {/* 개별 공지 상세 페이지로 이동 */}
                      <Link to={`/announcements/${a.id}`} className="list-title" style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                      {/* 작성일(한국 로캘) */}
                      <span className="list-date">{new Date(a.created_at).toLocaleDateString('ko-KR')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">공지사항이 없습니다.</p>
              )}
            </div>

            {/* 바로가기 영역: 주요 기능 페이지 링크 모음 */}
            <div className="dashboard-section">
              <h3>🔗 바로가기</h3>
              <div className="quick-links">
                <Link to="/announcements" className="quick-link-card">📢 공지사항</Link>
                <Link to="/materials" className="quick-link-card">📁 강의자료</Link>
                <Link to="/assignments" className="quick-link-card">📝 과제</Link>
                <Link to="/project-vote" className="quick-link-card">🧩 팀구성</Link>
                <Link to="/project-board" className="quick-link-card">🗂️ 프로젝트 관리</Link>
                <Link to="/qna" className="quick-link-card">❓ Q&A</Link>
                <Link to="/classroom" className="quick-link-card">💻 온라인강의실</Link>
                <Link to="/mypage" className="quick-link-card">👤 마이페이지</Link>
                {/* 외부 Padlet 공유 게시판: 새 탭 + noopener로 보안 처리 */}
                <a href="https://padlet.com/aebon/rest01" target="_blank" rel="noopener noreferrer" className="quick-link-card">📌 공유 게시판</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
