/**
 * settings.ts — 운영 설정(키-값) DAO
 *  - 테이블: rest_settings (key text PK, value jsonb)
 *  - 예: 'project_vote_locked'(boolean) — 팀구성 '강사 최종 확정' 잠금 상태.
 */
import getSupabase from './supabase';
import site from '../config/site';

export const SETTINGS_TABLE = `${site.dbPrefix}settings`;

/** 설정값 조회. 없거나 에러면 fallback 반환. */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const client = getSupabase();
  if (!client) return fallback;
  const { data, error } = await client.from(SETTINGS_TABLE).select('value').eq('key', key).maybeSingle();
  if (error || !data) return fallback;
  const v = (data as { value: unknown }).value;
  return (v === null || v === undefined ? fallback : (v as T));
}

/** 설정값 저장(upsert). */
export async function setSetting(key: string, value: unknown): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(SETTINGS_TABLE).upsert({ key, value }, { onConflict: 'key' });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 팀구성 잠금 키 상수.
export const VOTE_LOCK_KEY = 'project_vote_locked';
