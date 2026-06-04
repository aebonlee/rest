import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

/**
 * 구현된 팀 프로젝트 앱 컴포넌트 매핑 (id → lazy 컴포넌트).
 * 새 앱을 추가하면 여기에 등록만 하면 갤러리·라우트에 자동 반영된다.
 */
export const APP_COMPONENTS: Record<number, LazyExoticComponent<ComponentType>> = {
  1: lazy(() => import('./Project01')),
  2: lazy(() => import('./Project02')),
  3: lazy(() => import('./Project03')),
};

export const IMPLEMENTED_APP_IDS = new Set(Object.keys(APP_COMPONENTS).map(Number));
