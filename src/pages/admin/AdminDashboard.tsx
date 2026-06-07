/**
 * AdminDashboard.tsx
 *
 * 역할:
 *   - AI Reboot Academy LMS(rest.dreamitbiz.com)의 관리자 대시보드 페이지 컴포넌트.
 *   - 관리자 진입 시 핵심 운영 지표(수강생/과제/제출물/팀/프로젝트 수)를 요약해 보여주고,
 *     주요 관리 화면으로 이동할 수 있는 바로가기 카드를 제공한다.
 *
 * 핵심 책임:
 *   - Supabase에서 통계 데이터를 비동기로 집계해 상단 카드(admin-stats)에 표시.
 *   - 동일인 통합 로직(groupByPerson)을 적용해 중복 가입을 제외한 실제 수강생 인원수 산출.
 *   - 좌측 AdminSidebar + 우측 콘텐츠로 구성된 관리자 레이아웃 렌더링.
 *
 * 주요 export:
 *   - default export: AdminDashboard (React 함수형 컴포넌트, ReactElement 반환).
 */
import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { groupByPerson } from '../../utils/people';
import type { UserProfile } from '../../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 Supabase 테이블명을 생성.
// 여러 사이트가 동일 Supabase 인스턴스를 공유하므로 접두사로 테이블을 분리한다.
const TABLES = {
  attendance: `${site.dbPrefix}attendance`,
  assignments: `${site.dbPrefix}assignments`,
  submissions: `${site.dbPrefix}submissions`,
  teams: `${site.dbPrefix}teams`,
  projects: `${site.dbPrefix}projects`,
};

/**
 * AdminDashboard
 *   - 관리자 대시보드 화면을 그리는 함수형 컴포넌트.
 *   - 매개변수: 없음.
 *   - 반환값: ReactElement (대시보드 전체 UI).
 *   - 부수효과: 마운트 시 useEffect로 Supabase 통계 조회 후 상태(stats) 갱신.
 */
const AdminDashboard = (): ReactElement => {
  // 상단 통계 카드에 표시할 집계 값. 초기값은 모두 0으로 두고 로딩 후 setStats로 채운다.
  const [stats, setStats] = useState({ students: 0, assignments: 0, submissions: 0, teams: 0, projects: 0 });

  // 마운트 시 1회만 실행(의존성 배열 []): 대시보드 통계를 비동기로 로드한다.
  useEffect(() => {
    // load: Supabase에서 통계를 병렬 조회해 stats 상태를 갱신하는 내부 비동기 함수.
    const load = async () => {
      const client = getSupabase();
      // Supabase 클라이언트가 없으면(미초기화/환경설정 누락) 조회를 건너뛴다.
      if (!client) return;
      // 5개 쿼리를 Promise.all로 병렬 실행해 지연을 최소화.
      // - user_profiles: visited_sites에 이 사이트 도메인이 포함된 행만 LIKE로 필터(이 LMS 방문자).
      // - 나머지 4개: count: 'exact'로 행 개수만 정확히 집계(데이터 본문은 불필요).
      const [profileRes, assignRes, subRes, teamRes, projRes] = await Promise.all([
        client.from('user_profiles').select('id, name, display_name, phone, last_sign_in_at, updated_at').like('visited_sites', '%rest.dreamitbiz.com%'),
        client.from(TABLES.assignments).select('id', { count: 'exact' }),
        client.from(TABLES.submissions).select('id', { count: 'exact' }),
        client.from(TABLES.teams).select('id', { count: 'exact' }),
        client.from(TABLES.projects).select('id', { count: 'exact' }),
      ]);
      // 동일인(전화/이름) 통합 인원수
      // groupByPerson으로 같은 사람의 중복 프로필을 묶은 뒤 그룹 수 = 실제 수강생 수.
      const studentCount = groupByPerson((profileRes.data || []) as UserProfile[]).length;
      // 집계 결과를 상태에 반영. count가 null일 수 있으므로 || 0으로 방어.
      setStats({
        students: studentCount,
        assignments: assignRes.count || 0,
        submissions: subRes.count || 0,
        teams: teamRes.count || 0,
        projects: projRes.count || 0,
      });
    };
    load();
  }, []);

  return (
    <>
      {/* SEO 메타 설정. 관리자 페이지이므로 noindex로 검색엔진 색인 차단. */}
      <SEOHead title="관리자 대시보드" path="/admin" noindex />
      <div className="admin-layout">
        {/* 좌측 공통 관리자 내비게이션 사이드바 */}
        <AdminSidebar />
        <div className="admin-content">
          <h2>관리자 대시보드</h2>
          {/* 상단 통계 카드 영역: stats 상태값을 카드별로 표시 */}
          <div className="admin-stats">
            <div className="admin-stat-card"><div className="stat-value">{stats.students}</div><div className="stat-label">수강생</div></div>
            <div className="admin-stat-card"><div className="stat-value">{stats.assignments}</div><div className="stat-label">과제</div></div>
            <div className="admin-stat-card"><div className="stat-value">{stats.submissions}</div><div className="stat-label">제출물</div></div>
            <div className="admin-stat-card"><div className="stat-value">{stats.teams}</div><div className="stat-label">팀</div></div>
            <div className="admin-stat-card"><div className="stat-value">{stats.projects}</div><div className="stat-label">프로젝트</div></div>
          </div>
          {/* 주요 관리 화면으로 이동하는 바로가기 카드 모음 */}
          <div className="admin-quick-links">
            <h3>바로가기</h3>
            <div className="quick-links">
              <Link to="/admin/students" className="quick-link-card">👥 수강생 관리</Link>
              <Link to="/admin/materials" className="quick-link-card">📁 자료 관리</Link>
              <Link to="/admin/assignments" className="quick-link-card">📝 과제 관리</Link>
              <Link to="/admin/attendance" className="quick-link-card">✅ 출석 관리</Link>
              <Link to="/admin/announcements" className="quick-link-card">📢 공지사항</Link>
              <Link to="/admin/teams" className="quick-link-card">🤝 팀 편성</Link>
              <Link to="/admin/projects" className="quick-link-card">🚀 프로젝트</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
