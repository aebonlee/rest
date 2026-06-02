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
export const MAX_TEAM_SIZE = 6;

export interface TeamPost {
  id: string;
  team_id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
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

export async function createTeamPost(teamId: string, authorId: string, authorName: string, title: string, content: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).insert({
    team_id: teamId, author_id: authorId, author_name: authorName, title, content,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteTeamPost(postId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).delete().eq('id', postId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
