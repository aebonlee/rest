/**
 * teamNumber.ts — 팀 번호 부여 유틸
 *  - 팀의 주제(project_topic)로 고정 보드 번호(boardOrder 1~21)를 매긴다.
 *  - boardOrder에 없는 "새로 접수된 주제"는 빈 슬롯(예: 3번)을 먼저 채우고, 그 다음 22, 23 …으로 부여.
 *    → 주제가 늘어나도 모든 팀이 번호를 갖고, 삭제로 생긴 빈 번호가 먼저 재사용된다.
 */
import { getBoardNo, assignExtraNumbers } from '../data/boardOrder';
import type { Team } from '../types';

/**
 * 팀 목록 → { team.id: 번호 } 맵.
 * @param teams listTeams() 결과(생성순 정렬 가정 → 미등록 주제의 번호가 안정적).
 */
export function buildTeamNumbers(teams: Team[]): Record<string, number> {
  const map: Record<string, number> = {};
  const unregistered: string[] = []; // 보드에 없는 새 주제 팀들(생성순)
  teams.forEach((t) => {
    const fixed = getBoardNo(t.project_topic);
    if (fixed !== undefined) map[t.id] = fixed;
    else unregistered.push(t.id);
  });
  // 빈 슬롯(3번 등) 우선 → 그 다음 22+ 로 배정
  Object.assign(map, assignExtraNumbers(unregistered));
  return map;
}
