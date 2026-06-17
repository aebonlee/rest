/**
 * PBL 활동 단계 정의 — 기본정보 + 6단계 워크시트(저장) + 루브릭(평가, 합계 100점).
 * 운영 흐름: 문제정의·아이디어 → 팀빌딩·구체화 → 심사·평가(중간) → 컨설팅·멘토링 → 구현 → 고도화·최종발표.
 */

export interface PblField {
  id: string;
  label: string;
  placeholder: string;
}

export interface PblStage {
  key: string;
  label: string;
  icon: string;
  color: string;
  /** 루브릭 배점 */
  max: number;
  desc: string;
  /** 평가 기준(루브릭) */
  rubric: string;
  fields: PblField[];
}

export const PBL_STAGES: PblStage[] = [
  {
    key: 'problem', label: '문제정의·아이디어 도출', icon: '🔍', color: '#10B981', max: 20,
    desc: 'ESG·환경 관점에서 지역문제를 선정하고, 생성형 AI로 문제를 구조화해 정의합니다.',
    rubric: '문제 상황이 구체적이고(누가·언제·무엇이), 데이터로 다룰 수 있게 타당하게 정의되었는가.',
    fields: [
      { id: 'topic', label: '선정 주제 (지역·문제)', placeholder: '예) 서울 — 폭염 사각지대 무더위쉼터 접근성 / 제주 — 해녀 어업영역 아카이브' },
      { id: 'situation', label: '문제 상황 기술 (누가·언제·어디서·무엇이)', placeholder: '문제를 다른 사람도 이해하도록 구체적으로 기술하고 한 문장으로 요약하세요.' },
      { id: 'idea', label: '핵심 아이디어 / 해결 방향', placeholder: '생성형 AI·데이터로 어떻게 해결할지 핵심 아이디어를 적으세요.' },
    ],
  },
  {
    key: 'teaming', label: '팀 빌딩·아이디어 구체화', icon: '🤝', color: '#22A06B', max: 10,
    desc: '기술·인문 트랙으로 역할을 나누고, 타깃 사용자와 가치를 구체화합니다.',
    rubric: '팀 역할(기술/인문)이 명확하고, 타깃 사용자·핵심 가치가 구체적인가.',
    fields: [
      { id: 'roles', label: '팀 구성 / 역할 분담 (기술 2 · 인문 2)', placeholder: '예) 기술: 데이터 분석/프로토타입 OO·OO / 인문: 사용자 분석/정책 OO·OO' },
      { id: 'users', label: '타깃 사용자 / 가치 제안', placeholder: '누구의 어떤 문제를, 어떤 가치로 해결하는지 한두 문장으로.' },
    ],
  },
  {
    key: 'midreview', label: '심사 및 평가 (중간 설계 발표)', icon: '📐', color: '#3B82F6', max: 15,
    desc: '중간 설계를 발표하고 문제정의·데이터 활용·해커톤 확장 가능성을 검토받습니다.',
    rubric: '문제정의의 명확성, 데이터 활용 가능성, 해커톤 확장 가능성이 검토되었는가.',
    fields: [
      { id: 'definition', label: '문제정의 명확성 (중간 점검)', placeholder: '중간 발표 기준으로 문제정의를 다시 정리하세요.' },
      { id: 'dataplan', label: '데이터 활용 계획', placeholder: '확보한/확보할 공공데이터와 분석 방향을 적으세요.' },
      { id: 'hackathon', label: '해커톤 확장 가능성', placeholder: '제주국제 생태포럼 해커톤 등으로 확장할 포인트.' },
    ],
  },
  {
    key: 'mentoring', label: '팀별 컨설팅·기술 멘토링', icon: '🧭', color: '#6B21A8', max: 10,
    desc: '트랙별 방법론·기술 멘토링을 받고 개선점을 반영합니다.',
    rubric: '멘토링 내용을 구체적으로 반영해 설계·구현 방향을 개선했는가.',
    fields: [
      { id: 'feedback', label: '받은 멘토링 / 피드백', placeholder: '강사·멘토에게 받은 핵심 피드백을 정리하세요.' },
      { id: 'applied', label: '반영한 개선점', placeholder: '피드백을 어떻게 반영해 무엇을 바꿨는지 적으세요.' },
    ],
  },
  {
    key: 'build', label: '기술 기반 아이디어 구현', icon: '⚙️', color: '#9333EA', max: 25,
    desc: '기술 트랙(분석·시각화·프로토타입)과 인문 트랙(서비스·정책·콘텐츠) 산출물을 구현합니다.',
    rubric: '결과물이 목표에 맞게 동작하고, 기술·인문 산출물이 통합되었는가.',
    fields: [
      { id: 'tech', label: '기술 트랙 산출물', placeholder: '데이터 분석·시각화·대시보드·지도·프로토타입 등 구현 내용.' },
      { id: 'human', label: '인문 트랙 산출물', placeholder: '사용자 여정·서비스 흐름·정책 제안·콘텐츠 기획 등.' },
      { id: 'links', label: '구현/프로토타입 링크', placeholder: '배포 URL, GitHub, 노션, 대시보드 링크 등.' },
    ],
  },
  {
    key: 'final', label: '결과물 고도화·최종 발표', icon: '🏆', color: '#0D2B5E', max: 20,
    desc: '결과보고서·3분 피치덱을 완성해 최종 발표하고 해커톤 제출형으로 정리합니다.',
    rubric: '핵심 메시지를 조리있게 발표하고 해커톤 제출형 결과물로 완성되었는가.',
    fields: [
      { id: 'report', label: '결과보고서 요약', placeholder: '문제→데이터→해결→효과를 요약하세요.' },
      { id: 'pitch', label: '3분 피치덱 / 발표자료 링크', placeholder: '발표자료 링크와 핵심 메시지 3가지.' },
      { id: 'demo', label: '데이터 시각화 / 데모 링크', placeholder: '핵심 시각화·데모 링크.' },
      { id: 'retro', label: '회고 / 향후 확장', placeholder: '배운 점과 비교과·해커톤 후속 확장 방향.' },
    ],
  },
];

export const PBL_TOTAL = PBL_STAGES.reduce((s, st) => s + st.max, 0); // 100

/** 트랙 구분 (기본정보 선택용) — snu PBL과 동일 */
export const TRACKS = ['기술', '인문'] as const;

export const stageByKey = (key: string): PblStage | undefined =>
  PBL_STAGES.find((s) => s.key === key);

/** 제출 행의 단계별(강사) 점수 합 */
export const totalScore = (scores: Record<string, number> | undefined): number =>
  PBL_STAGES.reduce((s, st) => s + (typeof scores?.[st.key] === 'number' ? scores![st.key] : 0), 0);

/** 자동 평가(0~100) → 단계 배점으로 환산한 한 단계 점수 */
export const autoStagePoints = (auto100: number, max: number): number =>
  Math.round((auto100 / 100) * max);

/** 자동 평가 기준 환산 총점 (각 단계 배점 합 = 100점 만점) */
export const autoTotal = (auto: Record<string, number> | undefined): number =>
  PBL_STAGES.reduce(
    (s, st) => s + (typeof auto?.[st.key] === 'number' ? autoStagePoints(auto![st.key], st.max) : 0),
    0,
  );
