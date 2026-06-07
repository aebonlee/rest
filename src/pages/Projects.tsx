/**
 * Projects.tsx
 *
 * [이 파일이 무엇인가요?]
 *   - "프로젝트 목록"을 보여주는 화면(페이지) 하나를 만드는 파일입니다.
 *   - 사용자가 /projects 주소로 들어오면 이 화면이 그려집니다.
 *   - 서버(데이터베이스)에 저장된 프로젝트들을 불러와서, 카드(상자) 형태로
 *     줄지어 보여줍니다.
 *
 * [초보자가 알아두면 좋은 배경/용어]
 *   - React: 화면을 "컴포넌트(component)"라는 작은 부품 단위로 만드는 도구입니다.
 *            이 파일의 Projects 가 바로 하나의 컴포넌트입니다.
 *   - 컴포넌트: 결국 "화면(JSX)을 돌려주는 함수"라고 생각하면 됩니다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 코드를 쓰는 문법입니다. (<div>...</div>)
 *   - 상태(state): 화면이 기억해야 하는 값. 값이 바뀌면 React가 화면을 다시 그립니다.
 *   - Supabase: 클라우드에 있는 데이터베이스(자료 저장소) 서비스입니다.
 *               여기서 프로젝트 자료를 읽어옵니다.
 *   - 비동기(async): 서버에서 자료를 받아오는 일은 시간이 걸리므로, "기다렸다가
 *                   끝나면 이어서 처리"하는 방식으로 동작합니다.
 *
 * 핵심 책임:
 *   - 마운트(화면이 처음 뜸) 시 Supabase의 projects 테이블을 최신순(created_at desc)으로 조회.
 *   - 로딩 상태 / 데이터 존재 여부에 따라 스피너·카드·빈 메시지를 분기 렌더링.
 *   - 각 프로젝트 카드는 상세 페이지(/projects/:id)로 이동하는 링크.
 *   - status/category 코드값을 한국어 라벨로 매핑하여 표시.
 *
 * 주요 export:
 *   - default Projects: 프로젝트 목록 페이지 React 컴포넌트.
 */
// import: 다른 파일/라이브러리에 있는 기능을 이 파일로 가져오는 문장입니다.
// useState, useEffect 는 React의 "훅(hook)" 입니다. 훅은 함수 컴포넌트에서
// 상태나 생명주기(화면이 뜰 때 등) 기능을 쓰게 해주는 특수 함수입니다.
// type ReactElement 는 "React가 그릴 수 있는 화면 요소"라는 타입(자료의 모양) 표시용입니다.
import { useState, useEffect, type ReactElement } from 'react';
// Link: 페이지 새로고침 없이 다른 화면으로 이동시키는 컴포넌트. (a 태그의 React 버전)
import { Link } from 'react-router-dom';
// useAuth: 로그인/세션 정보를 다루는 우리 프로젝트의 커스텀 훅.
import { useAuth } from '../contexts/AuthContext';
// SEOHead: 검색엔진/브라우저 탭 제목 등 <head> 메타 정보를 넣어주는 컴포넌트.
import SEOHead from '../components/SEOHead';
// getSupabase: Supabase에 접속하는 "클라이언트(연결 도구)"를 만들어 돌려주는 함수.
import getSupabase from '../utils/supabase';
// site: 현재 사이트 설정값(예: DB 테이블 접두사 등)이 들어있는 설정 객체.
import site from '../config/site';
// Project: 프로젝트 한 건의 데이터가 어떤 모양인지 정의한 TypeScript 타입.
// (type 키워드: 실제 코드가 아니라 "자료의 형태"만 가져오므로 빌드 결과에는 안 들어갑니다.)
import type { Project } from '../types';

// 여러 사이트가 하나의 DB를 공유하므로, 사이트마다 다른 접두사(dbPrefix)를 테이블명 앞에 붙입니다.
// 예) dbPrefix가 'rest_' 이면 실제 테이블명은 'rest_projects' 가 됩니다.
// 백틱(`...`)은 템플릿 리터럴: ${...} 안의 값을 문자열에 끼워 넣는 문법입니다.
const TABLES = { projects: `${site.dbPrefix}projects` };

// 프로젝트 진행 상태 코드값 -> 화면 표시용 한국어 라벨 매핑.
// Record<string, string> 은 "문자열 키에 문자열 값을 갖는 객체"라는 타입 표시입니다.
// 예) statusLabels['planning'] 을 찾으면 '기획 중' 이 나옵니다.
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };
// 프로젝트 분류(category) 코드값 -> 화면 표시용 한국어 라벨 매핑. (위와 같은 구조)
const categoryLabels: Record<string, string> = { 'mini-personal': '개인 미니', 'mini-team': '팀 미니', real: '실전' };

/**
 * Projects 컴포넌트
 *   - 무엇을 하나: 프로젝트 목록 화면을 만들어 돌려줍니다.
 *   - 왜 이렇게 하나: React에서 "화면 = 컴포넌트 함수가 돌려주는 JSX" 이기 때문입니다.
 *   - 매개변수: 없음.
 *   - 반환값: 프로젝트 목록 페이지 JSX(ReactElement 타입).
 *   - 부수효과(side effect): 화면이 처음 뜰 때 Supabase에서 데이터를 불러오고(비동기),
 *                          그 결과로 상태(state)를 바꿔 화면을 다시 그리게 합니다.
 */
const Projects = (): ReactElement => {
  // 인증 컨텍스트를 구독합니다. 로그인 상태가 바뀌면 이 컴포넌트도 다시 그려집니다.
  // 여기서는 반환값(로그인 정보)을 직접 쓰지 않고, "구독만" 하기 위해 호출합니다.
  useAuth();
  // useState: "상태(state)" 하나를 만드는 훅입니다.
  //  - 첫 번째(projects): 현재 값.
  //  - 두 번째(setProjects): 그 값을 바꾸는 함수. 이걸로 바꿔야 화면이 다시 그려집니다.
  //  - useState([]): 처음 값은 빈 배열(아직 불러온 프로젝트가 없음).
  // <Project[]> 는 "Project 객체들의 배열"이라는 타입 표시입니다.
  const [projects, setProjects] = useState<Project[]>([]); // 조회된 프로젝트 목록.
  // 데이터를 아직 불러오는 중인지 여부. 처음엔 true(로딩 중)로 시작합니다.
  const [loading, setLoading] = useState(true); // 초기 데이터 로딩 여부.

  // useEffect: "화면이 뜬 뒤"에 해야 할 일(부수효과)을 등록하는 훅입니다.
  // 데이터 불러오기 같은 외부 작업은 렌더링 도중이 아니라 여기서 해야 합니다.
  useEffect(() => {
    // load: 실제로 데이터를 불러오는 비동기 함수.
    // 주의: useEffect에 넘기는 함수 자체에는 async를 붙일 수 없어서,
    //       안쪽에 async 함수(load)를 따로 만들고 아래에서 호출하는 패턴을 씁니다.
    const load = async () => {
      // Supabase 접속 도구(클라이언트)를 가져옵니다.
      const client = getSupabase();
      // 설정이 안 된 환경 등에서 client가 없을 수 있습니다(null).
      // 그럴 땐 더 진행하지 않고 로딩만 끝낸 뒤 함수를 빠져나갑니다(빈 목록 유지).
      if (!client) { setLoading(false); return; }
      // await: 서버 응답이 올 때까지 기다립니다(시간이 걸리는 작업).
      //  - from(테이블): 어떤 테이블을 볼지 지정
      //  - select('*'): 모든 컬럼(열)을 가져오기
      //  - order('created_at', { ascending: false }): 생성일 기준 내림차순(=최신이 먼저)
      // 결과 객체에서 { data } 만 구조분해로 꺼내 씁니다.
      const { data } = await client.from(TABLES.projects).select('*').order('created_at', { ascending: false });
      // data가 있을 때만 상태에 반영합니다.
      // as Project[] 는 "이 데이터는 Project 배열이라고 믿어줘"라는 타입 단언입니다.
      if (data) setProjects(data as Project[]); // 결과가 있을 때만 상태 반영(타입 단언).
      // 성공이든, 데이터가 없든 어쨌든 로딩은 끝났으므로 false로 바꿉니다.
      setLoading(false); // 성공/데이터 없음 모두 로딩 종료 처리.
    };
    // 위에서 정의만 한 load 함수를 실제로 한 번 실행합니다.
    load();
    // 의존성 배열([]): 이 안의 값이 바뀔 때마다 effect를 다시 실행합니다.
    // 비워두면(=[]) "최초 마운트 시 딱 한 번만" 실행됩니다. (반복 조회 방지)
  }, []); // 빈 의존성 배열: 최초 마운트 시에만 실행.

  return (
    <>
      {/* 검색엔진 비노출(noindex) 처리된 SEO 메타 헤더 */}
      <SEOHead title="프로젝트" path="/projects" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트</h2>
          <p>진행 중인 프로젝트 현황입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 로딩 중이면 스피너, 데이터가 있으면 카드 그리드, 둘 다 아니면 빈 메시지 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : projects.length > 0 ? (
            <div className="projects-grid">
              {/* 프로젝트 배열을 순회하며 카드 링크 생성 (상세 페이지로 이동) */}
              {projects.map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
                  <div className="project-header">
                    {/* 상태/분류 라벨: 매핑에 없으면 원본 코드값 그대로 노출(폴백) */}
                    <span className={`project-status ${p.status}`}>{statusLabels[p.status] || p.status}</span>
                    <span className="project-category">{categoryLabels[p.category] || p.category}</span>
                  </div>
                  <h4>{p.title}</h4>
                  <p>{p.description}</p>
                  <div className="project-llm">
                    {/* llm_used가 배열이 아닐 수 있어 방어적으로 배열 확인 후 태그 렌더 */}
                    {(Array.isArray(p.llm_used) ? p.llm_used : []).map((llm, i) => (
                      <span key={i} className="llm-tag">{llm}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 프로젝트가 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Projects;
