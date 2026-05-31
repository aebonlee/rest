/**
 * 프로젝트 주제 투표 유틸
 *  - 추가 주제: rest_project_topics (학생이 새로 제안한 주제)
 *  - 투표: rest_topic_votes (1인 1표, UNIQUE(user_id) — 재투표 시 변경)
 *  - topic_key: 프리셋은 'p1'~'p7', 추가 주제는 해당 행 id(UUID)
 */
import getSupabase from './supabase';
import site from '../config/site';

export const TOPICS_TABLE = `${site.dbPrefix}project_topics`;
export const VOTES_TABLE = `${site.dbPrefix}topic_votes`;

export interface CustomTopic {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface TopicVote {
  id?: string;
  topic_key: string;
  user_id: string;
  user_name: string;
}

export async function listCustomTopics(): Promise<CustomTopic[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(TOPICS_TABLE).select('*').order('created_at');
  if (error) { console.error('listCustomTopics', error); return []; }
  return (data ?? []) as CustomTopic[];
}

export async function listVotes(): Promise<TopicVote[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client.from(VOTES_TABLE).select('*');
  if (error) { console.error('listVotes', error); return []; }
  return (data ?? []) as TopicVote[];
}

export async function addTopic(title: string, description: string, userId: string, userName: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { data, error } = await client.from(TOPICS_TABLE)
    .insert({ title, description, created_by: userId, created_by_name: userName })
    .select().single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as CustomTopic).id };
}

export async function deleteTopic(id: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TOPICS_TABLE).delete().eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 1인 1표 업서트 (user_id 충돌 시 topic_key 변경) */
export async function castVote(topicKey: string, userId: string, userName: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(VOTES_TABLE)
    .upsert({ topic_key: topicKey, user_id: userId, user_name: userName }, { onConflict: 'user_id' });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function retractVote(userId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(VOTES_TABLE).delete().eq('user_id', userId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
