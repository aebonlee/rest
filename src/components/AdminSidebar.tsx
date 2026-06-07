/**
 * AdminSidebar.tsx
 *
 * 역할:
 *   - 관리자(어드민) 화면 좌측에 고정으로 표시되는 사이드바 네비게이션 컴포넌트.
 *   - 관리자 전용 페이지들(대시보드, 수강생 관리, 자료 관리 등)로 이동하는 링크 목록을 렌더링한다.
 *
 * 핵심 책임:
 *   - adminMenuItems 배열을 순회하여 각 메뉴 링크를 생성한다.
 *   - 현재 URL 경로(useLocation)와 메뉴 경로를 비교하여 활성(active) 메뉴를 강조한다.
 *   - 하단 푸터에 일반 사이트로 돌아가는 링크를 제공한다.
 *
 * 주요 export:
 *   - default export: AdminSidebar (React 함수형 컴포넌트)
 */

// react-router-dom: SPA 라우팅용 Link(클라이언트 측 페이지 이동)와
// useLocation(현재 경로 정보 조회) 훅을 가져온다.
import { Link, useLocation } from 'react-router-dom';
// ReactElement: 컴포넌트 반환 타입 명시를 위한 타입 전용 import.
import type { ReactElement } from 'react';

// 관리자 사이드바에 표시할 메뉴 정의 목록.
//  - path: 이동할 라우트 경로(활성 상태 비교 기준이기도 함)
//  - label: 화면에 표시될 한글 메뉴명
//  - icon: 메뉴 옆에 표시할 이모지 아이콘
// 메뉴 추가/순서 변경은 이 배열만 수정하면 사이드바에 반영된다.
const adminMenuItems = [
  { path: '/admin', label: '대시보드', icon: '📊' },
  { path: '/admin/students', label: '수강생 관리', icon: '👥' },
  { path: '/admin/roster', label: '명단 대조', icon: '🧾' },
  { path: '/admin/materials', label: '자료 관리', icon: '📁' },
  { path: '/admin/assignments', label: '과제 관리', icon: '📝' },
  { path: '/admin/attendance', label: '출석 관리', icon: '✅' },
  { path: '/admin/grades', label: '학습평가 성적', icon: '🎯' },
  { path: '/admin/announcements', label: '공지사항', icon: '📢' },
  { path: '/admin/teams', label: '팀 편성', icon: '🤝' },
  { path: '/admin/projects', label: '프로젝트', icon: '🚀' },
];

/**
 * AdminSidebar
 *
 * 무엇을 하는지: 관리자 메뉴 항목들을 링크 형태로 렌더링하고, 현재 경로에 해당하는
 *               메뉴에 'active' 클래스를 부여하여 시각적으로 강조한다.
 * 매개변수: 없음 (props 미사용)
 * 반환값: ReactElement — 사이드바 전체를 감싸는 <aside> 엘리먼트
 * 부수효과: 없음 (순수 렌더링 컴포넌트, 외부 상태 변경 없음)
 */
const AdminSidebar = (): ReactElement => {
  // 현재 활성화된 라우트 정보를 가져온다.
  // location.pathname을 메뉴 항목 path와 비교해 활성 메뉴를 판별하는 데 사용.
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      {/* 사이드바 상단 헤더: 영역 제목 표시 */}
      <div className="admin-sidebar-header">
        <h3>관리자 메뉴</h3>
      </div>
      {/* 메뉴 네비게이션: adminMenuItems를 순회하며 링크 목록 생성 */}
      <nav className="admin-sidebar-nav">
        {adminMenuItems.map((item) => (
          <Link
            // key: React 리스트 렌더링 최적화를 위한 고유 키(경로는 항목별로 유일)
            key={item.path}
            to={item.path}
            // 현재 경로와 메뉴 경로가 정확히 일치하면 'active' 클래스를 추가하여 강조.
            // (완전 일치 비교이므로 하위 경로에서는 부모 메뉴가 active 되지 않음)
            className={`admin-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {/* 메뉴 아이콘(이모지) */}
            <span className="admin-sidebar-icon">{item.icon}</span>
            {/* 메뉴 텍스트 라벨 */}
            <span className="admin-sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* 사이드바 하단 푸터: 관리자 영역을 벗어나 일반 사이트 홈으로 돌아가는 링크 */}
      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-sidebar-item">
          <span className="admin-sidebar-icon">🏠</span>
          <span className="admin-sidebar-label">사이트로 돌아가기</span>
        </Link>
      </div>
    </aside>
  );
};

// 기본 export: 관리자 레이아웃 등에서 import하여 사용한다.
export default AdminSidebar;
