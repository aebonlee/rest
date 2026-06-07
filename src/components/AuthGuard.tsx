/**
 * AuthGuard.tsx — 로그인 보호 래퍼(라우트 가드)
 *
 * 역할:
 *  - 자식 요소를 감싸 "로그인한 사용자만" 볼 수 있도록 막는 보호 컴포넌트.
 *
 * 핵심 책임:
 *  - 인증 상태 로딩 중에는 스피너 표시.
 *  - 미로그인 시 /login으로 리다이렉트하되, 원래 가려던 위치(location)를 state로 넘겨 로그인 후 복귀 가능.
 *  - 로그인 상태면 자식을 그대로 렌더.
 *
 * 주요 export:
 *  - default: AuthGuard (보호 래퍼 컴포넌트)
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactElement } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;   // 보호 대상(로그인해야 볼 수 있는 화면)
}

// AuthGuard — children을 인증 여부에 따라 렌더/차단한다.
const AuthGuard = ({ children }: AuthGuardProps): ReactElement | null => {
  // 전역 인증 컨텍스트에서 로그인 여부와 초기 로딩 상태를 가져온다.
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();   // 미로그인 리다이렉트 시 복귀 지점으로 사용

  // 세션 확인이 끝나기 전(loading)에는 깜빡임 방지를 위해 스피너만 표시.
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // 미로그인 → 로그인 페이지로. state.from에 원래 위치를 담아 로그인 후 되돌아올 수 있게 함. replace로 히스토리 오염 방지.
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 로그인 상태 → 보호 대상 그대로 렌더.
  return <>{children}</>;
};

export default AuthGuard;
