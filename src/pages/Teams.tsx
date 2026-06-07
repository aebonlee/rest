/**
 * Teams.tsx
 *
 * [이 파일이 무엇인가? — 초보자용 큰 그림]
 *   - 이 파일은 웹사이트의 "팀 구성" 페이지 하나를 통째로 그려주는 React 컴포넌트입니다.
 *   - React에서 "컴포넌트(component)"란 화면의 한 조각(여기서는 페이지 전체)을 만들어내는 함수입니다.
 *     이 함수가 JSX(HTML처럼 생긴 코드)를 반환하면, React가 그것을 실제 화면으로 바꿔줍니다.
 *   - 이 페이지는 데이터베이스(Supabase)에 저장된 팀 목록을 불러와서, 팀마다 카드 형태로 보여줍니다.
 *
 * [꼭 알아야 할 배경 용어 — 처음 보면 어려운 단어 풀이]
 *   - Supabase: 클라우드에 있는 데이터베이스 + 백엔드 서비스. 여기서는 "teams 테이블"이라는
 *               표(table)에 팀 정보가 행(row) 단위로 저장되어 있다고 생각하면 됩니다.
 *   - 비동기(async/await): 데이터베이스에서 데이터를 받아오는 일은 "시간이 걸리는 일"입니다.
 *               그동안 화면이 멈추면 안 되므로, "기다렸다가 도착하면 처리"하는 방식이 비동기입니다.
 *   - 상태(state): 컴포넌트가 기억하는 값. 이 값이 바뀌면 React가 화면을 자동으로 다시 그립니다.
 *   - RLS(Row Level Security): Supabase의 보안 규칙. "어떤 사용자가 어떤 행을 볼 수 있는지"를
 *               데이터베이스 차원에서 제한합니다. 그래서 같은 쿼리라도 사람마다 결과가 다를 수 있습니다.
 *
 * [이 페이지의 동작 흐름 — 한눈에]
 *   1) 페이지가 처음 화면에 나타나면(마운트) 자동으로 팀 데이터를 불러옵니다.
 *   2) 불러오는 동안에는 "로딩 스피너"(빙글빙글 도는 표시)를 보여줍니다.
 *   3) 다 불러오면, 팀이 있으면 카드 목록을, 팀이 없으면 안내 문구를 보여줍니다.
 *   4) 검색엔진에 노출되지 않도록(noindex) SEO 설정도 합니다(내부용 페이지라서).
 *
 * 주요 export:
 *   - default: Teams 컴포넌트(React 함수 컴포넌트, ReactElement 반환).
 */

// [import = 다른 파일/라이브러리에서 기능을 가져오기]
// useState, useEffect: React의 "훅(Hook)". 훅은 함수 컴포넌트에서 상태나 생명주기 같은
//   React 기능을 쓰게 해주는 특별한 함수입니다. 이름이 항상 use로 시작합니다.
// type ReactElement: 타입스크립트(TS)에서 "이 함수가 반환하는 값의 타입"을 표시하기 위한 것.
//   'type' 키워드가 붙으면 실제 코드가 아니라 "타입 정보"만 가져온다는 뜻입니다(실행에 영향 없음).
import { useState, useEffect, type ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext'; // 로그인/세션 정보를 다루는 우리 프로젝트의 인증 훅
import SEOHead from '../components/SEOHead';        // <head> 안의 제목/메타태그를 설정해주는 컴포넌트
import getSupabase from '../utils/supabase';        // Supabase 클라이언트(접속 객체)를 만들어 돌려주는 함수
import site from '../config/site';                  // 사이트별 설정값 모음(예: DB 접두사)
import type { Team } from '../types';               // Team이라는 데이터 모양(타입) 정의. 'type'이라 실행 코드 아님.

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 테이블명을 구성한다.
// 동일 Supabase 프로젝트를 여러 사이트가 공유할 때 테이블 충돌을 방지하기 위함.
//
// [초보자 설명] 백틱(`)으로 감싼 문자열을 "템플릿 리터럴"이라 하고, ${...} 안에 변수를 끼워 넣을 수 있습니다.
//   예: dbPrefix가 "rest_"라면 결과는 "rest_teams"가 됩니다.
// 주의: 백틱 문자열 ${} 안에는 절대로 주석을 넣으면 안 됩니다. 출력 문자열이 바뀌어 버립니다.
const TABLES = { teams: `${site.dbPrefix}teams` };

/**
 * Teams - 팀 구성 페이지 컴포넌트.
 *
 * 무엇을 하는가: 데이터베이스에서 팀 목록을 읽어와 화면(카드 그리드)으로 보여준다.
 * 왜 이렇게 하는가: 페이지 단위로 하나의 함수로 묶어두면, 라우터가 "/teams" 주소일 때
 *                  이 함수만 불러 화면에 끼워 넣으면 되므로 관리가 쉽다.
 *
 * 매개변수: 없음.
 * 반환값: ReactElement (페이지 헤더 + 팀 카드 그리드 또는 빈/로딩 상태).
 * 부수효과: 마운트 시 Supabase에서 팀 목록을 조회하여 상태에 반영(아래 useEffect 참조).
 *           ('부수효과'란 화면을 그리는 것 외에 추가로 일어나는 일 — 여기서는 DB 조회.)
 */
const Teams = (): ReactElement => {
  // 인증 컨텍스트 초기화/구독 목적의 호출(반환값은 사용하지 않음 — 세션 보장용).
  // [초보자 설명] useAuth()는 로그인 상태를 관리하는 훅입니다. 여기서는 반환값을 변수에 담지 않고
  //   그냥 호출만 합니다. 이렇게만 해도 이 페이지가 인증 컨텍스트와 "연결"되어, 세션이 준비되도록 합니다.
  useAuth();

  // teams: 조회된 팀 목록 상태. 초기값은 빈 배열.
  // [초보자 설명] useState는 [현재값, 값을바꾸는함수] 두 개를 짝으로 돌려줍니다.
  //   - teams: 지금 화면에 쓸 팀 배열
  //   - setTeams: 이 배열을 새 값으로 바꿔주는 함수(이 함수를 호출해야 화면이 다시 그려짐)
  //   <Team[]>는 "Team 객체들의 배열"이라는 타입 표시입니다.
  // 주의: teams를 직접 teams.push(...) 식으로 바꾸면 안 됩니다(불변성 위반 → 화면 갱신 안 됨).
  //   반드시 setTeams(새배열)을 써야 React가 변화를 알아챕니다.
  const [teams, setTeams] = useState<Team[]>([]);

  // loading: 데이터 조회 진행 중 여부. 초기에는 true로 시작해 스피너를 노출.
  // [초보자 설명] 처음에는 데이터가 아직 없으니 true(=불러오는 중). 다 불러오면 false로 바꿉니다.
  const [loading, setLoading] = useState(true);

  // 마운트 시 1회 실행: 팀 목록을 비동기로 로드한다(의존성 배열 [] — 재실행 없음).
  // [초보자 설명] useEffect는 "화면이 그려진 뒤에 실행할 작업"을 등록하는 훅입니다.
  //   두 번째 인자인 의존성 배열([])이 비어 있으면 → 컴포넌트가 처음 나타날 때 딱 한 번만 실행됩니다.
  //   (만약 [teams]처럼 값을 넣으면 그 값이 바뀔 때마다 다시 실행됩니다.)
  // 왜 useEffect 안에서 하는가: 데이터 조회 같은 부수효과는 화면 그리는 함수 본문에서 직접 하면
  //   안 되고(매 렌더마다 호출되어 무한 반복 위험), useEffect로 분리하는 것이 React의 규칙입니다.
  useEffect(() => {
    // load: 실제로 데이터를 불러오는 비동기 함수.
    // [초보자 설명] async를 붙인 함수 안에서는 await를 쓸 수 있고, await는 "결과가 올 때까지 기다림"을 뜻합니다.
    const load = async () => {
      // Supabase 클라이언트 획득. 환경설정 미비 시 null일 수 있음.
      // [초보자 설명] '클라이언트'는 데이터베이스에 명령을 보낼 수 있는 도구(객체)입니다.
      const client = getSupabase();

      // 클라이언트가 없으면 더 진행하지 않고 로딩만 종료(빈 상태로 폴백).
      // [초보자 설명] DB 접속 정보가 없으면 client가 null입니다. 그대로 진행하면 에러가 나므로,
      //   여기서 멈추고(return) 로딩만 끕니다. 그러면 화면은 "팀 없음" 상태로 자연스럽게 표시됩니다.
      // 주의: return 앞에 setLoading(false)를 꼭 호출합니다. 안 그러면 스피너가 영원히 도는 버그가 됩니다.
      if (!client) { setLoading(false); return; }

      // teams 테이블 전체 컬럼을 created_at 오름차순으로 조회.
      // (RLS 정책에 따라 접근 가능한 행만 반환될 수 있음.)
      // [초보자 설명] 메서드를 점(.)으로 이어 붙여 "어느 표에서 / 무엇을 / 어떻게 정렬해" 가져올지 지정합니다.
      //   - from(...): 어느 테이블에서
      //   - select('*'): 모든 컬럼을 (*은 '전부'라는 뜻)
      //   - order('created_at'): 만든 시각 순(오름차순, 오래된 것부터)
      //   await 덕분에 결과가 도착할 때까지 기다린 뒤, 결과를 { data } 형태로 꺼냅니다(구조 분해 할당).
      const { data } = await client.from(TABLES.teams).select('*').order('created_at');

      // 데이터가 있을 때만 상태 갱신(에러/널 시 기존 빈 배열 유지).
      // [초보자 설명] data가 null이거나 비어 있으면 setTeams를 호출하지 않아 초기 빈 배열을 유지합니다.
      //   'data as Team[]'는 타입스크립트에게 "이 데이터를 Team 배열로 취급해"라고 알려주는 표시(타입 단언)입니다.
      if (data) setTeams(data as Team[]);

      // 성공/실패 무관하게 로딩 상태 해제.
      // [초보자 설명] 데이터를 받았든 못 받았든, 조회 시도가 끝났으니 스피너를 끕니다.
      setLoading(false);
    };

    // 비동기 로더 실행(반환 Promise는 의도적으로 await하지 않음).
    // [초보자 설명] useEffect의 콜백 함수 자체에는 async를 붙일 수 없어서, async 함수(load)를 안에서
    //   따로 정의한 뒤 여기서 호출하는 패턴을 씁니다. load()는 Promise를 돌려주지만 기다리지 않아도
    //   내부에서 알아서 상태를 갱신하므로 문제 없습니다.
    load();
  }, []); // <- 빈 배열: "처음 한 번만 실행" 신호

  // [초보자 설명] 아래 return 안의 코드가 바로 화면(JSX)입니다. HTML과 비슷하지만 자바스크립트 안에 들어있습니다.
  return (
    // <> ... </>: "Fragment". 여러 요소를 묶되, 불필요한 <div> 같은 껍데기를 추가하지 않으려고 씁니다.
    <>
      {/* 내부용 페이지이므로 noindex로 검색엔진 색인 제외 */}
      {/* [초보자 설명] noindex를 켜면 구글 같은 검색엔진이 이 페이지를 검색 결과에 올리지 않습니다. */}
      <SEOHead title="팀" path="/teams" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀 구성</h2>
          <p>프로젝트 팀 정보입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 3분기 렌더링: 로딩 중 → 스피너 / 팀 존재 → 그리드 / 없음 → 안내 문구 */}
          {/* [초보자 설명] JSX 안에서 조건에 따라 다른 화면을 보여줄 때 삼항 연산자(A ? B : C)를 씁니다.
              읽는 법: loading이 true면 스피너, 아니면 다시 "teams가 있나?"를 따져 그리드 또는 안내문구. */}
          {loading ? (
            // 로딩 스피너(중앙 정렬)
            // [초보자 설명] style={{...}}는 인라인 CSS입니다. 바깥 {}는 "JS 코드 시작", 안쪽 {}는 "객체"라서 중괄호가 2개입니다.
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : teams.length > 0 ? (
            <div className="teams-grid">
              {/* 팀 목록 순회: 각 팀을 카드로 렌더링 */}
              {/* [초보자 설명] .map(...)은 배열의 각 원소를 화면 요소로 변환합니다. 팀 1개당 카드 1개가 만들어집니다. */}
              {teams.map(team => (
                // key={team.id}: 목록을 그릴 때 React가 각 항목을 구별하려고 요구하는 고유 식별자입니다.
                // 주의: key를 빠뜨리면 React가 경고하고, 목록 갱신 시 화면이 꼬일 수 있습니다.
                <div key={team.id} className="team-card">
                  <h3 className="team-name">{team.name}</h3>
                  {/* 프로젝트 주제 우선 표시, 없으면 설명으로 폴백 */}
                  {/* [초보자 설명] A || B 는 "A가 비어있으면(없으면) B를 쓴다"는 뜻입니다.
                      project_topic이 비어 있을 때 description을 대신 보여줍니다. */}
                  <p className="team-topic">{team.project_topic || team.description}</p>
                  <div className="team-members">
                    <h4>팀원</h4>
                    <ul>
                      {/* members가 배열이 아닐 수 있어(엣지케이스) 가드 후 빈 배열로 폴백하여 순회 */}
                      {/* [초보자 설명] DB에 members가 없거나 잘못된 형태(null 등)로 들어올 수 있습니다.
                          그대로 .map을 호출하면 에러가 나므로, 먼저 "진짜 배열인지" Array.isArray로 확인하고
                          배열이 아니면 빈 배열([])로 바꿔 안전하게 순회합니다. 이런 방어 코드를 '가드'라고 합니다. */}
                      {(Array.isArray(team.members) ? team.members : []).map((m, i) => (
                        // members에 안정적 id가 없을 수 있어 index를 key로 사용
                        // 주의: 보통은 index를 key로 쓰는 것을 피하는 게 좋지만(순서가 바뀌면 문제),
                        //   팀원에 고유 id가 없는 상황이라 어쩔 수 없이 index(i)를 사용합니다.
                        <li key={i}>
                          <span className="member-name">{m.name}</span>
                          {/* 역할(role)은 있을 때만 표시 */}
                          {/* [초보자 설명] A && B 는 "A가 참일 때만 B를 보여준다"는 흔한 패턴입니다.
                              role 값이 있을 때만 역할 span을 화면에 그립니다. */}
                          {m.role && <span className="member-role">{m.role}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 로딩 완료 + 팀 0건일 때의 빈 상태 안내
            // [초보자 설명] 위 두 조건(로딩 중, 팀 있음)에 모두 해당하지 않을 때 여기로 옵니다.
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>팀이 아직 편성되지 않았습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

// [초보자 설명] export default는 "이 파일의 대표 결과물은 Teams 컴포넌트"라는 선언입니다.
//   다른 파일(예: 라우터)에서 import Teams from './pages/Teams' 로 가져다 쓸 수 있게 됩니다.
export default Teams;
