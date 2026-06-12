/**
 * ProjectSidebar.tsx — "팀 활동" 좌측 단계 메뉴
 *  - PROJECT_STEPS를 단계 번호(1,2,3…)와 함께 세로로 나열한다.
 *  - 관리자 사이드바 CSS(admin-sidebar*)를 재사용해 모양을 통일한다.
 *  - 현재 경로(하위 경로 포함)를 active로 강조.
 */
import { Link, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { PROJECT_STEPS } from '../data/projectSteps';
import { EmojiIcon } from '../utils/emojiIcon';

const ProjectSidebar = (): ReactElement => {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h3>프로젝트 · 팀 활동</h3>
      </div>
      <nav className="admin-sidebar-nav">
        {PROJECT_STEPS.map((s, i) => {
          const active = isActive(s.path);
          return (
            <Link key={s.path} to={s.path} className={`admin-sidebar-item ${active ? 'active' : ''}`}>
              {/* 단계 번호 배지(원형) */}
              <span
                className="admin-sidebar-icon"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  fontSize: '12px', fontWeight: 800,
                  background: active ? 'var(--primary-blue)' : 'var(--bg-light-gray)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {i + 1}
              </span>
              <span className="admin-sidebar-label">{s.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-footer">
        <Link to="/project-guide" className="admin-sidebar-item">
          <span className="admin-sidebar-icon"><EmojiIcon char="💡" /></span>
          <span className="admin-sidebar-label">아이디어 예시</span>
        </Link>
        <Link to="/projects/apps" className="admin-sidebar-item">
          <span className="admin-sidebar-icon"><EmojiIcon char="🖼️" /></span>
          <span className="admin-sidebar-label">구현 예시</span>
        </Link>
        <Link to="/" className="admin-sidebar-item">
          <span className="admin-sidebar-icon"><EmojiIcon char="🏠" /></span>
          <span className="admin-sidebar-label">사이트로 돌아가기</span>
        </Link>
      </div>
    </aside>
  );
};

export default ProjectSidebar;
