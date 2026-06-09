/* =============================================================================
 * projectSteps.ts
 * -----------------------------------------------------------------------------
 * "팀 활동" 단계 순서 + 단계별 가이드(단일 진실 공급원).
 *  - 좌측 사이드바(번호)·상단 스텝바·이전/다음·"이번 단계 가이드"가 모두 이 배열을 따른다.
 *  - 순서/문구를 바꾸려면 이 배열만 수정한다.
 * ============================================================================= */

export interface ProjectStep {
  path: string;     // 라우트 경로
  label: string;    // 짧은 단계명(사이드바/스텝바)
  icon: string;     // 보조 아이콘
  summary: string;  // 이번 단계에서 무엇을 하는지(한 줄 안내)
  todos: string[];  // 이번 단계에 할 일(체크 형태로 안내)
}

export const PROJECT_STEPS: ProjectStep[] = [
  {
    path: '/project-vote', label: '팀구성', icon: '👥',
    summary: '관심 주제에 투표하고 팀을 만들거나 합류하세요. 팀장은 먼저 신청한 사람이 됩니다.',
    todos: ['주제에 투표(1인 1표)', '이 주제로 팀 만들기 또는 합류', '팀장 신청(선착순)'],
  },
  {
    path: '/project-schedule', label: '일정 · 마일스톤', icon: '🗓️',
    summary: '전체 일정과 주차별 목표(기획 → 개발 → 배포·공유 → 발표)를 확인하세요.',
    todos: ['4단계 진행 흐름 파악', '주차별 마일스톤·목표 확인', '우리 팀 계획 잡기'],
  },
  {
    path: '/project-checklist', label: '수행 점검 · 할 일', icon: '✅',
    summary: '표준 마일스톤을 단계별로 체크하며 진행하세요. 진행률이 자동으로 올라갑니다.',
    todos: ['기획·개발·배포·발표 항목 체크', '팀 진행률(%) 확인', '남은 할 일 분담'],
  },
  {
    path: '/project-board', label: '게시판(협업)', icon: '💬',
    summary: '팀 게시판에서 회의록·아이디어·자료·코드를 공유하며 협업하세요.',
    todos: ['회의록 기록', '아이디어·자료 공유', '서로의 글에 댓글로 피드백'],
  },
  {
    path: '/project-padlets', label: '팀별 패들렛', icon: '📌',
    summary: '우리 팀 번호의 패들렛 보드에 진행 과정과 산출물을 정리하세요.',
    todos: ['우리 팀 패들렛 열기', '진행 과정·화면·자료 정리', '문서화'],
  },
  {
    path: '/project-submit', label: '산출물 제출', icon: '📤',
    summary: '최종 산출물(데모·발표자료·소스)을 제출하세요. 강사가 확인합니다.',
    todos: ['데모/배포 URL 입력', '발표자료 링크 입력', '소스 저장소 링크 입력 후 저장'],
  },
];

/** 현재 경로가 몇 번째 단계인지(0-based). 단계 밖이면 -1. */
export function stepIndexOf(pathname: string): number {
  return PROJECT_STEPS.findIndex((s) => pathname === s.path || pathname.startsWith(s.path + '/'));
}
