/**
 * ProjectLayout.tsx — "프로젝트" 섹션 공통 레이아웃(좌측 사이드바 + 본문)
 *  - 라우트 레이아웃으로 사용: 하위 프로젝트 페이지가 <Outlet/> 자리에 렌더된다.
 *  - 관리자 레이아웃(admin-layout/admin-content) CSS를 재사용하고,
 *    project-content 스코프 CSS(admin.css)로 페이지 배너를 콤팩트 헤더로 조정한다.
 */
import { Outlet } from 'react-router-dom';
import type { ReactElement } from 'react';
import ProjectSidebar from '../components/ProjectSidebar';

const ProjectLayout = (): ReactElement => (
  <div className="admin-layout project-layout">
    <ProjectSidebar />
    <div className="admin-content project-content">
      <Outlet />
    </div>
  </div>
);

export default ProjectLayout;
