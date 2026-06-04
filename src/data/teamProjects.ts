/**
 * AI 리부트 — 14개 팀 프로젝트 레지스트리 (투표 순위 = 팀 순서)
 * 각 팀의 실제 주제에 맞춰 /projects/app/:id 로 동작하는 앱을 스캐폴딩한다.
 */
export interface TeamProject {
  id: number;          // 1~14 (투표 순위/팀 순서)
  slug: string;
  title: string;
  tagline: string;     // 한 줄 소개
  icon: string;
  color: string;
  members: string[];   // 팀원(확정 기준)
  note?: string;       // 동일 주제 2팀 등 비고
}

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
];

export const getTeamProject = (id: number): TeamProject | undefined =>
  TEAM_PROJECTS.find((p) => p.id === id);
