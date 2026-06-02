/**
 * 동일인 통합 — 한 사람이 이메일(계정)을 2개 이상 만든 경우를 묶어서 관리.
 *  · 판별 키: 전화번호(숫자만) 우선, 전화가 없으면 이름.
 *  · 비파괴: 계정은 그대로 두고(두 이메일 모두 로그인 가능) 화면에서만 한 명으로 묶음.
 */
import type { UserProfile } from '../types';
import { SAME_PERSON_EMAIL_GROUPS } from '../config/admin';

/** 전화번호에서 숫자만 추출 (동일인 판별 키) */
export const normalizePhone = (phone?: string | null): string =>
  (phone || '').replace(/\D/g, '');

const normName = (s?: string | null): string =>
  (s || '').toLowerCase().replace(/\s+/g, '').trim();

const normEmail = (s?: string | null): string => (s || '').toLowerCase().trim();

/** 명시적 동일인 묶음: 이메일(소문자) → { 묶음 키, 표시 이름 } */
const EMAIL_ALIAS = new Map<string, { key: string; name?: string }>();
for (const g of SAME_PERSON_EMAIL_GROUPS) {
  const emails = g.emails.map(normEmail).filter(Boolean);
  const canon = [...emails].sort()[0];
  const key = `same:${canon}`;
  for (const e of emails) EMAIL_ALIAS.set(e, { key, name: g.name });
}

const aliasOf = (p: UserProfile) => EMAIL_ALIAS.get(normEmail(p.email));

/** 같은 사람을 묶는 키: 명시적 동일인 묶음 > 전화번호(숫자) > 이름 > id(단독) */
export const personKey = (p: UserProfile): string => {
  const alias = aliasOf(p);
  if (alias) return alias.key;
  const phone = normalizePhone(p.phone);
  if (phone) return `tel:${phone}`;
  const name = normName(p.display_name) || normName(p.name);
  return name ? `name:${name}` : `id:${p.id}`;
};

export interface PersonGroup {
  key: string;
  /** 대표 계정 (최근 로그인 우선) */
  primary: UserProfile;
  /** 묶인 모든 계정 (대표가 0번) */
  accounts: UserProfile[];
  /** 모든 계정 id — 출결·성적 등 student_id 매칭에 사용 */
  ids: string[];
  /** 모든 이메일 */
  emails: string[];
  name: string;
  phone: string;
  /** 2계정 이상(동일인 통합됨) */
  isMerged: boolean;
}

const recency = (p: UserProfile): number => {
  const t = p.last_sign_in_at || p.updated_at;
  return t ? Date.parse(t) : 0;
};

/** user_profiles 배열을 동일인 기준으로 그룹화 (입력 순서 유지) */
export function groupByPerson(profiles: UserProfile[]): PersonGroup[] {
  const map = new Map<string, UserProfile[]>();
  const order: string[] = [];
  for (const p of profiles) {
    const k = personKey(p);
    const arr = map.get(k);
    if (arr) {
      arr.push(p);
    } else {
      map.set(k, [p]);
      order.push(k);
    }
  }
  return order.map((key) => {
    const accounts = [...map.get(key)!].sort((a, b) => recency(b) - recency(a));
    const primary = accounts[0];
    // 명시적 동일인 묶음에 지정한 이름이 있으면 표시 이름으로 우선 사용
    const aliasName = accounts.map(aliasOf).find((a) => a?.name)?.name;
    return {
      key,
      primary,
      accounts,
      ids: accounts.map((a) => a.id),
      emails: accounts.map((a) => a.email).filter(Boolean),
      name: aliasName || primary.display_name || primary.name || primary.email || '-',
      phone: primary.phone || '',
      isMerged: accounts.length > 1,
    };
  });
}

/** id → 그 사람의 모든 계정 id 집합. (한 계정 id로 동일인의 전체 id를 찾을 때) */
export function buildIdToPersonIds(profiles: UserProfile[]): Map<string, string[]> {
  const groups = groupByPerson(profiles);
  const m = new Map<string, string[]>();
  for (const g of groups) for (const id of g.ids) m.set(id, g.ids);
  return m;
}
