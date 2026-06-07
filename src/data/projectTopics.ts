/* =============================================================================
 * projectTopics.ts
 * -----------------------------------------------------------------------------
 * 역할:
 *   프로젝트 주제 투표 기능에서 사용하는 "운영자 제공 기본 주제(프리셋)" 정적
 *   데이터를 정의하는 모듈. 외부 API/DB 의존 없이 앱 번들에 포함되는 상수 데이터.
 *
 * 핵심 책임:
 *   - 투표 대상이 되는 7종 기본 프로젝트 주제 목록을 단일 소스로 제공.
 *   - 각 주제의 식별자(key)/제목(title)/설명(description) 스키마(PresetTopic) 정의.
 *   - 프리셋 여부를 빠르게 판별할 수 있도록 key 집합(PRESET_KEYS)을 파생 제공.
 *
 * 주요 export:
 *   - PresetTopic  : 기본 주제 한 건의 타입 정의(인터페이스).
 *   - PRESET_TOPICS: 기본 주제 7종 배열(투표 화면 렌더링·기본 데이터 소스).
 *   - PRESET_KEYS  : PRESET_TOPICS의 key만 모은 Set(프리셋 판별용, O(1) 조회).
 * ============================================================================= */

/** 운영자 제공 기본 프로젝트 주제 7종 (투표 대상) */
// PresetTopic: 투표 대상 기본 주제 한 건의 형태를 정의하는 타입.
//   - key        : 주제 고유 식별자(예: 'p1'). 투표 집계/프리셋 판별 키로 사용.
//   - title      : 화면에 노출되는 주제 제목.
//   - description: 주제에 대한 한 줄 설명.
export interface PresetTopic {
  key: string;
  title: string;
  description: string;
}

// PRESET_TOPICS: 운영자가 사전 정의한 기본 주제 목록(투표 옵션의 기본값).
//   - 정적 상수이므로 부수효과 없음. 컴포넌트에서 import 하여 그대로 렌더링.
//   - key는 'p1'~'p7'로 고정되어 있으며 변경 시 기존 투표 데이터와의 정합성 주의.
export const PRESET_TOPICS: PresetTopic[] = [
  { key: 'p1', title: '한국형 AI 동화책 제작 앱', description: '한국 정서를 담은 창작 동화와 삽화를 AI로 생성하는 앱' },
  { key: 'p2', title: '문화재 AI 해설 앱', description: '사진·위치로 문화재를 인식해 AI가 해설해 주는 앱' },
  { key: 'p3', title: '나이대별 한국사 학습·시험 앱', description: '연령대별 난이도로 한국사를 학습하고 시험까지 보는 앱' },
  { key: 'p4', title: '자격증 취약점 분석 학습 앱', description: '학습 데이터로 자격증 취약 영역을 분석·보완해 주는 앱' },
  { key: 'p5', title: '청년지원정책 안내 챗봇', description: '조건을 입력하면 맞춤 청년지원정책을 안내하는 챗봇' },
  { key: 'p6', title: 'AI 자기소개서·면접 코치', description: '자기소개서 첨삭과 모의면접을 돕는 AI 코치' },
  { key: 'p7', title: '회복탄력성 루틴 코치', description: '멘탈 회복을 돕는 맞춤 루틴·습관 코칭 앱' },
];

// PRESET_KEYS: PRESET_TOPICS에서 key만 추출해 만든 Set.
//   - 용도: 임의의 주제 key가 "운영자 기본 주제(프리셋)"인지 O(1)로 판별.
//     (예: 사용자가 추가한 커스텀 주제와 프리셋 주제를 구분할 때 사용)
//   - PRESET_TOPICS에서 파생되므로 위 배열을 수정하면 자동으로 동기화됨.
export const PRESET_KEYS = new Set(PRESET_TOPICS.map((t) => t.key));
