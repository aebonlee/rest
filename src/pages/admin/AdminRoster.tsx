/**
 * AdminRoster.tsx
 *
 * [역할]
 *   관리자 전용 "수강생 명단 ↔ 회원가입 대조" 페이지.
 *   내장된 정적 수강생 명단(ROSTER)과 Supabase user_profiles(실제 가입 회원)를
 *   '이름' 기준으로 대조하여 가입/미가입/명단외 가입 현황을 보여준다.
 *
 *   쉽게 말하면:
 *   - "수업을 신청한 사람들의 명단(종이 명단처럼 코드에 박혀 있는 고정 목록)"과
 *   - "실제로 사이트에 회원가입을 한 사람들(데이터베이스에 저장된 목록)"을
 *   - 한 명 한 명 이름으로 맞춰 보면서 "이 사람은 가입했네 / 아직 안 했네"를 한눈에 보여주는 화면이다.
 *
 * [핵심 책임]
 *   - 본 사이트(REST) 가입자 프로필을 Supabase에서 로드 (도메인/방문기록/동일인 이메일·이름 보강 조회).
 *   - STAFF(관리자) 역할 계정은 기본 제외하되 동일인 묶음에 속하면 예외 포함.
 *   - groupByPerson으로 동일인 계정(전화/이름)을 통합 후, 명단의 각 학생을 이름으로 매칭.
 *   - 미가입 / 명단외 가입 / 전체 명단 + 가입상태 / 경험수준 분포 / 요약 카운트를 렌더링.
 *
 * [초보자를 위한 배경/용어 설명]
 *   - React 컴포넌트: 화면의 한 조각(혹은 페이지 전체)을 만드는 "함수". 이 함수가 JSX(아래 설명)를 반환하면
 *     React가 그것을 실제 HTML 화면으로 그려준다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 코드를 쓸 수 있게 해주는 문법. <div>...</div> 같은 것.
 *     JSX 안에서 자바스크립트 값을 넣을 때는 {중괄호}로 감싼다. 예: <span>{이름}</span>
 *   - 상태(state): 화면이 기억해야 하는 "변하는 값". 값이 바뀌면 React가 화면을 자동으로 다시 그린다.
 *   - Supabase: 클라우드에 있는 데이터베이스 + 인증 서비스. 여기서는 회원(user_profiles) 정보를 가져온다.
 *   - 비동기(async/await): 데이터베이스 조회처럼 "시간이 걸리는 작업"을 기다리는 방법.
 *     await를 붙이면 "결과가 올 때까지 기다렸다가 다음 줄로 넘어가라"는 뜻.
 *   - RLS(Row Level Security): Supabase에서 "어떤 사용자가 어떤 행(데이터)을 볼 수 있는지" 제한하는 보안 규칙.
 *     그래서 로그인 안 한 상태나 권한 없는 상태에서는 조회 결과가 비어 있을 수 있다.
 *
 * [주요 export]
 *   - default: AdminRoster (React 페이지 컴포넌트)
 */

// React에서 자주 쓰는 도구들을 가져온다(import).
// - useState: 컴포넌트가 기억하는 "상태 값"을 만든다.
// - useEffect: 컴포넌트가 화면에 나타난 뒤(또는 특정 값이 바뀐 뒤) 어떤 작업을 실행한다.
// - useMemo: 계산 결과를 "기억"해서, 입력이 바뀔 때만 다시 계산한다(불필요한 재계산 방지).
// - type ReactElement: "React가 그릴 수 있는 화면 조각"을 가리키는 타입(TypeScript 전용, 실행 코드 아님).
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';   // 관리자 페이지 왼쪽 메뉴(사이드바) 컴포넌트.
import SEOHead from '../../components/SEOHead';             // <head> 태그(제목, 검색엔진 설정 등)를 다루는 컴포넌트.
import getSupabase from '../../utils/supabase';            // Supabase 클라이언트(접속 도구)를 만들어 주는 함수.
import site from '../../config/site';                      // 사이트 기본 설정(주소 등)이 담긴 객체.
import { ROSTER, ROSTER_COUNT, type RosterStudent } from '../../data/rosterData'; // 고정 수강생 명단 데이터.
import { groupByPerson, type PersonGroup } from '../../utils/people';             // 같은 사람의 여러 계정을 묶어주는 유틸.
import { SAME_PERSON_EMAIL_GROUPS } from '../../config/admin'; // "이 이메일들/이름은 같은 사람"이라고 미리 정의한 목록.
import type { UserProfile } from '../../types';            // 회원 한 명의 정보 모양(타입) 정의.

// 본 사이트(REST) 호스트명. signup_domain / visited_sites 비교의 기준값.
// 예) site.url 이 "https://rest.dreamitbiz.com" 이면 hostname 은 "rest.dreamitbiz.com" 이 된다.
// new URL(...).hostname 은 전체 주소에서 "도메인 부분"만 깔끔하게 뽑아내는 표준 방법이다.
const REST_HOSTNAME = new URL(site.url).hostname;
// 명단 대조에서 기본 제외할 운영/관리자 역할 목록.
// (관리자 계정은 보통 "수강생"이 아니므로 명단 대조 대상에서 빼는 게 기본이다.)
const STAFF_ROLES = ['admin', 'superadmin'];

// 동일인 묶음에 등록된 이메일은 도메인 조건/STAFF 역할과 무관하게 항상 명단 대조에 포함한다.
// (다른 사이트로 가입했거나 관리자 역할이어도 '명단외 가입'에 보여야 하는 사람)
// 모든 그룹의 이메일을 평탄화하고 소문자로 정규화한 배열.
// - flatMap: [{emails:[a,b]},{emails:[c]}] 처럼 "배열 안의 배열"을 [a, b, c] 한 줄로 펼친다.
// - toLowerCase(): 이메일은 대소문자를 구분하지 않으므로 비교 전에 소문자로 통일한다(예: A@x.com == a@x.com).
const INCLUDE_EMAILS = SAME_PERSON_EMAIL_GROUPS
  .flatMap((g) => g.emails)
  .map((e) => e.toLowerCase());
// 빠른 포함 여부 판정용 Set.
// 주의: Set 은 "이 값이 들어있나?"를 매우 빠르게(거의 즉시) 확인할 수 있는 자료구조다.
//       배열로 .includes()를 반복하는 것보다 효율적이라 여기서는 Set 을 쓴다.
const INCLUDE_SET = new Set(INCLUDE_EMAILS);
// 동일인 묶음에 지정된 이름들(빈 값 제거). 이메일이 달라도 이름으로 보강 조회/포함하기 위함.
// - filter(Boolean): 비어 있는 값(빈 문자열, undefined 등)을 걸러낸다. Boolean 함수가 "참인 값만 통과"시키기 때문.
// - as string[]: TypeScript에게 "이 결과는 문자열 배열이 확실해"라고 알려주는 타입 단언(실행에는 영향 없음).
const INCLUDE_NAMES = SAME_PERSON_EMAIL_GROUPS.map((g) => g.name).filter(Boolean) as string[];
// 이름 비교용 Set(공백 제거). \s+ 정규식으로 모든 공백을 제거해 표기 차이를 흡수.
// - 정규식 /\s+/g 설명: \s = 공백 문자(스페이스, 탭 등), + = 1개 이상, g = 문자열 전체에서 모두 찾기.
//   즉 "주 윤미" 와 "주윤미" 처럼 띄어쓰기만 다른 이름을 같은 것으로 맞추기 위해 모든 공백을 없앤다.
const NAME_SET = new Set(INCLUDE_NAMES.map((n) => n.replace(/\s+/g, '')));

// 이름 매칭용 정규화 함수: null 안전, 소문자화, 모든 공백 제거, 양끝 trim.
// 매개변수 s - 원본 문자열, 반환 - 정규화된 비교용 문자열.
// - (s || ''): s 가 null/undefined 여도 빈 문자열로 바꿔 에러를 막는다("null 안전").
// - .toLowerCase(): 영문 대소문자 차이 제거.
// - .replace(/\s+/g, ''): 모든 공백 제거.
// - .trim(): 앞뒤 공백 제거(이미 공백을 다 지웠지만 안전하게 한 번 더).
// 정규화(normalize)란? 비교하기 좋게 형식을 통일하는 것. "Hong  Gildong" 과 "honggildong"을 같게 만든다.
const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '').trim();

// 테이블 한 행 = 명단 학생 1명 + 매칭된 동일인 그룹(없으면 null).
// interface 는 "이 객체는 이런 모양이어야 한다"고 정하는 TypeScript 문법.
// - student: 명단에 있는 학생 한 명.
// - person: 그 학생과 매칭된 가입 회원 묶음. 매칭이 안 됐으면 null(=미가입).
interface RosterRow {
  student: RosterStudent;
  person: PersonGroup | null;
}

// 경험 수준별 표시 색상 매핑. (입문=빨강, 기초=주황, 경험자=초록)
// Record<string, string> = "키도 문자열, 값도 문자열인 객체" 라는 타입.
// 예) levelColor['입문'] 하면 '#ef4444'(빨강)를 돌려준다.
const levelColor: Record<string, string> = { 입문: '#ef4444', 기초: '#d97706', 경험자: '#10b981' };

/**
 * AdminRoster
 *   수강생 명단과 가입 회원을 대조해 표시하는 관리자 페이지 컴포넌트.
 *   매개변수: 없음
 *   반환값: ReactElement (페이지 전체 레이아웃)
 *   부수효과: 마운트 시 Supabase에서 user_profiles를 비동기 로드해 상태(profiles)에 저장.
 *
 *   ※ "마운트(mount)"란? 컴포넌트가 화면에 처음 나타나는 순간을 말한다.
 *   ※ "부수효과(side effect)"란? 화면을 그리는 것 외에 추가로 하는 일(예: 데이터 가져오기).
 */
const AdminRoster = (): ReactElement => {
  // 로드된 가입 회원 프로필 목록.
  // useState 사용법: const [값, 값을바꾸는함수] = useState(초기값);
  //   - profiles: 현재 회원 목록(처음엔 빈 배열 []).
  //   - setProfiles: 이 목록을 바꾸는 함수. 이걸 호출하면 화면이 자동으로 다시 그려진다.
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  // 데이터 로딩 중 여부(초기 true).
  //   - true 동안에는 로딩 스피너를 보여주고, 다 불러오면 false로 바꿔 결과를 보여준다.
  const [loading, setLoading] = useState(true);

  // [마운트 시 1회] Supabase에서 가입 회원을 조회하고 STAFF 필터링 후 상태에 저장.
  // useEffect(실행할함수, [의존성배열]) 형태.
  //   - 두 번째 인자가 빈 배열 [] 이면 "처음 화면에 나타날 때 딱 한 번만" 실행된다.
  //   - 만약 [profiles] 처럼 값을 넣으면 그 값이 바뀔 때마다 다시 실행된다.
  // 주의: useEffect 안의 함수 자체에는 async 를 직접 붙일 수 없어서,
  //       아래처럼 async 함수(load)를 만들어 두고 마지막에 호출하는 패턴을 쓴다.
  useEffect(() => {
    const load = async () => {
      const client = getSupabase(); // Supabase에 접속할 도구(클라이언트)를 가져온다.
      // Supabase 미설정/연결 불가 시 로딩만 종료(빈 명단으로 처리).
      // 주의: client 가 없으면 더 진행해봐야 에러만 나므로, 여기서 깔끔히 종료한다(early return).
      if (!client) { setLoading(false); return; }
      // 본 사이트 가입자: signup_domain 일치 OR visited_sites 에 호스트 포함
      // .cs(contains) 연산자로 배열 컬럼 visited_sites에 호스트가 포함되는지 검사.
      // - from('user_profiles'): user_profiles 테이블에서
      // - select('*'): 모든 컬럼을
      // - .or(...): "조건A 또는 조건B" 로 가져온다.
      //   조건A signup_domain.eq.<호스트>  → 가입 도메인이 우리 사이트와 같음
      //   조건B visited_sites.cs.{<호스트>} → 방문한 사이트 목록(배열)에 우리 사이트가 들어 있음
      // - await: 데이터베이스 응답이 올 때까지 기다린 뒤 결과를 받는다.
      // - { data }: 응답 객체에서 data 부분만 꺼내 쓰는 "구조 분해 할당".
      const { data } = await client
        .from('user_profiles')
        .select('*')
        .or(`signup_domain.eq.${REST_HOSTNAME},visited_sites.cs.{${REST_HOSTNAME}}`);
      // 1차 조회 결과를 기준으로 병합 배열 시작.
      // - [...((data || []) ...)]: data 가 null 이면 빈 배열로 대체한 뒤, 그 내용을 펼쳐(spread) 새 배열에 복사한다.
      //   원본을 직접 건드리지 않고 새 배열을 만드는 "불변성(immutability)" 습관. (React에서 중요)
      // - as UserProfile[]: TypeScript에게 "이건 회원 배열이야"라고 타입을 알려준다.
      const merged = [...((data || []) as UserProfile[])];
      // 중복 추가 방지를 위한 id Set.
      // 같은 사람을 여러 번 조회해 합칠 때, 이미 넣은 id 인지 빠르게 확인하기 위함.
      const seen = new Set(merged.map((u) => u.id));
      // 추가 조회 결과를 중복 없이 merged에 합치는 헬퍼.
      // rows 안의 각 회원 u 에 대해, 아직 안 본 id 면(seen에 없으면) 추가하고 seen에 기록한다.
      const addAll = (rows: UserProfile[] | null) => {
        for (const u of rows || []) if (!seen.has(u.id)) { seen.add(u.id); merged.push(u); }
      };

      // 동일인 묶음 이메일은 도메인 조건에 안 걸려도 별도 조회해 합친다 (예: 다른 사이트로 가입)
      // INCLUDE_EMAILS.length 가 0보다 크면(=대상 이메일이 하나라도 있으면)만 조회한다.
      if (INCLUDE_EMAILS.length) {
        // .in('email', 목록): 이메일이 목록 중 하나라도 일치하는 행을 한 번에 가져온다(SQL의 IN 과 같음).
        const { data: byEmail } = await client.from('user_profiles').select('*').in('email', INCLUDE_EMAILS);
        addAll(byEmail as UserProfile[] | null);
      }
      // 이메일이 달라도 이름(예: 주윤미)으로도 추가 조회해 누락을 막는다
      if (INCLUDE_NAMES.length) {
        // name/display_name 두 컬럼 각각에 대한 eq 조건을 OR 문자열로 조합.
        // 예) "name.eq.주윤미,display_name.eq.주윤미,name.eq.홍길동,..." 형태가 만들어진다.
        // - flatMap 으로 이름 하나당 조건 2개를 만들고, .join(',') 로 콤마로 이어 붙인다.
        const nameOr = INCLUDE_NAMES.flatMap((n) => [`name.eq.${n}`, `display_name.eq.${n}`]).join(',');
        const { data: byName } = await client.from('user_profiles').select('*').or(nameOr);
        addAll(byName as UserProfile[] | null);
      }

      // STAFF 역할은 제외하되, 동일인 묶음 이메일/이름은 예외로 항상 포함
      // isIncluded: 해당 프로필이 동일인 묶음(이메일 또는 이름)에 속하는지 판정.
      // - (u.email || '').toLowerCase(): 이메일이 없을 수도 있으니 빈 문자열로 안전 처리 후 소문자 비교.
      // - 세 조건 중 하나라도 true 면(|| = 또는) "포함 대상"으로 본다.
      const isIncluded = (u: UserProfile) =>
        INCLUDE_SET.has((u.email || '').toLowerCase()) ||
        NAME_SET.has((u.name || '').replace(/\s+/g, '')) ||
        NAME_SET.has((u.display_name || '').replace(/\s+/g, ''));
      // STAFF가 아니거나(일반 수강생) 동일인 예외에 해당하면 명단 대상에 포함.
      // - filter: 조건이 true 인 항목만 남긴다.
      // - !STAFF_ROLES.includes(u.role): 관리자 역할이 "아닌" 경우 통과. (! = 부정/반대)
      const list = merged.filter((u) => !STAFF_ROLES.includes(u.role) || isIncluded(u));
      setProfiles(list); // 최종 목록을 상태에 저장 → 화면이 다시 그려진다.
      setLoading(false); // 로딩 끝 표시.
    };
    load(); // 위에서 정의한 async 함수를 실제로 실행. (정의만으로는 실행되지 않음)
  }, []); // [] = 마운트 시 단 한 번만 실행.

  // [파생 데이터] profiles 변경 시에만 재계산: 명단 행/명단외 그룹/일치 수.
  // useMemo(계산함수, [의존성]): profiles 가 바뀔 때만 안쪽 계산을 다시 한다.
  //   그 외 리렌더(예: loading 변경)에서는 이전 계산 결과를 재사용해 성능을 아낀다.
  const { rows, notInRoster, matchedCount } = useMemo(() => {
    // 동일인(전화/이름) 통합 후 이름으로 매칭
    // 같은 이름 그룹이 여러 개면(전화번호 등으로 분리된 동일인 계정) 모두 매칭 처리해
    // 한 계정만 매칭되고 나머지가 '명단외'로 남는 문제를 방지한다.
    const people = groupByPerson(profiles); // 흩어진 계정들을 "사람 단위"로 묶은 결과.
    // 정규화된 이름 -> 해당 이름을 가진 동일인 그룹들의 맵.
    // Map 은 "키 → 값" 형태의 자료구조. 여기서는 "이름 → 그 이름을 가진 그룹들의 배열".
    const byName = new Map<string, PersonGroup[]>();
    people.forEach((g) => {
      // 한 그룹 안 모든 계정의 name/display_name을 정규화해 후보 이름 집합으로 수집.
      // 한 사람이 여러 계정을 가지면 이름 표기가 조금씩 다를 수 있어 가능한 이름을 모두 모은다.
      const names = new Set<string>();
      g.accounts.forEach((a) => { if (a.name) names.add(norm(a.name)); if (a.display_name) names.add(norm(a.display_name)); });
      // 각 후보 이름마다 그룹을 인덱싱(같은 이름에 여러 그룹이 들어갈 수 있음).
      // byName.get(n) 이 없으면(undefined) 빈 배열로 시작(|| []), 그룹을 넣고 다시 저장한다.
      names.forEach((n) => { const arr = byName.get(n) || []; arr.push(g); byName.set(n, arr); });
    });
    // 명단 매칭에 사용(소비)된 그룹 key 집합 — '명단외 가입' 산출 시 제외용.
    // 명단의 누군가와 짝지어진 그룹은 여기에 기록해 두고, 나중에 "짝이 없던 그룹"만 명단외로 분류한다.
    const usedKeys = new Set<string>();
    // ROSTER(고정 명단)의 각 학생을 돌면서, 가입 회원과 짝지어 RosterRow 배열을 만든다.
    const rows: RosterRow[] = ROSTER.map((student) => {
      // 학생 이름을 정규화해 매칭되는 그룹들을 찾는다.
      const groups = byName.get(norm(student.name)) || [];
      // 매칭된 그룹은 모두 used 처리(동일인 다중 그룹이 명단외로 남지 않도록).
      groups.forEach((g) => usedKeys.add(g.key));
      // 표시용으로는 첫 그룹만 person에 연결(없으면 null=미가입).
      // groups[0] 이 없으면(undefined) || null 로 바꿔, "매칭 안 됨 = null" 로 명확히 표시.
      return { student, person: groups[0] || null };
    });
    // useMemo 는 이 객체를 돌려주고, 위의 구조 분해로 rows/notInRoster/matchedCount 가 꺼내진다.
    return {
      rows,
      // 가입 매칭된 명단 학생 수. (person 이 있는 행만 센다)
      matchedCount: rows.filter((r) => r.person).length,
      // 어떤 명단 학생과도 매칭되지 않은 그룹 = 명단외 가입(운영사 관리자 등).
      // usedKeys 에 없는(짝이 없던) 그룹만 남긴다.
      notInRoster: people.filter((g) => !usedKeys.has(g.key)),
    };
  }, [profiles]); // profiles 가 바뀔 때만 재계산.

  // 중도포기는 미가입 경고에서 제외 (출석 대상이 아니므로)
  // 미매칭 + 비(非)중도포기 학생만 '미가입'으로 본다.
  // - !r.person: 아직 가입 매칭이 안 됨
  // - !r.student.dropped: 중도포기가 아님
  //   둘 다 만족해야(&& = 그리고) "진짜 챙겨야 할 미가입자"다.
  const notSignedUp = rows.filter((r) => !r.person && !r.student.dropped);
  // 명단 내 중도포기 인원 수(고정 명단이라 의존성 없음).
  // ROSTER 는 절대 변하지 않는 고정 데이터라 의존성 배열이 [](=한 번만 계산)이어도 안전하다.
  const droppedCount = useMemo(() => ROSTER.filter((s) => s.dropped).length, []);

  // 경험 수준 분포 (중도포기 제외 = 실제 수강 인원 기준)
  const levelDist = useMemo(() => {
    const d: Record<string, number> = { 입문: 0, 기초: 0, 경험자: 0 }; // 각 수준의 카운터(0부터 시작).
    // 중도포기 제외 학생들을 수준별로 카운트.
    // d[s.level] += 1 : 해당 수준의 칸에 1을 더한다. (예: d['입문'] += 1)
    ROSTER.filter((s) => !s.dropped).forEach((s) => { d[s.level] += 1; });
    return d;
  }, []);

  // 상단 요약 카드 데이터. 중도포기가 있을 때만 마지막 카드를 조건부로 추가.
  // 화면 맨 위에 보여줄 숫자 카드들을 배열로 미리 만들어 둔다(라벨/값/색상).
  const summary = [
    { label: '명단 인원', val: ROSTER_COUNT - droppedCount, color: 'var(--text-primary, #1a1a1a)' },
    { label: '가입 회원', val: matchedCount + notInRoster.length, color: 'var(--primary-blue, #0046C8)' },
    { label: '일치(가입완료)', val: matchedCount, color: '#10b981' },
    { label: '미가입', val: notSignedUp.length, color: '#ef4444' },
    { label: '명단외 가입', val: notInRoster.length, color: '#d97706' },
    // 조건부 펼치기: 중도포기가 1명 이상일 때만 중도포기 카드를 배열에 추가한다.
    // 삼항연산자(조건 ? 참일때 : 거짓일때)와 ...스프레드를 같이 써서 "있으면 끼워 넣고, 없으면 빈 배열"을 펼친다.
    ...(droppedCount > 0 ? [{ label: '중도포기', val: droppedCount, color: '#6b7280' }] : []),
  ];

  // 아래 return 안이 실제 화면(JSX)이다. React는 이 내용을 HTML로 그려준다.
  return (
    // <> ... </> 는 "React Fragment". 의미 없는 div 를 추가하지 않고 여러 요소를 묶을 때 쓴다.
    <>
      {/* 검색엔진 비노출(noindex) 관리자 페이지 SEO 헤더 */}
      {/* noindex: 구글 등 검색엔진이 이 페이지를 검색 결과에 넣지 말라는 표시(관리자 전용이므로). */}
      <SEOHead title="수강생 명단 대조" path="/admin/roster" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 페이지 제목 + 대조 방식 안내(이메일 부재로 이름 매칭임을 명시) */}
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>수강생 명단 ↔ 회원가입 대조</h2>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
              {/* {ROSTER_COUNT} 처럼 중괄호 안에 변수를 넣으면 실제 숫자/값으로 치환되어 화면에 나온다. */}
              내장된 수강생 명단 <strong>{ROSTER_COUNT}명</strong>을 본 사이트 가입 회원과 <strong>이름 기준</strong>으로 대조합니다.
              (명단에 이메일이 없어 이름 매칭이며, 동명이인·닉네임 가입은 수동 확인이 필요합니다.)
            </p>
          </div>

          {/* 요약 카운트 */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {/* summary 배열을 순회하며 카운트 카드 렌더 */}
            {/* .map(...) 으로 배열의 각 항목을 화면 요소로 변환한다. JSX에서 목록을 그리는 기본 방법. */}
            {summary.map((c) => (
              // 주의: 목록을 .map 으로 그릴 때는 각 요소에 고유한 key 를 꼭 줘야 한다.
              //       React가 "어떤 항목이 바뀌었는지" 빠르게 구분하기 위함이다. 여기선 라벨을 key로 사용.
              <div key={c.label} style={{
                flex: '1 1 130px', border: '1px solid var(--border-light, #e5e7eb)',
                borderRadius: '10px', padding: '12px 14px', background: 'var(--bg-white, #fff)',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: c.color }}>{c.val}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* 경험 수준 분포 */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '13.5px' }}>
            {/* levelDist를 [수준, 인원] 쌍으로 순회하며 칩 형태로 표시 */}
            {/* Object.entries(객체)는 {입문:5} 같은 객체를 [["입문",5], ...] 배열로 바꿔준다. */}
            {/* [lvl, n] 처럼 받으면 lvl=수준이름, n=인원 으로 한 번에 나눠 쓸 수 있다(배열 구조 분해). */}
            {Object.entries(levelDist).map(([lvl, n]) => (
              <span key={lvl} style={{
                padding: '4px 12px', borderRadius: '999px', fontWeight: 700,
                background: 'var(--bg-light-gray, #f8f9fa)', color: levelColor[lvl],
                border: `1px solid ${levelColor[lvl]}`,
              }}>{lvl} {n}명</span>
            ))}
          </div>

          {/* 로딩 중에는 스피너, 완료 후 대조 결과 테이블들 표시 */}
          {/* {조건 ? A : B} : 조건이 참이면 A를, 거짓이면 B를 그린다(JSX 안에서 if 대신 자주 쓰는 방식). */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 미가입 — 가장 중요 */}
              <h3 style={{ margin: '8px 0 10px', color: '#ef4444' }}>⚠ 미가입 ({notSignedUp.length}) — 명단에 있으나 회원가입 미확인</h3>
              {/* 전원 가입 시 안내 문구, 아니면 미가입자 테이블 */}
              {/* 미가입자가 0명이면 축하 문구를, 아니면 표를 보여준다. */}
              {notSignedUp.length === 0 ? (
                <p style={{ color: '#10b981', fontSize: '14.5px', marginBottom: '24px' }}>✓ 명단 전원이 가입을 완료했습니다.</p>
              ) : (
                <div className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
                  <table className="admin-table">
                    <thead><tr><th>No</th><th>이름</th><th>성별</th><th>전공</th><th>수준</th></tr></thead>
                    <tbody>
                      {/* 미가입 학생 행 렌더 */}
                      {/* key 로 학생 고유번호(no)를 사용. 행마다 유일해야 하므로 적절하다. */}
                      {notSignedUp.map((r) => (
                        <tr key={r.student.no}>
                          <td>{r.student.no}</td>
                          <td>{r.student.name}</td>
                          <td>{r.student.gender}</td>
                          <td>{r.student.major}</td>
                          <td style={{ color: levelColor[r.student.level], fontWeight: 700 }}>{r.student.level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 명단외 가입 — 그룹이 있을 때만 섹션 표시 */}
              {/* {조건 && (JSX)} : 조건이 참일 때만 뒤의 JSX를 그린다(거짓이면 아무것도 안 그림). */}
              {/* 주의: 조건에 숫자 0을 쓰면 화면에 "0"이 그대로 찍힐 수 있다. 그래서 length > 0 처럼 명확히 비교한다. */}
              {notInRoster.length > 0 && (
                <>
                  <h3 style={{ margin: '8px 0 10px', color: '#d97706' }}>명단외 가입 ({notInRoster.length}) — 운영사 관리자</h3>
                  <div className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
                    <table className="admin-table">
                      <thead><tr><th>이름</th><th>이메일</th><th>전화</th><th>가입경로</th></tr></thead>
                      <tbody>
                        {/* 동일인 그룹 단위로 행 렌더 */}
                        {notInRoster.map((g) => (
                          <tr key={g.key}>
                            <td>
                              {g.name}
                              {/* 동일인 통합 그룹이면 계정 수 배지 표시 */}
                              {/* isMerged 가 true 일 때만(=여러 계정이 한 사람으로 합쳐졌을 때만) 배지를 보여준다. */}
                              {g.isMerged && (
                                <span title={`동일인 ${g.accounts.length}계정`} style={{
                                  marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                                  borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                                }}>동일인 {g.accounts.length}</span>
                              )}
                            </td>
                            <td>
                              {/* 그룹의 모든 이메일 나열(첫 번째 외에는 보조 스타일) */}
                              {/* i 는 인덱스(0,1,2...). i>0(=두 번째부터)이면 작고 흐린 스타일을 적용한다. */}
                              {g.emails.map((e, i) => (
                                <div key={e} style={i > 0 ? { fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                              ))}
                            </td>
                            <td>{g.phone || '-'}</td>
                            {/* 가입 경로(provider) 중복 제거 후 콤마로 연결, 없으면 '-' */}
                            {/* new Set(...) 로 중복 provider를 제거하고, Array.from 으로 다시 배열로 만든 뒤 join(', ')으로 합친다. */}
                            {/* filter(Boolean) 로 빈 값(없는 provider)을 먼저 걸러낸다. 결과가 빈 문자열이면 '-' 표시(|| '-'). */}
                            <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{Array.from(new Set(g.accounts.map(a => a.provider).filter(Boolean))).join(', ') || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* 전체 명단 + 가입 상태 */}
              <h3 style={{ margin: '8px 0 10px' }}>전체 명단 ({ROSTER_COUNT})</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>No</th><th>이름</th><th>성별</th><th>전공</th><th>계열</th><th>수준</th><th>가입</th><th>가입 이메일</th></tr></thead>
                  <tbody>
                    {/* 명단 전체를 순회: 중도포기 행은 취소선/흐림 처리 */}
                    {rows.map((r) => {
                      // !! 는 어떤 값을 확실한 true/false(불리언)로 바꾸는 관용구. (undefined 면 false 가 됨)
                      const dropped = !!r.student.dropped;
                      // 주의: .map 안에서 중괄호 { }로 본문을 열면 반드시 return 으로 JSX를 돌려줘야 한다.
                      return (
                      // 중도포기면 취소선 + 흐림(opacity) 스타일을, 아니면 기본(undefined) 스타일을 준다.
                      <tr key={r.student.no} style={dropped ? { textDecoration: 'line-through', color: 'var(--text-secondary, #9ca3af)', opacity: 0.65 } : undefined}>
                        <td>{r.student.no}</td>
                        <td>
                          {r.student.name}
                          {/* 중도포기 배지(취소선 영향 제거 위해 textDecoration none) */}
                          {/* 부모 행에 취소선이 걸려 있어도, 배지 글씨에는 취소선이 안 가도록 'none'으로 덮어쓴다. */}
                          {dropped && (
                            <span style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                              borderRadius: '999px', background: '#f3f4f6', color: '#6b7280',
                              textDecoration: 'none', display: 'inline-block', verticalAlign: 'middle',
                            }}>중도포기</span>
                          )}
                        </td>
                        <td>{r.student.gender}</td>
                        <td>{r.student.major}</td>
                        <td>{r.student.majorCategory}</td>
                        <td style={{ color: dropped ? '#9ca3af' : levelColor[r.student.level], fontWeight: 700 }}>{r.student.level}</td>
                        <td>
                          {/* 가입 상태 배지: 중도포기 > 가입(매칭됨) > 미가입 순으로 색/문구 결정 */}
                          {/* 삼항연산자를 겹쳐 씀: 먼저 dropped인지, 아니면 r.person(매칭됨)인지, 둘 다 아니면 미가입. */}
                          <span style={{
                            fontSize: '12.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                            textDecoration: 'none',
                            background: dropped ? '#f3f4f6' : (r.person ? '#d1fae5' : '#fee2e2'),
                            color: dropped ? '#6b7280' : (r.person ? '#065f46' : '#991b1b'),
                          }}>{dropped ? '중도포기' : (r.person ? '가입' : '미가입')}</span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                          {/* 매칭된 그룹의 가입 이메일들을 나열(없으면 '-') */}
                          {/* r.person 이 있을 때만 이메일 목록을 그리고, 없으면 '-' 한 글자를 보여준다. */}
                          {r.person ? r.person.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '12px' } : undefined}>{e}</div>
                          )) : '-'}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* 로딩 완료 후에도 프로필이 0건이면 Supabase 미연결/미가입 안내 */}
              {/* 흔한 원인: 로컬에서 Supabase 환경설정이 없거나, 로그인/권한(RLS) 때문에 데이터가 비어 보이는 경우. */}
              {!loading && profiles.length === 0 && (
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)', marginTop: '12px' }}>
                  ※ Supabase가 연결되지 않았거나 아직 가입한 회원이 없어 가입 데이터를 불러오지 못했습니다.
                  배포 환경(관리자 로그인 상태)에서 정확히 표시됩니다.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

// 이 파일의 "기본 내보내기". 다른 파일에서 import AdminRoster from '...' 로 가져다 쓴다.
export default AdminRoster;
