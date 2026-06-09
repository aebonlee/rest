/**
 * teamNumber.ts — 팀 번호 부여 유틸
 *  - 팀의 주제(project_topic)로 고정 보드 번호(boardOrder 1~21)를 매긴다.
 *  - boardOrder에 없는 "새로 접수된 주제"는 빈 슬롯(예: 3번)을 먼저 채우고, 그 다음 22, 23 …으로 부여.
 *    → 주제가 늘어나도 모든 팀이 번호를 갖고, 삭제로 생긴 빈 번호가 먼저 재사용된다.
 */
import { topicNumber, extraNumbersByTitle } from '../data/boardOrder';
import type { Team } from '../types';

/**
 * 팀 목록 → { team.id: 번호 } 맵.
 *  - 번호는 "주제 제목" 기준(topicNumber). 미등록 주제 번호는 customTopics(생성순)에서 산출 →
 *    팀구성/수행점검/게시판/산출물 제출 등 모든 화면이 같은 번호를 갖는다.
 * @param teams listTeams() 결과
 * @param customTopics rest_project_topics(생성순) — 미등록 주제 번호의 단일 기준
 */
export function buildTeamNumbers(teams: Team[], customTopics: { title: string }[] = []): Record<string, number> {
  const extra = extraNumbersByTitle(customTopics.map((c) => c.title));
  const map: Record<string, number> = {};
  teams.forEach((t) => { map[t.id] = topicNumber(t.project_topic, extra); });
  return map;
}
