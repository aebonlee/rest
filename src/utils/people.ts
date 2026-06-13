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
// 설정에 등록된 수동 동일인 그룹을 펼쳐 이메일→묶음키 맵을 구성.
for (const g of SAME_PERSON_EMAIL_GROUPS) {
  const emails = g.emails.map(normEmail).filter(Boolean);
  const canon = [...emails].sort()[0];   // 정렬 후 첫 이메일을 대표(canonical)로 — 그룹 키를 안정적으로 고정
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
  const map = new Map<string, UserProfile[]>();   // 묶음키 → 계정들
  const order: string[] = [];                      // 최초 등장 순서 보존용
  // 1패스: personKey로 같은 사람끼리 묶고, 키의 첫 등장 순서를 기록.
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
  // 2패스: 각 묶음을 최근 로그인순 정렬 후 대표(primary) 선정해 PersonGroup으로 변환.
  return order.map((key) => {
    const accounts = [...map.get(key)!].sort((a, b) => recency(b) - recency(a));   // 최신 활동 계정이 0번(대표)
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

/** 미가입(계정 매칭 실패) 명단 학생을 위한 합성 프로필 — 화면 표기/타입 안정용(실제 계정 아님). */
const syntheticProfile = (name: string, email: string): UserProfile => ({
  id: `roster:${email || name}`, email, name, display_name: name, avatar_url: '',
  phone: '', provider: '', role: 'member', signup_domain: '', visited_sites: [],
  last_sign_in_at: '', updated_at: '',
});

/** 명단 학생 1명을 표현하는 입력 타입(roster.ts의 RosterStudent와 호환). */
export interface RosterEntry { no: number; name: string; emails: string[]; }

/**
 * 공식 명단(이메일)을 기준으로 사람을 묶는다 — 출결·성적의 source of truth.
 *  · 명단 순서를 그대로 유지하고, 학생마다 emails 로 user_profiles 계정을 매칭한다.
 *  · 전화번호/이름 자동 통합과 달리 "다른 학생이 같은 전화번호"여도 절대 섞이지 않는다.
 *  · 계정을 못 찾은(미가입) 학생도 빈 ids 로 포함되어 화면에서 바로 드러난다.
 */
export function groupByRoster(roster: RosterEntry[], profiles: UserProfile[]): PersonGroup[] {
  const byEmail = new Map<string, UserProfile>();
  for (const p of profiles) {
    const e = normEmail(p.email);
    if (e) byEmail.set(e, p);
  }
  return roster.map((st) => {
    const matched = st.emails
      .map((e) => byEmail.get(normEmail(e)))
      .filter((p): p is UserProfile => !!p)
      .sort((a, b) => recency(b) - recency(a));   // 최근 활동 계정이 대표
    const primary = matched[0] || syntheticProfile(st.name, st.emails[0] || '');
    return {
      key: `roster:${st.no}`,
      primary,
      accounts: matched,
      ids: matched.map((a) => a.id),
      emails: matched.length ? matched.map((a) => a.email).filter(Boolean) : st.emails,
      name: st.name,
      phone: primary.phone || '',
      isMerged: matched.length > 1,
    };
  });
}
