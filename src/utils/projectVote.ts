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
 *  ── 초보자를 위한 배경 용어 ──────────────────────────────────────────
 *  • Supabase : 클라우드에 있는 데이터베이스(PostgreSQL)를 자바스크립트에서
 *    쉽게 읽고 쓰게 해 주는 서비스. 여기서는 "원격 저장소"라고 생각하면 된다.
 *  • DAO(Data Access Layer) : "데이터를 어떻게 가져오고 저장하는가"만 담당하는
 *    코드 묶음. 화면(UI) 코드와 분리해 두면, DB 다루는 방법이 바뀌어도
 *    화면 코드를 거의 안 고쳐도 되어서 유지보수가 쉬워진다.
 *  • 테이블(table) : 엑셀의 시트처럼 행(row)과 열(column)로 이루어진 데이터 표.
 *    이 파일은 두 개의 테이블을 다룬다 → 주제 테이블 / 투표 테이블.
 *  • RLS(Row Level Security) : Supabase(PostgreSQL)에서 "이 행을 이 사용자가
 *    읽거나 지울 수 있는가"를 DB 서버 쪽에서 검사하는 보안 규칙. 즉, 클라이언트
 *    코드가 허락해도 DB 정책이 막으면 거부된다(예: 남의 주제는 못 지움).
 *  • async/await : 시간이 걸리는 작업(네트워크 요청 등)을 "기다렸다가" 결과를
 *    받는 비동기 문법. await가 붙은 줄은 응답이 올 때까지 다음 줄로 안 넘어간다.
 *    async 함수는 항상 Promise(나중에 값이 채워지는 약속 상자)를 반환한다.
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
 *
 *  ※ export = "이 파일 밖에서도 가져다 쓸 수 있게 공개한다"는 뜻.
 *    다른 파일에서 import { castVote } from './projectVote' 처럼 불러 쓴다.
 */
// Supabase 클라이언트 팩토리(미설정 시 null 반환 가능)
//  ── "팩토리"는 필요한 객체를 만들어 주는 함수. getSupabase()를 호출하면
//     설정이 갖춰진 경우 DB 클라이언트를, 아니면 null(없음)을 돌려준다.
//     그래서 아래 모든 함수는 먼저 client가 null인지 확인한다(방어 코드).
import getSupabase from './supabase';
// 사이트별 설정(여기서는 DB 테이블 접두사 dbPrefix 사용)
//  ── 같은 코드를 여러 사이트(rest, ax-study 등)에서 재사용하려고,
//     테이블 이름 앞에 사이트마다 다른 접두사를 붙인다.
import site from '../config/site';

// 사이트별 접두사를 붙인 실제 테이블명 (예: 'rest_project_topics')
//  ── 백틱(`...`)은 템플릿 리터럴. ${...} 안의 값을 문자열에 끼워 넣는다.
//     site.dbPrefix가 'rest_'면 결과 문자열은 'rest_project_topics'가 된다.
//     주의: 백틱 문자열 안에는 주석을 넣지 말 것(문자열 내용이 바뀜).
export const TOPICS_TABLE = `${site.dbPrefix}project_topics`;
// 사이트별 접두사를 붙인 투표 테이블명 (예: 'rest_topic_votes')
export const VOTES_TABLE = `${site.dbPrefix}topic_votes`;

// 학생이 추가한 커스텀 주제 한 건의 데이터 형태
//  ── interface = "이 데이터는 이런 모양(어떤 이름의 값이 어떤 타입인지)"을
//     TypeScript에게 알려 주는 설계도. 실제 코드로 변환되진 않고, 작성 중
//     오타나 타입 실수를 미리 잡아 주는 역할만 한다.
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
                      //  ── 이름 뒤의 ?는 "있을 수도, 없을 수도 있음(선택적)"이라는 뜻.
                      //     새로 투표를 보낼 때는 id가 없고(서버가 생성), 조회할 때만 채워진다.
  topic_key: string;  // 투표 대상 키(프리셋 'p1'~'p7' 또는 커스텀 주제 UUID)
  user_id: string;    // 투표자 user_id (UNIQUE — 1인 1표 보장)
                      //  ── UNIQUE: DB가 같은 user_id를 두 번 저장하지 못하게 막는 제약.
                      //     덕분에 한 사람은 한 표만 가질 수 있다(아래 castVote에서 활용).
  user_name: string;  // 투표자 표시 이름
}

/**
 * 커스텀 주제 전체 목록을 생성 시각 순으로 조회한다.
 * @returns CustomTopic 배열(클라이언트 없음/에러 시 빈 배열)
 * @sideeffect 에러 발생 시 콘솔 로깅
 *
 * 왜 에러 때 예외를 던지지 않고 빈 배열을 반환할까?
 *  → 목록 조회는 "실패해도 화면이 깨지면 안 되는" 작업이라, 빈 목록으로 두고
 *    넘어가는 편이 사용자 경험에 안전하기 때문이다(graceful degradation).
 */
export async function listCustomTopics(): Promise<CustomTopic[]> {
  const client = getSupabase();
  if (!client) return []; // Supabase 미설정 환경에서는 빈 목록으로 graceful 처리
  // await: 아래 DB 요청의 응답이 올 때까지 기다린다. 응답은 { data, error } 모양의
  //  객체이고, "구조 분해 할당"으로 data와 error를 한 번에 꺼낸다.
  //  .from(테이블).select('*')는 "그 테이블의 모든 열을 가져와라",
  //  .order('created_at')는 "생성 시각 오름차순으로 정렬해라"는 뜻.
  const { data, error } = await client.from(TOPICS_TABLE).select('*').order('created_at');
  if (error) { console.error('listCustomTopics', error); return []; }
  return (data ?? []) as CustomTopic[]; // data가 null일 경우 빈 배열로 대체
  //  ?? (널 병합 연산자): 왼쪽 값이 null/undefined면 오른쪽([])을 쓴다.
  //  as CustomTopic[]: "이 데이터를 CustomTopic 배열로 취급하라"는 타입 단언.
  //  주의: as는 타입을 강제로 알려 줄 뿐, 실제 값의 형태를 바꾸지는 않는다.
}

/**
 * 투표 전체 목록을 조회한다(집계/현재 사용자 투표 판단 등에 사용).
 * @returns TopicVote 배열(클라이언트 없음/에러 시 빈 배열)
 * @sideeffect 에러 발생 시 콘솔 로깅
 *
 * "집계"란? 받아 온 투표 배열을 화면 쪽에서 topic_key별로 세어 득표수를 만드는 것.
 *  이 함수는 원본 목록만 주고, 세는 일은 화면 코드가 담당한다(역할 분리).
 */
export async function listVotes(): Promise<TopicVote[]> {
  const client = getSupabase();
  if (!client) return []; // 미설정 환경 방어
  // 투표는 정렬이 필요 없어 .order(...) 없이 전체만 가져온다.
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
 *
 * 반환을 boolean 하나가 아니라 객체로 주는 이유:
 *  성공 여부(ok)뿐 아니라, 성공 시 새 id, 실패 시 원인(error)까지 함께 넘겨
 *  호출하는 쪽이 상황에 맞게 화면을 처리할 수 있게 하기 위해서다.
 */
export async function addTopic(title: string, description: string, userId: string, userName: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' }; // 클라이언트 미초기화 식별용 코드
  //  ── 'no-client'는 사람이 읽으려는 메시지라기보다, 호출부가 "DB 자체가
  //     준비 안 됨"을 구분할 수 있게 하는 약속된 코드 문자열이다.
  const { data, error } = await client.from(TOPICS_TABLE)
    // .insert({...}): 객체 하나를 새 행으로 저장한다. 키 이름은 DB 열 이름과 같아야 한다.
    //  id/created_at은 여기서 안 넣는다 → DB가 자동으로 채워 주기 때문(서버 생성).
    .insert({ title, description, created_by: userId, created_by_name: userName })
    .select().single(); // 삽입한 행을 단건으로 되돌려 받아 id 추출
    //  ── .insert만으로는 보통 저장 결과가 안 온다. .select()를 붙여 "방금 넣은 행을
    //     다시 달라"고 하고, .single()로 "행은 딱 하나"임을 명시해 배열이 아닌
    //     단일 객체로 받는다. 그래야 아래에서 data.id를 바로 꺼낼 수 있다.
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as CustomTopic).id };
  //  ── data를 CustomTopic으로 단언한 뒤 그 id를 반환. 화면은 이 id로 곧바로
  //     새 주제를 가리키거나 투표하게 만들 수 있다.
}

/**
 * 커스텀 주제를 id로 삭제한다.
 * @param id 삭제할 주제 행 PK(UUID)
 * @returns { ok, error? }
 * @sideeffect TOPICS_TABLE에서 해당 행 DELETE (RLS 정책에 따라 권한 검사)
 *
 * 주의: 권한 검사는 이 코드가 아니라 DB의 RLS 정책이 한다. 예를 들어 "제안자
 *  본인 또는 관리자만 삭제 가능" 같은 규칙이 DB에 있으면, 권한 없는 삭제는
 *  여기서 error로 돌아온다. 즉 프런트 코드만으로 보안을 책임지지 않는다.
 */
export async function deleteTopic(id: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // .delete().eq('id', id): "id 열의 값이 주어진 id와 같은(eq=equal) 행을 삭제".
  //  주의: .eq(...) 같은 조건을 빼먹으면 테이블 전체가 지워질 수 있으니 꼭 붙인다.
  const { error } = await client.from(TOPICS_TABLE).delete().eq('id', id);
  // 삭제는 돌려받을 데이터가 없어 error만 본다.
  //  삼항 연산자: 조건 ? 참일때값 : 거짓일때값 → error가 있으면 실패, 없으면 성공.
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * 1인 1표 업서트 (user_id 충돌 시 topic_key 변경)
 *
 * user_id가 UNIQUE이므로 동일 사용자가 다시 투표하면 INSERT 충돌이 발생하고,
 * onConflict:'user_id'에 의해 기존 행의 topic_key/user_name이 UPDATE된다.
 * 즉 재투표가 곧 투표 변경이 된다.
 *
 * upsert란? "있으면 UPDATE, 없으면 INSERT"를 한 번에 처리하는 동작(update+insert).
 *  여기서는 user_id가 이미 있으면(=이미 투표함) 그 사람의 표를 새 주제로 바꾸고,
 *  처음이면 새 표를 만든다. 그래서 "한 사람 = 한 표"가 자연스럽게 유지된다.
 *
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
    //  ── onConflict: 'user_id' 는 "user_id가 겹치면 새로 넣지 말고 기존 행을
    //     갱신하라"는 지시. 이 설정이 동작하려면 DB에서 user_id가 UNIQUE여야 한다.
    //  주의: onConflict 지정을 빠뜨리면 같은 사람이 여러 표를 만들거나 오류가 날 수 있다.
    .upsert({ topic_key: topicKey, user_id: userId, user_name: userName }, { onConflict: 'user_id' });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * 특정 사용자의 투표를 철회(삭제)한다.
 * @param userId 철회할 투표자 user_id
 * @returns { ok, error? }
 * @sideeffect VOTES_TABLE에서 해당 user_id 행 DELETE
 *
 * 1인 1표이므로 user_id 하나로 그 사람의 표 한 건이 정확히 지워진다.
 *  (투표를 "취소"하면 다시 안 한 상태가 되고, 새로 castVote 하면 재투표가 된다.)
 */
export async function retractVote(userId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: 'no-client' };
  // user_id 열이 주어진 값과 같은 행을 삭제. (UNIQUE라 최대 한 건)
  const { error } = await client.from(VOTES_TABLE).delete().eq('user_id', userId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
