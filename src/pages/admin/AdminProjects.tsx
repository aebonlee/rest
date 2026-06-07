/**
 * AdminProjects.tsx
 *
 * 역할:
 *   관리자(Admin) 영역의 "프로젝트 관리" 페이지 컴포넌트.
 *   Supabase에 저장된 학습/포트폴리오 프로젝트 목록을 조회해 표(table) 형태로 보여준다.
 *
 * 핵심 책임:
 *   - 마운트 시 Supabase에서 프로젝트 목록을 최신순으로 1회 로드.
 *   - 로딩 상태에 따라 스피너 또는 테이블을 렌더링.
 *   - 각 프로젝트의 제목/유형/상태/사용 LLM/등록일을 한국어 라벨과 함께 표시.
 *
 * 주요 export:
 *   - default export: AdminProjects (관리자 프로젝트 관리 페이지 React 컴포넌트)
 *
 * ── 초보자를 위한 배경 지식 ──────────────────────────────────────────────
 *   - React 컴포넌트(Component): 화면의 한 조각을 만들어 내는 "함수"라고 생각하면 된다.
 *     이 함수는 결국 화면에 그릴 내용(JSX)을 반환(return)한다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 보이는 문법(예: <div>...</div>). 실제로는
 *     자바스크립트로 변환되어 동작한다.
 *   - 상태(state): 화면이 기억해야 하는 "변하는 값"(예: 데이터 목록, 로딩 여부).
 *     state가 바뀌면 React가 화면을 자동으로 다시 그려(re-render) 준다.
 *   - Supabase: 데이터베이스 + 인증 등을 제공하는 백엔드 서비스. 여기서는 DB에서
 *     프로젝트 목록을 읽어오는 용도로 쓴다.
 *   - RLS(Row Level Security): "어떤 사용자가 어떤 행(row)을 볼 수 있는가"를 DB가
 *     직접 제어하는 보안 규칙. 권한이 없으면 데이터가 빈 채로 돌아올 수 있다.
 *   - 비동기(async/await): 서버에서 데이터를 받아오는 일은 시간이 걸린다. 그동안
 *     멈춰 기다리지 않고 "다 되면 알려줘" 식으로 처리하는 방식이 비동기다.
 * ─────────────────────────────────────────────────────────────────────────
 */

// React에서 쓸 기능들을 가져온다(import).
//   - useState: 컴포넌트가 기억할 "상태 값"을 만드는 훅(Hook).
//   - useEffect: 화면이 그려진 뒤 "부수효과"(데이터 로딩 등)를 실행하는 훅.
//   - type ReactElement: 컴포넌트가 반환하는 "화면 요소"의 TypeScript 타입.
//     (개념) 훅(Hook): use로 시작하는 React 특수 함수. 컴포넌트 함수의 "최상단"에서만
//     호출해야 하며, if/for 안에서 조건부로 호출하면 안 된다(주의).
import { useState, useEffect, type ReactElement } from 'react';
// 화면 구성에 필요한 다른 컴포넌트와 유틸들을 가져온다.
import AdminSidebar from '../../components/AdminSidebar'; // 좌측 관리자 메뉴(사이드바) 컴포넌트
import SEOHead from '../../components/SEOHead';           // <head> 안의 SEO 메타태그를 설정해 주는 컴포넌트
import getSupabase from '../../utils/supabase';           // Supabase 클라이언트를 만들어 돌려주는 함수
import site from '../../config/site';                     // 사이트 전역 설정(여기선 DB 접두사 사용)
// type import: 실제 실행 코드가 아니라 "타입 정보"만 가져온다(빌드 후 사라짐).
import type { Project } from '../../types';               // 프로젝트 한 건의 데이터 형태(타입)

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 사용할 테이블명을 구성한다.
// 여러 프로젝트가 동일 Supabase 인스턴스를 공유할 때 테이블 충돌을 막기 위한 네이밍 규칙.
//   (개념) 백틱(`...`)으로 감싼 문자열은 "템플릿 리터럴"로, ${...} 안의 값을 끼워 넣는다.
//   예: dbPrefix가 'rest_'이면 결과는 'rest_projects'가 된다.
//   주의: 백틱 문자열 내부에는 주석을 넣으면 안 된다(문자열에 그대로 들어가 출력이 바뀜).
const TABLES = { projects: `${site.dbPrefix}projects` };
// 프로젝트의 영문 status 코드를 화면 표시용 한국어 라벨로 매핑하는 사전.
// 매핑에 없는 값이 들어오면 렌더 시 원본 코드를 그대로 표시한다(아래 fallback 참고).
//   (개념) Record<string, string>: "문자열 키 → 문자열 값" 형태의 객체임을 알려주는 타입.
//   예: statusLabels['planning'] === '기획 중'
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };

/**
 * AdminProjects
 *
 * 무엇을: 관리자용 프로젝트 목록 페이지를 렌더링하는 함수형 컴포넌트.
 * 매개변수: 없음.
 * 반환값: ReactElement (페이지 전체 마크업).
 * 부수효과: 마운트 시 useEffect를 통해 Supabase에서 프로젝트 데이터를 비동기로 가져온다.
 *   (용어) "마운트(mount)": 컴포넌트가 화면에 처음 나타나는 순간을 뜻한다.
 */
const AdminProjects = (): ReactElement => {
  // projects: 조회된 프로젝트 목록 상태(초기값은 빈 배열).
  //   useState는 [현재값, 변경함수] 두 개를 배열로 돌려준다. 아래처럼 구조 분해로 받는다.
  //   - projects: 지금 저장된 프로젝트 배열
  //   - setProjects: 이 값을 바꿀 때 쓰는 함수(이걸 호출해야 화면이 다시 그려진다)
  //   <Project[]>는 "Project 타입의 배열"을 담는다는 TypeScript 표기.
  const [projects, setProjects] = useState<Project[]>([]);
  // loading: 데이터 로딩 중 여부. 초기값 true로 시작해 로드 완료 시 false로 전환.
  //   처음엔 아직 데이터가 없으므로 true(로딩 중)로 두고, 다 받으면 false로 바꿔
  //   스피너 대신 실제 표를 보여 준다.
  const [loading, setLoading] = useState(true);

  // 컴포넌트 최초 마운트 시 1회만 실행되는 데이터 로딩 effect (의존성 배열이 빈 배열).
  //   (개념) useEffect(콜백, 의존성배열): 화면이 그려진 뒤 콜백을 실행한다.
  //   의존성 배열 []가 "비어 있으면" 처음 한 번만 실행된다(이후 재렌더에서는 재실행 안 함).
  //   주의: 만약 [] 대신 어떤 값을 넣으면, 그 값이 바뀔 때마다 콜백이 다시 실행된다.
  useEffect(() => {
    // 비동기 로더: Supabase 클라이언트로 프로젝트를 최신순 조회한다.
    //   useEffect의 콜백 자체는 async로 만들 수 없어서, 안쪽에 async 함수를 따로 정의한다.
    const load = async () => {
      // Supabase에 접속할 "클라이언트"(연결 도구)를 얻는다.
      const client = getSupabase();
      // 클라이언트가 없으면(환경변수 미설정 등) 로딩만 종료하고 조용히 빠져나간다 — 엣지케이스 방어.
      //   (왜) client가 null인데 그대로 진행하면 client.from(...) 호출에서 에러가 난다.
      //   그래서 미리 막고, 화면은 무한 스피너에 빠지지 않도록 loading을 false로 내린다.
      if (!client) { setLoading(false); return; }
      // created_at 내림차순(ascending: false)으로 정렬해 최신 프로젝트가 먼저 오도록 한다.
      // (RLS 정책이 적용된 경우, 권한이 없으면 data가 비어 올 수 있다.)
      //   읽는 법: "projects 테이블에서(from) 모든 컬럼(*)을 골라(select) created_at 기준 내림차순 정렬(order)".
      //   (개념) await: 서버 응답이 올 때까지 이 줄에서 잠시 기다렸다가 결과를 받는다.
      //   { data }는 응답 객체에서 data 속성만 꺼내는 "구조 분해 할당"이다.
      const { data } = await client.from(TABLES.projects).select('*').order('created_at', { ascending: false });
      // 응답이 있을 때만 상태 갱신. Supabase는 unknown 형태로 주므로 Project[]로 단언.
      //   (개념) "as Project[]": TypeScript에게 "이 데이터는 Project 배열이라고 믿어"라고 알려주는 타입 단언.
      //   주의: data가 null/undefined일 수도 있어 if로 먼저 확인한 뒤에만 setProjects를 호출한다.
      if (data) setProjects(data as Project[]);
      // 성공/실패 여부와 무관하게 로딩 종료 처리.
      //   (왜) 데이터를 받았든 못 받았든, 더 이상 "로딩 중" 화면을 보여줄 필요가 없기 때문.
      setLoading(false);
    };
    // 선언한 비동기 함수 즉시 실행(useEffect 콜백은 async일 수 없으므로 내부에서 호출).
    //   주의: load()는 비동기라 "기다리지 않고" 바로 다음으로 넘어간다. 결과 반영은
    //   위 함수 안에서 setProjects/setLoading이 처리하므로 여기서 await할 필요가 없다.
    load();
  }, []); // ← 빈 의존성 배열: "마운트 시 단 한 번만 실행"의 핵심.

  // 이 컴포넌트가 화면에 그릴 내용(JSX)을 반환한다.
  //   <>...</>는 "프래그먼트(Fragment)": 불필요한 div 없이 여러 요소를 한 덩어리로 감쌀 때 쓴다.
  return (
    <>
      {/* SEO 메타 설정. 관리자 페이지이므로 noindex로 검색엔진 색인 제외. */}
      {/* (왜) 관리자 전용 화면은 검색 결과에 노출될 필요가 없어 noindex로 막는다. */}
      <SEOHead title="프로젝트 관리" path="/admin/projects" noindex />
      <div className="admin-layout">
        {/* 좌측 관리자 네비게이션 사이드바 */}
        <AdminSidebar />
        <div className="admin-content">
          <h2>프로젝트 관리</h2>
          {/* 로딩 중에는 스피너, 완료되면 테이블을 조건부 렌더링 */}
          {/* (개념) {조건 ? A : B}는 JSX 안에서 쓰는 삼항 연산자. 조건이 참이면 A, 거짓이면 B를 그린다. */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                {/* thead: 표의 머리글(컬럼 이름들). tbody: 실제 데이터 행들. */}
                <thead><tr><th>제목</th><th>유형</th><th>상태</th><th>LLM</th><th>등록일</th></tr></thead>
                <tbody>
                  {/* 프로젝트 배열을 순회하며 각 행을 렌더링. key는 고유 id 사용. */}
                  {/* (개념) map: 배열의 각 원소를 새로운 것(여기선 <tr> 행)으로 변환해 목록을 만든다. */}
                  {/* (왜 key가 필요한가) React가 어떤 행이 추가/삭제/변경됐는지 빠르게 구분하기 위해 */}
                  {/*   각 항목에 고유한 key를 요구한다. 보통 DB의 id처럼 절대 겹치지 않는 값을 쓴다. */}
                  {projects.map(p => (
                    <tr key={p.id}>
                      {/* 한 프로젝트(p)의 제목과 유형을 각각의 칸(td)에 출력 */}
                      <td>{p.title}</td><td>{p.category}</td>
                      {/* 상태: 영문 코드를 CSS 클래스로 쓰고, 한국어 라벨로 표시(없으면 원본 코드 fallback) */}
                      {/* (읽는 법) statusLabels[p.status] || p.status: 매핑에 한국어 라벨이 있으면 그걸,  */}
                      {/*   없으면(undefined → falsy) || 뒤의 원본 코드 p.status를 대신 보여 준다. */}
                      <td><span className={`project-status ${p.status}`}>{statusLabels[p.status] || p.status}</span></td>
                      {/* 사용 LLM: 배열일 때만 join, 아니면 빈 배열로 처리해 런타임 에러 방지 */}
                      {/* (왜) p.llm_used가 배열이 아니면 .join 호출에서 에러가 난다. Array.isArray로 먼저 확인해 */}
                      {/*   배열이 아닐 땐 빈 배열 []을 join하여 안전하게 빈 문자열을 출력한다. join(', ')은 원소를 ", "로 잇는다. */}
                      <td>{(Array.isArray(p.llm_used) ? p.llm_used : []).join(', ')}</td>
                      {/* 등록일: ISO 문자열을 Date로 변환 후 한국 로케일 날짜 형식으로 표시 */}
                      {/* (읽는 법) new Date(문자열)로 날짜 객체를 만들고, toLocaleDateString('ko-KR')로 */}
                      {/*   "2026. 6. 7." 같은 한국식 날짜 문자열로 바꿔 보여 준다. */}
                      <td>{new Date(p.created_at).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 이 파일의 "대표" 내보내기(default export). 다른 파일에서 import AdminProjects 로 가져다 쓴다.
export default AdminProjects;
