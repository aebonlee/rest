/* =============================================================================
 * projectSteps.ts
 * -----------------------------------------------------------------------------
 * "팀 활동" 단계 순서(단일 진실 공급원).
 *  - 좌측 사이드바(번호)·상단 스텝바·이전/다음 이동이 모두 이 배열을 따른다.
 *  - 순서를 바꾸려면 이 배열만 수정한다.
 * ============================================================================= */

export interface ProjectStep {
  path: string;   // 라우트 경로
  label: string;  // 짧은 단계명(사이드바/스텝바)
  icon: string;   // 보조 아이콘
}

export const PROJECT_STEPS: ProjectStep[] = [
  { path: '/project-vote',      label: '팀구성',          icon: '👥' },
  { path: '/project-schedule',  label: '일정 · 마일스톤',  icon: '🗓️' },
  { path: '/project-checklist', label: '수행 점검 · 할 일', icon: '✅' },
  { path: '/project-board',     label: '게시판(협업)',     icon: '💬' },
  { path: '/project-padlets',   label: '팀별 패들렛',      icon: '📌' },
  { path: '/project-submit',    label: '산출물 제출',      icon: '📤' },
];

/** 현재 경로가 몇 번째 단계인지(0-based). 단계 밖이면 -1. */
export function stepIndexOf(pathname: string): number {
  return PROJECT_STEPS.findIndex((s) => pathname === s.path || pathname.startsWith(s.path + '/'));
}
