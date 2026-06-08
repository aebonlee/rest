/**
 * 팀 프로젝트 수행 체크리스트 DAO (Supabase)
 *  - 테이블: rest_team_checklist (team_id 고유, items JSONB = { [itemKey]: boolean })
 *  - 표준 항목 정의는 data/projectChecklist.ts. 여기서는 팀별 "체크 상태"만 읽고 쓴다.
 *
 * [설계 메모]
 *  - 항목별로 행을 만들지 않고, 한 팀당 한 행(items JSONB)에 모아 둔다(rest_teams.members와 동일 패턴).
 *    → 토글할 때 items 맵을 통째로 다시 써서 upsert 한다.
 *  - RLS: 조회는 로그인 사용자 전체(강사 모니터링), 쓰기는 해당 팀원만(SQL 정책에서 강제).
 */
import getSupabase from './supabase';
import site from '../config/site';

// 사이트 접두사를 붙인 실제 테이블명 (예: 'rest_team_checklist')
export const TEAM_CHECKLIST_TABLE = `${site.dbPrefix}team_checklist`;

// 체크리스트 한 행의 형태.
export interface TeamChecklistRow {
  team_id: string;                  // 대상 팀 id(rest_teams.id)
  items: Record<string, boolean>;   // 항목 key → 완료 여부
}

/**
 * 전체 팀의 체크 상태를 조회해 "team_id → items 맵"으로 돌려준다.
 * @returns Record<teamId, Record<itemKey, boolean>> (없거나 에러 시 빈 객체)
 */
export async function listChecklists(): Promise<Record<string, Record<string, boolean>>> {
  const client = getSupabase();
  if (!client) return {};
  const { data, error } = await client.from(TEAM_CHECKLIST_TABLE).select('team_id, items');
  if (error) { console.error('listChecklists', error); return {}; }
  const map: Record<string, Record<string, boolean>> = {};
  (data ?? []).forEach((r) => {
    const row = r as TeamChecklistRow;
    map[row.team_id] = (row.items || {}) as Record<string, boolean>;
  });
  return map;
}

/**
 * 한 팀의 특정 항목 완료 여부를 토글(설정)한다.
 *  - 기존 items 맵을 복사해 해당 key만 갱신한 뒤 upsert(team_id 충돌 시 갱신).
 * @param teamId 대상 팀 id
 * @param itemKey 항목 key
 * @param done 완료 여부
 * @param current 현재 items 맵(화면이 들고 있는 최신값)
 * @returns { ok, error? }
 */
export async function setChecklistItem(
  teamId: string,
  itemKey: string,
  done: boolean,
  current: Record<string, boolean>,
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // 불변성: 원본을 직접 바꾸지 않고 새 맵을 만든다.
  const items = { ...current, [itemKey]: done };
  const { error } = await client
    .from(TEAM_CHECKLIST_TABLE)
    .upsert({ team_id: teamId, items }, { onConflict: 'team_id' });
  return error ? { ok: false, error: error.message } : { ok: true };
}
