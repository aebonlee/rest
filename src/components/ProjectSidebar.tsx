/**
 * ProjectSidebar.tsx — "프로젝트" 섹션 좌측 메뉴
 *  - 프로젝트 관련 페이지(참고·예시 / 팀 활동)로 이동하는 사이드바.
 *  - 관리자 사이드바와 동일한 CSS(admin-sidebar*)를 재사용해 모양을 통일한다.
 *  - 현재 경로에 해당하는 메뉴를 active로 강조(하위 경로 포함).
 */
import { Link, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';

// 메뉴 그룹: title이 있으면 섹션 구분 라벨을 먼저 표시한다.
const groups: { title: string | null; items: { path: string; label: string; icon: string }[] }[] = [
  {
    title: null,
    items: [
      { path: '/project-guide', label: '프로젝트 아이디어 예시', icon: '💡' },
      { path: '/projects/apps', label: '프로젝트 구현 예시', icon: '🖼️' },
    ],
  },
  {
    title: '팀 활동',
    items: [
      { path: '/project-vote', label: '프로젝트 팀구성', icon: '👥' },
      { path: '/project-schedule', label: '일정 · 마일스톤', icon: '🗓️' },
      { path: '/project-checklist', label: '수행 점검 · 할 일', icon: '✅' },
      { path: '/project-board', label: '프로젝트 관리(게시판)', icon: '💬' },
      { path: '/project-padlets', label: '팀별 패들렛', icon: '📌' },
      { path: '/project-submit', label: '산출물 제출', icon: '📤' },
    ],
  },
];

const ProjectSidebar = (): ReactElement => {
  const { pathname } = useLocation();
  // 현재 경로가 메뉴 경로와 같거나 그 하위(/project-guide/123 등)면 active.
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h3>프로젝트</h3>
      </div>
      <nav className="admin-sidebar-nav">
        {groups.map((g, gi) => (
          <div key={gi}>
            {/* 그룹 구분 라벨(팀 활동 등) */}
            {g.title && (
              <div style={{ padding: '14px 16px 4px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.02em', color: 'var(--text-secondary)', borderTop: gi > 0 ? '1px solid var(--border-light)' : 'none', marginTop: gi > 0 ? '8px' : 0 }}>
                {g.title}
              </div>
            )}
            {g.items.map((item) => (
              <Link key={item.path} to={item.path} className={`admin-sidebar-item ${isActive(item.path) ? 'active' : ''}`}>
                <span className="admin-sidebar-icon">{item.icon}</span>
                <span className="admin-sidebar-label">{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-sidebar-item">
          <span className="admin-sidebar-icon">🏠</span>
          <span className="admin-sidebar-label">사이트로 돌아가기</span>
        </Link>
      </div>
    </aside>
  );
};

export default ProjectSidebar;
