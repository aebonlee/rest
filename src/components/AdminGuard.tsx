/**
 * AdminGuard.tsx
 *
 * 역할:
 *   관리자 전용 라우트를 보호하는 가드(Guard) 컴포넌트.
 *   children으로 감싼 페이지/컴포넌트를 렌더링하기 전에 인증 상태와 관리자 권한을 검사한다.
 *
 * 핵심 책임:
 *   1) AuthContext에서 로그인/관리자/로딩 상태를 읽어온다.
 *   2) 인증 정보 로딩 중에는 로딩 스피너를 보여준다.
 *   3) 비로그인 사용자는 로그인 페이지(/login)로 리다이렉트(원래 위치를 state로 전달).
 *   4) 로그인했지만 관리자가 아니면 홈(/)으로 리다이렉트.
 *   5) 위 조건을 모두 통과하면 children을 그대로 렌더링.
 *
 * 주요 export:
 *   - default: AdminGuard 컴포넌트
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactElement } from 'react';

// AdminGuard가 보호할 대상을 children으로 받기 위한 props 타입
interface AdminGuardProps {
  children: React.ReactNode; // 가드를 통과했을 때 렌더링할 보호 대상 노드
}

/**
 * AdminGuard
 *   관리자 권한이 필요한 라우트를 감싸 접근을 제어하는 가드 컴포넌트.
 *
 * @param children 인증/권한 검사를 통과했을 때 렌더링할 자식 노드
 * @returns 로딩 스피너, 리다이렉트(Navigate), 또는 children. ReactElement 또는 null.
 * @sideeffect 조건 미충족 시 React Router의 Navigate로 경로를 이동시킨다(렌더 부수효과).
 */
const AdminGuard = ({ children }: AdminGuardProps): ReactElement | null => {
  // 전역 인증 컨텍스트에서 로그인 여부, 관리자 여부, 로딩 상태를 구독
  const { isLoggedIn, isAdmin, loading } = useAuth();
  // 현재 위치 정보 — 비로그인 리다이렉트 시 원래 가려던 경로를 state로 보존하기 위해 사용
  const location = useLocation();

  // 인증 상태가 아직 확정되지 않은 동안에는 섣불리 리다이렉트하지 않고 스피너를 표시
  // (loading 중에 판단하면 깜빡임/오판단으로 잘못된 리다이렉트가 발생할 수 있음)
  if (loading) {
    return (
      // 화면 중앙에 로딩 스피너를 배치하는 컨테이너
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        {/* 실제 회전 애니메이션이 적용되는 스피너 엘리먼트 */}
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // 비로그인 상태: 로그인 페이지로 이동. state.from에 현재 위치를 담아 로그인 후 복귀 가능하게 함
  // replace를 사용해 히스토리에 가드 경로가 쌓이지 않도록 처리(뒤로가기 루프 방지)
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 로그인은 했으나 관리자 권한이 없는 경우: 홈으로 이동(권한 없는 페이지 노출 차단)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 모든 검사를 통과한 관리자에게만 보호 대상 children을 렌더링
  return <>{children}</>;
};

export default AdminGuard;
