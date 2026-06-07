/**
 * Projects.tsx
 *
 * 역할:
 *   - 프로젝트 목록 페이지 컴포넌트. Supabase에서 프로젝트 데이터를 불러와
 *     카드 그리드 형태로 보여준다.
 *
 * 핵심 책임:
 *   - 마운트 시 Supabase의 projects 테이블을 최신순(created_at desc)으로 조회.
 *   - 로딩 상태 / 데이터 존재 여부에 따라 스피너·카드·빈 메시지를 분기 렌더링.
 *   - 각 프로젝트 카드는 상세 페이지(/projects/:id)로 이동하는 링크.
 *   - status/category 코드값을 한국어 라벨로 매핑하여 표시.
 *
 * 주요 export:
 *   - default Projects: 프로젝트 목록 페이지 React 컴포넌트.
 */
import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Project } from '../types';

// 사이트별 DB 접두사(dbPrefix)를 붙여 실제 테이블명을 구성한다. (멀티 사이트 공유 DB 대응)
const TABLES = { projects: `${site.dbPrefix}projects` };

// 프로젝트 진행 상태 코드값 -> 화면 표시용 한국어 라벨 매핑.
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };
// 프로젝트 분류(category) 코드값 -> 화면 표시용 한국어 라벨 매핑.
const categoryLabels: Record<string, string> = { 'mini-personal': '개인 미니', 'mini-team': '팀 미니', real: '실전' };

/**
 * Projects 컴포넌트
 *   - 매개변수: 없음.
 *   - 반환값: 프로젝트 목록 페이지 JSX(ReactElement).
 *   - 부수효과: 마운트 시 Supabase 조회(비동기 데이터 fetch) 및 상태 갱신.
 */
const Projects = (): ReactElement => {
  // 인증 컨텍스트 구독(세션 유지/리렌더 트리거용). 반환값은 직접 사용하지 않는다.
  useAuth();
  const [projects, setProjects] = useState<Project[]>([]); // 조회된 프로젝트 목록.
  const [loading, setLoading] = useState(true); // 초기 데이터 로딩 여부.

  useEffect(() => {
    // 마운트 시 1회 실행되는 비동기 로더.
    const load = async () => {
      const client = getSupabase();
      // Supabase 클라이언트가 없으면(미설정 환경 등) 로딩만 종료하고 빈 목록 유지.
      if (!client) { setLoading(false); return; }
      // projects 테이블 전체 컬럼을 최신 생성순으로 조회.
      const { data } = await client.from(TABLES.projects).select('*').order('created_at', { ascending: false });
      if (data) setProjects(data as Project[]); // 결과가 있을 때만 상태 반영(타입 단언).
      setLoading(false); // 성공/데이터 없음 모두 로딩 종료 처리.
    };
    load();
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
