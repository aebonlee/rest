/* =============================================================================
 * boardOrder.ts
 * -----------------------------------------------------------------------------
 * 역할:
 *   프로젝트 주제 투표 보드(ProjectVote)에서 각 주제 카드에 매기는 "고정 팀 번호"의
 *   단일 진실 공급원(single source of truth). 번호 = 패들렛 보드 번호(project01~).
 *
 * 배경:
 *   - 기존에는 카드 번호를 득표 순위(idx+1)나 TEAM_PROJECTS.id로 계산해, 화면에서
 *     번호가 띄엄띄엄/뒤죽박죽으로 보였다.
 *   - 2026-06-08 운영자 확정: 프리셋 7개(1~7) + 학생 제안 14개(생성순 8~21)를
 *     1~21 연속 번호로 고정하고, 보드를 이 번호순으로 정렬한다. 패들렛도 이 번호와 일치.
 *
 * 사용:
 *   - getBoardNo(title): 주제 제목 → 고정 번호(1~21). 없으면 undefined(신규 주제).
 *   - BOARD_SIZE: 등록된 주제 수(현재 21). 신규(미등록) 주제는 22부터 이어 부여.
 *
 * 주의:
 *   - 제목 문자열은 DB(rest_project_topics)/프리셋(projectTopics.ts)의 제목과
 *     정확히 일치해야 매칭된다(공백/대소문자는 정규화하여 무시).
 *   - 주제가 추가/삭제/이름변경되면 이 목록을 갱신해야 번호가 맞는다.
 * ============================================================================= */

/**
 * 투표 보드 고정 번호 순서(1~21). 배열 인덱스 + 1 = 팀 번호 = 패들렛 project 번호.
 *  1~7  : 운영자 프리셋 주제
 *  8~21 : 학생 제안 주제(생성순)
 */
export const BOARD_ORDER: string[] = [
  // ── 프리셋 1~7 ──
  '한국형 AI 동화책 제작 앱',              // 1
  '✏️취업자격증도우미✏️',                  // 2 — 문화재 삭제 후 24번 취업자격증도우미를 이동(임윤서)
  '부모님의 복지 데이터를 실시간 분석하여 자녀에게 맞춤형 혜택과 리포트를 제공하는 자녀 전용 대리 케어 솔루션', // 3 — 한승우(신규 등록, 옛 한국사 자리)
  '자격증 취약점 분석 학습 앱',            // 4
  '청년지원정책 안내 챗봇',                // 5
  'AI 자기소개서·면접 코치',               // 6
  '회복탄력성 루틴 코치',                  // 7
  // ── 학생 제안 8~21 (생성순) ──
  '내 아이 근시 관리용 플랫폼',            // 8
  'AI 창업 아이템 코치',                   // 9
  'AI 동화책 제작 앱 개발',                // 10
  '회복탄력성 루틴 코치 (2팀)',            // 11
  'JD 기반 채용 진단 서비스',              // 12
  '외국인 관광객 맞춤형 실시간 맛집 동선 가이드 앱', // 13
  '육猫(묘)일기(고양이 생애주기 앱)',      // 14
  '청년 AI 리터러시 격차 진단 및 정책 수요 예측 모델', // 15
  '지친 마음에 따뜻한 말을 클릭 한번으로 - 위로·격려 챗 앱', // 16
  '💊영양제 알리미💊',                     // 17
  '사용자가 뉴스를 통해 원하는 분야(한국어 문해력, 영어, IT 등)의 핵심 용어와 어휘를 매일 꾸준히 학습하는 서비스.', // 18
  '매일 서로에게 힘이 되는 칭찬 커뮤니티',  // 19
  '팬의 응원을 작가의 창작 자원으로 전환하는 예술 현물 후원 어플', // 20
  '진료실 밖에서도 이어지는 정신과 케어 — AI 증상 기록·임상 리포트 플랫폼', // 21
  '경제를 하나도 모르는 사람이 경제적 자립을 향해 성장하는 여정을 AI가 코칭하는 서비스', // 22 — 박남영(신규 등록)
  '밀려도 괜찮은, AI 생성 학습 플래너', // 23 — 최윤정(보드 재편 때 누락 → 재등록, 옛 11팀)
];

/** 등록된 주제 수(현재 21). 미등록 신규 주제는 이 값 다음 번호부터 부여한다. */
export const BOARD_SIZE = BOARD_ORDER.length;

// 제목 비교용 정규화: 소문자화 + 모든 공백 제거. 표기상의 공백/대소문자 차이를 무시한다.
const normalizeTitle = (s: string): string => (s || '').toLowerCase().replace(/\s+/g, '').trim();

// 정규화된 제목 → 고정 번호(1~21) 빠른 조회 맵.
// 빈 슬롯(삭제된 번호)은 매핑에서 제외 — 빈 문자열이 실제 주제와 잘못 매칭되지 않게 한다.
const NO_BY_TITLE = new Map<string, number>(
  BOARD_ORDER.map((t, i) => [normalizeTitle(t), i + 1] as [string, number]).filter(([k]) => k !== ''),
);

/**
 * 주제 제목으로 고정 보드 번호(= 패들렛 번호)를 찾는다.
 * @param title 주제 제목
 * @returns 1~21 중 해당 번호, 등록되지 않은 주제면 undefined
 */
export const getBoardNo = (title: string): number | undefined => NO_BY_TITLE.get(normalizeTitle(title));

// 비어 있는(삭제된) 번호 슬롯 목록 — 새 주제를 먼저 배정할 자리. 오름차순(예: [3]).
export const EMPTY_SLOTS: number[] = BOARD_ORDER
  .map((t, i) => (normalizeTitle(t) === '' ? i + 1 : 0))
  .filter((n) => n > 0);

/**
 * boardOrder에 등록되지 않은 "새로 접수된 주제"들에 번호를 "제목 기준"으로 배정한다.
 *  - 먼저 빈 슬롯(EMPTY_SLOTS, 예: 3번)을 순서대로 채우고, 그 다음 BOARD_SIZE+1(22)부터 이어서 부여.
 *  - 키가 정규화된 제목이므로, 어느 화면에서 부르든(주제 목록/팀 목록) 같은 제목은 항상 같은 번호가 된다.
 *    → 팀구성·수행점검·게시판·산출물 제출 등 모든 뷰의 번호가 일치한다.
 * @param titlesInOrder 미등록 주제의 "안정적 순서" 제목 배열(예: rest_project_topics 생성순)
 * @returns 정규화제목 → 번호 맵
 */
export function extraNumbersByTitle(titlesInOrder: string[]): Map<string, number> {
  const map = new Map<string, number>();
  let nextNew = BOARD_SIZE; // 이후 ++nextNew → 22, 23 …
  let i = 0;                // 배정된 미등록 주제 수(빈 슬롯/신규 번호 인덱스)
  for (const raw of titlesInOrder) {
    const t = normalizeTitle(raw);
    if (t === '' || getBoardNo(raw) !== undefined || map.has(t)) continue; // 빈/이미 등록됨/중복 제외
    map.set(t, i < EMPTY_SLOTS.length ? EMPTY_SLOTS[i] : ++nextNew);
    i++;
  }
  return map;
}

/**
 * 주제 제목 → 최종 번호. 등록 주제는 고정 번호(getBoardNo), 미등록은 extra 맵에서 조회.
 * @param title 주제 제목
 * @param extra extraNumbersByTitle(...) 결과(미등록 주제 번호 맵)
 */
export function topicNumber(title: string, extra: Map<string, number>): number {
  return getBoardNo(title) ?? extra.get(normalizeTitle(title)) ?? (BOARD_SIZE + 1);
}
