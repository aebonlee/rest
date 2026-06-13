/**
 * ProjectGuide.tsx
 *
 * [이 파일이 무엇인가? — 초보자용 큰 그림]
 *   이 파일은 "프로젝트 안내" 라는 한 페이지(화면)를 만드는 React 컴포넌트다.
 *   AI 리부트 경진대회용으로, 7가지 Solar LLM 활용 프로젝트의 상세 가이드를
 *   "왼쪽 사이드바(프로젝트 목록) + 오른쪽 본문(선택한 프로젝트의 상세)" 형태로 보여준다.
 *
 * [꼭 알아야 할 용어 — 쉬운 말로]
 *   - 컴포넌트(component): 화면의 한 조각을 만들어내는 "함수". JSX를 반환(return)하면
 *     React가 그걸 실제 화면(HTML)으로 그려준다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 코드를 쓸 수 있게 해주는 문법. 중괄호 { } 안에는
 *     자바스크립트 값을 끼워 넣을 수 있다. 예) <p>{이름}</p>
 *   - props(프롭스): 부모 컴포넌트가 자식 컴포넌트에 넘겨주는 "입력값"(함수의 매개변수와 비슷).
 *   - 라우트(route)/라우팅: 어떤 URL 주소일 때 어떤 페이지를 보여줄지 정하는 규칙. 이 페이지는
 *     보통 "/project-guide/3" 같은 주소에 연결된다(끝의 3이 프로젝트 id).
 *   - LLM / Solar API: LLM은 대화·요약 등을 해주는 거대 언어모델이고, "API"는 그 모델을
 *     프로그램에서 불러 쓰는 창구다. (이 파일은 안내문만 보여줄 뿐 실제 API 호출은 하지 않는다.)
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
 *     "정적 데이터"란 서버에서 받아오는 게 아니라 코드 안에 미리 박혀 있는 고정 데이터를 말한다.
 */
// [import 설명] import는 "다른 파일의 기능을 이 파일로 가져오기"다.
// - useState/useEffect: React의 "훅(hook)". 훅은 함수형 컴포넌트에 상태·생명주기 기능을
//   붙여주는 도구다(이름은 관례상 항상 'use'로 시작).
// - type ReactElement: "이 함수가 반환하는 값은 React 화면 요소"라고 타입(TS)으로 표시. 'type'이
//   붙으면 실행에는 영향 없고 타입 검사용으로만 쓰인다.
import { useState, useEffect, type ReactElement } from 'react';
import { EmojiIcon } from '../utils/emojiIcon';
// react-router-dom: 페이지 이동(라우팅) 라이브러리.
// - useParams: 현재 URL의 :id 같은 "동적 부분"을 꺼내는 훅.
// - useNavigate: 코드로 다른 주소로 이동하게 해주는 함수를 돌려주는 훅.
import { useParams, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
// PROJECT_DATA: 프로젝트들의 실제 데이터(배열). ProjectData: 그 한 항목의 "타입(모양)".
import { PROJECT_DATA, type ProjectData } from '../data/projectDetails';
import FlowDiagram from '../components/FlowDiagram';

/**
 * Section
 * 섹션 한 덩어리(제목 + 카드 본문)를 일관된 마크업으로 감싸는 프레젠테이션 컴포넌트.
 * "프레젠테이션 컴포넌트"란 받은 값을 보여주기만 할 뿐, 자기 상태나 로직이 없는 단순 컴포넌트.
 * @param icon - 제목 앞에 표시할 이모지/아이콘 문자열.
 * @param title - 섹션 제목 텍스트.
 * @param children - 카드 내부에 렌더링할 자식 노드.
 *   (children은 React가 정해 둔 특별한 prop. <Section>여기 내용</Section> 처럼 태그 사이에 넣은
 *    내용이 자동으로 children으로 전달된다.)
 * @returns 섹션 JSX.
 * 부수효과: 없음(순수 렌더링). "순수"란 입력이 같으면 결과도 같고 바깥 세상을 건드리지 않는다는 뜻.
 *
 * [문법 메모] 화살표 함수 본문을 중괄호 {} 없이 소괄호 ()로 감싸면 "그 안의 JSX를 곧바로 return"한다.
 */
const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  // className은 HTML의 class와 같다(JSX에서는 class가 예약어라 className으로 쓴다 — CSS 연결용).
  <section className="pgd-section">
    {/* 중괄호 {icon} / {title} 은 "여기에 변수 값을 출력하라"는 뜻 */}
    <h2><span className="pgd-section-icon"><EmojiIcon char={icon} /></span> {title}</h2>
    {/* {children}: 태그 사이에 넣은 내용을 이 위치에 그대로 끼워 넣는다 */}
    <div className="pgd-card">{children}</div>
  </section>
);

/**
 * ProjectDetail
 * 단일 프로젝트(project)의 모든 상세 섹션을 순서대로 렌더링한다.
 * @param project - 표시할 프로젝트 상세 데이터(ProjectData).
 * @returns 여러 Section으로 구성된 프래그먼트.
 * 부수효과: 없음. 데이터 형태는 PROJECT_DATA의 각 항목 스키마에 의존한다.
 *
 * [개념] 아래 return의 <> ... </> 는 "Fragment(프래그먼트)"다. 컴포넌트는 "하나의 부모"로 감싸
 *   반환해야 하는데, 불필요한 <div> 없이 묶고 싶을 때 화면에 아무 태그도 추가하지 않는 <>...</>를 쓴다.
 *
 * [반복 패턴 — 미리 이해하면 아래가 쉬워진다]
 *   배열.map((원소, i) => <li key={i}>{원소}</li>)
 *   → 배열의 각 원소를 화면 요소(<li> 등)로 한 개씩 바꿔 목록을 그린다.
 *   key: React가 목록의 각 항목을 구분하려고 요구하는 고유 식별자.
 *   주의: 여기는 데이터가 고정(정적)이라 순서가 안 바뀌므로 index(i)를 key로 써도 안전하다. 하지만
 *         항목을 추가/삭제/정렬하는 동적 목록에서는 index 대신 데이터 고유 id를 key로 쓰는 게 원칙이다.
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
      {/* project.architecture.description: 점(.)으로 객체 안의 값을 꺼낸다(중첩된 데이터 접근) */}
      <p>{project.architecture.description}</p>
      <div className="pgd-diagram">
        {/* FlowDiagram에 props 두 개 전달: 어떤 흐름도를 그릴지(projectId), 테마 색(color).
            이렇게 값을 넘기면 그 컴포넌트가 알아서 그림을 그려준다. */}
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
            {/* style={{ ... }}: JSX의 인라인 스타일은 "객체"로 준다(그래서 중괄호가 두 겹).
                바깥 {}는 "JS 값 시작", 안쪽 {}는 "스타일 객체"다.
                단계 번호 배지의 배경색을 프로젝트 테마 색(project.color)으로 직접 지정한다. */}
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
      {/* 프롬프트: LLM에게 주는 "지시문/질문". 어떻게 쓰느냐에 따라 답 품질이 달라진다. */}
      <p>{project.prompts.description}</p>
      {/* 프롬프트 예시별 카드: 제목/프롬프트 본문(pre로 원문 보존)/설명 노트 */}
      {project.prompts.examples.map((ex, i) => (
        <div key={i} className="pgd-prompt">
          <h4>{ex.title}</h4>
          {/* 주의: <pre> 태그는 공백과 줄바꿈을 "있는 그대로" 표시한다.
              프롬프트 원문의 들여쓰기/줄나눔이 중요하므로 일부러 pre를 쓴다. */}
          <div className="pgd-prompt-block"><pre>{ex.prompt}</pre></div>
          <p className="pgd-prompt-note"><EmojiIcon char="💡" /> {ex.note}</p>
        </div>
      ))}
    </Section>

    {/* 구현 가이드 */}
    <Section icon="💻" title="구현 가이드">
      <div className="pgd-impl-grid">
        {/* 프론트엔드 구현 정보: 설명/스택/주요 페이지 목록 */}
        <div className="pgd-impl-item">
          <h3><EmojiIcon char="🖥️" /> 프론트엔드</h3>
          <p>{project.implementation.frontend.description}</p>
          <span className="pgd-tech-badge">{project.implementation.frontend.stack}</span>
          <h4>주요 페이지</h4>
          <ul>{project.implementation.frontend.pages.map((pg, i) => <li key={i}>{pg}</li>)}</ul>
        </div>
        {/* 백엔드 구현 정보: 설명/스택/API 엔드포인트 목록 */}
        <div className="pgd-impl-item">
          <h3><EmojiIcon char="⚙️" /> 백엔드</h3>
          <p>{project.implementation.backend.description}</p>
          <span className="pgd-tech-badge">{project.implementation.backend.stack}</span>
          <h4>API 엔드포인트</h4>
          <ul>{project.implementation.backend.apis.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      </div>
      <div className="pgd-db">
        <h3><EmojiIcon char="🗄️" /> 데이터베이스</h3>
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
          <li key={i}><span style={{ color: project.color }}><EmojiIcon char="✓" /></span> {e}</li>
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
  // useParams로 현재 URL에서 :id 부분을 꺼낸다. 결과는 객체라 { id }로 꺼낸다(구조 분해 할당).
  // 주의: URL에서 온 값이라 항상 "문자열" 또는 (id가 없으면) undefined 다. 숫자가 아니다.
  const { id } = useParams<{ id: string }>();
  // useNavigate는 "이동시키는 함수"를 돌려준다. 나중에 navigate('/주소')처럼 호출해 페이지를 바꾼다.
  const navigate = useNavigate();
  // [useState 개념] useState(초기값)은 [현재값, 바꾸는함수]를 돌려준다. 여기선 selectedId(현재 선택된
  //   프로젝트 번호)와 setSelectedId(그 값을 바꾸는 함수)를 받는다. 상태가 바뀌면 React가 화면을
  //   자동으로 다시 그린다(re-render) — 이게 React의 핵심이다.
  // 초기값: URL에 id가 있으면 Number(id)로 숫자 변환, 없으면 기본값 1. (A ? B : C 는 삼항 연산자)
  const [selectedId, setSelectedId] = useState(id ? Number(id) : 1);

  // [useEffect 개념] useEffect(함수, [의존성배열])는 "어떤 값이 바뀔 때마다 부수효과를 실행"한다.
  //   부수효과 = 화면 그리기 외의 작업(상태 동기화 등).
  // 의존성 배열 [id]: id가 바뀔 때만 안의 함수가 다시 실행된다(예: 뒤로가기/주소 직접 입력으로 :id 변경).
  //   → 그때 내부 선택 상태(selectedId)를 URL의 id와 다시 맞춰준다.
  // 주의: id가 있을 때(if (id))만 동기화한다. id가 없을 때 동기화하면 값이 깨질 수 있다.
  useEffect(() => {
    if (id) setSelectedId(Number(id));
  }, [id]);

  // selectedId와 같은 id의 프로젝트를 배열에서 찾는다.
  // find: 조건(p => p.id === selectedId)에 맞는 "첫 항목"을 돌려준다. 없으면 undefined.
  // || PROJECT_DATA[0]: 못 찾으면(undefined) 안전하게 첫 번째 프로젝트로 대체(폴백)한다.
  //   주의: 이 폴백이 없으면 잘못된 id가 들어왔을 때 project가 undefined가 되어 화면이 깨질 수 있다.
  const project = PROJECT_DATA.find(p => p.id === selectedId) || PROJECT_DATA[0];

  /**
   * handleSelect
   * 사이드바에서 프로젝트를 선택했을 때 호출되는 핸들러.
   * @param projectId - 선택한 프로젝트의 id.
   * 부수효과: 선택 상태 갱신, URL 교체(replace로 히스토리 누적 방지), 페이지 상단으로 부드럽게 스크롤.
   */
  const handleSelect = (projectId: number) => {
    // 1) 내부 상태를 바꾼다 → 화면이 새 프로젝트로 다시 그려진다.
    setSelectedId(projectId);
    // 2) 주소창의 URL도 새 프로젝트에 맞게 바꾼다.
    // replace: true → 프로젝트 전환 시 히스토리 스택이 쌓이지 않도록 현재 항목을 교체
    //   (덕분에 프로젝트를 여러 번 바꿔도 "뒤로가기" 한 번에 이전 페이지로 나갈 수 있다)
    navigate(`/project-guide/${projectId}`, { replace: true });
    // 3) 새 내용을 처음부터 보도록 화면 맨 위로 부드럽게(smooth) 스크롤한다.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 아래 return이 실제로 화면에 그려질 내용(JSX)이다.
  return (
    <>
      {/* SEOHead: 검색엔진/브라우저 탭에 보일 제목·경로 같은 메타데이터를 설정하는 컴포넌트.
          선택된 프로젝트 제목/경로를 넘겨 페이지마다 적절한 정보가 표시되게 한다. */}
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
                // 현재 선택된 프로젝트면 'active' 클래스를, 아니면 빈 문자열을 끼워 클래스 문자열을 만든다.
                className={`sidebar-item ${p.id === selectedId ? 'active' : ''}`}
                // onClick: 이 버튼을 클릭하면 handleSelect(p.id) 실행.
                // 주의: onClick={handleSelect(p.id)} 로 쓰면 렌더링 즉시 실행돼 버린다(버그).
                //   () => handleSelect(p.id) 처럼 "클릭 시 실행될 함수"로 감싸야 한다.
                onClick={() => handleSelect(p.id)}
              >
                <span className="sidebar-item-text">{p.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="sidebar-content">
          {/* 히어로 카드: 페이지 상단의 대표 소개 카드. 좌측 테두리/아이콘 배경에 프로젝트 테마 색상 인라인 적용 */}
          <div className="pgd-hero-card" style={{ borderLeftColor: project.color }}>
            {/* 아이콘 배경은 테마 색 + '18'(hex 뒤의 '18'은 투명도/알파, 약 9%)로 연하게, 글자색은 원색.
                주의: 백틱 문자열 안에는 주석을 넣지 말 것(출력이 바뀜). */}
            <span className="pgd-hero-icon" style={{ background: `${project.color}18`, color: project.color }}><EmojiIcon char={project.icon} /></span>
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
