/**
 * AdminTeams.tsx
 * --------------------------------------------------------------------------
 * 역할:
 *   관리자 전용 "팀 편성 관리" 페이지. 사전에 확정된 팀 명단(CONFIRMED_TEAMS)을
 *   기준으로 DB의 팀 테이블을 일괄 생성/재구성하고, 현재 편성된 팀 목록을 조회·표시한다.
 *
 * 핵심 책임:
 *   1) Supabase에서 팀(teams) 및 사용자 프로필(user_profiles) 데이터를 로드.
 *   2) 확정 명단의 사람 이름을 실제 가입 계정(프로필)과 매칭하여 미리보기 제공.
 *   3) "이 명단으로 팀 생성" 시 기존 팀을 전부 삭제 후 확정 명단 기반으로 재삽입(seed).
 *   4) 현재 팀 카드(팀명·주제·팀원·팀장) 렌더링.
 *
 * 주요 export:
 *   - default AdminTeams: 관리자 팀 편성 관리 페이지 컴포넌트(ReactElement 반환).
 *
 * --------------------------------------------------------------------------
 * [초보자를 위한 배경지식]
 *   - React 컴포넌트: 화면의 한 조각을 만드는 "함수". 이 함수가 JSX를 반환하면
 *     React가 그것을 실제 화면 요소로 그려준다.
 *   - JSX: 자바스크립트 안에 HTML처럼 생긴 문법을 섞어 쓰는 것. 코드 중간에 <div>...</div>
 *     같은 태그가 나오는 이유다. JSX 안에서 주석은 보통 중괄호+슬래시별 형태로 쓴다.
 *   - 상태(state): 화면에 영향을 주는 "변하는 값". 값이 바뀌면 React가 화면을 다시 그린다.
 *     이 파일에서는 useState로 teams/profiles/loading 등을 상태로 관리한다.
 *   - Supabase: 클라우드 데이터베이스 + 인증 서비스. 여기서는 "팀/프로필 표(테이블)"를
 *     읽고 쓰는 도구로 쓴다. SQL을 직접 안 쓰고 .from(...).select(...) 같은 메서드로 조작.
 *   - 비동기(async/await): DB 요청처럼 시간이 걸리는 작업은 "기다렸다가" 결과를 받는다.
 *     async 함수 안에서 await를 붙이면 그 줄이 끝날 때까지 다음 줄로 안 넘어간다.
 *   - TypeScript(TS): 자바스크립트에 "타입(자료형)"을 더한 언어. 값의 모양을 미리 정해
 *     두어 실수를 코드 작성 단계에서 잡아준다.
 *
 * [이 페이지의 전체 흐름 한눈에 보기]
 *   페이지 열림 -> useEffect로 load() 1회 실행 -> DB에서 팀/프로필 가져옴
 *   -> 확정 명단과 프로필을 이름으로 매칭(preview) -> 화면에 통계/팀 카드 표시
 *   -> 관리자가 "팀 생성" 버튼 클릭 -> seed()가 기존 팀 삭제 후 새로 삽입 -> 다시 load().
 */

// React에서 쓰는 도구(훅과 타입)들을 가져온다.
// - useState: 상태 값을 만들고 바꾸는 훅(hook). "훅"은 use로 시작하는 React 전용 함수.
// - useEffect: 화면이 그려진 뒤(또는 특정 값이 바뀔 때) 실행할 코드를 등록하는 훅. 여기선 최초 데이터 로드용.
// - useMemo: 계산 결과를 "기억(캐시)"해 두고, 의존하는 값이 바뀔 때만 다시 계산하는 훅. 불필요한 재계산 방지.
// - type ReactElement: 컴포넌트가 반환하는 "React 화면 요소"의 타입(TS 타입만 가져옴, 실행 코드 아님).
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import { EmojiIcon, withIcons } from '../../utils/emojiIcon';
// 관리자 페이지 왼쪽에 항상 붙는 사이드바(메뉴) 컴포넌트.
import AdminSidebar from '../../components/AdminSidebar';
// 페이지의 <title>이나 검색엔진용 메타 태그를 넣어주는 컴포넌트.
import SEOHead from '../../components/SEOHead';
// Supabase 클라이언트(=DB와 대화하는 객체)를 만들어 돌려주는 함수.
// 주의: 설정이 없으면 null을 돌려줄 수 있으므로 사용 전 항상 null 검사가 필요하다.
import getSupabase from '../../utils/supabase';
// 현재 사이트(rest)의 설정값들(주소, DB 접두사 등). 멀티사이트를 한 코드로 운영하기 위한 구분자.
import site from '../../config/site';
// 동일인이 여러 계정/이름 표기를 가질 때 하나로 묶어주는 유틸 함수.
import { groupByPerson } from '../../utils/people';
// 확정된 팀 명단(CONFIRMED_TEAMS)과 팀 번호로 팀 이름 문자열을 만드는 teamName 함수.
import { CONFIRMED_TEAMS, teamName } from '../../config/teamRoster';
// Team/UserProfile의 "타입(모양) 정의"만 가져온다(type import: 실행 코드에는 영향 없음).
import type { Team, UserProfile } from '../../types';

// 사이트별 DB 접두사를 적용한 실제 테이블명 매핑(멀티사이트에서 테이블 충돌 방지)
// 예: site.dbPrefix가 'rest_'이면 실제 테이블명은 'rest_teams'가 된다.
// 백틱(`)으로 감싼 문자열은 템플릿 리터럴: 중간의 ${...}에 변수 값을 끼워 넣을 수 있다.
const TABLES = { teams: `${site.dbPrefix}teams` };
// 현재 사이트(rest)의 호스트명. 프로필을 이 사이트 소속만 필터링하는 데 사용.
// new URL(...).hostname: "https://rest.dreamitbiz.com/..." 같은 주소에서 'rest.dreamitbiz.com'만 뽑아낸다.
const REST_HOSTNAME = new URL(site.url).hostname;
// 이름 정규화 함수: 소문자화 + 모든 공백 제거 + 트림 -> 표기 차이를 무시한 동일성 비교용 키 생성.
// - 매개변수 s: 이름 문자열(없거나 null일 수도 있음).
// - (s || ''): s가 비어있으면(undefined/null/'') 빈 문자열로 대체 -> 뒤 메서드 호출 시 에러 방지.
// - .replace(/\s+/g, ''): 정규식 \s+ 는 "공백 1개 이상", g 플래그는 "문자열 전체"를 뜻함 -> 모든 공백 삭제.
// - 예: "홍 길동 "과 "홍길동"은 둘 다 "홍길동"이 되어 같은 사람으로 매칭된다.
const norm = (s?: string | null) => (s || '').toLowerCase().replace(/\s+/g, '').trim();

// 확정 명단 이름과 매칭된 대표 계정 정보를 담는 경량 타입.
// interface: TS에서 "객체가 가져야 할 속성과 그 타입"을 정의하는 문법.
interface Person { id: string; name: string; email: string; }

/**
 * AdminTeams 컴포넌트
 * - 매개변수: 없음.
 * - 반환값: 관리자 팀 편성 관리 화면(ReactElement).
 * - 부수효과: 마운트 시 Supabase에서 팀/프로필 로드, 버튼 클릭 시 DB 팀 일괄 재구성.
 * - 개념: 함수 이름이 대문자로 시작하면 React는 이를 "컴포넌트"로 인식한다.
 */
const AdminTeams = (): ReactElement => {
  // useState(초기값)은 [현재값, 값을바꾸는함수] 두 개를 배열로 돌려준다(배열 구조분해 할당).
  // setXxx를 호출하면 상태가 바뀌고 React가 이 컴포넌트를 다시 그린다(re-render).
  // 주의: teams를 직접 teams.push(...)처럼 바꾸면 안 되고, 반드시 setTeams(...)로 새 값을 줘야 화면이 갱신된다.
  const [teams, setTeams] = useState<Team[]>([]);        // DB에서 조회한 현재 팀 목록(<Team[]>은 "Team 객체들의 배열" 타입)
  const [profiles, setProfiles] = useState<UserProfile[]>([]); // 이 사이트 소속 사용자 프로필 목록
  const [loading, setLoading] = useState(true);          // 초기/재조회 로딩 상태(처음엔 true: 데이터 아직 못 받음)
  const [busy, setBusy] = useState(false);               // seed(생성) 작업 진행 중 여부 -> 버튼 잠금(중복 클릭 방지)
  const [msg, setMsg] = useState('');                    // 작업 결과 메시지(성공/실패). 빈 문자열이면 아무것도 안 보임.

  /**
   * load
   * - 무엇: Supabase에서 팀과 사용자 프로필을 병렬로 가져와 상태에 반영.
   * - 매개변수: 없음.
   * - 반환값: Promise<void>(async 함수라서 결과 없이 "완료"만 알리는 약속을 돌려줌).
   * - 부수효과: teams/profiles/loading 상태 갱신.
   */
  const load = async () => {
    const client = getSupabase();
    // Supabase 클라이언트가 없으면(설정 누락 등) 조용히 로딩만 종료.
    // 주의: 이 가드(early return)가 없으면 아래에서 null.from(...) 호출로 앱이 죽을 수 있다.
    if (!client) { setLoading(false); return; }
    // 두 쿼리를 병렬 실행하여 대기 시간 단축.
    // Promise.all([A, B]): A와 B를 "동시에" 시작하고 둘 다 끝날 때까지 기다린다(순차로 하면 시간 2배).
    // 결과는 입력 순서대로 [tRes, pRes]에 들어온다(배열 구조분해).
    const [tRes, pRes] = await Promise.all([
      // 팀 테이블 전체(*)를 created_at(생성 시각) 순으로 정렬해 가져온다.
      client.from(TABLES.teams).select('*').order('created_at'),
      // 이 사이트 소속 프로필만: 가입 도메인이 일치하거나 visited_sites 배열에 호스트명 포함(cs = contains).
      // .or('A,B'): A 조건 또는 B 조건 중 하나라도 맞으면 가져온다(SQL의 OR).
      // - signup_domain.eq.호스트: 가입 도메인이 이 사이트와 같음.
      // - visited_sites.cs.{호스트}: visited_sites 배열이 이 호스트명을 "포함(contains)"함.
      client.from('user_profiles').select('*').or(`signup_domain.eq.${REST_HOSTNAME},visited_sites.cs.{${REST_HOSTNAME}}`),
    ]);
    // 주의: 데이터가 없거나 에러면 .data가 null일 수 있으므로 if로 존재 확인 후에만 상태에 넣는다.
    // 'as Team[]'은 TS에게 "이 값을 Team 배열로 간주하라"는 타입 단언(런타임 동작은 안 바뀜).
    if (tRes.data) setTeams(tRes.data as Team[]);
    if (pRes.data) setProfiles(pRes.data as UserProfile[]);
    // 데이터 처리(성공/실패 무관)가 끝났으니 로딩 표시를 끈다 -> 화면이 스피너에서 실제 내용으로 바뀐다.
    setLoading(false);
  };
  // 마운트 시 1회 데이터 로드.
  // useEffect(실행할함수, 의존성배열): 의존성배열이 빈 []이면 "처음 화면에 나타날 때 딱 한 번"만 실행된다.
  // 주의: []를 빼면 매 렌더마다 load()가 돌아 무한 호출 위험. 한 번만 부르려면 []가 필수.
  useEffect(() => { load(); }, []);

  // 이름(실명/표시명/동일인 별칭) -> 대표 계정 매핑
  // - groupByPerson으로 동일인을 묶고, 그룹의 모든 이름 표기를 정규화 키로 등록.
  // - profiles가 바뀔 때만 재계산(useMemo)하여 매칭 비용 최소화.
  // 개념: Map은 "키 -> 값" 쌍을 저장하는 자료구조. 여기선 정규화된 이름(키)으로 사람(값)을 빠르게 찾는다.
  const nameToPerson = useMemo(() => {
    const m = new Map<string, Person>();
    // groupByPerson은 같은 사람으로 보이는 계정들을 하나의 그룹 g로 묶어준다.
    // .forEach: 배열의 각 요소(여기선 각 그룹 g)에 대해 콜백을 한 번씩 실행.
    groupByPerson(profiles).forEach((g) => {
      // 그룹의 대표 계정(primary)을 Person으로 추출. email은 첫 번째 이메일 사용.
      // g.emails[0] || '': 이메일이 하나도 없으면 빈 문자열로 안전하게 폴백.
      const p: Person = { id: g.primary.id, name: g.name, email: g.emails[0] || '' };
      // 그룹 대표 이름을 정규화한 키로 등록.
      m.set(norm(g.name), p);
      // 동일인의 모든 계정 이름/표시명도 같은 대표 계정으로 매핑(별칭 흡수).
      // a.name이나 a.display_name이 있을 때만(if) 등록 -> 빈 키로 잘못 매핑되는 것 방지.
      g.accounts.forEach((a) => { if (a.name) m.set(norm(a.name), p); if (a.display_name) m.set(norm(a.display_name), p); });
    });
    // 완성된 Map을 반환. useMemo가 이 값을 기억했다가 profiles가 그대로면 그대로 재사용한다.
    return m;
  }, [profiles]); // 의존성: profiles. profiles가 바뀔 때만 위 계산을 다시 한다.

  // 확정 명단 매칭 미리보기
  // - 각 확정 팀의 멤버 이름을 nameToPerson으로 조회하여 매칭 결과(person 또는 null) 부착.
  // .map(...): 배열을 같은 길이의 새 배열로 변환(원본은 안 바꿈 -> 불변성 유지).
  // {...t, ...}: 기존 팀 객체 t의 속성을 그대로 펼쳐 복사하고(스프레드), matched 속성만 새로 추가.
  const preview = useMemo(() => CONFIRMED_TEAMS.map((t) => ({
    ...t,
    // 각 멤버 이름을 정규화해 Map에서 찾는다. 없으면(.get 결과가 undefined) || null로 통일.
    matched: t.members.map((name) => ({ name, person: nameToPerson.get(norm(name)) || null })),
  })), [nameToPerson]); // nameToPerson이 바뀔 때만 다시 계산.
  // 가입 계정과 매칭되지 않은(미매칭) 인원 수 합계.
  // .reduce((누적, 현재) => ..., 초기값): 배열을 하나의 값으로 접어 합산.
  // 여기선 각 팀의 "person이 없는(!x.person) 멤버 수"를 모두 더해 미매칭 총원을 구한다.
  const unmatchedCount = preview.reduce((s, t) => s + t.matched.filter((x) => !x.person).length, 0);
  // 가입 계정과 매칭된 인원 수 합계(위와 반대로 person이 있는 멤버만 카운트).
  const matchedCount = preview.reduce((s, t) => s + t.matched.filter((x) => x.person).length, 0);

  /**
   * seed
   * - 무엇: 확정 명단 기준으로 팀 테이블을 전면 재구성(기존 전체 삭제 -> 신규 일괄 삽입).
   * - 매개변수: 없음.
   * - 반환값: Promise<void>.
   * - 부수효과: 사용자 확인(confirm), DB 삭제/삽입, busy/msg/loading 상태 변경, 성공 시 재조회.
   * - 주의: 파괴적 작업(기존 팀 전부 삭제)이므로 confirm으로 의도 확인.
   */
  const seed = async () => {
    // 파괴적 작업 경고 및 사용자 확인. 취소 시 즉시 중단.
    // confirm(...)은 브라우저 확인창을 띄우고 "확인"이면 true, "취소"면 false를 돌려준다.
    // 문자열 안의 \n은 줄바꿈. 취소(false)면 !false=true가 되어 return으로 함수를 빠져나간다.
    if (!confirm(`확정 명단으로 ${CONFIRMED_TEAMS.length}개 팀을 생성합니다.\n기존 팀은 모두 삭제됩니다. (미매칭 ${unmatchedCount}명은 이름만 등록)\n계속할까요?`)) return;
    const client = getSupabase();
    // 클라이언트가 없으면 아무 작업도 하지 않고 종료(가드).
    if (!client) return;
    // 작업 시작 표시: busy=true로 버튼을 잠그고(중복 클릭 방지), 이전 메시지는 지운다.
    setBusy(true); setMsg('');
    // 기존 팀 전체 삭제. delete는 WHERE가 필요하므로 절대 존재하지 않을 더미 UUID로 "id != 더미" 조건을 걸어 전체 매칭.
    // .neq('id', 더미): id가 더미와 "같지 않은(not equal)" 모든 행 -> 사실상 전체. (Supabase는 안전상 조건 없는 삭제를 막음.)
    // 결과 객체에서 error만 꺼내 delErr라는 이름으로 받는다(구조분해 + 이름 변경).
    const { error: delErr } = await client.from(TABLES.teams).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // 삭제 실패 시 삽입을 진행하지 않고 종료(데이터 일관성 보호).
    // 주의: 여기서 멈추지 않으면 "삭제는 실패했는데 삽입은 시도"하는 어긋난 상태가 될 수 있다.
    if (delErr) { setMsg(`삭제 실패: ${delErr.message}`); setBusy(false); return; }
    // 확정 명단 미리보기를 DB 삽입용 행으로 변환.
    const rows = preview.map((t) => ({
      name: teamName(t.no),          // 팀 번호로 팀 이름 문자열 생성(예: 1 -> "1팀").
      project_topic: t.topic,        // 팀의 프로젝트 주제.
      description: '',               // 설명은 비워서 생성(나중에 학생/관리자가 채움).
      // 매칭된 사람은 실제 계정 id/email을, 미매칭은 'unmatched:정규화이름' 형태의 임시 id로 식별(이름만 등록).
      // x.person?.id: 옵셔널 체이닝. person이 null이면 에러 없이 undefined가 되고, 그러면 || 뒤의 임시 id를 쓴다.
      // role은 일단 모두 '팀원'. 팀장은 나중에 학생이 직접 지원해서 정해진다(아래 안내 문구 참고).
      members: t.matched.map((x) => ({ id: x.person?.id || `unmatched:${norm(x.name)}`, name: x.name, email: x.person?.email || '', role: '팀원' })),
    }));
    // 변환한 행들을 한 번에 삽입(insert). 결과의 error를 insErr로 받는다.
    const { error: insErr } = await client.from(TABLES.teams).insert(rows);
    // 삽입 결과 메시지: 실패 시 사유, 성공 시 생성 팀 수 및 매칭/미매칭 통계.
    // 삼항연산자 (조건 ? A : B): insErr가 있으면 실패 메시지, 없으면 성공 메시지를 선택.
    setMsg(insErr ? `생성 실패: ${insErr.message}` : `✅ ${rows.length}개 팀 생성 완료 (매칭 ${matchedCount}명 · 미매칭 ${unmatchedCount}명)`);
    // 작업 종료: 버튼 잠금 해제.
    setBusy(false);
    // 성공 시 최신 상태 반영을 위해 재조회.
    // 주의: 삽입했다고 화면의 teams가 자동으로 바뀌지 않는다. load()로 DB에서 다시 읽어와야 새 팀이 보인다.
    if (!insErr) { setLoading(true); await load(); }
  };

  // 아래 return이 실제로 화면에 그려질 내용(JSX)이다.
  // <>...</>는 Fragment: 여러 요소를 "보이지 않는 한 봉지"로 묶을 때 쓴다(불필요한 div 안 만들려고).
  return (
    <>
      {/* 관리자 페이지 SEO 메타: noindex로 검색엔진 색인 차단 */}
      {/* noindex는 값 없이 쓴 prop으로 noindex={true}와 같은 의미(검색엔진에 노출 금지). */}
      <SEOHead title="팀 편성 관리" path="/admin/teams" noindex />
      <div className="admin-layout">
        {/* 좌측 관리자 네비게이션 */}
        <AdminSidebar />
        <div className="admin-content">
          <h2>팀 편성 관리</h2>

          {/* 확정 명단 기반 팀 생성 컨트롤 패널 */}
          {/* JSX에서 style은 객체로 준다: style={{ key: value }} (바깥 중괄호=JS 표현식, 안쪽=객체). */}
          <div style={{ border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px', padding: '16px 18px', marginBottom: '24px', background: 'var(--bg-light-gray, #f8f9fa)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '15px' }}><EmojiIcon char="📋" /> 확정 명단으로 팀 정리</strong>
                {/* 팀 수 및 매칭 통계 요약. 미매칭이 있을 때만 경고색으로 별도 표시 */}
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                  {/* {변수}로 JS 값을 화면에 끼워 넣는다. */}
                  {CONFIRMED_TEAMS.length}개 팀 · 매칭 {matchedCount}명
                  {/* {조건 && JSX}: 조건이 참일 때만 뒤의 JSX를 그린다. 미매칭 0명이면 이 부분은 안 보임. */}
                  {unmatchedCount > 0 && <span style={{ color: '#d97706' }}> · 미매칭 {unmatchedCount}명</span>}
                </p>
              </div>
              {/* 팀 일괄 생성 버튼: 작업 중(busy) 또는 로딩 중(loading)이면 비활성화 */}
              {/* onClick={seed}: 클릭하면 seed 함수를 실행. disabled가 true면 클릭이 막힌다(중복/조기 실행 방지). */}
              <button onClick={seed} disabled={busy || loading} style={{ padding: '9px 16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', borderRadius: '8px', background: 'var(--primary-blue, #0046C8)', color: '#fff' }}>
                {/* 처리 중이면 라벨을 바꿔 사용자에게 진행 상태를 알린다. */}
                {busy ? '처리 중…' : '이 명단으로 팀 생성 (기존 대체)'}
              </button>
            </div>
            {/* 작업 결과 메시지(성공/실패)는 존재할 때만 표시 */}
            {/* msg가 빈 문자열('')이면 거짓 취급이라 안 보이고, 내용이 있으면 <p>가 나타난다. */}
            {msg && <p style={{ margin: '10px 0 0', fontSize: '13px', fontWeight: 600 }}>{withIcons(msg)}</p>}
            {/* 미매칭 인원이 있으면 "팀명 이름" 목록을 쉼표로 나열하여 안내 */}
            {unmatchedCount > 0 && (
              <p style={{ margin: '10px 0 0', fontSize: '12.5px', color: '#d97706' }}>
                {/* flatMap: 각 팀에서 미매칭 멤버를 "팀명 이름" 문자열 배열로 만든 뒤, 모든 팀 결과를 한 배열로 평탄화. */}
                {/* .join(', '): 그 배열을 쉼표+공백으로 이어 하나의 문자열로 만든다. */}
                <EmojiIcon char="⚠" /> 미매칭(가입 계정 없음): {preview.flatMap((t) => t.matched.filter((x) => !x.person).map((x) => `${teamName(t.no)} ${x.name}`)).join(', ')}
              </p>
            )}
            {/* 팀장은 미지정으로 생성되며, 학생이 직접 지원해야 함을 안내 */}
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-secondary, #9ca3af)' }}>※ 팀장은 미지정으로 생성됩니다. 학생이 팀구성 화면에서 먼저 ‘내가 팀장 할게요’를 누른 1명이 팀장이 됩니다.</p>
          </div>

          {/* 상태별 렌더링: 로딩 중 → 스피너 / 팀 있음 → 그리드 / 팀 없음 → 빈 메시지 */}
          {/* 중첩 삼항연산자: loading이면 A, 아니면 (teams가 있으면 B, 아니면 C). 화면의 3가지 모습을 한 번에 결정. */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : teams.length > 0 ? (
            <div className="teams-grid">
              {/* 팀 배열을 팀번호(name의 숫자) 오름차순으로 정렬해 카드를 그린다. */}
              {[...teams]
                .sort((a, b) => ((parseInt((a.name || '').replace(/[^0-9]/g, ''), 10) || 999) - (parseInt((b.name || '').replace(/[^0-9]/g, ''), 10) || 999)))
                .map(team => {
                // members가 배열이 아닐 수 있으므로(데이터 방어) 안전하게 빈 배열로 폴백.
                // Array.isArray로 확인: DB 값이 깨졌거나 null이어도 아래 .find/.map/.length에서 에러 안 나게 한다.
                const ms = Array.isArray(team.members) ? team.members : [];
                // 역할이 '팀장'인 멤버를 찾아 헤더에 표기(없으면 '팀장 미정').
                // .find: 조건에 맞는 "첫 번째" 요소를 돌려주고, 없으면 undefined.
                const leader = ms.find((m) => m.role === '팀장');
                return (
                  // key: 목록의 각 항목을 React가 구분하기 위한 고유 식별자(여기선 team.id). 성능/정확성에 중요.
                  <div key={team.id} className="team-card">
                    <h3>{team.name}</h3>
                    {/* 프로젝트 주제 우선, 없으면 설명으로 폴백 */}
                    {/* project_topic이 비어 있으면(거짓) || 뒤의 description을 보여준다. */}
                    <p>{team.project_topic || team.description}</p>
                    <div className="team-members">
                      {/* leader가 있으면(삼항) 팀장 이름을, 없으면 '팀장 미정' 표시. */}
                      <h4>팀원 ({ms.length}명) {leader ? `· 팀장 ${leader.name}` : '· 팀장 미정'}</h4>
                      {/* 각 팀원: 이름 + 팀장 표시(👑) + 미매칭 표시(임시 id 'unmatched:' 접두 시 ⚠) */}
                      {/* key={i}: 여기선 멤버에 고유 id가 마땅치 않아 인덱스 i를 key로 사용(목록이 거의 안 바뀌어 허용). */}
                      {/* String(m.id).startsWith('unmatched:'): id가 숫자여도 문자열로 바꿔 'unmatched:'로 시작하는지 검사. */}
                      <ul>{ms.map((m, i) => <li key={i}>{m.name} {m.role === '팀장' ? <><EmojiIcon char="👑" /> 팀장</> : ''}{String(m.id).startsWith('unmatched:') ? <>{' '}<EmojiIcon char="⚠" />미매칭</> : ''}</li>)}</ul>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-message">팀이 아직 편성되지 않았습니다. 위 ‘확정 명단으로 팀 생성’을 눌러 편성하세요.</p>
          )}
        </div>
      </div>
    </>
  );
};

// 이 컴포넌트를 다른 파일(라우터 등)에서 import해 쓸 수 있도록 기본(default) 내보내기.
export default AdminTeams;
