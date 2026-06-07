/**
 * AI 리부트 — 14개 팀 프로젝트 레지스트리 (투표 순위 = 팀 순서)
 * 각 팀의 실제 주제에 맞춰 /projects/app/:id 로 동작하는 앱을 스캐폴딩한다.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * [파일 역할]
 *   AI 리부트 부트캠프의 팀 프로젝트 메타데이터를 한곳에 모아 두는 정적 데이터 모듈.
 *   라우팅(/projects/app/:id), 목록 카드 렌더링, 색상/아이콘 테마 등에서 공통으로
 *   참조하는 "단일 진실 공급원(single source of truth)" 역할을 한다.
 *
 * [핵심 책임]
 *   - TeamProject 인터페이스로 각 팀 프로젝트의 데이터 형태(타입)를 정의.
 *   - TEAM_PROJECTS 배열로 실제 팀별 데이터를 보관(id, 제목, 소개, 아이콘, 색상, 팀원 등).
 *   - id 기반 단건 조회 헬퍼(getTeamProject)를 제공.
 *
 * [주요 export]
 *   - interface TeamProject : 팀 프로젝트 데이터 스키마.
 *   - const TEAM_PROJECTS   : 전체 팀 프로젝트 목록 배열.
 *   - const getTeamProject  : id로 단건 조회하는 헬퍼 함수.
 *
 * [주의] 부수효과(네트워크/상태 변경)가 없는 순수 데이터/조회 모듈이다.
 * ──────────────────────────────────────────────────────────────────────────
 */

// 팀 프로젝트 한 건의 데이터 형태를 정의하는 인터페이스.
// 목록/상세/라우팅 등 여러 화면에서 동일한 구조로 사용된다.
export interface TeamProject {
  id: number;          // 1~14 (투표 순위/팀 순서) — 라우팅 키이자 정렬 기준
  slug: string;        // URL/식별용 영문 슬러그(고유)
  title: string;       // 화면에 노출되는 프로젝트 제목
  tagline: string;     // 한 줄 소개
  icon: string;        // 카드/헤더에 표시할 이모지 아이콘
  color: string;       // 테마 색상(HEX) — 카드 강조색 등에 사용
  members: string[];   // 팀원(확정 기준)
  note?: string;       // 동일 주제 2팀 등 비고 (선택 항목)
}

// 전체 팀 프로젝트 목록.
// 배열 순서 자체가 투표 순위/팀 순서를 의미하므로, 표시 순서는 이 배열 순서를 따른다.
// 참고: id가 14를 넘는 항목(15~17)은 "학생 제안" 프로젝트로 note에 명시되어 있다.
export const TEAM_PROJECTS: TeamProject[] = [
  {
    id: 1, slug: 'ai-fairytale', title: '한국형 AI 동화책 제작 앱',
    tagline: '한국 정서를 담은 창작 동화와 삽화를 AI로 생성하는 앱',
    icon: '📖', color: '#e1567c', members: ['이소민', '신슬', '유용주', '구자성'],
  },
  {
    id: 2, slug: 'youth-policy-bot', title: '청년지원정책 안내 챗봇',
    tagline: '조건을 입력하면 맞춤 청년지원정책을 안내하는 챗봇',
    icon: '🏛️', color: '#0046C8', members: ['권규빈', '임종권', '이수현'],
  },
  {
    id: 3, slug: 'resilience-coach', title: '회복탄력성 루틴 코치',
    tagline: '멘탈 회복을 돕는 맞춤 루틴·습관 코칭 앱',
    icon: '🌱', color: '#10b981', members: ['김건희', '이초월', '김서우'],
  },
  {
    // id 3과 동일 주제(회복탄력성 루틴 코치)를 다루는 2번째 팀. note로 구분.
    id: 4, slug: 'resilience-coach-2', title: '회복탄력성 루틴 코치 (2팀)',
    tagline: '멘탈 회복을 돕는 맞춤 루틴·습관 코칭 앱',
    icon: '🧘', color: '#14b8a6', members: ['전유미', '오지원', '윤혜수'], note: '동일 주제 2팀',
  },
  {
    id: 5, slug: 'startup-coach', title: 'AI 창업 아이템 코치',
    tagline: '아이디어 탐색·사업계획서·정부지원사업 매칭·시장 검증까지 돕는 AI 창업 파트너',
    icon: '🚀', color: '#f59e0b', members: ['이시민', '조윤서'],
  },
  {
    // id 2와 동일 주제(청년지원정책 안내 챗봇)를 다루는 2번째 팀. note로 구분.
    id: 6, slug: 'youth-policy-bot-2', title: '청년지원정책 안내 챗봇 (2팀)',
    tagline: '조건을 입력하면 맞춤 청년지원정책을 안내하는 챗봇',
    icon: '🗂️', color: '#3b82f6', members: ['한승우', '박정우'], note: '동일 주제 2팀',
  },
  {
    id: 7, slug: 'heritage-guide', title: '문화재 AI 해설 앱',
    tagline: '사진·위치로 문화재를 인식해 AI가 해설해 주는 앱',
    icon: '🏯', color: '#b45309', members: ['박남영'],
  },
  {
    id: 8, slug: 'korean-history', title: '나이대별 한국사 학습·시험 앱',
    tagline: '연령대별 난이도로 한국사를 학습하고 시험까지 보는 앱',
    icon: '📜', color: '#9333ea', members: ['이유민'],
  },
  {
    id: 9, slug: 'cert-weakness', title: '자격증 취약점 분석 학습 앱',
    tagline: '학습 데이터로 자격증 취약 영역을 분석·보완해 주는 앱',
    icon: '🎯', color: '#dc2626', members: ['장호준'],
  },
  {
    id: 10, slug: 'resume-coach', title: 'AI 자기소개서·면접 코치',
    tagline: '자기소개서 첨삭과 모의면접을 돕는 AI 코치',
    icon: '💼', color: '#0ea5e9', members: ['최재영', '김권우'],
  },
  {
    id: 11, slug: 'study-planner', title: '밀려도 괜찮은, AI 생성 학습 플래너',
    tagline: '목표·과목에 맞춰 계획을 짜고, 밀리면 AI가 다시 계획을 짜 주는 앱',
    icon: '🗓️', color: '#6366f1', members: ['최윤정'],
  },
  {
    id: 12, slug: 'myopia-care', title: '내 아이 근시 관리용 플랫폼',
    tagline: '시력·근시도수·안축장을 기록하고 근시 변화 추이를 시각화하는 눈 건강 관리 플랫폼',
    icon: '👁️', color: '#0891b2', members: ['조하령'],
  },
  {
    id: 13, slug: 'jd-match', title: 'JD 기반 채용 진단 서비스',
    tagline: '역량과 목표 기업의 직무기술서(JD)를 대조해 합격 가능성을 예측·진단하는 서비스',
    icon: '🧭', color: '#7c3aed', members: ['정미경'],
  },
  {
    id: 14, slug: 'food-route', title: '외국인 관광객 맞춤 실시간 맛집 동선 가이드',
    tagline: '관광객의 위치와 취향을 바탕으로 최적의 맛집 동선을 실시간 안내하는 앱',
    icon: '🍜', color: '#ef4444', members: ['하소희'],
  },
  {
    // 이하 id 15~17은 정식 14개 팀 외 "학생 제안" 프로젝트(note에 명시).
    id: 15, slug: 'cat-life-diary', title: '육묘(猫)일기 — 고양이 생애주기 앱',
    tagline: '병원 방문·모래 교체·예방접종 주기 알람과 체중·건강 수치(BUN·CREA 등) 기록을 한곳에서',
    icon: '🐱', color: '#8B5CF6', members: ['이유민'], note: '학생 제안',
  },
  {
    id: 16, slug: 'warm-words-chat', title: '마음 한 스푼 — 위로·격려 챗 앱',
    tagline: '지친 마음에 따뜻한 말을 클릭 한 번으로 — 기분을 고르면 위로·격려를 건네는 챗 앱',
    icon: '🫂', color: '#FB7185', members: ['이초월'], note: '학생 제안',
  },
  {
    id: 17, slug: 'ai-literacy-gap', title: '청년 AI 리터러시 격차 진단·정책 수요 예측',
    tagline: '자가진단으로 AI 리터러시 격차를 측정하고 집단별 정책·교육 수요를 예측하는 모델',
    icon: '📊', color: '#2563EB', members: ['최윤경'], note: '학생 제안',
  },
];

/**
 * id로 팀 프로젝트 한 건을 조회하는 헬퍼.
 * @param id 조회할 팀 프로젝트의 고유 id (TeamProject.id)
 * @returns 일치하는 TeamProject 객체, 없으면 undefined
 * @remarks Array.find는 첫 번째 일치 항목을 반환하며, 부수효과 없는 순수 함수다.
 *          (id는 고유하다는 전제이므로 중복 시 배열 앞쪽 항목이 우선된다.)
 */
export const getTeamProject = (id: number): TeamProject | undefined =>
  TEAM_PROJECTS.find((p) => p.id === id);
