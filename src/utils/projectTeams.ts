/**
 * 프로젝트 팀 구성 + 팀별 게시판 유틸
 *  - 팀: rest_teams (members JSONB = TeamMember[])
 *  - 게시판: rest_team_posts (팀별 비공개 — RLS로 팀원+관리자만)
 *
 * ──────────────────────────────────────────────────────────────────────────
 * [초보자를 위한 배경 설명]
 *  - 이 파일은 "데이터 액세스 유틸"이다. 즉 화면(UI)을 직접 그리지는 않고,
 *    데이터베이스에 저장된 팀/게시글/댓글을 "읽고 쓰는 함수"만 모아둔 곳이다.
 *    React 컴포넌트(화면)는 이 함수들을 불러다 쓰기만 하면 된다(역할 분리).
 *
 *  - Supabase란? 클라우드에 있는 PostgreSQL 데이터베이스를 자바스크립트에서
 *    쉽게 다루도록 해 주는 서비스다. client.from('테이블').select()/insert()/...
 *    형태로 SQL 없이 데이터를 다룬다.
 *
 *  - RLS(Row Level Security, 행 수준 보안)란? "어떤 사용자가 어떤 행(row)을
 *    읽고/쓸 수 있는지"를 데이터베이스 자체가 막아 주는 규칙이다.
 *    예) 팀 게시판은 그 팀원과 관리자만 볼 수 있게 DB가 강제한다.
 *    주의: 권한 검사는 "DB가" 한다. 이 파일의 코드는 권한을 다시 검사하지 않으며,
 *          단지 데이터를 요청할 뿐이다. 권한이 없으면 DB가 빈 결과/에러를 돌려준다.
 *
 *  - JSONB란? PostgreSQL이 "JSON 데이터를 통째로" 한 칸(컬럼)에 저장하는 타입이다.
 *    여기서는 한 팀의 멤버 목록(TeamMember[] 배열)을 members 컬럼 하나에 통째로 넣는다.
 *    그래서 멤버를 추가/삭제할 때 "행 하나를 부분 수정"하는 게 아니라
 *    "배열 전체를 새로 만들어 통째로 덮어쓰는(update)" 방식을 쓴다.
 *
 *  - async/await란? 데이터베이스 통신처럼 "시간이 걸리는 작업"을 다룰 때 쓴다.
 *    async 함수는 항상 Promise(나중에 값이 채워지는 약속 상자)를 반환하고,
 *    await는 그 작업이 끝날 때까지 잠시 기다렸다가 결과를 꺼내 준다.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * [파일 역할]
 *  - 프로젝트 팀(생성/가입/탈퇴/팀장 선정)과 팀별 비공개 게시판(글·댓글) 전반을
 *    Supabase로 다루는 데이터 액세스 유틸 모음이다.
 *
 * [핵심 책임]
 *  - 팀 CRUD 및 멤버십 관리: members(JSONB 배열)를 통째로 갱신하는 방식으로 처리.
 *    (CRUD = Create 생성 / Read 조회 / Update 수정 / Delete 삭제 의 약자)
 *  - 팀장 선정 로직: 자발적 지원(volunteerLeader), 선착순 등록(claimLeader),
 *    강사 확정/초기화(confirmLeader/resetLeaders) 등 다양한 시나리오 지원.
 *  - 팀별 게시글/댓글 CRUD. RLS 정책으로 접근 권한은 DB 측에서 강제됨(여기서는 데이터만 다룸).
 *
 * [주요 export]  (export = 다른 파일에서 import 해서 쓸 수 있게 "내보내기")
 *  - 상수/타입: TEAMS_TABLE, TEAM_POSTS_TABLE, TEAM_COMMENTS_TABLE, MAX_TEAM_SIZE,
 *    PostCategory, POST_CATEGORIES, TeamPost, TeamComment, TeamPostEdit
 *  - 팀: listTeams, findMyTeam, createTeam, joinTeam, leaveTeam,
 *    volunteerLeader, claimLeader, confirmLeader, resetLeaders
 *  - 게시판: listTeamPosts, createTeamPost, updateTeamPost, deleteTeamPost
 *  - 댓글: listTeamComments, createTeamComment, deleteTeamComment
 *
 * [거의 모든 함수가 공유하는 공통 패턴 — 한 번만 이해하면 됨]
 *  1) const client = getSupabase();         // DB 클라이언트(연결 객체)를 가져온다.
 *  2) if (!client) return ...;              // 연결이 없으면(환경설정 누락 등) 안전하게 빠져나간다.
 *  3) const { data, error } = await ...;    // DB 작업을 기다린다. 결과는 data+error 두 개로 온다.
 *  4) if (error) { ... }                    // 에러가 있으면 그에 맞게 처리한다.
 *  여기서 { data, error }는 "구조 분해 할당"이다. 객체에서 필요한 속성만 꺼내 변수로 받는 문법.
 *  주의: Supabase는 보통 예외(throw)를 던지지 않고 error 속성에 담아 돌려준다.
 *        그래서 try/catch보다 "error를 직접 확인"하는 패턴을 쓴다.
 */
import getSupabase from './supabase';
import site from '../config/site';
// 'import type'은 "타입 정보만" 가져온다는 뜻(TS 문법). 실제 실행 코드에는 포함되지 않아 번들이 가벼워진다.
import type { Team, TeamMember } from '../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 테이블명을 구성한다(멀티 사이트 격리 목적).
// 예) dbPrefix가 'rest_'이면 TEAMS_TABLE은 'rest_teams'가 된다.
// 백틱(`...`)으로 감싼 문자열은 템플릿 리터럴이라 부르며 ${...} 안의 값을 문자열에 끼워 넣는다.
// 이렇게 상수로 한 곳에 모아두면 테이블명을 바꿀 때 여기만 고치면 되어 실수가 줄어든다.
export const TEAMS_TABLE = `${site.dbPrefix}teams`;
export const TEAM_POSTS_TABLE = `${site.dbPrefix}team_posts`;
export const TEAM_COMMENTS_TABLE = `${site.dbPrefix}team_comments`;
// 한 팀의 최대 인원 수. joinTeam에서 이 값을 초과하면 가입을 거절한다.
// "매직 넘버"(코드에 직접 박힌 숫자)를 피하려고 이름 붙은 상수로 빼 두었다.
export const MAX_TEAM_SIZE = 6;

/** 글 카테고리 */
// 게시글 분류 키 타입. DB의 category 컬럼 값과 1:1 매칭된다.
// '|'로 이어진 것은 "유니언 타입"으로, 이 네 문자열 중 하나만 허용한다는 뜻(오타 방지에 유용).
export type PostCategory = 'note' | 'idea' | 'resource' | 'etc';
// UI에서 카테고리 선택/표시에 쓰는 메타 목록(키 + 라벨 + 이모지).
// key는 DB에 저장되는 실제 값, label/emoji는 사람에게 보여 줄 표시용이다.
export const POST_CATEGORIES: { key: PostCategory; label: string; emoji: string }[] = [
  { key: 'note', label: '회의록', emoji: '📝' },
  { key: 'idea', label: '아이디어', emoji: '💡' },
  { key: 'resource', label: '자료', emoji: '📎' },
  { key: 'etc', label: '기타', emoji: '🗨️' },
];

// 팀 게시글 한 건의 형태(rest_team_posts 행과 매핑).
// interface는 "객체가 어떤 속성을 가져야 하는지" 설명하는 TS 설계도다(실행 코드 아님).
// 여기 적힌 속성 이름은 DB 컬럼명과 같아야 데이터가 자연스럽게 들어맞는다.
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
// 왜 필요한가? DB의 members 값이 비어 있거나(null) 예상과 다른 형태일 수 있다.
//   이를 그대로 .map()/.filter() 하면 "is not a function" 같은 런타임 오류가 난다.
//   그래서 "항상 배열"임을 보장해 뒤따르는 코드를 안전하게 만든다(방어적 프로그래밍).
// Array.isArray(x): x가 진짜 배열인지 확인하는 표준 함수. 맞으면 그대로, 아니면 빈 배열 [].
const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);

// 전체 팀 목록을 생성일 오름차순으로 조회한다.
// 매개변수: 없음. 반환값: Team[](클라이언트 없거나 오류 시 빈 배열).
// 부수효과: Supabase select, 오류 시 콘솔 로깅.
// 주의: 실패해도 throw 하지 않고 빈 배열을 돌려준다. 호출 측 화면이 깨지지 않게 하려는 의도.
export async function listTeams(): Promise<Team[]> {
  const client = getSupabase();
  if (!client) return []; // Supabase 미설정 환경 방어
  // .from(테이블).select('*'): 해당 테이블의 모든 컬럼('*')을 가져온다.
  // .order('created_at'): created_at(생성일) 기준 오름차순 정렬. await로 결과를 기다린다.
  const { data, error } = await client.from(TEAMS_TABLE).select('*').order('created_at');
  if (error) { console.error('listTeams', error); return []; } // 에러는 콘솔에 남기고 빈 목록 반환
  // data가 null일 수도 있어 'data ?? []'로 기본값을 준다(?? = 널 병합 연산자).
  // 'as Team[]'은 "이 데이터를 Team 배열로 취급하라"는 TS 타입 단언(실제 값은 안 바뀜).
  return (data ?? []) as Team[];
}

/** 내가 속한 팀 찾기 (members에 내 id 포함) */
// 매개변수: teams(전체 팀 목록), userId(현재 사용자 id).
// 반환값: 내가 멤버로 포함된 첫 팀, 없으면 null. 동기 함수, 부수효과 없음.
// 동작: 각 팀(t)에 대해 그 팀의 멤버 중(some) 내 id와 같은 사람이 있는 첫 팀을 찾는다(find).
//   .some(...)=조건을 만족하는 멤버가 하나라도 있으면 true.
//   .find(...)=조건을 처음 만족하는 팀을 반환, 없으면 undefined.
// '?? null'로 undefined를 null로 통일해 반환 타입(Team | null)을 깔끔히 맞춘다.
export function findMyTeam(teams: Team[], userId: string): Team | null {
  return teams.find((t) => members(t).some((m) => m.id === userId)) ?? null;
}

// 새 팀을 생성한다(생성자가 유일 멤버로 들어감).
// 매개변수: name(팀명), topic(프로젝트 주제), leader(생성자 멤버 객체).
// 반환값: { ok, error? }. 부수효과: TEAMS_TABLE insert.
// 반환 형태가 boolean 하나가 아니라 객체인 이유: 성공 여부(ok)와 실패 사유(error)를
//   함께 돌려줘 호출 측이 사용자에게 알맞은 메시지를 보여줄 수 있게 하기 위함.
export async function createTeam(name: string, topic: string, leader: TeamMember): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // insert: 새 행을 추가한다. members는 생성자 1명만 담은 배열로 시작한다.
  const { error } = await client.from(TEAMS_TABLE).insert({
    name, project_topic: topic, description: '', members: [leader], // 멤버 배열을 생성자 1명으로 초기화
  });
  // 삼항 연산자(조건 ? A : B): error가 있으면 실패 객체, 없으면 성공 객체를 반환.
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 기존 팀에 멤버를 추가한다(members 배열에 append).
// 매개변수: team(대상 팀), member(가입할 멤버).
// 반환값: { ok, error? }. 'full'=정원 초과. 이미 멤버면 ok=true로 멱등 처리.
// 부수효과: TEAMS_TABLE update.
// 멱등(idempotent)이란? 같은 요청을 여러 번 해도 결과가 한 번 한 것과 같은 성질.
//   여기서는 이미 가입된 사람이 또 눌러도 에러 대신 "성공"으로 처리해 UX를 매끄럽게 한다.
export async function joinTeam(team: Team, member: TeamMember): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const list = members(team); // 현재 멤버 배열을 안전하게 가져옴
  if (list.some((m) => m.id === member.id)) return { ok: true }; // 중복 가입은 성공으로 간주(멱등)
  if (list.length >= MAX_TEAM_SIZE) return { ok: false, error: 'full' }; // 정원 초과 방어
  // [...list, member]: 기존 배열을 펼치고(spread) 뒤에 새 멤버를 더한 "새 배열"을 만든다.
  //   원본 list를 직접 바꾸지 않는 불변성(immutability) 방식 — React/상태 관리에서 권장된다.
  //   .eq('id', team.id): "id가 이 팀 id인 행만" 수정하라는 조건(WHERE 절과 같은 역할).
  const { error } = await client.from(TEAMS_TABLE).update({ members: [...list, member] }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 팀에서 특정 사용자를 제거한다. 마지막 한 명이 나가면 팀 자체를 삭제.
// 매개변수: team(대상 팀), userId(나갈 사용자 id).
// 반환값: { ok, error? }. 부수효과: TEAMS_TABLE update 또는 delete.
export async function leaveTeam(team: Team, userId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // .filter(...)는 조건을 만족하는 멤버만 남긴 "새 배열"을 만든다.
  // 여기서는 "내 id가 아닌 멤버"만 남겨 사실상 본인을 제외한다(원본은 그대로, 불변성 유지).
  const next = members(team).filter((m) => m.id !== userId); // 본인을 제외한 멤버 목록
  if (next.length === 0) {
    // 마지막 팀원이 나가면 팀 삭제 (게시글은 ON DELETE CASCADE)
    // → 빈 팀이 남지 않도록 정리. 연관 글/댓글은 FK CASCADE로 자동 삭제됨.
    //   ON DELETE CASCADE(외래키 옵션): 부모(팀)가 지워지면 자식(글·댓글)도 DB가 알아서 함께 지운다.
    //   그래서 여기서 글/댓글을 따로 지우는 코드가 없어도 된다.
    const { error } = await client.from(TEAMS_TABLE).delete().eq('id', team.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  // 남은 멤버가 있으면 팀은 유지하고 members 배열만 갱신한다.
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 팀장 지원/취소 — 본인 역할을 '팀장후보' ↔ '팀원' 토글 (확정 팀장은 변경 안 함) */
// 매개변수: team(대상 팀), userId(본인 id), on(true=지원, false=취소).
// 반환값: { ok, error? }. 부수효과: TEAMS_TABLE update.
// 토글(toggle)이란? 켜고/끄기를 번갈아 바꾸는 것. 여기선 on 값에 따라 후보/팀원으로 전환.
export async function volunteerLeader(team: Team, userId: string, on: boolean): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // .map(...)은 배열의 각 원소를 변환해 "같은 길이의 새 배열"을 만든다.
  // 여기서는 멤버를 하나씩 보며 "본인이고 아직 확정 팀장이 아니면" 역할만 바꾼 새 객체를 만든다.
  const next = members(team).map((m) =>
    // 본인이면서 이미 확정 '팀장'이 아닌 경우에만 역할을 후보/팀원으로 토글.
    // (확정 팀장은 이 함수로 강등되지 않도록 보호)
    // { ...m, role: ... }: 기존 멤버 m의 속성을 그대로 복사하고 role만 새 값으로 덮어쓴 새 객체.
    // 주의: m을 직접 m.role = ... 으로 고치지 않는다. 원본 보존(불변성)을 위해 항상 복사본을 만든다.
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
//
// 경쟁 상태(race condition)란? 두 사람이 "거의 동시에" 팀장 버튼을 눌렀을 때,
//   둘 다 오래된 화면 데이터를 보고 "아직 팀장 없네"라고 판단해 둘 다 팀장이 되는 문제.
//   이를 줄이려고 아래에서 "DB의 최신 상태"를 다시 읽어 확인한다.
//   주의: 이것만으로 100% 막을 수는 없다(완벽한 차단은 DB 트랜잭션/제약이 필요).
//         여기서는 화면이 들고 있던 캐시 대신 최신값으로 다시 보는 "완화책"이다.
export async function claimLeader(teamId: string, memberId: string): Promise<{ ok: boolean; error?: string; takenBy?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // 경합(race) 완화를 위해 캐시된 team이 아니라 DB에서 최신 상태를 다시 읽는다.
  // .single(): 정확히 1개의 행을 객체로 받는다(없거나 여러 개면 error). data는 팀 1건.
  const { data, error: fe } = await client.from(TEAMS_TABLE).select('*').eq('id', teamId).single();
  if (fe || !data) return { ok: false, error: fe?.message || 'not-found' }; // 팀을 못 찾으면 중단
  //   fe?.message: 옵셔널 체이닝. fe가 null/undefined면 에러 없이 undefined가 되어 안전하다.
  //   그 뒤 '|| not-found'로 메시지가 없을 때의 기본 사유를 채운다.
  const team = data as Team;
  const list = members(team);
  const existing = list.find((m) => m.role === '팀장'); // 이미 확정된 팀장 존재 여부
  if (existing) return { ok: false, error: 'taken', takenBy: existing.name }; // 선착순 패배 → 거절
  if (!list.some((m) => m.id === memberId)) return { ok: false, error: 'not-member' }; // 멤버가 아니면 등록 불가
  // 본인을 '팀장', 나머지를 '팀원'으로 일괄 설정.
  // 모든 멤버를 복사하되 role만 새로 정한다(본인=팀장, 그 외=팀원).
  const next = list.map((m) => ({ ...m, role: m.id === memberId ? '팀장' : '팀원' }));
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', teamId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 강사 전용: 팀장 확정 — 지정 멤버를 '팀장', 나머지 팀장/후보는 '팀원'으로 */
// 매개변수: team(대상 팀), memberId(팀장으로 확정할 멤버 id).
// 반환값: { ok, error? }. 부수효과: TEAMS_TABLE update.
// claimLeader(선착순)와 달리 이쪽은 강사가 "직접 지정"하므로 기존 팀장이 있어도 교체한다.
export async function confirmLeader(team: Team, memberId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).map((m) => ({
    ...m,
    // 지정 멤버는 '팀장'으로, 기존 팀장/후보는 '팀원'으로 강등, 그 외 역할은 그대로 유지.
    // 중첩 삼항: 먼저 "지정 멤버인가?"를 보고, 아니라면 "기존 팀장/후보인가?"를 본다.
    //   둘 다 아니면 m.role을 그대로 둬서 다른 역할(예: 일반 팀원)은 건드리지 않는다.
    role: m.id === memberId ? '팀장' : (m.role === '팀장' || m.role === '팀장후보' ? '팀원' : m.role),
  }));
  const { error } = await client.from(TEAMS_TABLE).update({ members: next }).eq('id', team.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 강사 전용: 팀장/후보 초기화 — 모두 '팀원'으로 */
// 매개변수: team(대상 팀). 반환값: { ok, error? }. 부수효과: TEAMS_TABLE update.
// 팀장 선정을 처음부터 다시 하고 싶을 때 사용. 팀장/후보 역할을 싹 비운다.
export async function resetLeaders(team: Team): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const next = members(team).map((m) =>
    // '팀장' 또는 '팀장후보'였던 멤버만 '팀원'으로 되돌리고, 나머지는 그대로 둔다.
    // 조건에 맞으면 role만 바꾼 복사본을, 아니면 원래 m을 그대로 사용한다.
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
  // .eq('team_id', teamId): 이 팀의 글만 골라낸다.
  // .order('created_at', { ascending: false }): 생성일 내림차순(=최신 글이 위로).
  const { data, error } = await client.from(TEAM_POSTS_TABLE).select('*').eq('team_id', teamId).order('created_at', { ascending: false });
  if (error) { console.error('listTeamPosts', error); return []; }
  return (data ?? []) as TeamPost[];
}

// 팀 게시글을 새로 작성한다.
// 매개변수: teamId, authorId, authorName, title, content,
//          category(기본 'note'), code(기본 ''), linkUrl(기본 '').
// 반환값: { ok, error? }. 부수효과: TEAM_POSTS_TABLE insert.
// 'category: PostCategory = note'처럼 '= 값'은 기본 매개변수다. 호출 때 생략하면 그 값이 쓰인다.
export async function createTeamPost(teamId: string, authorId: string, authorName: string, title: string, content: string, category: PostCategory = 'note', code = '', linkUrl = ''): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_POSTS_TABLE).insert({
    // linkUrl 인자는 DB 컬럼명(link_url)으로 매핑하여 저장.
    // 주의: 자바스크립트 변수는 camelCase(linkUrl), DB 컬럼은 snake_case(link_url)인 경우가 많다.
    //       이름이 다르므로 'link_url: linkUrl'처럼 명시적으로 연결해 줘야 한다.
    team_id: teamId, author_id: authorId, author_name: authorName, title, content, category, code, link_url: linkUrl,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 게시글 수정 시 변경 가능한 필드 집합.
// 수정 가능한 항목만 따로 타입으로 묶어, "수정하면 안 되는 값(id, author 등)"이
// 실수로 함께 넘어가는 것을 막는다(타입으로 의도를 분명히 표현).
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
// patch란? "바꿀 값들만 모은 객체"를 가리키는 흔한 이름. 여기선 새 제목/내용 등이 담겨 온다.
export async function updateTeamPost(postId: string, patch: TeamPostEdit): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // patch의 값을 해당 컬럼에 넣어 'id가 postId인 글 한 건'만 수정한다.
  const { error } = await client.from(TEAM_POSTS_TABLE).update({
    title: patch.title, content: patch.content, category: patch.category, code: patch.code, link_url: patch.link_url,
  }).eq('id', postId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 게시글을 삭제한다.
// 매개변수: postId. 반환값: { ok, error? }. 부수효과: TEAM_POSTS_TABLE delete.
// 주의: delete는 '.eq('id', postId)' 같은 조건을 반드시 붙여야 한다.
//       조건 없이 delete를 호출하면 테이블 전체가 지워질 위험이 있다(RLS가 있어도 조심).
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
// 왜 팀 단위로 한꺼번에 가져오나? 글마다 따로 댓글을 요청하면 통신이 많아진다(N+1 문제).
//   팀의 댓글을 한 번에 받아 화면에서 post_id별로 분류하면 요청 수를 줄일 수 있다.
export async function listTeamComments(teamId: string): Promise<TeamComment[]> {
  const client = getSupabase();
  if (!client) return [];
  // 댓글은 오름차순(오래된 것 → 최신) 정렬이라, 대화 순서대로 위에서 아래로 읽기 좋다.
  const { data, error } = await client.from(TEAM_COMMENTS_TABLE).select('*').eq('team_id', teamId).order('created_at');
  if (error) { console.error('listTeamComments', error); return []; }
  return (data ?? []) as TeamComment[];
}

// 댓글을 새로 작성한다.
// 매개변수: postId(대상 글), teamId(소속 팀), authorId, authorName, content,
//          isStaff(강사/관리자 작성 여부, 기본 false).
// 반환값: { ok, error? }. 부수효과: TEAM_COMMENTS_TABLE insert.
// team_id를 댓글에도 함께 저장하는 이유: RLS가 "이 댓글이 어느 팀 것인지"로 권한을
//   판단하기 쉽고, 팀 단위 조회(listTeamComments)도 빨라지기 때문.
export async function createTeamComment(postId: string, teamId: string, authorId: string, authorName: string, content: string, isStaff = false): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_COMMENTS_TABLE).insert({ post_id: postId, team_id: teamId, author_id: authorId, author_name: authorName, content, is_staff: isStaff });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// 댓글을 삭제한다.
// 매개변수: commentId. 반환값: { ok, error? }. 부수효과: TEAM_COMMENTS_TABLE delete.
// 여기서도 '.eq('id', commentId)'로 정확히 한 댓글만 지정해 삭제한다(조건 누락 주의).
export async function deleteTeamComment(commentId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  const { error } = await client.from(TEAM_COMMENTS_TABLE).delete().eq('id', commentId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
