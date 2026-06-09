/**
 * teamNumber.ts — 팀 번호 부여 유틸
 *  - 팀의 주제(project_topic)로 고정 보드 번호(boardOrder 1~21)를 매긴다.
 *  - boardOrder에 없는 "새로 제안된 주제"는 BOARD_SIZE 다음부터(22, 23 …) 생성순으로 자동 부여.
 *    → 주제가 늘어나도 모든 팀이 번호를 갖게 된다(빠짐 없음).
 */
import { getBoardNo, BOARD_SIZE } from '../data/boardOrder';
import type { Team } from '../types';

/**
 * 팀 목록 → { team.id: 번호 } 맵.
 * @param teams listTeams() 결과(생성순 정렬 가정 → 미등록 주제의 임시 번호가 안정적).
 */
export function buildTeamNumbers(teams: Team[]): Record<string, number> {
  const map: Record<string, number> = {};
  let extra = BOARD_SIZE; // 미등록 주제는 21 다음부터
  teams.forEach((t) => {
    const fixed = getBoardNo(t.project_topic);
    map[t.id] = fixed ?? (++extra);
  });
  return map;
}
