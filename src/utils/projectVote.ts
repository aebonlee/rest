/**
 * 프로젝트 주제 투표 유틸
 *  - 추가 주제: rest_project_topics (학생이 새로 제안한 주제)
 *  - 투표: rest_topic_votes (1인 1표, UNIQUE(user_id) — 재투표 시 변경)
 *  - topic_key: 프리셋은 'p1'~'p7', 추가 주제는 해당 행 id(UUID)
 *
 * [파일 역할]
 *  학생들이 제안한 프로젝트 주제(커스텀 토픽)와 그에 대한 투표를 관리하는
 *  Supabase 데이터 접근 계층(DAO) 유틸 모음이다.
 *
 * [핵심 책임]
 *  - 커스텀 주제 목록 조회/추가/삭제
 *  - 투표 목록 조회, 1인 1표 업서트(재투표 시 변경), 투표 철회
 *  - Supabase 클라이언트 미초기화 등 예외 상황을 안전하게 처리(빈 배열/에러 객체 반환)
 *
 * [주요 export]
 *  - 상수: TOPICS_TABLE, VOTES_TABLE
 *  - 타입: CustomTopic, TopicVote
 *  - 함수: listCustomTopics, listVotes, addTopic, deleteTopic, castVote, retractVote
 */
// Supabase 클라이언트 팩토리(미설정 시 null 반환 가능)
import getSupabase from './supabase';
// 사이트별 설정(여기서는 DB 테이블 접두사 dbPrefix 사용)
import site from '../config/site';

// 사이트별 접두사를 붙인 실제 테이블명 (예: 'rest_project_topics')
export const TOPICS_TABLE = `${site.dbPrefix}project_topics`;
// 사이트별 접두사를 붙인 투표 테이블명 (예: 'rest_topic_votes')
export const VOTES_TABLE = `${site.dbPrefix}topic_votes`;

// 학생이 추가한 커스텀 주제 한 건의 데이터 형태
export interface CustomTopic {
  id: string;              // 주제 행 PK(UUID), 투표 시 topic_key로도 사용됨
  title: string;           // 주제 제목
  description: string;     // 주제 설명
  created_by: string;      // 제안자 user_id
  created_by_name: string; // 제안자 표시 이름
  created_at: string;      // 생성 시각(ISO 문자열)
}

// 투표 한 건의 데이터 형태
export interface TopicVote {
  id?: string;        // 투표 행 PK(서버 생성, 조회 시에만 존재)
  topic_key: string;  // 투표 대상 키(프리셋 'p1'~'p7' 또는 커스텀 주제 UUID)
  user_id: string;    // 투표자 user_id (UNIQUE — 1인 1표 보장)
  user_name: string;  // 투표자 표시 이름
}

/**
 * 커스텀 주제 전체 목록을 생성 시각 순으로 조회한다.
 * @returns CustomTopic 배열(클라이언트 없음/에러 시 빈 배열)
 * @sideeffect 에러 발생 시 콘솔 로깅
 */
export async function listCustomTopics(): Promise<CustomTopic[]> {
  const client = getSupabase();
  if (!client) return []; // Supabase 미설정 환경에서는 빈 목록으로 graceful 처리
  const { data, error } = await client.from(TOPICS_TABLE).select('*').order('created_at');
  if (error) { console.error('listCustomTopics', error); return []; }
  return (data ?? []) as CustomTopic[]; // data가 null일 경우 빈 배열로 대체
}

/**
 * 투표 전체 목록을 조회한다(집계/현재 사용자 투표 판단 등에 사용).
 * @returns TopicVote 배열(클라이언트 없음/에러 시 빈 배열)
 * @sideeffect 에러 발생 시 콘솔 로깅
 */
export async function listVotes(): Promise<TopicVote[]> {
  const client = getSupabase();
  if (!client) return []; // 미설정 환경 방어
  const { data, error } = await client.from(VOTES_TABLE).select('*');
  if (error) { console.error('listVotes', error); return []; }
  return (data ?? []) as TopicVote[]; // null 방어
}

/**
 * 새 커스텀 주제를 추가한다.
 * @param title 주제 제목
 * @param description 주제 설명
 * @param userId 제안자 user_id
 * @param userName 제안자 표시 이름
 * @returns { ok, id?, error? } — 성공 시 ok:true와 생성된 행 id, 실패 시 error 메시지
 * @sideeffect TOPICS_TABLE에 한 행 INSERT
 */
export async function addTopic(title: string, description: string, userId: string, userName: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' }; // 클라이언트 미초기화 식별용 코드
  const { data, error } = await client.from(TOPICS_TABLE)
    .insert({ title, description, created_by: userId, created_by_name: userName })
    .select().single(); // 삽입한 행을 단건으로 되돌려 받아 id 추출
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as CustomTopic).id };
}

/**
 * 커스텀 주제를 id로 삭제한다.
 * @param id 삭제할 주제 행 PK(UUID)
 * @returns { ok, error? }
 * @sideeffect TOPICS_TABLE에서 해당 행 DELETE (RLS 정책에 따라 권한 검사)
 */
export async function deleteTopic(id: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TOPICS_TABLE).delete().eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * 1인 1표 업서트 (user_id 충돌 시 topic_key 변경)
 *
 * user_id가 UNIQUE이므로 동일 사용자가 다시 투표하면 INSERT 충돌이 발생하고,
 * onConflict:'user_id'에 의해 기존 행의 topic_key/user_name이 UPDATE된다.
 * 즉 재투표가 곧 투표 변경이 된다.
 * @param topicKey 투표 대상 키(프리셋 'p1'~'p7' 또는 커스텀 주제 UUID)
 * @param userId 투표자 user_id
 * @param userName 투표자 표시 이름
 * @returns { ok, error? }
 * @sideeffect VOTES_TABLE에 upsert(삽입 또는 갱신)
 */
export async function castVote(topicKey: string, userId: string, userName: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(VOTES_TABLE)
    // onConflict로 user_id 단일 컬럼 충돌을 지정 → 1인 1표 보장
    .upsert({ topic_key: topicKey, user_id: userId, user_name: userName }, { onConflict: 'user_id' });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * 특정 사용자의 투표를 철회(삭제)한다.
 * @param userId 철회할 투표자 user_id
 * @returns { ok, error? }
 * @sideeffect VOTES_TABLE에서 해당 user_id 행 DELETE
 */
export async function retractVote(userId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(VOTES_TABLE).delete().eq('user_id', userId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
