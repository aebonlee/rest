/**
 * ProjectDetail.tsx
 *
 * 역할:
 *   - 단일 프로젝트(팀 프로젝트/수강생 산출물 등)의 상세 정보를 보여주는 페이지 컴포넌트.
 *   - URL 파라미터(:id)로 전달된 프로젝트 ID를 받아 Supabase에서 해당 프로젝트를 조회해 렌더링한다.
 *
 * 핵심 책임:
 *   - 라우트 파라미터(id)로 Supabase의 projects 테이블에서 단일 레코드를 비동기 조회.
 *   - 로딩 중 / 데이터 없음 / 정상 등 각 상태에 맞는 화면을 렌더링.
 *   - 프로젝트 메타 정보(GitHub, 데모, 발표자료, 사용 LLM)를 조건부로 표시.
 *   - SEOHead로 페이지 제목과 메타(noindex) 설정.
 *
 * 주요 export:
 *   - default export: ProjectDetail (React 페이지 컴포넌트)
 */
import { useState, useEffect, type ReactElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Project } from '../types';

// 사이트별 DB 프리픽스(site.dbPrefix)를 붙여 실제 테이블명을 구성한다.
// 예: dbPrefix 가 'rest_' 이면 -> 'rest_projects'
const TABLES = { projects: `${site.dbPrefix}projects` };
// 프로젝트 status 코드값을 한국어 라벨로 매핑하는 룩업 테이블.
// 매핑되지 않은 값은 아래 렌더링에서 원본 status 문자열을 그대로 노출한다.
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };

/**
 * ProjectDetail
 * - 프로젝트 상세 페이지를 렌더링하는 함수형 컴포넌트.
 * - 매개변수: 없음 (라우트 파라미터 :id 를 useParams 로 직접 읽음).
 * - 반환값: 로딩/미존재/정상 상태에 따른 ReactElement.
 * - 부수효과: 마운트 시 및 id 변경 시 Supabase에서 프로젝트를 비동기 조회(useEffect).
 */
const ProjectDetail = (): ReactElement => {
  // 인증 컨텍스트 구독(세션 유지/리렌더 트리거 목적). 반환값은 직접 사용하지 않는다.
  useAuth();
  // URL 경로의 :id 파라미터 추출 (예: /projects/:id).
  const { id } = useParams<{ id: string }>();
  // 조회된 프로젝트 데이터. 아직 없으면 null.
  const [project, setProject] = useState<Project | null>(null);
  // 데이터 로딩 상태 플래그. 초기값 true(로딩 중)로 시작.
  const [loading, setLoading] = useState(true);

  // id 가 결정/변경될 때마다 해당 프로젝트를 Supabase에서 단건 조회한다.
  useEffect(() => {
    // 비동기 로더: useEffect 콜백은 async 가 될 수 없어 내부에 별도 async 함수를 정의 후 호출.
    const load = async () => {
      const client = getSupabase();
      // Supabase 클라이언트가 없거나(환경 미설정) id 가 없으면 조회를 건너뛰고 로딩만 종료.
      if (!client || !id) { setLoading(false); return; }
      // id 로 단일 레코드 조회. .single() 은 정확히 1행을 기대(없거나 여러 행이면 data=null).
      const { data } = await client.from(TABLES.projects).select('*').eq('id', id).single();
      // 데이터가 있을 때만 상태에 반영(타입 단언으로 Project 로 캐스팅).
      if (data) setProject(data as Project);
      setLoading(false);
    };
    load();
  }, [id]);

  // 로딩 중에는 중앙 정렬된 스피너를 표시.
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="loading-spinner"></div></div>;
  // 로딩이 끝났는데 프로젝트가 없으면(미존재/조회 실패) 안내 메시지를 표시.
  if (!project) return <div style={{ textAlign: 'center', padding: '100px 0' }}>프로젝트를 찾을 수 없습니다.</div>;

  return (
    <>
      {/* SEO 메타 설정: 상세 페이지는 검색엔진 색인 제외(noindex) */}
      <SEOHead title={project.title} path={`/projects/${id}`} noindex />
      {/* 상단 페이지 헤더: 목록으로 돌아가기 링크 + 제목 + 상태 라벨 */}
      <section className="page-header">
        <div className="container">
          {/* 프로젝트 목록 페이지로 복귀하는 링크 */}
          <Link to="/projects" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '16px' }}>← 프로젝트 목록</Link>
          <h2>{project.title}</h2>
          {/* status 를 한국어 라벨로 변환. 매핑이 없으면 원본 status 노출 */}
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
                {project.repo_url && <p><strong>GitHub:</strong> <a href={project.repo_url} target="_blank" rel="noopener noreferrer">{project.repo_url}</a></p>}
                {project.demo_url && <p><strong>데모:</strong> <a href={project.demo_url} target="_blank" rel="noopener noreferrer">{project.demo_url}</a></p>}
                {project.presentation_url && <p><strong>발표자료:</strong> <a href={project.presentation_url} target="_blank" rel="noopener noreferrer">보기</a></p>}
                {/* 사용 LLM 목록: 배열이 아닐 경우 빈 배열로 안전 처리 후 join. 비어 있으면 '-' 표시 */}
                <p><strong>사용 LLM:</strong> {(Array.isArray(project.llm_used) ? project.llm_used : []).join(', ') || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectDetail;
