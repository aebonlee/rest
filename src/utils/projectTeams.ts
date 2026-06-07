/**
 * 프로젝트 팀 구성 + 팀별 게시판 유틸
 *  - 팀: rest_teams (members JSONB = TeamMember[])
 *  - 게시판: rest_team_posts (팀별 비공개 — RLS로 팀원+관리자만)
 *
 * [파일 역할]
 *  - 프로젝트 팀(생성/가입/탈퇴/팀장 선정)과 팀별 비공개 게시판(글·댓글) 전반을
 *    Supabase로 다루는 데이터 액세스 유틸 모음이다.
 *
 * [핵심 책임]
 *  - 팀 CRUD 및 멤버십 관리: members(JSONB 배열)를 통째로 갱신하는 방식으로 처리.
 *  - 팀장 선정 로직: 자발적 지원(volunteerLeader), 선착순 등록(claimLeader),
 *    강사 확정/초기화(confirmLeader/resetLeaders) 등 다양한 시나리오 지원.
 *  - 팀별 게시글/댓글 CRUD. RLS 정책으로 접근 권한은 DB 측에서 강제됨(여기서는 데이터만 다룸).
 *
 * [주요 export]
 *  - 상수/타입: TEAMS_TABLE, TEAM_POSTS_TABLE, TEAM_COMMENTS_TABLE, MAX_TEAM_SIZE,
 *    PostCategory, POST_CATEGORIES, TeamPost, TeamComment, TeamPostEdit
 *  - 팀: listTeams, findMyTeam, createTeam, joinTeam, leaveTeam,
 *    volunteerLeader, claimLeader, confirmLeader, resetLeaders
 *  - 게시판: listTeamPosts, createTeamPost, updateTeamPost, deleteTeamPost
 *  - 댓글: listTeamComments, createTeamComment, deleteTeamComment
 */
import getSupabase from './supabase';
import site from '../config/site';
import type { Team, TeamMember } from '../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 테이블명을 구성한다(멀티 사이트 격리 목적).
export const TEAMS_TABLE = `${site.dbPrefix}teams`;
export const TEAM_POSTS_TABLE = `${site.dbPrefix}team_posts`;
export const TEAM_COMMENTS_TABLE = `${site.dbPrefix}team_comments`;
// 한 팀의 최대 인원 수. joinTeam에서 이 값을 초과하면 가입을 거절한다.
export const MAX_TEAM_SIZE = 6;

/** 글 카테고리 */
// 게시글 분류 키 타입. DB의 category 컬럼 값과 1:1 매칭된다.
export type PostCategory = 'note' | 'idea' | 'resource' | 'etc';
// UI에서 카테고리 선택/표시에 쓰는 메타 목록(키 + 라벨 + 이모지).
export const POST_CATEGORIES: { key: PostCategory; label: string; emoji: string }[] = [
  { key: 'note', label: '회의록', emoji: '📝' },
  { key: 'idea', label: '아이디어', emoji: '💡' },
  { key: 'resource', label: '자료', emoji: '📎' },
  { key: 'etc', label: '기타', emoji: '🗨️' },
];

// 팀 게시글 한 건의 형태(rest_team_posts 행과 매핑).
export interface TeamPost {
  id: string;
  team_id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  category: PostCategory;
  code: string;
  link_url: string;
  created_at: string;
}

// 팀 게시글 댓글 한 건의 형태(rest_team_comments 행과 매핑).
export interface TeamComment {
  id: string;
  post_id: string;
  team_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_staff: boolean; // 강사/관리자 작성 여부(UI 강조 등에 사용)
  created_at: string;
}

// 팀의 members(JSONB)를 안전하게 배열로 정규화하는 헬퍼.
// 매개변수: t(Team). 반환값: TeamMember[] (배열이 아니면 빈 배열). 부수효과 없음.
const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);

// 전체 팀 목록을 생성일 오름차순으로 조회한다.
// 매개변수: 없음. 반환값: Team[](클라이언트 없거나 오류 시 빈 배열).
// 부수효과: Supabase select, 오류 시 콘솔 로깅.
export async function listTeams(): Promise<Team[]> {
  const client = getSupabase();
  if (!client) return []; // Supabase 미설정 환경 방어
  const { data, error } = await client.from(TEAMS_TABLE).select('*').order('created_at');
  if (error) { console.error('listTeams', error); return []; }
  return (data ?? []) as Team[];
}

/** 내가 속한 팀 찾기 (members에 내 id 포함) */
// 매개변수: teams(전체 팀 목록), userId(현재 사용자 id).
// 반환값: 내가 멤버로 포함된 첫 팀, 없으면 null. 동기 함수, 부수효과 없음.
export function findMyTeam(teams: Team[], userId: string): Team | null {
  return teams.find((t) => members(t).some((m) => m.id === userId)) ?? null;
}

// 새 팀을 생성한다(생성자가 유일 멤버로 들어감).
// 매개변수: name(팀명), topic(프로젝트 주제), leader(생성자 멤버 객체).
// 반환값: { ok, error? }. 부수효과: TEAMS_TABLE insert.
export async function createTeam(name: string, topic: string, leader: TeamMember): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAMS_TABLE).insert({
    name, project_topic: topic, description: '', members: [leader], // 멤버 배열을 생성자 1명으로 초기화
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 기존 팀에 멤버를 추가한다(members 배열에 append).
// 매개변수: team(대상 팀), member(가입할 멤버).
// 반환값: { ok, error? }. 'full'=정원 초과. 이미 멤버면 ok=true로 멱등 처리.
// 부수효과: TEAMS_TABLE update.
export async function joinTeam(team: Team, member: TeamMember): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const list = members(team);
  if (list.some((m) => m.id === member.id)) return { ok: true }; // 중복 가입은 성공으로 간주(멱등)
  if (list.length >= MAX_TEAM_SIZE) return { ok: false, error: 'full' }; // 정원 초과 방어
  const { error } = await client.from(TEAMS_TABLE).update({ members: [...list, member] }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 팀에서 특정 사용자를 제거한다. 마지막 한 명이 나가면 팀 자체를 삭제.
// 매개변수: team(대상 팀), userId(나갈 사용자 id).
// 반환값: { ok, error? }. 부수효과: TEAMS_TABLE update 또는 delete.
export async function leaveTeam(team: Team, userId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).filter((m) => m.id !== userId); // 본인을 제외한 멤버 목록
  if (next.length === 0) {
    // 마지막 팀원이 나가면 팀 삭제 (게시글은 ON DELETE CASCADE)
    // → 빈 팀이 남지 않도록 정리. 연관 글/댓글은 FK CASCADE로 자동 삭제됨.
    const { error } = await client.from(TEAMS_TABLE).delete().eq('id', team.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 팀장 지원/취소 — 본인 역할을 '팀장후보' ↔ '팀원' 토글 (확정 팀장은 변경 안 함) */
// 매개변수: team(대상 팀), userId(본인 id), on(true=지원, false=취소).
// 반환값: { ok, error? }. 부수효과: TEAMS_TABLE update.
export async function volunteerLeader(team: Team, userId: string, on: boolean): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).map((m) =>
    // 본인이면서 이미 확정 '팀장'이 아닌 경우에만 역할을 후보/팀원으로 토글.
    // (확정 팀장은 이 함수로 강등되지 않도록 보호)
    m.id === userId && m.role !== '팀장' ? { ...m, role: on ? '팀장후보' : '팀원' } : m,
  );
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * 선착순 팀장 등록 — 먼저 누른 1명이 팀장.
 * 최신 팀 상태를 다시 읽어 이미 팀장이 있으면 거절(taken), 없으면 본인을 '팀장'으로 확정.
 */
// 매개변수: teamId(팀 id), memberId(팀장이 되려는 멤버 id).
// 반환값: { ok, error?, takenBy? }. 'taken'=이미 팀장 존재(takenBy=기존 팀장명),
//        'not-member'=해당 팀 멤버 아님, 'not-found'=팀 없음.
// 부수효과: TEAMS_TABLE select(최신 상태 재조회) 후 update.
export async function claimLeader(teamId: string, memberId: string): Promise<{ ok: boolean; error?: string; takenBy?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // 경합(race) 완화를 위해 캐시된 team이 아니라 DB에서 최신 상태를 다시 읽는다.
  const { data, error: fe } = await client.from(TEAMS_TABLE).select('*').eq('id', teamId).single();
  if (fe || !data) return { ok: false, error: fe?.message || 'not-found' };
  const team = data as Team;
  const list = members(team);
  const existing = list.find((m) => m.role === '팀장'); // 이미 확정된 팀장 존재 여부
  if (existing) return { ok: false, error: 'taken', takenBy: existing.name }; // 선착순 패배 → 거절
  if (!list.some((m) => m.id === memberId)) return { ok: false, error: 'not-member' }; // 멤버가 아니면 등록 불가
  // 본인을 '팀장', 나머지를 '팀원'으로 일괄 설정.
  const next = list.map((m) => ({ ...m, role: m.id === memberId ? '팀장' : '팀원' }));
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', teamId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 강사 전용: 팀장 확정 — 지정 멤버를 '팀장', 나머지 팀장/후보는 '팀원'으로 */
// 매개변수: team(대상 팀), memberId(팀장으로 확정할 멤버 id).
// 반환값: { ok, error? }. 부수효과: TEAMS_TABLE update.
export async function confirmLeader(team: Team, memberId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).map((m) => ({
    ...m,
    // 지정 멤버는 '팀장'으로, 기존 팀장/후보는 '팀원'으로 강등, 그 외 역할은 그대로 유지.
    role: m.id === memberId ? '팀장' : (m.role === '팀장' || m.role === '팀장후보' ? '팀원' : m.role),
  }));
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 강사 전용: 팀장/후보 초기화 — 모두 '팀원'으로 */
// 매개변수: team(대상 팀). 반환값: { ok, error? }. 부수효과: TEAMS_TABLE update.
export async function resetLeaders(team: Team): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).map((m) =>
    // '팀장' 또는 '팀장후보'였던 멤버만 '팀원'으로 되돌리고, 나머지는 그대로 둔다.
    (m.role === '팀장' || m.role === '팀장후보') ? { ...m, role: '팀원' } : m,
  );
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 특정 팀의 게시글을 최신순(생성일 내림차순)으로 조회한다.
// 매개변수: teamId. 반환값: TeamPost[](오류/미설정 시 빈 배열).
// 부수효과: TEAM_POSTS_TABLE select. RLS로 팀원+관리자만 실제 데이터를 받음.
export async function listTeamPosts(teamId: string): Promise<TeamPost[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(TEAM_POSTS_TABLE).select('*').eq('team_id', teamId).order('created_at', { ascending: false });
  if (error) { console.error('listTeamPosts', error); return []; }
  return (data ?? []) as TeamPost[];
}

// 팀 게시글을 새로 작성한다.
// 매개변수: teamId, authorId, authorName, title, content,
//          category(기본 'note'), code(기본 ''), linkUrl(기본 '').
// 반환값: { ok, error? }. 부수효과: TEAM_POSTS_TABLE insert.
export async function createTeamPost(teamId: string, authorId: string, authorName: string, title: string, content: string, category: PostCategory = 'note', code = '', linkUrl = ''): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).insert({
    // linkUrl 인자는 DB 컬럼명(link_url)으로 매핑하여 저장.
    team_id: teamId, author_id: authorId, author_name: authorName, title, content, category, code, link_url: linkUrl,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 게시글 수정 시 변경 가능한 필드 집합.
export interface TeamPostEdit {
  title: string;
  content: string;
  category: PostCategory;
  code: string;
  link_url: string;
}

// 기존 게시글을 수정한다.
// 매개변수: postId(글 id), patch(TeamPostEdit). 반환값: { ok, error? }.
// 부수효과: TEAM_POSTS_TABLE update. 수정 권한은 RLS로 통제됨.
export async function updateTeamPost(postId: string, patch: TeamPostEdit): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).update({
    title: patch.title, content: patch.content, category: patch.category, code: patch.code, link_url: patch.link_url,
  }).eq('id', postId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 게시글을 삭제한다.
// 매개변수: postId. 반환값: { ok, error? }. 부수효과: TEAM_POSTS_TABLE delete.
export async function deleteTeamPost(postId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).delete().eq('id', postId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ── 댓글 ──
// 특정 팀의 모든 댓글을 생성일 오름차순으로 조회한다(게시글별로 묶는 건 호출 측 책임).
// 매개변수: teamId. 반환값: TeamComment[](오류/미설정 시 빈 배열).
// 부수효과: TEAM_COMMENTS_TABLE select.
export async function listTeamComments(teamId: string): Promise<TeamComment[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(TEAM_COMMENTS_TABLE).select('*').eq('team_id', teamId).order('created_at');
  if (error) { console.error('listTeamComments', error); return []; }
  return (data ?? []) as TeamComment[];
}

// 댓글을 새로 작성한다.
// 매개변수: postId(대상 글), teamId(소속 팀), authorId, authorName, content,
//          isStaff(강사/관리자 작성 여부, 기본 false).
// 반환값: { ok, error? }. 부수효과: TEAM_COMMENTS_TABLE insert.
export async function createTeamComment(postId: string, teamId: string, authorId: string, authorName: string, content: string, isStaff = false): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_COMMENTS_TABLE).insert({ post_id: postId, team_id: teamId, author_id: authorId, author_name: authorName, content, is_staff: isStaff });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 댓글을 삭제한다.
// 매개변수: commentId. 반환값: { ok, error? }. 부수효과: TEAM_COMMENTS_TABLE delete.
export async function deleteTeamComment(commentId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_COMMENTS_TABLE).delete().eq('id', commentId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
