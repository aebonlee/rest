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
 */
import { useState, useEffect, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Project } from '../../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 사용할 테이블명을 구성한다.
// 여러 프로젝트가 동일 Supabase 인스턴스를 공유할 때 테이블 충돌을 막기 위한 네이밍 규칙.
const TABLES = { projects: `${site.dbPrefix}projects` };
// 프로젝트의 영문 status 코드를 화면 표시용 한국어 라벨로 매핑하는 사전.
// 매핑에 없는 값이 들어오면 렌더 시 원본 코드를 그대로 표시한다(아래 fallback 참고).
const statusLabels: Record<string, string> = { planning: '기획 중', 'in-progress': '진행 중', testing: '테스트', completed: '완료' };

/**
 * AdminProjects
 *
 * 무엇을: 관리자용 프로젝트 목록 페이지를 렌더링하는 함수형 컴포넌트.
 * 매개변수: 없음.
 * 반환값: ReactElement (페이지 전체 마크업).
 * 부수효과: 마운트 시 useEffect를 통해 Supabase에서 프로젝트 데이터를 비동기로 가져온다.
 */
const AdminProjects = (): ReactElement => {
  // projects: 조회된 프로젝트 목록 상태(초기값은 빈 배열).
  const [projects, setProjects] = useState<Project[]>([]);
  // loading: 데이터 로딩 중 여부. 초기값 true로 시작해 로드 완료 시 false로 전환.
  const [loading, setLoading] = useState(true);

  // 컴포넌트 최초 마운트 시 1회만 실행되는 데이터 로딩 effect (의존성 배열이 빈 배열).
  useEffect(() => {
    // 비동기 로더: Supabase 클라이언트로 프로젝트를 최신순 조회한다.
    const load = async () => {
      const client = getSupabase();
      // 클라이언트가 없으면(환경변수 미설정 등) 로딩만 종료하고 조용히 빠져나간다 — 엣지케이스 방어.
      if (!client) { setLoading(false); return; }
      // created_at 내림차순(ascending: false)으로 정렬해 최신 프로젝트가 먼저 오도록 한다.
      // (RLS 정책이 적용된 경우, 권한이 없으면 data가 비어 올 수 있다.)
      const { data } = await client.from(TABLES.projects).select('*').order('created_at', { ascending: false });
      // 응답이 있을 때만 상태 갱신. Supabase는 unknown 형태로 주므로 Project[]로 단언.
      if (data) setProjects(data as Project[]);
      // 성공/실패 여부와 무관하게 로딩 종료 처리.
      setLoading(false);
    };
    // 선언한 비동기 함수 즉시 실행(useEffect 콜백은 async일 수 없으므로 내부에서 호출).
    load();
  }, []);

  return (
    <>
      {/* SEO 메타 설정. 관리자 페이지이므로 noindex로 검색엔진 색인 제외. */}
      <SEOHead title="프로젝트 관리" path="/admin/projects" noindex />
      <div className="admin-layout">
        {/* 좌측 관리자 네비게이션 사이드바 */}
        <AdminSidebar />
        <div className="admin-content">
          <h2>프로젝트 관리</h2>
          {/* 로딩 중에는 스피너, 완료되면 테이블을 조건부 렌더링 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>제목</th><th>유형</th><th>상태</th><th>LLM</th><th>등록일</th></tr></thead>
                <tbody>
                  {/* 프로젝트 배열을 순회하며 각 행을 렌더링. key는 고유 id 사용. */}
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td>{p.title}</td><td>{p.category}</td>
                      {/* 상태: 영문 코드를 CSS 클래스로 쓰고, 한국어 라벨로 표시(없으면 원본 코드 fallback) */}
                      <td><span className={`project-status ${p.status}`}>{statusLabels[p.status] || p.status}</span></td>
                      {/* 사용 LLM: 배열일 때만 join, 아니면 빈 배열로 처리해 런타임 에러 방지 */}
                      <td>{(Array.isArray(p.llm_used) ? p.llm_used : []).join(', ')}</td>
                      {/* 등록일: ISO 문자열을 Date로 변환 후 한국 로케일 날짜 형식으로 표시 */}
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

export default AdminProjects;
