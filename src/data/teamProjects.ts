/**
 * AI 리부트 — 21개 팀 프로젝트 레지스트리 (보드 고정 번호 = 팀 순서)
 * 각 팀의 실제 주제에 맞춰 /projects/app/:id 로 동작하는 앱을 스캐폴딩한다.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * [이 파일을 처음 보는 사람을 위한 큰 그림]
 *   이 파일은 "데이터만 담아 두는 파일"입니다. 화면을 그리는 코드(컴포넌트)도,
 *   서버에 요청을 보내는 코드도 없습니다. 그냥 21개(프리셋 7 + 학생 제안 14) 팀 프로젝트의
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
  id: number;          // 1~21 (보드 고정 번호 = 패들렛/배포 project 번호) — 각 팀을 구분하는 고유 숫자
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
// 참고: id 8~21은 대체로 "학생 제안" 프로젝트로 note에 명시되어 있다(보드 생성순).
//
// 타입 표기 읽는 법: `: TeamProject[]` 는 "이 변수는 TeamProject들의 배열"이라는 뜻.
//   즉 아래 배열의 각 원소 { ... } 는 모두 위에서 정의한 TeamProject 모양을 지켜야 한다.
//   필수 칸을 빠뜨리거나 타입이 안 맞으면 빌드 단계에서 오류가 납니다(미리 실수 방지).
// 주의: 객체 사이를 구분하는 쉼표(,)와 각 칸 사이의 쉼표를 빠뜨리지 않도록 조심하세요.
//       초보자가 가장 흔히 겪는 오류가 쉼표 누락/중복입니다.
// 번호(id) = 투표 보드 고정 번호(boardOrder.ts) = 패들렛/배포 project 번호. 1~21 연속.
//   1~7  : 프리셋(운영자 기본 주제)
//   8~21 : 학생 제안 주제(생성순)
//   ※ 제목은 투표 보드(boardOrder)와 동일하게 맞춰 갤러리·보드·패들렛 번호가 일관되게 한다.
export const TEAM_PROJECTS: TeamProject[] = [
  {
    id: 1, slug: 'ai-fairytale', title: '한국형 AI 동화책 제작 앱',
    tagline: '아이에겐 몰입감을, 부모의 육아고민을 담은 ai 그림동화 생성 앱',
    icon: '📖', color: '#e1567c', members: ['이소민', '신슬', '유용주', '구자성'],
  },
  {
    // 2번: 문화재 삭제 후 24번 '취업자격증도우미'(임윤서)를 이 자리로 이동.
    id: 2, slug: 'cert-helper', title: '✏️취업자격증도우미✏️',
    tagline: '직무별 취업용 자격증 추천(금융권·마케팅)과 매일 퀴즈로 도움을 주는 앱',
    icon: '🎓', color: '#b45309', members: ['임윤서'], note: '학생 제안',
  },
  {
    // 3번: 옛 '나이대별 한국사' 삭제 자리에 신규 등록(한승우).
    id: 3, slug: 'parent-care', title: '부모님의 복지 데이터를 실시간 분석하여 자녀에게 맞춤형 혜택과 리포트를 제공하는 자녀 전용 대리 케어 솔루션',
    tagline: '부모님 복지 데이터를 분석해 자녀에게 맞춤 혜택·리포트를 제공하는 대리 케어 솔루션',
    icon: '🧓', color: '#0d9488', members: ['한승우'], note: '학생 제안',
  },
  {
    id: 4, slug: 'cert-weakness', title: '자격증 취약점 분석 학습 앱',
    tagline: '학습 데이터로 자격증 취약 영역을 분석·보완해 주는 앱',
    icon: '🎯', color: '#dc2626', members: ['장호준'],
  },
  {
    id: 5, slug: 'youth-policy-bot', title: '청년지원정책 안내 챗봇',
    tagline: '조건을 입력하면 맞춤 청년지원정책을 안내하는 챗봇',
    icon: '🏛️', color: '#0046C8', members: ['임종권', '최윤경', '박수아', '권규빈'],
  },
  {
    id: 6, slug: 'resume-coach', title: 'AI 자기소개서·면접 코치',
    tagline: '자기소개서 첨삭과 모의면접을 돕는 AI 코치',
    icon: '💼', color: '#0ea5e9', members: ['최재영', '김권우'],
  },
  {
    id: 7, slug: 'resilience-coach', title: "회복탄력성 루틴코치 - '오늘만큼'",
    tagline: '무기력한 날에도 부담없이, 오늘 할 수 있는 만큼만 시작하게 도와주는 웹/앱 하이브리드 서비스',
    icon: '🌱', color: '#10b981', members: ['김서우'],
  },
  {
    id: 8, slug: 'myopia-care', title: '내 아이 근시 관리용 플랫폼',
    tagline: '시력·근시도수·안축장을 기록하고 근시 변화 추이를 시각화하는 눈 건강 관리 플랫폼',
    icon: '👁️', color: '#0891b2', members: ['조하령'], note: '학생 제안',
  },
  {
    id: 9, slug: 'startup-coach', title: 'AI 창업 아이템 코치',
    tagline: '아이디어 탐색·사업계획서·정부지원사업 매칭·시장 검증까지 돕는 AI 창업 파트너',
    icon: '🚀', color: '#f59e0b', members: ['이시민', '조윤서'], note: '학생 제안',
  },
  {
    // 청년지원정책 안내 챗봇 (2팀)에서 주제 변경(구성원 유지).
    id: 10, slug: 'ai-picturebook', title: 'AI 동화책 제작 앱 개발',
    tagline: '한국형 창작 그림 동화책을 AI로 생성하는 웹/앱 개발',
    icon: '🎨', color: '#f472b6', members: ['박정우', '한승우', '이수현'], note: '학생 제안',
  },
  {
    id: 11, slug: 'resilience-coach-2', title: 'Lumiverse 목표 관리 코칭 앱',
    tagline: '장기목표를 AI와 함께 쪼개고, 행동을 쌓을수록 흐릿한 행성이 또렷해져 나만의 우주를 완성하는 목표 관리 코칭 앱',
    icon: '🧘', color: '#14b8a6', members: ['전유미', '오지원', '윤혜수'],
  },
  {
    id: 12, slug: 'jd-match', title: 'JD 기반 채용 진단 서비스',
    tagline: '역량과 목표 기업의 직무기술서(JD)를 대조해 합격 가능성을 예측·진단하는 서비스',
    icon: '🧭', color: '#7c3aed', members: ['정미경'], note: '학생 제안',
  },
  {
    id: 13, slug: 'food-route', title: '외국인 관광객 맞춤형 실시간 맛집 동선 가이드 앱',
    tagline: '관광객의 위치와 취향을 바탕으로 최적의 맛집 동선을 실시간 안내하는 앱',
    icon: '🍜', color: '#ef4444', members: ['하소희'], note: '학생 제안',
  },
  {
    id: 14, slug: 'cat-life-diary', title: '육猫(묘)일기(고양이 생애주기 앱)',
    tagline: '병원 방문·모래 교체·예방접종 주기 알람과 체중·건강 수치(BUN·CREA 등) 기록을 한곳에서',
    icon: '🐱', color: '#8B5CF6', members: ['이유민'], note: '학생 제안',
  },
  {
    id: 15, slug: 'ai-literacy-gap', title: '청년 AI 리터러시 격차 진단 및 정책 수요 예측 모델',
    tagline: '자가진단으로 AI 리터러시 격차를 측정하고 집단별 정책·교육 수요를 예측하는 모델',
    icon: '📊', color: '#2563EB', members: ['최윤경'], note: '학생 제안',
  },
  {
    id: 16, slug: 'warm-words-chat', title: '지친 마음에 따뜻한 말을 클릭 한번으로 - 위로·격려 챗 앱',
    tagline: '기분을 고르면 위로·격려의 글귀를 건네는, 다시 나아갈 힘을 주는 따뜻한 챗 앱',
    icon: '🫂', color: '#FB7185', members: ['이초월'], note: '학생 제안',
  },
  {
    // 17~21: 갤러리 신규 등록. 팀 결성/배포 전이라 members는 '모집 중'(빈 배열)로 둔다.
    id: 17, slug: 'supplement-reminder', title: '💊영양제 알리미💊',
    tagline: '영양제별 복용 주기·시간을 카카오톡으로 알려 주는 복용 알림 서비스',
    icon: '💊', color: '#22c55e', members: ['모집 중'], note: '학생 제안',
  },
  {
    id: 18, slug: 'news-vocab', title: '사용자가 뉴스를 통해 원하는 분야(한국어 문해력, 영어, IT 등)의 핵심 용어와 어휘를 매일 꾸준히 학습하는 서비스.',
    tagline: '관심 분야·난이도를 고르면 엄선된 뉴스로 핵심 용어·어휘를 익히고 나만의 용어사전을 만드는 서비스',
    icon: '📰', color: '#3b82f6', members: ['모집 중'], note: '학생 제안',
  },
  {
    id: 19, slug: 'praise-community', title: '매일 서로에게 힘이 되는 칭찬 커뮤니티',
    tagline: '스스로와 서로를 칭찬하고, 매일 AI가 맞춤 칭찬을 건네는 커뮤니티',
    icon: '👏', color: '#eab308', members: ['모집 중'], note: '학생 제안',
  },
  {
    id: 20, slug: 'art-patron', title: '팬의 응원을 작가의 창작 자원으로 전환하는 예술 현물 후원 어플',
    tagline: '팬이 작가에게 필요한 화구·재료를 직접 후원해 창작을 잇는 예술 현물 후원 앱',
    icon: '🖼️', color: '#a855f7', members: ['모집 중'], note: '학생 제안',
  },
  {
    id: 21, slug: 'mental-care', title: '진료실 밖에서도 이어지는 정신과 케어 — AI 증상 기록·임상 리포트 플랫폼',
    tagline: '정신과 외래 환자의 일상·증상을 AI가 임상 언어로 정리해 진료 공백을 잇는 플랫폼',
    icon: '🧠', color: '#6366f1', members: ['모집 중'], note: '학생 제안',
  },
  {
    id: 22, slug: 'finance-coach', title: '경제를 하나도 모르는 사람이 경제적 자립을 향해 성장하는 여정을 AI가 코칭하는 서비스',
    tagline: '경제를 모르는 사람도 경제적 자립으로 성장하도록 AI가 단계별로 코칭하는 서비스',
    icon: '💰', color: '#ca8a04', members: ['박남영'], note: '학생 제안',
  },
  {
    // 23번: 보드 재편 때 누락된 '밀려도 괜찮은, AI 생성 학습 플래너'(옛 11팀) 재등록.
    id: 23, slug: 'study-planner', title: '밀려도 괜찮은, AI 생성 학습 플래너',
    tagline: '목표·과목에 맞춰 계획을 짜고, 밀리면 AI가 다시 계획을 짜 주는 학습 플래너',
    icon: '🗓️', color: '#6366f1', members: ['최윤정'],
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
 * TEAM_PROJECTS(id 1~21, 보드 고정 번호)를 팀 번호의 단일 진실 공급원으로 사용한다.
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

/**
 * REPO_BY_BOARD: 보드 번호(현재 주제) → 콘텐츠가 일치하는 실제 배포 레포 번호.
 *
 * project01~17은 2026-06-05에 "옛 주제 순서"로 만들어졌고, 06-08 보드 재정렬로 번호↔주제가 어긋났다.
 * 그래서 갤러리는 보드 번호가 아니라 "레포의 실제 콘텐츠"에 맞춰 연결한다(내용 기반 매칭).
 * project18~23은 2026-06-09 신규 생성으로 번호=주제가 일치한다.
 *  - 2·3·17은 2026-06-09 신규 구현(project24·25·26). 10 동화책개발은 project01 공유, 23은 project23(옛 11도 동일).
 */
export const REPO_BY_BOARD: Record<number, number> = {
  1: 1,   // 한국형 동화책 → project01
  2: 24,  // 취업자격증도우미 → project24(신규)
  3: 25,  // 부모복지 → project25(신규)
  4: 9,   // 자격증 취약점 → project09
  5: 2,   // 청년정책 챗봇 → project02
  6: 10,  // 자소서·면접 코치 → project10
  7: 3,   // 회복탄력성 루틴 → project03
  8: 12,  // 근시 관리 → project12
  9: 5,   // AI 창업 코치 → project05
  10: 1,  // AI 동화책 개발 → project01(동화책 공유)
  11: 4,  // 회복탄력성 2팀 → project04
  12: 13, // JD 채용 진단 → project13
  13: 14, // 맛집 동선 → project14
  14: 15, // 육묘일기 → project15
  15: 17, // 청년 AI 리터러시 → project17
  16: 16, // 위로·격려(마음 한 스푼) → project16
  17: 26, // 영양제 알리미 → project26(신규)
  18: 18, 19: 19, 20: 20, 21: 21, 22: 22, 23: 23, // 신규(번호=주제 일치)
};

/**
 * IDLE_REPOS: 현재 보드 어느 팀과도 연결되지 않는 유휴 레포(과거 구현분).
 * 갤러리 하단에 "참고 보관" 섹션으로 별도 소개한다.
 */
export const IDLE_REPOS: { no: number; title: string; reason: string }[] = [
  { no: 6, title: '청년정책 자격 진단기 (2팀)', reason: '현재 보드에 동일 주제 없음' },
  { no: 7, title: '문화재 AI 해설 앱', reason: '보드에서 삭제됨' },
  { no: 8, title: '나이대별 한국사 학습·시험 앱', reason: '보드에서 삭제됨' },
  { no: 11, title: '밀려도 괜찮은 AI 학습 플래너', reason: 'project23과 동일 주제(중복)' },
];
