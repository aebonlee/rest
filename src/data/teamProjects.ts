/**
 * AI 리부트 — 14개 팀 프로젝트 레지스트리 (투표 순위 = 팀 순서)
 * 각 팀의 실제 주제에 맞춰 /projects/app/:id 로 동작하는 앱을 스캐폴딩한다.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * [이 파일을 처음 보는 사람을 위한 큰 그림]
 *   이 파일은 "데이터만 담아 두는 파일"입니다. 화면을 그리는 코드(컴포넌트)도,
 *   서버에 요청을 보내는 코드도 없습니다. 그냥 14개(+학생 제안 3개) 팀 프로젝트의
 *   정보(제목, 한 줄 소개, 아이콘, 색상, 팀원 등)를 목록으로 적어 둔 것뿐입니다.
 *
 *   여러 화면(목록 카드, 상세 페이지, 라우팅 등)이 "같은 데이터"를 봐야 하므로,
 *   데이터를 한곳에 모아 두고 모두가 여기서 가져다 씁니다. 이렇게 하면 데이터를
 *   고칠 때 이 파일 한 곳만 바꾸면 되므로 실수가 줄어듭니다. 이런 "데이터의 유일한
 *   원본"을 단일 진실 공급원(single source of truth)이라고 부릅니다.
 *
 * [초보자를 위한 용어 정리]
 *   - TypeScript(TS): JavaScript에 "타입(데이터의 모양)"을 더한 언어. 데이터가
 *     어떤 형태여야 하는지 미리 정해 두면, 잘못된 값을 넣었을 때 편집기/빌드 단계에서
 *     바로 오류로 잡아 줍니다. 파일 확장자가 .ts 인 이유입니다.
 *   - interface(인터페이스): "이 데이터는 이런 칸(필드)들을 가져야 한다"는 약속(틀).
 *     실제 값이 아니라 '모양의 설계도'입니다.
 *   - export: 다른 파일에서 이 변수/타입/함수를 가져다 쓸 수 있게 "공개"하는 키워드.
 *     반대로 export가 없으면 이 파일 안에서만 쓸 수 있습니다.
 *   - 슬러그(slug): 사람이 읽기 쉽고 URL에 넣기 좋은 영문 식별자(예: ai-fairytale).
 *
 * [파일 역할]
 *   AI 리부트 부트캠프의 팀 프로젝트 메타데이터를 한곳에 모아 두는 정적 데이터 모듈.
 *   라우팅(/projects/app/:id), 목록 카드 렌더링, 색상/아이콘 테마 등에서 공통으로
 *   참조하는 "단일 진실 공급원(single source of truth)" 역할을 한다.
 *   (정적 데이터 = 앱이 실행될 때 이미 코드 안에 박혀 있는, 변하지 않는 데이터)
 *
 * [핵심 책임]
 *   - TeamProject 인터페이스로 각 팀 프로젝트의 데이터 형태(타입)를 정의.
 *   - TEAM_PROJECTS 배열로 실제 팀별 데이터를 보관(id, 제목, 소개, 아이콘, 색상, 팀원 등).
 *   - id 기반 단건 조회 헬퍼(getTeamProject)를 제공.
 *
 * [주요 export]
 *   - interface TeamProject : 팀 프로젝트 데이터 스키마(데이터의 모양 = 설계도).
 *   - const TEAM_PROJECTS   : 전체 팀 프로젝트 목록 배열(실제 데이터).
 *   - const getTeamProject  : id로 단건 조회하는 헬퍼 함수.
 *
 * [주의] 부수효과(네트워크 요청/전역 상태 변경 등)가 없는 순수 데이터/조회 모듈이다.
 *        "부수효과(side effect)"란 함수가 값을 돌려주는 것 말고 바깥 세상에 끼치는
 *        영향(파일 쓰기, 서버 호출, 화면 변경 등)을 뜻합니다. 이 파일에는 그런 것이
 *        없으므로, 읽기만 해서는 데이터가 바뀌거나 외부에 무언가 일어날 일이 없습니다.
 * ──────────────────────────────────────────────────────────────────────────
 */

// 팀 프로젝트 한 건의 데이터 형태(= 설계도)를 정의하는 인터페이스.
// 목록/상세/라우팅 등 여러 화면에서 동일한 구조로 사용된다.
// 여기서 정한 "칸 이름과 타입"을 지키지 않으면 TypeScript가 오류로 알려 주므로,
// 오타나 빠진 필드를 미리 막아 줍니다.
//
// 읽는 법: `이름: 타입;` 형태입니다. 예) `id: number;` 는 "id 라는 칸은 숫자다"라는 뜻.
//   - number  : 숫자
//   - string  : 글자(문자열)
//   - string[]: 글자들의 배열(여러 개) — 대괄호 []가 "여러 개(배열)"를 의미.
//   - 이름 뒤의 `?` (예: note?): "있어도 되고 없어도 되는" 선택 항목(optional).
export interface TeamProject {
  id: number;          // 1~14 (투표 순위/팀 순서) — 라우팅 키이자 정렬 기준 (각 팀을 구분하는 고유 숫자)
  slug: string;        // URL/식별용 영문 슬러그(고유) — 사람이 읽기 쉬운 영문 식별자
  title: string;       // 화면에 노출되는 프로젝트 제목
  tagline: string;     // 한 줄 소개
  icon: string;        // 카드/헤더에 표시할 이모지 아이콘 (이모지도 글자라서 타입은 string)
  color: string;       // 테마 색상(HEX 코드, 예: '#e1567c') — 카드 강조색 등에 사용
  members: string[];   // 팀원(확정 기준) — 이름들을 담은 배열
  note?: string;       // 동일 주제 2팀 등 비고 (선택 항목: `?`가 붙어 없을 수도 있음)
}

// 전체 팀 프로젝트 목록(실제 데이터).
// 배열 순서 자체가 투표 순위/팀 순서를 의미하므로, 표시 순서는 이 배열 순서를 따른다.
// 참고: id가 14를 넘는 항목(15~17)은 "학생 제안" 프로젝트로 note에 명시되어 있다.
//
// 타입 표기 읽는 법: `: TeamProject[]` 는 "이 변수는 TeamProject들의 배열"이라는 뜻.
//   즉 아래 배열의 각 원소 { ... } 는 모두 위에서 정의한 TeamProject 모양을 지켜야 한다.
//   필수 칸을 빠뜨리거나 타입이 안 맞으면 빌드 단계에서 오류가 납니다(미리 실수 방지).
// 주의: 객체 사이를 구분하는 쉼표(,)와 각 칸 사이의 쉼표를 빠뜨리지 않도록 조심하세요.
//       초보자가 가장 흔히 겪는 오류가 쉼표 누락/중복입니다.
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
    icon: '🌱', color: '#10b981', members: ['이초월', '김서우'],
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
    // 6팀: '청년지원정책 안내 챗봇 (2팀)'에서 'AI 동화책 제작 앱 개발'로 주제 변경(구성원 유지).
    id: 6, slug: 'ai-picturebook', title: 'AI 동화책 제작 앱 개발',
    tagline: '한국형 창작 그림 동화책을 AI로 생성하는 웹/앱 개발',
    icon: '🎨', color: '#f472b6', members: ['박정우', '한승우', '이수현'],
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

// 제목 비교용 정규화: 소문자화 + 모든 공백 제거 + 트림.
// 표기 차이(대소문자/공백/가운뎃점 주변 띄어쓰기 등)를 무시하고 같은 주제로 인식하기 위함.
const normalizeTitle = (s: string): string => (s || '').toLowerCase().replace(/\s+/g, '').trim();

/**
 * 주제 제목으로 "고정 팀/프로젝트 번호(id)"를 찾는 헬퍼.
 *
 * TEAM_PROJECTS(id 1~14 정식 팀, 15~17 학생 제안)를 팀 번호의 단일 진실 공급원으로 사용한다.
 * 이 id는 곧 DB 팀 이름('N팀'), 패들렛 보드 번호(project01~17)와 1:1로 일치한다.
 * 따라서 투표 화면 등에서 "득표 순위(idx+1)"가 아니라 이 함수가 돌려주는 고정 번호를 써야
 * 팀 번호·패들렛 번호가 항상 일관되게 유지된다.
 *
 * @param title 주제 제목(프리셋/학생 제안 모두 가능)
 * @returns 일치하는 고정 팀 번호(id), 없으면 undefined
 * @remarks 제목을 normalizeTitle로 정규화해 비교하므로 공백/대소문자 차이를 무시한다.
 */
export const getTeamNoByTitle = (title: string): number | undefined =>
  TEAM_PROJECTS.find((p) => normalizeTitle(p.title) === normalizeTitle(title))?.id;

// 정식 팀 + 학생 제안 주제 중 가장 큰 번호(현재 17). 미등록 학생 주제에 이어서
// 번호를 부여할 때의 시작 기준점으로 사용한다(예: 18, 19 …).
export const MAX_TEAM_NO = Math.max(...TEAM_PROJECTS.map((p) => p.id));
