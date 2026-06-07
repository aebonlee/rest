/**
 * ProjectDetail.tsx
 *
 * [이 파일은 무엇인가요? — 초보자용 설명]
 *   - "프로젝트 상세 페이지" 한 화면을 만드는 React 컴포넌트입니다.
 *   - 사용자가 프로젝트 목록에서 어떤 프로젝트 하나를 클릭하면, 그 프로젝트의 자세한
 *     정보(제목/설명/깃허브 주소/데모 주소 등)를 보여주는 페이지로 이동합니다.
 *   - 이 파일이 바로 그 "이동한 곳에서 보이는 화면"을 그리는 코드입니다.
 *
 * [꼭 알아야 할 배경 용어]
 *   - 컴포넌트(Component): 화면의 한 조각을 만드는 함수. 이 함수가 JSX(아래 설명)를 돌려주면 화면에 그려집니다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 문법을 쓰는 방식. <div>...</div> 같은 부분이 JSX입니다.
 *   - 라우트(Route)/URL 파라미터: 주소창의 일부를 변수처럼 받는 것.
 *       예) 주소가 "/projects/42" 라면 :id 자리에 "42"가 들어옵니다. 이 42가 "어떤 프로젝트인지"를 알려줍니다.
 *   - Supabase: 클라우드 데이터베이스(+인증) 서비스. 여기서 프로젝트 데이터를 읽어옵니다.
 *   - 비동기(async): 서버에서 데이터를 받아오는 건 시간이 걸리므로, 기다렸다가(await) 결과를 받습니다.
 *
 * [이 컴포넌트가 하는 일 — 순서대로]
 *   1) 주소창에서 프로젝트 id를 읽는다.
 *   2) 그 id로 Supabase의 projects 테이블에서 프로젝트 1개를 비동기로 조회한다.
 *   3) 조회 중에는 "로딩 스피너", 결과가 없으면 "찾을 수 없습니다", 있으면 상세 화면을 그린다.
 *   4) 깃허브/데모/발표자료/사용 LLM 같은 메타 정보는 값이 있을 때만 조건부로 보여준다.
 *
 * 주요 export:
 *   - default export: ProjectDetail (React 페이지 컴포넌트)
 */

// [import] 다른 파일/라이브러리에서 필요한 기능을 가져오는 부분입니다.
// useState  : 컴포넌트가 기억해야 할 "상태값"(예: 로딩 중인지)을 만드는 React 훅(Hook).
// useEffect : 컴포넌트가 화면에 나타나거나 특정 값이 바뀔 때 "부수 작업(데이터 조회 등)"을 실행하는 훅.
// type ReactElement : 컴포넌트가 반환하는 "화면 한 덩어리"의 타입(TypeScript용 타입 표기).
//   참고: 'type'을 붙인 import는 "이건 타입 정보일 뿐 실제 코드가 아니다"라고 알려주는 TypeScript 문법입니다.
import { useState, useEffect, type ReactElement } from 'react';
// useParams : 주소창의 :id 같은 파라미터를 꺼내는 react-router 훅.
// Link      : 페이지를 새로고침 없이 이동시키는 링크(<a> 대신 사용). SPA(단일 페이지 앱)에서 빠른 이동을 위해 씁니다.
import { useParams, Link } from 'react-router-dom';
// useAuth : 로그인/세션 정보를 담은 "인증 컨텍스트"를 구독하는 커스텀 훅.
import { useAuth } from '../contexts/AuthContext';
// SEOHead : 페이지 제목과 검색엔진 메타 정보(<head> 영역)를 설정하는 컴포넌트.
import SEOHead from '../components/SEOHead';
// getSupabase : Supabase 클라이언트(데이터베이스 접속 객체)를 가져오는 함수.
import getSupabase from '../utils/supabase';
// site : 사이트 전역 설정값(예: DB 테이블 접두사)을 담은 객체.
import site from '../config/site';
// type Project : 프로젝트 한 건의 데이터 모양(어떤 필드가 있는지)을 정의한 타입.
import type { Project } from '../types';

// 사이트별 DB 프리픽스(site.dbPrefix)를 붙여 실제 테이블명을 구성한다.
// 예: dbPrefix 가 'rest_' 이면 -> 'rest_projects'
// 왜 이렇게 하나요? 한 데이터베이스를 여러 사이트가 함께 쓸 때, 접두사로 테이블을 구분하기 위함입니다.
// (`${...}` 는 "템플릿 리터럴" 문법으로, 문자열 안에 변수 값을 끼워 넣는 방법입니다.)
const TABLES = { projects: `${site.dbPrefix}projects` };
// 프로젝트 status 코드값을 한국어 라벨로 매핑하는 룩업 테이블.
// 매핑되지 않은 값은 아래 렌더링에서 원본 status 문자열을 그대로 노출한다.
// Record<string, string> 는 "키도 문자열, 값도 문자열인 객체"라는 TypeScript 타입 표기입니다.
// 예) statusLabels['completed'] -> '완료'
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };

/**
 * ProjectDetail
 * - 프로젝트 상세 페이지를 렌더링하는 함수형 컴포넌트.
 * - 매개변수: 없음 (라우트 파라미터 :id 를 useParams 로 직접 읽음).
 * - 반환값: 로딩/미존재/정상 상태에 따른 ReactElement(화면 한 덩어리).
 * - 부수효과: 마운트(화면에 처음 나타남) 시 및 id 변경 시 Supabase에서 프로젝트를 비동기 조회(useEffect).
 *
 * 초보 팁: 컴포넌트 함수는 "상태가 바뀔 때마다 처음부터 다시 실행"됩니다.
 *   그래서 로딩→완료처럼 상태가 변하면 이 함수가 다시 돌면서 화면이 새로 그려집니다.
 */
const ProjectDetail = (): ReactElement => {
  // 인증 컨텍스트 구독(세션 유지/리렌더 트리거 목적). 반환값은 직접 사용하지 않는다.
  // 왜 호출만 하고 결과를 안 쓰나요? 인증 상태가 바뀌면 이 컴포넌트도 같이 갱신되도록 "구독"만 걸어두는 것입니다.
  useAuth();
  // URL 경로의 :id 파라미터 추출 (예: /projects/:id).
  // useParams<{ id: string }>() : id가 문자열이라는 타입을 알려주며 꺼냅니다.
  // 주의: 주소에 id가 없으면 id 는 undefined 일 수 있으므로 아래에서 항상 존재 여부를 확인합니다.
  const { id } = useParams<{ id: string }>();
  // 조회된 프로젝트 데이터를 담는 상태. 아직 없으면 null.
  // useState 는 [현재값, 값을바꾸는함수] 두 개를 배열로 돌려줍니다 -> 구조 분해로 받습니다.
  // setProject 를 호출해 값이 바뀌면 React가 화면을 다시 그립니다.
  const [project, setProject] = useState<Project | null>(null);
  // 데이터 로딩 상태 플래그. 초기값 true(로딩 중)로 시작.
  // 처음엔 데이터가 없으니 "로딩 중" 화면을 먼저 보여주고, 조회가 끝나면 false 로 바꿉니다.
  const [loading, setLoading] = useState(true);

  // id 가 결정/변경될 때마다 해당 프로젝트를 Supabase에서 단건 조회한다.
  // useEffect(콜백, [의존성배열]) : 의존성배열 안의 값이 바뀔 때만 콜백을 실행합니다.
  //   여기서는 [id] 이므로, 화면이 처음 나타날 때 한 번 + id 가 바뀔 때마다 다시 실행됩니다.
  useEffect(() => {
    // 비동기 로더: useEffect 콜백 자체는 async 가 될 수 없어 내부에 별도 async 함수를 정의 후 호출.
    // (useEffect는 "정리(cleanup) 함수"를 돌려받길 기대하는데, async 함수는 Promise를 돌려줘서 규칙에 안 맞기 때문입니다.)
    const load = async () => {
      // Supabase 접속 객체를 가져옵니다. 환경설정이 없으면 null 이 올 수 있습니다.
      const client = getSupabase();
      // Supabase 클라이언트가 없거나(환경 미설정) id 가 없으면 조회를 건너뛰고 로딩만 종료.
      // return 으로 함수를 즉시 끝내, 아래의 실제 조회 코드가 실행되지 않게 합니다(엣지케이스 방어).
      if (!client || !id) { setLoading(false); return; }
      // id 로 단일 레코드 조회. 한 줄을 단계별로 읽으면:
      //   .from(테이블)   : 어느 테이블에서
      //   .select('*')    : 모든 컬럼을
      //   .eq('id', id)   : id가 일치하는 행만
      //   .single()       : 정확히 1행을 기대(없거나 여러 행이면 data=null 이 됩니다)
      // await : 서버 응답이 올 때까지 기다렸다가 결과를 받습니다(그동안 화면은 멈추지 않습니다).
      // { data } : 응답 객체에서 data 필드만 구조 분해로 꺼냅니다.
      const { data } = await client.from(TABLES.projects).select('*').eq('id', id).single();
      // 데이터가 있을 때만 상태에 반영(타입 단언으로 Project 로 캐스팅).
      // 'as Project' 는 "이 데이터를 Project 타입으로 취급하라"고 TypeScript에 알려주는 표현입니다.
      if (data) setProject(data as Project);
      // 성공/실패와 무관하게 로딩 상태를 끝냅니다(스피너를 멈추고 결과 화면으로 전환).
      setLoading(false);
    };
    // 위에서 정의한 async 함수를 실제로 실행합니다.
    // 주의: id가 빠르게 연달아 바뀌면 이전 요청이 늦게 도착해 화면을 덮어쓰는 "경쟁(race)"이 이론상 가능합니다.
    //       이 페이지는 보통 id가 자주 바뀌지 않아 단순하게 처리했습니다.
    load();
  }, [id]); // <- 의존성 배열: id 가 바뀔 때마다 위 effect 를 다시 실행

  // 로딩 중에는 중앙 정렬된 스피너를 표시.
  // 주의: 이 early return(조건이 맞으면 즉시 화면을 돌려주고 함수 종료) 때문에 아래 본문 JSX는 실행되지 않습니다.
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="loading-spinner"></div></div>;
  // 로딩이 끝났는데 프로젝트가 없으면(미존재/조회 실패) 안내 메시지를 표시.
  // 이 지점에 도달하면 project 는 반드시 존재(아니면 위에서 return됨) -> 아래에서 project.xxx 를 안심하고 사용할 수 있습니다.
  if (!project) return <div style={{ textAlign: 'center', padding: '100px 0' }}>프로젝트를 찾을 수 없습니다.</div>;

  // 여기부터가 "정상 데이터가 있을 때" 보여줄 화면(JSX)입니다.
  // <>...</> 는 "Fragment"로, 의미 없는 div를 추가하지 않고 여러 요소를 하나로 묶는 빈 껍데기입니다.
  return (
    <>
      {/* SEO 메타 설정: 상세 페이지는 검색엔진 색인 제외(noindex) */}
      {/* path 에 `${id}` 를 끼워 넣어 현재 페이지 주소를 알려줍니다. noindex 는 noindex={true} 의 줄임 표현입니다. */}
      <SEOHead title={project.title} path={`/projects/${id}`} noindex />
      {/* 상단 페이지 헤더: 목록으로 돌아가기 링크 + 제목 + 상태 라벨 */}
      <section className="page-header">
        <div className="container">
          {/* 프로젝트 목록 페이지로 복귀하는 링크 (to="/projects" 로 이동) */}
          <Link to="/projects" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '16px' }}>← 프로젝트 목록</Link>
          {/* 중괄호 {} 안에는 자바스크립트 값을 넣습니다. 여기선 프로젝트 제목을 출력합니다. */}
          <h2>{project.title}</h2>
          {/* status 를 한국어 라벨로 변환. 매핑이 없으면(undefined) || 뒤의 원본 status 를 그대로 노출 */}
          {/* 'A || B' 는 A가 비어있을(falsy) 때 B를 쓰는 패턴입니다. */}
          <p>{statusLabels[project.status] || project.status}</p>
        </div>
      </section>

      {/* 본문 섹션: 프로젝트 설명 + 메타 정보 */}
      <section className="section">
        <div className="container">
          <div className="project-detail">
            {/* 왼쪽: 프로젝트 상세 설명 */}
            <div className="project-detail-body">
              <h3>프로젝트 설명</h3>
              <p>{project.description}</p>
            </div>
            {/* 오른쪽: 링크 등 메타 정보 영역 */}
            <div className="project-detail-meta">
              <h3>프로젝트 정보</h3>
              <div className="meta-list">
                {/* 각 URL 은 값이 있을 때만 조건부 렌더링. 외부 링크는 새 탭 + noopener/noreferrer 로 보안 처리 */}
                {/* 'project.repo_url && <p>...</p>' 패턴: repo_url 이 있으면 <p>를 그리고, 없으면(빈 값) 아무것도 안 그립니다. */}
                {/* target="_blank" : 새 탭에서 열기 / rel="noopener noreferrer" : 새 탭이 원래 페이지를 조작하지 못하게 막는 보안 설정. */}
                {project.repo_url && <p><strong>GitHub:</strong> <a href={project.repo_url} target="_blank" rel="noopener noreferrer">{project.repo_url}</a></p>}
                {project.demo_url && <p><strong>데모:</strong> <a href={project.demo_url} target="_blank" rel="noopener noreferrer">{project.demo_url}</a></p>}
                {project.presentation_url && <p><strong>발표자료:</strong> <a href={project.presentation_url} target="_blank" rel="noopener noreferrer">보기</a></p>}
                {/* 사용 LLM 목록 표시. 한 줄을 풀어보면: */}
                {/*   Array.isArray(...) ? ... : []  -> llm_used 가 진짜 배열이면 그대로, 아니면(없거나 잘못된 값) 빈 배열로 안전 처리 */}
                {/*   .join(', ')                    -> 배열 원소들을 ", " 로 이어 한 문자열로 만듦 (예: ['A','B'] -> "A, B") */}
                {/*   || '-'                         -> 결과가 빈 문자열이면(목록이 비었으면) '-' 를 대신 표시 */}
                <p><strong>사용 LLM:</strong> {(Array.isArray(project.llm_used) ? project.llm_used : []).join(', ') || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// 이 파일의 "대표(기본) 내보내기". 다른 파일에서 import ProjectDetail 로 가져다 라우터에 연결합니다.
export default ProjectDetail;
