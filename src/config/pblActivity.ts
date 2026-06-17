/**
 * PBL 활동 단계 정의 — 기본정보 + 컴퓨팅 사고 7단계 개발 워크시트(저장) + 루브릭(평가, 합계 100점).
 * 개발 프로젝트 흐름: 문제인식 → 문제정의 → 문제분해 → 추상화 → 알고리즘 설계 → 구현 → 결과 시연/발표.
 * (koreatech 프로젝트활동과 동일한 CT 7단계 / 루브릭 배점 15·10·10·20·20·15·10 = 100)
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
    key: 'recognition', label: '문제 인식', icon: '🔭', color: '#DC2626', max: 15,
    desc: '내 일상·학습·업무에서 불편하거나 번거로운 순간을 관찰해 “해결할 가치가 있는 문제”를 찾고 선정합니다.',
    rubric: '실제 상황의 불편함을 명확하고 구체적으로(누가·언제·어디서·무엇이) 설명했는가.',
    fields: [
      { id: 'observe', label: '관찰한 불편함 / 문제 후보', placeholder: '예) 최근 불편했던 순간을 “누가·언제·어디서·무엇이” 형태로 3가지 이상 적어보세요.' },
      { id: 'select', label: '선정한 문제 + 선정 이유', placeholder: '후보 중 이번에 다룰 문제 하나를 고르고, 자주 일어나는가·해결 가능한 크기인가 관점에서 이유를 적으세요.' },
    ],
  },
  {
    key: 'definition', label: '문제 정의', icon: '🎯', color: '#EA580C', max: 10,
    desc: '선정한 문제를 “무엇을 만들면 해결되는가” 관점에서 달성 가능한 목표로 구체화합니다.',
    rubric: '해결 목표가 구체적이며 달성 가능하게 정의되었는가.',
    fields: [
      { id: 'goal', label: '해결 목표 (무엇을 만들 것인가)', placeholder: '예) “지금 앉을 수 있는 도서관 빈자리를 한눈에 보여주는 웹앱을 만든다”처럼 한 문장으로.' },
      { id: 'users', label: '대상 사용자 / 사용 시나리오', placeholder: '누가 언제 이 결과물을 어떻게 쓰는지 한두 문장으로 적으세요.' },
    ],
  },
  {
    key: 'decomposition', label: '문제 분해', icon: '🧩', color: '#F59E0B', max: 10,
    desc: '큰 문제를 다루기 쉬운 하위 문제로 쪼개고, 입력 → 처리 → 출력으로 정리합니다.',
    rubric: '문제를 논리적으로 2개 이상 명확히 분해했는가.',
    fields: [
      { id: 'subproblems', label: '하위 문제로 분해 (2개 이상)', placeholder: '예) ① 좌석 상태를 어떻게 수집할까 ② 빈자리를 어떻게 보여줄까 ③ 갱신 주기는?' },
      { id: 'inout', label: '입력 → 처리 → 출력 정리', placeholder: '어떤 데이터를 입력받아 → 어떻게 처리해 → 무엇을 출력할지 한 줄로 정리하세요.' },
    ],
  },
  {
    key: 'abstraction', label: '추상화', icon: '🔍', color: '#059669', max: 20,
    desc: '불필요한 요소를 걷어내고, 문제 해결에 꼭 필요한 핵심 데이터와 규칙(패턴)만 남깁니다.',
    rubric: '불필요한 요소를 제거하고 핵심 데이터/패턴을 잘 도출했는가.',
    fields: [
      { id: 'core_data', label: '핵심 데이터 / 다룰 정보', placeholder: '예) 좌석ID, 사용여부(빈자리/사용중), 갱신시각 — 색·재질 등 무관한 정보는 제외.' },
      { id: 'pattern', label: '규칙 · 패턴 / 자료구조', placeholder: '데이터를 어떤 규칙·구조(리스트/표/딕셔너리 등)로 다룰지 적으세요.' },
    ],
  },
  {
    key: 'algorithm', label: '알고리즘 설계', icon: '🧮', color: '#2563EB', max: 20,
    desc: '문제를 푸는 처리 절차를 단계별로 설계하고, 흐름도나 의사코드(슈도코드)로 표현합니다.',
    rubric: '단계별 절차가 명확하며 흐름이 논리적인가.',
    fields: [
      { id: 'steps', label: '처리 절차 (단계별 알고리즘)', placeholder: '예) 1. 좌석 데이터를 불러온다 2. 빈자리만 필터링한다 3. 층별로 묶어 표시한다 …' },
      { id: 'flow', label: '흐름도 / 의사코드(슈도코드)', placeholder: '핵심 로직을 의사코드로 적거나 흐름도 링크를 넣으세요.' },
    ],
  },
  {
    key: 'implementation', label: '구현', icon: '⚙️', color: '#7C3AED', max: 15,
    desc: '설계한 알고리즘을 코드·프로토타입으로 구현합니다. AI 코딩 도구를 적극 활용합니다.',
    rubric: '결과물이 목표에 맞게 정상적으로 동작하는가.',
    fields: [
      { id: 'stack', label: '사용 기술 / 도구', placeholder: '예) Python, Flask, React, Supabase, ChatGPT·Claude 등 사용한 언어·프레임워크·AI 도구.' },
      { id: 'result', label: '구현 결과 / 동작 설명', placeholder: '무엇을 구현했고 실제로 어떻게 동작하는지 적으세요. 막힌 부분과 해결 방법도 좋습니다.' },
      { id: 'links', label: '코드 · 데모 · 배포 링크', placeholder: 'GitHub, 배포 URL, 노션 등 결과물을 확인할 수 있는 링크.' },
    ],
  },
  {
    key: 'presentation', label: '결과 시연/발표', icon: '🎤', color: '#0891B2', max: 10,
    desc: '결과물을 시연하고 문제→해결→효과를 조리있게 발표합니다. 회고로 마무리합니다.',
    rubric: '주요 핵심을 조리있게 발표하고 결과를 시연했는가.',
    fields: [
      { id: 'demo', label: '시연 시나리오 / 데모 링크', placeholder: '무엇을 어떤 순서로 보여줄지, 데모(영상·배포) 링크와 함께 적으세요.' },
      { id: 'pitch', label: '발표 핵심 메시지 / 발표자료 링크', placeholder: '문제→해결→효과를 3가지 핵심 메시지로 요약하고 발표자료 링크를 넣으세요.' },
      { id: 'retro', label: '회고 / 개선점', placeholder: '배운 점과 다음에 개선하고 싶은 점을 적으세요.' },
    ],
  },
];

export const PBL_TOTAL = PBL_STAGES.reduce((s, st) => s + st.max, 0); // 100

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
