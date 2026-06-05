/**
 * 프로젝트 팀 구성 + 팀별 게시판 유틸
 *  - 팀: rest_teams (members JSONB = TeamMember[])
 *  - 게시판: rest_team_posts (팀별 비공개 — RLS로 팀원+관리자만)
 */
import getSupabase from './supabase';
import site from '../config/site';
import type { Team, TeamMember } from '../types';

export const TEAMS_TABLE = `${site.dbPrefix}teams`;
export const TEAM_POSTS_TABLE = `${site.dbPrefix}team_posts`;
export const TEAM_COMMENTS_TABLE = `${site.dbPrefix}team_comments`;
export const MAX_TEAM_SIZE = 6;

/** 글 카테고리 */
export type PostCategory = 'note' | 'idea' | 'resource' | 'etc';
export const POST_CATEGORIES: { key: PostCategory; label: string; emoji: string }[] = [
  { key: 'note', label: '회의록', emoji: '📝' },
  { key: 'idea', label: '아이디어', emoji: '💡' },
  { key: 'resource', label: '자료', emoji: '📎' },
  { key: 'etc', label: '기타', emoji: '🗨️' },
];

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

export interface TeamComment {
  id: string;
  post_id: string;
  team_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_staff: boolean;
  created_at: string;
}

const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);

export async function listTeams(): Promise<Team[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(TEAMS_TABLE).select('*').order('created_at');
  if (error) { console.error('listTeams', error); return []; }
  return (data ?? []) as Team[];
}

/** 내가 속한 팀 찾기 (members에 내 id 포함) */
export function findMyTeam(teams: Team[], userId: string): Team | null {
  return teams.find((t) => members(t).some((m) => m.id === userId)) ?? null;
}

export async function createTeam(name: string, topic: string, leader: TeamMember): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAMS_TABLE).insert({
    name, project_topic: topic, description: '', members: [leader],
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function joinTeam(team: Team, member: TeamMember): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const list = members(team);
  if (list.some((m) => m.id === member.id)) return { ok: true };
  if (list.length >= MAX_TEAM_SIZE) return { ok: false, error: 'full' };
  const { error } = await client.from(TEAMS_TABLE).update({ members: [...list, member] }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function leaveTeam(team: Team, userId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).filter((m) => m.id !== userId);
  if (next.length === 0) {
    // 마지막 팀원이 나가면 팀 삭제 (게시글은 ON DELETE CASCADE)
    const { error } = await client.from(TEAMS_TABLE).delete().eq('id', team.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 팀장 지원/취소 — 본인 역할을 '팀장후보' ↔ '팀원' 토글 (확정 팀장은 변경 안 함) */
export async function volunteerLeader(team: Team, userId: string, on: boolean): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).map((m) =>
    m.id === userId && m.role !== '팀장' ? { ...m, role: on ? '팀장후보' : '팀원' } : m,
  );
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * 선착순 팀장 등록 — 먼저 누른 1명이 팀장.
 * 최신 팀 상태를 다시 읽어 이미 팀장이 있으면 거절(taken), 없으면 본인을 '팀장'으로 확정.
 */
export async function claimLeader(teamId: string, memberId: string): Promise<{ ok: boolean; error?: string; takenBy?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { data, error: fe } = await client.from(TEAMS_TABLE).select('*').eq('id', teamId).single();
  if (fe || !data) return { ok: false, error: fe?.message || 'not-found' };
  const team = data as Team;
  const list = members(team);
  const existing = list.find((m) => m.role === '팀장');
  if (existing) return { ok: false, error: 'taken', takenBy: existing.name };
  if (!list.some((m) => m.id === memberId)) return { ok: false, error: 'not-member' };
  const next = list.map((m) => ({ ...m, role: m.id === memberId ? '팀장' : '팀원' }));
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', teamId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 강사 전용: 팀장 확정 — 지정 멤버를 '팀장', 나머지 팀장/후보는 '팀원'으로 */
export async function confirmLeader(team: Team, memberId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).map((m) => ({
    ...m,
    role: m.id === memberId ? '팀장' : (m.role === '팀장' || m.role === '팀장후보' ? '팀원' : m.role),
  }));
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 강사 전용: 팀장/후보 초기화 — 모두 '팀원'으로 */
export async function resetLeaders(team: Team): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).map((m) =>
    (m.role === '팀장' || m.role === '팀장후보') ? { ...m, role: '팀원' } : m,
  );
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function listTeamPosts(teamId: string): Promise<TeamPost[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(TEAM_POSTS_TABLE).select('*').eq('team_id', teamId).order('created_at', { ascending: false });
  if (error) { console.error('listTeamPosts', error); return []; }
  return (data ?? []) as TeamPost[];
}

export async function createTeamPost(teamId: string, authorId: string, authorName: string, title: string, content: string, category: PostCategory = 'note', code = '', linkUrl = ''): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).insert({
    team_id: teamId, author_id: authorId, author_name: authorName, title, content, category, code, link_url: linkUrl,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export interface TeamPostEdit {
  title: string;
  content: string;
  category: PostCategory;
  code: string;
  link_url: string;
}

export async function updateTeamPost(postId: string, patch: TeamPostEdit): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).update({
    title: patch.title, content: patch.content, category: patch.category, code: patch.code, link_url: patch.link_url,
  }).eq('id', postId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteTeamPost(postId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).delete().eq('id', postId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ── 댓글 ──
export async function listTeamComments(teamId: string): Promise<TeamComment[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(TEAM_COMMENTS_TABLE).select('*').eq('team_id', teamId).order('created_at');
  if (error) { console.error('listTeamComments', error); return []; }
  return (data ?? []) as TeamComment[];
}

export async function createTeamComment(postId: string, teamId: string, authorId: string, authorName: string, content: string, isStaff = false): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_COMMENTS_TABLE).insert({ post_id: postId, team_id: teamId, author_id: authorId, author_name: authorName, content, is_staff: isStaff });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteTeamComment(commentId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_COMMENTS_TABLE).delete().eq('id', commentId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
