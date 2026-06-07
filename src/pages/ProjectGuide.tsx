/**
 * ProjectGuide.tsx
 *
 * 역할:
 *   AI 리부트 경진대회용 "프로젝트 안내" 페이지. 7가지 Solar LLM 활용 프로젝트의
 *   상세 가이드를 좌측 사이드바(프로젝트 선택)와 우측 본문(선택된 프로젝트 상세)으로
 *   구성된 레이아웃으로 보여준다.
 *
 * 핵심 책임:
 *   - URL 파라미터(:id)로 들어온 프로젝트 ID를 읽어 해당 프로젝트를 선택/표시.
 *   - 사이드바에서 다른 프로젝트 선택 시 라우팅(replace)과 스크롤 이동 처리.
 *   - 선택된 프로젝트의 개요/아키텍처/파이프라인/Solar API/프롬프트/구현/배포/확장 섹션 렌더링.
 *   - SEOHead로 페이지 메타데이터 설정.
 *
 * 주요 export:
 *   - default: ProjectGuide (라우트에 연결되는 페이지 컴포넌트)
 *
 * 내부 보조 컴포넌트:
 *   - Section: 아이콘 + 제목 + 카드 본문을 묶는 재사용 섹션 래퍼.
 *   - ProjectDetail: 단일 프로젝트의 전체 상세 섹션들을 렌더링.
 *
 * 데이터 소스:
 *   - PROJECT_DATA (../data/projectDetails): 프로젝트 메타/상세 정적 데이터.
 */
import { useState, useEffect, type ReactElement } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { PROJECT_DATA, type ProjectData } from '../data/projectDetails';
import FlowDiagram from '../components/FlowDiagram';

/**
 * Section
 * 섹션 한 덩어리(제목 + 카드 본문)를 일관된 마크업으로 감싸는 프레젠테이션 컴포넌트.
 * @param icon - 제목 앞에 표시할 이모지/아이콘 문자열.
 * @param title - 섹션 제목 텍스트.
 * @param children - 카드 내부에 렌더링할 자식 노드.
 * @returns 섹션 JSX.
 * 부수효과: 없음(순수 렌더링).
 */
const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <section className="pgd-section">
    <h2><span className="pgd-section-icon">{icon}</span> {title}</h2>
    <div className="pgd-card">{children}</div>
  </section>
);

/**
 * ProjectDetail
 * 단일 프로젝트(project)의 모든 상세 섹션을 순서대로 렌더링한다.
 * @param project - 표시할 프로젝트 상세 데이터(ProjectData).
 * @returns 여러 Section으로 구성된 프래그먼트.
 * 부수효과: 없음. 데이터 형태는 PROJECT_DATA의 각 항목 스키마에 의존한다.
 */
const ProjectDetail = ({ project }: { project: ProjectData }): ReactElement => (
  <>
    {/* 프로젝트 개요 */}
    <Section icon="ℹ️" title="프로젝트 개요">
      <p className="pgd-overview">{project.overview}</p>
      <div className="pgd-meta-grid">
        <div>
          <h4>주요 대상</h4>
          {/* targetUsers 배열을 리스트로 펼침 (정적 데이터이므로 index를 key로 사용) */}
          <ul>{project.targetUsers.map((u, i) => <li key={i}>{u}</li>)}</ul>
        </div>
        <div>
          <h4>학습 목표</h4>
          {/* objectives(학습 목표) 배열을 리스트로 렌더링 */}
          <ul>{project.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
        </div>
      </div>
    </Section>

    {/* 시스템 아키텍처 */}
    <Section icon="🏗️" title="시스템 아키텍처">
      <p>{project.architecture.description}</p>
      <div className="pgd-diagram">
        {/* 프로젝트별 흐름도: id로 어떤 다이어그램을 그릴지, color로 테마 색 지정 */}
        <FlowDiagram projectId={project.id} color={project.color} />
      </div>
      <div className="pgd-components">
        {/* 아키텍처 구성요소(컴포넌트)별 카드: 이름/설명/기술 배지 */}
        {project.architecture.components.map((comp, i) => (
          <div key={i} className="pgd-component">
            <h4>{comp.name}</h4>
            <p>{comp.description}</p>
            <span className="pgd-tech-badge">{comp.tech}</span>
          </div>
        ))}
      </div>
    </Section>

    {/* 데이터 파이프라인 */}
    <Section icon="🔄" title="데이터 파이프라인">
      <div className="pgd-pipeline">
        {/* 단계(step)별 카드. key는 step.step(단계 번호)을 사용 */}
        {project.pipeline.steps.map(step => (
          <div key={step.step} className="pgd-pipeline-step">
            {/* 단계 번호 배지: 배경색은 프로젝트 테마 색상으로 인라인 지정 */}
            <div className="pgd-step-num" style={{ background: project.color }}>{step.step}</div>
            <div className="pgd-step-body">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
              <span className="pgd-tech-badge">{step.tools}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>

    {/* Solar API 활용 */}
    <Section icon="☀️" title="Solar API 활용">
      <p>{project.solarApi.description}</p>
      {/* 사용하는 Solar API 엔드포인트별 카드: 이름/목적/예시 코드 */}
      {project.solarApi.endpoints.map((ep, i) => (
        <div key={i} className="pgd-api-endpoint">
          <h4>{ep.name}</h4>
          <p>{ep.purpose}</p>
          {/* 예시 코드 블록 (정적 문자열, 실행되지 않음) */}
          <div className="pgd-code-block"><code>{ep.example}</code></div>
        </div>
      ))}
    </Section>

    {/* 프롬프트 엔지니어링 */}
    <Section icon="✨" title="프롬프트 엔지니어링">
      <p>{project.prompts.description}</p>
      {/* 프롬프트 예시별 카드: 제목/프롬프트 본문(pre로 원문 보존)/설명 노트 */}
      {project.prompts.examples.map((ex, i) => (
        <div key={i} className="pgd-prompt">
          <h4>{ex.title}</h4>
          {/* pre 태그로 프롬프트 원문의 공백/줄바꿈을 그대로 표시 */}
          <div className="pgd-prompt-block"><pre>{ex.prompt}</pre></div>
          <p className="pgd-prompt-note">💡 {ex.note}</p>
        </div>
      ))}
    </Section>

    {/* 구현 가이드 */}
    <Section icon="💻" title="구현 가이드">
      <div className="pgd-impl-grid">
        {/* 프론트엔드 구현 정보: 설명/스택/주요 페이지 목록 */}
        <div className="pgd-impl-item">
          <h3>🖥️ 프론트엔드</h3>
          <p>{project.implementation.frontend.description}</p>
          <span className="pgd-tech-badge">{project.implementation.frontend.stack}</span>
          <h4>주요 페이지</h4>
          <ul>{project.implementation.frontend.pages.map((pg, i) => <li key={i}>{pg}</li>)}</ul>
        </div>
        {/* 백엔드 구현 정보: 설명/스택/API 엔드포인트 목록 */}
        <div className="pgd-impl-item">
          <h3>⚙️ 백엔드</h3>
          <p>{project.implementation.backend.description}</p>
          <span className="pgd-tech-badge">{project.implementation.backend.stack}</span>
          <h4>API 엔드포인트</h4>
          <ul>{project.implementation.backend.apis.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      </div>
      <div className="pgd-db">
        <h3>🗄️ 데이터베이스</h3>
        <div className="pgd-db-tables">
          {/* DB 테이블별 카드: 테이블명과 필드 정의(code로 표시) */}
          {project.implementation.database.tables.map((t, i) => (
            <div key={i} className="pgd-db-table">
              <h4>{t.name}</h4>
              <code>{t.fields}</code>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* 배포 계획 */}
    <Section icon="🚀" title="배포 계획">
      <span className="pgd-tech-badge">{project.deployment.infra}</span>
      {/* 배포 단계는 순서가 의미 있으므로 ol(순서 목록)로 렌더링 */}
      <ol className="pgd-deploy-steps">
        {project.deployment.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </Section>

    {/* 확장 가능성 */}
    <Section icon="🌟" title="확장 가능성">
      <ul className="pgd-expansion">
        {/* 각 확장 아이디어 앞에 프로젝트 테마 색상의 체크 표시(✓) */}
        {project.expansion.map((e, i) => (
          <li key={i}><span style={{ color: project.color }}>✓</span> {e}</li>
        ))}
      </ul>
    </Section>
  </>
);

/**
 * ProjectGuide
 * 프로젝트 안내 페이지의 최상위 컴포넌트(라우트 진입점).
 * URL의 :id로 선택된 프로젝트를 결정하고, 사이드바/본문 레이아웃을 렌더링한다.
 * @returns 페이지 전체 JSX.
 * 부수효과:
 *   - useNavigate로 라우트 변경(replace), window.scrollTo로 스크롤 이동.
 *   - useEffect로 URL :id 변경 시 내부 선택 상태 동기화.
 */
const ProjectGuide = (): ReactElement => {
  // 라우트 파라미터에서 프로젝트 id(문자열)를 추출
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // 현재 선택된 프로젝트 id 상태. URL에 id가 있으면 숫자로 변환, 없으면 기본값 1.
  const [selectedId, setSelectedId] = useState(id ? Number(id) : 1);

  // URL의 :id가 바뀌면(뒤로가기/직접 이동 등) 내부 선택 상태를 동기화
  useEffect(() => {
    if (id) setSelectedId(Number(id));
  }, [id]);

  // selectedId에 해당하는 프로젝트를 조회. 없으면(잘못된 id 등) 첫 번째 프로젝트로 폴백.
  const project = PROJECT_DATA.find(p => p.id === selectedId) || PROJECT_DATA[0];

  /**
   * handleSelect
   * 사이드바에서 프로젝트를 선택했을 때 호출되는 핸들러.
   * @param projectId - 선택한 프로젝트의 id.
   * 부수효과: 선택 상태 갱신, URL 교체(replace로 히스토리 누적 방지), 페이지 상단으로 부드럽게 스크롤.
   */
  const handleSelect = (projectId: number) => {
    setSelectedId(projectId);
    // replace: true → 프로젝트 전환 시 히스토리 스택이 쌓이지 않도록 현재 항목을 교체
    navigate(`/project-guide/${projectId}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 선택된 프로젝트 제목/경로로 SEO 메타데이터 설정 */}
      <SEOHead title={project.title} path={`/project-guide/${selectedId}`} />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 안내</h2>
          <p>AI 리부트 경진대회를 위한 7가지 프로젝트 가이드입니다. Solar LLM을 활용한 실전 프로젝트를 확인하세요.</p>
        </div>
      </section>

      <div className="sidebar-layout">
        {/* 좌측 사이드바: 전체 프로젝트 목록을 버튼으로 나열 */}
        <aside className="sidebar">
          <nav className="sidebar-menu">
            {PROJECT_DATA.map(p => (
              <button
                key={p.id}
                // 현재 선택된 프로젝트면 'active' 클래스 부여
                className={`sidebar-item ${p.id === selectedId ? 'active' : ''}`}
                onClick={() => handleSelect(p.id)}
              >
                <span className="sidebar-item-text">{p.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="sidebar-content">
          {/* 히어로 카드: 좌측 테두리/아이콘 배경에 프로젝트 테마 색상 인라인 적용 */}
          <div className="pgd-hero-card" style={{ borderLeftColor: project.color }}>
            {/* 아이콘 배경은 테마 색 + '18'(약 9% 알파 hex)로 연하게, 글자색은 원색 */}
            <span className="pgd-hero-icon" style={{ background: `${project.color}18`, color: project.color }}>{project.icon}</span>
            <div>
              <h3 className="pgd-hero-title">{project.title}</h3>
              <p className="pgd-hero-subtitle">{project.subtitle}</p>
              <div className="pg-card-tags" style={{ marginTop: '8px' }}>
                {/* 엔드포인트 이름에서 ' (' 앞부분만 잘라 짧은 태그로 표시 (예: "Chat (대화) " → "Chat") */}
                {project.solarApi.endpoints.map((ep, i) => (
                  <span key={i} className="pg-tag">{ep.name.split(' (')[0]}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 선택된 프로젝트의 전체 상세 섹션 렌더링 */}
          <ProjectDetail project={project} />
        </div>
      </div>
    </>
  );
};

export default ProjectGuide;
