/* =============================================================================
 * projectChecklist.ts
 * -----------------------------------------------------------------------------
 * 역할:
 *   팀 프로젝트 "수행 점검·할 일"의 표준 마일스톤(점검 항목)을 정의하는 정적 데이터.
 *   각 팀은 이 항목들을 체크하며 진행하고, 진행률(%)로 한눈에 상태를 본다.
 *
 * 핵심:
 *   - CHECKLIST_PHASES: 단계(기획→개발→배포·공유→발표) 묶음.
 *   - CHECKLIST_ITEMS : 단계별 점검 항목(key/label/desc/phase). key는 DB 저장 키로 사용.
 *
 * 주의:
 *   - key는 한 번 정하면 바꾸지 않는다(이미 저장된 팀별 체크 상태와 연결이 끊김).
 * ============================================================================= */

// 점검 항목 한 건의 형태.
export interface ChecklistItem {
  key: string;   // 저장용 고유 키(변경 금지)
  label: string; // 화면에 보일 항목명
  desc: string;  // 한 줄 설명(무엇을 하면 되는지)
  phase: string; // 소속 단계(CHECKLIST_PHASES 중 하나)
}

// 프로젝트 진행 단계(표시·그룹핑 순서).
export const CHECKLIST_PHASES = ['기획', '개발', '배포·공유', '발표'] as const;

// 표준 점검 항목 10개(단계 순서대로). 모든 팀 공통 베이스.
export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: 'topic',     phase: '기획',      label: '주제·팀·팀장 확정',      desc: '투표로 주제를 정하고 팀과 팀장을 확정한다.' },
  { key: 'plan',      phase: '기획',      label: '기획서(기능 정의)',      desc: '핵심 기능과 사용자 흐름을 한 장으로 정리한다.' },
  { key: 'wireframe', phase: '기획',      label: '화면 설계(와이어프레임)', desc: '주요 화면의 구성을 그려 본다.' },
  { key: 'data',      phase: '개발',      label: '데이터·프롬프트 설계',    desc: '필요한 데이터와 AI 프롬프트를 설계한다.' },
  { key: 'mvp',       phase: '개발',      label: 'MVP 개발',               desc: '핵심 기능이 동작하는 최소 제품을 만든다.' },
  { key: 'test',      phase: '개발',      label: '테스트',                 desc: '주요 기능을 직접 사용해 보며 버그를 잡는다.' },
  { key: 'deploy',    phase: '배포·공유', label: 'GitHub Pages 배포',      desc: '결과물을 project 번호 레포로 배포한다.' },
  { key: 'padlet',    phase: '배포·공유', label: '패들렛 정리·문서화',      desc: '진행 과정과 산출물을 패들렛에 정리한다.' },
  { key: 'slides',    phase: '발표',      label: '발표자료',               desc: '문제·해결·데모·회고를 담은 발표자료를 만든다.' },
  { key: 'demo',      phase: '발표',      label: '최종 발표',              desc: '팀 프로젝트를 발표하고 피드백을 받는다.' },
];

// 전체 항목 수(진행률 계산 기준).
export const CHECKLIST_TOTAL = CHECKLIST_ITEMS.length;

/**
 * 팀의 체크 상태(items 맵)로 완료 개수·진행률(%)을 계산한다.
 * @param items { [key]: boolean } 형태의 체크 맵(없으면 빈 객체)
 * @returns { done, total, percent }
 */
export function checklistProgress(items: Record<string, boolean> | undefined): { done: number; total: number; percent: number } {
  const map = items || {};
  // 정의된 항목 중에서만 센다(과거 key가 남아 있어도 무시).
  const done = CHECKLIST_ITEMS.filter((it) => map[it.key]).length;
  return { done, total: CHECKLIST_TOTAL, percent: Math.round((done / CHECKLIST_TOTAL) * 100) };
}
