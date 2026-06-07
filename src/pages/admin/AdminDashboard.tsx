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
 *
 * ──────────────────────────────────────────────────────────────────────────
 * 초보자를 위한 배경 지식(이 파일을 이해하는 데 필요한 용어):
 *   - React 컴포넌트: 화면의 한 조각을 만들어 내는 "함수". 이 함수는 JSX(아래 참고)를
 *     반환하고, React가 그 JSX를 실제 브라우저 화면(DOM)으로 그려 준다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 문법을 쓸 수 있게 해 주는 것.
 *     예: <div>...</div>. 실제로는 React가 이해하는 객체로 변환된다.
 *   - 상태(state): 컴포넌트가 "기억"하는 값. 이 값이 바뀌면 React가 화면을 다시 그린다(리렌더).
 *     여기서는 useState로 만든 stats(통계 숫자들)가 상태다.
 *   - 훅(Hook): use로 시작하는 특수 함수(useState, useEffect 등). 컴포넌트에 기능을 "걸어" 준다.
 *   - Supabase: 클라우드 데이터베이스 + 인증 서비스. 여기서는 DB에서 수강생/과제 등의
 *     데이터를 가져오는 용도로 쓴다. SQL 대신 .from().select() 같은 메서드 체인으로 질의한다.
 *   - 비동기(async/await): 네트워크 요청처럼 "결과가 바로 오지 않는 작업"을 다루는 문법.
 *     await가 붙은 줄은 결과가 도착할 때까지 그 자리에서 기다린 뒤 다음 줄로 넘어간다.
 *   - TS(TypeScript): 자바스크립트에 "타입(자료형)"을 더한 언어. : ReactElement 처럼
 *     값의 종류를 미리 적어 두어 실수를 컴파일 단계에서 잡아 준다.
 */
// import: 다른 파일에 있는 기능을 이 파일로 가져오는 구문.
// - useState/useEffect: React 훅. type ReactElement는 "타입만" 가져오는 표시(실행 코드 아님).
import { useState, useEffect, type ReactElement } from 'react';
// Link: 페이지 새로고침 없이 다른 경로로 이동시키는 react-router의 링크 컴포넌트(SPA 라우팅).
import { Link } from 'react-router-dom';
// AdminSidebar: 관리자 화면 왼쪽에 공통으로 들어가는 내비게이션 컴포넌트.
import AdminSidebar from '../../components/AdminSidebar';
// SEOHead: <title>이나 검색엔진 색인 여부 등 페이지의 메타 정보를 설정하는 컴포넌트.
import SEOHead from '../../components/SEOHead';
// getSupabase: Supabase 클라이언트(서버와 통신할 도구)를 만들어 돌려주는 함수.
import getSupabase from '../../utils/supabase';
// site: 사이트별 설정 모음(도메인, DB 접두사 등). 한 코드베이스로 여러 사이트를 운영하기 위함.
import site from '../../config/site';
// groupByPerson: 같은 사람의 중복 프로필을 하나로 묶어 주는 유틸 함수(아래에서 사용).
import { groupByPerson } from '../../utils/people';
// UserProfile: 사용자 프로필 한 건의 "모양(타입)"을 정의한 것. 실행 코드가 아닌 타입만 import.
import type { UserProfile } from '../../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 Supabase 테이블명을 생성.
// 여러 사이트가 동일 Supabase 인스턴스를 공유하므로 접두사로 테이블을 분리한다.
// 개념: `${...}`는 템플릿 리터럴(백틱 문자열). 문자열 안에 변수 값을 끼워 넣는 문법이다.
//       예) dbPrefix가 'rest_'이면 `${site.dbPrefix}teams` → 'rest_teams'.
// 주의: 백틱 문자열 안에는 절대 주석을 넣지 말 것(주석 글자가 실제 테이블명에 섞여 버린다).
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
 *
 *   참고: ": ReactElement"는 "이 함수는 React가 그릴 수 있는 화면 요소를 돌려준다"는 타입 표시.
 *   참고: "마운트"란 이 컴포넌트가 화면에 처음 나타나는 순간을 뜻한다.
 */
const AdminDashboard = (): ReactElement => {
  // 상단 통계 카드에 표시할 집계 값. 초기값은 모두 0으로 두고 로딩 후 setStats로 채운다.
  // useState 개념: [현재값, 값을 바꾸는 함수] 형태의 배열을 돌려준다(구조 분해 할당).
  //   - stats: 지금 화면에 보여 줄 통계 값(읽기 전용으로 다룬다).
  //   - setStats: 이 값을 새 값으로 교체하는 함수. 호출하면 React가 화면을 다시 그린다.
  // 주의: stats를 직접 수정(stats.students = 1)하면 안 된다. 반드시 setStats로 "새 객체"를
  //       넣어야 React가 변경을 감지한다(불변성 원칙).
  const [stats, setStats] = useState({ students: 0, assignments: 0, submissions: 0, teams: 0, projects: 0 });

  // 마운트 시 1회만 실행(의존성 배열 []): 대시보드 통계를 비동기로 로드한다.
  // useEffect 개념: 화면을 그린 "이후"에 실행할 부수효과(데이터 가져오기, 구독 등)를 등록한다.
  //   - 두 번째 인자(의존성 배열)가 빈 [] 이면 → 처음 마운트될 때 딱 한 번만 실행.
  //   - 만약 [stats] 처럼 값을 넣으면 그 값이 바뀔 때마다 다시 실행된다.
  // 주의: useEffect의 콜백 함수 자체에는 async를 붙일 수 없다. 그래서 아래처럼 내부에
  //       async 함수(load)를 따로 만들고, 그 함수를 호출하는 방식을 쓴다.
  useEffect(() => {
    // load: Supabase에서 통계를 병렬 조회해 stats 상태를 갱신하는 내부 비동기 함수.
    const load = async () => {
      // Supabase와 통신할 클라이언트(도구)를 가져온다.
      const client = getSupabase();
      // Supabase 클라이언트가 없으면(미초기화/환경설정 누락) 조회를 건너뛴다.
      // 옵셔널: 이렇게 "없으면 일찍 return" 하는 패턴을 가드(guard)라고 부른다.
      //         이후 코드에서 client가 null이 아님이 보장되므로 안전하게 사용할 수 있다.
      if (!client) return;
      // 5개 쿼리를 Promise.all로 병렬 실행해 지연을 최소화.
      // Promise.all 개념: 여러 비동기 작업을 "동시에" 시작하고, 전부 끝날 때까지 한 번에 기다린다.
      //   - 순서대로 await 5번 하면 (시간1+시간2+...) 만큼 걸리지만,
      //     Promise.all은 가장 오래 걸리는 하나만큼만 기다리므로 훨씬 빠르다.
      //   - 반환은 입력 순서와 같은 순서의 결과 배열 → 구조 분해로 5개 변수에 나눠 받는다.
      // 주의: Promise.all은 하나라도 실패(reject)하면 전체가 실패한다. 여기서는 Supabase가
      //       에러를 던지지 않고 결과 객체에 담아 주므로 보통 reject되진 않는다.
      // - user_profiles: visited_sites에 이 사이트 도메인이 포함된 행만 LIKE로 필터(이 LMS 방문자).
      //     .like('컬럼', '%...%') 에서 % 는 "아무 문자나 와도 됨"을 뜻하는 와일드카드.
      //     즉 visited_sites 안 어딘가에 'rest.dreamitbiz.com'이 들어 있는 행만 가져온다.
      // - 나머지 4개: count: 'exact'로 행 개수만 정확히 집계(데이터 본문은 불필요).
      //     select('id', { count: 'exact' }) → id만 최소로 받으면서 전체 개수를 함께 받는다.
      const [profileRes, assignRes, subRes, teamRes, projRes] = await Promise.all([
        client.from('user_profiles').select('id, name, display_name, phone, last_sign_in_at, updated_at').like('visited_sites', '%rest.dreamitbiz.com%'),
        client.from(TABLES.assignments).select('id', { count: 'exact' }),
        client.from(TABLES.submissions).select('id', { count: 'exact' }),
        client.from(TABLES.teams).select('id', { count: 'exact' }),
        client.from(TABLES.projects).select('id', { count: 'exact' }),
      ]);
      // 동일인(전화/이름) 통합 인원수
      // groupByPerson으로 같은 사람의 중복 프로필을 묶은 뒤 그룹 수 = 실제 수강생 수.
      // (profileRes.data || []) 의미:
      //   - 조회 결과 데이터가 없으면(data가 null/undefined) 빈 배열 []로 대체한다.
      //   - 이렇게 해야 뒤이어 .length 등을 호출할 때 "null에서 속성 읽기" 오류를 막는다.
      // "as UserProfile[]" 의미: TypeScript에게 "이 배열은 UserProfile 모양들이다"라고 알려 주는
      //   타입 단언(type assertion). 실행 동작은 바꾸지 않고, 타입 검사만 통과시킨다.
      const studentCount = groupByPerson((profileRes.data || []) as UserProfile[]).length;
      // 집계 결과를 상태에 반영. count가 null일 수 있으므로 || 0으로 방어.
      // setStats에 "새 객체"를 통째로 넣는다(불변성). 이 호출이 곧 화면 갱신을 일으킨다.
      // (값 || 0): count가 null/undefined/0 같은 거짓값이면 0을 쓴다. 여기선 주로 null 대비.
      // 주의: 이 setStats는 비동기 응답이 도착한 "뒤"에 실행된다. 그 사이 사용자가 다른
      //       페이지로 떠나 컴포넌트가 사라졌다면 갱신이 무의미할 수 있으나, 마운트 1회용
      //       단순 조회라 여기서는 별도 취소 처리를 하지 않는다(엣지케이스 참고).
      setStats({
        students: studentCount,
        assignments: assignRes.count || 0,
        submissions: subRes.count || 0,
        teams: teamRes.count || 0,
        projects: projRes.count || 0,
      });
    };
    // 위에서 "정의만" 한 load 함수를 실제로 실행한다.
    // 주의: load()는 Promise를 반환하지만 여기서 await하지 않는다(useEffect 콜백이 동기여야 하므로).
    //       "불러오기 시작만" 시키고, 결과가 오면 내부의 setStats가 알아서 화면을 갱신한다.
    load();
  }, []); // 빈 의존성 배열: 마운트 시 단 한 번만 이 effect를 실행하라는 뜻.

  // 아래 return: 이 컴포넌트가 화면에 그릴 JSX(UI 구조)를 돌려준다.
  // <>...</>: "프래그먼트". 불필요한 div를 추가하지 않고 여러 요소를 하나로 묶는 빈 껍데기.
  return (
    <>
      {/* SEO 메타 설정. 관리자 페이지이므로 noindex로 검색엔진 색인 차단. */}
      {/* noindex는 값 없이 쓰면 true로 전달되는 boolean prop이다. */}
      <SEOHead title="관리자 대시보드" path="/admin" noindex />
      <div className="admin-layout">
        {/* 좌측 공통 관리자 내비게이션 사이드바 */}
        <AdminSidebar />
        <div className="admin-content">
          <h2>관리자 대시보드</h2>
          {/* 상단 통계 카드 영역: stats 상태값을 카드별로 표시 */}
          {/* 중괄호 안에 자바스크립트 값을 넣으면 그 값이 화면에 출력된다(예: {stats.students}). */}
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
