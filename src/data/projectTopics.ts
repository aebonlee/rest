/** 운영자 제공 기본 프로젝트 주제 7종 (투표 대상) */
export interface PresetTopic {
  key: string;
  title: string;
  description: string;
}

export const PRESET_TOPICS: PresetTopic[] = [
  { key: 'p1', title: '한국형 AI 동화책 제작 앱', description: '한국 정서를 담은 창작 동화와 삽화를 AI로 생성하는 앱' },
  { key: 'p2', title: '문화재 AI 해설 앱', description: '사진·위치로 문화재를 인식해 AI가 해설해 주는 앱' },
  { key: 'p3', title: '나이대별 한국사 학습·시험 앱', description: '연령대별 난이도로 한국사를 학습하고 시험까지 보는 앱' },
  { key: 'p4', title: '자격증 취약점 분석 학습 앱', description: '학습 데이터로 자격증 취약 영역을 분석·보완해 주는 앱' },
  { key: 'p5', title: '청년지원정책 안내 챗봇', description: '조건을 입력하면 맞춤 청년지원정책을 안내하는 챗봇' },
  { key: 'p6', title: 'AI 자기소개서·면접 코치', description: '자기소개서 첨삭과 모의면접을 돕는 AI 코치' },
  { key: 'p7', title: '회복탄력성 루틴 코치', description: '멘탈 회복을 돕는 맞춤 루틴·습관 코칭 앱' },
];

export const PRESET_KEYS = new Set(PRESET_TOPICS.map((t) => t.key));
