import { Link, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';

const adminMenuItems = [
  { path: '/admin', label: '대시보드', icon: '📊' },
  { path: '/admin/students', label: '수강생 관리', icon: '👥' },
  { path: '/admin/materials', label: '자료 관리', icon: '📁' },
  { path: '/admin/assignments', label: '과제 관리', icon: '📝' },
  { path: '/admin/attendance', label: '출석 관리', icon: '✅' },
  { path: '/admin/announcements', label: '공지사항', icon: '📢' },
  { path: '/admin/teams', label: '팀 편성', icon: '🤝' },
  { path: '/admin/projects', label: '프로젝트', icon: '🚀' },
];

const AdminSidebar = (): ReactElement => {
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h3>관리자 메뉴</h3>
      </div>
      <nav className="admin-sidebar-nav">
        {adminMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="admin-sidebar-icon">{item.icon}</span>
            <span className="admin-sidebar-label">{item.label}</span>
          </Link>
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

export default AdminSidebar;
