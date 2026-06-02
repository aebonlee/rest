/**
 * 학습 노트 데이터 — rest.dreamitbiz.com
 * 선수과정 4일(20H) + 정규과정 13일(52H) + 기술코칭 4회(8H)
 *
 * 각 Topic의 content[] 섹션 종류:
 *   subtitle  — 소제목 (h4)
 *   text      — 설명 단락
 *   items     — 불릿 리스트
 *   code      — 코드 블록 ({ lang, content })
 *   table     — 비교/요약 표 ({ headers, rows })
 *   callout   — 강조 박스 ({ type: 'tip'|'warn'|'info', text })
 */

export interface ContentSection {
  subtitle?: string;
  text?: string;
  items?: string[];
  code?: { lang?: string; content: string };
  table?: { headers: string[]; rows: string[][] };
  callout?: { type: 'tip' | 'warn' | 'info'; text: string };
  svg?: string;   // 인라인 SVG 다이어그램 (정적 콘텐츠)
}

export interface SubTopic {
  id: string;
  title: string;
  icon?: string;
  summary?: string;
  content: ContentSection[];
}

export interface Topic {
  id: string;
  title: string;
  icon: string;
  description: string;
  content: ContentSection[];
  subSections?: SubTopic[];   // 3차 메뉴 — 정규과정 일자별 상세 학습
}

/* ═════════════════════════════════════════════════════════
 *  선수과정 (4일, 20H) — 정규과정 진입을 위한 기초
 * ═════════════════════════════════════════════════════════ */
export const prerequisiteTopics: Topic[] = [
  {
    id: 'pre-1',
    title: 'Day 1 · AI 기초와 LLM 이해',
    icon: '🤖',
    description: 'AI/ML/DL/LLM의 차이부터 Transformer 아키텍처, 토큰화 메커니즘, 주요 LLM 비교까지 — 바이브코딩을 위한 개념적 토대를 다집니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'AI/ML/DL/LLM 위계와 역사 개요', '4개념 위계도 본인 노트에 정리'],
          ['S2', '50분', 'Transformer · Self-Attention · 토큰화', '한국어 토큰화 직접 실측'],
          ['S3', '50분', '주요 LLM 6종 비교 + 산업별 활용 사례', '본인 주력 모델 1개 선정'],
          ['S4', '50분', '한계(할루시네이션 외) + 3종 비교 실습', '동일 질문 모델별 비교표 작성'],
        ],
      } },
      { callout: { type: 'info', text: '각 세션 사이 5~10분 휴식 권장. 본 강의는 노트북 + 인터넷이 필수. 실습용 ChatGPT/Claude/Solar 계정을 강의 전에 미리 준비해 두세요.' } },

      { subtitle: '학습 목표', items: [
        'AI · ML · DL · LLM 개념 위계를 정확히 구분한다',
        'Transformer · 토큰화 · 컨텍스트 윈도우 등 핵심 용어를 이해한다',
        '주요 글로벌·국내 LLM의 강약점을 비교할 수 있다',
        '할루시네이션·지식 컷오프 등 LLM의 한계를 인지한다',
      ] },

      { subtitle: 'AI / ML / DL / LLM 위계' },
      { text: '네 개념은 서로 다른 추상화 수준의 부분집합 관계입니다. AI ⊃ ML ⊃ DL ⊃ LLM. 즉 LLM은 딥러닝의 한 응용이며, 딥러닝은 머신러닝의 한 분야, 머신러닝은 AI의 한 접근 방식입니다.' },
      { table: {
        headers: ['용어', '정의', '대표 예시'],
        rows: [
          ['AI', '인간의 지각·추론·학습 능력을 기계로 구현하려는 광의의 분야', '룰 기반 챗봇, 알파고'],
          ['ML', '데이터로부터 패턴을 학습하는 알고리즘 집합', '선형회귀, SVM, 랜덤포레스트'],
          ['DL', '인공 신경망을 깊게 쌓아 표현을 학습하는 ML의 하위 분야', 'CNN(이미지), RNN(시계열)'],
          ['LLM', '대규모 텍스트로 사전 학습된 거대 언어 모델', 'GPT-5, Claude, Solar, Gemini'],
        ],
      } },

      { subtitle: 'Transformer 아키텍처 핵심' },
      { text: '2017년 "Attention Is All You Need" 논문에서 제안된 구조. RNN 없이 Self-Attention만으로 토큰 간 관계를 모델링합니다. 병렬 처리가 가능해 대규모 학습이 가능해졌고, 현재의 LLM 폭발적 발전의 기술적 토대가 되었습니다.' },
      { items: [
        'Self-Attention — 각 토큰이 다른 모든 토큰과의 연관성을 가중치로 계산',
        'Positional Encoding — 토큰의 위치 정보 주입 (RNN이 없으므로 필요)',
        'Multi-Head — 여러 관점에서 동시에 Attention 계산',
        'Encoder/Decoder — 번역·요약은 둘 다, GPT 계열은 Decoder-only',
      ] },

      { subtitle: '토큰화(Tokenization)와 컨텍스트' },
      { text: 'LLM은 텍스트를 그대로 처리하지 않고 토큰(subword) 단위로 변환합니다. 영어는 보통 1단어 ≈ 1.3토큰, 한국어는 1글자가 2~3토큰으로 쪼개지는 경우가 많아 동일 문장이라도 한국어가 토큰을 더 많이 소비합니다 — 곧 비용·지연으로 직결됩니다.' },
      { callout: { type: 'info', text: '컨텍스트 윈도우 = 한 번에 처리 가능한 입력+출력 토큰 합. Claude Opus 4.7은 1M 토큰까지 지원하지만, 토큰이 많을수록 비용·지연이 비례 증가합니다.' } },

      { subtitle: '주요 LLM 비교 (2026 기준)' },
      { table: {
        headers: ['모델', '제공사', '강점', '컨텍스트', '활용 포지션'],
        rows: [
          ['GPT-5', 'OpenAI', '범용 성능, 도구 사용', '~200K', '범용 챗·코드'],
          ['Claude Opus 4.7', 'Anthropic', '추론·코딩·긴 문맥', '1M', '에이전트·코딩'],
          ['Gemini 2.5 Pro', 'Google', '멀티모달·검색 통합', '~1M', '검색·이미지'],
          ['Solar Pro', '업스테이지', '한국어 특화, 경량', '~32K', '경진대회·국산'],
          ['HyperCLOVA X', '네이버', '한국어·도메인 튜닝', '~32K', '국내 서비스'],
          ['EXAONE 3.5', 'LG AI', '기업 특화, 멀티링구얼', '~32K', 'B2B'],
        ],
      } },

      { subtitle: 'LLM의 4대 한계' },
      { items: [
        '할루시네이션(Hallucination) — 그럴듯하지만 사실과 다른 정보 생성',
        '지식 컷오프(Cut-off date) — 학습 데이터 시점 이후 정보 미반영',
        '결정성(Determinism) 부족 — 같은 입력에 다른 출력 가능 (temperature)',
        '편향(Bias) — 학습 데이터의 사회적 편향을 그대로 답습',
      ] },
      { callout: { type: 'warn', text: '코드·법률·의료 등 정확성이 중요한 영역에서는 반드시 출처 확인이 필요합니다. AI 응답을 "초안"으로 다루고 검증은 사람이 수행해야 합니다.' } },

      { subtitle: 'AI 60년 역사 — 주요 변곡점' },
      { table: {
        headers: ['시기', '사건', '의미'],
        rows: [
          ['1950', '튜링 테스트 제안', '"기계가 생각할 수 있는가" 철학 출발'],
          ['1956', '다트머스 회의', '"Artificial Intelligence" 용어 탄생'],
          ['1980s', '전문가 시스템 전성기', '규칙 기반 — 의료·금융 진단'],
          ['1997', '딥블루 vs 카스파로프', '체스에서 인간 챔피언 격파'],
          ['2012', 'AlexNet (ImageNet 우승)', '딥러닝 시대 개막'],
          ['2017', 'Transformer 논문', 'LLM의 기술적 토대'],
          ['2022', 'ChatGPT 공개', '일반인에게 LLM 보급 시작'],
          ['2024~', '에이전트·코딩·1M context', '바이브코딩 시대 본격화'],
        ],
      } },

      { subtitle: '산업별 LLM 활용 사례' },
      { table: {
        headers: ['산업', '활용 영역', '예시'],
        rows: [
          ['교육', '맞춤 학습·자동 채점', 'Khan Academy Khanmigo'],
          ['금융', '리포트 작성·고객 응대', 'BloombergGPT'],
          ['의료', '진료 요약·문헌 검색', 'Glass Health'],
          ['법률', '판례 분석·계약서 검토', 'Harvey AI'],
          ['소프트웨어', '코드 생성·리뷰·디버깅', 'Cursor, Claude Code'],
          ['고객지원', '챗봇·티켓 분류', 'Intercom Fin'],
        ],
      } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "LLM이 한국어를 영어보다 못하나요?" — 학습 데이터 비중 차이로 일반적으로 영어 성능이 더 높습니다. 다만 Solar/HyperCLOVA X 등 국산 모델은 한국어 비중을 높여 격차를 줄였습니다.',
        'Q. "AI가 거짓말을 하는데 왜 그대로 두나요?" — LLM은 사실 검증 능력 없이 통계적으로 가장 그럴듯한 다음 토큰을 예측합니다. 사실성 보장은 RAG·검색 도구와의 결합으로 보완합니다.',
        'Q. "온프레미스로 LLM을 돌릴 수 있나요?" — 가능합니다. KoAlpaca·Llama 등 오픈소스 모델을 GPU 서버에 올릴 수 있으나, 30B+ 모델은 고성능 GPU(A100/H100급)가 필요합니다.',
        'Q. "GPT vs Claude 무엇이 더 좋나요?" — 작업에 따라 다릅니다. 코드·긴 문맥은 Claude, 도구 사용·범용은 GPT가 강한 경향. 본인 작업으로 실측이 가장 정확.',
        'Q. "토큰을 줄여 비용을 절감하는 방법은?" — 시스템 프롬프트 축약, 대화 누적 시 요약 후 재시작, 한국어 비중 높은 모델 선택, 캐싱 활용.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. AI ⊃ ML ⊃ DL ⊃ LLM 위계를 한 줄로 설명하시오.',
        '2. Transformer의 핵심 메커니즘 1개를 답하시오. (정답: Self-Attention)',
        '3. 한국어 한 문장이 영어 동일 문장보다 토큰이 더 많이 소모되는 이유는?',
        '4. LLM의 "지식 컷오프"는 무엇을 의미하는가?',
        '5. 경진대회에서 국내 LLM을 사용해야 하는 이유 2개를 답하시오.',
      ] },
      { callout: { type: 'tip', text: '정답: 1) AI는 광의의 인공지능, ML은 데이터로 학습, DL은 신경망 기반 ML, LLM은 거대 언어 모델로 DL의 응용  2) Self-Attention  3) 한국어 학습 데이터 비중이 낮아 1글자가 2~3토큰으로 쪼개짐  4) 학습 데이터 수집 마감 시점, 이후 정보는 모름  5) ① 대회 평가 25% 가중치 ② 한국어 토큰 효율 ③ 데이터 주권' } },

      { subtitle: '참고 자료' },
      { items: [
        '논문: "Attention Is All You Need" (Vaswani et al., 2017) — Transformer 원전',
        '도서: 『AI 만들기』 박상길 — 한국어 AI 입문서',
        'YouTube: 3Blue1Brown "But what is a GPT?" — 시각적 설명 최고봉',
        '강의: Andrej Karpathy "Neural Networks: Zero to Hero" (무료 YouTube 시리즈)',
        '뉴스레터: AI Korea 슬랙 / 잡고AI / 데이터 엘리먼츠',
      ] },

      { subtitle: '실습 (60분)' },
      { items: [
        'ChatGPT / Claude / Solar에 동일 한국어 질문 입력 후 응답 비교표 작성',
        '간단한 한국 시사 질문으로 지식 컷오프 시점 추정해 보기',
        '동일 프롬프트를 temperature=0과 temperature=1로 각 3회씩 호출해 결정성 차이 관찰',
        '학습 노트에 "내가 사용할 주력 모델" 1개 선정 + 이유 기록',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 2에서는 오늘 사용한 프롬프트를 체계화합니다. R-C-I-F 4요소, Zero/Few-shot, Chain-of-Thought 등 실전 패턴을 학습해 "같은 모델로 더 좋은 결과"를 얻는 방법을 익힙니다.' },
    ],
  },

  {
    id: 'pre-2',
    title: 'Day 2 · 프롬프트 엔지니어링',
    icon: '✍️',
    description: '프롬프트의 4요소(R-C-I-F)를 기반으로 Zero/Few-shot, Chain-of-Thought 등 핵심 패턴을 실습하고, 한국어 작성 시 흔히 실패하는 안티패턴을 체계적으로 학습합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', '프롬프트 4요소(R-C-I-F) + 실전 템플릿', '본인 업무 프롬프트 1개 4요소로 재작성'],
          ['S2', '50분', '4대 패턴: Zero/Few-shot, CoT, Self-consistency', '각 패턴 1개씩 직접 실습'],
          ['S3', '50분', '한국어 작성 5원칙 + 안티패턴 5종', '실패 프롬프트 1개 → 개선 사이클 2회'],
          ['S4', '50분', '실전 — 본인 업무에 적용 + 평가', '평가표 작성 + 동료 리뷰'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        '프롬프트 4요소(R-C-I-F)를 명시적으로 작성한다',
        'Zero/Few-shot, Chain-of-Thought, Self-consistency를 구분해서 적용한다',
        '안티패턴(모호함·과적합·역할 충돌)을 인지하고 회피한다',
        '프롬프트 반복 개선(iteration loop) 사이클을 체득한다',
      ] },

      { subtitle: '프롬프트 4요소 (R-C-I-F)' },
      { table: {
        headers: ['요소', '의미', '예'],
        rows: [
          ['Role (역할)', '모델이 누구로서 답할지', '"너는 시니어 React 개발자다"'],
          ['Context (맥락)', '배경·제약·도메인', '"우리는 Vite 7 + TS 사용 중"'],
          ['Instruction (지시)', '구체적으로 무엇을 하라', '"이 함수를 useMemo로 최적화하라"'],
          ['Format (출력 형식)', '결과의 모양', '"diff 형태로, 변경 사유 한 줄씩 포함"'],
        ],
      } },

      { subtitle: '실전 프롬프트 템플릿' },
      { code: { lang: 'text', content: `[역할] 너는 React 19 + TypeScript 시니어 개발자다.
[맥락] 우리는 Vite 7 프로젝트에서 Supabase 클라이언트를 사용 중이다.
       다음 컴포넌트가 매 렌더마다 supabase.from(...)을 새로 호출해
       성능 문제가 의심된다.
[지시] 1) 원인을 한 줄로 진단하고
       2) useMemo/useEffect 중 적절한 Hook을 선택해 수정한 후
       3) 변경 전·후 코드를 diff 형태로 보여줘.
[출력] 진단(1줄) → 결정(1줄, Hook 이름과 이유) → diff(코드 블록)

[코드]
\`\`\`tsx
// (여기에 실제 컴포넌트 붙여넣기)
\`\`\`` } },

      { subtitle: '4대 프롬프트 패턴' },
      { table: {
        headers: ['패턴', '언제 쓰나', '예시'],
        rows: [
          ['Zero-shot', '명확한 작업, 예시 불필요', '"다음 문장을 영어로 번역하라"'],
          ['Few-shot', '형식·스타일을 따라야 할 때', '입력/출력 쌍 2~5개 제공 후 새 입력'],
          ['Chain-of-Thought', '복잡한 추론·다단계 계산', '"단계별로 사고 과정을 보여줘"'],
          ['Self-consistency', '답이 흔들리는 문제', '5회 호출 후 다수결 선택'],
        ],
      } },

      { subtitle: 'Few-shot 예시' },
      { code: { lang: 'text', content: `다음 문장을 격식체로 변환하라.

입력: 야 이거 좀 봐줘
출력: 이 부분을 확인해 주시기 바랍니다.

입력: 빨리 좀 보내줘
출력: 가능하시면 신속히 송부 부탁드립니다.

입력: 결과가 나오면 알려줘
출력:` } },

      { subtitle: '한국어 프롬프트 작성 5원칙' },
      { items: [
        '지시문은 명령형으로 — "~해주세요" 보다 "~하라"가 모델 행동이 더 명확',
        '단어 정의를 먼저 — "우리 회사에서 \'리뷰\'는 코드 리뷰만 의미한다"',
        '부정문보다 긍정문 — "X하지 마라"보다 "Y만 하라"가 효과적',
        '예시는 2~5개 — 너무 적으면 패턴 미인지, 너무 많으면 토큰 낭비',
        '한국어 출력을 강제할 때는 명시 — "반드시 한국어로만 답하라"',
      ] },

      { subtitle: '안티패턴 (자주 발생하는 실패)' },
      { table: {
        headers: ['안티패턴', '왜 실패하는가'],
        rows: [
          ['"좋은 코드 짜줘"', '"좋은"의 정의 부재 — 무엇이 좋은지 알 수 없음'],
          ['역할 충돌', '"의사이자 변호사로서…" — 모델이 어느 쪽도 깊이 답 못함'],
          ['예시 1개', 'Few-shot이라 부르기 부족, 패턴 일반화 실패'],
          ['거대 지시문', '한 번에 10개 요구 → 일부 누락, 품질 저하'],
          ['검증 없이 사용', 'AI 응답을 그대로 커밋 — 환각·버그 그대로 들어감'],
        ],
      } },
      { callout: { type: 'tip', text: '"개선 사이클": ① 결과 부족 발견 → ② 무엇이 부족한지 한 문장으로 명시 → ③ 프롬프트의 부족한 요소(R/C/I/F 중)를 보강 → ④ 재호출. 보통 2~3회 반복으로 원하는 품질에 도달합니다.' } },

      { subtitle: '고급 패턴 — 역할극(Role-Play) 프롬프트' },
      { code: { lang: 'text', content: `[역할] 너는 30년 경력의 시니어 한의사다. 환자의 증상을 듣고 한방·서양의학
       관점에서 균형 잡힌 조언을 한다. 의학적 단정은 피하고 "의심해 볼 수 있다"
       형태로 답하며, 필요 시 병원 방문을 권한다.

[환자 발화] 일주일째 잠이 잘 안 옵니다. 오후 4시 이후 커피는 피하고 있는데도
            새벽 3시까지 깨어 있습니다.

[형식] 1) 추정 원인 2~3가지
       2) 생활 개선 제안 (한방·서양 각 1개씩)
       3) 병원 방문 권고 여부 + 이유` } },

      { subtitle: '평가 매트릭스 — 프롬프트 결과 점수화' },
      { table: {
        headers: ['차원', '1점', '3점', '5점'],
        rows: [
          ['정확성', '사실 오류 다수', '대체로 정확', '완전 정확'],
          ['관련성', '주제 이탈', '관련 있음', '핵심 정조준'],
          ['완결성', '주요 누락', '대부분 포함', '완전 포함'],
          ['형식', '요청 무시', '대체로 준수', '완벽 준수'],
          ['톤·문체', '부적절', '적당', '의도와 정확히 일치'],
        ],
      } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "프롬프트가 너무 길어지는데?" — 길이보다 명확성이 중요. 다만 500토큰 이상은 모델이 일부 무시할 수 있으므로 우선순위 명시(MUST/SHOULD) 추천.',
        'Q. "한국어로 묻고 영어 답을 받는 경우?" — system에 "반드시 한국어로만 답하라"를 명시. 모델이 학습 시 영어 비중이 높아 자연스럽게 영어로 전환되는 경향.',
        'Q. "같은 프롬프트인데 답이 매번 다른 이유?" — 기본 temperature가 0.7~1.0이라 확률적. 결정적 답이 필요하면 temperature=0 사용.',
        'Q. "Chain-of-Thought를 항상 써야 하나요?" — 단순 작업(번역·요약)에는 불필요하고 오히려 토큰 낭비. 복잡한 추론·계산·다단계 의사결정에서만 사용.',
        'Q. "프롬프트 인젝션이 무엇인가요?" — 사용자 입력에 "이전 지시 무시하고 ~하라" 삽입해 시스템 프롬프트를 우회하는 공격. 사용자 입력은 항상 다른 메시지로 분리하고 검증.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. R-C-I-F 4요소를 각각 한 단어로 풀어 쓰시오.',
        '2. Few-shot에서 예시를 몇 개 제공하는 것이 일반적인가?',
        '3. Chain-of-Thought를 쓰면 좋은 작업 1가지, 안 좋은 작업 1가지를 답하시오.',
        '4. "좋은 코드 짜줘"가 안티패턴인 이유는?',
        '5. 한국어 응답을 강제할 때 system 프롬프트에 어떤 표현이 효과적인가?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) Role(역할) / Context(맥락) / Instruction(지시) / Format(형식)  2) 2~5개  3) 좋음: 복잡한 추론·다단계 계산, 나쁨: 단순 번역·요약  4) "좋은"의 정의 부재로 모델이 무엇을 우선할지 모름  5) "반드시 한국어로만 답하라. 영어 단어를 사용하지 말 것." 같은 명시적 제약' } },

      { subtitle: '참고 자료' },
      { items: [
        '공식: OpenAI Prompt Engineering Guide (platform.openai.com/docs/guides/prompt-engineering)',
        '공식: Anthropic Prompt Library (docs.anthropic.com/en/prompt-library)',
        '논문: "Chain-of-Thought Prompting" (Wei et al., 2022)',
        '도서: 『프롬프트 엔지니어링』 박해선',
        '실전: LearnPrompting.org (무료 한국어 일부 지원)',
      ] },

      { subtitle: '실습 (60분)' },
      { items: [
        '내 업무 이메일 1편 작성 프롬프트를 R-C-I-F 4요소로 명시',
        '동일 작업을 Zero/Few-shot 두 방식으로 실행 후 차이 비교',
        '복잡한 계산 문제에 Chain-of-Thought 적용 → 정답률 변화 관찰',
        '실패한 프롬프트 1개를 골라 개선 사이클 2회 반복 + 기록',
        '동료의 프롬프트를 평가 매트릭스 5차원으로 점수화 + 피드백',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 3에서는 오늘 익힌 프롬프트 기법을 국내 LLM에 적용합니다. Solar API 키 발급부터 실제 호출까지 직접 수행하며, 경진대회에 사용할 모델을 선정합니다.' },
    ],
  },

  {
    id: 'pre-3',
    title: 'Day 3 · 국내 LLM 탐색',
    icon: '🇰🇷',
    description: 'AI 리부트 경진대회 필수 요건인 국내 LLM(Solar/HyperCLOVA X/EXAONE)의 API 호출법과 한국어 처리 성능을 실측 비교하며 경진대회에 적합한 모델을 선정합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', '국내 LLM 4종 비교 + 왜 국산을 쓰는가', '비교표 본인 노트 작성'],
          ['S2', '50분', 'Solar API 키 발급 + curl/TypeScript 첫 호출', 'curl 호출 성공'],
          ['S3', '50분', '한국어 토큰 효율 실측 + 모델별 응답 비교', '3개 질문 × 3개 모델 = 9개 응답 분석'],
          ['S4', '50분', '폴백·캐싱 전략 + 경진대회 모델 선정', '주력/2순위 모델 결정'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        '국내 LLM 4종(Solar, HyperCLOVA X, EXAONE, KoAlpaca)의 특징을 비교한다',
        'Solar API 키 발급부터 첫 호출까지 직접 수행한다',
        '동일 한국어 작업에 대한 모델 간 응답 품질·비용을 실측한다',
        '경진대회 출품작에 적합한 국내 LLM을 선택할 수 있다',
      ] },

      { subtitle: '왜 국내 LLM을 써야 하는가' },
      { items: [
        '경진대회 출품 필수 조건 — "국내 LLM 활용도" 25% 가중치',
        '한국어 토큰 효율 — 한국어 학습 비중이 높아 같은 텍스트라도 토큰이 덜 소요',
        '데이터 주권·규제 대응 — 일부 공공·금융 도메인은 국외 API 사용 제한',
        '도메인 특화 — 한국 사회·문화·법률 지식이 글로벌 모델보다 정확',
      ] },

      { subtitle: '국내 LLM 비교' },
      { table: {
        headers: ['모델', '제공사', '특징', 'API', '가격대'],
        rows: [
          ['Solar Pro', '업스테이지', '경량 고성능, OpenAI 호환', 'console.upstage.ai', '저렴'],
          ['HyperCLOVA X', '네이버 클로바', '한국어 특화 + 도구 사용', 'CLOVA Studio', '중간'],
          ['EXAONE 3.5', 'LG AI', '기업·다국어, 추론 강함', 'lge.ai (제한)', '문의'],
          ['KoAlpaca', '오픈소스', '로컬 실행 가능, 무료', 'HuggingFace', '무료'],
        ],
      } },

      { subtitle: 'Solar API 첫 호출' },
      { text: 'Solar는 OpenAI 호환 형식을 제공하므로 OpenAI SDK 코드를 거의 그대로 사용할 수 있어 진입 장벽이 낮습니다.' },
      { code: { lang: 'bash', content: `# 1) 콘솔에서 API 키 발급
# https://console.upstage.ai → API Keys → Create

# 2) 환경변수에 저장 (.env.local)
echo "VITE_SOLAR_API_KEY=up_..." >> .env.local

# 3) curl로 첫 호출 (Bash)
curl -X POST "https://api.upstage.ai/v1/chat/completions" \\
  -H "Authorization: Bearer up_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "solar-pro",
    "messages": [
      { "role": "system", "content": "반드시 한국어로만 답하라." },
      { "role": "user",   "content": "오늘 날씨를 시로 표현해 줘." }
    ]
  }'` } },

      { subtitle: 'TypeScript 호출 예제' },
      { code: { lang: 'typescript', content: `// src/utils/solar.ts
const SOLAR_URL = 'https://api.upstage.ai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_SOLAR_API_KEY;

export async function askSolar(prompt: string): Promise<string> {
  const res = await fetch(SOLAR_URL, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'solar-pro',
      messages: [
        { role: 'system', content: '반드시 한국어로만 답하라.' },
        { role: 'user',   content: prompt },
      ],
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content; // OpenAI 호환 응답 경로
}` } },
      { callout: { type: 'warn', text: 'API 키를 절대 코드·커밋·프론트엔드에 직접 하드코딩하지 마세요. 프로덕션에서는 Supabase Edge Function 등 서버측에서 호출해야 합니다. 본 예제는 학습용 데모 한정.' } },

      { subtitle: '한국어 토큰 효율 실측' },
      { text: '동일한 한국어 문장 "안녕하세요, 만나서 반갑습니다."(15자)를 모델별로 토큰화하면 차이가 큽니다. 입력 비용은 토큰 수에 정비례하므로 한국어 학습 비중이 높은 국산 모델이 일반적으로 더 경제적입니다.' },
      { table: {
        headers: ['모델', '추정 토큰 수', '상대 비용'],
        rows: [
          ['GPT-5', '약 28~32', '기준 (1.0)'],
          ['Claude', '약 22~26', '0.85'],
          ['Solar', '약 14~18', '0.55'],
          ['HyperCLOVA X', '약 12~16', '0.50'],
        ],
      } },

      { subtitle: '경진대회 모델 선정 가이드' },
      { items: [
        '주력 모델 1 + 폴백 모델 1 — 단일 모델 장애 대비',
        '비용 민감 작업(요약·분류) → Solar Mini / KoAlpaca',
        '품질 민감 작업(대화·생성) → Solar Pro / HyperCLOVA X',
        '도구 사용·에이전트 필요 → HyperCLOVA X (function calling 지원)',
      ] },

      { subtitle: '폴백(Fallback) 패턴 — 운영 안정성' },
      { code: { lang: 'typescript', content: `// src/utils/llm.ts
import { askSolar }       from './solar';
import { askHyperCLOVA }  from './hyperclova';

export async function askWithFallback(prompt: string): Promise<string> {
  try {
    return await askSolar(prompt);          // 1순위
  } catch (err) {
    console.warn('Solar 실패, HyperCLOVA로 폴백', err);
    try {
      return await askHyperCLOVA(prompt);   // 2순위
    } catch (err2) {
      console.error('모든 LLM 실패', err2);
      return '죄송합니다. 일시적으로 응답할 수 없습니다.';
    }
  }
}` } },

      { subtitle: '응답 캐싱 — 비용 절감' },
      { code: { lang: 'typescript', content: `// 같은 질문은 캐시에서 (메모리 캐시 단순 예)
const cache = new Map<string, { data: string; ts: number }>();
const TTL = 1000 * 60 * 60; // 1시간

export async function cachedAsk(prompt: string): Promise<string> {
  const hit = cache.get(prompt);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  const result = await askSolar(prompt);
  cache.set(prompt, { data: result, ts: Date.now() });
  return result;
}` } },
      { callout: { type: 'tip', text: '프로덕션에서는 메모리 캐시 대신 Redis나 Supabase 테이블 사용. 자주 묻는 질문 상위 100개만 캐싱해도 비용이 30~50% 줄어드는 경우가 많습니다.' } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "Solar API 무료 크레딧이 있나요?" — Upstage는 신규 가입 시 일정 크레딧을 제공하며 무료 티어에서도 학습용 호출이 가능합니다.',
        'Q. "HyperCLOVA X는 어떻게 신청하나요?" — 네이버 CLOVA Studio에서 신청. 사업자 인증·서비스 설명 검토 후 승인됩니다.',
        'Q. "EXAONE을 일반 개발자가 쓸 수 있나요?" — 현재 LG 그룹 계열 및 파트너 중심 제공. 일반 공개 API는 제한적.',
        'Q. "오픈소스 모델을 로컬에서 돌리려면?" — KoAlpaca 7B는 RTX 4090 1대로 가능. 30B 이상은 다중 GPU 필요. Ollama·LM Studio 같은 툴이 진입 장벽 낮춰줍니다.',
        'Q. "비용이 가장 적게 드는 조합은?" — Solar Mini + 캐싱 + 짧은 system 프롬프트. 일반 챗봇 기준 월 10만원 이하로 운영 가능.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. Solar API의 URL을 답하시오.',
        '2. OpenAI 호환 응답에서 텍스트가 위치하는 JSON 경로는?',
        '3. 동일 한국어 문장의 토큰 수는 GPT와 Solar 중 어느 쪽이 더 많은가?',
        '4. 폴백 전략에서 1순위 실패 시 무엇을 해야 하는가?',
        '5. 경진대회에서 국내 LLM 활용도의 평가 가중치는?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) https://api.upstage.ai/v1/chat/completions  2) choices[0].message.content  3) GPT (한국어 토큰화 비효율로 더 많음)  4) 2순위 모델로 자동 재시도 + 모니터링 로그  5) 25%' } },

      { subtitle: '참고 자료' },
      { items: [
        'Upstage Console (console.upstage.ai) — Solar API 키 발급·문서',
        'CLOVA Studio (clovastudio.ncloud.com) — HyperCLOVA X',
        'Hugging Face Korean Models — beomi/KoAlpaca 등 오픈소스',
        '벤치마크: KMMLU·Ko-Arena (한국어 모델 성능 비교)',
        '커뮤니티: r/LocalLLaMA, 페이스북 "AI 한국어 처리" 그룹',
      ] },

      { subtitle: '실습 (60분)' },
      { items: [
        'Upstage 콘솔에서 Solar API 키 발급 후 .env.local 저장',
        'curl 또는 Postman으로 첫 호출 성공 + 응답 JSON 구조 분석',
        '동일 한국어 질문 3개를 ChatGPT/Solar/HyperCLOVA X에 비교 호출',
        '폴백·캐싱 함수 구현 + 1순위 강제 실패 시뮬레이션',
        '학습 노트에 "경진대회 출품작에 쓸 모델 1순위/2순위" 결정 + 근거 작성',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 4에서는 모든 LLM API 호출의 토대가 되는 개발환경을 구축합니다. VS Code·Cursor·Node·Git·GitHub Pages 셋업으로 정규과정 13일을 흔들림 없이 시작할 수 있게 합니다.' },
    ],
  },

  {
    id: 'pre-4',
    title: 'Day 4 · 개발환경 세팅',
    icon: '⚙️',
    description: 'VS Code·Cursor·Node 22·Git·GitHub Pages까지 정규과정 13일을 흔들림 없이 진행할 수 있는 개발환경을 한 번에 구축하고 점검합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'VS Code + 8개 확장 + 단축키', 'Vite React-TS 프로젝트 실행'],
          ['S2', '50분', 'Cursor vs Claude Code vs Copilot 비교', 'AI 에디터 1개 선정·설치'],
          ['S3', '50분', 'Git + GitHub + PAT', '"hello-rest" 저장소 첫 push 성공'],
          ['S4', '50분', '.env·.gitignore·보안 + 첫 GitHub Pages 배포', '실제 URL에서 페이지 표시'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        'VS Code 또는 Cursor에 필수 확장 프로그램을 설치한다',
        'Node.js 22 LTS와 npm을 정상 동작 상태로 셋업한다',
        'Git 기본 명령 + GitHub 계정 + Personal Access Token을 준비한다',
        '.env 관리와 .gitignore 표준 항목을 이해한다',
      ] },

      { subtitle: '필수 도구 체크리스트' },
      { table: {
        headers: ['도구', '버전·옵션', '용도'],
        rows: [
          ['VS Code', '최신 안정판', '기본 에디터'],
          ['Cursor', '최신', 'AI 네이티브 에디터 (선택)'],
          ['Node.js', '22 LTS', '런타임 + npm'],
          ['Git', '2.40+', '버전 관리'],
          ['GitHub Desktop', '선택', 'GUI 클라이언트'],
          ['Chrome', '최신', '디버깅·DevTools'],
        ],
      } },

      { subtitle: 'VS Code 추천 확장 (8종)' },
      { items: [
        'ESLint — 코드 품질 검사',
        'Prettier — 자동 포매팅',
        'GitHub Copilot — AI 코드 자동완성 (구독 필요)',
        'Material Icon Theme — 파일 아이콘 가독성',
        'Korean Language Pack — 한글 UI',
        'Tailwind CSS IntelliSense — Tailwind 자동완성',
        'Path Intellisense — import 경로 자동완성',
        'Error Lens — 에러를 줄에 인라인 표시',
      ] },

      { subtitle: 'Cursor vs Claude Code vs Copilot' },
      { table: {
        headers: ['도구', '인터페이스', '강점', '약점'],
        rows: [
          ['Cursor', '에디터 GUI', '컨텍스트 풍부, 시각적', '구독 비용'],
          ['Claude Code', 'CLI/터미널', '에이전트 동작, 다중 파일', '학습 곡선'],
          ['GitHub Copilot', 'VS Code 확장', '자동완성 정확', '대화 부족'],
        ],
      } },

      { subtitle: 'Node.js + npm 설치 검증' },
      { code: { lang: 'bash', content: `# Windows PowerShell 또는 Mac/Linux Terminal
node --version    # 출력 예: v22.11.0
npm --version     # 출력 예: 10.9.0

# 정상이면 React+Vite 프로젝트 생성 테스트
npm create vite@latest my-first-app -- --template react-ts
cd my-first-app
npm install
npm run dev       # http://localhost:5173 접속` } },
      { callout: { type: 'warn', text: 'Node 20 이하 버전은 Vite 7과 호환성 이슈가 있을 수 있습니다. 반드시 22 LTS 이상 사용을 권장합니다.' } },

      { subtitle: 'Git 핵심 명령 (10개)' },
      { code: { lang: 'bash', content: `# 초기 설정 (1회)
git config --global user.name  "홍길동"
git config --global user.email "you@example.com"

# 일상 사용
git clone <url>              # 원격 저장소 복제
git status                   # 변경된 파일 확인
git add <파일>               # 스테이징
git add .                    # 전체 스테이징
git commit -m "메시지"       # 커밋 생성
git push origin main         # 원격에 푸시
git pull                     # 원격 최신 가져오기
git log --oneline -10        # 최근 10개 커밋 보기

# 협업
git branch feat/login        # 브랜치 생성
git switch feat/login        # 브랜치 이동
git merge main               # main을 현재 브랜치로 병합` } },

      { subtitle: 'GitHub Personal Access Token (PAT)' },
      { text: '2021년 8월부터 GitHub는 HTTPS 푸시 시 비밀번호 대신 PAT를 요구합니다. 한 번 발급받아 자격 증명 매니저에 저장해두면 이후 자동 사용됩니다.' },
      { items: [
        'GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)',
        'Generate new token (classic) → scope: repo, workflow 체크',
        '토큰 문자열을 1회만 표시되므로 비밀번호 매니저에 저장',
        'git push 시 비밀번호 입력란에 토큰 붙여넣기',
      ] },

      { subtitle: '.env와 .gitignore 표준' },
      { code: { lang: 'gitignore', content: `# .gitignore — 반드시 추가해야 할 항목
node_modules
dist
.env
.env.local
.env.*.local
.DS_Store
Thumbs.db
NUL
nul
.claude/
*.log` } },
      { callout: { type: 'warn', text: '.env 파일은 절대 커밋하지 마세요. API 키, DB 비밀번호 등이 GitHub에 노출되면 24시간 내 자동 봇이 스캔해 악용합니다. 만약 실수로 푸시했다면 즉시 키를 폐기하고 재발급하세요.' } },

      { subtitle: 'VS Code 필수 단축키 (15개)' },
      { table: {
        headers: ['단축키 (Win)', '단축키 (Mac)', '기능'],
        rows: [
          ['Ctrl+P', 'Cmd+P', '파일 빠른 열기'],
          ['Ctrl+Shift+P', 'Cmd+Shift+P', '명령 팔레트'],
          ['Ctrl+`', 'Ctrl+`', '터미널 토글'],
          ['Ctrl+B', 'Cmd+B', '사이드바 토글'],
          ['Ctrl+/', 'Cmd+/', '주석 토글'],
          ['Alt+↑/↓', 'Opt+↑/↓', '줄 이동'],
          ['Shift+Alt+↑/↓', 'Shift+Opt+↑/↓', '줄 복제'],
          ['Ctrl+D', 'Cmd+D', '다음 동일 단어 선택'],
          ['Ctrl+F', 'Cmd+F', '현재 파일 검색'],
          ['Ctrl+Shift+F', 'Cmd+Shift+F', '전체 프로젝트 검색'],
          ['F2', 'F2', '심볼 일괄 이름 변경'],
          ['F12', 'F12', '정의로 이동'],
          ['Alt+F12', 'Opt+F12', '정의 미리보기 (열지 않고)'],
          ['Ctrl+Space', 'Ctrl+Space', '자동완성 강제'],
          ['Ctrl+K Ctrl+S', 'Cmd+K Cmd+S', '단축키 설정 열기'],
        ],
      } },

      { subtitle: 'Git 충돌(Conflict) 해결' },
      { code: { lang: 'bash', content: `# 충돌이 발생한 상황 (pull 또는 merge 시)
git pull
# Auto-merging src/App.tsx
# CONFLICT (content): Merge conflict in src/App.tsx

# 1) 충돌 파일 확인
git status

# 2) 파일을 열면 표시됨
# <<<<<<< HEAD
# 내가 작성한 내용
# =======
# 동료가 작성한 내용
# >>>>>>> origin/main

# 3) 둘 중 선택 또는 합치고 마커(<<<, ===, >>>)는 모두 삭제
# 4) 해결 후
git add src/App.tsx
git commit -m "merge: resolve conflict"
git push` } },
      { callout: { type: 'warn', text: 'VS Code의 Git 확장에서 충돌 부위 위에 "Accept Current / Incoming / Both / Compare" 버튼이 떠 클릭으로 해결 가능합니다. 처음에는 GUI 권장.' } },

      { subtitle: 'npm 패키지 관리 — 핵심 명령' },
      { code: { lang: 'bash', content: `npm install              # package.json의 모든 의존성 설치
npm install <패키지>      # 새 패키지 추가 + package.json 업데이트
npm install -D <패키지>   # dev 의존성으로 추가
npm uninstall <패키지>   # 제거
npm update               # 모든 패키지 최신화 (semver 범위 내)
npm outdated             # 오래된 패키지 확인
npm audit                # 보안 취약점 검사
npm audit fix            # 자동 수정 시도
npm run <스크립트>        # package.json scripts 실행

# package-lock.json은 반드시 커밋 — 팀원 간 동일 버전 보장` } },

      { subtitle: '첫 GitHub Pages 배포 (Day 4 완성 체크)' },
      { code: { lang: 'bash', content: `# 1) Vite 프로젝트에서
npm install -D gh-pages

# 2) package.json에 추가
# "scripts": {
#   "predeploy": "npm run build",
#   "deploy":    "gh-pages -d dist"
# }

# 3) vite.config.ts
# base: '/<리포지토리명>/'   ← 또는 커스텀 도메인이면 '/'

# 4) 배포
npm run deploy

# 5) GitHub 저장소 → Settings → Pages → Branch: gh-pages → Save
# 6) 약 1~3분 후 https://<유저>.github.io/<리포>/ 접근` } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "Node는 LTS와 Current 중 무엇을 받나요?" — 학습·실무 모두 LTS. Current는 최신 기능 실험용. 22 LTS가 안정적.',
        'Q. "Yarn·pnpm은 안 쓰나요?" — npm으로 충분. 회사 표준이 별도면 따라가되, 본 과정은 npm 통일.',
        'Q. "Windows에서 권한 오류가 자주 나요" — Windows Defender 폴더 액세스 제어, OneDrive 동기화 폴더 제외 권장. 가능하면 D:\\projects 같이 시스템 외부 폴더 사용.',
        'Q. "GitHub Desktop과 git 명령 중 어느 쪽?" — 둘 다 OK. 초반 1주는 GUI, 그 뒤 CLI 권장. 충돌 해결은 GUI가 직관적.',
        'Q. ".env.local과 .env의 차이?" — .env는 모든 환경 공통, .env.local은 개인 비밀(자동으로 gitignore됨). 협업 시 .env.example만 공유.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. Node 22 LTS의 npm 버전을 확인하는 명령은?',
        '2. Git에서 마지막 커밋 메시지를 수정하는 명령은?',
        '3. .env 파일을 절대 커밋하지 말아야 하는 이유는?',
        '4. GitHub PAT는 어디서 발급하는가?',
        '5. Vite의 dev 서버 기본 포트는?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) npm --version  2) git commit --amend  3) API 키·DB 비밀번호 등이 GitHub에 노출되면 봇이 스캔해 도용  4) GitHub Settings → Developer settings → Personal access tokens  5) 5173' } },

      { subtitle: '참고 자료' },
      { items: [
        'Node.js 공식: nodejs.org/ko (한국어 문서 잘 정비됨)',
        'Git Book: git-scm.com/book/ko/v2 (무료, 한국어)',
        'VS Code 단축키 PDF: code.visualstudio.com/shortcuts',
        'GitHub Docs: docs.github.com/ko',
        'Cursor 공식: cursor.sh/docs',
      ] },

      { subtitle: '실습 (60분)' },
      { items: [
        'VS Code(또는 Cursor) + 8개 추천 확장 설치 완료',
        'Node 22 LTS 설치 + npm으로 Vite React-TS 프로젝트 생성·실행',
        'GitHub 계정 생성 + PAT 발급 + 자격 증명 매니저 저장',
        '"hello-rest" 저장소 만들고 첫 commit + push 성공',
        '.env 파일에 더미 변수 1개 작성 + .gitignore로 제외 확인',
        '의도적으로 동일 파일 두 곳에서 수정 → 충돌 발생 → 해결 경험',
        'gh-pages로 첫 페이지 배포 → 실제 URL에서 표시 확인',
      ] },

      { subtitle: '선수과정 마무리 — 정규과정 진입 점검' },
      { items: [
        '✅ VS Code/Cursor + 확장 + 단축키 5개 이상 익숙',
        '✅ Node 22 + npm 정상 동작',
        '✅ Git push·pull·merge·conflict 해결 경험',
        '✅ GitHub Pages 배포 1회 성공',
        '✅ AI 모델 3종 비교 + 주력 모델 선정',
        '✅ 프롬프트 4요소로 본인 업무 1건 처리',
        '✅ 국내 LLM(Solar) API 직접 호출 성공',
      ] },
    ],
  },
];

/* ═════════════════════════════════════════════════════════
 *  정규과정 DT (13일, 52H) — 바이브코딩 → 배포·발표
 * ═════════════════════════════════════════════════════════ */
export const regularTopics: Topic[] = [
  {
    id: 'reg-1',
    title: 'Day 1 · 바이브코딩 개론',
    icon: '🎵',
    description: '"AI와 대화하며 코딩하기"라는 새로운 패러다임의 정의와 철학, 도구 비교(Cursor/Claude Code/Copilot/Bolt), 효과적 협업의 5원칙을 학습합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', '바이브코딩 정의 + 전통 코딩과의 차이', '본인 패러다임 이해도 자가 평가'],
          ['S2', '50분', 'AI 코딩 도구 5종 비교 + 선정', '주력 도구 1개 결정'],
          ['S3', '50분', '효과적 협업 5원칙 + 실패 패턴 회피', '5원칙 본인 워크플로우 반영'],
          ['S4', '50분', 'Cursor 첫 페이지 만들기 실습', '동작하는 React 컴포넌트 1개'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        '바이브코딩의 정의와 전통 코딩과의 차이를 설명한다',
        'Cursor / Claude Code / Copilot / Bolt의 적합 시나리오를 구분한다',
        '효과적 AI 협업 5원칙을 본인의 워크플로우에 적용한다',
        '바이브코딩의 한계와 위험을 인지한다',
      ] },

      { subtitle: '바이브코딩이란?' },
      { text: '바이브코딩(Vibe Coding)은 자연어 대화를 1차 인터페이스로 두고 AI와 함께 소프트웨어를 만드는 방식입니다. 개발자는 "무엇을 만들지(What)"를 표현하고, AI가 "어떻게 만들지(How)"의 코드를 제안합니다. 사람은 기획·검증·결정에, AI는 구현·반복·탐색에 집중합니다.' },

      { subtitle: '전통 코딩 vs 바이브코딩' },
      { table: {
        headers: ['항목', '전통 코딩', '바이브코딩'],
        rows: [
          ['1차 입력', '코드 (문법·API 기억)', '자연어 (의도 표현)'],
          ['반복 단위', '함수·파일', '대화 턴'],
          ['속도', '느리지만 정확', '빠르지만 검증 필요'],
          ['진입 장벽', '높음 (문법·생태계)', '낮음 (영문/한글)'],
          ['실력 정의', '문법·알고리즘 숙련', '문제 정의·검증·통합'],
        ],
      } },

      { subtitle: 'AI 코딩 도구 비교 (선정 가이드)' },
      { table: {
        headers: ['도구', '인터페이스', '베스트 시나리오', '비용'],
        rows: [
          ['Cursor', '에디터(IDE)', '본격 개발, 큰 코드베이스', '월 $20'],
          ['Claude Code', 'CLI', '에이전트 자동화, 다파일 작업', 'API 또는 구독'],
          ['GitHub Copilot', 'VS Code 확장', '자동완성 보조', '월 $10'],
          ['Bolt / Lovable', '웹 브라우저', '풀스택 앱 빠른 프로토타입', '무료~유료'],
          ['v0 / Claude.ai', '웹 채팅', '학습·디자인 탐색', '무료~구독'],
        ],
      } },

      { subtitle: '효과적 AI 협업 5원칙' },
      { items: [
        '① 컨텍스트 풍부하게 — 프로젝트 구조·스택·제약을 첫 메시지에 명시',
        '② 한 번에 한 작업 — 거대 요구는 모델 품질 저하의 주요 원인',
        '③ 항상 검증 — AI가 제안한 코드를 줄 단위로 읽고 의미 파악',
        '④ 실패를 자료로 — 모델 실수에 화내지 말고 "왜 틀렸나"를 메모',
        '⑤ 인간이 결정 — 아키텍처·기술 선택은 사람이 최종 결정',
      ] },

      { subtitle: '실패 패턴 (회피하기)' },
      { table: {
        headers: ['패턴', '증상', '대응'],
        rows: [
          ['블라인드 신뢰', 'AI 코드를 검증 없이 커밋 → 운영 버그', '항상 PR·로컬 테스트로 검증'],
          ['컨텍스트 부족', '"버튼 만들어줘" → 일관성 없는 결과', '"이 컴포넌트 양식 따라서…" 명시'],
          ['거대 요구', '"앱 통째로 만들어줘" → 절반은 placeholder', '기능 단위로 쪼개서 요청'],
          ['논리적 비약', 'AI가 만든 가짜 API를 그대로 사용', '실제 docs 링크로 검증'],
          ['프롬프트 광기', '한 대화 100턴 → 컨텍스트 오염', '주기적으로 새 대화 시작'],
        ],
      } },
      { callout: { type: 'tip', text: '경진대회 출품작은 코드 가독성도 평가됩니다. AI 생성 코드는 반드시 본인이 이해한 뒤 변수명·구조를 다듬고, 본인의 코드로 만들어 두세요. 발표 시 "이 부분이 어떻게 동작하나요?" 질문에 답할 수 있어야 합니다.' } },

      { subtitle: 'Cursor 핵심 단축키' },
      { table: {
        headers: ['단축키', '기능'],
        rows: [
          ['Cmd/Ctrl+L', '채팅 패널 열기 (질문)'],
          ['Cmd/Ctrl+K', '인라인 코드 편집 (현재 위치에서 AI 요청)'],
          ['Cmd/Ctrl+I', '에이전트 모드 (다파일 자동 편집)'],
          ['@파일명', '특정 파일을 컨텍스트로 첨부'],
          ['@web', '실시간 웹 검색 결과를 컨텍스트로'],
          ['@docs', '공식 문서 참조 컨텍스트'],
          ['Tab', 'AI 자동완성 수락'],
          ['Esc', 'AI 자동완성 거부'],
        ],
      } },

      { subtitle: 'AI 요청 → 코드 검수 워크플로우' },
      { code: { lang: 'text', content: `[1단계] 요청
  Cmd+K → "이 함수를 useMemo로 최적화하라"

[2단계] AI 변경 제안 표시
  diff 형태로 변경 전/후 비교

[3단계] 사람의 검수 (가장 중요)
  ① 변경 의미를 줄 단위로 이해했는가?
  ② 의존성 배열이 정확한가?
  ③ 동일 동작이 유지되는가?
  ④ 부작용은 없는가?

[4단계] 수락 (Accept) 또는 수정 후 수락
  필요 시 추가 질문: "왜 useCallback이 아닌 useMemo인가?"

[5단계] 실행·검증
  npm run dev → 화면 확인 → 로직 동작 확인` } },

      { subtitle: '바이브코딩 학습 곡선' },
      { table: {
        headers: ['단계', '기간', '특징'],
        rows: [
          ['1주차: 충격', '~1주', '"이게 다 되네?" — 무비판적 활용'],
          ['2주차: 환멸', '~2주', '잘못된 코드에 데임 — "역시 AI는…"'],
          ['3주차: 균형', '~1개월', '검수의 중요성 체득, 본인이 모르는 영역 식별'],
          ['4주차: 숙련', '~3개월', 'AI를 도구로, 본인은 의사결정자로'],
        ],
      } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "AI가 다 짜주면 내가 안 배우는 거 아닌가요?" — 검수 과정에서 배웁니다. AI 코드를 "왜 이렇게 짰지?"라고 물으며 읽으면 학습 효과가 가장 큽니다.',
        'Q. "Cursor 구독료가 부담돼요" — 학생/연구자 할인이 있고, 무료 GitHub Copilot (학생)·Codeium 같은 무료 대안도 있습니다.',
        'Q. "AI가 가짜 API를 만들어내요" — 환각. 항상 공식 문서 링크로 검증하거나 @docs 컨텍스트를 활용하세요.',
        'Q. "팀 전체가 바이브코딩으로 가도 되나요?" — 시니어 1명 이상의 검수 체계는 필수. AI 코드 품질은 검수자 역량에 비례합니다.',
        'Q. "회사에서 AI 코드 사용 금지인 경우?" — 라이선스·보안 우려 때문. 사내 LLM 도입 추세이므로 점차 변할 것. 우선 정책 확인.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. 바이브코딩에서 사람의 핵심 역할 2가지를 답하시오.',
        '2. Cursor에서 채팅 패널을 여는 단축키는?',
        '3. 효과적 AI 협업 5원칙 중 "한 번에 한 작업"이 중요한 이유는?',
        '4. AI가 만든 가짜 API를 식별하는 방법은?',
        '5. AI 코드를 본인 것으로 만들기 위해 발표 전 해야 할 일은?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) 문제 정의·검증·결정 / 2) Cmd(Ctrl)+L  3) 거대 요구는 모델이 일부 placeholder 처리 → 품질 저하  4) 공식 docs·실제 호출로 검증  5) 줄 단위 이해 + 변수명·구조 다듬어 본인 코드로 변환' } },

      { subtitle: '참고 자료' },
      { items: [
        'Cursor 공식 가이드: cursor.sh/docs',
        'Claude Code: docs.claude.com/en/docs/claude-code',
        '서적 추천: 『AI 시대의 개발자』 (트위터·유튜브에서 무료 글 다수)',
        'YouTube: ThePrimeagen, Theo (AI 코딩 비판적 시각)',
        '국내: 바이브코딩 커뮤니티 (Discord, Facebook 그룹)',
      ] },

      { subtitle: '실습 (90분)' },
      { items: [
        'Cursor 설치 → 첫 프로젝트 열기 → Cmd+L로 채팅 인터페이스 확인',
        '"반응형 카운터 컴포넌트를 React + TypeScript로 만들어라"로 첫 코드 생성',
        '생성된 코드를 줄 단위로 읽고 본인이 100% 이해할 때까지 질문',
        '의도적으로 거대 요구를 한 번 해보고 어떤 부분이 placeholder가 되는지 관찰',
        '같은 요청을 Cursor·Copilot·Bolt 3개로 실행 후 결과 비교',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 2부터는 웹 개발의 기초 HTML/CSS를 학습합니다. AI에게 효과적으로 CSS를 요청하는 패턴도 함께 익히며, 본인 포트폴리오 페이지를 만들어 봅니다.' },
    ],
    subSections: [
      {
        id: 'reg-1-theory',
        title: '심화 이론 — 패러다임 전환',
        icon: '🧠',
        summary: '바이브코딩이 왜 단순한 도구가 아닌 패러다임 전환인지, 인지과학·소프트웨어공학·경제학의 시각에서 다각적으로 분석합니다.',
        content: [
          { subtitle: '왜 "Vibe"인가 — 단어의 어원' },
          { text: 'Vibe Coding이라는 용어는 2024년 OpenAI 공동창업자 Andrej Karpathy의 트윗에서 처음 대중적으로 알려졌습니다. "I just talk to the AI, vibe with it, and accept what it builds" — 즉 직관적으로 AI와 대화하며 결과를 받아들이는 코딩 방식. 단순히 "AI가 코드를 짜준다"가 아니라, 인간의 사고를 자연어로 표현하면 AI가 그것을 실행 가능한 형태로 변환하는 새로운 노동 분업의 명칭입니다.' },

          { subtitle: '인지 부하 이론 — 무엇이 자동화되는가' },
          { text: 'Cognitive Load Theory(Sweller, 1988)에 따르면 인간의 작업 기억은 한 번에 4~7개의 청크만 처리 가능합니다. 전통 코딩에서 개발자는 (1) 비즈니스 로직, (2) 문법, (3) API 시그니처, (4) 디버깅 상태를 모두 동시에 머리에 유지해야 합니다. 바이브코딩은 (2)(3)을 AI에게 위임하여 인간이 (1)(4) — 문제 정의와 검증에 집중하게 합니다.' },
          { table: {
            headers: ['인지 자원', '전통 코딩', '바이브코딩'],
            rows: [
              ['비즈니스 로직 이해', '인간 70%', '인간 90%'],
              ['문법·API 기억', '인간 100%', 'AI 80%'],
              ['타이핑·작성', '인간 100%', 'AI 90%'],
              ['검증·테스트', '인간 100%', '인간 100%'],
              ['아키텍처 결정', '인간 100%', '인간 100%'],
            ],
          } },

          { subtitle: '소프트웨어공학 관점 — Jevons 역설' },
          { text: 'Jevons 역설(1865)은 "기술 효율이 높아지면 그 자원의 소비가 오히려 늘어난다"는 경제 현상입니다. 컴파일러가 등장하자 어셈블리어가 사라진 게 아니라 더 많은 소프트웨어가 만들어졌고, IDE 자동완성이 등장하자 더 큰 코드베이스가 가능해졌습니다. AI 코딩도 동일한 패턴이 예상됩니다 — 개발자가 사라지지 않고, 1인당 가능한 프로젝트의 규모와 복잡도가 폭발적으로 증가할 것입니다.' },

          { subtitle: '향후 5년 예측' },
          { items: [
            '2026: 모든 신규 SaaS의 60% 이상이 AI 코딩 도구로 시작',
            '2027: "AI Native" 회사 — 시니어 1명 + AI 도구로 운영되는 스타트업 보편화',
            '2028: 코드 리뷰의 80%를 AI가 1차 처리, 인간은 시니어 판단에 집중',
            '2029: "프롬프트 엔지니어"가 정식 직무로 분리 (현재는 융합)',
            '2030: 비전공자의 SaaS 창업이 폭증, 기술 진입장벽이 마케팅으로 이동',
          ] },

          { subtitle: '비판적 시각 — 무비판 수용의 위험' },
          { callout: { type: 'warn', text: 'AI 코딩이 만능은 아닙니다. (1) 보안 코드는 AI가 자주 실수합니다. (2) 새로운 라이브러리·최신 API는 학습 데이터 누락으로 부정확. (3) 도메인 특화 비즈니스 로직은 인간이 가르쳐야 합니다. (4) AI 의존이 깊어질수록 본인의 학습 곡선이 둔화될 수 있습니다.' } },

          { subtitle: '강의 토론 주제' },
          { items: [
            'Q1. "AI가 코드를 다 짜주면 개발자는 사라질까?" — 본인 의견 + 근거',
            'Q2. "주니어 개발자는 AI 시대에 어떻게 성장해야 하는가?"',
            'Q3. "보안 코드는 AI에 맡겨도 되는가?"',
            'Q4. "프롬프트 작성 능력 vs 전통 코딩 능력 — 무엇이 더 중요해질까?"',
          ] },
        ],
      },

      {
        id: 'reg-1-tools',
        title: 'AI 코딩 도구 심층 비교',
        icon: '🛠️',
        summary: 'Cursor·Claude Code·GitHub Copilot·Bolt·v0 등 6대 도구를 인터페이스·기능·가격·시나리오 관점에서 심층 비교합니다.',
        content: [
          { subtitle: '6대 도구 한눈 비교' },
          { table: {
            headers: ['도구', '인터페이스', '강점', '약점', '가격(2026)'],
            rows: [
              ['Cursor', 'IDE (VS Code 포크)', '코드베이스 컨텍스트, GUI', '구독료', '$20/월'],
              ['Claude Code', 'CLI', '에이전트 자동화, 다파일', '학습 곡선', 'API 사용량'],
              ['GitHub Copilot', 'VS Code 확장', '자동완성 정확, 깊은 IDE 통합', '대화 부족', '$10~19/월'],
              ['Bolt', '웹 브라우저', '풀스택 앱 즉시 배포', '제한적 커스터마이징', '무료~$20/월'],
              ['v0 by Vercel', '웹 브라우저', 'UI 컴포넌트 생성 특화', '범용 코딩 약함', '무료~$20/월'],
              ['Codeium', 'VS Code 확장', '무료, Copilot 대안', '품질 약간 낮음', '무료'],
            ],
          } },

          { subtitle: 'Cursor 마스터 가이드' },
          { text: 'Cursor는 VS Code를 포크해 만든 AI 네이티브 에디터입니다. VS Code의 모든 확장과 단축키를 그대로 쓰면서 AI 기능이 깊이 통합되어 있어 본 과정의 주력 도구로 권장합니다.' },
          { items: [
            'Cmd/Ctrl+L — 채팅 패널 (질문·대화)',
            'Cmd/Ctrl+K — 인라인 편집 (현재 위치에서 즉시 코드 변경)',
            'Cmd/Ctrl+I — 에이전트 모드 (다파일 자동 편집)',
            '@파일명 — 특정 파일을 컨텍스트로 첨부',
            '@web — 실시간 웹 검색 결과 컨텍스트',
            '@docs — 공식 문서 참조 컨텍스트',
            'Cmd/Ctrl+L 후 → 키 — 이전 대화 불러오기',
          ] },

          { subtitle: 'Cursor 추천 설정' },
          { code: { lang: 'json', content: `// settings.json (Cursor → Cmd+Shift+P → Open User Settings (JSON))
{
  "cursor.cpp.disabledLanguages": [],
  "cursor.chat.enableLongContext": true,
  "cursor.codebase.indexing.enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.tabSize": 2,
  "editor.fontSize": 14,
  "editor.fontFamily": "'JetBrains Mono', Consolas, monospace",
  "editor.minimap.enabled": false,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}` } },

          { subtitle: 'Claude Code 깊이 보기' },
          { text: 'Claude Code는 터미널에서 동작하는 에이전틱 코딩 CLI입니다. Cursor가 "에디터 + AI 채팅"이라면 Claude Code는 "AI가 직접 파일을 수정하고 명령을 실행하는 자율 에이전트"에 가깝습니다.' },
          { code: { lang: 'bash', content: `# 설치
npm install -g @anthropic-ai/claude-code

# 시작
cd my-project
claude

# 예시 명령
# > "src/components/Button.tsx의 props 타입을 안전하게 리팩토링하라"
# Claude가 파일을 읽고, 분석하고, 변경 제안을 표시 → 승인 시 적용

# 주요 옵션
claude --model opus      # 가장 강력 (Opus 4.7)
claude --model sonnet    # 빠름·저렴 (Sonnet 4.6)
claude --resume          # 이전 세션 이어서` } },

          { subtitle: 'GitHub Copilot — 자동완성 중심' },
          { text: 'Copilot은 코드 작성 중 회색 텍스트로 다음 줄을 제안합니다. Cursor의 대화형 인터페이스와 달리, 흐름을 끊지 않고 보조하는 방식. 베테랑 개발자에게 특히 효율적입니다.' },
          { items: [
            'Tab — 제안 수락',
            'Esc — 제안 거부',
            'Alt+] — 다음 제안',
            'Alt+[ — 이전 제안',
            'Ctrl+Enter — 여러 제안 패널 열기',
          ] },

          { subtitle: '시나리오별 선정 가이드' },
          { table: {
            headers: ['상황', '추천 도구', '이유'],
            rows: [
              ['처음 시작하는 학생', 'Cursor', '시각적, 대화 흐름이 학습에 좋음'],
              ['빠른 프로토타입', 'Bolt / v0', '브라우저에서 즉시 배포'],
              ['대규모 리팩토링', 'Claude Code', '다파일 자율 작업'],
              ['일상 개발', 'Cursor + Copilot', '자동완성 + 대화 병행'],
              ['예산 0원', 'Codeium (무료)', '유료 도구 대안'],
              ['UI 컴포넌트만 빨리', 'v0', 'React + Tailwind 특화'],
            ],
          } },

          { subtitle: '도구 조합 워크플로우' },
          { text: '실력자들은 보통 2~3개 도구를 조합합니다. 예: "v0로 UI 디자인 생성 → Cursor로 코드베이스 통합 → Claude Code로 테스트 작성"의 흐름. 각 도구의 강점만 사용하는 전략.' },
        ],
      },

      {
        id: 'reg-1-patterns',
        title: '효과적 협업 패턴 마스터',
        icon: '🎯',
        summary: 'AI와의 협업에서 90%의 결과 차이를 만드는 7가지 핵심 패턴 — 컨텍스트 주입, 작업 분할, 검수, 반복 개선, 폴백 등을 학습합니다.',
        content: [
          { subtitle: '패턴 1 · 컨텍스트 주입 (Context Loading)' },
          { text: 'AI 응답 품질의 70%는 컨텍스트의 풍부함에서 결정됩니다. 빈 상태의 AI에게 갑자기 "버튼 만들어줘"는 일반적인 결과만 얻습니다. 본인 프로젝트의 디자인 시스템·기술 스택·기존 패턴을 먼저 알려주는 게 핵심.' },
          { code: { lang: 'text', content: `[좋은 컨텍스트 주입 예시]

우리 프로젝트는:
- Vite 7 + React 19 + TypeScript 5.8
- Supabase 백엔드 사용
- 디자인 시스템: var(--primary-blue) 등 CSS 변수
- 컴포넌트 위치: src/components/
- 기존 패턴: 모든 컴포넌트는 default export
- 다크모드 대응 필수

이 컨텍스트를 바탕으로 다음 작업을 해주세요:
[실제 요구사항]` } },

          { subtitle: '패턴 2 · 작업 분할 (Task Decomposition)' },
          { text: '"앱 만들어줘"는 거의 항상 실패합니다. 작업을 최대 30분 단위로 쪼개서 순차적으로 요청하는 게 안전합니다.' },
          { table: {
            headers: ['❌ 거대 요구', '✅ 분할된 요구'],
            rows: [
              ['"쇼핑몰 만들어줘"', '"상품 목록 페이지의 카드 컴포넌트만 먼저"'],
              ['"로그인 시스템 구현"', '"이메일 입력 폼 + 검증 함수"'],
              ['"리팩토링 해줘"', '"이 함수의 중복 if를 switch로"'],
            ],
          } },

          { subtitle: '패턴 3 · 검수 체크리스트' },
          { code: { lang: 'text', content: `[AI 코드 검수 5단계]

1. 변수명·함수명이 본인 프로젝트 컨벤션과 맞는가?
2. import 경로가 정확한가? (AI가 자주 틀림)
3. 사용하지 않는 변수/import 있는가?
4. 에러 처리가 충분한가? (try-catch, 빈 상태)
5. 의존성 배열·key prop 등 React 룰 준수?` } },

          { subtitle: '패턴 4 · 반복 개선 사이클' },
          { code: { lang: 'text', content: `반복 개선 표준 사이클 (보통 2~3회로 수렴)

라운드 1: 초안 받기
   "X 기능을 React로 구현하라"
   → 동작하는 코드 받음

라운드 2: 구체화
   "위 코드에서 에러 처리를 추가하고,
    로딩 상태를 별도 컴포넌트로 분리하라"
   → 완성도 ↑

라운드 3: 정제
   "변수명을 camelCase로 통일, 매직 넘버를 상수로 추출하라"
   → 가독성 ↑

⚠️ 4라운드 이상은 보통 컨텍스트 오염 — 새 대화 권장` } },

          { subtitle: '패턴 5 · 폴백 (Fallback) 전략' },
          { text: '실제 운영에서는 LLM 호출이 실패할 수 있습니다. 1순위 모델 + 2순위 폴백 + 최종 정적 응답의 3단 안전망이 표준입니다.' },
          { code: { lang: 'typescript', content: `async function askWithFallback(prompt: string): Promise<string> {
  try {
    return await askSolar(prompt);             // 1순위
  } catch {
    try {
      return await askHyperCLOVA(prompt);      // 2순위
    } catch {
      return '죄송합니다. 일시적으로 답변할 수 없습니다.'; // 정적 폴백
    }
  }
}` } },

          { subtitle: '패턴 6 · 결과물 검증 자동화' },
          { text: 'AI가 생성한 코드를 사람만 검토하지 말고, TypeScript·ESLint·테스트로 자동 검증합니다. 이 3중 자동 검증을 통과한 코드만 commit합니다.' },
          { code: { lang: 'bash', content: `# 검증 파이프라인
npm run typecheck   # tsc -b
npm run lint        # eslint .
npm test            # vitest

# 통합 스크립트 (package.json)
"verify": "npm run typecheck && npm run lint && npm test"` } },

          { subtitle: '패턴 7 · 컨텍스트 위생' },
          { items: [
            '주제가 바뀌면 새 대화 시작 — 토큰 누적 + 응답 오염 방지',
            '대화 100턴 이상은 거의 항상 새 대화가 낫다',
            '민감 정보(키·비밀번호)는 절대 대화에 노출 금지',
            '인텔리전스 캐시 — 자주 쓰는 컨텍스트는 .cursor/rules 또는 CLAUDE.md에 저장',
          ] },

          { subtitle: '7대 패턴 점검 체크리스트' },
          { items: [
            '☐ 첫 메시지에 프로젝트 컨텍스트 충분히 포함',
            '☐ 30분 이내 단위로 작업 분할',
            '☐ 5단계 검수 체크리스트 적용',
            '☐ 2~3 라운드 반복 개선',
            '☐ 폴백 처리 포함된 LLM 호출 함수',
            '☐ 검증 자동화 파이프라인 동작',
            '☐ 주기적 새 대화 시작',
          ] },
        ],
      },

      {
        id: 'reg-1-failures',
        title: '실패 사례 심층 분석',
        icon: '🚨',
        summary: '실제 발생한 AI 코딩 사고 5건을 원인-결과-방지법 관점에서 분석하고, 본인 프로젝트에서 같은 실수를 피하는 가이드를 학습합니다.',
        content: [
          { subtitle: '사례 1 · API 키 노출 사고' },
          { text: '한 학생이 ChatGPT에 OpenAI API 키를 포함한 환경변수를 그대로 붙여넣고 "이 환경에서 동작하는 코드를 짜줘"라고 요청. AI는 코드 응답에 API 키 그대로 출력. 학생이 그 응답을 GitHub에 푸시. 24시간 안에 자동 봇이 키를 스캔, 도용 → $300 청구서.' },
          { callout: { type: 'warn', text: '교훈: AI에게 키·비밀번호·개인정보를 절대 보내지 말 것. 코드 안에 키가 있는 부분은 마스킹(예: process.env.OPENAI_KEY)으로 대체 후 질문.' } },

          { subtitle: '사례 2 · 가짜 라이브러리 사용' },
          { text: 'AI가 추천한 "react-easy-table" 라이브러리. 학생이 npm install 시도 → 존재하지 않는 패키지. 비슷한 이름의 패키지가 있지만 다른 기능. AI가 학습 데이터에 없는 라이브러리를 "있다고 환각"한 사례.' },
          { items: [
            '원인: LLM의 할루시네이션 + 학습 데이터 컷오프',
            '대응: 항상 npm 또는 패키지의 공식 사이트에서 검증 후 사용',
            '도구: AI에게 "최신 npm 통계 기준 사용자 10K+ 패키지로 답하라" 명시',
          ] },

          { subtitle: '사례 3 · 보안 취약 코드 무비판 수용' },
          { code: { lang: 'typescript', content: `// AI가 제안한 "로그인 검증" 코드 — 학생이 그대로 사용
function checkLogin(email: string, password: string) {
  const query = \`SELECT * FROM users WHERE email = '\${email}' AND password = '\${password}'\`;
  return db.query(query);    // ⚠️ SQL Injection 취약점!
}

// 보안 검토자가 발견: email에 "' OR 1=1 --" 입력 시 모든 사용자 데이터 노출` } },
          { callout: { type: 'warn', text: '교훈: 보안 코드는 반드시 시니어 또는 보안 전문가 검토. AI는 "동작하는 코드"를 만들 뿐 "안전한 코드"를 만들지 않습니다. ORM·Prepared Statement 사용 + 비밀번호는 bcrypt 등으로 해싱.' } },

          { subtitle: '사례 4 · 무한 루프 setState' },
          { code: { lang: 'tsx', content: `// AI가 만든 useEffect — 무한 리렌더 사고
useEffect(() => {
  setItems(items.map(i => ({ ...i, active: true })));
}, [items]);  // ⚠️ items가 의존성이라 setItems → 의존성 변경 → 또 실행 → ...

// 결과: 브라우저 freeze, 메모리 폭증, 사용자 PC 마비` } },
          { items: [
            '원인: AI가 의존성 배열의 의미를 정확히 이해 못 함',
            '대응: useEffect의 첫 번째 의도("언제 실행")를 명시한 후 요청',
            '검증: ESLint react-hooks/exhaustive-deps 규칙 활성화',
          ] },

          { subtitle: '사례 5 · 비즈니스 로직 환각' },
          { text: '학생이 "한국 부가세 10% 계산 함수"를 요청. AI가 만든 코드는 영국 VAT 20% 계산. AI는 "한국"이라는 단어보다 "VAT"라는 일반 개념을 따라 동작. 학생이 검토 없이 사용해 결제 금액 오류.' },
          { callout: { type: 'tip', text: '도메인 특화 비즈니스 로직(세금·법률·의료·금융)은 반드시 사람이 검증. AI에게 "한국 부가가치세 10%로 계산하는 함수를 만들어라. VAT가 아닌 한국 세법 기준이다." 처럼 명시.' } },

          { subtitle: '5대 사례 공통 교훈' },
          { table: {
            headers: ['교훈', '구체적 행동'],
            rows: [
              ['민감 정보 보호', '키·비밀번호는 마스킹 후 질문'],
              ['외부 의존성 검증', '추천된 라이브러리는 npm·docs로 확인'],
              ['보안 코드 별도 검토', 'OWASP Top 10 체크리스트 적용'],
              ['React 룰 자동 검증', 'ESLint plugin-react-hooks 활성화'],
              ['도메인 로직 명시', '"한국 세법 기준" 등 지역·도메인 명시'],
            ],
          } },

          { subtitle: '본인 프로젝트 위험 자가 점검' },
          { items: [
            '✅ .env가 .gitignore에 포함되었는가?',
            '✅ git log에 API 키 흔적이 없는가? (git log -p | grep -i "api_key")',
            '✅ npm audit 결과에 high·critical 취약점이 없는가?',
            '✅ ESLint 경고가 0개인가?',
            '✅ TypeScript strict 모드 활성화?',
            '✅ 인증·결제·결제 등 핵심 흐름에 단위 테스트가 있는가?',
          ] },
        ],
      },

      {
        id: 'reg-1-practice-1',
        title: '실습 1 · 첫 컴포넌트 단계별 가이드 (90분)',
        icon: '🧪',
        summary: 'Cursor에서 React 카운터 컴포넌트를 만들면서 AI 협업 워크플로우를 체험하는 본격 실습입니다.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'Cursor의 채팅·인라인 편집·에이전트 모드 모두 경험',
            'AI 응답을 단계별로 검토하며 수정 요청',
            '최종적으로 동작하는 React 컴포넌트 완성',
            '본인이 100% 이해한 코드 확보',
          ] },

          { subtitle: '준비물' },
          { items: [
            'Cursor 설치 완료',
            'Day 4(선수과정)에서 생성한 Vite React-TS 프로젝트 또는 새 프로젝트',
            'AI 응답을 받아 적을 학습 노트',
            '타이머 (각 단계 시간 측정용)',
          ] },

          { subtitle: '0단계 · 환경 점검 (5분)' },
          { code: { lang: 'bash', content: `# 프로젝트 폴더로 이동
cd my-first-app

# Cursor로 열기
cursor .

# 개발 서버 실행 (별도 터미널)
npm run dev
# → http://localhost:5173` } },

          { subtitle: '1단계 · 컨텍스트 주입 (10분)' },
          { text: 'Cursor 채팅 패널(Cmd+L)을 열고 다음 메시지로 시작:' },
          { code: { lang: 'text', content: `우리 프로젝트는:
- Vite 7 + React 19 + TypeScript 5.8 (strict)
- 컴포넌트 위치: src/components/
- 모든 컴포넌트는 default export
- 함수형 컴포넌트만 사용

이 환경에서 다음 작업을 도와줘:
"카운터 컴포넌트를 만들고 싶다. +/− 버튼으로 값을 변경하고,
값이 짝수일 때 'EVEN', 홀수일 때 'ODD' 라벨을 표시.
초기값은 0이며 음수 허용."

먼저 코드를 짜기 전, 구현 방향을 한 줄로 설명해줘.` } },
          { callout: { type: 'tip', text: '바로 코드를 받지 말고 "방향 먼저"를 요청하는 이유 — AI가 잘못된 방향으로 가는 걸 코드 완성 전에 차단할 수 있습니다.' } },

          { subtitle: '2단계 · 코드 생성 (15분)' },
          { text: '방향이 본인 의도와 맞으면 후속 메시지:' },
          { code: { lang: 'text', content: `방향 OK. 이제 코드를 작성해줘.
파일명은 src/components/Counter.tsx로.` } },

          { subtitle: '3단계 · 코드 검토 (15분)' },
          { text: 'AI가 만든 코드를 한 줄씩 읽으며 다음을 검증:' },
          { items: [
            '☐ import 문이 정확한가?',
            '☐ Props 타입이 명시되었는가?',
            '☐ useState 초기값이 0인가?',
            '☐ +/− 핸들러가 함수로 분리되었는가?',
            '☐ JSX에서 짝수/홀수 분기가 명확한가?',
            '☐ className·스타일이 본인 컨벤션과 일치하는가?',
          ] },
          { callout: { type: 'warn', text: '이 단계에서 이해 안 가는 부분이 있으면 즉시 질문. "왜 이 부분에 useCallback을 안 썼나?" "이 || 0의 의미는?" 등.' } },

          { subtitle: '4단계 · 인라인 편집 (15분)' },
          { text: 'Cursor의 강점인 Cmd+K (인라인 편집) 체험. 코드 내 특정 줄을 선택하고 Cmd+K → "이 핸들러에 음수 방지 로직 추가"' },
          { code: { lang: 'typescript', content: `// Before (전체 코드)
const decrement = () => setCount(count - 1);

// 선택 후 Cmd+K → "음수가 되지 않도록 0 이상만 허용"
// After
const decrement = () => setCount(prev => Math.max(0, prev - 1));` } },

          { subtitle: '5단계 · 에이전트 모드 (15분)' },
          { text: 'Cmd+I로 에이전트 모드 진입. 다파일 작업 체험:' },
          { code: { lang: 'text', content: `다음을 한 번에 처리해줘:
1. src/components/Counter.tsx에 다크모드용 스타일 추가
2. src/styles/Counter.module.css 새 파일 생성
3. App.tsx에 <Counter /> import + 렌더

스타일은 var(--primary-blue) 등 CSS 변수 사용.
완료 후 변경된 파일 목록을 표 형태로 알려줘.` } },

          { subtitle: '6단계 · 동작 확인 + 회고 (15분)' },
          { items: [
            '브라우저에서 카운터 +/− 클릭 → 짝/홀 라벨 변경 확인',
            '−를 0에서 더 누르면 음수가 안 되는지 확인',
            '다크모드 토글 시 스타일 자동 변경 확인',
            '학습 노트에 "오늘 가장 인상 깊은 점" 1줄, "다음에 더 잘할 것" 1줄 작성',
          ] },

          { subtitle: '확장 과제 (시간 남으면)' },
          { items: [
            '리셋 버튼 추가 → 0으로 초기화',
            'step prop 추가 → 1씩이 아닌 N씩 증감 가능',
            '키보드 ↑·↓ 키로도 증감 가능',
            '카운트 변화를 localStorage에 저장 → 새로고침 시 복원',
          ] },
        ],
      },

      {
        id: 'reg-1-practice-2',
        title: '실습 2 · 도구 비교 미니 프로젝트 (60분)',
        icon: '⚗️',
        summary: '동일한 작업을 Cursor·Bolt·v0 세 도구로 각각 만들어 결과·속도·코드 품질을 직접 비교 체험합니다.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '동일 요구사항을 3개 도구로 구현하며 차이 체감',
            '각 도구의 강점·약점을 직접 정량화',
            '본인 프로젝트에 적합한 도구 선정 근거 확보',
          ] },

          { subtitle: '공통 요구사항' },
          { code: { lang: 'text', content: `[프로젝트] "오늘의 할 일" 카드 컴포넌트

기능:
- 입력창에 텍스트 입력 후 Enter → 카드로 추가
- 카드 좌측에 체크박스 → 클릭 시 완료 표시 (취소선)
- 카드 우측에 × 버튼 → 클릭 시 삭제
- 완료된 항목 N개 / 전체 N개 카운터 상단 표시

스타일:
- 카드는 둥근 모서리, 그림자
- 완료 항목은 회색 + 취소선
- 모바일 친화적 (320px 이상 정상 동작)` } },

          { subtitle: '1라운드 · Cursor (20분)' },
          { items: [
            '1) Cursor 새 프로젝트 열기',
            '2) 위 요구사항을 채팅에 붙여넣기 + "React + TS로 구현" 명시',
            '3) AI 응답 받은 후 1회 인라인 편집',
            '4) localhost에서 동작 확인',
            '5) 학습 노트에 시간·만족도(1~5) 기록',
          ] },

          { subtitle: '2라운드 · Bolt (15분)' },
          { items: [
            '1) bolt.new 접속 (무료 계정)',
            '2) 위 요구사항을 한 번에 입력',
            '3) AI가 자동으로 풀스택 앱 생성',
            '4) 브라우저에서 즉시 미리보기',
            '5) "내가 직접 작성한 코드 줄 수" 기록',
          ] },

          { subtitle: '3라운드 · v0 by Vercel (15분)' },
          { items: [
            '1) v0.dev 접속',
            '2) 위 요구사항을 입력',
            '3) UI 컴포넌트 단위로 생성됨',
            '4) "Copy code"로 코드 복사',
            '5) 본인 Cursor 프로젝트에 통합',
          ] },

          { subtitle: '비교 평가표 작성 (10분)' },
          { table: {
            headers: ['평가 항목', 'Cursor', 'Bolt', 'v0'],
            rows: [
              ['완성까지 시간', '?', '?', '?'],
              ['코드 가독성 (1~5)', '?', '?', '?'],
              ['수정 용이성 (1~5)', '?', '?', '?'],
              ['디자인 품질 (1~5)', '?', '?', '?'],
              ['학습 효과 (1~5)', '?', '?', '?'],
            ],
          } },
          { callout: { type: 'tip', text: '정답은 없습니다. 본인이 직접 비교한 결과를 본인의 노트에 남기는 것이 핵심. 일반적으로 Cursor는 학습·통제력, Bolt는 속도, v0는 디자인 품질에 강합니다.' } },

          { subtitle: '회고 질문' },
          { items: [
            'Q1. 어느 도구가 가장 빨랐는가? 그 이유는?',
            'Q2. 어느 도구의 코드를 가장 잘 이해할 수 있었는가?',
            'Q3. 본인 프로젝트에 주력으로 쓸 도구 1개 + 보조 1개를 선택한다면?',
            'Q4. 도구별 가격을 고려할 때 ROI가 가장 높은 것은?',
          ] },
        ],
      },

      {
        id: 'reg-1-practice-3',
        title: '실습 3 · 거대 요구 분할 실험 (40분)',
        icon: '🧪',
        summary: '의도적으로 거대 요구를 한 번, 분할 요구를 한 번 — 두 결과의 품질 차이를 직접 측정합니다.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '거대 요구 시 AI가 placeholder를 어디에 만드는지 식별',
            '분할 요구가 왜 더 정확한지 체감',
            '본인의 "한 번에 한 작업" 기준치 설정',
          ] },

          { subtitle: 'A 시나리오 · 거대 요구 (15분)' },
          { code: { lang: 'text', content: `[Cursor 채팅에 그대로 입력]

쇼핑몰 사이트를 만들어줘.
- 메인 페이지: 상품 목록 + 카테고리 필터 + 검색
- 상품 상세: 이미지·가격·재고·리뷰·장바구니 추가
- 장바구니: 수량 변경·삭제·결제 진행
- 결제: 카드·계좌이체·간편결제
- 회원: 가입·로그인·내정보·주문내역
- 관리자: 상품 추가·주문 관리·매출 통계

기술: React 19 + Vite + TypeScript + Supabase` } },

          { items: [
            '결과를 그대로 따라 npm run dev 실행해보기',
            '실제 동작하는 부분 vs placeholder 비율 측정',
            '특히 결제·재고·통계 등 복잡한 부분에서 // TODO: ... 발견',
            '학습 노트에 "거대 요구 결과 — 동작 30%, placeholder 70%" 기록',
          ] },

          { subtitle: 'B 시나리오 · 분할 요구 (20분)' },
          { code: { lang: 'text', content: `[같은 목표 — 작업을 5개로 쪼개기]

1턴: "상품 카드 컴포넌트 (이미지·이름·가격·장바구니 버튼) — React + TS"
2턴: "위 카드를 사용하는 상품 목록 페이지 — Grid 반응형"
3턴: "Supabase products 테이블 + RLS — id/name/price/image_url/stock"
4턴: "상품 목록을 Supabase에서 fetch + useState"
5턴: "장바구니 컴포넌트 (Context API로 전역 상태) + 수량 조작"` } },

          { items: [
            '각 턴 결과를 검수 후 다음 턴 진행',
            '5개 모두 완성 후 동작 확인',
            '품질 비교 — placeholder 비율?',
          ] },

          { subtitle: '결과 비교표 작성' },
          { table: {
            headers: ['항목', 'A (거대)', 'B (분할)'],
            rows: [
              ['실제 동작 비율', '?%', '?%'],
              ['placeholder 개수', '?', '?'],
              ['총 소요 시간', '? 분', '? 분'],
              ['본인 이해도 (1~5)', '?', '?'],
              ['디버깅 부담 (1~5)', '?', '?'],
            ],
          } },

          { subtitle: '학습 노트 회고 (5분)' },
          { items: [
            'Q1. A에서 어떤 영역이 가장 부실했나?',
            'Q2. B에서 가장 매끄럽게 진행된 턴은?',
            'Q3. 본인의 "한 번에" 한계는 몇 가지 작업인가?',
            'Q4. 다음 프로젝트에서 어떻게 적용할 것인가?',
          ] },
        ],
      },

      {
        id: 'reg-1-practice-4',
        title: '실습 4 · AI 검수 5단계 체크리스트 (45분)',
        icon: '🧪',
        summary: 'AI가 만든 코드를 무비판 수용하지 않고 체계적으로 검수하는 5단계 체크리스트를 실전 적용합니다.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '5단계 검수 체크리스트 직접 적용',
            'AI 코드의 잠재적 버그 1개 이상 발견',
            '본인 검수 능력 측정 + 향상',
          ] },

          { subtitle: '검수 5단계 체크리스트' },
          { code: { lang: 'text', content: `[1] import 경로 확인
- 모든 import가 실제 존재하는 모듈인가?
- 상대 경로 vs 절대 경로 일관성?
- 사용 안 하는 import 남아있는가?

[2] 타입 안전성
- 모든 함수에 명시적 타입?
- any 사용처 0개?
- 옵셔널 (?) 처리 적절한가?

[3] React 룰 준수
- Hook을 조건문 안에서 호출하지 않는가?
- useEffect 의존성 배열 정확?
- key prop 안정된 ID 사용?
- 상태를 직접 변경하지 않는가?

[4] 에러 처리
- try-catch 있는가?
- 4xx/5xx 분기 처리?
- 사용자 친화적 에러 메시지?
- 빈 상태·로딩 상태?

[5] 보안·성능
- API 키가 코드에 노출 안 됨?
- 사용자 입력 검증?
- 큰 계산에 useMemo?
- 불필요한 리렌더?` } },

          { subtitle: '실전 검수 — AI 코드 받아 검토' },
          { code: { lang: 'text', content: `[Cursor에게 요청]

다음 요구사항으로 코드를 작성해줘:
- 사용자가 이메일 입력 + 비밀번호 입력
- "로그인" 버튼 클릭 시 Supabase로 인증
- 성공 시 /dashboard로 이동
- 실패 시 에러 메시지 표시
- 의도적으로 검수 포인트가 발견되도록 작성

React + TypeScript + react-router-dom + supabase` } },

          { items: [
            '받은 코드를 5단계 체크리스트로 검토',
            '각 단계에서 발견한 문제를 노트에 기록',
            'AI에게 "이 코드에 [발견한 문제]가 있는데 맞나?" 후속 질문',
            'AI의 답변을 다시 검수 (역시 100% 신뢰 X)',
          ] },

          { subtitle: '검수 결과 양식' },
          { code: { lang: 'text', content: `[검수 보고서]

코드: LoginForm.tsx
검수일: 2026-XX-XX
검수자: 본인

[1] import 경로 ──────────────────
✅ 모두 정상

[2] 타입 안전성 ─────────────────
⚠️ 발견:
  - line 12: error 타입이 any로 처리됨
  - 개선: catch(err: unknown) + 좁힘

[3] React 룰 ────────────────────
✅ 정상

[4] 에러 처리 ────────────────────
⚠️ 발견:
  - 네트워크 에러와 인증 실패 구분 없음
  - 개선: error code별 다른 메시지

[5] 보안·성능 ────────────────────
✅ 정상

총평: 동작은 정상이나 에러 UX 개선 여지` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 5단계 모두 적용했는가?',
            '☐ 진짜 문제 1개 이상 발견했는가?',
            '☐ 개선안을 직접 작성했는가?',
            '☐ AI가 부인해도 본인 판단을 유지했는가?',
          ] },
        ],
      },

      {
        id: 'reg-1-practice-5',
        title: '실습 5 · 7가지 협업 패턴 통합 적용 (60분)',
        icon: '🧪',
        summary: '컨텍스트 주입·작업 분할·검수·반복 개선·폴백·검증 자동화·컨텍스트 위생 — 7가지 패턴을 한 프로젝트에 모두 적용합니다.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '7가지 협업 패턴을 모두 적용',
            '본인만의 워크플로우 템플릿 확립',
            '향후 모든 프로젝트의 표준 절차로 만들기',
          ] },

          { subtitle: '실습 프로젝트 — 메모장 앱 만들기' },
          { code: { lang: 'text', content: `[요구사항]
- 메모 작성·수정·삭제
- 카테고리별 필터 (업무·개인·학습)
- 즐겨찾기 기능
- localStorage에 자동 저장
- 다크모드` } },

          { subtitle: '단계 1 · 컨텍스트 주입 (5분)' },
          { code: { lang: 'text', content: `[Cursor 채팅 첫 메시지]

[프로젝트 컨텍스트]
- Vite 7 + React 19 + TypeScript 5.8 (strict)
- 디자인 시스템: CSS 변수 (var(--primary-blue) 등)
- 컴포넌트 위치: src/components/, 페이지: src/pages/
- 함수형 컴포넌트만, default export
- 모든 비동기는 try-catch
- localStorage 키 prefix: 'memo-'

[작업]
다음 단계로 메모장 앱을 만들 거야:
1) 메모 타입 정의 + 빈 상태 UI
2) 메모 추가 폼
3) 메모 목록 표시
4) 카테고리 필터
5) localStorage 동기화
6) 다크모드

먼저 1단계부터 시작.` } },

          { subtitle: '단계 2 · 작업 분할 (30분)' },
          { text: '위 6단계를 순차로 진행. 각 단계마다 별도 메시지로 요청. 한 단계 완료 후 다음 단계로.' },

          { subtitle: '단계 3 · 검수 체크리스트 (10분)' },
          { items: [
            '5단계 검수 (실습 4에서 학습)',
            '각 메시지 결과를 받자마자 검수',
            '문제 발견 시 같은 대화에서 후속 요청',
          ] },

          { subtitle: '단계 4 · 반복 개선 사이클 (10분)' },
          { code: { lang: 'text', content: `[1라운드] 초안 받기
[2라운드] "에러 처리 추가, 로딩 상태 분리"
[3라운드] "변수명 명확화, 매직 넘버 추출"

→ 보통 2~3회로 수렴` } },

          { subtitle: '단계 5 · 폴백 적용 (5분)' },
          { text: 'localStorage 접근 실패·JSON 파싱 실패 등 폴백 처리. 메모 데이터가 없으면 빈 배열 반환.' },

          { subtitle: '단계 6 · 검증 자동화 (5분)' },
          { code: { lang: 'bash', content: `npm run typecheck    # 타입 OK
npm run lint         # 0 경고
npm run dev          # 동작 확인

# 통합
"verify": "npm run typecheck && npm run lint"` } },

          { subtitle: '단계 7 · 컨텍스트 위생 (5분)' },
          { items: [
            '주제 끝나면 새 대화 시작',
            '대화 100턴 안 가도록 중간에 리셋',
            '민감 정보 입력 X',
          ] },

          { subtitle: '회고 — 본인의 협업 워크플로우 문서화' },
          { code: { lang: 'markdown', content: `# 나의 AI 협업 워크플로우

## 1. 첫 메시지 템플릿
- 프로젝트 스택
- 디자인 시스템
- 폴더 구조
- 코딩 컨벤션
- 다음 작업 순서

## 2. 작업 분할 기준
- 최대 30분 단위
- 한 번에 1개 컴포넌트
- 변경 파일 5개 이내

## 3. 검수 체크리스트 (5단계)
- import / 타입 / React / 에러 / 보안

## 4. 반복 개선 라운드
- 1~3라운드 표준
- 4라운드 이상 = 새 대화

## 5. 새 대화 시작 기준
- 주제 변경 시
- 100턴 도달 시
- 응답이 산만해질 때` } },
        ],
      },

      {
        id: 'reg-1-practice-6',
        title: '실습 6 · 실패 시뮬레이션 — 5대 사고 재현 (30분)',
        icon: '🧪',
        summary: '실제 발생한 AI 코딩 사고 5건을 안전한 환경에서 재현하고 방지법을 체득합니다.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '5대 사고를 안전한 데모 환경에서 재현',
            '각 사고의 원인·결과를 직접 체험',
            '방지법을 자신만의 체크리스트로 정리',
          ] },

          { subtitle: '사고 1 시뮬레이션 · API 키 노출 (5분)' },
          { code: { lang: 'text', content: `[안전한 환경 — 별도 폴더 + dummy 키]
mkdir leak-test && cd leak-test
git init

# 더미 키 포함 파일 생성
echo "const KEY = 'sk-dummy-fake-12345';" > config.js
git add config.js
git commit -m "test"

# 검색해보기 — 실제 노출 시 봇이 이걸 함
grep -r "sk-" .
# → config.js: const KEY = 'sk-dummy-fake-12345';

[방지법]
- .env.local + .gitignore
- npm install -D dotenv
- git-secrets·husky pre-commit hook` } },

          { subtitle: '사고 2 시뮬레이션 · 가짜 라이브러리 (5분)' },
          { code: { lang: 'text', content: `[Cursor에게 의도적으로 요청]

"react-easy-modal" 라이브러리로 모달을 만들어줘.

[AI 응답에서 발견할 패턴]
- AI가 그럴듯한 코드 작성
- 실제로는 존재하지 않는 패키지

[검증]
npm view react-easy-modal
# → npm ERR! 404 Not Found

[방지법]
- npm·GitHub 공식 페이지로 검증
- 실제 install 시도
- AI에게 "npm에서 검색되는가?" 재확인` } },

          { subtitle: '사고 3 시뮬레이션 · SQL Injection (10분)' },
          { code: { lang: 'typescript', content: `// AI가 만든 취약 코드 — 의도적 시연
function checkLogin(email: string, password: string) {
  const query = \`SELECT * FROM users
                  WHERE email = '\${email}' AND password = '\${password}'\`;
  return db.query(query);
}

// [공격 시뮬레이션 — 안전한 SQLite로]
checkLogin("' OR 1=1 --", "anything");

// 실제 실행 SQL:
// SELECT * FROM users WHERE email = '' OR 1=1 --' AND password = 'anything'
// → 모든 사용자 반환!

// [방지]
// Parameterized query 또는 ORM (Prisma·Supabase)
await supabase.from('users').select().eq('email', email).eq('password', hashed);` } },

          { subtitle: '사고 4 시뮬레이션 · 무한 루프 setState (5분)' },
          { code: { lang: 'tsx', content: `// 의도적 버그 컴포넌트
function BadList() {
  const [items, setItems] = useState([1, 2, 3]);

  useEffect(() => {
    setItems(items.map(i => i * 2));   // ⚠️ items 의존성 + items 변경
  }, [items]);

  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
}

// [관찰]
// - 브라우저 freeze
// - React Error: Maximum update depth exceeded

// [수정]
useEffect(() => {
  setItems(prev => prev.map(i => i * 2));
}, []);   // 마운트 시 1회만` } },

          { subtitle: '사고 5 시뮬레이션 · 도메인 로직 환각 (5분)' },
          { code: { lang: 'text', content: `[Cursor에게 요청]
"부가세 계산 함수를 만들어줘"

[AI 응답 — 의심하기]
const VAT_RATE = 0.20;   // ⚠️ 영국 VAT 20%
// 한국 부가세는 10%인데?

[검증]
- AI에게 "한국 기준이야?" 재확인
- 공식 출처 (국세청) 확인

[방지]
- 도메인 특화 작업은 "한국 기준" 명시
- 또는 본인이 직접 검증 필수
- 금융·세무·법률·의료는 전문가 검토` } },

          { subtitle: '본인 방지 체크리스트 작성' },
          { items: [
            '☐ .env.local 사용 + .gitignore 확인',
            '☐ AI 추천 라이브러리는 npm 공식 페이지 확인',
            '☐ SQL은 ORM·Parameterized query만',
            '☐ ESLint react-hooks/exhaustive-deps 활성화',
            '☐ 도메인 로직은 출처 검증 + 단위 테스트',
            '☐ pre-commit hook으로 자동 검증',
          ] },
        ],
      },

      {
        id: 'reg-1-practice-7',
        title: '실습 7 · 첫 GitHub 커밋 + 배포 (30분)',
        icon: '🧪',
        summary: '본 실습들의 결과물을 GitHub에 첫 커밋하고 GitHub Pages로 배포합니다.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'Day 1의 모든 실습 결과물을 1개 저장소에 통합',
            'GitHub에 첫 커밋',
            'GitHub Pages 배포 → 실제 URL 확인',
          ] },

          { subtitle: '단계 1 · 저장소 준비 (5분)' },
          { code: { lang: 'bash', content: `# Vite 프로젝트가 없다면 생성
npm create vite@latest day1-labs -- --template react-ts
cd day1-labs
npm install
npm run dev    # 확인

# Day 1 실습 결과들을 src/pages/ 아래에 정리
# Practice1.tsx (Cursor 첫 작업)
# Practice2.tsx (도구 비교 결과)
# Practice3.tsx (거대 vs 분할)
# Practice4.tsx (검수 체크리스트)
# Practice5.tsx (협업 워크플로우)
# Practice6.tsx (실패 시뮬레이션)
# Index.tsx (모든 실습 링크)` } },

          { subtitle: '단계 2 · Git 초기화 + 첫 커밋 (5분)' },
          { code: { lang: 'bash', content: `# Git 초기화
git init
git branch -M main

# .gitignore 확인 (Vite가 자동 생성)
cat .gitignore
# node_modules
# dist
# .env.local

# 첫 커밋
git add .
git commit -m "init: Day 1 실습 결과물 통합"

# GitHub 저장소 생성 (브라우저)
# github.com/new → "day1-vibe-labs" → Create

# 원격 연결 + 푸시
git remote add origin https://github.com/<your-username>/day1-vibe-labs.git
git push -u origin main` } },

          { subtitle: '단계 3 · gh-pages 셋업 (10분)' },
          { code: { lang: 'bash', content: `# 패키지 설치
npm install -D gh-pages

# package.json 스크립트 추가
"scripts": {
  "dev":     "vite",
  "build":   "tsc -b && vite build",
  "predeploy": "npm run build",
  "deploy":  "gh-pages -d dist"
}

# vite.config.ts — base 설정
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/day1-vibe-labs/',   // 저장소 이름
});

# 빌드 + 배포
npm run deploy` } },

          { subtitle: '단계 4 · GitHub Pages 활성화 (5분)' },
          { items: [
            'GitHub 저장소 → Settings → Pages',
            'Source: Deploy from a branch',
            'Branch: gh-pages, Folder: / (root)',
            'Save 클릭',
            '약 1~3분 대기',
            '결과 URL: https://<your-username>.github.io/day1-vibe-labs/',
          ] },

          { subtitle: '단계 5 · 동작 확인 (5분)' },
          { items: [
            '브라우저에서 URL 접속',
            '모든 실습 페이지 정상 표시 확인',
            'Lighthouse 점수 측정 (Mobile 80+)',
            'README에 Live Demo URL 추가',
            'GitHub 저장소 Star (자기 응원)',
          ] },

          { subtitle: '확장 과제 (시간 남으면)' },
          { items: [
            '404 페이지 추가',
            '메타 태그 + favicon',
            '본인 LinkedIn에 "Day 1 실습 완료" 게시',
            '동기들과 URL 공유 + 피드백',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ GitHub에 첫 커밋 성공',
            '☐ GitHub Pages URL 접근 가능',
            '☐ 6개 실습 결과 모두 페이지로 정리',
            '☐ README 작성',
            '☐ 빈 화면·404 없음',
          ] },
        ],
      },

      {
        id: 'reg-1-troubleshooting',
        title: '트러블슈팅 & 자주 발생하는 문제',
        icon: '🔧',
        summary: 'Cursor 동작 안 됨, AI 응답 부정확, 비용 폭증 등 바이브코딩 도입 초기 흔히 마주치는 12가지 문제와 해결법.',
        content: [
          { subtitle: '문제 카탈로그 — 12가지 흔한 케이스' },
          { table: {
            headers: ['#', '증상', '원인', '해결'],
            rows: [
              ['1', 'Cursor 채팅이 응답 안 함', 'API 한도/네트워크', 'Settings → Models → 한도 확인'],
              ['2', '코드 자동완성 안 뜸', 'Copilot 비활성', '하단바 Copilot 아이콘 확인'],
              ['3', '"존재하지 않는 함수" 호출', '환각', '공식 docs로 검증'],
              ['4', '한국어 → 영어 응답', 'system 지시 부족', '"한국어로만 답하라" 명시'],
              ['5', '코드가 너무 길어짐', '한 번에 너무 많이 요구', '작업 분할'],
              ['6', 'AI가 본인 코드 무시', '컨텍스트 누락', '@파일명으로 명시적 첨부'],
              ['7', 'TypeScript 에러 안 잡힘', 'tsconfig 미설정', 'strict: true 활성화'],
              ['8', 'API 호출 비용 폭증', '대화 무한 누적', '주기적 새 대화'],
              ['9', '같은 질문 다른 답', 'temperature 높음', '코드는 temp=0 사용'],
              ['10', '한글이 깨짐', '파일 인코딩', 'VS Code에서 UTF-8 저장'],
              ['11', '터미널이 안 열림', 'PowerShell 정책', 'Cursor 설정에서 셸 변경'],
              ['12', 'AI가 갑자기 영문 코드 주석', 'system 누락', '"주석은 한국어로" 명시'],
            ],
          } },

          { subtitle: '문제 1 상세 — API 한도 확인' },
          { code: { lang: 'text', content: `Cursor 메뉴: Cmd/Ctrl+Shift+J → "Settings" → Models

확인 사항:
- 현재 사용 모델 (claude-3.5-sonnet, gpt-4 등)
- 월 한도 진행률 (Pro 플랜은 500 fast requests/월)
- API Mode 활성 여부 (Pro 한도 초과 시 사용)
- Anthropic/OpenAI 직접 키 입력 가능 (BYOK)` } },

          { subtitle: '문제 3 상세 — 환각 대응 5단계' },
          { items: [
            '1단계: 의심 — "정말 이 함수가 존재하는가?" 의구심 갖기',
            '2단계: 검증 — 공식 docs에서 검색',
            '3단계: 실행 — 실제 호출해서 동작 확인',
            '4단계: 학습 데이터 시점 인지 — 2024년 이후 등장 라이브러리는 환각 가능성↑',
            '5단계: AI에게 재확인 — "정말 React 19에 이 Hook 있나?" 직접 묻기',
          ] },

          { subtitle: '문제 8 상세 — 비용 폭증 방지' },
          { code: { lang: 'text', content: `[비용 모니터링 루틴]

매일 1회:
- Cursor: Settings → Usage 확인
- API 직접 사용 시: 각 콘솔에서 일일 사용량 체크

주간:
- 어떤 작업에서 토큰이 많이 소비되었는지 분석
- 비효율적 패턴 발견 시 개선
  → 예: 매번 큰 파일 첨부 → 필요한 부분만 발췌
  → 예: 100턴 대화 → 50턴마다 새 시작

월간:
- 도구별 비용 vs 가치 평가
- ROI 낮은 도구는 구독 해지` } },

          { subtitle: '에러 메시지로 AI에게 도움 요청하는 법' },
          { code: { lang: 'text', content: `[좋은 에러 보고 예시]

발생 상황:
  npm run dev 실행 시점

전체 에러 메시지:
  \`\`\`
  TypeError: Cannot read properties of undefined (reading 'map')
    at Counter (src/components/Counter.tsx:15:22)
  \`\`\`

해당 코드:
  \`\`\`tsx
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
  \`\`\`

추가 정보:
  items는 props로 받음. 부모에서 fetch 결과로 setItems 호출.

질문:
  items가 undefined인 케이스를 가장 단순하게 방어하는 방법은?` } },

          { subtitle: '디버깅 의사결정 트리' },
          { code: { lang: 'text', content: `에러 발생
   │
   ▼
재현 가능한가?
   ├─ 예 → ① 에러 메시지 정확히 복사 → ② AI에게 위 양식대로 보고
   └─ 아니오 → 더 많은 정보 수집 (DevTools, 콘솔, 네트워크)
   │
   ▼
AI 답변 받음
   │
   ▼
설명이 합리적인가?
   ├─ 예 → 적용 → 재현되지 않으면 종결
   └─ 아니오 → 후속 질문 또는 다른 AI/검색` } },
        ],
      },

      {
        id: 'reg-1-resources',
        title: '심화 자료 + 평가',
        icon: '📚',
        summary: '바이브코딩 학습을 이어갈 수 있는 도서·강의·블로그·커뮤니티 큐레이션 + Day 1 학습 효과 자가 평가.',
        content: [
          { subtitle: '도서 (한국어)' },
          { items: [
            '『클린 코드』 로버트 마틴 — AI 시대에도 변하지 않는 코드 미학',
            '『리팩토링 2판』 마틴 파울러 — AI 코드를 본인 코드로 정제하는 도구',
            '『실용주의 프로그래머』 — 도구를 다루는 개발자의 자세',
            '『AI 시대의 코딩』 (가제, 2026 출간 예정) — 한국어 바이브코딩 본격 교재',
          ] },

          { subtitle: '강의 (무료/유료)' },
          { items: [
            '노마드코더 "Cursor 완전 정복" (유료)',
            '인프런 "AI 개발자처럼 코딩하기" (유료)',
            'YouTube "Theo - t3.gg" (영문, 무료) — 비판적 시각',
            'YouTube "Fireship" (영문, 무료) — 빠른 트렌드 캡처',
            'Andrej Karpathy "Build LLM from Scratch" (영문, 무료) — 깊은 이해',
          ] },

          { subtitle: '블로그·뉴스레터' },
          { items: [
            'simonwillison.net — AI/LLM 일일 업데이트',
            'every.to/p/superorganizers — AI 도구 실전 활용',
            '한국어: 잡고AI 뉴스레터 (주간)',
            '한국어: tilnote.io 개발자 블로그 모음',
            'Hacker News: news.ycombinator.com (AI 관련 토론)',
          ] },

          { subtitle: '커뮤니티' },
          { items: [
            'Discord: Cursor 공식 (cursor.com/community)',
            'Discord: Anthropic 공식',
            'GitHub Discussions: 각 도구 저장소',
            '한국어: 페이스북 "AI 개발자 모임"',
            '한국어: 슬랙 "한국 LLM 개발자 모임"',
          ] },

          { subtitle: '실전 프로젝트 아이디어 (다음 학습용)' },
          { items: [
            '개인 일정 관리 + AI 시간표 추천',
            'YouTube 영상 요약 봇',
            '개인 가계부 + AI 지출 분석',
            '독서 노트 + AI 인용 검색',
            '한국 시사 뉴스 일일 브리핑',
            '코딩 인터뷰 문제 + AI 코칭',
          ] },

          { subtitle: 'Day 1 학습 효과 자가 평가' },
          { table: {
            headers: ['역량', '1점 (못함)', '3점 (보통)', '5점 (잘함)'],
            rows: [
              ['바이브코딩 개념 설명', '"AI가 코드 짜줌"', '주요 도구·패턴 1~2개', '인지부하 등 이론적 배경'],
              ['Cursor 단축키 사용', '메뉴로만', '5개 이상 단축키', '15개 이상 + custom'],
              ['컨텍스트 주입', '바로 질문', '프로젝트 정보 일부', '7원칙 적용'],
              ['검수 능력', '그대로 사용', '명백한 오류만 발견', '5단계 체크리스트 적용'],
              ['실패 회피', '경험 없음', '1~2개 패턴 인지', '5대 사례 + 본인 대응책'],
            ],
          } },

          { subtitle: '다음 단계' },
          { text: 'Day 1을 통과했다면 Day 2~3으로 HTML/CSS/JavaScript 기본기를, Day 4~6으로 React + Supabase 풀스택을, Day 7~8로 AI 서비스 설계 + LLM API를, Day 9~13으로 실제 팀 프로젝트를 진행합니다. 본 Day 1의 7가지 협업 패턴이 모든 후속 일자에서 반복 적용됩니다.' },
        ],
      },
    ],
  },

  {
    id: 'reg-2',
    title: 'Day 2 · HTML/CSS 기초',
    icon: '🌐',
    description: '시맨틱 HTML, CSS 박스 모델, Flexbox·Grid, 미디어 쿼리를 코드 예제와 함께 학습합니다. AI에게 효과적으로 CSS 작성을 요청하는 패턴도 함께 익힙니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'HTML 시맨틱 태그 + 박스 모델', '포트폴리오 골격 HTML'],
          ['S2', '50분', 'Flexbox 정복', '상단 네비게이션 바'],
          ['S3', '50분', 'Grid + 반응형', '카드 갤러리 (3열→1열)'],
          ['S4', '50분', '다크모드 + AI에게 CSS 요청', '완성된 포트폴리오 페이지'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        '시맨틱 HTML 태그를 의미에 맞게 사용한다',
        'CSS 박스 모델·선택자·우선순위를 이해한다',
        'Flexbox와 Grid의 적합한 사용 시점을 구분한다',
        '미디어 쿼리로 반응형 디자인을 구현한다',
      ] },

      { subtitle: '시맨틱 태그 — "div의 무덤"에서 벗어나기' },
      { table: {
        headers: ['태그', '의미', '용도'],
        rows: [
          ['<header>', '페이지/섹션 머리', '로고, 네비게이션'],
          ['<nav>', '주요 탐색 링크', '상단 메뉴'],
          ['<main>', '본문 영역 (1개만)', '페이지의 핵심 콘텐츠'],
          ['<article>', '독립된 콘텐츠 단위', '블로그 글, 뉴스 기사'],
          ['<section>', '주제별 그룹화', '"기능 소개", "FAQ" 등'],
          ['<aside>', '부가 콘텐츠', '사이드바, 광고'],
          ['<footer>', '하단 정보', '저작권, 연락처'],
        ],
      } },

      { subtitle: '시맨틱 HTML 예시' },
      { code: { lang: 'html', content: `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>AI Reboot Academy</title>
</head>
<body>
  <header>
    <h1>AI Reboot Academy</h1>
    <nav>
      <a href="/about">소개</a>
      <a href="/curriculum">커리큘럼</a>
    </nav>
  </header>

  <main>
    <article>
      <h2>국내 LLM 활용 가이드</h2>
      <p>Solar API로 시작하는 한국어 챗봇…</p>
    </article>
  </main>

  <footer>
    <p>© 2026 DreamIT Biz</p>
  </footer>
</body>
</html>` } },

      { subtitle: 'CSS 박스 모델' },
      { text: '모든 요소는 4겹 박스(content · padding · border · margin)로 구성됩니다. 기본적으로 width/height는 content만 의미하므로 padding+border를 더하면 실제 폭이 늘어납니다. 직관과 다른 동작 때문에 box-sizing: border-box를 전역 적용하는 것이 표준입니다.' },
      { code: { lang: 'css', content: `/* 글로벌 박스 모델 정규화 */
*, *::before, *::after {
  box-sizing: border-box;
}

.card {
  width: 320px;
  padding: 20px;     /* border-box: 안쪽으로 포함, 총 폭은 그대로 320 */
  border: 1px solid #e5e7eb;
  margin: 16px;      /* 바깥쪽 간격 — 인접 요소 영향 */
}` } },

      { subtitle: 'Flexbox 핵심' },
      { code: { lang: 'css', content: `/* 가로 정렬 + 세로 가운데 + 간격 */
.toolbar {
  display: flex;
  flex-direction: row;       /* 기본값. 가로 정렬 */
  justify-content: space-between;  /* 주축 정렬 */
  align-items: center;       /* 교차축 정렬 */
  gap: 16px;
}

/* 자식 요소가 남은 공간을 차지 */
.toolbar .spacer { flex: 1; }` } },

      { subtitle: 'Grid 핵심' },
      { code: { lang: 'css', content: `/* 3열 카드 그리드, 자동 줄바꿈 */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 반응형 — 최소 280px 이상일 때 자동으로 열 수 조절 */
.cards-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}` } },

      { subtitle: 'Flexbox vs Grid — 언제 어느 것을?' },
      { table: {
        headers: ['상황', '추천', '이유'],
        rows: [
          ['1차원 정렬 (가로 메뉴)', 'Flexbox', '한 방향 정렬에 최적화'],
          ['2차원 레이아웃 (대시보드)', 'Grid', '행+열 동시 제어'],
          ['카드 자동 줄바꿈', 'Grid (auto-fit)', '반응형이 더 깔끔'],
          ['컴포넌트 내부 정렬', 'Flexbox', '간단하고 직관적'],
        ],
      } },

      { subtitle: '반응형 — 미디어 쿼리 표준 브레이크포인트' },
      { code: { lang: 'css', content: `/* 모바일 퍼스트 — 기본은 모바일, 위로 확장 */
.container {
  padding: 16px;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* 데스크탑 이상 */
@media (min-width: 1024px) {
  .container { padding: 40px; max-width: 1280px; margin: 0 auto; }
}` } },
      { callout: { type: 'tip', text: '모바일 퍼스트가 표준입니다. 기본 스타일에는 가장 단순한(모바일) 레이아웃을 두고, min-width로 큰 화면 확장을 추가하면 CSS가 단순해집니다.' } },

      { subtitle: 'AI에게 CSS 요청할 때 효과적인 표현' },
      { items: [
        '"좋게 만들어줘" ✗ → "Flexbox로 가로 정렬, 양 끝 정렬, 간격 16px" ○',
        '"반응형으로" ✗ → "768px 미만 1열, 768~1023 2열, 1024 이상 3열" ○',
        '"색 바꿔줘" ✗ → "Primary는 #0046C8, Hover시 #002E8A로" ○',
        '디자인 시스템 변수 명시 — "var(--text-primary) 사용"',
      ] },

      { subtitle: 'CSS 선택자 우선순위' },
      { table: {
        headers: ['우선순위', '선택자', '점수 (Specificity)'],
        rows: [
          ['1 (최고)', '인라인 스타일 + !important', '∞'],
          ['2', 'ID 선택자 (#header)', '100'],
          ['3', '클래스·속성·가상클래스', '10'],
          ['4', '태그·가상요소', '1'],
          ['5 (최저)', '전체 선택자 (*)', '0'],
        ],
      } },
      { callout: { type: 'warn', text: '!important는 마지막 수단. 남용하면 디버깅 지옥. CSS Module이나 CSS-in-JS로 스코프를 분리하면 우선순위 문제 자체가 줄어듭니다.' } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "div만 써도 동작은 되는데 왜 시맨틱 태그?" — 접근성(스크린리더), SEO, 코드 가독성. 시각장애인이나 검색엔진은 <main>·<nav>로 구조를 이해.',
        'Q. "Flexbox와 Grid 둘 다 알아야 하나요?" — 네. 1차원은 Flex, 2차원은 Grid라는 원칙만 기억하면 충분.',
        'Q. "Tailwind CSS 안 쓰나요?" — 본 과정은 기초가 목적이라 순수 CSS. 익숙해진 뒤 Tailwind 도입은 자연스러움.',
        'Q. "vw·vh·rem·em 무엇을 쓰나요?" — 기본 px·rem, 화면 비율은 vw/vh. em은 부모 의존이라 예측 어려움 — 신중히 사용.',
        'Q. "다크모드 어떻게 구현하나요?" — CSS 변수 + [data-theme="dark"] 셀렉터. JS로 body에 data-theme 토글.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. <main> 태그는 한 페이지에 몇 개까지 허용되나?',
        '2. Flexbox에서 가로 정렬을 양 끝으로 분산하는 justify-content 값은?',
        '3. Grid에서 "최소 280px씩, 가능한 한 많은 열로 자동 분할"하는 속성은?',
        '4. 모바일 퍼스트의 의미는?',
        '5. CSS 우선순위에서 ID와 클래스 중 더 강한 것은?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) 1개  2) space-between  3) grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))  4) 기본 스타일은 모바일, min-width 미디어 쿼리로 큰 화면 확장  5) ID (10배 강함)' } },

      { subtitle: '참고 자료' },
      { items: [
        'MDN: developer.mozilla.org/ko/docs/Web/CSS (CSS 표준 문서)',
        'CSS Tricks: css-tricks.com/snippets/css/a-guide-to-flexbox',
        'Grid Garden: cssgridgarden.com (게임으로 Grid 학습)',
        'Flexbox Froggy: flexboxfroggy.com (게임으로 Flex 학습)',
        '한국어 강의: 코딩애플 YouTube, 노마드코더',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        '시맨틱 HTML로 본인 포트폴리오 페이지 골격 작성',
        'Flexbox로 상단 네비게이션 바 구현 (로고-메뉴-CTA 3분할)',
        'Grid로 프로젝트 카드 갤러리 (3열 → 모바일에서 1열)',
        'CSS 변수로 다크모드 토글 구현',
        'AI에게 "iOS 스타일 카드 디자인"을 요청하고 검토 후 적용',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 3에서는 정적인 페이지에 상호작용을 더하는 JavaScript를 학습합니다. 변수·함수부터 비동기 처리까지, React를 다루기 위한 기반을 다집니다.' },
    ],
    subSections: [
      {
        id: 'reg-2-html',
        title: 'HTML 시맨틱 완전 정복',
        icon: '📄',
        summary: 'div의 무덤에서 벗어나기 — 시맨틱 태그 22종 완전 정리, 접근성·SEO 효과 측정, 실제 페이지 구조 작성 패턴.',
        content: [
          { subtitle: '시맨틱 태그 22종 전체 카탈로그' },
          { table: {
            headers: ['카테고리', '태그', '의미'],
            rows: [
              ['문서 구조', '<header>', '페이지/섹션 머리 영역'],
              ['문서 구조', '<nav>', '주요 탐색 링크 모음'],
              ['문서 구조', '<main>', '본문 영역 (한 페이지 1개)'],
              ['문서 구조', '<article>', '독립된 콘텐츠 단위'],
              ['문서 구조', '<section>', '주제별 그룹화'],
              ['문서 구조', '<aside>', '부가 콘텐츠 (사이드바)'],
              ['문서 구조', '<footer>', '하단 정보 (저작권, 연락처)'],
              ['텍스트', '<h1>~<h6>', '제목 계층'],
              ['텍스트', '<p>', '단락'],
              ['텍스트', '<blockquote>', '인용문'],
              ['텍스트', '<cite>', '인용 출처'],
              ['텍스트', '<time>', '날짜·시간 (machine readable)'],
              ['텍스트', '<address>', '연락처 정보'],
              ['미디어', '<figure>', '독립 미디어 + 캡션'],
              ['미디어', '<figcaption>', '미디어 캡션'],
              ['미디어', '<picture>', '반응형 이미지'],
              ['상호작용', '<details>', '접고 펴는 영역'],
              ['상호작용', '<summary>', 'details의 표시 부분'],
              ['상호작용', '<dialog>', '모달 다이얼로그'],
              ['목록', '<dl>', '정의 목록 (term-description)'],
              ['목록', '<dt>', '용어'],
              ['목록', '<dd>', '용어의 정의'],
            ],
          } },

          { subtitle: '시맨틱 레이아웃 한눈에 보기 (표준 페이지 영역)' },
          { svg: `<svg viewBox="0 0 600 440" role="img" aria-label="시맨틱 태그로 구성한 표준 웹페이지 레이아웃" style="width:100%;max-width:620px;height:auto;font-family:system-ui,-apple-system,sans-serif">
  <rect x="4" y="4" width="592" height="432" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="16" y="16" width="568" height="50" rx="6" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="28" y="37" font-family="ui-monospace,monospace" font-size="15" font-weight="700" fill="#1e3a8a">&lt;header&gt;</text>
  <text x="120" y="37" font-size="12" fill="#1e40af">로고 · 사이트 제목 · &lt;h1&gt;</text>
  <rect x="16" y="72" width="568" height="40" rx="6" fill="#e0e7ff" stroke="#6366f1"/>
  <text x="28" y="97" font-family="ui-monospace,monospace" font-size="15" font-weight="700" fill="#3730a3">&lt;nav&gt;</text>
  <text x="96" y="97" font-size="12" fill="#4338ca">주요 탐색 메뉴 (메뉴 링크 모음)</text>
  <rect x="16" y="118" width="404" height="256" rx="6" fill="#ecfdf5" stroke="#10b981"/>
  <text x="28" y="137" font-family="ui-monospace,monospace" font-size="15" font-weight="700" fill="#065f46">&lt;main&gt;</text>
  <rect x="30" y="148" width="376" height="212" rx="6" fill="#d1fae5" stroke="#059669"/>
  <text x="42" y="167" font-family="ui-monospace,monospace" font-size="13" font-weight="700" fill="#047857">&lt;article&gt;</text>
  <rect x="44" y="178" width="348" height="80" rx="5" fill="#a7f3d0" stroke="#10b981"/>
  <text x="56" y="202" font-family="ui-monospace,monospace" font-size="12" font-weight="700" fill="#065f46">&lt;section&gt;</text>
  <text x="150" y="202" font-size="11" fill="#065f46">주제 그룹 1 · &lt;h2&gt; &lt;p&gt;</text>
  <rect x="44" y="266" width="348" height="84" rx="5" fill="#a7f3d0" stroke="#10b981"/>
  <text x="56" y="290" font-family="ui-monospace,monospace" font-size="12" font-weight="700" fill="#065f46">&lt;section&gt;</text>
  <text x="150" y="290" font-size="11" fill="#065f46">주제 그룹 2 · &lt;figure&gt;</text>
  <rect x="428" y="118" width="156" height="256" rx="6" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="440" y="138" font-family="ui-monospace,monospace" font-size="14" font-weight="700" fill="#92400e">&lt;aside&gt;</text>
  <text x="440" y="160" font-size="11" fill="#b45309">보조 정보</text>
  <text x="440" y="178" font-size="11" fill="#b45309">사이드바 · 광고</text>
  <text x="440" y="196" font-size="11" fill="#b45309">관련 링크</text>
  <rect x="16" y="380" width="568" height="48" rx="6" fill="#ede9fe" stroke="#8b5cf6"/>
  <text x="28" y="408" font-family="ui-monospace,monospace" font-size="15" font-weight="700" fill="#5b21b6">&lt;footer&gt;</text>
  <text x="130" y="408" font-size="12" fill="#6d28d9">저작권 · 연락처 · &lt;address&gt;</text>
</svg>` },
          { callout: { type: 'tip', text: '실제 페이지는 위 영역 구조를 그대로 태그로 옮기면 됩니다. div 대신 의미 있는 태그(header·nav·main·aside·footer)를 쓰면 스크린리더·검색엔진이 구조를 이해합니다.' } },

          { subtitle: '실전 페이지 구조 — 4개 표준 템플릿' },
          { code: { lang: 'html', content: `<!-- 템플릿 1 · 회사 홈페이지 -->
<body>
  <header>
    <h1>DreamIT Biz</h1>
    <nav>
      <a href="/about">소개</a>
      <a href="/services">서비스</a>
      <a href="/contact">문의</a>
    </nav>
  </header>

  <main>
    <section id="hero">
      <h2>AI 교육의 새 기준</h2>
      <p>전문가가 직접 운영하는 4주 부트캠프</p>
    </section>

    <section id="programs">
      <h2>프로그램</h2>
      <article>
        <h3>AI Reboot Academy</h3>
        <p>...</p>
      </article>
    </section>
  </main>

  <footer>
    <p>© 2026 DreamIT Biz. All rights reserved.</p>
    <address>aebon@dreamitbiz.com</address>
  </footer>
</body>` } },
          { code: { lang: 'html', content: `<!-- 템플릿 2 · 블로그 글 -->
<body>
  <header><nav>...</nav></header>
  <main>
    <article>
      <header>
        <h1>바이브코딩의 5가지 원칙</h1>
        <p>By 이애본 · <time datetime="2026-05-27">2026년 5월 27일</time></p>
      </header>

      <p>본문 첫 단락...</p>

      <section>
        <h2>1. 컨텍스트 주입</h2>
        <p>...</p>
      </section>

      <footer>
        <p>태그: AI, 바이브코딩</p>
      </footer>
    </article>

    <aside>
      <h2>관련 글</h2>
      <ul>...</ul>
    </aside>
  </main>
  <footer>...</footer>
</body>` } },

          { subtitle: 'ARIA 속성 — 시맨틱이 부족할 때' },
          { items: [
            'role — 요소의 역할 명시 (role="button"으로 div도 버튼처럼)',
            'aria-label — 화면에 표시 안 되는 이름',
            'aria-labelledby — 다른 요소를 이름으로 참조',
            'aria-describedby — 추가 설명 연결',
            'aria-hidden — 스크린리더가 무시',
            'aria-live — 동적 변경 알림 (polite / assertive)',
          ] },
          { callout: { type: 'tip', text: '"네이티브 HTML 시맨틱이 ARIA보다 항상 낫다" — W3C 1순위 규칙. <button>이 있으면 <div role="button">을 쓰지 마세요.' } },

          { subtitle: '접근성 자가 점검 10개' },
          { items: [
            '1. <h1>이 페이지에 1개만 있는가?',
            '2. 제목 계층(h1→h2→h3)이 순서대로인가?',
            '3. 이미지에 alt 속성이 있는가?',
            '4. 폼 요소에 <label>이 연결되었는가?',
            '5. 버튼은 <button>으로, 링크는 <a>로 사용했는가?',
            '6. 색만으로 정보를 전달하지 않는가?',
            '7. 키보드 Tab으로 모든 인터랙티브 요소 접근 가능?',
            '8. 포커스 표시(outline)가 명확한가?',
            '9. 텍스트와 배경의 대비 4.5:1 이상?',
            '10. lang 속성이 <html>에 있는가?',
          ] },

          { subtitle: 'SEO 효과 — 시맨틱 → 검색 순위' },
          { text: 'Google·Naver 크롤러는 시맨틱 태그로 페이지 구조를 이해합니다. <article>로 감싸진 본문은 단순 <div>보다 검색 결과에서 상위에 노출될 가능성이 높습니다.' },
          { code: { lang: 'html', content: `<!-- SEO 메타 태그 표준 세트 -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="페이지 요약 (160자 이내)" />
  <meta name="author" content="작성자" />

  <!-- Open Graph (SNS 공유) -->
  <meta property="og:title" content="제목" />
  <meta property="og:description" content="요약" />
  <meta property="og:image" content="https://example.com/og.png" />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />

  <!-- 정규 URL -->
  <link rel="canonical" href="https://example.com/page" />
</head>` } },

          { subtitle: '실습 과제' },
          { items: [
            '본인 포트폴리오 페이지를 4개 표준 템플릿 중 1개 골라 시맨틱 HTML로 작성',
            'Chrome 확장 "axe DevTools" 설치 후 접근성 점수 측정 → 90+ 달성',
            'Lighthouse SEO 점수 95+ 달성',
            '본인 페이지를 화면 잠그고 키보드만으로 탐색 가능 확인',
          ] },
        ],
      },

      {
        id: 'reg-2-flex',
        title: 'Flexbox 완전 정복',
        icon: '↔️',
        summary: 'CSS Flexbox의 모든 속성을 정렬 시각화·실전 패턴 12종·디버깅 도구와 함께 마스터.',
        content: [
          { subtitle: 'Flexbox는 1차원 레이아웃' },
          { text: 'Flexbox는 가로 또는 세로 한 방향(axis)으로 요소를 정렬·분배합니다. 2차원(행+열)은 Grid의 영역. "한 줄에 가로로" 같은 단순 정렬은 Flexbox가 압도적으로 직관적입니다.' },

          { subtitle: 'Flex 부모(Container) 속성 6종' },
          { table: {
            headers: ['속성', '값', '의미'],
            rows: [
              ['display', 'flex / inline-flex', 'Flex 컨테이너 활성화'],
              ['flex-direction', 'row / column / row-reverse / column-reverse', '주축 방향'],
              ['flex-wrap', 'nowrap / wrap / wrap-reverse', '한 줄 넘침 처리'],
              ['justify-content', 'flex-start / center / space-between / space-around / space-evenly', '주축 정렬'],
              ['align-items', 'stretch / center / flex-start / flex-end / baseline', '교차축 정렬'],
              ['gap', '<length>', '요소 간 간격 (margin 대체)'],
            ],
          } },

          { subtitle: 'Flex 자식(Item) 속성 6종' },
          { table: {
            headers: ['속성', '값', '의미'],
            rows: [
              ['flex-grow', '0 / 양수', '여유 공간 분배 비율'],
              ['flex-shrink', '0 / 양수', '부족 시 축소 비율'],
              ['flex-basis', 'auto / <length>', '기본 크기'],
              ['flex', '<grow> <shrink> <basis>', '위 3개 단축'],
              ['align-self', 'auto / stretch / center / ...', '개별 교차축 정렬'],
              ['order', '<integer>', '시각적 순서 변경'],
            ],
          } },

          { subtitle: '실전 패턴 12종' },
          { code: { lang: 'css', content: `/* 1. 가로 메뉴 - 양 끝 정렬 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 2. 가운데 정렬 (수직+수평) */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* 3. 사이드바 + 본문 */
.layout {
  display: flex;
  gap: 24px;
}
.sidebar { flex: 0 0 250px; }   /* 고정 너비 */
.main    { flex: 1; }           /* 나머지 */

/* 4. 카드 동일 높이 */
.cards {
  display: flex;
  gap: 16px;
  align-items: stretch;         /* 기본값, 명시적 */
}` } },

          { code: { lang: 'css', content: `/* 5. 푸터 하단 고정 (sticky footer) */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main { flex: 1; }              /* 남는 공간 차지 */

/* 6. 입력 + 버튼 한 줄 */
.search {
  display: flex;
  gap: 8px;
}
.search input { flex: 1; }
.search button { flex-shrink: 0; }

/* 7. 자동 줄바꿈 태그 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 8. 모바일에서 세로로 */
.row {
  display: flex;
  gap: 16px;
}
@media (max-width: 768px) {
  .row { flex-direction: column; }
}` } },

          { code: { lang: 'css', content: `/* 9. 첫 번째만 강조 (order) */
.list { display: flex; }
.list .pinned { order: -1; }    /* 다른 모든 요소보다 앞 */

/* 10. 카드의 텍스트 영역만 늘이기 */
.card {
  display: flex;
  flex-direction: column;
}
.card .body { flex: 1; }        /* 카드 높이가 다양해도 푸터 정렬 */

/* 11. 동일 너비 컬럼 N개 */
.equal-cols {
  display: flex;
  gap: 16px;
}
.equal-cols > * { flex: 1; }    /* 모두 1:1:1 */

/* 12. 비율 분할 (2:1) */
.split {
  display: flex;
  gap: 16px;
}
.split .main  { flex: 2; }
.split .aside { flex: 1; }` } },

          { subtitle: '디버깅 — Chrome DevTools Flex 인스펙터' },
          { items: [
            'DevTools → Elements → 요소 선택',
            '"flex" 배지 클릭 (요소 옆에 표시됨)',
            'Flex 컨테이너 시각화 — 주축·교차축 표시',
            'justify-content·align-items를 GUI로 변경하며 즉시 확인',
            'flex-direction 토글 버튼',
          ] },

          { subtitle: '흔한 함정 5가지' },
          { table: {
            headers: ['함정', '증상', '해결'],
            rows: [
              ['min-width: auto', '자식이 부모 밖으로', '명시적 min-width: 0'],
              ['gap 지원 안됨', '구식 브라우저', 'margin: 0 8px 8px 0 대체'],
              ['flex-shrink 의도치 않음', '이미지가 작아짐', '아이콘에 flex-shrink: 0'],
              ['중첩 시 align-self 무시', 'flex 안 flex', 'align-self 명시'],
              ['order 접근성 깨짐', 'tab 순서가 시각과 다름', 'DOM 순서 유지'],
            ],
          } },

          { subtitle: '실습 과제' },
          { items: [
            '12개 패턴을 모두 직접 코딩 + 동작 확인',
            'Flexbox Froggy (flexboxfroggy.com) 24레벨 완주',
            '본인 포트폴리오의 상단 네비게이션을 Flexbox로 재구성',
            '"카드가 동일 높이" 패턴으로 프로젝트 카드 갤러리',
          ] },
        ],
      },

      {
        id: 'reg-2-grid',
        title: 'CSS Grid 완전 정복',
        icon: '⊞',
        summary: '2차원 레이아웃의 절대 강자 Grid — 12 컬럼 시스템·자동 줄바꿈·grid-template-areas까지 모든 기법 학습.',
        content: [
          { subtitle: 'Grid가 Flexbox보다 강력한 시나리오' },
          { items: [
            '대시보드처럼 행+열 동시 제어가 필요한 경우',
            '카드 갤러리에서 화면 크기에 따라 자동 줄바꿈',
            '12 컬럼 그리드 시스템 (Bootstrap 등)',
            '복잡한 매거진 스타일 레이아웃',
            'grid-template-areas로 시각적 영역 정의',
          ] },

          { subtitle: 'Grid 부모 속성 핵심 10종' },
          { table: {
            headers: ['속성', '예', '의미'],
            rows: [
              ['display', 'grid', '활성화'],
              ['grid-template-columns', 'repeat(3, 1fr)', '열 정의'],
              ['grid-template-rows', 'auto 1fr auto', '행 정의'],
              ['grid-template-areas', '"header header" "nav main"', '영역 이름'],
              ['gap', '20px', '셀 간격'],
              ['column-gap', '20px', '열 간격만'],
              ['row-gap', '12px', '행 간격만'],
              ['justify-items', 'start / center / end / stretch', '셀 안 가로 정렬'],
              ['align-items', '동일', '셀 안 세로 정렬'],
              ['place-items', 'center', 'justify+align 단축'],
            ],
          } },

          { subtitle: '실전 패턴 — 12 컬럼 시스템' },
          { code: { lang: 'css', content: `/* Bootstrap 스타일 12 컬럼 그리드 */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.col-12 { grid-column: span 12; }   /* 전체 폭 */
.col-6  { grid-column: span 6;  }   /* 절반 */
.col-4  { grid-column: span 4;  }   /* 1/3 */
.col-3  { grid-column: span 3;  }   /* 1/4 */

/* 사용 */
<div class="grid">
  <header class="col-12">상단</header>
  <nav class="col-3">사이드</nav>
  <main class="col-9">본문</main>
  <footer class="col-12">하단</footer>
</div>` } },

          { subtitle: '실전 패턴 — 자동 반응형' },
          { code: { lang: 'css', content: `/* 카드가 최소 280px 이상이면 자동으로 열 수 조절 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* auto-fit vs auto-fill 차이
   - auto-fit:  남는 공간을 기존 카드가 늘려서 차지
   - auto-fill: 남는 공간을 빈 셀로 유지 (카드가 작게 유지) */` } },

          { subtitle: '실전 패턴 — grid-template-areas' },
          { code: { lang: 'css', content: `/* 시각적으로 영역을 그리듯 정의 */
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  min-height: 100vh;
  gap: 16px;
}

.layout > header { grid-area: header; }
.layout > nav    { grid-area: nav; }
.layout > main   { grid-area: main; }
.layout > footer { grid-area: footer; }

/* 모바일에서 1열로 재배치 */
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "nav"
      "main"
      "footer";
  }
}` } },

          { subtitle: '단위 — fr / minmax / auto' },
          { table: {
            headers: ['단위', '의미', '예'],
            rows: [
              ['fr', 'fraction — 남는 공간 비율', '1fr 2fr → 1:2'],
              ['minmax(min, max)', '최소·최대 한계', 'minmax(200px, 1fr)'],
              ['auto', '콘텐츠 크기에 맞춤', '버튼·로고 등 가변 크기'],
              ['repeat(N, X)', '반복', 'repeat(3, 1fr) = 1fr 1fr 1fr'],
              ['min-content', '최소 콘텐츠 크기', '단어 단위 줄바꿈'],
              ['max-content', '최대 콘텐츠 크기', '줄바꿈 없는 너비'],
            ],
          } },

          { subtitle: 'Grid 자식 속성' },
          { code: { lang: 'css', content: `.item {
  /* 시작과 끝 라인 명시 */
  grid-column-start: 1;
  grid-column-end: 3;     /* = 1번 라인부터 3번까지 = 2칸 차지 */

  /* 단축 */
  grid-column: 1 / 3;
  grid-column: span 2;    /* 시작에서 2칸 */

  /* 행도 마찬가지 */
  grid-row: 1 / span 2;

  /* 영역 한 번에 */
  grid-area: 1 / 1 / 3 / 3;   /* row-start / col-start / row-end / col-end */
}` } },

          { subtitle: 'Grid Garden 게임으로 학습' },
          { text: 'cssgridgarden.com — Grid의 28레벨 인터랙티브 학습 게임. 1~2시간이면 완주 가능. 강의 종료 후 가정 학습용으로 적극 추천.' },

          { subtitle: '실습 과제' },
          { items: [
            '12 컬럼 시스템으로 본인 페이지 재구성',
            'auto-fit + minmax로 반응형 카드 갤러리',
            'grid-template-areas로 대시보드 레이아웃 (헤더·사이드·본문·푸터)',
            'CSS Grid Garden 28레벨 완주',
          ] },
        ],
      },

      {
        id: 'reg-2-responsive',
        title: '반응형 + 다크모드 마스터',
        icon: '📱',
        summary: '모바일 퍼스트, 표준 브레이크포인트, CSS 변수 다크모드, 시스템 설정 자동 감지까지 — 모든 사용자에게 최적 경험을 제공하는 기법.',
        content: [
          { subtitle: '모바일 퍼스트 철학' },
          { text: '2024년 기준 한국 웹 트래픽의 70% 이상이 모바일. "모바일 먼저 디자인하고 데스크탑으로 확장"하는 게 표준. 반대로 하면 거의 항상 모바일에서 무너집니다.' },
          { code: { lang: 'css', content: `/* 모바일 퍼스트 — 기본은 모바일 스타일 */
.container {
  padding: 16px;
  font-size: 14px;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    font-size: 15px;
  }
}

/* 데스크탑 이상 */
@media (min-width: 1024px) {
  .container {
    padding: 40px;
    max-width: 1280px;
    margin: 0 auto;
    font-size: 16px;
  }
}` } },

          { subtitle: '표준 브레이크포인트 (2026 기준)' },
          { table: {
            headers: ['이름', '너비', '주요 기기'],
            rows: [
              ['모바일', '< 640px', 'iPhone SE, 갤럭시 S 일반'],
              ['모바일 가로', '640~767px', 'iPhone Plus 가로'],
              ['태블릿', '768~1023px', 'iPad mini, 갤럭시 탭'],
              ['노트북', '1024~1279px', '13" 노트북, iPad Pro'],
              ['데스크탑', '1280~1535px', '일반 모니터'],
              ['대형', '≥ 1536px', '24"+ 모니터'],
            ],
          } },

          { subtitle: '뷰포트 단위 — vw / vh / svh' },
          { code: { lang: 'css', content: `/* 화면 너비/높이 비율 */
.hero {
  width: 100vw;       /* 뷰포트 너비 100% */
  height: 100vh;      /* 뷰포트 높이 100% */
}

/* 모바일 주소창 대응 — Safari 등에서 vh가 변하는 문제 */
.hero {
  height: 100svh;     /* small viewport height — 주소창 보일 때 */
  /* 또는 */
  height: 100dvh;     /* dynamic — 주소창 변화 자동 반영 */
  /* 또는 */
  height: 100lvh;     /* large — 주소창 숨김 시 */
}` } },

          { subtitle: '터치 타깃 표준' },
          { text: 'Apple Human Interface Guidelines: 최소 44×44 포인트. Google Material Design: 48×48 dp. 작으면 손가락이 인접 버튼을 잘못 누르는 빈도 증가.' },
          { code: { lang: 'css', content: `.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 0 16px;
  font-size: 15px;     /* 모바일 가독성 */
}

/* 인접 인터랙티브 요소 간 최소 8px 여백 */
.btn + .btn {
  margin-left: 8px;
}` } },

          { subtitle: '다크모드 구현 — CSS 변수 방식' },
          { code: { lang: 'css', content: `/* src/styles/theme.css */
:root {
  /* 라이트 모드 (기본) */
  --bg-primary:   #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #1a1a1a;
  --text-muted:   #6b7280;
  --border:       #e5e7eb;
  --primary:      #0046C8;
}

[data-theme="dark"] {
  /* 다크 모드 오버라이드 */
  --bg-primary:   #1a1a1a;
  --bg-secondary: #2a2a2a;
  --text-primary: #f0f0f0;
  --text-muted:   #a0a0a0;
  --border:       #3a3a3a;
  --primary:      #4A8FE7;   /* 약간 밝게 */
}

/* 컴포넌트는 변수만 참조 */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}` } },

          { subtitle: '시스템 설정 자동 감지' },
          { code: { lang: 'css', content: `/* prefers-color-scheme — 사용자 OS 설정 따르기 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    /* ... 다크 변수 ... */
  }
}` } },
          { code: { lang: 'typescript', content: `// React로 토글 + 시스템 설정 감지
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'auto'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      root.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}` } },

          { subtitle: '반응형 이미지 — srcset / picture' },
          { code: { lang: 'html', content: `<!-- srcset: 해상도별 이미지 자동 선택 -->
<img
  src="hero-1024.jpg"
  srcset="hero-640.jpg 640w, hero-1024.jpg 1024w, hero-1920.jpg 1920w"
  sizes="(max-width: 768px) 100vw, 1024px"
  alt="히어로 이미지"
/>

<!-- picture: 화면 크기별 다른 이미지 -->
<picture>
  <source media="(max-width: 768px)" srcset="hero-mobile.jpg">
  <source media="(min-width: 769px)" srcset="hero-desktop.jpg">
  <img src="hero-desktop.jpg" alt="히어로">
</picture>` } },

          { subtitle: '폰트 반응형 — clamp()' },
          { code: { lang: 'css', content: `/* 화면 크기에 따라 폰트 자동 조절 */
h1 {
  font-size: clamp(24px, 5vw, 48px);
  /* 최소 24px, 이상적 5vw, 최대 48px */
}

p {
  font-size: clamp(14px, 1.5vw, 18px);
  line-height: 1.6;
}` } },

          { subtitle: '실습 과제' },
          { items: [
            '본인 페이지를 모바일 퍼스트로 재작성',
            'CSS 변수 + data-theme로 다크모드 토글 구현',
            'prefers-color-scheme 자동 감지 추가',
            '터치 타깃 44px 이상 확보',
            'Chrome DevTools 디바이스 모드로 5개 기기에서 검증',
          ] },
        ],
      },

      {
        id: 'reg-2-practice',
        title: '실습 · 포트폴리오 페이지 (3시간)',
        icon: '🧪',
        summary: 'HTML/CSS 학습 내용을 모두 결합해 본인의 포트폴리오 페이지를 완성하는 실전 실습. 단계별 가이드 + 평가 기준 포함.',
        content: [
          { subtitle: '프로젝트 목표' },
          { text: '학습한 시맨틱 HTML · Flexbox · Grid · 반응형 · 다크모드를 모두 적용한 본인 포트폴리오 1페이지를 완성합니다. 졸업 후에도 실제 사용 가능한 결과물 확보가 목표.' },

          { subtitle: '페이지 구성 (8개 섹션)' },
          { items: [
            '1. Hero — 이름·직함·한 줄 자기소개',
            '2. About — 짧은 자기 소개 (3~4문장)',
            '3. Skills — 보유 기술 태그 (8~12개)',
            '4. Projects — 프로젝트 카드 갤러리 (3개 이상)',
            '5. Experience — 경력 또는 학력 타임라인',
            '6. Contact — 이메일·SNS 링크',
            '7. (선택) Blog — 작성한 글 목록',
            '8. Footer — 저작권·연락처',
          ] },

          { subtitle: '단계별 가이드' },
          { code: { lang: 'text', content: `[0단계 · 환경 셋업 (10분)]
- Vite 프로젝트 생성 or 기존 프로젝트 사용
- src/pages/Portfolio.tsx 신규
- src/styles/portfolio.css 신규

[1단계 · 시맨틱 HTML 골격 (30분)]
- 8개 섹션을 시맨틱 태그로 구조화
- <header>, <main>, <section>, <article>, <footer>
- 콘텐츠는 가짜 텍스트 (Lorem ipsum) 무방

[2단계 · CSS 변수 + 디자인 토큰 (20분)]
- :root에 색·간격·폰트 변수 정의
- [data-theme="dark"] 오버라이드 추가
- 모든 스타일은 변수 참조

[3단계 · 레이아웃 (60분)]
- Hero: Flexbox 가운데 정렬
- Skills: Flexbox + flex-wrap
- Projects: Grid auto-fit
- Experience: 시간순 세로 정렬

[4단계 · 반응형 (40분)]
- 모바일 퍼스트로 시작
- 768px → 2열로 변경
- 1024px → 3열 또는 그 이상
- DevTools 디바이스 모드로 검증

[5단계 · 다크모드 (20분)]
- 토글 버튼 추가
- localStorage로 설정 저장
- prefers-color-scheme 자동 감지

[6단계 · 폴리싱 (20분)]
- 호버 효과 (transition)
- 폰트·줄간격 미세 조정
- 이미지 최적화 (alt 텍스트)` } },

          { subtitle: '코드 골격 — Portfolio.tsx' },
          { code: { lang: 'tsx', content: `import { useState, useEffect } from 'react';
import './portfolio.css';

export default function Portfolio() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="portfolio">
      <header>
        <nav className="nav">
          <h1>홍길동</h1>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </header>

      <main>
        <section id="hero" className="hero">
          <h2>안녕하세요, AI 개발자 홍길동입니다</h2>
          <p>국내 LLM 활용 서비스를 만듭니다.</p>
        </section>

        <section id="skills" className="skills">
          <h2>Skills</h2>
          <div className="tags">
            {['React', 'TypeScript', 'Supabase', 'Solar API'].map(s => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </section>

        <section id="projects" className="projects">
          <h2>Projects</h2>
          <div className="grid">
            {/* 프로젝트 카드들 */}
          </div>
        </section>

        {/* 나머지 섹션 */}
      </main>

      <footer>
        <p>© 2026 홍길동. Made with bare HTML/CSS love.</p>
      </footer>
    </div>
  );
}` } },

          { subtitle: '평가 기준 (자가 채점 100점)' },
          { table: {
            headers: ['항목', '배점', '확인 방법'],
            rows: [
              ['시맨틱 HTML', '20', 'axe DevTools 점수 90+'],
              ['반응형', '20', '320px / 768px / 1280px 모두 정상'],
              ['다크모드 동작', '15', '토글 + localStorage 저장'],
              ['Grid 적용', '15', '카드 갤러리 auto-fit 사용'],
              ['Flexbox 적용', '10', '네비게이션·태그 영역'],
              ['CSS 변수 사용', '10', '하드코딩된 색·크기 0개'],
              ['접근성', '5', 'Lighthouse 90+'],
              ['배포', '5', 'GitHub Pages에 공개 URL'],
            ],
          } },

          { subtitle: '확장 과제 (시간 남으면)' },
          { items: [
            '스크롤 시 헤더 색 변경 (sticky + scroll 이벤트)',
            'IntersectionObserver로 섹션 진입 시 페이드인 애니메이션',
            '5가지 컬러 테마 토글 (파랑·빨강·녹색·보라·주황)',
            '본인 GitHub Repo 자동 연동 (Octokit)',
            'Lighthouse 4지표 모두 95+',
          ] },
        ],
      },

      {
        id: 'reg-2-practice-2',
        title: '실습 2 · Flexbox 12패턴 마스터 (45분)',
        icon: '🧪',
        summary: 'Flexbox 핵심 패턴 12개를 직접 코딩하며 1차원 레이아웃 완전 정복.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'Flexbox 12개 패턴 모두 직접 작성',
            '실제 화면에서 동작 확인',
            'AI 도움 없이 본인이 작성',
          ] },

          { subtitle: '준비 HTML' },
          { code: { lang: 'html', content: `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Flexbox 12패턴</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h2>1. 가로 메뉴 양 끝 정렬</h2>
  <div class="pattern-1">
    <span>로고</span>
    <span>메뉴</span>
    <span>CTA</span>
  </div>

  <h2>2. 가운데 정렬</h2>
  <div class="pattern-2"><span>중앙</span></div>

  <!-- 나머지 10개도 같은 패턴 -->
</body>
</html>` } },

          { subtitle: '12패턴 작성 — 한 번에 1개씩' },
          { items: [
            '패턴 1: 가로 메뉴 양 끝 정렬 (justify-content: space-between)',
            '패턴 2: 가운데 정렬 (수직+수평)',
            '패턴 3: 사이드바 + 본문 (flex: 0 0 250px / flex: 1)',
            '패턴 4: 카드 동일 높이 (align-items: stretch)',
            '패턴 5: 푸터 하단 고정 (sticky footer)',
            '패턴 6: 입력 + 버튼 한 줄 (flex: 1 / flex-shrink: 0)',
            '패턴 7: 자동 줄바꿈 태그 (flex-wrap: wrap)',
            '패턴 8: 모바일에서 세로로 (media query)',
            '패턴 9: 첫 번째만 강조 (order: -1)',
            '패턴 10: 카드 텍스트 영역만 늘이기',
            '패턴 11: 동일 너비 컬럼 N개 (flex: 1)',
            '패턴 12: 2:1 비율 분할 (flex: 2 / flex: 1)',
          ] },

          { subtitle: '체크 — Flexbox Froggy 게임' },
          { items: [
            'flexboxfroggy.com 접속',
            '24레벨 완주 (1~2시간)',
            '게임으로 학습 → 두뇌에 깊이 박힘',
            '졸업 시 점수 캡처 → 학습 노트',
          ] },

          { subtitle: '확장 과제' },
          { items: [
            'Holy Grail 레이아웃 (헤더-사이드-본문-사이드-푸터)',
            'Pinterest 스타일 카드 (높이 다름)',
            '메시지 버블 (좌/우 정렬 차이)',
            '캘린더 일주일 (균등 너비)',
          ] },
        ],
      },

      {
        id: 'reg-2-practice-3',
        title: '실습 3 · CSS Grid 12 컬럼 시스템 (40분)',
        icon: '🧪',
        summary: 'Bootstrap 스타일 12 컬럼 그리드 + auto-fit 반응형 + grid-template-areas 풀세트.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '12 컬럼 시스템 직접 구현',
            'auto-fit으로 반응형 자동화',
            'grid-template-areas로 시각적 레이아웃',
          ] },

          { subtitle: '단계 1 · 12 컬럼 시스템 (15분)' },
          { code: { lang: 'css', content: `.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.col-12 { grid-column: span 12; }
.col-9  { grid-column: span 9; }
.col-8  { grid-column: span 8; }
.col-6  { grid-column: span 6; }
.col-4  { grid-column: span 4; }
.col-3  { grid-column: span 3; }
.col-2  { grid-column: span 2; }

@media (max-width: 767px) {
  .col-9, .col-8, .col-6, .col-4, .col-3, .col-2 {
    grid-column: span 12;   /* 모바일에서 전체 폭 */
  }
}` } },

          { code: { lang: 'html', content: `<div class="grid">
  <header class="col-12">상단 헤더</header>
  <nav class="col-3">사이드바</nav>
  <main class="col-9">본문 영역</main>
  <article class="col-4">카드 1</article>
  <article class="col-4">카드 2</article>
  <article class="col-4">카드 3</article>
  <footer class="col-12">푸터</footer>
</div>` } },

          { subtitle: '단계 2 · auto-fit 반응형 (10분)' },
          { code: { lang: 'css', content: `.cards-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* 화면이 좁으면 1열, 넓으면 자동으로 여러 열 */
/* JavaScript·media query 없이 자동 */` } },

          { subtitle: '단계 3 · grid-template-areas (15분)' },
          { code: { lang: 'css', content: `.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  min-height: 100vh;
  gap: 16px;
}

.layout > header { grid-area: header; }
.layout > nav    { grid-area: nav; }
.layout > main   { grid-area: main; }
.layout > footer { grid-area: footer; }

@media (max-width: 767px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "nav"
      "main"
      "footer";
  }
}` } },

          { subtitle: '체크 — CSS Grid Garden' },
          { items: [
            'cssgridgarden.com 접속',
            '28레벨 완주 (1~2시간)',
            '본 강의 외 가정 학습용',
          ] },

          { subtitle: '확장 과제' },
          { items: [
            '대시보드 레이아웃 (카드 7개 다양한 크기)',
            '매거진 스타일 (제목 큰 카드 + 작은 카드들)',
            'Pinterest 무한 컬럼',
            '12 컬럼에 offset (col-3 + col-offset-1)',
          ] },
        ],
      },

      {
        id: 'reg-2-practice-4',
        title: '실습 4 · 다크모드 토글 + 시스템 감지 (35분)',
        icon: '🧪',
        summary: 'CSS 변수 + data-theme + localStorage + prefers-color-scheme까지 다크모드 풀세트.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'CSS 변수로 다크모드 토큰 분리',
            'JavaScript로 토글 + localStorage 저장',
            '사용자 OS 설정 자동 감지',
          ] },

          { subtitle: '단계 1 · 디자인 토큰 분리 (10분)' },
          { code: { lang: 'css', content: `/* tokens.css */
:root {
  --bg-primary:    #ffffff;
  --bg-secondary:  #f8f9fa;
  --text-primary:  #1a1a1a;
  --text-muted:    #6b7280;
  --border-color:  #e5e7eb;
  --primary:       #0046C8;
  --primary-hover: #002E8A;
}

[data-theme="dark"] {
  --bg-primary:    #1a1a1a;
  --bg-secondary:  #2a2a2a;
  --text-primary:  #f0f0f0;
  --text-muted:    #a0a0a0;
  --border-color:  #3a3a3a;
  --primary:       #4A8FE7;
  --primary-hover: #6BA3F0;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.2s, color 0.2s;
}` } },

          { subtitle: '단계 2 · 토글 버튼 + localStorage (15분)' },
          { code: { lang: 'html', content: `<button id="theme-toggle" aria-label="테마 토글">
  <span class="icon-sun">☀️</span>
  <span class="icon-moon">🌙</span>
</button>

<script>
(function() {
  const btn = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // 1) 저장된 설정 또는 OS 감지
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');

  root.setAttribute('data-theme', initial);

  // 2) 토글
  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // 3) OS 설정 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
})();
</script>` } },

          { subtitle: '단계 3 · React Hook 버전 (10분)' },
          { code: { lang: 'tsx', content: `// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'auto'
  );

  useEffect(() => {
    const root = document.documentElement;
    let applied = theme;

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applied = prefersDark ? 'dark' : 'light';
    }

    root.setAttribute('data-theme', applied);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}

// 사용
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <select value={theme} onChange={e => setTheme(e.target.value as Theme)}>
      <option value="light">☀️ 라이트</option>
      <option value="dark">🌙 다크</option>
      <option value="auto">⚙️ 시스템</option>
    </select>
  );
}` } },

          { subtitle: '확장 과제' },
          { items: [
            '깜빡임 방지 — HTML head에 즉시 적용 스크립트',
            '5색 컬러 테마 (파/빨/녹/보/주)',
            '모션 감소 사용자 대응 (prefers-reduced-motion)',
            '색맹 친화 모드',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 모든 색이 CSS 변수로 분리',
            '☐ localStorage 저장 + 새로고침 후 유지',
            '☐ OS 설정 자동 감지',
            '☐ 토글 시 깜빡임 최소화',
            '☐ 접근성 (대비·키보드 토글)',
          ] },
        ],
      },

      {
        id: 'reg-2-practice-5',
        title: '실습 5 · 반응형 햄버거 메뉴 (40분)',
        icon: '🧪',
        summary: '데스크탑은 가로 메뉴, 모바일은 햄버거 + 슬라이드 메뉴 — 한국 트래픽 70% 모바일 대응.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '모바일에서 햄버거 메뉴 동작',
            '데스크탑에서 가로 메뉴 자동 전환',
            '접근성 — 키보드 + ARIA',
          ] },

          { subtitle: 'HTML' },
          { code: { lang: 'html', content: `<nav class="navbar">
  <a href="/" class="logo">로고</a>

  <button
    class="hamburger"
    aria-label="메뉴 토글"
    aria-expanded="false"
    aria-controls="nav-menu"
  >
    <span></span>
    <span></span>
    <span></span>
  </button>

  <ul id="nav-menu" class="nav-menu">
    <li><a href="/about">소개</a></li>
    <li><a href="/services">서비스</a></li>
    <li><a href="/contact">문의</a></li>
  </ul>
</nav>` } },

          { subtitle: 'CSS — 모바일 퍼스트' },
          { code: { lang: 'css', content: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  position: relative;
}

/* 햄버거 — 모바일에서만 보임 */
.hamburger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
}
.hamburger span {
  width: 24px;
  height: 2px;
  background: var(--text-primary);
  transition: 0.2s;
}

/* X 모양 변환 */
.hamburger.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger.active span:nth-child(2) {
  opacity: 0;
}
.hamburger.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* 메뉴 — 모바일에서 숨김 */
.nav-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  flex-direction: column;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  list-style: none;
  margin: 0;
  padding: 16px 24px;
}
.nav-menu.open {
  display: flex;
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .hamburger {
    display: none;
  }
  .nav-menu {
    display: flex !important;
    flex-direction: row;
    position: static;
    background: transparent;
    border-top: none;
    padding: 0;
    gap: 24px;
  }
}` } },

          { subtitle: 'JavaScript' },
          { code: { lang: 'javascript', content: `const hamburger = document.querySelector('.hamburger');
const menu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  hamburger.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// Escape 키로 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    menu.classList.remove('open');
    hamburger.classList.remove('active');
  }
});` } },

          { subtitle: '확장 과제' },
          { items: [
            '슬라이드 인 애니메이션 (transform: translateX)',
            '서브 메뉴 아코디언',
            '검색창 통합',
            'Sticky 헤더 + 스크롤 시 색 변경',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 모바일 햄버거 정상 동작',
            '☐ 데스크탑 가로 메뉴 자동 전환',
            '☐ ARIA aria-expanded 토글',
            '☐ 키보드 (Tab + Escape) 접근',
            '☐ 외부 클릭 시 자동 닫기',
          ] },
        ],
      },

      {
        id: 'reg-2-practice-6',
        title: '실습 6 · 본인 포트폴리오 1페이지 완성 (60분)',
        icon: '🧪',
        summary: '학습한 모든 HTML/CSS 기술을 결합한 본인의 실제 포트폴리오 페이지를 작성합니다.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '시맨틱 HTML + Flexbox + Grid + 반응형 + 다크모드 모두 적용',
            '졸업 후에도 실제 활용 가능한 결과물',
            'Lighthouse 4지표 80+ 달성',
          ] },

          { subtitle: '8개 섹션 구성' },
          { items: [
            '1. Hero — 이름·직함·한 줄 소개',
            '2. About — 짧은 자기 소개 3~4문장',
            '3. Skills — 보유 기술 태그 8~12개',
            '4. Projects — 프로젝트 카드 3개 이상',
            '5. Experience — 경력·학력 타임라인',
            '6. Contact — 이메일·SNS 링크',
            '7. (선택) Blog — 글 목록',
            '8. Footer — 저작권·연락처',
          ] },

          { subtitle: '권장 작업 순서' },
          { code: { lang: 'text', content: `[0단계 · 환경 (10분)]
- src/pages/Portfolio.tsx 생성
- src/styles/portfolio.css 생성
- 디자인 토큰 (실습 4 결과 재활용)

[1단계 · 시맨틱 골격 (15분)]
- 8개 섹션 <header>·<main>·<section>·<footer>
- 가짜 콘텐츠로 시작 (Lorem ipsum)

[2단계 · 레이아웃 (20분)]
- Hero: Flexbox 가운데
- Skills: Flexbox + flex-wrap
- Projects: Grid auto-fit
- Experience: Flexbox + 시간순

[3단계 · 반응형 (10분)]
- 모바일 1열
- 태블릿 2열 (768px+)
- 데스크탑 3열 (1024px+)

[4단계 · 다크모드 (5분)]
- 토글 버튼 (실습 4 재활용)

[5단계 · 폴리싱 (10분)]
- 호버 transition
- 폰트·줄간격
- 이미지 alt + 적정 크기` } },

          { subtitle: '실제 콘텐츠 작성' },
          { items: [
            '본인 이름 + 진짜 직함 ("AI 개발자 지망생" 등)',
            '실제 보유 기술 (배운 것 포함 OK)',
            '본 강의 프로젝트를 Projects에 1개 이상',
            '본인 이메일·GitHub URL',
            '졸업 후 채용 담당자가 본다고 가정',
          ] },

          { subtitle: '확장 과제 — 차별화' },
          { items: [
            '스크롤 시 헤더 색 변경 (sticky + IntersectionObserver)',
            '섹션 진입 시 페이드인 애니메이션',
            '5가지 컬러 테마 토글',
            'GitHub 자동 연동 (Octokit으로 최근 commit 표시)',
            '본 강의 인증 배지',
          ] },

          { subtitle: '배포 + 공유' },
          { items: [
            'gh-pages 또는 본 강의 사이트에 배포',
            '실제 URL을 LinkedIn 프로필에 추가',
            '동기들과 URL 공유 + 피어 리뷰',
          ] },

          { subtitle: '평가 기준 (100점)' },
          { table: {
            headers: ['항목', '배점', '확인'],
            rows: [
              ['시맨틱 HTML', '20', 'axe 점수 90+'],
              ['반응형', '20', '3개 브레이크포인트'],
              ['다크모드', '15', '토글 + localStorage'],
              ['Grid 적용', '15', 'auto-fit 카드'],
              ['Flexbox 적용', '10', '네비·태그'],
              ['CSS 변수', '10', '하드코딩 0개'],
              ['접근성', '5', 'Lighthouse 90+'],
              ['배포', '5', '공개 URL'],
            ],
          } },
        ],
      },

      {
        id: 'reg-2-troubleshooting',
        title: '트러블슈팅 · CSS 디버깅',
        icon: '🔧',
        summary: 'CSS가 안 먹는다·레이아웃이 깨진다·반응형이 이상하다 — 가장 흔한 문제 15종과 체계적 디버깅 방법.',
        content: [
          { subtitle: 'CSS가 적용 안 될 때 — 디버깅 체크리스트' },
          { items: [
            '1. 파일이 import 되었는가? — index.css 또는 컴포넌트 .css',
            '2. 선택자가 정확한가? — DevTools에서 "Computed" 탭 확인',
            '3. 우선순위가 다른 규칙에 밀리는가? — Specificity 점수 비교',
            '4. !important 남용으로 추적 불가능?',
            '5. 캐시 — Cmd+Shift+R 강력 새로고침',
            '6. 빌드 산출물이 최신인가? — npm run dev 재시작',
            '7. CSS 파일에 오타? — 닫지 않은 괄호 1개로 그 아래 전체 무효',
          ] },

          { subtitle: '레이아웃이 깨질 때 — 흔한 원인 15가지' },
          { table: {
            headers: ['#', '증상', '원인', '해결'],
            rows: [
              ['1', '요소가 부모 밖으로', 'overflow 미설정', 'overflow: hidden 또는 auto'],
              ['2', '가로 스크롤 발생', '자식이 100vw + padding', 'box-sizing: border-box'],
              ['3', 'Flex 자식이 작아짐', 'min-width 기본값', 'min-width: 0'],
              ['4', 'Grid가 안 정렬됨', 'display: grid 누락', '부모에 명시'],
              ['5', '이미지가 큼', '기본 inline 동작', 'width: 100%'],
              ['6', '여백이 합쳐짐', 'margin collapse', 'padding으로 변경 또는 flex 사용'],
              ['7', '버튼이 가로 정렬 안됨', 'display: inline', 'flex 컨테이너'],
              ['8', '폰트가 부모와 다름', 'inherit 안됨', 'font-family 명시'],
              ['9', 'position: absolute 위치 이상', '부모에 relative 없음', '부모 relative 추가'],
              ['10', '다크모드에서 일부 색 안 변함', '변수 미사용', '변수로 통일'],
              ['11', '모바일에서 hover 안됨', '터치 디바이스', ':hover + :focus 같이'],
              ['12', '클릭이 안됨', 'pointer-events: none', '확인'],
              ['13', 'z-index 안 먹음', 'position 미설정', 'relative/absolute 추가'],
              ['14', '폼 입력이 모바일에서 작음', '폰트 16px 미만', 'font-size: 16px 이상'],
              ['15', '클래스명 충돌', '전역 CSS', 'CSS Module 또는 prefix'],
            ],
          } },

          { subtitle: 'Specificity 계산법' },
          { text: 'CSS 우선순위는 점수제로 계산됩니다. 점수가 높은 규칙이 이깁니다.' },
          { table: {
            headers: ['선택자 유형', '점수'],
            rows: [
              ['인라인 스타일 (style="...")', '1000'],
              ['ID (#header)', '100'],
              ['클래스 (.card), 속성 ([type="text"]), 가상클래스 (:hover)', '10'],
              ['태그 (div), 가상요소 (::before)', '1'],
              ['전체 (*), 결합자 (>, +)', '0'],
              ['!important', '∞ (남용 금지)'],
            ],
          } },
          { code: { lang: 'css', content: `/* 예시 */
.card .title  { color: red; }    /* 10 + 10 = 20 */
#hero h1      { color: blue; }   /* 100 + 1 = 101  ← 이깁니다 */
h1.title      { color: green; }  /* 1 + 10 = 11 */
div .card .title { color: yellow; } /* 1 + 10 + 10 = 21 */` } },

          { subtitle: 'Chrome DevTools 활용' },
          { items: [
            'Elements 탭 → 요소 클릭 → Styles 탭에서 적용된 규칙 확인',
            '취소선 그어진 속성 → 다른 규칙에 의해 무효화됨',
            'Computed 탭 → 최종 적용된 값 확인',
            '"+ .cls" 입력으로 즉석 클래스 추가 테스트',
            'Filter → "color" 입력해 색 관련 규칙만 보기',
            'Device toolbar (Cmd+Shift+M) → 기기별 검증',
          ] },

          { subtitle: 'CSS 디버깅용 작은 트릭' },
          { code: { lang: 'css', content: `/* 모든 요소에 빨간 outline — 레이아웃 시각화 */
* { outline: 1px solid red; }

/* 특정 영역만 */
.debug-area * { outline: 1px solid red; }

/* 더 정교한 디버깅 */
* {
  background: rgba(255, 0, 0, 0.05);
  outline: 1px solid rgba(255, 0, 0, 0.2);
}` } },

          { subtitle: 'AI에게 CSS 디버깅 도움 요청 양식' },
          { code: { lang: 'text', content: `[CSS 디버깅 양식]

[문제 화면 스크린샷 또는 설명]
모바일에서 카드가 화면 밖으로 나옵니다.

[현재 코드]
\`\`\`css
.card {
  width: 100vw;
  padding: 24px;
  background: white;
}
\`\`\`

[기대하는 결과]
카드가 화면 안에 들어맞아야 함.

[브라우저/기기]
iPhone 13 Pro (Safari) / Chrome DevTools 모바일 모드

[이미 시도한 것]
- max-width: 100vw 추가했지만 동일
- overflow-x: hidden은 부모에 적용했지만 동일

질문:
근본 원인과 가장 단순한 해결 방법은?` } },
          { callout: { type: 'tip', text: '정답 예시: width: 100vw + padding의 합이 100vw 초과. box-sizing: border-box 또는 width: auto + padding으로 해결.' } },

          { subtitle: '실습 — 의도적 버그 5개 만들고 고치기' },
          { items: [
            '1. width: 100vw + padding으로 가로 스크롤 만들기 → 고치기',
            '2. flex 자식의 min-width 기본값으로 이미지가 부모 밖 → 고치기',
            '3. position: absolute의 부모에 relative 없는 상태 → 고치기',
            '4. !important 남용 시뮬레이션 → 우선순위로 해결하는 법',
            '5. z-index가 안 먹는 상황 → 분석',
          ] },
        ],
      },

      {
        id: 'reg-2-resources',
        title: '심화 자료 + AI에게 CSS 요청법',
        icon: '📚',
        summary: 'HTML/CSS 학습 심화 자료 + AI에게 CSS 작성을 요청할 때 효과적인 프롬프트 패턴 7가지.',
        content: [
          { subtitle: '심화 학습 자료' },
          { items: [
            'MDN — developer.mozilla.org/ko/docs/Web/CSS (CSS 표준 한국어 문서)',
            'CSS-Tricks — css-tricks.com (실전 패턴 모음)',
            'Web.dev — web.dev/learn/css (Google 공식 CSS 학습)',
            '도서 『모던 CSS』 안주연 — 최신 CSS 기능 정리',
            'YouTube "Kevin Powell" (영문, 무료) — CSS 최고의 강사',
            '한국어 YouTube "코딩애플", "노마드코더"',
          ] },

          { subtitle: '심화 주제 — 본 강의 이후 학습' },
          { items: [
            'CSS-in-JS (styled-components, Emotion)',
            'Tailwind CSS — 유틸리티 우선 프레임워크',
            'CSS 컨테이너 쿼리 — 부모 크기 기반 반응형',
            'CSS 서브그리드 — 중첩 Grid',
            '@layer — 우선순위 관리',
            'Houdini — JavaScript로 CSS 확장',
          ] },

          { subtitle: 'AI에게 CSS 요청할 때 효과적인 7가지 패턴' },
          { code: { lang: 'text', content: `[패턴 1 · 디자인 참조 명시]
"Stripe.com 스타일의 그라데이션 카드"
"Apple HIG 따른 버튼 스타일"
"Linear.app 같은 미니멀 폼"

[패턴 2 · 측정 가능한 값 제시]
나쁨: "예쁘게 만들어줘"
좋음: "padding 16px, border-radius 12px, shadow 0 4px 8px rgba(0,0,0,0.1)"

[패턴 3 · 변수 사용 강제]
"var(--primary-blue), var(--text-primary) 등 CSS 변수만 사용"

[패턴 4 · 반응형 명시]
"768px 미만 1열, 768~1023 2열, 1024 이상 3열"

[패턴 5 · 다크모드 함께]
"라이트와 다크 모드 둘 다 자연스럽게 보이도록"

[패턴 6 · 호버/포커스 명시]
"hover 시 background 0.1 어둡게 + transform translateY(-2px)"

[패턴 7 · 제약 조건 명시]
"min-height 44px (터치 타깃), 모바일에서 폰트 16px 이상"` } },

          { subtitle: '디자인 영감 사이트 (북마크 추천)' },
          { items: [
            'Awwwards — awwwards.com (최고 디자인 갤러리)',
            'Mobbin — mobbin.com (실제 앱 UI 패턴)',
            'Dribbble — dribbble.com (디자이너 커뮤니티)',
            'Refactoring UI — refactoringui.com (실전 가이드)',
            'Tailwind UI — tailwindui.com (유료, 고품질 컴포넌트)',
          ] },

          { subtitle: 'Day 2 학습 효과 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['시맨틱 HTML', 'div만 사용', '주요 5개 태그', '22개 모두 적재적소'],
              ['Flexbox', 'display: flex만', '5개 패턴 가능', '12개 패턴 + 단축속성'],
              ['Grid', '없음', '기본 grid-template-columns', 'areas + auto-fit 자유롭게'],
              ['반응형', '데스크탑만', '모바일 1개 미디어 쿼리', '모바일 퍼스트 + 5+ 브레이크포인트'],
              ['다크모드', '없음', 'CSS 변수 사용', '시스템 감지 + localStorage'],
            ],
          } },

          { subtitle: '다음 단계' },
          { text: 'Day 2에서 시각적 UI 기초를 다졌다면, Day 3는 그 UI에 상호작용을 추가하는 JavaScript를 학습합니다. 변수·함수·배열 메서드·비동기 — React 진입의 마지막 관문입니다.' },
        ],
      },
    ],
  },

  {
    id: 'reg-3',
    title: 'Day 3 · JavaScript 기초',
    icon: '📜',
    description: '변수 선언 3종, 함수 표현 방식, ES6+ 핵심 문법, 배열 메서드, 비동기 처리(Promise/async-await)까지 — React를 다루기 위한 JS 기반을 단단히 다집니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'var/let/const + 함수 4가지', '기본 함수 5개 작성'],
          ['S2', '50분', 'ES6+ 문법 (Destructuring/Spread/Template)', '간단한 데이터 변환 코드'],
          ['S3', '50분', '배열 메서드 5종 (map/filter/reduce/find/forEach)', '사용자 목록 가공'],
          ['S4', '50분', '비동기 + fetch + async/await', 'JSONPlaceholder 호출 완성'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        'var · let · const 차이와 사용 가이드라인을 이해한다',
        '배열 메서드(map/filter/reduce/find)를 적재적소에 사용한다',
        '구조 분해 할당·전개 연산자·템플릿 리터럴을 자유롭게 활용한다',
        'async/await로 비동기 코드를 동기처럼 읽히게 작성한다',
      ] },

      { subtitle: 'var · let · const 비교' },
      { table: {
        headers: ['키워드', '스코프', '재할당', '재선언', '권장'],
        rows: [
          ['var', '함수', '가능', '가능', '쓰지 말 것 (레거시)'],
          ['let', '블록', '가능', '불가', '값이 바뀌는 변수'],
          ['const', '블록', '불가', '불가', '기본값 — 가능한 이걸 쓰기'],
        ],
      } },
      { callout: { type: 'tip', text: '실전 규칙: "const 먼저, 재할당이 필요하면 let, var는 절대 안 씀". 객체·배열을 const로 선언해도 내부 수정은 가능합니다 (참조는 고정, 내용은 가변).' } },

      { subtitle: '함수 표현 4가지' },
      { code: { lang: 'javascript', content: `// 1) 함수 선언문 (hoisting 됨)
function add(a, b) { return a + b; }

// 2) 함수 표현식
const sub = function(a, b) { return a - b; };

// 3) 화살표 함수 — 가장 많이 사용
const mul = (a, b) => a * b;

// 한 줄이면 return 생략
const square = x => x * x;

// 4) 메서드 (객체 안)
const calc = {
  add(a, b) { return a + b; },
};` } },

      { subtitle: 'ES6+ 핵심 문법 3종' },
      { code: { lang: 'javascript', content: `// 구조 분해 (Destructuring)
const user = { name: '홍길동', age: 30, email: 'a@b.c' };
const { name, email } = user;           // 객체에서 추출
const [first, second] = [10, 20];        // 배열에서 추출

// 전개 (Spread)
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];            // [1,2,3,4,5]
const newUser = { ...user, age: 31 };    // 객체 복사 + 일부 수정

// 템플릿 리터럴
const greeting = \`안녕 \${name}, 나이는 \${user.age}살입니다.\`;` } },

      { subtitle: '배열 메서드 — 자주 쓰는 5개' },
      { code: { lang: 'javascript', content: `const users = [
  { id: 1, name: '홍길동', age: 30, isActive: true },
  { id: 2, name: '김철수', age: 25, isActive: false },
  { id: 3, name: '이영희', age: 28, isActive: true },
];

// map — 새 배열로 변환
const names = users.map(u => u.name);        // ['홍길동', '김철수', '이영희']

// filter — 조건으로 거르기
const active = users.filter(u => u.isActive); // 2개

// find — 조건에 맞는 첫 요소
const target = users.find(u => u.id === 2);  // {id:2,...}

// reduce — 누적 계산
const totalAge = users.reduce((acc, u) => acc + u.age, 0); // 83

// forEach — 순회 (return 없음)
users.forEach(u => console.log(u.name));` } },
      { callout: { type: 'warn', text: 'forEach는 새 배열을 반환하지 않으므로 변환에는 부적합합니다. 또한 async/await가 직관처럼 동작하지 않으므로 비동기 순회에는 for...of를 쓰세요.' } },

      { subtitle: '비동기 진화 — Callback → Promise → async/await' },
      { code: { lang: 'javascript', content: `// 옛날 콜백 (콜백 지옥)
fetchUser(1, (user) => {
  fetchPosts(user.id, (posts) => {
    fetchComments(posts[0].id, (comments) => {
      // 들여쓰기 지옥…
    });
  });
});

// Promise (.then 체이닝)
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => console.log(comments));

// async/await (가장 권장)
async function loadFeed() {
  try {
    const user     = await fetchUser(1);
    const posts    = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return comments;
  } catch (err) {
    console.error('실패:', err);
  }
}` } },

      { subtitle: '병렬 vs 순차 실행' },
      { code: { lang: 'javascript', content: `// 순차 — A 끝난 뒤 B (느림, 의존성 있을 때만)
const a = await fetchA();
const b = await fetchB(a.id);  // a 결과 필요

// 병렬 — A·B 동시 (빠름, 독립적일 때)
const [a, b] = await Promise.all([
  fetchA(),
  fetchB(),
]);` } },

      { subtitle: 'JavaScript의 7가지 falsy 값' },
      { code: { lang: 'javascript', content: `// 다음 7개만 falsy, 나머지는 모두 truthy
false
0
-0
0n          // BigInt zero
""          // 빈 문자열
null
undefined
NaN

// 주의: [], {}, "0" 등은 truthy
if ([]) console.log('실행됨');         // 빈 배열도 truthy
if ({}) console.log('실행됨');         // 빈 객체도 truthy
if ("0") console.log('실행됨');        // "0" 문자열도 truthy

// 값 존재 검사 패턴
const value = data?.user?.email ?? '기본값';
// optional chaining: data 또는 user 없으면 undefined
// nullish coalescing: undefined·null이면 '기본값'` } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "TypeScript 안 쓰면 안 되나요?" — 본 과정은 TS 사용. JS만 알면 React 입문은 가능하나 협업·유지보수에 큰 차이.',
        'Q. "==과 === 무엇을 쓰나요?" — 항상 ===. ==은 타입 변환 후 비교로 예측 불가. (예: 0 == "" → true)',
        'Q. "this가 헷갈려요" — 화살표 함수 위주로 쓰면 this 문제가 거의 사라짐. 일반 함수의 this는 호출 방식에 따라 변함.',
        'Q. "비동기를 동기처럼 쓸 수 있나요?" — async/await로 동기처럼 보이게 작성 가능. 다만 await는 async 함수 안에서만 사용.',
        'Q. "콜백 vs Promise vs async/await — 뭘 써야?" — 신규 코드는 무조건 async/await. Promise는 .then 체인이 필요할 때만. 콜백은 setTimeout 등 일부 API에만.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. const로 선언한 객체의 속성을 변경할 수 있는가?',
        '2. forEach가 map과 다른 점은?',
        '3. async 함수의 반환값은 무엇으로 감싸지는가?',
        '4. spread(...) 연산자가 객체와 배열에 어떻게 다르게 동작하는가?',
        '5. fetch가 4xx/5xx 응답에 대해 reject를 발생시키는가?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) 예 (참조는 고정, 내용은 가변)  2) forEach는 새 배열을 반환하지 않음  3) Promise  4) 객체에선 속성 복사, 배열에선 요소 복사 (둘 다 얕은 복사)  5) 아니오 — 응답이 와서 정상 resolve. status로 직접 확인 필요' } },

      { subtitle: '참고 자료' },
      { items: [
        'MDN JavaScript: developer.mozilla.org/ko/docs/Web/JavaScript',
        '도서: 『모던 자바스크립트 Deep Dive』 이웅모',
        '도서: 『You Don\'t Know JS』 시리즈 (영문 무료, github)',
        '강의: 노마드코더 "바닐라JS로 크롬앱 만들기" (무료)',
        '실전: javascript.info (한국어 번역 있음)',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        '사용자 목록(JSON)을 받아 활성 사용자만 필터 + 나이순 정렬 + 이름만 추출',
        'fetch로 JSONPlaceholder API 호출하는 async 함수 작성',
        'Promise.all로 3개 API 병렬 호출 + 합쳐서 반환',
        '에러 처리(try-catch) + 4xx/5xx 상태 코드 분기',
        'AI에게 본인이 작성한 코드를 리뷰 받고 개선점 적용',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 4부터 React 본격 시작. 오늘 배운 JS 문법(화살표 함수, 구조 분해, async/await)이 React 코드에 그대로 등장합니다.' },
    ],
    subSections: [
      {
        id: 'reg-3-vars',
        title: '변수·스코프·호이스팅 깊게',
        icon: '🔤',
        summary: 'var·let·const의 본질적 차이, 스코프 체인, 호이스팅, TDZ까지 — JavaScript 변수의 모든 것.',
        content: [
          { subtitle: '변수 선언 3종 완전 비교' },
          { table: {
            headers: ['항목', 'var', 'let', 'const'],
            rows: [
              ['스코프', '함수', '블록 ({...})', '블록'],
              ['호이스팅', '예 (undefined로)', '예 (TDZ)', '예 (TDZ)'],
              ['재할당', '가능', '가능', '불가'],
              ['재선언', '가능', '불가', '불가'],
              ['전역에서 window 부착', '예', '아니오', '아니오'],
              ['for 루프 클로저', '문제 발생', '정상', '불가 (재할당 필요)'],
            ],
          } },

          { subtitle: '실전 가이드 — 어느 것을 쓸까' },
          { code: { lang: 'javascript', content: `// 규칙 1: const를 기본값으로
const PI = 3.14;
const users = [];           // 배열 자체는 const, 내용은 수정 가능
const config = { ... };

// 규칙 2: 재할당이 필요하면 let
let count = 0;
count = count + 1;

let activeTab = 'home';
activeTab = 'profile';

// 규칙 3: var는 절대 쓰지 말 것
// 레거시 코드 유지보수 외에는 사용 안 함` } },

          { subtitle: '호이스팅 (Hoisting)' },
          { text: 'JavaScript는 변수·함수 선언을 코드 실행 전에 메모리에 먼저 등록합니다. var는 undefined로 초기화되지만, let·const는 TDZ(Temporal Dead Zone)에 들어가 사용 시 에러를 던집니다.' },
          { code: { lang: 'javascript', content: `// var의 호이스팅
console.log(a);   // undefined (에러 아님)
var a = 10;

// let의 TDZ
console.log(b);   // ReferenceError!
let b = 10;

// 함수 선언문은 완전 호이스팅
foo();            // OK — "foo 실행됨"
function foo() { console.log('foo 실행됨'); }

// 함수 표현식은 변수 호이스팅 규칙 따름
bar();            // TypeError (undefined is not a function)
var bar = function() { };` } },

          { subtitle: '스코프 체인' },
          { code: { lang: 'javascript', content: `const global = '전역';

function outer() {
  const outerVar = '외부';

  function inner() {
    const innerVar = '내부';
    console.log(innerVar, outerVar, global);   // 모두 접근 가능
  }

  inner();
  console.log(innerVar);   // ReferenceError — inner 스코프 밖
}

outer();` } },

          { subtitle: '클로저 (Closure) — 빈출 면접 문제' },
          { text: '함수가 자신의 외부 변수를 "기억"하는 것. 함수를 반환할 때 외부 스코프가 함께 살아남습니다.' },
          { code: { lang: 'javascript', content: `function makeCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
counter();  // 1
counter();  // 2
counter();  // 3
// count는 makeCounter 안에서만 접근 가능하지만,
// 반환된 함수가 count를 "기억"해서 누적됨` } },

          { subtitle: 'for 루프 + var 함정 (역사적 버그)' },
          { code: { lang: 'javascript', content: `// 문제 — var 사용
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 출력: 3 3 3 (모두 같은 i 참조!)

// 해결 — let 사용
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 출력: 0 1 2 (각 반복마다 새 i)` } },

          { subtitle: '실습 — 클로저로 카운터 모듈 만들기' },
          { code: { lang: 'javascript', content: `// 다음 요구사항을 클로저로 구현하시오
// - 초기값을 받는 카운터 생성기
// - increment(), decrement(), reset(), getValue() 4개 메서드

function createCounter(initial = 0) {
  let value = initial;
  return {
    increment: () => ++value,
    decrement: () => --value,
    reset: () => { value = initial; return value; },
    getValue: () => value,
  };
}

const c = createCounter(10);
c.increment();         // 11
c.increment();         // 12
c.reset();             // 10
c.getValue();          // 10` } },
        ],
      },

      {
        id: 'reg-3-functions',
        title: '함수 모든 것 + 화살표 함수',
        icon: 'ƒ',
        summary: '함수 선언/표현식/화살표/메서드 4종, this 바인딩, 일급 객체, 고차 함수, 즉시 실행 함수까지 함수의 모든 측면.',
        content: [
          { subtitle: '함수 4가지 표현 방식' },
          { code: { lang: 'javascript', content: `// 1) 함수 선언문 (Function Declaration)
function add(a, b) {
  return a + b;
}
// - 완전 호이스팅
// - 일반적인 유틸 함수에 권장

// 2) 함수 표현식 (Function Expression)
const sub = function(a, b) {
  return a - b;
};
// - 변수 호이스팅 규칙
// - 이름 표현식: function nm(a,b){...} — 재귀 시 유용

// 3) 화살표 함수 (Arrow Function) — 가장 많이 사용
const mul = (a, b) => a * b;
const div = (a, b) => {
  if (b === 0) throw new Error('0으로 나눔');
  return a / b;
};

// 한 줄이면 return 생략, 한 인자면 괄호 생략
const square = x => x * x;

// 4) 메서드 (Method Shorthand)
const calculator = {
  add(a, b) { return a + b; },           // ES6 단축
  sub: function(a, b) { return a - b; }, // 같은 의미
};` } },

          { subtitle: 'this 바인딩 — 함수 종류별 차이' },
          { table: {
            headers: ['함수 종류', 'this의 값'],
            rows: [
              ['일반 함수 호출', 'undefined (strict) / window (non-strict)'],
              ['메서드 호출 (obj.fn())', 'obj (점 앞의 객체)'],
              ['생성자 호출 (new Fn())', '새 인스턴스'],
              ['call/apply/bind', '명시적 지정한 값'],
              ['화살표 함수', '상위 스코프의 this (lexical)'],
              ['이벤트 핸들러 (addEventListener)', '이벤트 대상 (e.currentTarget)'],
            ],
          } },
          { code: { lang: 'javascript', content: `// 일반 함수 vs 화살표 함수의 this
const user = {
  name: '홍길동',

  greetRegular: function() {
    setTimeout(function() {
      console.log('안녕', this.name);   // ⚠️ this = undefined (this.name = 에러)
    }, 100);
  },

  greetArrow: function() {
    setTimeout(() => {
      console.log('안녕', this.name);   // ✅ this = user → "홍길동"
    }, 100);
  },
};` } },
          { callout: { type: 'tip', text: '실전 규칙: 메서드 정의는 일반 함수, 콜백·내부 함수는 화살표 함수. 이렇게 하면 this 문제가 90% 사라집니다.' } },

          { subtitle: '함수는 일급 객체 (First-class Citizen)' },
          { text: '함수가 변수에 할당되고, 인자로 전달되고, 반환값으로 받을 수 있다는 의미. 이게 가능해서 고차 함수·콜백·클로저가 성립합니다.' },
          { code: { lang: 'javascript', content: `// 변수 할당
const fn = function() { return 1; };

// 인자로 전달
[1, 2, 3].map(x => x * 2);     // 화살표 함수가 인자

// 반환값
function makeMultiplier(n) {
  return function(x) { return x * n; };
}
const double = makeMultiplier(2);
double(5);   // 10` } },

          { subtitle: '고차 함수 (Higher-Order Function)' },
          { text: '함수를 인자로 받거나 반환하는 함수. JavaScript 함수형 프로그래밍의 핵심.' },
          { code: { lang: 'javascript', content: `// 데코레이터 패턴 — 함수에 부가 기능 추가
function withLogging(fn) {
  return function(...args) {
    console.log('호출:', fn.name, args);
    const result = fn(...args);
    console.log('결과:', result);
    return result;
  };
}

function add(a, b) { return a + b; }
const loggedAdd = withLogging(add);

loggedAdd(2, 3);
// 호출: add [2, 3]
// 결과: 5
// → 5` } },

          { subtitle: '기본값 매개변수 (ES6+)' },
          { code: { lang: 'javascript', content: `function greet(name = '익명', lang = 'ko') {
  if (lang === 'ko') return \`안녕, \${name}!\`;
  return \`Hello, \${name}!\`;
}

greet();              // "안녕, 익명!"
greet('홍길동');       // "안녕, 홍길동!"
greet('Kim', 'en');   // "Hello, Kim!"` } },

          { subtitle: '나머지 매개변수 (Rest)' },
          { code: { lang: 'javascript', content: `// 인자 개수가 가변일 때
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);          // 6
sum(1, 2, 3, 4, 5);    // 15

// 일부는 명시 + 나머지
function logFirst(first, ...rest) {
  console.log('첫:', first);
  console.log('나머지:', rest);
}
logFirst('a', 'b', 'c', 'd');
// 첫: a
// 나머지: [b, c, d]` } },

          { subtitle: 'IIFE — 즉시 실행 함수' },
          { code: { lang: 'javascript', content: `// 정의와 동시에 실행
(function() {
  console.log('즉시 실행됨');
})();

// 화살표 함수 버전
(() => {
  console.log('즉시 실행 (arrow)');
})();

// 용도: 전역 오염 방지 (ES6 모듈 이전의 패턴)
// 모던 코드에서는 거의 안 씀. ES6 모듈이 같은 역할.` } },

          { subtitle: '실습 과제' },
          { items: [
            '5가지 종류의 함수를 모두 작성한 calculator.ts 파일 만들기',
            'withLogging 데코레이터로 add/sub/mul을 감싸 호출 로그 출력',
            'this 차이를 보여주는 예제 — 일반 함수 vs 화살표 함수',
            '클로저로 메모이제이션 함수(memoize) 구현',
          ] },
        ],
      },

      {
        id: 'reg-3-arrays',
        title: '배열 메서드 12종 마스터',
        icon: '📊',
        summary: 'map/filter/reduce 트리오 + find/some/every/sort 등 12개 배열 메서드를 실전 예제로 완전 정복.',
        content: [
          { subtitle: '12개 배열 메서드 분류' },
          { table: {
            headers: ['분류', '메서드', '용도', '반환'],
            rows: [
              ['변환', 'map', '각 요소 변환', '새 배열'],
              ['변환', 'filter', '조건 통과만', '새 배열'],
              ['축약', 'reduce', '하나의 값으로', '단일 값'],
              ['검색', 'find', '첫 일치 요소', '요소 (또는 undefined)'],
              ['검색', 'findIndex', '첫 일치 인덱스', '숫자 (또는 -1)'],
              ['검색', 'indexOf', '단순 일치 인덱스', '숫자'],
              ['검사', 'some', '하나라도 일치?', 'boolean'],
              ['검사', 'every', '모두 일치?', 'boolean'],
              ['검사', 'includes', '포함 여부', 'boolean'],
              ['순회', 'forEach', '실행만 (변환 X)', 'undefined'],
              ['정렬', 'sort', '원본 정렬', '원본 변경'],
              ['병합', 'concat', '여러 배열 합침', '새 배열'],
            ],
          } },

          { subtitle: 'map — 변환' },
          { code: { lang: 'javascript', content: `const users = [
  { id: 1, name: '홍길동', age: 30 },
  { id: 2, name: '김철수', age: 25 },
];

// 이름만 추출
const names = users.map(u => u.name);
// ['홍길동', '김철수']

// 객체 변환
const cards = users.map(u => ({
  ...u,
  label: \`\${u.name} (\${u.age}세)\`,
}));
// [{id, name, age, label}, ...]` } },

          { subtitle: 'filter — 거르기' },
          { code: { lang: 'javascript', content: `// 성인만
const adults = users.filter(u => u.age >= 18);

// 여러 조건
const targets = users.filter(u =>
  u.age >= 20 && u.age < 30 && u.name.includes('홍')
);

// 거짓값 제거 (TypeScript 타입 가드 패턴)
const validIds = [1, null, 2, undefined, 3].filter(Boolean);
// [1, 2, 3]` } },

          { subtitle: 'reduce — 축약 (가장 강력)' },
          { code: { lang: 'javascript', content: `// 합계
const total = users.reduce((sum, u) => sum + u.age, 0);
// 55

// 객체로 변환 (id를 키로)
const byId = users.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {});
// { 1: {...}, 2: {...} }

// 그룹화
const orders = [
  { product: 'apple', qty: 3 },
  { product: 'banana', qty: 2 },
  { product: 'apple', qty: 5 },
];
const grouped = orders.reduce((acc, o) => {
  acc[o.product] = (acc[o.product] || 0) + o.qty;
  return acc;
}, {});
// { apple: 8, banana: 2 }

// 최댓값 찾기
const oldest = users.reduce((max, u) =>
  u.age > max.age ? u : max
);
// { id: 1, name: '홍길동', age: 30 }` } },

          { subtitle: '체이닝 — 진정한 위력' },
          { code: { lang: 'javascript', content: `// "20대 사용자의 이름을 가나다순으로"
const result = users
  .filter(u => u.age >= 20 && u.age < 30)
  .map(u => u.name)
  .sort();

// "구매 금액 1만원 이상 사용자의 평균 나이"
const avgAge = users
  .filter(u => u.totalSpent >= 10000)
  .map(u => u.age)
  .reduce((sum, age, _, arr) => sum + age / arr.length, 0);

// 가독성 팁: 체인 3단계 이상은 줄바꿈, 각 단계 의미 주석` } },

          { subtitle: 'find / findIndex / indexOf' },
          { code: { lang: 'javascript', content: `// find — 조건 함수, 첫 일치 요소
const target = users.find(u => u.id === 2);
// { id: 2, name: '김철수', age: 25 }

// findIndex — 첫 일치 인덱스
const idx = users.findIndex(u => u.id === 2);
// 1

// indexOf — 단순 값 비교
const arr = ['a', 'b', 'c'];
arr.indexOf('b');   // 1
arr.indexOf('z');   // -1` } },

          { subtitle: 'some / every / includes' },
          { code: { lang: 'javascript', content: `users.some(u => u.age > 60);     // false — 60세 이상 한 명이라도?
users.every(u => u.age >= 18);   // true  — 모두 성인?

// includes — 단순 값
[1, 2, 3].includes(2);           // true

// 자주 쓰는 패턴: 폼 검증
function isFormValid(form) {
  return ['name', 'email', 'phone'].every(k => form[k]);
}` } },

          { subtitle: 'sort — 정렬 (주의)' },
          { code: { lang: 'javascript', content: `// ⚠️ 원본을 변경합니다!
const arr = [3, 1, 2];
arr.sort();         // arr 자체가 [1, 2, 3]으로 바뀜

// 원본 유지: 복사 후 정렬
const sorted = [...arr].sort();

// 숫자 정렬은 비교 함수 필수
[10, 1, 5].sort();              // [1, 10, 5] — 문자열 비교라 잘못됨!
[10, 1, 5].sort((a, b) => a - b);  // [1, 5, 10] — 정상

// 객체 정렬
users.sort((a, b) => a.age - b.age);          // 나이 오름차순
users.sort((a, b) => b.age - a.age);          // 내림차순
users.sort((a, b) => a.name.localeCompare(b.name));  // 한글·영문 가나다` } },

          { subtitle: 'forEach vs for...of' },
          { code: { lang: 'javascript', content: `// forEach — return으로 빠져나갈 수 없음
users.forEach(u => {
  if (u.id === 2) return;   // ⚠️ 다음 반복으로 갈 뿐, 전체 중단 아님
  console.log(u);
});

// for...of — break 가능, async/await 가능
for (const u of users) {
  if (u.id === 2) break;     // 전체 중단
  console.log(u);
}

// 비동기 순회는 for...of 필수
for (const u of users) {
  await sendEmail(u.email);
}
// forEach는 await가 의도대로 동작 안 함` } },

          { subtitle: '실습 — 사용자 데이터 처리' },
          { code: { lang: 'javascript', content: `// 다음 데이터로 5개 작업 수행
const users = [
  { id: 1, name: '홍길동', age: 30, dept: 'AI', salary: 5000 },
  { id: 2, name: '김철수', age: 25, dept: 'AI', salary: 4500 },
  { id: 3, name: '이영희', age: 28, dept: 'Backend', salary: 5500 },
  { id: 4, name: '박민준', age: 35, dept: 'AI', salary: 6500 },
  { id: 5, name: '최서연', age: 22, dept: 'Frontend', salary: 4000 },
];

// 1. AI 부서 사용자만 추출
// 2. 30세 이상 사용자의 평균 연봉
// 3. 부서별 인원 수 계산
// 4. 연봉 상위 3명 이름 가나다순
// 5. 모든 사용자의 연봉 합` } },
        ],
      },

      {
        id: 'reg-3-es6',
        title: 'ES6+ 핵심 문법 마스터',
        icon: '✨',
        summary: '구조 분해 할당·전개 연산자·템플릿 리터럴·옵셔널 체이닝·nullish 등 React 코드에 등장하는 ES6+ 문법 11종.',
        content: [
          { subtitle: '구조 분해 할당 (Destructuring)' },
          { code: { lang: 'javascript', content: `// 객체 구조 분해
const user = { name: '홍길동', age: 30, email: 'a@b.c' };

const { name, email } = user;
// name = '홍길동', email = 'a@b.c'

// 변수 이름 변경
const { name: userName } = user;

// 기본값
const { country = 'KR' } = user;

// 중첩
const post = { author: { name: '홍길동', city: '서울' } };
const { author: { name: authorName, city } } = post;

// 배열 구조 분해
const [first, second, ...rest] = [10, 20, 30, 40, 50];
// first=10, second=20, rest=[30, 40, 50]

// 변수 교환 (스왑)
let a = 1, b = 2;
[a, b] = [b, a];   // a=2, b=1

// 함수 인자에서 구조 분해 (React에서 매우 흔함)
function UserCard({ name, age, onEdit }) {
  return <div>{name} ({age}) <button onClick={onEdit}>편집</button></div>;
}` } },

          { subtitle: '전개 연산자 (Spread)' },
          { code: { lang: 'javascript', content: `// 배열 복사
const arr = [1, 2, 3];
const copy = [...arr];

// 배열 합치기
const merged = [...arr1, ...arr2, ...arr3];

// 배열에 요소 추가 (불변성)
const added = [...arr, 4];      // [1, 2, 3, 4]
const prepended = [0, ...arr];  // [0, 1, 2, 3]
const inserted = [...arr.slice(0, 1), 1.5, ...arr.slice(1)];  // [1, 1.5, 2, 3]

// 객체 복사 (얕은 복사)
const user = { name: '홍', age: 30 };
const updated = { ...user, age: 31 };   // 새 객체, age만 다름

// 객체 병합
const merged = { ...defaults, ...overrides };
// overrides가 같은 키를 가지면 그 값이 이김

// 함수 인자 펼치기
const nums = [3, 1, 5, 2];
Math.max(...nums);   // 5

// React에서 props 전달
<Component {...props} />` } },

          { subtitle: '템플릿 리터럴 (Template Literals)' },
          { code: { lang: 'javascript', content: `const name = '홍길동';
const age = 30;

// 기본 사용
const greeting = \`안녕, \${name}님 (\${age}세)\`;

// 여러 줄
const html = \`
  <div>
    <h1>\${name}</h1>
    <p>나이: \${age}</p>
  </div>
\`;

// 식 평가
const total = \`합계: \${100 + 200}원\`;

// 함수 호출
const time = \`현재 시간: \${new Date().toLocaleTimeString()}\`;

// 태그 함수 (Tagged Template) — 고급
function highlight(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const value = values[i] ? \`<mark>\${values[i]}</mark>\` : '';
    return acc + str + value;
  }, '');
}
const html = highlight\`이름: \${name}, 나이: \${age}\`;
// 이름: <mark>홍길동</mark>, 나이: <mark>30</mark>` } },

          { subtitle: '옵셔널 체이닝 (Optional Chaining)' },
          { code: { lang: 'javascript', content: `// 안전한 깊은 접근
const user = { profile: { address: { city: '서울' } } };

// ❌ 옛날 방식 — 길고 실수 잘 함
const city = user && user.profile && user.profile.address && user.profile.address.city;

// ✅ ES2020 — 깔끔
const city = user?.profile?.address?.city;
// 중간에 undefined·null이면 전체가 undefined

// 함수 호출도 가능
user.greet?.();                     // greet가 없으면 호출 안 함

// 배열도 가능
const first = users?.[0]?.name;     // users가 없거나 빈 배열이면 undefined` } },

          { subtitle: 'Nullish Coalescing (??)' },
          { code: { lang: 'javascript', content: `// || 와의 차이 — 0, '', false도 fallback 적용
const count = 0;
console.log(count || 10);   // 10 ⚠️ (0이 falsy라서)
console.log(count ?? 10);   // 0  ✅ (undefined·null만 fallback)

// 실전 사용
const name = userName ?? '익명';      // userName이 undefined·null이면 '익명'
const limit = config.limit ?? 100;    // 0도 유효값인 경우

// 옵셔널 체이닝과 함께
const city = user?.address?.city ?? '미정';` } },

          { subtitle: '단축 속성·메서드 (Shorthand)' },
          { code: { lang: 'javascript', content: `const name = '홍길동';
const age = 30;

// 단축 속성 — 변수명과 키 이름이 같으면
const user = { name, age };
// === { name: name, age: age }

// 단축 메서드
const obj = {
  greet() { return 'hi'; },        // 새 방식
  greet: function() { return 'hi'; },  // 옛 방식 (같은 의미)
};

// 계산된 속성명
const key = 'dynamic';
const obj = { [key]: 'value' };    // { dynamic: 'value' }` } },

          { subtitle: 'for...of vs for...in' },
          { code: { lang: 'javascript', content: `const arr = [10, 20, 30];

// for...of — 값 순회 (권장)
for (const value of arr) {
  console.log(value);   // 10, 20, 30
}

// for...in — 키 순회 (객체용, 배열에 쓰지 말 것)
for (const key in arr) {
  console.log(key);     // 0, 1, 2 (문자열!)
}

// 객체 순회는 Object.entries 추천
const user = { name: '홍', age: 30 };
for (const [key, value] of Object.entries(user)) {
  console.log(key, value);
}` } },

          { subtitle: '실습 — 위 11개 문법을 모두 사용해 다음 함수 작성' },
          { code: { lang: 'javascript', content: `// 요구사항
// formatUser(user) 함수:
// 1. 입력: { profile: { name?, age? }, settings?: { theme? } }
// 2. 출력: 다음 형태의 문자열
//    "안녕, 익명님 (나이: 0세, 테마: light)"
//    - name이 없으면 "익명"
//    - age가 없으면 0
//    - theme이 없으면 "light"
//    - 모든 ES6+ 문법 활용

// 모범 답안 골격
const formatUser = ({
  profile: { name = '익명', age = 0 } = {},
  settings: { theme = 'light' } = {},
} = {}) => \`안녕, \${name}님 (나이: \${age}세, 테마: \${theme})\`;

// 테스트
formatUser();                                      // 모든 기본값
formatUser({ profile: { name: '홍길동' } });        // 일부만
formatUser({ profile: { name: '김', age: 30 }, settings: { theme: 'dark' } });` } },
        ],
      },

      {
        id: 'reg-3-async',
        title: '비동기 처리 마스터 — Promise·async/await',
        icon: '⏱️',
        summary: 'Promise의 본질부터 async/await 패턴, 병렬·순차, 에러 처리, 취소까지 — 모든 LLM API 호출의 기반.',
        content: [
          { subtitle: '왜 비동기인가' },
          { text: 'JavaScript는 단일 스레드. 1초 걸리는 작업을 동기로 하면 그 1초 동안 UI가 멈춥니다. fetch·setTimeout·DB 호출은 비동기로 처리해 UI를 멈추지 않게 합니다.' },

          { subtitle: '진화 — Callback → Promise → async/await' },
          { code: { lang: 'javascript', content: `// 1세대: 콜백 (Callback Hell)
fetchUser(1, (err, user) => {
  if (err) return console.error(err);
  fetchPosts(user.id, (err, posts) => {
    if (err) return console.error(err);
    fetchComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err);
      // 들여쓰기 4단계… 가독성 지옥
    });
  });
});

// 2세대: Promise (.then 체이닝)
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(err => console.error(err));

// 3세대: async/await — 가장 권장
async function loadFeed() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return comments;
  } catch (err) {
    console.error(err);
  }
}` } },

          { subtitle: 'Promise 생성 — 직접 만들기' },
          { code: { lang: 'javascript', content: `// Promise는 (resolve, reject) 두 함수를 받는 생성자
function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(\`\${ms}ms 대기 완료\`), ms);
  });
}

// 사용
wait(1000).then(msg => console.log(msg));

// async와 함께
async function demo() {
  console.log('시작');
  const msg = await wait(1000);
  console.log(msg);
  console.log('끝');
}
// 시작 → (1초) → "1000ms 대기 완료" → 끝` } },

          { subtitle: 'Promise 상태 3가지' },
          { table: {
            headers: ['상태', '의미', '전환'],
            rows: [
              ['pending', '대기 중', '초기 상태'],
              ['fulfilled', '성공', 'resolve(값) 호출 시'],
              ['rejected', '실패', 'reject(에러) 호출 시 또는 예외'],
            ],
          } },

          { subtitle: '병렬 vs 순차 — 큰 성능 차이' },
          { code: { lang: 'javascript', content: `// ⚠️ 순차 — 느림 (서로 의존 안 하는데도)
async function loadDataSlow() {
  const users = await fetchUsers();      // 1초
  const posts = await fetchPosts();      // 1초
  const comments = await fetchComments(); // 1초
  return { users, posts, comments };
}
// 총 3초

// ✅ 병렬 — 빠름 (독립적인 호출은 동시에)
async function loadDataFast() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments(),
  ]);
  return { users, posts, comments };
}
// 총 1초 (가장 느린 것 기준)` } },

          { subtitle: 'Promise.all / allSettled / race' },
          { code: { lang: 'javascript', content: `// Promise.all — 하나라도 실패하면 전체 실패
try {
  const [a, b, c] = await Promise.all([p1, p2, p3]);
} catch (err) {
  // p1·p2·p3 중 하나라도 reject되면 여기로
}

// Promise.allSettled — 실패해도 전체 결과
const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => {
  if (r.status === 'fulfilled') console.log('성공:', r.value);
  else console.log('실패:', r.reason);
});

// Promise.race — 가장 먼저 끝나는 것
const winner = await Promise.race([
  fetch('/api/fast-server'),
  fetch('/api/slow-server'),
]);
// 빠른 쪽이 이김

// 타임아웃 패턴
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}` } },

          { subtitle: 'fetch — 표준 HTTP 클라이언트' },
          { code: { lang: 'javascript', content: `// GET 요청
const res = await fetch('https://api.example.com/users');
const users = await res.json();

// POST 요청 (JSON 본문)
const res = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// 상태 코드 확인 (fetch는 4xx/5xx에서 reject 안 함!)
if (!res.ok) {                    // status가 200~299가 아니면
  throw new Error(\`HTTP \${res.status}\`);
}

// 헤더에서 정보 추출
const totalCount = res.headers.get('X-Total-Count');

// 응답 유형별
const json = await res.json();         // JSON
const text = await res.text();         // 텍스트
const blob = await res.blob();         // 바이너리 (이미지 등)` } },

          { subtitle: '에러 처리 패턴' },
          { code: { lang: 'javascript', content: `// 1. try-catch — 권장
async function loadUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error('사용자 로드 실패:', err);
    return null;  // 폴백 값
  }
}

// 2. 재시도 (지수 백오프)
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      throw new Error(\`HTTP \${res.status}\`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}` } },

          { subtitle: '취소 — AbortController' },
          { code: { lang: 'javascript', content: `// 진행 중 fetch 취소
const controller = new AbortController();

fetch('/api/data', { signal: controller.signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') console.log('취소됨');
  });

// 5초 후 자동 취소
setTimeout(() => controller.abort(), 5000);

// React에서: 컴포넌트 언마운트 시 취소
useEffect(() => {
  const c = new AbortController();
  fetch('/api/data', { signal: c.signal });
  return () => c.abort();   // cleanup
}, []);` } },

          { subtitle: '실습 과제' },
          { items: [
            'JSONPlaceholder API로 users + posts를 병렬 호출',
            '각 사용자의 첫 글 제목을 매핑 (사용자명 → 글 제목)',
            '재시도 함수(fetchWithRetry) 구현 + 강제 실패 시뮬레이션',
            'AbortController로 5초 타임아웃 적용',
            'Promise.allSettled로 일부 실패해도 나머지 결과 표시',
          ] },
        ],
      },

      {
        id: 'reg-3-practice',
        title: '실습 · 사용자 목록 SPA (2시간)',
        icon: '🧪',
        summary: '학습한 JS 문법을 모두 결합해 fetch·정렬·필터링이 가능한 사용자 목록 앱을 작성합니다.',
        content: [
          { subtitle: '프로젝트 목표' },
          { text: 'React 없이 순수 JavaScript + DOM 조작으로 사용자 목록 앱을 만듭니다. ES6+ 문법·배열 메서드·비동기·DOM API를 모두 사용. 다음 Day에 동일 앱을 React로 재작성하면서 차이를 체감합니다.' },

          { subtitle: '요구 사양' },
          { items: [
            'JSONPlaceholder 사용자 10명 fetch',
            '카드 형태로 렌더링 (이름, 이메일, 도시)',
            '검색창 — 이름 또는 이메일로 실시간 필터',
            '정렬 — 이름 / 이메일 / 도시 토글',
            '로딩 / 에러 / 빈 상태 표시',
            '카드 클릭 → 해당 사용자의 첫 글 표시 (별도 API 호출)',
          ] },

          { subtitle: 'HTML 골격' },
          { code: { lang: 'html', content: `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>사용자 목록</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header>
    <h1>사용자 목록</h1>
    <input id="search" type="search" placeholder="이름·이메일 검색" />
    <select id="sortBy">
      <option value="name">이름순</option>
      <option value="email">이메일순</option>
      <option value="city">도시순</option>
    </select>
  </header>

  <main>
    <div id="status">로딩 중…</div>
    <ul id="userList"></ul>
  </main>

  <dialog id="postDialog">
    <h2 id="postTitle"></h2>
    <p id="postBody"></p>
    <button id="closeDialog">닫기</button>
  </dialog>

  <script src="app.js" type="module"></script>
</body>
</html>` } },

          { subtitle: 'JavaScript — 단계별 작성' },
          { code: { lang: 'javascript', content: `// app.js
const API = 'https://jsonplaceholder.typicode.com';

// 상태
let allUsers = [];
let filtered = [];
let sortKey = 'name';
let keyword = '';

// DOM 참조
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sortBy');
const status = document.getElementById('status');
const userList = document.getElementById('userList');
const postDialog = document.getElementById('postDialog');

// 1) 초기 로드
async function init() {
  try {
    const res = await fetch(\`\${API}/users\`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    allUsers = await res.json();
    status.textContent = '';
    render();
  } catch (err) {
    status.textContent = '오류: ' + err.message;
  }
}

// 2) 필터링 + 정렬 + 렌더
function render() {
  filtered = allUsers
    .filter(u => {
      const k = keyword.toLowerCase();
      return u.name.toLowerCase().includes(k)
          || u.email.toLowerCase().includes(k);
    })
    .sort((a, b) => {
      const aVal = sortKey === 'city' ? a.address.city : a[sortKey];
      const bVal = sortKey === 'city' ? b.address.city : b[sortKey];
      return aVal.localeCompare(bVal);
    });

  if (filtered.length === 0) {
    userList.innerHTML = '<li>검색 결과 없음</li>';
    return;
  }

  userList.innerHTML = filtered.map(u => \`
    <li data-id="\${u.id}" class="user-card">
      <h3>\${u.name}</h3>
      <p>\${u.email}</p>
      <small>\${u.address.city}</small>
    </li>
  \`).join('');

  // 이벤트 위임
  userList.querySelectorAll('.user-card').forEach(card => {
    card.addEventListener('click', () => loadFirstPost(card.dataset.id));
  });
}

// 3) 첫 글 로드
async function loadFirstPost(userId) {
  try {
    const res = await fetch(\`\${API}/users/\${userId}/posts\`);
    const posts = await res.json();
    const first = posts[0];
    document.getElementById('postTitle').textContent = first.title;
    document.getElementById('postBody').textContent = first.body;
    postDialog.showModal();
  } catch (err) {
    alert('글 로드 실패: ' + err.message);
  }
}

// 4) 이벤트 바인딩
searchInput.addEventListener('input', e => {
  keyword = e.target.value;
  render();
});

sortSelect.addEventListener('change', e => {
  sortKey = e.target.value;
  render();
});

document.getElementById('closeDialog').addEventListener('click', () => {
  postDialog.close();
});

// 시작
init();` } },

          { subtitle: '확장 과제 (시간 남으면)' },
          { items: [
            'debounce — 검색 입력 시 매번 render하지 말고 300ms 후',
            '도시별 그룹화 표시 (reduce 활용)',
            'localStorage에 마지막 검색어 저장',
            '5초 후 자동 새로고침 옵션 토글',
            '글 모달에 댓글 목록 (중첩 fetch)',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ ES6+ 문법 5개 이상 사용 (구조 분해·전개·템플릿·옵셔널·async/await)',
            '☐ 배열 메서드 4개 이상 (filter·sort·map·reduce 또는 등)',
            '☐ 로딩·에러·빈 상태 모두 처리',
            '☐ 이벤트 위임으로 카드 클릭',
            '☐ try-catch로 에러 처리',
          ] },
        ],
      },

      {
        id: 'reg-3-practice-2',
        title: '실습 2 · 클로저로 카운터 모듈 (30분)',
        icon: '🧪',
        summary: '클로저의 본질을 직접 코딩으로 체득. 카운터·디바운스·메모이제이션 3가지 패턴 구현.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '클로저로 private 변수 캡슐화',
            '함수형 모듈 패턴 체득',
            '실전 도구 함수 3가지 작성',
          ] },

          { subtitle: '구현 1 · createCounter (10분)' },
          { code: { lang: 'javascript', content: `// 요구사항:
// - 초기값 설정 가능
// - increment / decrement / reset / getValue 메서드
// - 내부 value는 외부에서 직접 접근 불가

function createCounter(initial = 0) {
  let value = initial;
  return {
    increment: () => ++value,
    decrement: () => --value,
    reset: () => { value = initial; return value; },
    getValue: () => value,
  };
}

// 테스트
const c = createCounter(10);
console.log(c.increment());     // 11
console.log(c.increment());     // 12
console.log(c.reset());          // 10
console.log(c.getValue());       // 10
console.log(c.value);            // undefined — 캡슐화!` } },

          { subtitle: '구현 2 · debounce (10분)' },
          { code: { lang: 'javascript', content: `// 요구사항:
// - 마지막 호출 이후 N ms 동안 추가 호출 없으면 실제 실행
// - 검색 입력에 자주 사용

function debounce(fn, delay = 300) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 테스트
const log = debounce((text) => console.log('검색:', text), 500);
log('a');     // 0초
log('ab');    // 0.1초
log('abc');   // 0.2초
// → 0.7초 후 한 번만 '검색: abc' 출력` } },

          { subtitle: '구현 3 · memoize (10분)' },
          { code: { lang: 'javascript', content: `// 요구사항:
// - 동일 인자로 호출하면 캐시된 결과 반환
// - 비싼 계산 함수 가속

function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('cache hit:', key);
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// 테스트
const slowFactorial = (n) => {
  if (n <= 1) return 1;
  return n * slowFactorial(n - 1);
};

const fast = memoize(slowFactorial);
console.log(fast(10));    // 계산
console.log(fast(10));    // 캐시!
console.log(fast(15));    // 계산` } },

          { subtitle: '확장 과제' },
          { items: [
            'throttle (debounce와 반대 — 일정 간격으로만 실행)',
            'once (1회만 실행되는 함수)',
            'pipe / compose (함수 합성)',
            '카운터에 onChange 콜백 추가',
          ] },
        ],
      },

      {
        id: 'reg-3-practice-3',
        title: '실습 3 · 데코레이터 패턴 (30분)',
        icon: '🧪',
        summary: '함수에 로깅·인증·재시도 등 부가 기능을 데코레이터 패턴으로 추가하는 방법.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '고차 함수로 데코레이터 구현',
            '로깅·인증·재시도 3가지 데코레이터 작성',
            '여러 데코레이터 합성',
          ] },

          { subtitle: '데코레이터 1 · withLogging (10분)' },
          { code: { lang: 'javascript', content: `function withLogging(fn) {
  return function(...args) {
    console.log(\`[\${fn.name}] 호출:\`, args);
    const start = performance.now();

    const result = fn(...args);
    const elapsed = performance.now() - start;

    console.log(\`[\${fn.name}] 결과 (\${elapsed.toFixed(2)}ms):\`, result);
    return result;
  };
}

// 사용
function add(a, b) { return a + b; }
const loggedAdd = withLogging(add);

loggedAdd(2, 3);
// [add] 호출: [2, 3]
// [add] 결과 (0.05ms): 5` } },

          { subtitle: '데코레이터 2 · withAuth (10분)' },
          { code: { lang: 'javascript', content: `function withAuth(fn) {
  return function(...args) {
    const user = getCurrentUser();   // 가정
    if (!user) {
      throw new Error('인증 필요');
    }
    return fn.call(this, user, ...args);   // user를 첫 인자로 전달
  };
}

// 사용
function deletePost(user, postId) {
  console.log(\`\${user.name}이 \${postId} 삭제\`);
}
const safeDelete = withAuth(deletePost);

// 비로그인 시
// getCurrentUser() => null
safeDelete(42);   // → Error: 인증 필요

// 로그인 후
// getCurrentUser() => { name: '홍길동' }
safeDelete(42);   // → "홍길동이 42 삭제"` } },

          { subtitle: '데코레이터 3 · withRetry (10분)' },
          { code: { lang: 'javascript', content: `function withRetry(fn, retries = 3, delay = 1000) {
  return async function(...args) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn(...args);
      } catch (err) {
        lastError = err;
        console.warn(\`재시도 \${i + 1}/\${retries}\`);
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  };
}

// 사용
async function flakyFetch(url) {
  if (Math.random() > 0.7) return { data: 'ok' };
  throw new Error('Network error');
}

const reliableFetch = withRetry(flakyFetch, 5, 500);
const result = await reliableFetch('/api/data');
// 최대 5회 시도, 지수 백오프 (500ms → 1s → 2s → 4s)` } },

          { subtitle: '데코레이터 합성' },
          { code: { lang: 'javascript', content: `// 여러 데코레이터를 한 함수에
async function fetchUserData(user, userId) {
  const res = await fetch(\`/api/users/\${userId}\`);
  return res.json();
}

// 인증 + 재시도 + 로깅
const enhanced = withLogging(
  withRetry(
    withAuth(fetchUserData),
    3,
    1000
  )
);

await enhanced(42);
// 자동: 인증 검사 → 재시도 → 로깅` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 3가지 데코레이터 모두 동작',
            '☐ 원본 함수는 변경 X (불변성)',
            '☐ 합성 가능',
            '☐ TypeScript로 타입 추가 시도 (선택)',
          ] },
        ],
      },

      {
        id: 'reg-3-practice-4',
        title: '실습 4 · 배열 메서드 체이닝 마스터 (30분)',
        icon: '🧪',
        summary: 'filter·map·reduce·sort 체이닝으로 데이터 변환 5가지 실전 시나리오.',
        content: [
          { subtitle: '실습 데이터' },
          { code: { lang: 'javascript', content: `const users = [
  { id: 1, name: '홍길동', age: 30, dept: 'AI', salary: 5000, active: true },
  { id: 2, name: '김철수', age: 25, dept: 'AI', salary: 4500, active: true },
  { id: 3, name: '이영희', age: 28, dept: 'Backend', salary: 5500, active: false },
  { id: 4, name: '박민준', age: 35, dept: 'AI', salary: 6500, active: true },
  { id: 5, name: '최서연', age: 22, dept: 'Frontend', salary: 4000, active: true },
  { id: 6, name: '정수진', age: 40, dept: 'Backend', salary: 7000, active: false },
];` } },

          { subtitle: '시나리오 1 · 활성 AI 부서 평균 연봉' },
          { code: { lang: 'javascript', content: `const avgSalary = users
  .filter(u => u.active && u.dept === 'AI')
  .reduce((sum, u, _, arr) => sum + u.salary / arr.length, 0);

console.log(avgSalary);   // 5333.33` } },

          { subtitle: '시나리오 2 · 30대 이상 활성 사용자 이름 가나다순' },
          { code: { lang: 'javascript', content: `const seniors = users
  .filter(u => u.age >= 30 && u.active)
  .map(u => u.name)
  .sort();

console.log(seniors);     // ['박민준', '홍길동']` } },

          { subtitle: '시나리오 3 · 부서별 인원 + 평균 연봉' },
          { code: { lang: 'javascript', content: `const byDept = users.reduce((acc, u) => {
  if (!acc[u.dept]) acc[u.dept] = { count: 0, totalSalary: 0 };
  acc[u.dept].count++;
  acc[u.dept].totalSalary += u.salary;
  return acc;
}, {});

const summary = Object.entries(byDept).map(([dept, { count, totalSalary }]) => ({
  dept,
  count,
  avgSalary: totalSalary / count,
}));

console.log(summary);
// [{dept:'AI', count:3, avgSalary:5333}, {dept:'Backend', count:2, ...}, ...]` } },

          { subtitle: '시나리오 4 · 활성 사용자 중 연봉 상위 3명' },
          { code: { lang: 'javascript', content: `const top3 = users
  .filter(u => u.active)
  .sort((a, b) => b.salary - a.salary)
  .slice(0, 3)
  .map(u => ({ name: u.name, salary: u.salary }));

console.log(top3);` } },

          { subtitle: '시나리오 5 · 부서별 최고 연봉자' },
          { code: { lang: 'javascript', content: `const topByDept = users.reduce((acc, u) => {
  if (!acc[u.dept] || u.salary > acc[u.dept].salary) {
    acc[u.dept] = u;
  }
  return acc;
}, {});

console.log(topByDept);
// { AI: 박민준, Backend: 정수진, Frontend: 최서연 }` } },

          { subtitle: '확장 과제' },
          { items: [
            '활성 사용자만 그룹화 + 부서별 평균 나이',
            '연봉 5000 미만 사용자에게 보너스 1000 지급한 결과 새 배열',
            '50대 이상 사용자는 dept "Senior"로 변경한 새 배열',
            '같은 부서 사용자끼리 페어 매칭 (id 작은 순서)',
          ] },
        ],
      },

      {
        id: 'reg-3-practice-5',
        title: '실습 5 · 비동기 패턴 — Promise.all/race/allSettled (30분)',
        icon: '🧪',
        summary: 'Promise 병렬 처리 3가지 패턴 실전. JSONPlaceholder API로 직접 호출 비교.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'Promise.all로 병렬 호출 (실패 시 전체 실패)',
            'Promise.allSettled로 부분 실패 허용',
            'Promise.race로 타임아웃·경쟁',
          ] },

          { subtitle: '준비 — JSONPlaceholder API' },
          { code: { lang: 'javascript', content: `const API = 'https://jsonplaceholder.typicode.com';

// 단일 fetch helper
async function fetchJson(path) {
  const res = await fetch(\`\${API}\${path}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}` } },

          { subtitle: '구현 1 · Promise.all 병렬 (10분)' },
          { code: { lang: 'javascript', content: `// 한 명 정보 + 글 + 앨범 동시 호출
async function loadUserDashboard(userId) {
  const start = performance.now();

  const [user, posts, albums] = await Promise.all([
    fetchJson(\`/users/\${userId}\`),
    fetchJson(\`/users/\${userId}/posts\`),
    fetchJson(\`/users/\${userId}/albums\`),
  ]);

  const elapsed = performance.now() - start;
  console.log(\`병렬 호출 \${elapsed.toFixed(0)}ms\`);

  return {
    user,
    postCount: posts.length,
    albumCount: albums.length,
  };
}

// 비교 — 순차 호출
async function sequentialLoad(userId) {
  const start = performance.now();
  const user = await fetchJson(\`/users/\${userId}\`);
  const posts = await fetchJson(\`/users/\${userId}/posts\`);
  const albums = await fetchJson(\`/users/\${userId}/albums\`);
  const elapsed = performance.now() - start;
  console.log(\`순차 호출 \${elapsed.toFixed(0)}ms\`);
  return { user, posts, albums };
}

// 실행
await loadUserDashboard(1);    // 약 300ms
await sequentialLoad(1);        // 약 900ms (3배)` } },

          { subtitle: '구현 2 · Promise.allSettled (10분)' },
          { code: { lang: 'javascript', content: `// 일부 실패해도 나머지 결과는 받기
async function loadMultipleUsers(userIds) {
  const results = await Promise.allSettled(
    userIds.map(id => fetchJson(\`/users/\${id}\`))
  );

  const success = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failed = results
    .map((r, i) => ({ ...r, userId: userIds[i] }))
    .filter(r => r.status === 'rejected');

  return { success, failed };
}

// 실행 — 일부 존재하지 않는 ID 포함
const { success, failed } = await loadMultipleUsers([1, 2, 999, 3, 1000]);
console.log(\`\${success.length} 성공, \${failed.length} 실패\`);

failed.forEach(f => {
  console.log(\`사용자 \${f.userId} 실패:\`, f.reason.message);
});` } },

          { subtitle: '구현 3 · Promise.race + 타임아웃 (10분)' },
          { code: { lang: 'javascript', content: `// 5초 안에 응답 안 오면 실패
function withTimeout(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);
}

// 사용
try {
  const user = await withTimeout(fetchJson('/users/1'), 5000);
  console.log(user);
} catch (err) {
  if (err.message === 'Timeout') {
    alert('서버 응답이 너무 느립니다');
  } else {
    alert('오류: ' + err.message);
  }
}

// 또는 두 서버 중 빠른 쪽
const fastResult = await Promise.race([
  fetchJson('/server-1/data'),
  fetchJson('/server-2/data'),
]);` } },

          { subtitle: '확장 과제' },
          { items: [
            '동시 요청 수 제한 (Semaphore 패턴) — 한 번에 3개씩',
            'AbortController로 타임아웃 후 진행 중 fetch 취소',
            '진행률 표시 — 10개 중 N개 완료',
            '재시도 + Promise.allSettled 결합',
          ] },
        ],
      },

      {
        id: 'reg-3-practice-6',
        title: '실습 6 · ES6+ 11종 통합 함수 작성 (30분)',
        icon: '🧪',
        summary: '구조분해·전개·템플릿·옵셔널·nullish 등 모든 ES6+ 문법을 하나의 함수에 통합.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'ES6+ 핵심 문법을 한 함수에 활용',
            '실전 데이터 변환·포매팅 함수 작성',
            '복잡한 옵션 객체 처리',
          ] },

          { subtitle: '시나리오 · 사용자 정보 포매터' },
          { code: { lang: 'text', content: `[요구사항]
formatUserCard(user, options) 함수:

입력:
- user: { profile?: { name?, age? }, settings?: { theme? }, ... }
- options: { showAge?: boolean, dateFormat?: string }

출력:
"안녕, [이름]님 (나이: [나이]세, 테마: [테마])"
- 기본값:
  - name: '익명'
  - age: 0
  - theme: 'light'
  - showAge: true
- 결과: HTML 안전 (이스케이프)` } },

          { subtitle: '모범 답안 — 모든 ES6+ 활용' },
          { code: { lang: 'javascript', content: `function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 11종 ES6+ 모두 활용
const formatUserCard = ({
  profile: { name = '익명', age = 0 } = {},   // 구조분해 + 기본값
  settings: { theme = 'light' } = {},
} = {}, {
  showAge = true,
  dateFormat = 'long',
} = {}) => {
  // 옵셔널 체이닝 + nullish (각각의 의미 활용)
  const safeName = escapeHtml(name?.trim() ?? '익명');
  const safeAge = age ?? 0;

  // 템플릿 리터럴
  const ageStr = showAge ? \`나이: \${safeAge}세, \` : '';
  return \`안녕, \${safeName}님 (\${ageStr}테마: \${theme})\`;
};

// 테스트
console.log(formatUserCard());
// "안녕, 익명님 (나이: 0세, 테마: light)"

console.log(formatUserCard({ profile: { name: '홍길동' } }));
// "안녕, 홍길동님 (나이: 0세, 테마: light)"

console.log(formatUserCard(
  { profile: { name: '<script>alert(1)</script>', age: 30 } },
  { showAge: false }
));
// "안녕, &lt;script&gt;alert(1)&lt;/script&gt;님 (테마: light)"
// → XSS 방어` } },

          { subtitle: '활용된 ES6+ 문법 11개' },
          { table: {
            headers: ['#', '문법', '위치'],
            rows: [
              ['1', '화살표 함수', 'const formatUserCard = (...) => ...'],
              ['2', '구조 분해 (객체)', '{ profile: { name, age } } = {}'],
              ['3', '구조 분해 기본값', 'name = \'익명\''],
              ['4', '중첩 기본값', 'profile = {}'],
              ['5', '템플릿 리터럴', '`안녕, ${name}님...`'],
              ['6', '옵셔널 체이닝', 'name?.trim()'],
              ['7', 'Nullish coalescing', '?? \'익명\''],
              ['8', '단축 메서드 (없음 → 화살표로 대체)', '-'],
              ['9', '함수 매개변수 기본값', '{} = {}'],
              ['10', 'const', '모든 변수 선언'],
              ['11', '암시적 return', '=> \`...\`'],
            ],
          } },

          { subtitle: '확장 과제' },
          { items: [
            '국제화 (i18n) — 언어별 다른 인사말',
            '날짜 포매팅 — Intl.DateTimeFormat 사용',
            'TypeScript로 타입 정의 추가',
            '단위 테스트 작성 (Vitest)',
          ] },
        ],
      },

      {
        id: 'reg-3-resources',
        title: '심화 자료 + JavaScript 함정 모음',
        icon: '📚',
        summary: 'JavaScript 학습 심화 자료 + 자주 틀리는 함정 12가지 카탈로그.',
        content: [
          { subtitle: 'JavaScript 함정 12가지' },
          { table: {
            headers: ['#', '함정', '예'],
            rows: [
              ['1', '== vs ===', '0 == "" → true / 0 === "" → false'],
              ['2', 'typeof null', '"object" (역사적 버그)'],
              ['3', 'NaN === NaN', 'false. Number.isNaN() 사용'],
              ['4', '[1,2] + [3,4]', '"1,23,4" (문자열 결합)'],
              ['5', 'parseInt("08")', '구식 브라우저 0 (8진수). 항상 두 번째 인자 10'],
              ['6', 'Array(3).fill()', '[empty × 3] 아니라 [undefined × 3]'],
              ['7', '얕은 복사', '{...obj} 중첩 객체는 같은 참조'],
              ['8', 'this 바인딩', '일반 함수의 this는 호출 방식 의존'],
              ['9', 'forEach + async', '병렬 동작, await 무시'],
              ['10', '0.1 + 0.2', '0.30000000000000004 (부동소수점)'],
              ['11', 'typeof []', '"object" — Array.isArray() 사용'],
              ['12', 'sort 숫자', '[10,1,2].sort() → [1,10,2] — 비교 함수 필수'],
            ],
          } },

          { subtitle: '심화 자료' },
          { items: [
            'MDN JavaScript: developer.mozilla.org/ko/docs/Web/JavaScript',
            '도서 『모던 자바스크립트 Deep Dive』 이웅모 — 한국어 최고 입문서',
            '도서 『You Don\'t Know JS』 (영문, 무료, GitHub) — 깊이 학습',
            'javascript.info — 한국어 번역, 무료, 체계적',
            'YouTube "Web Dev Simplified" — 빠른 개념 학습',
            'YouTube "노마드코더" 바닐라JS 챌린지',
          ] },

          { subtitle: 'TypeScript 진입 가이드' },
          { text: 'JavaScript에 익숙해지면 TypeScript는 1주일이면 충분. 본 과정은 TS를 처음부터 사용하지만, JS 개념이 탄탄해야 TS가 도움이 됩니다.' },
          { code: { lang: 'typescript', content: `// JS
function add(a, b) { return a + b; }
// 문제: add('1', '2') → "12" (의도와 다름)

// TS
function add(a: number, b: number): number {
  return a + b;
}
// add('1', '2') → 컴파일 에러! 실행 전에 잡힘

// 인터페이스
interface User {
  id: number;
  name: string;
  email?: string;   // 선택적
}

function greet(user: User) {
  return \`안녕, \${user.name}\`;
}` } },

          { subtitle: 'Day 3 학습 효과 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['변수·스코프', 'var만 사용', 'let/const 구분', '클로저·TDZ 설명 가능'],
              ['함수', '함수 선언만', '화살표 함수 사용', 'this 바인딩·고차함수'],
              ['배열 메서드', 'for문만', 'map·filter 사용', '체이닝 + reduce 활용'],
              ['ES6+', '없음', '구조 분해·전개', '옵셔널·nullish·태그 템플릿'],
              ['비동기', '콜백만', 'Promise.then', 'async/await + Promise.all/race + AbortController'],
            ],
          } },

          { subtitle: '다음 단계' },
          { text: 'Day 4부터 React 본격. 오늘 배운 모든 JS 문법(특히 화살표 함수·구조 분해·배열 메서드·async/await)이 React 코드 거의 매 줄에 등장합니다. JS가 단단하면 React는 매우 쉬워집니다.' },
        ],
      },
    ],
  },

  {
    id: 'reg-check-1',
    title: 'Day 4 · 1차 기초점검일',
    icon: '📝',
    description: 'HTML·CSS·JavaScript 학습 내용을 점검하고, 프로젝트 1차 팀별 회의를 진행하는 날입니다.',
    content: [
      { subtitle: '🔍 HTML 점검', items: [
        '시맨틱 태그(header·nav·main·section·article·footer)를 적절히 사용했는가',
        '폼 요소와 입력 검증(label·input·required·type)',
        '문서 구조·접근성(alt, 제목 계층, aria)',
      ] },
      { subtitle: '🎨 CSS 점검', items: [
        '박스 모델(margin·border·padding·content) 이해',
        'Flexbox·Grid 레이아웃 활용',
        '반응형 디자인(media query, 상대 단위)',
        '선택자 우선순위와 CSS 변수(custom properties)',
      ] },
      { subtitle: '⚙️ JavaScript 점검', items: [
        '변수(let·const)·함수·스코프',
        'DOM 조작과 이벤트 처리',
        '배열·객체 메서드(map·filter·reduce 등)',
        '비동기(fetch, async/await) 기초',
      ] },
      { callout: { type: 'tip', text: '점검은 평가가 아니라 복습입니다. 막히는 부분은 표시해 두고 팀 회의에서 함께 해결하세요.' } },
      { subtitle: '👥 프로젝트 1차 팀별 회의', items: [
        '팀 구성·역할 분담 확정(기획·프론트엔드·백엔드·발표)',
        '프로젝트 주제 후보 도출 및 1차 선정',
        '핵심 기능(MVP) 범위 정의',
        '개발 일정·마일스톤 수립',
        '협업 도구(GitHub·팀 게시판) 셋업 확인',
      ] },
      { callout: { type: 'info', text: '회의 결과(주제·역할·일정)는 팀 게시판에 기록해 주세요. 다음 점검일에 진행 상황을 함께 확인합니다.' } },
    ],
  },

  {
    id: 'reg-4',
    title: 'Day 5 · React 기초',
    icon: '⚛️',
    description: '컴포넌트 · Props · State · JSX · 핵심 Hook(useState/useEffect)을 코드와 함께 학습하고, 흔한 안티패턴을 회피하는 방법을 익힙니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'React 3대 개념 + Vite 프로젝트 생성', '첫 컴포넌트 렌더링'],
          ['S2', '50분', 'JSX + Props', '재사용 가능한 Greeting 컴포넌트'],
          ['S3', '50분', 'useState + 이벤트 처리', '카운터·짝수 강조'],
          ['S4', '50분', 'useEffect + fetch + 리스트 렌더링', '사용자 목록 페이지'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        '컴포넌트·Props·State 개념을 정확히 구분한다',
        'JSX 규칙(camelCase, className, fragment)을 자유롭게 작성한다',
        'useState로 상태를, useEffect로 사이드 이펙트를 처리한다',
        '리스트 렌더링·이벤트 처리·조건부 렌더링을 구현한다',
      ] },

      { subtitle: 'React의 3대 개념' },
      { table: {
        headers: ['개념', '비유', '특성'],
        rows: [
          ['Component', '레고 블록', '재사용 가능한 UI 단위'],
          ['Props', '블록의 색·크기 옵션', '부모 → 자식 (읽기 전용)'],
          ['State', '블록 내부의 변동 데이터', '자신만 변경 가능, 변경 시 리렌더'],
        ],
      } },

      { subtitle: '첫 컴포넌트' },
      { code: { lang: 'tsx', content: `// src/components/Greeting.tsx
interface GreetingProps {
  name: string;
  age?: number;   // 선택적 prop
}

export default function Greeting({ name, age }: GreetingProps) {
  return (
    <section>
      <h1>안녕, {name}!</h1>
      {age !== undefined && <p>나이는 {age}살이군요.</p>}
    </section>
  );
}

// 사용
<Greeting name="홍길동" />
<Greeting name="김철수" age={25} />` } },

      { subtitle: 'JSX 핵심 규칙' },
      { items: [
        'class → className (예약어 충돌)',
        'for → htmlFor',
        'onclick → onClick (camelCase)',
        '하나의 부모 요소만 반환 (Fragment <>...</> 사용 가능)',
        'JS 표현식은 { }로 감싸기',
        'style은 객체로 — style={{ color: "red" }}',
      ] },

      { subtitle: 'useState — 상태 관리' },
      { code: { lang: 'tsx', content: `import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState<number>(0);
  // count: 현재 상태, setCount: 갱신 함수, 0: 초기값

  const increment = () => setCount(count + 1);
  const reset     = () => setCount(0);

  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>초기화</button>
    </div>
  );
}` } },
      { callout: { type: 'warn', text: '상태를 직접 변경하면 React가 변화를 감지하지 못합니다. count++ ✗ → setCount(count + 1) ○. 객체·배열도 새 참조로 갱신해야 합니다: setUsers([...users, newUser])' } },

      { subtitle: 'useEffect — 사이드 이펙트' },
      { code: { lang: 'tsx', content: `import { useState, useEffect } from 'react';

export default function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  // 1) 의존성 배열 [userId] — userId 바뀔 때만 실행
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(r => r.json())
      .then(setUser);
  }, [userId]);

  // 2) 빈 배열 [] — 마운트 시 1회만
  useEffect(() => {
    console.log('컴포넌트가 처음 마운트됨');
  }, []);

  // 3) 배열 생략 — 매 렌더마다 실행 (성능 주의)
  useEffect(() => {
    console.log('렌더링 발생');
  });

  // 4) cleanup — 언마운트 또는 다음 effect 직전 실행
  useEffect(() => {
    const id = setInterval(() => console.log('tick'), 1000);
    return () => clearInterval(id);
  }, []);

  if (!user) return <p>로딩 중…</p>;
  return <h1>{user.name}</h1>;
}` } },

      { subtitle: 'useEffect 의존성 배열 4가지 케이스' },
      { table: {
        headers: ['형태', '실행 시점'],
        rows: [
          ['[dep1, dep2]', 'dep 변경 시'],
          ['[]', '마운트 시 1회'],
          ['(생략)', '매 렌더마다'],
          ['return () => …', '언마운트 / effect 재실행 직전 (cleanup)'],
        ],
      } },

      { subtitle: '리스트 렌더링과 key' },
      { code: { lang: 'tsx', content: `const users = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '김철수' },
];

return (
  <ul>
    {users.map(u => (
      <li key={u.id}>{u.name}</li>
      // ⚠️ 반드시 key 추가 — 보통 ID 같은 안정된 값 사용
      // ✗ key={index} — 정렬·삭제 시 버그 유발
    ))}
  </ul>
);` } },

      { subtitle: '흔한 React 안티패턴' },
      { table: {
        headers: ['실수', '문제', '올바른 방법'],
        rows: [
          ['count++', '상태 변화 감지 실패', 'setCount(count + 1)'],
          ['key={index}', '정렬·삭제 시 버그', '안정된 ID 사용'],
          ['Hook을 조건문 안', '에러: Rendered fewer hooks', '항상 컴포넌트 최상단'],
          ['useEffect 의존성 누락', '오래된 state 참조', 'ESLint react-hooks/exhaustive-deps 준수'],
          ['onChange={handleSubmit()}', '즉시 실행됨', 'onChange={handleSubmit} (참조)'],
        ],
      } },

      { subtitle: 'React 렌더링 사이클 이해' },
      { code: { lang: 'text', content: `1) 초기 렌더 (Mount)
   ① 컴포넌트 함수 호출
   ② useState/useEffect 등 Hook 초기화
   ③ JSX 반환 → 가상 DOM 생성
   ④ 실제 DOM에 적용 (commit)
   ⑤ useEffect cleanup(이전 effect) → 새 effect 실행

2) 리렌더 (Update)
   - 트리거: state 변경, props 변경, parent 리렌더
   ① 컴포넌트 함수 재호출
   ② Hook은 동일 순서로 호출 (이 순서가 깨지면 에러)
   ③ JSX 반환 → 가상 DOM 재생성
   ④ 이전 가상 DOM과 diff → 변경된 DOM만 업데이트
   ⑤ 의존성 변경된 useEffect cleanup + 재실행

3) 언마운트 (Unmount)
   ① 모든 useEffect cleanup 실행
   ② DOM에서 제거` } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "props는 왜 읽기 전용인가요?" — 일방향 데이터 흐름 유지. 자식이 props를 바꾸면 부모 상태와 불일치해 예측 불가.',
        'Q. "useState 초기값을 함수로 줘야 하는 경우?" — 무거운 계산(localStorage 파싱 등)은 useState(() => 계산함수())로. 매 렌더가 아닌 첫 렌더에만 실행.',
        'Q. "Class 컴포넌트 안 쓰나요?" — 신규 프로젝트는 함수형 + Hook이 표준. Class는 레거시 유지보수에만.',
        'Q. "리렌더가 자주 일어나서 느려요" — React.memo, useMemo, useCallback으로 최적화. 단, 측정 후 적용. 조기 최적화는 가독성만 해침.',
        'Q. "Context와 props 무엇을 쓰나요?" — 3단계 이상 깊으면 Context, 2단계 이하면 props가 더 단순.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. 컴포넌트 이름의 첫 글자는 대문자/소문자 중 어느 것인가?',
        '2. JSX에서 if-else를 쓸 수 있는가?',
        '3. useEffect의 두 번째 인자 [] (빈 배열)는 무엇을 의미하는가?',
        '4. 리스트 렌더링 시 key prop을 index로 주면 안 되는 이유는?',
        '5. 상태를 직접 수정(count++)하면 어떻게 되는가?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) 대문자 (소문자는 HTML 태그로 인식)  2) 안 됨. 삼항연산자 또는 if는 return 밖에서  3) 마운트 시 1회만 실행  4) 정렬·삭제 시 React가 잘못된 요소를 재사용 → 버그  5) React가 변화를 감지 못해 리렌더 안 됨 (setCount 사용 필수)' } },

      { subtitle: '참고 자료' },
      { items: [
        'React 공식 문서: react.dev (한국어 번역 ko.react.dev)',
        'React Hooks 자세히: react.dev/reference/react',
        '강의: 노마드코더 "React로 영화 웹 서비스 만들기"',
        '도서: 『리액트를 다루는 기술』 김민준 (개정판)',
        'YouTube: 코딩 알려주는 누나, 코딩애플 React 시리즈',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        'Vite + React + TS로 새 프로젝트 생성',
        '입력값에 따라 인사말을 보여주는 Greeting 컴포넌트 구현 (Props 연습)',
        '카운터 + 리셋 + 짝수 강조 표시 컴포넌트 구현 (useState 연습)',
        'JSONPlaceholder에서 사용자 목록을 fetch + 렌더링 (useEffect 연습)',
        '의도적으로 key={index} 버그 만들어보고 정렬 후 버그 관찰 → 수정',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 5에서는 React 심화. React Router로 멀티페이지 SPA를, Context API로 전역 상태를, AuthGuard로 인증 보호를 학습합니다.' },
    ],
    subSections: [
      {
        id: 'reg-4-concepts',
        title: 'React 핵심 개념 — Why React?',
        icon: '⚛️',
        summary: '왜 React가 표준이 되었나, Virtual DOM, Component·Props·State 3대 개념, 선언적 UI의 의미를 학습합니다.',
        content: [
          { subtitle: 'React가 만들어진 이유' },
          { text: '2013년 Facebook이 News Feed의 복잡한 UI 상태 관리 문제로 React를 만들었습니다. 좋아요 알림, 댓글, 친구 요청 등 수많은 동적 상태가 동시에 변경되는 화면을 jQuery로는 유지보수가 거의 불가능했습니다. React는 "데이터가 바뀌면 UI는 자동으로 재계산된다"는 선언적 접근으로 이 문제를 해결했습니다.' },

          { subtitle: '명령형 vs 선언적' },
          { table: {
            headers: ['패러다임', '코드 스타일', '예'],
            rows: [
              ['명령형 (jQuery)', '"어떻게" 직접 지시', '$("#cnt").text(count+1)'],
              ['선언적 (React)', '"무엇을" 표현', 'setCount(count+1) → UI 자동 갱신'],
            ],
          } },

          { subtitle: 'Virtual DOM — 성능의 비밀' },
          { text: '실제 DOM 조작은 비쌉니다 (브라우저 reflow·repaint). React는 메모리에 가벼운 JS 객체(Virtual DOM)를 두고, 변경이 있으면 diff 계산 후 변경된 부분만 실제 DOM에 반영합니다.' },
          { code: { lang: 'text', content: `state 변경 → 새 VDOM 생성 → 이전 VDOM과 비교 → 차이만 실제 DOM에 반영

[예시]
이전 VDOM: <ul><li>A</li><li>B</li></ul>
새 VDOM:   <ul><li>A</li><li>B</li><li>C</li></ul>

React는 "C li만 추가" 만 실제 DOM에 적용` } },

          { subtitle: '3대 개념 한눈에' },
          { table: {
            headers: ['개념', '비유', '특성'],
            rows: [
              ['Component', '레고 블록', '재사용 가능한 UI 단위'],
              ['Props', '블록의 옵션', '부모 → 자식 (읽기 전용)'],
              ['State', '블록의 변동 데이터', '자신만 변경 가능, 변경 시 리렌더'],
            ],
          } },

          { subtitle: '함수형 vs 클래스 컴포넌트' },
          { text: '2019년 Hook 도입 이후 거의 모든 신규 코드는 함수형. 클래스는 레거시 유지보수에만.' },
          { code: { lang: 'tsx', content: `// 함수형 (현재 표준)
function Greeting({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  return <h1>안녕 {name}, {count}회 인사</h1>;
}

// 클래스 (레거시)
class Greeting extends React.Component {
  state = { count: 0 };
  render() {
    return <h1>안녕 {this.props.name}, {this.state.count}회</h1>;
  }
}` } },

          { subtitle: '단방향 데이터 흐름' },
          { text: 'React는 항상 부모 → 자식 방향. 자식이 부모 상태를 직접 바꿀 수 없고, 콜백 함수(props)로 알려야 합니다.' },
          { code: { lang: 'tsx', content: `function Parent() {
  const [count, setCount] = useState(0);
  return <Child count={count} onIncrement={() => setCount(c => c + 1)} />;
}

function Child({ count, onIncrement }: { count: number; onIncrement: () => void }) {
  return (
    <div>
      <p>{count}</p>
      <button onClick={onIncrement}>+1</button>
    </div>
  );
}` } },

          { subtitle: 'Why React (2026 기준)' },
          { items: [
            '커뮤니티 1위 — 라이브러리·튜토리얼·인재 풀',
            'JSX — UI를 JavaScript 표현식으로 통합',
            '컴포넌트 기반 — 재사용·테스트·유지보수 용이',
            'React Native — 모바일 앱 동일 코드',
            '대안: Vue (간결), Svelte (성능), Solid (React-like + 성능)',
          ] },
        ],
      },

      {
        id: 'reg-4-jsx',
        title: 'JSX 완전 정복',
        icon: '📝',
        summary: 'JSX 문법 규칙 12개, 조건부 렌더링·리스트 렌더링·이벤트 처리 등 실전 패턴.',
        content: [
          { subtitle: 'JSX란?' },
          { text: 'JavaScript XML — JS 안에서 HTML 같은 문법을 쓸 수 있게 하는 확장 문법. 빌드 시 React.createElement() 호출로 변환됩니다.' },
          { code: { lang: 'tsx', content: `// JSX
const el = <h1 className="title">안녕</h1>;

// 변환 결과 (자동)
const el = React.createElement('h1', { className: 'title' }, '안녕');` } },

          { subtitle: 'JSX 12대 규칙' },
          { items: [
            '1. 대문자로 시작 = 컴포넌트, 소문자 = HTML 태그',
            '2. 하나의 부모 요소만 반환 (Fragment <>...</> 가능)',
            '3. class → className',
            '4. for → htmlFor (label의 for 속성)',
            '5. onclick → onClick (camelCase)',
            '6. JS 표현식은 {} 안에',
            '7. style은 객체 {{ color: "red" }}',
            '8. 주석은 {/* ... */}',
            '9. 자체 종료 태그 필수 (<img />, <br />)',
            '10. inline-if는 && 또는 삼항',
            '11. 리스트는 map + key',
            '12. 인접 텍스트와 표현식 결합 시 공백 주의',
          ] },

          { subtitle: 'Fragment — 부모 없이 그룹화' },
          { code: { lang: 'tsx', content: `// ❌ 두 요소 반환 불가
function App() {
  return (
    <h1>Title</h1>
    <p>Body</p>
  );  // 에러
}

// ✅ Fragment 사용
function App() {
  return (
    <>
      <h1>Title</h1>
      <p>Body</p>
    </>
  );
}

// 또는 명시적
function App() {
  return (
    <React.Fragment key="item">
      <h1>Title</h1>
      <p>Body</p>
    </React.Fragment>
  );
}` } },

          { subtitle: '조건부 렌더링 5가지' },
          { code: { lang: 'tsx', content: `// 1) if-else (return 분기)
function Status({ isLoading }) {
  if (isLoading) return <p>로딩 중…</p>;
  return <p>완료</p>;
}

// 2) 삼항 연산자 (JSX 안)
{user ? <p>안녕, {user.name}</p> : <button>로그인</button>}

// 3) && 단축 (truthy일 때만 렌더)
{isAdmin && <button>관리자 메뉴</button>}

// 4) 변수에 할당 (복잡한 경우)
let content;
if (status === 'loading') content = <Spinner />;
else if (status === 'error') content = <ErrorBox />;
else content = <UserList />;
return <div>{content}</div>;

// 5) 객체 매핑
const views = {
  loading: <Spinner />,
  error: <ErrorBox />,
  success: <UserList />,
};
return views[status];` } },
          { callout: { type: 'warn', text: '⚠️ && 의 함정: count && <p>...</p> 에서 count가 0이면 화면에 "0"이 표시됩니다. count > 0 && <p>...</p> 로 boolean으로 만드세요.' } },

          { subtitle: '리스트 렌더링 + key' },
          { code: { lang: 'tsx', content: `const users = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '김철수' },
];

return (
  <ul>
    {users.map(u => (
      <li key={u.id}>{u.name}</li>
    ))}
  </ul>
);

// ⚠️ 절대 금지: key={index}
// 정렬·삭제 시 React가 잘못된 요소 재사용 → 버그

// 안정된 ID가 없으면 useId Hook (React 18+)
const id = useId();` } },

          { subtitle: '이벤트 처리' },
          { code: { lang: 'tsx', content: `// 기본 — 화살표 함수
<button onClick={() => console.log('클릭')}>버튼</button>

// 함수 분리
function handleClick() {
  console.log('클릭');
}
<button onClick={handleClick}>버튼</button>

// 이벤트 객체
<input onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
}} />

// 인자 전달 — 화살표 함수 래핑
<button onClick={() => deleteItem(id)}>삭제</button>

// ❌ 즉시 실행됨
<button onClick={deleteItem(id)}>삭제</button>  // 렌더 즉시 실행!

// ✅ 함수 참조
<button onClick={() => deleteItem(id)}>삭제</button>` } },

          { subtitle: 'JSX 동적 속성' },
          { code: { lang: 'tsx', content: `// className 조건부
<div className={isActive ? 'card active' : 'card'}>

// 다중 조건 — 라이브러리 없이
<div className={[
  'card',
  isActive && 'active',
  isLarge && 'large',
].filter(Boolean).join(' ')}>

// style 객체
<div style={{
  color: isActive ? 'blue' : 'gray',
  fontSize: \`\${size}px\`,
  padding: '12px 16px',
}}>

// HTML 속성 전개
const props = { id: 'main', 'data-track': true };
<div {...props} className="extra">` } },

          { subtitle: 'children prop' },
          { code: { lang: 'tsx', content: `// 컴포넌트 사이에 들어가는 내용 = children
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

// 사용
<Card>
  <h2>제목</h2>
  <p>본문</p>
  <button>액션</button>
</Card>` } },

          { subtitle: '실습 — JSX 패턴 익히기' },
          { items: [
            '5종류 조건부 렌더링을 한 컴포넌트에 모두 사용',
            'map + key로 사용자 목록 (의도적으로 key=index 버그 만들고 정렬 후 확인)',
            'children prop으로 Card 컴포넌트 만들고 다양한 자식 넣기',
            '이벤트 핸들러로 카운터·토글·삭제 3종 구현',
          ] },
        ],
      },

      {
        id: 'reg-4-state',
        title: 'useState 깊이 보기',
        icon: '🔄',
        summary: 'useState의 모든 패턴 — 함수형 업데이트, 객체·배열 상태, lazy 초기화, 다중 상태 관리 전략까지.',
        content: [
          { subtitle: 'useState 기본' },
          { code: { lang: 'tsx', content: `import { useState } from 'react';

function Counter() {
  // useState(초기값) → [현재값, 갱신함수] 반환
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}` } },

          { subtitle: '함수형 업데이트 — 매우 중요' },
          { code: { lang: 'tsx', content: `// ❌ 직접 값 전달 — 빠른 연속 클릭 시 문제
<button onClick={() => {
  setCount(count + 1);  // count가 stale closure
  setCount(count + 1);  // 같은 값 + 1, 결국 +1 만 됨
}}>+2</button>

// ✅ 함수형 업데이트 — 최신 값 보장
<button onClick={() => {
  setCount(c => c + 1);  // 이전 값 → 새 값
  setCount(c => c + 1);  // 정상적으로 +2
}}>+2</button>

// 비동기 안에서도 안전
async function delayedIncrement() {
  await sleep(1000);
  setCount(c => c + 1);  // 1초 후 최신 count 기준
}` } },

          { subtitle: '객체 상태 관리' },
          { code: { lang: 'tsx', content: `const [user, setUser] = useState({ name: '', age: 0, email: '' });

// ❌ 직접 변경 — React 감지 못 함
user.name = '홍길동';
setUser(user);  // 같은 참조, 리렌더 안 됨

// ✅ 새 객체로 교체
setUser({ ...user, name: '홍길동' });

// ✅ 함수형 + 전개
setUser(prev => ({ ...prev, name: '홍길동' }));

// 여러 필드 동시 갱신
setUser(prev => ({
  ...prev,
  name: '홍길동',
  age: 30,
}));

// 중첩 객체 (얕은 복사 주의)
const [user, setUser] = useState({
  name: '홍길동',
  address: { city: '서울', district: '강남' },
});

// city만 바꾸려면
setUser(prev => ({
  ...prev,
  address: { ...prev.address, city: '부산' },
}));` } },

          { subtitle: '배열 상태 관리' },
          { code: { lang: 'tsx', content: `const [items, setItems] = useState<string[]>([]);

// 추가
setItems(prev => [...prev, '새 항목']);
setItems(prev => ['맨 앞', ...prev]);

// 삭제 (ID 기준)
setItems(prev => prev.filter(i => i.id !== targetId));

// 수정
setItems(prev => prev.map(i =>
  i.id === targetId ? { ...i, done: true } : i
));

// 정렬 (불변성 유지)
setItems(prev => [...prev].sort((a, b) => a.localeCompare(b)));

// 비우기
setItems([]);` } },

          { subtitle: 'Lazy 초기화 — 무거운 초기값' },
          { code: { lang: 'tsx', content: `// ❌ 매 렌더마다 실행됨 (낭비)
const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('todos') || '[]'));

// ✅ 함수로 감싸기 — 첫 렌더에만 실행
const [todos, setTodos] = useState(() => {
  return JSON.parse(localStorage.getItem('todos') || '[]');
});` } },

          { subtitle: '다중 상태 vs 하나의 객체 — 선택 기준' },
          { code: { lang: 'tsx', content: `// 패턴 1: 다중 useState (각각 독립)
const [name, setName] = useState('');
const [age, setAge] = useState(0);
const [email, setEmail] = useState('');

// 패턴 2: 하나의 객체
const [user, setUser] = useState({ name: '', age: 0, email: '' });

// 선택 기준:
// - 함께 변경되는 값 → 객체 (폼 입력 등)
// - 독립적 변경 → 다중 useState (개별 UI 상태)
// - 4개 이상 + 복잡한 갱신 → useReducer 검토` } },

          { subtitle: 'useReducer — useState의 강력한 대안' },
          { code: { lang: 'tsx', content: `import { useReducer } from 'react';

type State = { count: number; step: number };
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; step: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + state.step };
    case 'decrement': return { ...state, count: state.count - state.step };
    case 'setStep':   return { ...state, step: action.step };
    case 'reset':     return { count: 0, step: 1 };
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
  return (
    <div>
      <p>{state.count} (step: {state.step})</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>−</button>
      <input value={state.step} onChange={e => dispatch({ type: 'setStep', step: +e.target.value })} />
    </div>
  );
}` } },

          { subtitle: '상태 끌어올리기 (Lifting State Up)' },
          { text: '두 자매 컴포넌트가 같은 상태를 공유해야 할 때, 공통 부모로 상태를 올립니다.' },
          { code: { lang: 'tsx', content: `function Parent() {
  // 두 자매가 공유하는 상태
  const [text, setText] = useState('');

  return (
    <>
      <Input value={text} onChange={setText} />
      <Display value={text} />
    </>
  );
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

function Display({ value }: { value: string }) {
  return <p>입력: {value}</p>;
}` } },

          { subtitle: '실습 — useState 다양한 패턴' },
          { items: [
            '함수형 업데이트로 +2 버튼 (2번 호출) 정상 동작',
            '폼 객체 상태 (name·email·phone)를 하나의 useState로 관리',
            '할 일 목록 배열 — 추가·삭제·완료 토글·정렬',
            'useReducer로 카운터 + step + 리셋 구현',
            '상태 끌어올리기로 검색창 + 결과 영역 연결',
          ] },
        ],
      },

      {
        id: 'reg-4-effect',
        title: 'useEffect 깊이 보기',
        icon: '🔁',
        summary: 'useEffect 의존성 배열 4가지 케이스, cleanup, 데이터 fetch 패턴, 무한 루프 방지까지 — Hook의 가장 중요한 도구.',
        content: [
          { subtitle: 'useEffect는 무엇을 하는가' },
          { text: '컴포넌트의 사이드 이펙트(외부 시스템과의 동기화)를 다루는 Hook. fetch, 구독, 타이머, DOM 직접 조작 등이 모두 사이드 이펙트입니다.' },

          { subtitle: '의존성 배열 4가지 패턴' },
          { code: { lang: 'tsx', content: `// 1) 의존성 [dep1, dep2] — dep 변경 시 실행
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// 2) 빈 배열 [] — 마운트 시 1회만
useEffect(() => {
  console.log('컴포넌트 시작');
}, []);

// 3) 배열 생략 — 매 렌더마다 (거의 안 씀, 무한 루프 위험)
useEffect(() => {
  console.log('렌더 발생');
});

// 4) cleanup — return하는 함수가 정리 작업
useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(id);   // 언마운트·재실행 직전 호출
}, []);` } },

          { subtitle: '데이터 fetch 표준 패턴' },
          { code: { lang: 'tsx', content: `function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;     // race condition 방지

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(\`/api/users/\${userId}\`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!cancelled) {
          setUser(data);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };   // cleanup
  }, [userId]);

  if (loading) return <p>로딩…</p>;
  if (error)   return <p>오류: {error}</p>;
  if (!user)   return <p>없음</p>;
  return <h1>{user.name}</h1>;
}` } },

          { subtitle: 'AbortController로 더 우아하게' },
          { code: { lang: 'tsx', content: `useEffect(() => {
  const controller = new AbortController();

  fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(err => {
      if (err.name === 'AbortError') return;
      setError(err.message);
    });

  return () => controller.abort();   // 진행 중 요청도 취소
}, [userId]);` } },

          { subtitle: '무한 루프 — 가장 흔한 함정' },
          { code: { lang: 'tsx', content: `// ❌ 무한 루프
useEffect(() => {
  setData([...data, 'new']);   // data 변경
}, [data]);                     // → data 의존성 → 다시 실행 → 무한

// ✅ 함수형 업데이트로 의존성 제거
useEffect(() => {
  setData(prev => [...prev, 'new']);
}, []);   // 마운트 시 1회만

// ❌ 객체 의존성 — 매번 새 객체라 무한 루프
useEffect(() => { ... }, [{ id: 1 }]);  // 매 렌더 새 객체

// ✅ 원시값으로 분해
useEffect(() => { ... }, [id]);` } },

          { subtitle: 'ESLint react-hooks/exhaustive-deps 규칙' },
          { text: '의존성 배열에 사용된 변수를 자동으로 검사. 누락 시 경고. 거의 항상 따르는 게 안전합니다.' },
          { code: { lang: 'json', content: `// .eslintrc 또는 eslint.config.js
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}` } },

          { subtitle: 'cleanup이 중요한 시나리오' },
          { table: {
            headers: ['시나리오', 'cleanup 안 하면'],
            rows: [
              ['setInterval', '계속 실행 → 메모리 누수'],
              ['이벤트 리스너', '언마운트 후에도 호출 → 에러'],
              ['WebSocket 구독', '연결 누적 → 서버 부하'],
              ['Supabase channel', '동일'],
              ['진행 중 fetch', '언마운트 후 setState → 경고'],
            ],
          } },

          { subtitle: '여러 effect를 분리해야 할 때' },
          { code: { lang: 'tsx', content: `// ❌ 한 effect에 다 넣기
useEffect(() => {
  fetchUser(userId);
  trackPageView(pathname);
}, [userId, pathname]);
// userId 바뀌어도 trackPageView 실행됨 (의도 X)

// ✅ 관심사 분리
useEffect(() => {
  fetchUser(userId);
}, [userId]);

useEffect(() => {
  trackPageView(pathname);
}, [pathname]);` } },

          { subtitle: 'Custom Hook으로 추출' },
          { code: { lang: 'tsx', content: `// 재사용 가능한 useFetch Hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => !cancelled && setData(d))
      .catch(e => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// 사용
function UserList() {
  const { data: users, loading, error } = useFetch<User[]>('/api/users');
  if (loading) return <p>로딩…</p>;
  if (error) return <p>오류: {error}</p>;
  return <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}` } },

          { subtitle: '실습 — useEffect 마스터' },
          { items: [
            '4가지 의존성 패턴 모두 사용한 디버깅용 컴포넌트',
            'fetch + AbortController로 user 로드 + 컴포넌트 언마운트 시 취소 확인',
            '의도적으로 무한 루프 만들고 → 해결',
            'useFetch custom hook 작성 + 2개 컴포넌트에서 재사용',
          ] },
        ],
      },

      {
        id: 'reg-4-vite',
        title: 'Vite + React + TS 실전 셋업',
        icon: '⚡',
        summary: 'Vite 프로젝트 생성부터 폴더 구조, tsconfig, ESLint·Prettier, 별칭 경로까지 — 본 과정 프로젝트의 베이스.',
        content: [
          { subtitle: '프로젝트 생성' },
          { code: { lang: 'bash', content: `# Vite + React + TS 프로젝트 생성
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev    # http://localhost:5173

# package.json 스크립트
# - dev:     개발 서버 (HMR)
# - build:   tsc -b && vite build
# - preview: dist 폴더로 빌드 산출물 미리보기
# - lint:    ESLint (선택)` } },

          { subtitle: '권장 폴더 구조' },
          { code: { lang: 'text', content: `my-app/
├── public/              # 정적 자산 (favicon, robots.txt)
├── src/
│   ├── assets/          # 이미지·폰트 (import로 사용)
│   ├── components/      # 재사용 컴포넌트 (Button, Card, ...)
│   ├── pages/           # 라우트 단위 페이지 (Home, About, ...)
│   ├── hooks/           # custom hooks (useAuth, useFetch, ...)
│   ├── contexts/        # React Context (AuthContext, ThemeContext)
│   ├── utils/           # 순수 유틸 함수 (formatDate, supabase, ...)
│   ├── types/           # TypeScript 타입 정의 (interfaces)
│   ├── styles/          # 전역 CSS, 변수
│   ├── App.tsx          # 최상위 컴포넌트 + Router
│   ├── main.tsx         # 진입점 (ReactDOM.createRoot)
│   └── vite-env.d.ts    # Vite 환경 타입
├── .env.local           # 로컬 환경변수 (gitignore)
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts` } },

          { subtitle: 'tsconfig 권장 설정' },
          { code: { lang: 'json', content: `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",

    "strict": true,                  // 매우 권장
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,  // 배열 접근 시 undefined 체크

    "baseUrl": ".",
    "paths": {                        // 별칭 경로
      "@/*": ["src/*"]
    },

    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"]
}` } },

          { subtitle: '별칭 경로 (Path Alias) — @/' },
          { code: { lang: 'typescript', content: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// 사용 — 깊은 경로가 ../../../ 가 아닌 @/
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';` } },

          { subtitle: 'ESLint + Prettier 셋업' },
          { code: { lang: 'bash', content: `# Vite 템플릿에 이미 ESLint 기본 설치됨

# Prettier 추가
npm install -D prettier eslint-config-prettier

# .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}

# eslint.config.js 끝에 prettier 추가 (충돌 방지)
import prettier from 'eslint-config-prettier';
export default [
  // ... 기존 설정
  prettier,
];` } },

          { subtitle: '환경변수 (.env)' },
          { code: { lang: 'bash', content: `# .env.local (gitignore)
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# 사용 — 반드시 VITE_ 접두사 필요
const url = import.meta.env.VITE_API_URL;

# 타입 정의 (src/vite-env.d.ts)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}` } },

          { subtitle: 'HMR — Hot Module Replacement' },
          { text: 'Vite의 최강 기능. 코드 저장 시 페이지를 새로고침하지 않고 변경된 모듈만 즉시 갱신. React state도 보존됩니다.' },
          { items: [
            '컴포넌트 수정 → 1초 이내 화면 반영 + state 유지',
            'CSS 수정 → 새로고침 없이 즉시 적용',
            'TypeScript 타입 변경 → 즉시 검증',
            '환경변수 변경 → dev 서버 재시작 필요',
          ] },

          { subtitle: 'package.json 스크립트 권장 추가' },
          { code: { lang: 'json', content: `{
  "scripts": {
    "dev":       "vite",
    "build":     "tsc -b && vite build",
    "preview":   "vite preview",
    "typecheck": "tsc -b --noEmit",
    "lint":      "eslint . --ext .ts,.tsx --max-warnings 0",
    "format":    "prettier --write \\"src/**/*.{ts,tsx,css}\\"",
    "verify":    "npm run typecheck && npm run lint",
    "predeploy": "npm run build",
    "deploy":    "gh-pages -d dist"
  }
}` } },

          { subtitle: '실습 — 본인 프로젝트 베이스 셋업' },
          { items: [
            'Vite + React + TS 프로젝트 생성',
            '권장 폴더 구조 생성 + 각 폴더에 .gitkeep 추가',
            'tsconfig strict + paths 설정',
            '@/ 별칭으로 import 1개 이상 사용',
            'Prettier + ESLint 충돌 없이 동작 확인',
            'npm run verify 통과',
          ] },
        ],
      },

      {
        id: 'reg-4-practice',
        title: '실습 · 사용자 목록 React 버전 (2시간)',
        icon: '🧪',
        summary: 'Day 3의 바닐라 JS 사용자 목록을 React로 재작성하면서 두 패러다임의 차이를 직접 비교 학습합니다.',
        content: [
          { subtitle: '프로젝트 목표' },
          { text: 'Day 3에서 만든 바닐라 JS 사용자 목록과 동일 기능을 React + TypeScript로 재구현. 같은 기능을 두 방식으로 만들어보면서 React의 가치(컴포넌트·선언적·상태 관리)를 체감합니다.' },

          { subtitle: '요구 사양 (Day 3와 동일)' },
          { items: [
            'JSONPlaceholder 사용자 10명 fetch',
            '카드 형태 렌더링 (이름, 이메일, 도시)',
            '검색창 — 실시간 필터',
            '정렬 — 이름 / 이메일 / 도시 토글',
            '로딩 / 에러 / 빈 상태',
            '카드 클릭 → 첫 글 모달',
          ] },

          { subtitle: '컴포넌트 분할 설계' },
          { code: { lang: 'text', content: `App
└── UserListPage
    ├── SearchBar (input)
    ├── SortSelector (select)
    ├── StatusMessage (로딩/에러/빈)
    ├── UserCardList
    │   └── UserCard (× N)
    └── PostModal (dialog)` } },

          { subtitle: 'TypeScript 타입 정의' },
          { code: { lang: 'typescript', content: `// src/types/jsonplaceholder.ts
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipcode: string;
  };
  phone: string;
  website: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type SortKey = 'name' | 'email' | 'city';` } },

          { subtitle: '커스텀 Hook — useFetch + useDebounce' },
          { code: { lang: 'typescript', content: `// src/hooks/useFetch.ts
import { useState, useEffect } from 'react';

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}` } },

          { subtitle: '메인 페이지 컴포넌트' },
          { code: { lang: 'tsx', content: `// src/pages/UserListPage.tsx
import { useState, useMemo } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { useDebounce } from '@/hooks/useDebounce';
import type { User, Post, SortKey } from '@/types/jsonplaceholder';

const API = 'https://jsonplaceholder.typicode.com';

export default function UserListPage() {
  const { data: users, loading, error } = useFetch<User[]>(\`\${API}/users\`);
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const debouncedKeyword = useDebounce(keyword, 300);

  const filtered = useMemo(() => {
    if (!users) return [];
    const k = debouncedKeyword.toLowerCase();
    return users
      .filter(u =>
        u.name.toLowerCase().includes(k) ||
        u.email.toLowerCase().includes(k)
      )
      .sort((a, b) => {
        const aVal = sortBy === 'city' ? a.address.city : a[sortBy];
        const bVal = sortBy === 'city' ? b.address.city : b[sortBy];
        return aVal.localeCompare(bVal);
      });
  }, [users, debouncedKeyword, sortBy]);

  if (loading) return <p>로딩 중…</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div>
      <header>
        <h1>사용자 목록</h1>
        <input
          type="search"
          placeholder="이름·이메일 검색"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
          <option value="name">이름순</option>
          <option value="email">이메일순</option>
          <option value="city">도시순</option>
        </select>
      </header>

      {filtered.length === 0 ? (
        <p>검색 결과 없음</p>
      ) : (
        <ul>
          {filtered.map(u => (
            <UserCard
              key={u.id}
              user={u}
              onClick={() => setSelectedUserId(u.id)}
            />
          ))}
        </ul>
      )}

      {selectedUserId !== null && (
        <PostModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}

function UserCard({ user, onClick }: { user: User; onClick: () => void }) {
  return (
    <li onClick={onClick} style={{ cursor: 'pointer' }}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <small>{user.address.city}</small>
    </li>
  );
}

function PostModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data: posts } = useFetch<Post[]>(\`\${API}/users/\${userId}/posts\`);
  const first = posts?.[0];
  if (!first) return null;
  return (
    <dialog open>
      <h2>{first.title}</h2>
      <p>{first.body}</p>
      <button onClick={onClose}>닫기</button>
    </dialog>
  );
}` } },

          { subtitle: 'Day 3 (바닐라 JS) vs Day 4 (React) 비교' },
          { table: {
            headers: ['항목', '바닐라 JS', 'React'],
            rows: [
              ['DOM 조작', '직접 (innerHTML 등)', '자동 (VDOM)'],
              ['상태 관리', '전역 변수', 'useState'],
              ['이벤트 위임', '수동 (querySelectorAll)', '자동 (onClick prop)'],
              ['컴포넌트 분리', 'HTML/JS 따로', 'JSX로 통합'],
              ['재사용성', '함수·클래스', 'props로 쉽게'],
              ['코드 라인 수', '많음', '적음 + 가독성↑'],
              ['초기 설정', '바로 시작', 'Vite 셋업 필요'],
            ],
          } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ TypeScript 타입 모두 정의 (any 0개)',
            '☐ useFetch + useDebounce custom hook 사용',
            '☐ useMemo로 필터링·정렬 최적화',
            '☐ 로딩·에러·빈 상태 모두 처리',
            '☐ AbortController로 진행 중 요청 취소',
            '☐ key prop 안정된 ID 사용',
          ] },
        ],
      },

      {
        id: 'reg-4-practice-2',
        title: '실습 2 · Vite + React + TS 셋업 (20분)',
        icon: '🧪',
        summary: '본 강의 표준 환경을 처음부터 끝까지 직접 구축. 타입·별칭·ESLint·Prettier까지.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'Vite + React + TS 프로젝트 생성',
            'strict 모드 + path alias 설정',
            'ESLint + Prettier 충돌 없이 동작',
          ] },

          { subtitle: '단계 1 · 프로젝트 생성 (5분)' },
          { code: { lang: 'bash', content: `npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev
# → http://localhost:5173 — Vite 로고 보이면 OK` } },

          { subtitle: '단계 2 · tsconfig strict + paths (5분)' },
          { code: { lang: 'json', content: `// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,

    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },

    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}` } },
          { code: { lang: 'typescript', content: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});` } },

          { subtitle: '단계 3 · Prettier 추가 (5분)' },
          { code: { lang: 'bash', content: `npm install -D prettier eslint-config-prettier

# .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}` } },

          { subtitle: '단계 4 · 폴더 구조 + 첫 컴포넌트 (5분)' },
          { code: { lang: 'bash', content: `mkdir -p src/components/ui src/pages src/hooks src/contexts src/utils src/types

# src/components/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}
export default function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button className={\`btn btn-\${variant}\`} {...rest} />;
}

# src/App.tsx — @/ 별칭 사용
import Button from '@/components/ui/Button';
function App() {
  return <Button>안녕</Button>;
}` } },

          { subtitle: '검증' },
          { items: [
            'npm run dev → 정상 동작',
            'npm run build → 0 에러',
            '의도적으로 any 사용 → strict 모드가 잡아냄',
            '@/ 별칭 자동완성 확인',
          ] },
        ],
      },

      {
        id: 'reg-4-practice-3',
        title: '실습 3 · Greeting 컴포넌트 — Props 마스터 (25분)',
        icon: '🧪',
        summary: 'Props 정의·옵셔널·기본값·children·합성 패턴을 모두 활용한 Greeting 컴포넌트.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'TypeScript 인터페이스로 Props 정의',
            '필수·옵셔널·기본값 모두 활용',
            'children prop 활용',
          ] },

          { subtitle: '단계 1 · 기본 Greeting' },
          { code: { lang: 'tsx', content: `// src/components/Greeting.tsx
interface GreetingProps {
  name: string;              // 필수
  age?: number;              // 옵셔널
  greeting?: string;         // 옵셔널 + 기본값 사용
}

export default function Greeting({
  name,
  age,
  greeting = '안녕',         // 기본값
}: GreetingProps) {
  return (
    <section className="greeting">
      <h1>{greeting}, {name}!</h1>
      {age !== undefined && <p>나이: {age}세</p>}
    </section>
  );
}

// 사용
<Greeting name="홍길동" />                          // greeting="안녕"
<Greeting name="김철수" age={25} />
<Greeting name="이영희" age={30} greeting="hi" />` } },

          { subtitle: '단계 2 · children prop 활용' },
          { code: { lang: 'tsx', content: `interface CardProps {
  title: string;
  children: React.ReactNode;     // 자식 콘텐츠
}

export default function Card({ title, children }: CardProps) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </article>
  );
}

// 사용
<Card title="환영">
  <Greeting name="홍길동" age={30} />
  <button>시작하기</button>
</Card>` } },

          { subtitle: '단계 3 · 함수형 props (콜백)' },
          { code: { lang: 'tsx', content: `interface CounterProps {
  initial?: number;
  onChange?: (value: number) => void;
}

export default function Counter({ initial = 0, onChange }: CounterProps) {
  const [count, setCount] = useState(initial);

  const increment = () => {
    const next = count + 1;
    setCount(next);
    onChange?.(next);     // 부모에게 알림 (옵셔널 체이닝)
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}

// 사용
<Counter
  initial={10}
  onChange={(v) => console.log('변경:', v)}
/>` } },

          { subtitle: '단계 4 · HTML 속성 확장' },
          { code: { lang: 'tsx', content: `// 기존 button 속성 모두 + variant 추가
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export default function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant} \${className}\`}
      {...rest}             // onClick·type·disabled·aria-* 등 자동 전달
    />
  );
}

// 사용 — button의 모든 표준 속성 자동 지원
<Button onClick={...} disabled type="submit" aria-label="저장">
  저장
</Button>` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ TypeScript 인터페이스 사용',
            '☐ 필수·옵셔널·기본값 모두 활용',
            '☐ children prop 활용',
            '☐ 콜백 함수 props 전달',
            '☐ HTML 속성 확장 (...rest)',
          ] },
        ],
      },

      {
        id: 'reg-4-practice-4',
        title: '실습 4 · useState 다양한 패턴 (30분)',
        icon: '🧪',
        summary: '함수형 업데이트·객체·배열·lazy 초기화·상태 끌어올리기 5가지 패턴.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'useState 5가지 핵심 패턴 모두 적용',
            '안티패턴 회피',
            '복잡한 상태 관리 능숙해지기',
          ] },

          { subtitle: '패턴 1 · 함수형 업데이트 — 빠른 연속 클릭 해결' },
          { code: { lang: 'tsx', content: `function FastCounter() {
  const [count, setCount] = useState(0);

  // ❌ 직접 값 — +2 버튼 눌러도 +1만 됨
  const wrongPlusTwo = () => {
    setCount(count + 1);
    setCount(count + 1);
  };

  // ✅ 함수형 — 정상 +2
  const correctPlusTwo = () => {
    setCount(c => c + 1);
    setCount(c => c + 1);
  };

  return (
    <>
      <p>{count}</p>
      <button onClick={correctPlusTwo}>+2</button>
    </>
  );
}` } },

          { subtitle: '패턴 2 · 객체 상태 + 부분 갱신' },
          { code: { lang: 'tsx', content: `function UserForm() {
  const [user, setUser] = useState({
    name: '',
    age: 0,
    email: '',
    address: { city: '', street: '' },
  });

  // 단일 필드
  const handleChange = (field: keyof typeof user) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => ({ ...prev, [field]: e.target.value }));
  };

  // 중첩 객체
  const updateCity = (city: string) => {
    setUser(prev => ({
      ...prev,
      address: { ...prev.address, city },
    }));
  };

  return (
    <form>
      <input value={user.name} onChange={handleChange('name')} />
      <input value={user.address.city} onChange={e => updateCity(e.target.value)} />
    </form>
  );
}` } },

          { subtitle: '패턴 3 · 배열 상태 — CRUD' },
          { code: { lang: 'tsx', content: `interface Todo { id: number; text: string; done: boolean; }

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: input, done: false },
    ]);
    setInput('');
  };

  const toggle = (id: number) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const remove = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const clearDone = () => {
    setTodos(prev => prev.filter(t => !t.done));
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
      <button onClick={add}>추가</button>
      <ul>
        {todos.map(t => (
          <li key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            <button onClick={() => remove(t.id)}>X</button>
          </li>
        ))}
      </ul>
      <button onClick={clearDone}>완료 항목 비우기</button>
    </div>
  );
}` } },

          { subtitle: '패턴 4 · Lazy 초기화' },
          { code: { lang: 'tsx', content: `// localStorage에서 초기값 불러올 때
const [todos, setTodos] = useState<Todo[]>(() => {
  const saved = localStorage.getItem('todos');
  return saved ? JSON.parse(saved) : [];
});

// 자동 저장 — useEffect
useEffect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);` } },

          { subtitle: '패턴 5 · 상태 끌어올리기' },
          { code: { lang: 'tsx', content: `// 두 자매 컴포넌트가 같은 상태 공유
function Parent() {
  const [text, setText] = useState('');
  return (
    <>
      <Input value={text} onChange={setText} />
      <Display value={text} />
    </>
  );
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

function Display({ value }: { value: string }) {
  return <p>입력: {value}</p>;
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 5가지 패턴 모두 직접 구현',
            '☐ 함수형 업데이트로 +2 정상 동작',
            '☐ TodoList 추가·삭제·토글·일괄삭제 동작',
            '☐ localStorage 자동 저장 + 복원',
            '☐ 부모-자식 상태 공유',
          ] },
        ],
      },

      {
        id: 'reg-4-practice-5',
        title: '실습 5 · useEffect로 사용자 목록 fetch (30분)',
        icon: '🧪',
        summary: 'useEffect 4가지 의존성 패턴 + cleanup + AbortController 모두 활용.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'useEffect 4가지 패턴 모두 적용',
            'race condition 방지 (cleanup)',
            'AbortController로 진행 중 fetch 취소',
          ] },

          { subtitle: '구현' },
          { code: { lang: 'tsx', content: `import { useState, useEffect } from 'react';

interface User { id: number; name: string; email: string; }

function UserList({ filter }: { filter: 'all' | 'active' }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 패턴 1: 의존성 [filter] — filter 변경 시 재호출
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = filter === 'active'
          ? 'https://jsonplaceholder.typicode.com/users?_limit=5'
          : 'https://jsonplaceholder.typicode.com/users';
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!cancelled) {
          setUsers(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();

    // cleanup — 진행 중 요청 취소 + cancelled 플래그
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [filter]);

  // 패턴 2: [] — 마운트 시 1회만
  useEffect(() => {
    console.log('UserList 마운트');
    return () => console.log('UserList 언마운트');
  }, []);

  if (loading) return <p>로딩 중…</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>{u.name} — {u.email}</li>
      ))}
    </ul>
  );
}

// 사용
function App() {
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [show, setShow] = useState(true);

  return (
    <div>
      <button onClick={() => setFilter(f => f === 'all' ? 'active' : 'all')}>
        필터 토글
      </button>
      <button onClick={() => setShow(s => !s)}>표시 토글</button>
      {show && <UserList filter={filter} />}
    </div>
  );
}` } },

          { subtitle: '검증' },
          { items: [
            'filter 빠르게 토글 → race condition 발생 안 함',
            'UserList 언마운트 시 콘솔 로그 확인',
            'Network 탭 → 빠른 필터 변경 시 이전 요청 취소 확인',
            '의도적으로 cleanup 제거 후 빠른 토글 → setState on unmounted 경고',
          ] },

          { subtitle: '확장 과제' },
          { items: [
            '커스텀 hook useFetch로 추출',
            '디바운스 추가 (300ms)',
            '재시도 버튼',
            '페이지네이션',
          ] },
        ],
      },

      {
        id: 'reg-4-practice-6',
        title: '실습 6 · 안티패턴 5종 만들고 고치기 (25분)',
        icon: '🧪',
        summary: 'React 안티패턴 5가지를 의도적으로 작성 후 발견·수정하며 깊이 학습.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '5가지 안티패턴 직접 작성',
            '문제 발견 + 수정',
            '향후 회피 능력 확보',
          ] },

          { subtitle: '안티패턴 1 · 상태 직접 변경' },
          { code: { lang: 'tsx', content: `// ❌ 잘못된 코드
function Bad() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    count++;            // 직접 변경 — React 감지 못함
    setCount(count);    // setCount 호출했지만 같은 참조
  };
  return <button onClick={handleClick}>{count}</button>;
}

// ✅ 수정
function Good() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}` } },

          { subtitle: '안티패턴 2 · key={index}' },
          { code: { lang: 'tsx', content: `// ❌ 잘못 — 정렬·삭제 시 버그
{items.map((item, index) => <li key={index}>{item.name}</li>)}

// ✅ 수정 — 안정된 ID
{items.map(item => <li key={item.id}>{item.name}</li>)}

// 테스트:
// 1. 항목 5개 표시
// 2. 정렬 후 → key=index는 잘못된 요소 재사용
// 3. key=item.id는 정상` } },

          { subtitle: '안티패턴 3 · 조건문 안 Hook' },
          { code: { lang: 'tsx', content: `// ❌ 잘못 — Rendered fewer hooks 에러
function Bad({ showCount }: { showCount: boolean }) {
  if (showCount) {
    const [count, setCount] = useState(0);   // ⚠️ 조건 안 Hook
    return <p>{count}</p>;
  }
  return <p>숨김</p>;
}

// ✅ 수정 — Hook은 항상 최상단
function Good({ showCount }: { showCount: boolean }) {
  const [count, setCount] = useState(0);
  if (!showCount) return <p>숨김</p>;
  return <p>{count}</p>;
}` } },

          { subtitle: '안티패턴 4 · useEffect 의존성 누락' },
          { code: { lang: 'tsx', content: `// ❌ 잘못 — userId 변경 시 안 다시 호출
function Bad({ userId }: { userId: number }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(\`/api/users/\${userId}\`).then(r => r.json()).then(setUser);
  }, []);   // ⚠️ userId 누락
  return <h1>{user?.name}</h1>;
}

// ✅ 수정
useEffect(() => {
  fetch(\`/api/users/\${userId}\`).then(r => r.json()).then(setUser);
}, [userId]);

// ESLint react-hooks/exhaustive-deps 활성화 시 자동 경고` } },

          { subtitle: '안티패턴 5 · 함수 즉시 실행' },
          { code: { lang: 'tsx', content: `// ❌ 잘못 — 렌더 즉시 실행
function Bad() {
  const handleClick = () => console.log('click');
  return <button onClick={handleClick()}>버튼</button>;   // ⚠️ () 호출!
}
// → 결과: 렌더 시점에 console.log 실행되고
//   onClick에는 console.log의 반환값(undefined) 전달

// ✅ 수정
return <button onClick={handleClick}>버튼</button>;       // 함수 참조

// 또는 인자 전달 시
return <button onClick={() => handleClick(id)}>버튼</button>;` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 5가지 안티패턴 모두 의도적으로 작성',
            '☐ 각 패턴의 증상 (에러·동작 이상) 확인',
            '☐ 수정 후 정상 동작',
            '☐ ESLint react-hooks 규칙 활성화',
            '☐ "왜 잘못된가" 본인 표현으로 설명 가능',
          ] },
        ],
      },

      {
        id: 'reg-4-resources',
        title: '심화 자료 + React 안티패턴 모음',
        icon: '📚',
        summary: 'React 학습 심화 자료 + 가장 흔한 안티패턴 12가지와 해결법.',
        content: [
          { subtitle: 'React 안티패턴 12가지' },
          { table: {
            headers: ['#', '안티패턴', '문제', '해결'],
            rows: [
              ['1', '상태 직접 변경 (count++)', '리렌더 안 됨', 'setCount(c => c+1)'],
              ['2', 'key={index}', '정렬·삭제 시 버그', '안정된 ID 사용'],
              ['3', 'Hook을 조건문 안', 'Rendered fewer hooks 에러', '항상 최상단'],
              ['4', 'useEffect 의존성 누락', 'stale closure', 'ESLint 규칙 준수'],
              ['5', 'onClick={fn()}', '렌더 즉시 실행', 'onClick={fn} 또는 () => fn()'],
              ['6', '인라인 함수 남용', '자식 리렌더 폭증', 'useCallback (측정 후)'],
              ['7', 'props drilling 5단계+', '유지보수 지옥', 'Context API'],
              ['8', '거대 컴포넌트 (500줄+)', '재사용 불가', '분할 + custom hook'],
              ['9', 'any 타입 남용', 'TS 의미 무력화', '구체적 타입'],
              ['10', 'div className="card"', '시맨틱 결여', 'article/section 등'],
              ['11', '에러 처리 없음', '사용자 빈 화면', 'try-catch + ErrorBoundary'],
              ['12', '테스트 0개', '리팩토링 두려움', '핵심 1~2개 단위 테스트'],
            ],
          } },

          { subtitle: '심화 자료' },
          { items: [
            'React 공식 문서: react.dev (한국어 ko.react.dev)',
            '도서 『리액트를 다루는 기술』 김민준 (개정판)',
            '도서 『Effective React』 (영문, 2024)',
            'YouTube "노마드코더" React 시리즈',
            'YouTube "Web Dev Simplified" — 짧고 명확',
            'Dan Abramov 블로그: overreacted.io (한국어 번역 있음)',
          ] },

          { subtitle: '심화 주제 — 본 강의 이후' },
          { items: [
            'React Server Components (Next.js·Remix)',
            'TanStack Query — 서버 상태 캐싱',
            'Zustand·Jotai — 가벼운 전역 상태',
            'React Compiler — 자동 메모이제이션',
            'Testing Library + Vitest',
            'React Native — 모바일 앱',
          ] },

          { subtitle: 'Day 4 학습 효과 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['컴포넌트 작성', 'props 기본만', 'children + 타입', 'composition + render props'],
              ['useState', '기본 사용', '함수형 업데이트', 'useReducer 적재적소'],
              ['useEffect', '의존성 비움', '데이터 fetch', 'cleanup + AbortController'],
              ['JSX 패턴', '기본 렌더링', '조건부 + 리스트', 'Fragment + render prop'],
              ['Custom Hook', '없음', '1개 작성', '재사용 가능한 hook 다수'],
            ],
          } },

          { subtitle: '다음 단계' },
          { text: 'Day 5에서는 React Router + Context + lazy로 실제 SPA 구조를 완성합니다. 본 Day 4의 모든 개념이 토대가 됩니다.' },
        ],
      },
    ],
  },

  {
    id: 'reg-5',
    title: 'Day 6 · React 심화 + 라우팅',
    icon: '🔀',
    description: 'React Router v6, Context API 전역 상태, React.lazy 코드 스플리팅, AuthGuard 인증 보호 패턴까지 — 실제 SPA에 필요한 심화 주제를 학습합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'React Router v6 + 동적 라우트', '5페이지 SPA 골격'],
          ['S2', '50분', 'Context API로 인증 상태 관리', 'AuthContext 구현'],
          ['S3', '50분', 'AuthGuard 패턴 + 보호된 라우트', '/admin 접근 제어'],
          ['S4', '50분', 'React.lazy + Suspense 코드 스플리팅', '청크 분할 확인'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        'React Router v6로 멀티페이지 SPA를 구성한다',
        'Context API로 전역 상태(인증, 테마)를 관리한다',
        'React.lazy + Suspense로 코드 스플리팅을 적용한다',
        'AuthGuard 패턴으로 인증이 필요한 라우트를 보호한다',
      ] },

      { subtitle: 'React Router v6 핵심 API' },
      { code: { lang: 'tsx', content: `// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/about"     element={<About />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/admin"     element={<AuthGuard><AdminDashboard /></AuthGuard>} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}` } },

      { subtitle: '동적 라우트 파라미터 읽기' },
      { code: { lang: 'tsx', content: `import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();      // URL: /users/42 → id="42"
  const navigate = useNavigate();
  const location = useLocation();                  // 현재 경로 정보

  const goToList = () => navigate('/users');       // 함수형 이동
  const goBack   = () => navigate(-1);             // 이전 페이지

  return (
    <div>
      <h1>사용자 #{id}</h1>
      <button onClick={goToList}>목록으로</button>
      <button onClick={goBack}>뒤로</button>
    </div>
  );
}` } },

      { subtitle: 'Context API — 전역 상태' },
      { code: { lang: 'tsx', content: `// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthCtx {
  user: User | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const signIn  = (email: string) => setUser({ email });
  const signOut = () => setUser(null);
  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 컴포넌트에서 사용
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}` } },

      { subtitle: 'AuthGuard 패턴' },
      { code: { lang: 'tsx', content: `// src/components/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props { children: React.ReactNode; }

export default function AuthGuard({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // 로그인 후 원래 가려던 페이지로 돌아가도록 state에 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// 사용
<Route path="/admin" element={<AuthGuard><AdminPage /></AuthGuard>} />` } },

      { subtitle: 'React.lazy + Suspense — 코드 스플리팅' },
      { text: '초기 번들 크기를 줄여 첫 화면 표시를 가속하는 표준 기법. 사용자가 해당 라우트에 진입할 때만 해당 코드를 다운로드합니다.' },
      { code: { lang: 'tsx', content: `import { lazy, Suspense } from 'react';

// 정적 import 대신 lazy로 감싸기
const About    = lazy(() => import('./pages/About'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <Suspense fallback={<div>로딩 중…</div>}>
      <Routes>
        <Route path="/about"    element={<About />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}` } },
      { callout: { type: 'tip', text: '라우트 단위 lazy는 거의 무조건 이득입니다. Vite의 청크 분리와 결합하면 초기 번들이 50% 이상 줄어드는 경우도 흔합니다.' } },

      { subtitle: 'Context 사용 시 주의' },
      { items: [
        '자주 변하는 값을 한 Context에 묶으면 모든 소비자가 리렌더',
        '인증/테마처럼 변경 드문 값에 사용 — 폼 입력값은 부적합',
        '여러 관심사는 별도 Context로 분리 (AuthContext + ThemeContext + …)',
        '상태가 깊은 트리로 전달될 때만 사용 (얕은 트리는 props drilling이 더 간단)',
      ] },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "BrowserRouter vs HashRouter?" — 일반 사이트는 BrowserRouter. GitHub Pages처럼 SPA를 서버 설정 없이 호스팅할 때만 HashRouter 또는 404.html 트릭 사용.',
        'Q. "Context와 Redux 무엇을 쓰나요?" — 소규모는 Context로 충분. 폼·서버 데이터 캐시·복잡한 상태는 Zustand·Jotai·TanStack Query가 더 적합.',
        'Q. "useNavigate vs Link 차이?" — Link는 클릭 가능한 a 태그(접근성 ↑), useNavigate는 함수형 이동(이벤트 핸들러 안). 사용자 클릭은 Link, 로그인 성공 후 자동 이동은 useNavigate.',
        'Q. "Lazy 로딩 후 첫 진입이 느려요" — 청크 다운로드 시간. preload 또는 prefetch 힌트로 개선 가능. 그래도 초기 번들 절감이 더 큰 이득.',
        'Q. "Outlet은 언제 쓰나요?" — 중첩 라우트. <Route path="/admin" element={<AdminLayout/>}> 안에 자식 라우트가 있을 때 자식 위치 지정.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. React Router v6에서 path="/users/:id"의 id 값을 읽는 Hook은?',
        '2. 보호된 라우트 패턴의 이름은?',
        '3. React.lazy와 함께 반드시 써야 하는 컴포넌트는?',
        '4. Context를 잘못 쓰면 발생하는 성능 문제는?',
        '5. Navigate 컴포넌트의 replace prop은 무엇을 의미하는가?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) useParams  2) AuthGuard (또는 RequireAuth)  3) Suspense  4) Context 값이 바뀔 때 모든 소비자 리렌더  5) 브라우저 history를 교체 (뒤로 가기 시 이전 페이지로 안 돌아감)' } },

      { subtitle: '참고 자료' },
      { items: [
        'React Router 공식: reactrouter.com',
        'React Context: react.dev/learn/passing-data-deeply-with-context',
        '대안: Zustand (zustand-demo.pmnd.rs), Jotai (jotai.org)',
        'TanStack Query: tanstack.com/query (서버 상태 관리)',
        '강의: 노마드코더 "노마드 챌린지" 시리즈',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        '5페이지 SPA 구조 만들기 (Home/About/Users/UserDetail/NotFound)',
        '/users/:id 동적 라우트 + useParams로 ID 표시',
        'AuthContext + AuthGuard로 /admin 라우트 보호',
        '모든 페이지를 React.lazy로 코드 스플리팅 적용 + Network 탭에서 청크 확인',
        '로그인 후 원래 가려던 페이지로 되돌아가는 로직 구현 (state.from)',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 6부터는 백엔드. Supabase로 회원가입·로그인·데이터베이스 CRUD·파일 업로드를 단 4시간에 풀세트로 구현합니다.' },
    ],
    subSections: [
      {
        id: 'reg-5-router',
        title: 'React Router v6 완전 정복',
        icon: '🗺️',
        summary: 'BrowserRouter·Routes·Route·useNavigate·useParams·Outlet·중첩 라우트까지 React Router의 모든 핵심.',
        content: [
          { subtitle: '왜 라우터인가 — SPA의 본질' },
          { text: '전통 웹: 페이지 이동 시 서버에서 새 HTML 로드. SPA: 한 번 로드 후 클라이언트에서 화면만 교체. 사용자 경험은 훨씬 빠르지만, URL과 화면을 동기화하는 라우터 라이브러리가 필요합니다.' },

          { subtitle: '셋업' },
          { code: { lang: 'bash', content: `npm install react-router-dom

# main.tsx
import { BrowserRouter } from 'react-router-dom';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);` } },

          { subtitle: '기본 라우트' },
          { code: { lang: 'tsx', content: `import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/about"     element={<About />} />
      <Route path="/users/:id" element={<UserDetail />} />
      <Route path="*"          element={<NotFound />} />
    </Routes>
  );
}` } },

          { subtitle: '동적 파라미터 — useParams' },
          { code: { lang: 'tsx', content: `import { useParams } from 'react-router-dom';

function UserDetail() {
  const { id } = useParams<{ id: string }>();
  // URL: /users/42 → id = "42"
  return <h1>사용자 #{id}</h1>;
}

// 다중 파라미터
<Route path="/posts/:year/:slug" element={<Post />} />
const { year, slug } = useParams();

// 쿼리 파라미터 (?q=...)
import { useSearchParams } from 'react-router-dom';
const [params, setParams] = useSearchParams();
const q = params.get('q');                  // 읽기
setParams({ q: '새 값', page: '2' });        // 쓰기` } },

          { subtitle: 'useNavigate — 함수형 이동' },
          { code: { lang: 'tsx', content: `import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  async function handleSubmit() {
    await login();
    navigate('/dashboard');         // 이동
    navigate('/dashboard', { replace: true });  // history 교체
    navigate(-1);                   // 뒤로 가기
    navigate(1);                    // 앞으로 가기
    navigate('/posts/42', { state: { from: 'list' } }); // state 전달
  }
}

// 받는 쪽
import { useLocation } from 'react-router-dom';
const location = useLocation();
const from = location.state?.from;` } },

          { subtitle: 'Link vs useNavigate' },
          { table: {
            headers: ['도구', '용도', '접근성'],
            rows: [
              ['Link', '클릭으로 이동', '<a> 태그 — 접근성·SEO ↑'],
              ['useNavigate', '함수형 (로그인 성공 후 등)', '이벤트 핸들러 안'],
              ['Navigate', '선언적 리다이렉트', '컴포넌트로 렌더링'],
            ],
          } },

          { subtitle: '중첩 라우트 + Outlet' },
          { code: { lang: 'tsx', content: `<Routes>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />              {/* /admin */}
    <Route path="users" element={<Users />} />           {/* /admin/users */}
    <Route path="posts" element={<Posts />} />           {/* /admin/posts */}
    <Route path="posts/:id" element={<PostDetail />} />  {/* /admin/posts/:id */}
  </Route>
</Routes>

// AdminLayout
import { Outlet } from 'react-router-dom';
function AdminLayout() {
  return (
    <div>
      <AdminSidebar />
      <main><Outlet /></main>   {/* 자식 라우트가 여기 렌더 */}
    </div>
  );
}` } },

          { subtitle: 'NavLink — active 상태 자동' },
          { code: { lang: 'tsx', content: `import { NavLink } from 'react-router-dom';

<NavLink
  to="/about"
  className={({ isActive }) => isActive ? 'menu active' : 'menu'}
>
  About
</NavLink>

// 또는 style
<NavLink
  to="/about"
  style={({ isActive }) => ({
    fontWeight: isActive ? 700 : 400,
    color: isActive ? 'blue' : 'gray',
  })}
>
  About
</NavLink>` } },

          { subtitle: '404 처리' },
          { code: { lang: 'tsx', content: `<Routes>
  {/* 다른 모든 라우트 */}
  <Route path="*" element={<NotFound />} />
</Routes>

function NotFound() {
  return (
    <div>
      <h1>404 — 페이지를 찾을 수 없습니다</h1>
      <Link to="/">홈으로</Link>
    </div>
  );
}` } },

          { subtitle: '실습' },
          { items: [
            '5페이지 SPA (Home/About/Users/UserDetail/NotFound)',
            '/users/:id 동적 라우트 + useParams',
            'NavLink로 활성 메뉴 강조',
            '중첩 /admin 라우트 + Outlet',
            '쿼리 파라미터로 검색 상태 URL 동기화',
          ] },
        ],
      },

      {
        id: 'reg-5-context',
        title: 'Context API — 전역 상태',
        icon: '🌐',
        summary: 'React Context로 인증·테마·언어 등 전역 상태를 props drilling 없이 관리하는 표준 패턴.',
        content: [
          { subtitle: 'Context가 해결하는 문제 — props drilling' },
          { code: { lang: 'tsx', content: `// 문제: user 정보를 깊은 자식에게 전달
<App user={user}>
  <Layout user={user}>
    <Header user={user}>
      <UserMenu user={user} />   {/* 5단계 깊은 곳에서만 사용 */}
    </Header>
  </Layout>
</App>
// 중간 컴포넌트들이 user를 알 필요 없는데 전달만 하는 "drilling"

// 해결: Context
const UserContext = createContext<User | null>(null);
<UserContext.Provider value={user}>
  <App />   {/* 중간 props 없이 어디서든 useContext로 접근 */}
</UserContext.Provider>` } },

          { subtitle: 'Context 표준 패턴' },
          { code: { lang: 'tsx', content: `// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pwd: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 마운트 시 기존 세션 확인
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  async function signIn(email: string, pwd: string) {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, pwd }),
    });
    const data = await res.json();
    setUser(data.user);
  }

  async function signOut() {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 컴포넌트에서 사용하는 hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

// App.tsx
<AuthProvider>
  <Router>
    {/* 어디서든 useAuth() 호출 가능 */}
  </Router>
</AuthProvider>` } },

          { subtitle: 'Context 사용 — useAuth 호출' },
          { code: { lang: 'tsx', content: `function UserMenu() {
  const { user, signOut } = useAuth();
  if (!user) return <Link to="/login">로그인</Link>;
  return (
    <div>
      <span>{user.email}</span>
      <button onClick={signOut}>로그아웃</button>
    </div>
  );
}` } },

          { subtitle: 'Context의 성능 함정' },
          { callout: { type: 'warn', text: 'Context 값이 변하면 그 Context를 구독하는 모든 컴포넌트가 리렌더됩니다. 자주 변하는 값과 거의 안 변하는 값을 한 Context에 묶으면 성능 문제. 분리하세요.' } },
          { code: { lang: 'tsx', content: `// ❌ 한 Context에 다 모음
<AppContext.Provider value={{ user, theme, count, items }}>

// ✅ 관심사별 분리
<AuthContext.Provider value={{ user }}>
  <ThemeContext.Provider value={{ theme }}>
    <CartContext.Provider value={{ items }}>
      <App />
    </CartContext.Provider>
  </ThemeContext.Provider>
</AuthContext.Provider>` } },

          { subtitle: 'value 메모이제이션' },
          { code: { lang: 'tsx', content: `// ❌ 매 렌더마다 새 객체 → 모든 소비자 리렌더
<Ctx.Provider value={{ user, signOut }}>

// ✅ useMemo로 안정화
const value = useMemo(() => ({ user, signOut }), [user, signOut]);
<Ctx.Provider value={value}>` } },

          { subtitle: 'Context vs Zustand·Jotai' },
          { table: {
            headers: ['도구', '복잡도', '강점', '약점'],
            rows: [
              ['useState', '★', '단순', '깊은 전달 불가'],
              ['Context', '★★', 'React 기본', '성능 주의'],
              ['Zustand', '★★', '간결, 외부 store', '학습 필요'],
              ['Jotai', '★★', '원자 단위 상태', 'mental model 전환'],
              ['Redux Toolkit', '★★★★', '대형 앱 검증', '보일러플레이트'],
            ],
          } },

          { subtitle: '실습' },
          { items: [
            'AuthContext + ThemeContext 두 개 분리해서 작성',
            'useMemo로 value 메모이제이션',
            '로그인 → 헤더에 사용자 이름 표시 → 로그아웃 흐름',
            '테마 토글 + localStorage 저장 + 시스템 설정 감지',
          ] },
        ],
      },

      {
        id: 'reg-5-authguard',
        title: 'AuthGuard — 인증 보호 패턴',
        icon: '🛡️',
        summary: '로그인이 필요한 페이지를 보호하는 표준 패턴. Navigate 리다이렉트, location 보존, 권한 기반 분기까지.',
        content: [
          { subtitle: 'AuthGuard 기본' },
          { code: { lang: 'tsx', content: `// src/components/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props { children: React.ReactNode; }

export default function AuthGuard({ children }: Props) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>로딩…</p>;

  if (!user) {
    // 로그인 후 원래 가려던 곳으로 돌아가도록 state에 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}` } },

          { subtitle: '사용 — 보호된 라우트' },
          { code: { lang: 'tsx', content: `<Routes>
  <Route path="/"       element={<Home />} />
  <Route path="/login"  element={<Login />} />

  <Route path="/dashboard" element={
    <AuthGuard><Dashboard /></AuthGuard>
  } />

  <Route path="/profile" element={
    <AuthGuard><Profile /></AuthGuard>
  } />
</Routes>` } },

          { subtitle: '로그인 후 원래 페이지로 복귀' },
          { code: { lang: 'tsx', content: `// Login.tsx
function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
    navigate(from, { replace: true });   // 원래 가려던 곳으로
  }

  // ...
}` } },

          { subtitle: '권한 기반 분기 — AdminGuard' },
          { code: { lang: 'tsx', content: `interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin';
}

export default function AdminGuard({ children, requiredRole = 'admin' }: AdminGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p>로딩…</p>;
  if (!user) return <Navigate to="/login" replace />;

  // 권한 검사
  const hasPermission =
    user.role === 'superadmin' ||
    (requiredRole === 'admin' && user.role === 'admin');

  if (!hasPermission) {
    return (
      <div>
        <h1>접근 권한 없음</h1>
        <p>이 페이지는 관리자만 접근할 수 있습니다.</p>
        <Link to="/">홈으로</Link>
      </div>
    );
  }

  return <>{children}</>;
}

// 사용
<Route path="/admin" element={
  <AdminGuard requiredRole="admin"><AdminDashboard /></AdminGuard>
} />` } },

          { subtitle: '레이아웃 단위 보호 — Outlet과 결합' },
          { code: { lang: 'tsx', content: `<Routes>
  <Route element={<AuthGuard><PrivateLayout /></AuthGuard>}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile"   element={<Profile />} />
    <Route path="/settings"  element={<Settings />} />
  </Route>
</Routes>

// AuthGuard 한 번 + 모든 자식 라우트 보호
function PrivateLayout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
    </>
  );
}` } },

          { subtitle: '서버 검증과 함께' },
          { callout: { type: 'warn', text: '⚠️ 클라이언트 가드만 신뢰하지 마세요. DevTools로 우회 가능. 진짜 보안은 서버(또는 RLS)에서. AuthGuard는 UX 개선용.' } },

          { subtitle: '실습' },
          { items: [
            'AuthGuard 컴포넌트 작성',
            '/dashboard 보호 + 로그인 후 복귀 동작 확인',
            'AdminGuard로 /admin 보호',
            '레이아웃 단위 보호 — 5개 페이지 한 번에',
          ] },
        ],
      },

      {
        id: 'reg-5-lazy',
        title: 'React.lazy + Suspense — 코드 스플리팅',
        icon: '⚡',
        summary: '초기 번들 크기 절감의 절대 강자. 라우트별 lazy 로딩으로 첫 화면 표시 속도를 2~3배 개선.',
        content: [
          { subtitle: '왜 코드 스플리팅인가' },
          { text: '기본 React 앱은 모든 페이지 코드를 첫 로드 시 다운로드. 사용자는 첫 페이지만 보면서 나머지 코드도 받는 셈. 코드 스플리팅 = 사용자가 그 라우트에 진입할 때만 해당 코드 다운로드.' },

          { subtitle: 'React.lazy 기본' },
          { code: { lang: 'tsx', content: `import { lazy, Suspense } from 'react';

// 정적 import 대신 lazy
const About    = lazy(() => import('./pages/About'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div>로딩 중…</div>}>
      <Routes>
        <Route path="/about"    element={<About />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}` } },

          { subtitle: 'Suspense fallback 디자인' },
          { code: { lang: 'tsx', content: `// 단순 텍스트보다 스켈레톤이 UX 좋음
function PageSkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}

<Suspense fallback={<PageSkeleton />}>
  <Routes>...</Routes>
</Suspense>

// 여러 Suspense 중첩 가능 — 부분 로딩
<Suspense fallback={<HeaderSkeleton />}>
  <Header />
  <Suspense fallback={<MainSkeleton />}>
    <Main />
  </Suspense>
</Suspense>` } },

          { subtitle: '청크 분할 결과 확인' },
          { items: [
            'npm run build 후 dist/assets 폴더 확인',
            '각 lazy 컴포넌트가 별도 .js 파일',
            '예: About-c9wxF22v.js, Settings-DXV0Jpps.js',
            'Chrome DevTools Network 탭 → 라우트 이동 시 새 청크 다운로드 확인',
          ] },

          { subtitle: '에러 처리 — ErrorBoundary' },
          { code: { lang: 'tsx', content: `// 청크 다운로드 실패 시 (네트워크 문제)
import { Component, type ReactNode } from 'react';

interface State { hasError: boolean; }
interface Props { children: ReactNode; fallback?: ReactNode; }

class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Page load error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>오류 발생. 새로고침 해주세요.</div>;
    }
    return this.props.children;
  }
}

// 사용 — Suspense와 함께
<ErrorBoundary>
  <Suspense fallback={<PageSkeleton />}>
    <Routes>...</Routes>
  </Suspense>
</ErrorBoundary>` } },

          { subtitle: '컴포넌트 단위 lazy — 무거운 모달' },
          { code: { lang: 'tsx', content: `// 큰 차트 라이브러리를 사용하는 모달
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <>
      <button onClick={() => setShowChart(true)}>차트 보기</button>
      {showChart && (
        <Suspense fallback={<div>차트 로딩…</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </>
  );
}` } },

          { subtitle: 'preload 힌트 — 미리 로드' },
          { code: { lang: 'tsx', content: `// hover 시 미리 다운로드
const About = lazy(() => import('./pages/About'));

function NavMenu() {
  function preload() {
    import('./pages/About');   // 캐시에 미리 받음
  }

  return (
    <Link to="/about" onMouseEnter={preload}>
      About
    </Link>
  );
}
// 사용자가 클릭할 때쯤 다운로드 완료 → 즉시 표시` } },

          { subtitle: '실습' },
          { items: [
            '5개 페이지 모두 lazy 적용',
            'PageSkeleton fallback 작성',
            'ErrorBoundary로 감싸기',
            'npm run build 후 청크 파일 확인',
            'Network throttling으로 slow 3G에서 동작 검증',
          ] },
        ],
      },

      {
        id: 'reg-5-practice',
        title: '실습 · 본격 SPA 구축 (3시간)',
        icon: '🧪',
        summary: 'React Router + Context + AuthGuard + lazy를 모두 결합한 미니 LMS 구조를 완성합니다.',
        content: [
          { subtitle: '프로젝트 목표' },
          { text: '본 강의 사이트(rest.dreamitbiz.com)의 축소판을 직접 만들면서 본 강의가 어떻게 동작하는지 이해합니다.' },

          { subtitle: '구조' },
          { code: { lang: 'text', content: `/                    Home (공개)
/about               About (공개)
/login               Login (공개)
/dashboard           Dashboard (로그인 필요)
  /profile           내 프로필
  /courses           내 수강 과정
/admin               관리자 (admin 권한)
  /students          학생 관리
  /courses           과정 관리` } },

          { subtitle: '단계별 구현' },
          { items: [
            '1단계 (30분): Vite 프로젝트 셋업 + 폴더 구조',
            '2단계 (30분): AuthContext + ThemeContext 작성',
            '3단계 (30분): AuthGuard·AdminGuard 작성',
            '4단계 (60분): 5개 페이지 + 중첩 라우트 + Outlet',
            '5단계 (30분): 모든 페이지 lazy + Suspense + ErrorBoundary',
          ] },

          { subtitle: '체크리스트' },
          { items: [
            '☐ 비로그인 시 /dashboard → /login 자동 리다이렉트',
            '☐ 로그인 성공 후 원래 가려던 페이지로 복귀',
            '☐ admin이 아닌 사용자가 /admin 접근 시 권한 없음 표시',
            '☐ 모든 페이지가 별도 청크로 분리됨',
            '☐ 네트워크 끊김 시 ErrorBoundary 동작',
            '☐ 테마 토글 + localStorage 보존',
          ] },

          { subtitle: '확장 과제' },
          { items: [
            '쿼리 파라미터로 정렬·필터 상태 URL 동기화',
            'NavLink로 활성 메뉴 강조',
            '404 페이지에 추천 링크 제공',
            'hover preload로 페이지 전환 즉시',
            '경로 변경 시 스크롤 맨 위로',
          ] },
        ],
      },

      {
        id: 'reg-5-practice-2',
        title: '실습 2 · 동적 라우트 + useParams (25분)',
        icon: '🧪',
        summary: '/users/:id 같은 동적 라우트, 쿼리 파라미터, useNavigate 등 라우터 핵심 기능 실습.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '동적 파라미터 useParams로 읽기',
            '쿼리 파라미터 useSearchParams',
            'useNavigate로 프로그래매틱 이동',
          ] },

          { subtitle: '구현' },
          { code: { lang: 'tsx', content: `// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/posts/:year/:slug" element={<Post />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}` } },
          { code: { lang: 'tsx', content: `// src/pages/UserList.tsx — 쿼리 파라미터
import { useSearchParams, Link } from 'react-router-dom';

export default function UserList() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') || 'all';
  const page = Number(params.get('page')) || 1;

  return (
    <div>
      <select
        value={filter}
        onChange={e => setParams({ filter: e.target.value, page: '1' })}
      >
        <option value="all">전체</option>
        <option value="active">활성</option>
      </select>

      {/* /users/42처럼 동적 링크 */}
      <Link to="/users/42">홍길동 상세</Link>
      <Link to={\`/users/42?from=list\`}>상세 (출처 전달)</Link>
    </div>
  );
}

// src/pages/UserDetail.tsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = new URLSearchParams(location.search).get('from');

  return (
    <div>
      <button onClick={() => navigate(-1)}>← 뒤로</button>
      <h1>사용자 #{id}</h1>
      {from && <small>출처: {from}</small>}
      <button onClick={() => navigate('/', { replace: true })}>
        홈으로 (history 교체)
      </button>
    </div>
  );
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ /users/:id 동적 파라미터 정상 표시',
            '☐ 쿼리 변경 시 URL 동기화',
            '☐ navigate(-1) 뒤로 가기',
            '☐ replace: true로 history 교체',
            '☐ /posts/2026/hello 같은 다중 파라미터',
          ] },
        ],
      },

      {
        id: 'reg-5-practice-3',
        title: '실습 3 · Context API로 인증 상태 (30분)',
        icon: '🧪',
        summary: 'AuthContext + useAuth Hook 패턴으로 props drilling 없이 인증 상태 전역 공유.',
        content: [
          { subtitle: '구현' },
          { code: { lang: 'tsx', content: `// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';

interface User { id: string; email: string; role: string; }
interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pwd: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 복원 (실제로는 토큰 검증)
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, pwd: string) => {
    // 실제로는 API 호출
    await new Promise(r => setTimeout(r, 500));
    const u = { id: '1', email, role: email === 'admin@test.com' ? 'admin' : 'user' };
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // value 메모이제이션 — 불필요한 리렌더 방지
  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}` } },

          { subtitle: '사용 — 깊은 자식 컴포넌트' },
          { code: { lang: 'tsx', content: `// src/components/layout/UserMenu.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) {
    return <Link to="/login">로그인</Link>;
  }

  return (
    <div>
      <span>{user.email}</span>
      <button onClick={signOut}>로그아웃</button>
    </div>
  );
}

// 100단계 깊이여도 useAuth() 한 줄로 접근` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ Context + Provider + Hook 3종 세트',
            '☐ useMemo로 value 안정화',
            '☐ Provider 외부 사용 시 에러',
            '☐ localStorage 복원',
            '☐ 로그아웃 시 깨끗하게 초기화',
          ] },
        ],
      },

      {
        id: 'reg-5-practice-4',
        title: '실습 4 · AuthGuard + AdminGuard 보호 (25분)',
        icon: '🧪',
        summary: '로그인이 필요한 라우트 + 관리자 전용 라우트를 보호하는 표준 패턴.',
        content: [
          { subtitle: '구현' },
          { code: { lang: 'tsx', content: `// src/components/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>로딩…</p>;
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// src/components/AdminGuard.tsx
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p>로딩…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') {
    return (
      <div>
        <h1>접근 권한 없음</h1>
        <p>관리자만 접근 가능합니다.</p>
      </div>
    );
  }
  return <>{children}</>;
}

// 사용
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />

  <Route path="/dashboard" element={
    <AuthGuard><Dashboard /></AuthGuard>
  } />

  <Route path="/admin/*" element={
    <AdminGuard><AdminLayout /></AdminGuard>
  }>
    <Route path="users" element={<AdminUsers />} />
    <Route path="settings" element={<AdminSettings />} />
  </Route>
</Routes>` } },

          { subtitle: 'Login에서 복귀 처리' },
          { code: { lang: 'tsx', content: `// src/pages/Login.tsx
function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
    navigate(from, { replace: true });   // 원래 가려던 곳으로
  }
}

// 시나리오:
// 1. 비로그인 → /dashboard 접근 → /login으로 이동 (state.from 저장)
// 2. 로그인 성공 → /dashboard로 자동 복귀
// 3. 뒤로 가기 → /login 안 나옴 (replace 효과)` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 비로그인 시 /dashboard → /login 자동 이동',
            '☐ 로그인 성공 후 /dashboard 자동 복귀',
            '☐ admin@test.com → /admin 접근 가능',
            '☐ 일반 사용자 → /admin 차단',
            '☐ 로딩 중 깜빡임 없음',
          ] },
        ],
      },

      {
        id: 'reg-5-practice-5',
        title: '실습 5 · React.lazy 코드 스플리팅 (25분)',
        icon: '🧪',
        summary: '5개 페이지를 모두 lazy 로딩으로 분리. 청크 분할 + Suspense fallback + ErrorBoundary.',
        content: [
          { subtitle: '구현' },
          { code: { lang: 'tsx', content: `// src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

// 정적 import 대신 lazy
const Home      = lazy(() => import('@/pages/Home'));
const About     = lazy(() => import('@/pages/About'));
const UserList  = lazy(() => import('@/pages/UserList'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin     = lazy(() => import('@/pages/Admin'));
const NotFound  = lazy(() => import('@/pages/NotFound'));

function PageSkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/about"   element={<About />} />
            <Route path="/users"   element={<UserList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*"        element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}` } },

          { subtitle: 'preload 힌트' },
          { code: { lang: 'tsx', content: `// hover 시 미리 다운로드
function NavMenu() {
  function preloadAbout() {
    import('@/pages/About');
  }

  return (
    <Link to="/about" onMouseEnter={preloadAbout}>
      About
    </Link>
  );
}` } },

          { subtitle: '검증' },
          { items: [
            'npm run build → dist/assets에 청크 여러 개',
            '브라우저 Network 탭 → 페이지 이동 시 새 청크 다운로드',
            'Slow 3G throttling → fallback 표시 확인',
            '의도적으로 페이지 1개의 dist 파일을 삭제 → ErrorBoundary 동작',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 5개 페이지 모두 별도 청크',
            '☐ PageSkeleton fallback 동작',
            '☐ ErrorBoundary로 청크 로드 실패 처리',
            '☐ hover preload',
            '☐ 초기 번들 크기 비교 (Before/After)',
          ] },
        ],
      },

      {
        id: 'reg-5-practice-6',
        title: '실습 6 · NavLink + 중첩 라우트 + Outlet (20분)',
        icon: '🧪',
        summary: '활성 메뉴 자동 강조 + 중첩 라우트 + Outlet으로 레이아웃 재사용.',
        content: [
          { subtitle: '구현' },
          { code: { lang: 'tsx', content: `// src/App.tsx — 중첩 라우트
<Routes>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminHome />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="users/:id" element={<AdminUserDetail />} />
    <Route path="settings" element={<AdminSettings />} />
  </Route>
</Routes>

// src/layouts/AdminLayout.tsx
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <nav>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => isActive ? 'menu active' : 'menu'}
          >
            홈
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'menu active' : 'menu'}>
            사용자
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'menu active' : 'menu'}>
            설정
          </NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />   {/* 자식 라우트가 여기 렌더링 */}
      </main>
    </div>
  );
}` } },

          { subtitle: 'NavLink end prop' },
          { code: { lang: 'tsx', content: `// end가 없으면 — /admin/users에서도 /admin의 NavLink active
<NavLink to="/admin">홈</NavLink>   // ⚠️ /admin/users에서도 active

// end 추가 — 정확히 일치할 때만 active
<NavLink to="/admin" end>홈</NavLink>   // ✅ /admin에서만 active` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ /admin·/admin/users·/admin/settings 모두 동일 레이아웃',
            '☐ 현재 페이지의 메뉴만 강조',
            '☐ end prop 정확한 매칭',
            '☐ /admin/users/42처럼 동적 자식 라우트도 동작',
          ] },
        ],
      },

      {
        id: 'reg-5-resources',
        title: '심화 자료',
        icon: '📚',
        summary: 'React Router·Context·코드 스플리팅 심화 학습 자료 + 자가 평가.',
        content: [
          { subtitle: '심화 자료' },
          { items: [
            'React Router 공식: reactrouter.com',
            'TanStack Router: tanstack.com/router (타입 안전 라우터)',
            'Zustand: github.com/pmndrs/zustand',
            'Jotai: jotai.org',
            'TanStack Query: tanstack.com/query (서버 상태)',
          ] },

          { subtitle: '심화 주제 — 본 강의 이후' },
          { items: [
            'Data Router API — loader/action으로 데이터 fetch 통합',
            'TanStack Query — 서버 상태 캐싱 + 자동 재요청',
            'Suspense for Data Fetching (React 19+)',
            'React Compiler — 자동 메모이제이션',
            'Next.js App Router — 풀스택 React',
          ] },

          { subtitle: 'Day 5 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['React Router', '기본 라우트만', '동적 라우트 + useParams', '중첩 + Outlet + NavLink'],
              ['Context', '없음', '1개 Context', '관심사 분리 + useMemo'],
              ['AuthGuard', '없음', '단순 리다이렉트', '권한 분기 + location 보존'],
              ['Code Splitting', '없음', '일부 lazy', '모든 페이지 + ErrorBoundary'],
            ],
          } },
        ],
      },
    ],
  },

  {
    id: 'reg-6',
    title: 'Day 7 · Supabase 백엔드',
    icon: '🗄️',
    description: 'Supabase 프로젝트 셋업부터 Auth(회원가입/소셜로그인), Database(CRUD), RLS(행 단위 보안), Storage(파일 업로드)까지 풀스택 백엔드를 코드로 구축합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', '프로젝트 생성 + 클라이언트 초기화 + Auth', '이메일 회원가입·로그인 성공'],
          ['S2', '50분', 'PostgreSQL 테이블 설계 + CRUD', '게시판 테이블 + 글 작성·조회'],
          ['S3', '50분', 'RLS 정책 (가장 중요)', '본인 글만 수정·삭제 보장'],
          ['S4', '50분', 'Storage 업로드 + 통합 실습', '프로필 사진 업로드'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        'Supabase 프로젝트 생성 + .env 연동을 완료한다',
        'Email/Google/Kakao OAuth 인증을 구현한다',
        'PostgreSQL 테이블 설계 + 클라이언트에서 CRUD를 수행한다',
        'RLS 정책으로 행 단위 데이터 보안을 적용한다',
      ] },

      { subtitle: 'Supabase는 무엇인가' },
      { text: 'PostgreSQL을 핵심에 두고 Auth · Storage · Realtime · Edge Functions를 통합 제공하는 오픈소스 Firebase 대안. SQL 표준을 그대로 쓸 수 있고, RLS로 보안을 데이터베이스 계층에서 처리하는 점이 가장 큰 차이입니다.' },
      { table: {
        headers: ['항목', 'Firebase', 'Supabase'],
        rows: [
          ['DB', 'Firestore (NoSQL)', 'PostgreSQL (관계형)'],
          ['Auth', '소셜 다수 지원', 'Email/OAuth/Magic Link'],
          ['Storage', '버킷', '버킷 + 정책'],
          ['실시간', 'onSnapshot', 'channel().on()'],
          ['오픈소스', '아니오', '예 (자가 호스팅 가능)'],
          ['쿼리', 'SDK 전용', 'SQL + SDK'],
        ],
      } },

      { subtitle: '프로젝트 셋업' },
      { code: { lang: 'bash', content: `# 1) supabase.com 가입 → New Project
# 2) Project URL과 anon key를 .env.local에 저장
echo "VITE_SUPABASE_URL=https://xxxx.supabase.co" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=eyJ..."              >> .env.local

# 3) 클라이언트 SDK 설치
npm install @supabase/supabase-js` } },

      { subtitle: 'Supabase 클라이언트 초기화' },
      { code: { lang: 'typescript', content: `// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Supabase env vars missing');
}

export const supabase = createClient(url, anonKey);` } },
      { callout: { type: 'info', text: 'anon key는 클라이언트에 노출되어도 안전합니다 — 권한이 RLS 정책에 의해 데이터베이스 레벨에서 제한되기 때문입니다. service_role key는 절대 클라이언트에 두지 마세요.' } },

      { subtitle: '인증 — Email + 소셜' },
      { code: { lang: 'typescript', content: `// 이메일 회원가입
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// 이메일 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Google OAuth
await supabase.auth.signInWithOAuth({ provider: 'google' });

// Kakao OAuth
await supabase.auth.signInWithOAuth({ provider: 'kakao' });

// 로그아웃
await supabase.auth.signOut();

// 현재 사용자
const { data: { user } } = await supabase.auth.getUser();

// 인증 상태 변화 구독
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session); // SIGNED_IN, SIGNED_OUT, ...
});` } },

      { subtitle: 'CRUD — Database' },
      { code: { lang: 'typescript', content: `// SELECT — 전체
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

// SELECT — 조건
const { data } = await supabase
  .from('posts')
  .select('id, title, author:users(name)')   // 관계 조인
  .eq('status', 'published')
  .ilike('title', '%AI%');                   // LIKE 검색

// INSERT
const { data, error } = await supabase
  .from('posts')
  .insert({ title: '제목', body: '본문' })
  .select()
  .single();

// UPDATE
await supabase
  .from('posts')
  .update({ title: '수정된 제목' })
  .eq('id', 42);

// DELETE
await supabase.from('posts').delete().eq('id', 42);` } },

      { subtitle: 'RLS — 행 단위 보안 (가장 중요)' },
      { text: 'RLS(Row Level Security)는 사용자별로 볼 수 있는 행을 데이터베이스 정책으로 제어합니다. 클라이언트가 anon key로 직접 호출해도 정책에 위배되는 행은 반환되지 않습니다.' },
      { code: { lang: 'sql', content: `-- 1) RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 2) 정책 추가
-- 본인이 작성한 글만 SELECT
CREATE POLICY "Users read own posts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

-- 본인 글만 UPDATE
CREATE POLICY "Users update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- 누구나 INSERT (단, author_id를 본인으로)
CREATE POLICY "Users insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);` } },

      { subtitle: 'Storage — 파일 업로드' },
      { code: { lang: 'typescript', content: `// 업로드
const file = event.target.files[0];
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(\`\${userId}/profile.jpg\`, file, {
    contentType: file.type,
    upsert: true,            // 같은 경로면 덮어쓰기
  });

// 공개 URL 얻기
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(\`\${userId}/profile.jpg\`);` } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "RLS 없이도 동작은 되는데 꼭 필요한가요?" — 절대 필수. anon key가 노출된 상황에서 RLS 없으면 누구나 모든 데이터 접근·수정 가능.',
        'Q. "service_role key는 언제 쓰나요?" — 서버 측(Edge Function·백엔드)에서만. RLS를 우회하므로 클라이언트 노출 시 치명적.',
        'Q. "PostgreSQL을 처음 배우는데?" — Supabase Dashboard에서 SQL 에디터로 연습. ChatGPT에게 "SQL 학습 로드맵" 요청도 효과적.',
        'Q. "관계형 테이블 조인은?" — supabase.from(\'posts\').select(\'*, author:users(name)\')처럼 자동 조인 지원.',
        'Q. "월 무료 한도는?" — 500MB DB, 1GB Storage, 50K MAU, 5GB 트래픽. 학습·MVP에는 충분.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. Supabase 클라이언트 초기화에 필요한 인자 2가지는?',
        '2. RLS의 정식 명칭은?',
        '3. auth.uid()는 SQL 정책에서 무엇을 반환하는가?',
        '4. INSERT 정책에 USING이 아닌 WITH CHECK를 쓰는 이유는?',
        '5. Storage 버킷의 공개 URL은 어떻게 얻는가?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) project URL, anon key  2) Row Level Security  3) 현재 로그인한 사용자의 UUID  4) INSERT는 새 행이므로 기존 행 검사가 아닌 새 행 검사 필요  5) supabase.storage.from(버킷).getPublicUrl(경로)' } },

      { subtitle: '참고 자료' },
      { items: [
        'Supabase 공식: supabase.com/docs (한국어 일부)',
        'RLS 깊이 학습: supabase.com/docs/guides/auth/row-level-security',
        '강의: Supabase YouTube 공식 채널',
        '한국어 블로그: dev.to에서 "Supabase 한국어" 검색',
        '실전 예제: github.com/supabase/supabase 의 examples 폴더',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        'Supabase 프로젝트 생성 + .env 설정 + 클라이언트 초기화',
        '이메일 회원가입/로그인 폼 구현 (테스트 계정으로 동작 확인)',
        '"posts" 테이블 생성 (id/title/body/author_id/created_at) + RLS 활성화',
        'RLS 정책 4종 (SELECT·INSERT·UPDATE·DELETE) 각각 작성',
        '게시판 CRUD UI 구현 (글 작성·목록·수정·삭제)',
        '의도적으로 다른 사용자 글 수정 시도 → RLS가 차단하는지 확인',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 7부터는 팀 프로젝트 본격 시작. PRD 작성·사용자 스토리·MoSCoW 우선순위로 4주 안에 완성할 범위를 결정합니다.' },
    ],
    subSections: [
      {
        id: 'reg-6-setup',
        title: 'Supabase 셋업 + 클라이언트 초기화',
        icon: '🔧',
        summary: 'supabase.com 가입부터 프로젝트 생성, API 키 발급, .env 설정, SDK 설치, 클라이언트 초기화까지 1시간 셋업 가이드.',
        content: [
          { subtitle: 'Supabase가 왜 사랑받는가' },
          { text: '오픈소스 Firebase 대안. PostgreSQL을 핵심에 둬서 SQL을 그대로 쓸 수 있고, RLS로 보안을 DB 레벨에서 처리. 무료 티어가 넉넉해 학습·MVP에 충분.' },

          { subtitle: '계정 + 프로젝트 생성' },
          { items: [
            '1. supabase.com 가입 (GitHub 계정 권장)',
            '2. New Project 클릭',
            '3. 프로젝트명 입력 (예: rest-academy)',
            '4. 데이터베이스 비밀번호 설정 (꼭 저장!)',
            '5. Region: Northeast Asia (Seoul) — 한국 사용자 권장',
            '6. Pricing Plan: Free',
            '7. 약 2분 후 프로젝트 준비 완료',
          ] },

          { subtitle: 'API 키 확인' },
          { code: { lang: 'text', content: `Supabase Dashboard → Settings → API

[Project URL]
https://xxxxxxxxxxxxxxxx.supabase.co

[Project API keys]
- anon (public): eyJhbGciOi...    ← 클라이언트에서 사용 (안전)
- service_role:  eyJhbGciOi...    ← 절대 클라이언트에 두지 말 것

⚠️ service_role 키는 RLS를 우회하므로 노출 시 모든 데이터 위험` } },

          { subtitle: '.env 설정' },
          { code: { lang: 'bash', content: `# .env.local
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# .env.example (커밋용 — 실제 값 대신 placeholder)
VITE_SUPABASE_URL=YOUR_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY` } },

          { subtitle: 'SDK 설치' },
          { code: { lang: 'bash', content: `npm install @supabase/supabase-js` } },

          { subtitle: '클라이언트 초기화 (싱글톤)' },
          { code: { lang: 'typescript', content: `// src/utils/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
}

// 싱글톤 — 앱 전체에서 한 인스턴스만 사용
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: {
        persistSession: true,       // 새로고침 후 세션 유지
        autoRefreshToken: true,     // 만료 전 자동 갱신
        detectSessionInUrl: true,   // OAuth 콜백 자동 처리
      },
    });
  }
  return _client;
}

// 사용
import { getSupabase } from '@/utils/supabase';
const supabase = getSupabase();` } },

          { subtitle: '동작 확인' },
          { code: { lang: 'typescript', content: `// 가장 단순한 테스트
async function ping() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('test').select('*').limit(1);
  // 테이블이 없어도 에러 메시지로 연결 확인 가능
  console.log({ data, error });
}
ping();` } },

          { subtitle: '실습' },
          { items: [
            'Supabase 가입 + 프로젝트 생성',
            '.env.local에 키 저장',
            'getSupabase() 싱글톤 함수 작성',
            '브라우저 콘솔에서 ping() 실행 + 응답 확인',
          ] },
        ],
      },

      {
        id: 'reg-6-auth',
        title: 'Auth — 회원가입·로그인·소셜',
        icon: '🔐',
        summary: 'Supabase Auth로 이메일·Google·Kakao 로그인을 모두 구현. 세션 관리·자동 갱신·로그아웃까지.',
        content: [
          { subtitle: '이메일 회원가입' },
          { code: { lang: 'typescript', content: `const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'min6chars',
  options: {
    data: {                 // user_metadata에 저장
      display_name: '홍길동',
    },
    emailRedirectTo: 'https://my-app.com/auth/callback',
  },
});

// data.user 가 생성됨
// 기본적으로 이메일 인증 링크가 발송됨 (Supabase Dashboard에서 비활성 가능)` } },

          { subtitle: '이메일 로그인' },
          { code: { lang: 'typescript', content: `const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: '...',
});

if (error) {
  // error.message 예: "Invalid login credentials"
  return;
}

// data.session.access_token, data.user 접근 가능` } },

          { subtitle: 'OAuth — Google/Kakao' },
          { code: { lang: 'typescript', content: `// Google
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin + '/auth/callback',
  },
});
// 브라우저가 Google 로그인 페이지로 이동
// 인증 후 redirectTo로 돌아옴 + 세션 자동 설정

// Kakao
await supabase.auth.signInWithOAuth({ provider: 'kakao' });

// 사용 가능한 provider:
// google, kakao, facebook, github, apple, azure, gitlab, ...` } },

          { subtitle: 'Provider 활성화 (Dashboard 설정)' },
          { items: [
            'Supabase Dashboard → Authentication → Providers',
            'Google: Client ID + Secret (Google Cloud Console에서 발급)',
            'Kakao: REST API Key (Kakao Developers에서 발급)',
            'Redirect URL을 각 Provider에 등록 (https://xxxx.supabase.co/auth/v1/callback)',
            'Site URL도 Authentication → URL Configuration에 등록',
          ] },

          { subtitle: '현재 사용자 + 세션' },
          { code: { lang: 'typescript', content: `// 현재 사용자
const { data: { user } } = await supabase.auth.getUser();

// 현재 세션 (access_token 등 포함)
const { data: { session } } = await supabase.auth.getSession();

// 메타데이터
user.email
user.user_metadata.display_name
user.app_metadata.provider   // 'email' / 'google' / 'kakao'` } },

          { subtitle: '인증 상태 변화 구독 — onAuthStateChange' },
          { code: { lang: 'typescript', content: `// AuthContext에서 활용
useEffect(() => {
  // 1) 초기 세션 확인
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  // 2) 변화 구독
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log(event);   // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, ...
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);` } },

          { subtitle: '비밀번호 재설정' },
          { code: { lang: 'typescript', content: `// 1) 사용자가 "비밀번호 잊음" → 이메일 입력
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://my-app.com/reset-password',
});
// 사용자에게 재설정 링크 이메일 발송

// 2) 사용자가 링크 클릭 → /reset-password 페이지에서 새 비밀번호 입력
await supabase.auth.updateUser({ password: 'new-password' });` } },

          { subtitle: '로그아웃' },
          { code: { lang: 'typescript', content: `await supabase.auth.signOut();
// 모든 토큰 제거 + onAuthStateChange가 SIGNED_OUT 발생` } },

          { subtitle: 'AuthContext 통합 예제' },
          { code: { lang: 'tsx', content: `// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '@/utils/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pwd: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sb = getSupabase();

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, pwd: string) => {
    const { error } = await sb.auth.signInWithPassword({ email, password: pwd });
    if (error) throw error;
  };

  const signOut = async () => { await sb.auth.signOut(); };
  const signInWithGoogle = async () => {
    await sb.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}` } },

          { subtitle: '실습' },
          { items: [
            '이메일 회원가입 + 로그인 + 로그아웃 폼',
            'Google OAuth 활성화 + 로그인 동작',
            'AuthContext 작성 + useAuth Hook',
            '로그인 후 user.email 화면 표시',
          ] },
        ],
      },

      {
        id: 'reg-6-crud',
        title: 'Database CRUD — PostgreSQL + SDK',
        icon: '🗄️',
        summary: 'Supabase 테이블 생성·관계·인덱스·SDK로 SELECT/INSERT/UPDATE/DELETE까지 풀세트.',
        content: [
          { subtitle: '테이블 생성 — Dashboard SQL Editor' },
          { code: { lang: 'sql', content: `-- 게시판 예제
create table posts (
  id          bigserial primary key,
  title       text not null,
  body        text,
  author_id   uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 인덱스 (자주 조회되는 컬럼)
create index posts_author_idx on posts (author_id);
create index posts_status_idx on posts (status);

-- 자동 updated_at 갱신 트리거
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at_trigger
  before update on posts
  for each row execute function set_updated_at();` } },

          { subtitle: 'SELECT — 다양한 패턴' },
          { code: { lang: 'typescript', content: `// 전체 조회
const { data, error } = await supabase
  .from('posts')
  .select('*');

// 특정 컬럼만
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at');

// WHERE 조건
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')          // =
  .gt('created_at', '2026-01-01')      // >
  .ilike('title', '%AI%');             // ILIKE

// 정렬 + 페이지네이션
const { data } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 9);                        // 첫 10개

// 관계 조인
const { data } = await supabase
  .from('posts')
  .select('id, title, author:users(name, email)');

// 단일 행
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('id', 1)
  .single();                           // 정확히 1개 반환` } },

          { subtitle: 'INSERT' },
          { code: { lang: 'typescript', content: `// 단일 행
const { data, error } = await supabase
  .from('posts')
  .insert({ title: '제목', body: '본문' })
  .select()                            // 삽입된 행 반환
  .single();

// 다중 행
await supabase
  .from('posts')
  .insert([
    { title: '글1', body: '본문1' },
    { title: '글2', body: '본문2' },
  ]);

// upsert (있으면 update, 없으면 insert)
await supabase
  .from('posts')
  .upsert({ id: 1, title: '수정 또는 생성' });` } },

          { subtitle: 'UPDATE' },
          { code: { lang: 'typescript', content: `// 특정 행
const { error } = await supabase
  .from('posts')
  .update({ title: '수정된 제목' })
  .eq('id', 42);

// 여러 조건
await supabase
  .from('posts')
  .update({ status: 'archived' })
  .eq('author_id', userId)
  .lt('created_at', '2025-01-01');` } },

          { subtitle: 'DELETE' },
          { code: { lang: 'typescript', content: `// 단일
await supabase
  .from('posts')
  .delete()
  .eq('id', 42);

// 여러 행
await supabase
  .from('posts')
  .delete()
  .eq('status', 'archived');

// 안전장치: 항상 조건 명시 (조건 없으면 전체 삭제!)
// .delete().match({ id: 42 })도 가능` } },

          { subtitle: '에러 처리 표준' },
          { code: { lang: 'typescript', content: `async function safeFetch() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      // PostgrestError — code, message, details, hint 포함
      if (error.code === 'PGRST116') {
        // 결과 없음 (single 사용 시)
        return null;
      }
      throw error;
    }

    return data;
  } catch (err) {
    console.error('DB 오류:', err);
    return null;
  }
}` } },

          { subtitle: 'TypeScript 타입 자동 생성' },
          { code: { lang: 'bash', content: `# Supabase CLI 설치
npm install -D supabase

# 로그인
npx supabase login

# 타입 생성 (스키마 → TypeScript)
npx supabase gen types typescript \\
  --project-id <your-project-id> \\
  > src/types/database.ts

# 사용
import { Database } from '@/types/database';
type Post = Database['public']['Tables']['posts']['Row'];` } },

          { subtitle: '실습' },
          { items: [
            'posts 테이블 + 인덱스 + updated_at 트리거 생성',
            'SDK로 CRUD 4종 모두 동작',
            'IL IKE 검색 + 페이지네이션',
            'author 관계 조인',
            'TypeScript 타입 자동 생성',
          ] },
        ],
      },

      {
        id: 'reg-6-rls',
        title: 'RLS — 행 단위 보안 (필수)',
        icon: '🛡️',
        summary: 'Row Level Security — Supabase 보안의 핵심. SELECT·INSERT·UPDATE·DELETE 정책 4종을 SQL로 직접 작성.',
        content: [
          { subtitle: 'RLS가 왜 절대 필수인가' },
          { callout: { type: 'warn', text: 'RLS를 끄면 anon key를 가진 누구나(브라우저 DevTools 사용자 포함) 모든 데이터를 조회·수정·삭제할 수 있습니다. Supabase 보안의 핵심.' } },

          { subtitle: 'RLS 활성화' },
          { code: { lang: 'sql', content: `-- 테이블에 RLS 켜기 (반드시 첫 단계)
alter table posts enable row level security;

-- 이 시점에 모든 접근 차단됨
-- 명시적으로 허용하는 정책을 추가해야 함` } },

          { subtitle: 'SELECT 정책 — 누구나 published 글 조회' },
          { code: { lang: 'sql', content: `create policy "Anyone can read published posts"
  on posts for select
  using (status = 'published');

-- 또는 본인 글은 모든 상태 조회
create policy "Authors can read own posts"
  on posts for select
  using (auth.uid() = author_id);

-- 두 정책 모두 추가하면 OR 결합
-- = published이거나 본인 글이면 조회 가능` } },

          { subtitle: 'INSERT 정책 — 본인 author_id로만 작성' },
          { code: { lang: 'sql', content: `create policy "Authors create own posts"
  on posts for insert
  with check (auth.uid() = author_id);

-- USING은 기존 행 검사, INSERT는 새 행이라 WITH CHECK 사용
-- author_id를 본인 ID로 설정하지 않으면 거부` } },

          { subtitle: 'UPDATE 정책 — 본인 글만 수정' },
          { code: { lang: 'sql', content: `create policy "Authors update own posts"
  on posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- USING: 기존 행이 본인 것인가
-- WITH CHECK: 변경 후 행도 본인 것인가
-- 두 개를 다 두면 author_id 변경(다른 사람으로) 차단` } },

          { subtitle: 'DELETE 정책' },
          { code: { lang: 'sql', content: `create policy "Authors delete own posts"
  on posts for delete
  using (auth.uid() = author_id);` } },

          { subtitle: '관리자 권한 정책 — role 기반' },
          { code: { lang: 'sql', content: `-- 사용자 메타데이터에 role 저장
-- user_metadata.role = 'admin' 으로 설정

create policy "Admins can do anything"
  on posts for all
  using (
    (auth.jwt() ->> 'role')::text = 'admin'
    or
    (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
  );

-- 또는 별도 admins 테이블 참조
create policy "Admins can manage"
  on posts for all
  using (
    exists (
      select 1 from admins where admins.user_id = auth.uid()
    )
  );` } },

          { subtitle: '정책 검증 방법' },
          { code: { lang: 'sql', content: `-- 1) Dashboard → SQL Editor → 정책 확인
select * from pg_policies where tablename = 'posts';

-- 2) 다른 사용자로 로그인 후 직접 시도
-- 본인이 작성하지 않은 글을 update 시도 → 0행 수정됨 (RLS가 조용히 차단)

-- 3) RLS bypass (테스트용 — service_role)
-- service_role 키는 모든 RLS 우회
-- 단, 절대 클라이언트에 사용 금지` } },

          { subtitle: '흔한 RLS 함정' },
          { items: [
            'INSERT 정책 누락 → 글쓰기 안 됨 ("new row violates row-level security policy")',
            'auth.uid() vs auth.uid()::text — UUID 비교 시 타입 일치 필요',
            '정책 추가 후에도 anon key는 anonymous role → 로그인 안 한 사용자는 별도 정책 필요',
            'Storage 버킷은 별도 RLS — 객체 접근 권한 따로 설정',
            'service_role을 실수로 클라이언트 .env에 넣으면 RLS 무력화',
          ] },

          { subtitle: 'RLS 베스트 프랙티스' },
          { items: [
            '항상 enable row level security 먼저',
            '정책 이름을 자기 설명적으로 ("Authors update own posts")',
            'SELECT/INSERT/UPDATE/DELETE 각각 명시적 정책',
            '관리자는 별도 정책으로 분리',
            'auth.uid() 캐싱: select auth.uid() into ... 패턴 (대량 조회 시 성능)',
            '정책 변경 후 항상 다른 사용자로 검증',
          ] },

          { subtitle: '실습' },
          { items: [
            'posts 테이블 RLS 활성화',
            '4종 정책 (SELECT·INSERT·UPDATE·DELETE) 모두 작성',
            '두 계정으로 로그인 후 다른 사람 글 수정 시도 → 차단 확인',
            'admin 권한 정책 추가 후 관리자 계정으로 모든 글 수정 가능 확인',
          ] },
        ],
      },

      {
        id: 'reg-6-storage',
        title: 'Storage — 파일 업로드',
        icon: '📁',
        summary: '이미지·문서 업로드, 공개 URL, 정책으로 권한 제어, 자동 변환 + CDN까지 Storage 전체 기능.',
        content: [
          { subtitle: '버킷 생성' },
          { code: { lang: 'sql', content: `-- SQL로 생성
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 또는 Dashboard → Storage → New Bucket
-- public: true → 누구나 URL로 접근 가능
-- public: false → 정책으로 접근 제어` } },

          { subtitle: '업로드' },
          { code: { lang: 'typescript', content: `// 단순 업로드
const file = event.target.files[0];
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(\`\${userId}/profile.jpg\`, file, {
    contentType: file.type,
    upsert: true,            // 같은 경로면 덮어쓰기
  });

// 진행률 추적 (XHR 사용)
const { error } = await supabase.storage
  .from('avatars')
  .upload(\`\${userId}/profile.jpg\`, file, {
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded / e.total) * 100);
      setProgress(percent);
    },
  });` } },

          { subtitle: '공개 URL' },
          { code: { lang: 'typescript', content: `// public 버킷
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(\`\${userId}/profile.jpg\`);

console.log(data.publicUrl);
// → https://xxxx.supabase.co/storage/v1/object/public/avatars/userid/profile.jpg

// private 버킷 → 임시 URL (만료 시간 지정)
const { data, error } = await supabase.storage
  .from('private-files')
  .createSignedUrl('document.pdf', 3600);   // 1시간 유효` } },

          { subtitle: 'Storage 정책 (RLS)' },
          { code: { lang: 'sql', content: `-- 본인 폴더에만 업로드 허용
create policy "Users upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 본인 파일만 삭제
create policy "Users delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 누구나 조회 가능 (public 버킷이면 자동, private이면 명시)
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');` } },

          { subtitle: '이미지 변환 (자동 리사이즈)' },
          { code: { lang: 'typescript', content: `// public URL에 transform 옵션 추가
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(\`\${userId}/profile.jpg\`, {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover',         // cover / contain / fill
      quality: 80,
    },
  });

// 결과 URL:
// .../avatars/userid/profile.jpg?width=200&height=200&resize=cover&quality=80
// Supabase가 즉석에서 변환 + CDN 캐싱` } },

          { subtitle: '업로드 + 미리보기 + DB 저장 통합' },
          { code: { lang: 'tsx', content: `function AvatarUploader() {
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // 1) 즉시 미리보기 (업로드 전)
    setPreview(URL.createObjectURL(file));

    // 2) 업로드
    setUploading(true);
    const path = \`\${user.id}/avatar.jpg\`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    setUploading(false);

    if (upErr) { alert('업로드 실패'); return; }

    // 3) URL 얻기 + 프로필 테이블에 저장
    const { data: { publicUrl } } = supabase.storage
      .from('avatars').getPublicUrl(path);

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    alert('완료!');
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFile} />
      {uploading && <p>업로드 중…</p>}
      {preview && <img src={preview} width={120} />}
    </div>
  );
}` } },

          { subtitle: '실습' },
          { items: [
            'avatars 버킷 생성 + 폴더 정책 작성',
            '프로필 사진 업로드 + 미리보기 + DB 저장',
            '이미지 변환으로 썸네일 자동 생성',
            'private 버킷 + signed URL로 비공개 문서 접근',
          ] },
        ],
      },

      {
        id: 'reg-6-realtime',
        title: 'Realtime — 실시간 구독',
        icon: '⚡',
        summary: 'PostgreSQL 변경을 WebSocket으로 즉시 받기. 채팅·알림·협업 도구의 핵심 기능.',
        content: [
          { subtitle: 'Realtime 활성화 (테이블별)' },
          { code: { lang: 'sql', content: `-- Replication 활성화
alter publication supabase_realtime add table posts;

-- 또는 Dashboard → Database → Replication에서 토글` } },

          { subtitle: '기본 구독' },
          { code: { lang: 'typescript', content: `useEffect(() => {
  const channel = supabase
    .channel('posts-changes')
    .on(
      'postgres_changes',
      {
        event: '*',              // INSERT / UPDATE / DELETE / *
        schema: 'public',
        table: 'posts',
      },
      (payload) => {
        console.log(payload);
        // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
        // payload.new: 새 행 (INSERT, UPDATE)
        // payload.old: 이전 행 (UPDATE, DELETE)
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);` } },

          { subtitle: '필터링' },
          { code: { lang: 'typescript', content: `// 특정 author의 글만
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'posts',
  filter: \`author_id=eq.\${userId}\`,
}, handler)

// 여러 필터는 별도 구독으로` } },

          { subtitle: '상태 동기화 패턴' },
          { code: { lang: 'tsx', content: `function PostsRealtime() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // 1) 초기 로드
    supabase.from('posts').select('*').then(({ data }) => {
      if (data) setPosts(data);
    });

    // 2) 실시간 구독
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts(prev => [payload.new as Post, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(p =>
              p.id === payload.new.id ? payload.new as Post : p
            ));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}` } },

          { subtitle: 'Presence — 누가 접속해 있는가' },
          { code: { lang: 'typescript', content: `// 협업 도구에서 "지금 이 문서를 보고 있는 사람"
const channel = supabase.channel('room-1');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    setOnlineUsers(Object.keys(state));
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: userId, online_at: new Date().toISOString() });
    }
  });` } },

          { subtitle: 'Broadcast — 클라이언트 간 직접 통신' },
          { code: { lang: 'typescript', content: `// 채팅 메시지 — DB 거치지 않고 즉시 전송
const channel = supabase.channel('chat-room-1');

channel
  .on('broadcast', { event: 'message' }, ({ payload }) => {
    setMessages(prev => [...prev, payload]);
  })
  .subscribe();

// 전송
channel.send({
  type: 'broadcast',
  event: 'message',
  payload: { user: '홍길동', text: '안녕' },
});` } },

          { subtitle: 'Realtime 함정' },
          { items: [
            'cleanup 누락 → 메모리 누수 + 중복 이벤트',
            'RLS 미적용 → 다른 사용자 데이터 변경 알림 받음 (개인정보 노출)',
            '구독 채널명 충돌 → 같은 이름 채널을 여러 컴포넌트에서 만들지 말 것',
            '무료 티어 동시 연결 200개 제한 → 대규모는 유료',
          ] },

          { subtitle: '실습' },
          { items: [
            'posts에 Realtime 활성화',
            'INSERT/UPDATE/DELETE 모두 실시간 반영',
            '두 브라우저 탭에서 동시 확인',
            'Broadcast로 간단한 채팅 구현',
          ] },
        ],
      },

      {
        id: 'reg-6-practice-1',
        title: '실습 1 · 인증 폼 풀세트 (40분)',
        icon: '🧪',
        summary: '이메일 + Google OAuth 회원가입·로그인·로그아웃 풀세트 + AuthContext 통합.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'Supabase Auth 4가지 시나리오 모두 구현',
            'AuthContext + useAuth 통합',
            'OAuth 콜백 처리',
          ] },

          { subtitle: '단계별 구현' },
          { code: { lang: 'tsx', content: `// src/pages/Login.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials'
        ? '이메일 또는 비밀번호가 일치하지 않습니다.'
        : '로그인 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
          minLength={6}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="divider">또는</div>

      <button onClick={signInWithGoogle} className="btn-google">
        <img src="/google-icon.svg" alt="" /> Google로 로그인
      </button>

      <p>계정이 없으신가요? <Link to="/signup">가입</Link></p>
    </div>
  );
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 이메일 회원가입·로그인·로그아웃 동작',
            '☐ Google OAuth 콜백 정상',
            '☐ 에러 메시지 사용자 친화적',
            '☐ 로그인 후 원래 페이지로 복귀',
            '☐ 새로고침 후에도 로그인 유지',
          ] },
        ],
      },

      {
        id: 'reg-6-practice-2',
        title: '실습 2 · 게시판 CRUD + RLS (50분)',
        icon: '🧪',
        summary: 'posts 테이블 + 4종 RLS 정책 + 글 작성·조회·수정·삭제 풀세트.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            '테이블 + RLS + CRUD UI 풀세트',
            '본인 글만 수정·삭제 보장',
            '관리자는 모든 글 관리',
          ] },

          { subtitle: '단계 1 · 테이블 + RLS (15분)' },
          { code: { lang: 'sql', content: `-- SQL Editor에서 실행
create table posts (
  id          bigserial primary key,
  title       text not null check (char_length(title) > 0),
  body        text,
  author_id   uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index posts_author_idx on posts (author_id);

-- RLS 활성화
alter table posts enable row level security;

-- 4종 정책
create policy "Anyone reads published"
  on posts for select using (status = 'published');

create policy "Authors read own posts"
  on posts for select using (auth.uid() = author_id);

create policy "Authors create own posts"
  on posts for insert
  with check (auth.uid() = author_id);

create policy "Authors update own posts"
  on posts for update using (auth.uid() = author_id);

create policy "Authors delete own posts"
  on posts for delete using (auth.uid() = author_id);` } },

          { subtitle: '단계 2 · CRUD UI (25분)' },
          { code: { lang: 'tsx', content: `function PostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false });
    if (data) setPosts(data);
  }

  async function create() {
    if (!user || !title.trim()) return;
    const { error } = await supabase.from('posts').insert({
      title, body, author_id: user.id,
    });
    if (error) { alert(error.message); return; }
    setTitle(''); setBody('');
    load();
  }

  async function togglePublish(p: Post) {
    const newStatus = p.status === 'draft' ? 'published' : 'draft';
    await supabase.from('posts').update({ status: newStatus }).eq('id', p.id);
    load();
  }

  async function remove(id: number) {
    if (!confirm('삭제할까요?')) return;
    await supabase.from('posts').delete().eq('id', id);
    load();
  }

  return (
    <div>
      {user && (
        <form onSubmit={e => { e.preventDefault(); create(); }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="본문" />
          <button>작성</button>
        </form>
      )}

      <ul>
        {posts.map(p => (
          <li key={p.id}>
            <h3>{p.title} <small>({p.status})</small></h3>
            <p>{p.body}</p>
            {user?.id === p.author_id && (
              <>
                <button onClick={() => togglePublish(p)}>
                  {p.status === 'draft' ? '발행' : '비공개'}
                </button>
                <button onClick={() => remove(p.id)}>삭제</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}` } },

          { subtitle: '단계 3 · 보안 검증 (10분)' },
          { items: [
            '두 계정 A, B 가입',
            'A로 글 작성 → B로 로그인',
            'B가 A의 글 수정 시도 → RLS가 차단 (0행 수정)',
            'B가 A의 글 삭제 시도 → 동일하게 차단',
            'draft 글은 B에게 보이지 않음 (published만 SELECT 가능)',
          ] },
        ],
      },

      {
        id: 'reg-6-practice-3',
        title: '실습 3 · 프로필 사진 업로드 (40분)',
        icon: '🧪',
        summary: 'Storage 버킷 + 정책 + 즉시 미리보기 + 압축 + DB 저장 풀세트.',
        content: [
          { subtitle: '준비' },
          { code: { lang: 'sql', content: `-- avatars 버킷 (public)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 본인 폴더에만 업로드/수정/삭제
create policy "Users upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone views avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users update own files"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- profiles 테이블에 avatar_url
alter table profiles add column avatar_url text;` } },

          { subtitle: '업로드 컴포넌트' },
          { code: { lang: 'tsx', content: `import imageCompression from 'browser-image-compression';   // npm install

function AvatarUploader() {
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // 1) 즉시 미리보기
    setPreview(URL.createObjectURL(file));

    // 2) 압축
    setUploading(true);
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
    });
    console.log(\`\${(file.size/1024).toFixed(0)}KB → \${(compressed.size/1024).toFixed(0)}KB\`);

    // 3) 업로드
    const path = \`\${user.id}/avatar.jpg\`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' });

    if (error) { alert('업로드 실패'); setUploading(false); return; }

    // 4) URL + DB 저장
    const { data: { publicUrl } } = supabase.storage
      .from('avatars').getPublicUrl(path);

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

    setUploading(false);
    alert('완료!');
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFile} />
      {uploading && <progress value={progress} max={100} />}
      {preview && <img src={preview} width={120} alt="미리보기" />}
    </div>
  );
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 즉시 미리보기 (업로드 전)',
            '☐ 압축 비율 확인 (보통 50~80%)',
            '☐ 다른 사용자 폴더에 업로드 시도 → 차단',
            '☐ DB profiles.avatar_url 업데이트',
            '☐ 헤더 아바타에 자동 반영',
          ] },
        ],
      },

      {
        id: 'reg-6-practice-4',
        title: '실습 4 · 실시간 채팅방 (45분)',
        icon: '🧪',
        summary: 'Realtime + Presence + Broadcast 활용한 다중 사용자 채팅방.',
        content: [
          { subtitle: '준비' },
          { code: { lang: 'sql', content: `create table chat_messages (
  id          bigserial primary key,
  room_id     text not null,
  author_id   uuid not null references auth.users(id),
  author_name text not null,
  content     text not null,
  created_at  timestamptz default now()
);

create index chat_messages_room_idx on chat_messages (room_id, created_at);

alter table chat_messages enable row level security;

create policy "Anyone reads messages"
  on chat_messages for select using (true);

create policy "Auth users send messages"
  on chat_messages for insert
  with check (auth.uid() = author_id);

-- Realtime 활성화
alter publication supabase_realtime add table chat_messages;` } },

          { subtitle: '채팅 컴포넌트' },
          { code: { lang: 'tsx', content: `function ChatRoom({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [typing, setTyping] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    // 초기 로드
    supabase.from('chat_messages').select('*')
      .eq('room_id', roomId).order('created_at')
      .then(({ data }) => data && setMessages(data));

    // Realtime — 새 메시지
    const msgCh = supabase
      .channel(\`room:\${roomId}\`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: \`room_id=eq.\${roomId}\` },
        (payload) => setMessages(prev => [...prev, payload.new as Message])
      )
      .subscribe();

    // Presence — 접속자 수
    const presCh = supabase.channel(\`presence:\${roomId}\`);
    presCh
      .on('presence', { event: 'sync' }, () => {
        const state = presCh.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presCh.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    // Broadcast — 타이핑 표시
    const typingCh = supabase
      .channel(\`typing:\${roomId}\`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTyping(prev => {
          if (prev.includes(payload.user)) return prev;
          const next = [...prev, payload.user];
          setTimeout(() => setTyping(now => now.filter(u => u !== payload.user)), 3000);
          return next;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgCh);
      supabase.removeChannel(presCh);
      supabase.removeChannel(typingCh);
    };
  }, [roomId, user]);

  async function send() {
    if (!user || !input.trim()) return;
    await supabase.from('chat_messages').insert({
      room_id: roomId,
      author_id: user.id,
      author_name: user.email,
      content: input,
    });
    setInput('');
  }

  function handleTyping() {
    supabase.channel(\`typing:\${roomId}\`).send({
      type: 'broadcast', event: 'typing', payload: { user: user!.email },
    });
  }

  return (
    <div>
      <header>채팅방: {roomId} · 접속: {onlineCount}명</header>
      <ul>
        {messages.map(m => (
          <li key={m.id}>
            <strong>{m.author_name}</strong>: {m.content}
          </li>
        ))}
      </ul>
      {typing.length > 0 && <p>{typing.join(', ')} 입력 중...</p>}
      <form onSubmit={e => { e.preventDefault(); send(); }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); handleTyping(); }}
          placeholder="메시지..."
        />
        <button>전송</button>
      </form>
    </div>
  );
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 두 브라우저 탭에서 실시간 동기화',
            '☐ 접속자 수 실시간 표시',
            '☐ 타이핑 중 표시',
            '☐ 새로고침 후 메시지 유지',
            '☐ cleanup으로 메모리 누수 없음',
          ] },
        ],
      },

      {
        id: 'reg-6-practice-5',
        title: '실습 5 · Edge Function — LLM 프록시 (40분)',
        icon: '🧪',
        summary: 'Supabase Edge Function으로 LLM API 키를 서버에서 안전하게 보호.',
        content: [
          { subtitle: '실습 목표' },
          { items: [
            'Supabase CLI 셋업',
            'Edge Function 작성·배포',
            '환경변수(secrets)로 API 키 보호',
            '클라이언트는 키 노출 없이 호출',
          ] },

          { subtitle: '단계 1 · CLI 셋업 (10분)' },
          { code: { lang: 'bash', content: `npm install -D supabase

# 로그인
npx supabase login   # 브라우저로 인증

# 프로젝트 연결
npx supabase link --project-ref <YOUR_PROJECT_REF>
# project-ref는 Settings → General에서 확인

# 함수 생성
npx supabase functions new ask-llm
# → supabase/functions/ask-llm/index.ts 생성됨` } },

          { subtitle: '단계 2 · 함수 작성 (15분)' },
          { code: { lang: 'typescript', content: `// supabase/functions/ask-llm/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 인증 확인 — Supabase가 자동 검증
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages } = await req.json();
    const apiKey = Deno.env.get('SOLAR_API_KEY');

    if (!apiKey) throw new Error('SOLAR_API_KEY not configured');

    const upstream = await fetch('https://api.upstage.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'solar-pro',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});` } },

          { subtitle: '단계 3 · 배포 + Secrets (5분)' },
          { code: { lang: 'bash', content: `# 환경변수 설정 (서버 측)
npx supabase secrets set SOLAR_API_KEY=up_xxxxxxxxxxxx

# 함수 배포
npx supabase functions deploy ask-llm

# 함수 URL:
# https://<project-ref>.supabase.co/functions/v1/ask-llm` } },

          { subtitle: '단계 4 · 클라이언트 호출 (10분)' },
          { code: { lang: 'typescript', content: `// src/utils/llm.ts
import { supabase } from './supabase';

export async function askLLM(messages: Message[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ask-llm', {
    body: { messages },
  });

  if (error) throw error;
  return data.choices[0].message.content;
}

// 사용 — 브라우저에서 호출해도 API 키 노출 X
const reply = await askLLM([
  { role: 'system', content: '한국어로 답하라' },
  { role: 'user', content: '안녕!' },
]);` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ Supabase CLI 셋업 완료',
            '☐ 함수 정상 배포',
            '☐ 클라이언트에서 호출 성공',
            '☐ 브라우저 Network 탭에 API 키 안 보임',
            '☐ 비로그인 사용자는 401 응답',
          ] },
        ],
      },

      {
        id: 'reg-6-resources',
        title: 'Edge Functions + 심화 자료',
        icon: '⚡',
        summary: 'Edge Functions로 서버 측 비즈니스 로직 + Supabase 학습 심화 자료.',
        content: [
          { subtitle: 'Edge Functions — 서버 함수' },
          { text: 'LLM API 키 보호, 결제 검증, 이메일 발송 등 서버 측에서만 실행되어야 할 코드를 Deno로 작성. 글로벌 엣지에서 실행되어 빠름.' },

          { subtitle: '함수 생성 + 배포' },
          { code: { lang: 'bash', content: `# Supabase CLI
npx supabase functions new send-email

# supabase/functions/send-email/index.ts 작성

# 배포
npx supabase functions deploy send-email

# 호출
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to: 'user@example.com', subject: '...', html: '...' },
});` } },

          { subtitle: 'LLM API 프록시 예제' },
          { code: { lang: 'typescript', content: `// supabase/functions/ask-llm/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';

serve(async (req) => {
  // CORS 헤더
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  const { prompt } = await req.json();
  const apiKey = Deno.env.get('SOLAR_API_KEY');   // 서버 환경변수

  const res = await fetch('https://api.upstage.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'solar-pro',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});

// 환경변수 설정
// npx supabase secrets set SOLAR_API_KEY=up_xxx` } },

          { subtitle: '심화 자료' },
          { items: [
            'Supabase 공식: supabase.com/docs (한국어 일부)',
            'Supabase YouTube — 공식 채널, 실전 튜토리얼',
            'PostgreSQL 학습: postgresqltutorial.com',
            'SQL 게임: sqlbolt.com',
            '한국어 강의: 인프런 "Supabase로 풀스택 만들기"',
          ] },

          { subtitle: '심화 주제' },
          { items: [
            'pg_cron — 정기 작업 (cron job)',
            'pg_vector — 벡터 검색 (RAG)',
            'Postgres Functions — 비즈니스 로직 DB에 캡슐화',
            'Materialized Views — 집계 최적화',
            'Read Replicas — 읽기 부하 분산 (유료)',
          ] },

          { subtitle: 'Day 6 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['셋업', '없음', '프로젝트 생성', 'SDK + Context 통합'],
              ['Auth', '없음', '이메일 로그인', 'OAuth + onAuthStateChange'],
              ['CRUD', '없음', 'select·insert', '관계 조인 + 필터 + 페이지네이션'],
              ['RLS', '비활성', '기본 정책 1개', '4종 정책 + 관리자 분기'],
              ['Storage', '없음', '단순 업로드', '미리보기 + 정책 + 변환'],
            ],
          } },
        ],
      },
    ],
  },

  {
    id: 'reg-7',
    title: 'Day 8 · AI 서비스 설계',
    icon: '📐',
    description: 'PRD 작성, 사용자 스토리, MoSCoW 우선순위, AI 통합 아키텍처 — 경진대회 출품작이 될 서비스의 기획 단계를 체계화합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', '팀 아이디어 브레인스토밍 + 1개 선정', '팀별 핵심 아이디어 1개'],
          ['S2', '50분', 'PRD 8섹션 작성 (AI와 함께)', 'PRD 문서 v1'],
          ['S3', '50분', '사용자 스토리 + MoSCoW', 'MVP 범위 확정'],
          ['S4', '50분', 'AI 통합 아키텍처 도식화 + 와이어프레임', '아키텍처도 + 와이어프레임'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        '제품 요구사항 문서(PRD)의 8개 섹션을 채울 수 있다',
        '사용자 스토리를 INVEST 원칙에 맞게 작성한다',
        'MoSCoW로 MVP 범위를 결정한다',
        '프론트엔드·백엔드·LLM의 통합 아키텍처를 도식화한다',
      ] },

      { subtitle: '왜 기획이 먼저인가' },
      { text: '코드는 기획서의 표현입니다. 명확한 기획 없이 코딩에 들어가면 (1) 무엇을 검증할지 모름 (2) 우선순위 혼란 (3) 발표 시 메시지 약화 등의 문제가 생깁니다. 경진대회 평가 1순위 "문제 해결력 30%"는 곧 기획 품질입니다.' },

      { subtitle: 'PRD 8섹션 템플릿' },
      { table: {
        headers: ['섹션', '핵심 질문', '예시'],
        rows: [
          ['Problem', '누구의 무슨 문제?', '쉬었음청년이 진로 단절로 자신감 상실'],
          ['Target User', '구체적 페르소나', '20대 후반, 1년 이상 공백, IT 비전공'],
          ['Solution', 'AI가 어떻게 해결?', 'Solar 기반 1:1 진로 코칭 챗봇'],
          ['Key Features', '핵심 기능 3~5개', '대화형 진단·맞춤 추천·이력서 첨삭'],
          ['Tech Stack', '사용 기술', 'React + Supabase + Solar API'],
          ['LLM Usage', '국내 LLM 활용', 'Solar Pro 주력 + HyperCLOVA 폴백'],
          ['MVP Scope', '5월 22일까지 만들 범위', '핵심 챗봇 + 로그인 + 결과 저장'],
          ['Success Metric', '성공 판정 기준', '50명 사용자 + 만족도 4.0/5'],
        ],
      } },

      { subtitle: '사용자 스토리 — INVEST 원칙' },
      { text: '"As a [역할], I want [기능] so that [가치]" 형식의 한 문장. INVEST: Independent·Negotiable·Valuable·Estimable·Small·Testable.' },
      { code: { lang: 'text', content: `예시 — 좋은 사용자 스토리

As a 진로 고민 중인 청년
I want AI와 30분 대화하며 적성 진단을 받고
so that 다음 학습 방향을 결정할 수 있다.

→ Valuable (가치 명확), Small (1~2일 구현), Testable (대화 종료 시 진단 결과 출력)

나쁜 예
"사용자가 좋게 쓸 수 있는 시스템" — 누구의 어떤 가치인지 불명확` } },

      { subtitle: 'MoSCoW 우선순위' },
      { table: {
        headers: ['등급', '의미', '예'],
        rows: [
          ['Must', '없으면 출시 불가', '로그인, 핵심 대화, 결과 저장'],
          ['Should', '있으면 좋지만 미루어도 됨', '대화 기록 다시 보기'],
          ['Could', '여유 시간에만', '다크모드, 결과 PDF 출력'],
          ['Won\'t', '이번엔 안 함', '결제, 다국어 지원'],
        ],
      } },
      { callout: { type: 'tip', text: '6월 1일~22일 4주 일정에서 Must만 100% 완성하고 Should의 50%를 달성하는 것이 현실적 목표입니다. 욕심내면 모든 게 미완성으로 끝납니다.' } },

      { subtitle: 'AI 통합 아키텍처' },
      { code: { lang: 'text', content: `┌──────────────────┐
│   React 프론트엔드 │  ← 사용자 화면
└────────┬─────────┘
         │ fetch
         ▼
┌──────────────────┐    ┌──────────────────┐
│   Supabase Auth  │    │  Supabase DB     │
│   (회원/세션)     │    │  (대화 기록·결과) │
└──────────────────┘    └──────────────────┘
         ▲                       ▲
         │                       │
         │      ┌────────────────┘
         │      │
┌────────┴──────┴──┐
│ Supabase Edge Fn │  ← LLM 호출 프록시
│  (API 키 보호)    │
└────────┬─────────┘
         ▼
┌──────────────────┐
│   Solar API      │  ← 국내 LLM
└──────────────────┘` } },

      { subtitle: 'API 키 보안 — 왜 Edge Function인가' },
      { items: [
        '프론트엔드에서 직접 LLM API 호출 → API 키가 브라우저에 노출',
        '봇이 24시간 안에 키 스캔 → 도용 → 청구서 폭증',
        'Edge Function = 서버 측에서 키 보관·호출 → 클라이언트에는 결과만',
        'Supabase Edge Function은 무료 플랜에서도 사용 가능',
      ] },

      { subtitle: '브레인스토밍 — Crazy 8s 기법' },
      { code: { lang: 'text', content: `[Crazy 8s 진행 방법] — 30분 안에 아이디어 8개 도출

준비물: A4 1장 (8칸으로 접기), 펜
인원: 팀당 3~5명

[1단계 · 5분] 문제 정의
  "쉬었음청년의 어떤 어려움을 도울 것인가?"
  팀원이 한 줄씩 답변 — 공감되는 1개 선정

[2단계 · 8분] Crazy 8s 본 작업
  타이머 8분 → 각자 1칸당 1분, 8개 솔루션 스케치
  말 없이, 빠르게, 평가 없이

[3단계 · 7분] 공유
  돌아가며 본인 8개 중 1~2개 발표 (30초씩)

[4단계 · 10분] 투표·결정
  닷 보팅(각자 3표) → 최다 득표 1개 선정
  선정된 아이디어로 PRD 작성 진입` } },

      { subtitle: '아키텍처 도식 — 손그림 + Excalidraw' },
      { items: [
        'Excalidraw (excalidraw.com) — 무료, 손그림 느낌, 브라우저에서 즉시',
        'draw.io (app.diagrams.net) — 정식 도표, 다양한 템플릿',
        'Mermaid — 텍스트로 다이어그램 작성, GitHub README에 자동 렌더',
        'AI 활용: ChatGPT에게 "다음 아키텍처를 Mermaid 코드로" 요청',
      ] },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "아이디어가 진부한 것 같아요" — 진부한 아이디어 + 좋은 실행이 새 아이디어 + 나쁜 실행보다 낫습니다. 진부함은 검증된 시장.',
        'Q. "팀원 의견이 갈려요" — 닷 보팅이나 무게 점수 투표. 결정자는 사전에 정해두세요.',
        'Q. "MVP에서 빼고 싶지 않은 게 너무 많아요" — Day 12 배포까지 시간 역산. 안 빼면 모든 게 미완성. "다음 버전에서"로 미루기.',
        'Q. "LLM을 어디에 써야 할지 모르겠어요" — "사용자가 자유 텍스트로 표현하는 곳" + "전문가의 의견이 필요한 곳"이 1순위 후보.',
        'Q. "기획서를 너무 자세히 쓰면 시간 낭비 아닌가요?" — 8섹션 1페이지로 충분. 너무 자세하면 변경 비용↑. PRD는 살아있는 문서.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. PRD 8섹션 중 가장 먼저 작성해야 하는 섹션은?',
        '2. INVEST 원칙의 N은 무엇을 의미하는가?',
        '3. MoSCoW의 W는?',
        '4. AI 서비스에서 LLM API 키를 클라이언트에 두면 안 되는 이유는?',
        '5. MVP의 정의를 한 줄로 답하시오.',
      ] },
      { callout: { type: 'tip', text: '정답: 1) Problem (문제 정의) — 모든 결정의 기준  2) Negotiable (협상 가능)  3) Won\'t (이번엔 안 함)  4) 봇이 24시간 안에 키 스캔해 도용 → 비용 폭증  5) 핵심 가치를 검증할 수 있는 최소 기능의 제품' } },

      { subtitle: '참고 자료' },
      { items: [
        '도서: 『Inspired』 마티 케이건 (PM 필독서)',
        '도서: 『린 스타트업』 에릭 리스',
        'PRD 템플릿: 노션 templates에서 "PRD" 검색',
        'Excalidraw: excalidraw.com (즉시 사용 가능)',
        'IDEO Design Kit (한국어 번역 PDF 있음) — 디자인 씽킹 도구',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        'Crazy 8s로 팀 아이디어 8개 발산 + 1개 선정',
        'PRD 8섹션 채우기 (AI와 함께 작성)',
        '핵심 사용자 스토리 5개 작성 + INVEST 원칙 점검',
        'MoSCoW로 4주에 만들 범위 확정',
        'Excalidraw 또는 손그림으로 와이어프레임 + 아키텍처 도식화',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 8에서는 오늘 설계한 LLM 통합을 코드로 구현합니다. Solar API 호출·스트리밍·에러 처리·비용 관리를 모두 실습합니다.' },
    ],
    subSections: [
      {
        id: 'reg-7-problem',
        title: '문제 정의 — 좋은 문제 vs 나쁜 문제',
        icon: '🎯',
        summary: '실패하는 AI 서비스 80%의 원인은 잘못된 문제 정의. 검증 가능한 문제로 좁히는 5단계 + 페르소나 작성법.',
        content: [
          { subtitle: '왜 문제 정의가 모든 것의 시작인가' },
          { text: '아이디어 → 기능 → 코드 순서로 가면 보통 실패합니다. "누구의 어떤 문제를 풀고 있는가"가 명확하지 않으면 어떤 기능도 정당화되지 않습니다. 본 4주 프로젝트가 의미 있으려면 첫 단계가 가장 중요.' },

          { subtitle: '좋은 문제 vs 나쁜 문제' },
          { table: {
            headers: ['차원', '나쁜 문제', '좋은 문제'],
            rows: [
              ['구체성', '"교육을 개선"', '"30대 비전공자가 AI 코딩 학습 시 진입 장벽 해결"'],
              ['대상', '"모두"', '"쉬었음청년, 1년 이상 공백"'],
              ['검증 가능', '"좋은 경험"', '"4주 후 GitHub Pages에 동작하는 앱 1개"'],
              ['시급성', '"있으면 좋음"', '"6월 22일 경진대회 출품"'],
              ['차별성', '"기존 + 더 잘"', '"국내 LLM·바이브코딩 결합"'],
            ],
          } },

          { subtitle: '5 Whys — 진짜 원인까지 파고들기' },
          { code: { lang: 'text', content: `[표면 문제] 쉬었음청년의 취업률이 낮다.

Why? 디지털 역량이 부족하다.
   ↓
Why? 학습 기회가 적다.
   ↓
Why? 기존 교육이 대학 학위 중심이다.
   ↓
Why? 단기 집중 + 실무 결과물 중심 교육이 드물다.
   ↓
Why? 강사진이 기업 실무 경험 부족 + 도구가 복잡함.
   ↓
[근본 원인] 짧은 기간에 실무 결과물을 만들 수 있는 도구·강사 조합 부재

[솔루션 방향] AI 코딩 도구로 진입 장벽 낮추고, 실무 강사가 4주 집중 운영` } },

          { subtitle: '페르소나(Persona) 작성' },
          { code: { lang: 'text', content: `[페르소나 표준 양식]

이름:        김민지 (가상)
나이:        28세
직업:        구직 활동 중 (대기업 2년 → 1년 공백)
거주지:      경기도 수원
가족:        부모님과 동거

배경:
- 인문 전공, IT 비전공
- 마케팅 직무 경력 2년
- 코로나로 권고사직 → 1년간 진로 탐색

목표:
- 빨리 (3~6개월) 디지털 직군 진입
- 포트폴리오 1개 + 실무 기술 확보

좌절점 (Pain Points):
- 코딩 부트캠프는 6개월 + 비쌈
- 유튜브 강의는 끝까지 못 함
- 면접 시 "포트폴리오 없음" 거절

행동 패턴:
- 평일 4시간 집중 가능
- 출퇴근 시 1시간 유튜브 청취
- 카카오톡·인스타그램 활성

기술 수준:
- Word·엑셀 OK
- 코딩 경험 0
- AI 도구 ChatGPT 정도 사용

이 사람이 우리 서비스를 쓴다면…` } },

          { subtitle: 'JTBD (Jobs To Be Done) 프레임워크' },
          { text: '"사용자가 우리 서비스를 고용해서 어떤 일을 하려는가?" 관점.' },
          { code: { lang: 'text', content: `[JTBD 양식]

상황: 김민지는 1년 공백 후 디지털 전환이 필요함

When: 평일 저녁, 노트북 앞에서
I want to: 4주 안에 동작하는 AI 서비스 1개를 만들어
So I can: 면접에서 보여줄 포트폴리오를 갖춰 취업하고 싶다

→ 우리 서비스는 "4주 후 동작하는 결과물"을 약속해야 함` } },

          { subtitle: '문제 검증 체크리스트' },
          { items: [
            '☐ 특정 페르소나 1명을 머릿속에 그릴 수 있는가?',
            '☐ 그 사람이 현재 어떤 대안으로 해결하고 있는가? (없으면 문제 아닐 수 있음)',
            '☐ 문제 해결의 시급성은? (긴급/중요 매트릭스)',
            '☐ 우리가 다르게 해결할 수 있는 이유? (기술·비용·UX)',
            '☐ 성공/실패를 측정할 1개 숫자가 있는가? (KPI)',
          ] },

          { subtitle: '실습' },
          { items: [
            '팀 아이디어를 5 Whys로 5단계 분석',
            '핵심 페르소나 1명 작성 (이름·나이·배경·좌절점)',
            'JTBD 양식으로 사용자 의도 명시',
            '검증 체크리스트 5개 통과',
          ] },
        ],
      },

      {
        id: 'reg-7-prd',
        title: 'PRD 작성 — 8섹션 완전 정복',
        icon: '📄',
        summary: 'Product Requirements Document — 1페이지 PRD 8섹션 양식 + AI와 함께 작성하는 워크플로우.',
        content: [
          { subtitle: 'PRD란?' },
          { text: '제품의 목표·사용자·기능·제약을 정의한 1~2페이지 문서. "왜·누가·무엇을·어떻게·언제"를 한 곳에 모아 팀이 같은 그림을 공유.' },

          { subtitle: '8섹션 표준 양식' },
          { table: {
            headers: ['#', '섹션', '핵심 질문', '권장 분량'],
            rows: [
              ['1', 'Problem', '누구의 무슨 문제?', '3~5문장'],
              ['2', 'Target User', '구체적 페르소나', '1단락'],
              ['3', 'Solution', 'AI가 어떻게 해결?', '3~5문장'],
              ['4', 'Key Features', '핵심 기능 3~5개', '각 1줄'],
              ['5', 'Tech Stack', '사용 기술', '리스트'],
              ['6', 'LLM Usage', '국내 LLM 활용 방식', '2~3문장'],
              ['7', 'MVP Scope', '6월 22일까지 만들 범위', 'Must/Should/Could'],
              ['8', 'Success Metric', '성공 측정 지표', '1~3개 KPI'],
            ],
          } },

          { subtitle: '실전 예시 — AI Reboot 진로 코칭 서비스' },
          { code: { lang: 'text', content: `# Career Reboot — AI 진로 코칭 챗봇

## 1. Problem
쉬었음청년이 디지털 직군으로 전환 시 (1) 본인 적성 모름,
(2) 진로 방향 막막함, (3) 학습 우선순위 혼란 — 3중고 직면.
기존 진로 상담은 비싸고 시간 제약 큼.

## 2. Target User
김민지 (28, 인문 전공, 1년 공백). 평일 저녁 4시간 가능.
디지털 부트캠프 진입 전 본인 적성 확인 필요.

## 3. Solution
국내 LLM 기반 챗봇이 30분 대화로 본인 적성·관심·강점 진단,
3개 직무 추천 + 각 직무별 8주 학습 로드맵 제공.

## 4. Key Features
- 대화형 적성 진단 (15~20턴)
- 직무 3개 추천 (개발자/디자이너/PM)
- 직무별 학습 로드맵
- 추천 사이트·강의 큐레이션
- 결과 PDF 다운로드

## 5. Tech Stack
- Frontend: React 19 + Vite 7 + TypeScript
- Backend: Supabase (Auth + DB + Storage)
- LLM: Solar Pro (주력) + HyperCLOVA X (폴백)
- 배포: GitHub Pages + 커스텀 도메인

## 6. LLM Usage
Solar Pro로 자연어 진단·추천. 시스템 프롬프트에 직무별
스킬셋·역량 정의. 대화 기록 Supabase 저장 + 결과 페이지에서 재조회.

## 7. MVP Scope (2026-06-22까지)
[Must]
- 회원가입·로그인 (이메일·Google)
- 진단 챗봇 (15턴 이상)
- 결과 화면 + 직무 추천 3개
- 로드맵 표시

[Should]
- 결과 PDF 다운로드
- 대화 기록 다시 보기

[Could]
- 학습 진도 트래킹
- 멘토 매칭

[Won't]
- 결제 시스템
- 모바일 앱

## 8. Success Metric
- 50명 사용자 가입
- 진단 완료율 70% 이상
- 만족도 4.0/5 이상` } },

          { subtitle: 'AI와 함께 작성하는 워크플로우' },
          { code: { lang: 'text', content: `[AI에게 PRD 초안 요청]

너는 시니어 PM이다. 우리 팀이 만들 서비스의 PRD를
다음 8섹션으로 작성하라.

서비스 아이디어:
[1~2문단으로 본인 아이디어 설명]

타겟 사용자:
[페르소나 핵심 요약]

작성 원칙:
- 각 섹션 분량은 PRD 양식의 권장에 맞춰
- 측정 가능한 지표 포함
- 4주 안에 만들 수 있는 범위만
- 국내 LLM(Solar/HyperCLOVA X) 활용 명시

PRD를 작성하고, 작성 후 다음을 추가로 제안:
- 가장 큰 위험 요소 3가지
- 사용자 인터뷰 시 물어야 할 질문 5개` } },

          { subtitle: 'PRD 점검 체크리스트' },
          { items: [
            '☐ 8섹션 모두 채워짐',
            '☐ 페르소나가 구체적 (이름·나이·상황)',
            '☐ Key Features 5개 이하 (많으면 MVP 아님)',
            '☐ Tech Stack이 본 강의 범위 내 (React + Supabase + Solar)',
            '☐ MVP가 4주 안에 가능한가? (보수적으로 평가)',
            '☐ Success Metric이 측정 가능한 숫자',
          ] },

          { subtitle: '실습' },
          { items: [
            '팀 PRD 8섹션 초안 작성 (AI 활용)',
            '팀원 간 리뷰 + 다듬기',
            '강사 1차 리뷰 받기',
            'GitHub 저장소 README에 PRD 1줄 요약 추가',
          ] },
        ],
      },

      {
        id: 'reg-7-userstory',
        title: '사용자 스토리 + MoSCoW',
        icon: '📋',
        summary: '사용자 스토리 INVEST 원칙 + MoSCoW 우선순위로 MVP 범위를 정확히 결정하는 표준 기법.',
        content: [
          { subtitle: '사용자 스토리 양식' },
          { code: { lang: 'text', content: `As a [역할/페르소나]
I want to [기능/행동]
so that [얻는 가치/이유]

[수락 기준 (Acceptance Criteria)]
- Given [상황]
- When [행동]
- Then [결과]` } },

          { subtitle: '좋은 사용자 스토리 예시' },
          { code: { lang: 'text', content: `[Story 1 · 회원가입]

As a 진로 고민 중인 28세 비전공자
I want 이메일 또는 Google 계정으로 30초 안에 가입하고
so that 즉시 진단을 시작할 수 있다.

수락 기준:
- Given 첫 방문 사용자
- When "시작하기" 버튼 클릭
- Then 이메일 입력 + 비밀번호 설정 또는 Google 로그인 화면
- And 가입 완료 시 즉시 진단 페이지로 이동

[Story 2 · 진단 챗봇]

As a 가입한 사용자
I want AI와 자연어로 대화하며 적성 진단을 받고
so that 본인 강점·약점을 파악할 수 있다.

수락 기준:
- Given 로그인 상태
- When 진단 시작 → 첫 질문 표시
- Then 사용자 답변 → AI 후속 질문
- And 15턴 이상 진행 후 결과 화면으로 자동 전환` } },

          { subtitle: 'INVEST 원칙' },
          { table: {
            headers: ['글자', '의미', '체크'],
            rows: [
              ['I', 'Independent — 독립적', '다른 스토리와 무관하게 구현 가능?'],
              ['N', 'Negotiable — 협상 가능', '세부사항 조정 여지 있음?'],
              ['V', 'Valuable — 가치 있음', '사용자에게 명확한 가치?'],
              ['E', 'Estimable — 추정 가능', '얼마나 걸릴지 예측 가능?'],
              ['S', 'Small — 작음', '1~2일 안에 완성 가능?'],
              ['T', 'Testable — 검증 가능', '수락 기준이 측정 가능?'],
            ],
          } },

          { subtitle: 'MoSCoW 우선순위 4분류' },
          { table: {
            headers: ['등급', '의미', '예'],
            rows: [
              ['Must', '없으면 출시 불가 — MVP 핵심', '회원가입, 진단 챗봇, 결과 표시'],
              ['Should', '있으면 좋지만 미루어도 됨', 'PDF 출력, 대화 기록'],
              ['Could', '여유 시간에만', '다크모드, 알림'],
              ['Won\'t', '이번엔 안 함', '결제, 모바일 앱, 멘토 매칭'],
            ],
          } },
          { callout: { type: 'tip', text: '4주 일정에서 Must를 100% 완성하고 Should의 50%를 달성하는 게 현실적 목표. Could는 보너스. Won\'t를 명시하면 팀이 욕심내는 걸 방지.' } },

          { subtitle: 'MoSCoW 작성 예시' },
          { code: { lang: 'text', content: `[Career Reboot — MoSCoW]

Must (4주 내 100%)
- 이메일·Google 회원가입/로그인
- 진단 챗봇 (Solar Pro 연동, 15턴)
- 결과 화면 (직무 3개 추천)
- 직무별 학습 로드맵
- GitHub Pages 배포

Should (4주 내 50% 목표)
- 결과 PDF 다운로드
- 대화 기록 다시 보기
- 모바일 반응형

Could (시간 남으면)
- 다크모드
- 5색 컬러 테마
- 알림 (다음 학습 단계)

Won't (이번엔 안 함)
- 결제 시스템
- 모바일 앱
- 멘토 매칭
- 다국어 지원` } },

          { subtitle: '스토리 포인트 추정' },
          { code: { lang: 'text', content: `[추정 단위: 피보나치 수]
1점:  단순 (수정 1~2시간)
2점:  쉬움 (반나절)
3점:  보통 (1일)
5점:  복잡 (2~3일)
8점:  매우 복잡 (1주)
13점: 분할 필요 (1주 이상 → 더 쪼개야 함)

[예시]
[2점] 회원가입 폼 UI
[3점] 회원가입 백엔드 연동 + 검증
[5점] 진단 챗봇 (시스템 프롬프트 + UI + 상태)
[8점] LLM API 통합 + 스트리밍 + 에러 처리
[13점] → 분할:
       [5점] LLM 호출 함수 + 폴백
       [3점] 스트리밍 UI
       [3점] 에러 처리 + 재시도
       [2점] 비용 모니터링` } },

          { subtitle: 'GitHub Issues로 관리' },
          { items: [
            'Issue 1개 = 사용자 스토리 1개',
            '라벨: must / should / could / won\'t',
            '라벨: 1pt / 2pt / 3pt / 5pt / 8pt',
            'Milestone: 주차별 (Week 1, Week 2, ...)',
            'Projects (Kanban) — To Do / In Progress / Review / Done',
          ] },

          { subtitle: '실습' },
          { items: [
            '핵심 사용자 스토리 7~10개 작성 (INVEST 원칙)',
            'MoSCoW로 분류',
            '각 스토리에 포인트 추정',
            '총 포인트 vs 4주 가용 시간 검증',
            'GitHub Issues로 옮기기',
          ] },
        ],
      },

      {
        id: 'reg-7-architecture',
        title: 'AI 통합 아키텍처 설계',
        icon: '🏗️',
        summary: '프론트엔드 + 백엔드 + LLM의 통합 아키텍처를 그림으로 설계. 데이터 흐름·보안·확장성을 한 눈에.',
        content: [
          { subtitle: '아키텍처 다이어그램 표준' },
          { code: { lang: 'text', content: `┌─────────────────────────┐
│  사용자 브라우저          │
│  - React 19 + Vite       │
│  - 컴포넌트, 라우팅       │
└──────────┬──────────────┘
           │ HTTPS
           ▼
┌─────────────────────────┐
│  Supabase                │
│  - Auth (회원/세션)       │
│  - DB (대화 기록, 결과)   │
│  - Storage (PDF, 이미지)  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Supabase Edge Function  │
│  - LLM API 프록시         │
│  - API 키 보호            │
│  - 비용 모니터링          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  국내 LLM API            │
│  - Solar Pro (주력)       │
│  - HyperCLOVA X (폴백)    │
└─────────────────────────┘` } },

          { subtitle: '데이터 흐름 — 진단 챗봇 예시' },
          { code: { lang: 'text', content: `[사용자 액션: 진단 시작]

1. 클라이언트 (React)
   - 사용자 첫 메시지 입력
   - supabase.functions.invoke('ask-llm', { body: { messages } })

2. Edge Function (Deno)
   - 인증 토큰 검증 (auth.uid())
   - 시스템 프롬프트 추가
   - Solar API 호출
   - 비용 로깅
   - 응답 반환

3. Supabase DB
   - 대화 기록 INSERT (chat_logs 테이블)
   - RLS로 본인 데이터만 접근

4. 클라이언트
   - 응답 화면 표시
   - 다음 질문 대기` } },

          { subtitle: '보안 원칙' },
          { table: {
            headers: ['항목', '클라이언트', '서버 (Edge Function)'],
            rows: [
              ['Supabase anon key', '✅ 노출 OK (RLS 보호)', '-'],
              ['Supabase service_role', '❌ 절대 금지', '✅ 사용 가능'],
              ['LLM API 키', '❌ 절대 금지', '✅ 환경변수로 보관'],
              ['비밀번호', '❌ 평문 전송 금지', '✅ bcrypt 해싱'],
              ['결제 토큰', '❌ 직접 조작 금지', '✅ 검증·기록'],
            ],
          } },

          { subtitle: '확장성 고려 — 100명 → 10,000명' },
          { table: {
            headers: ['병목', '100명', '1,000명', '10,000명'],
            rows: [
              ['DB', 'Free 티어', 'Pro 티어 $25/월', 'Pro + Read Replica'],
              ['LLM 비용', '월 5만원', '월 50만원', '캐싱·라우팅 필수'],
              ['Edge Function', '무료', '무료~Pro', 'Pro + 리전 확장'],
              ['Storage', '1GB', '~10GB', 'Pro + CDN'],
              ['Realtime', '200 connections', '500 connections', 'Pro upgrade'],
            ],
          } },

          { subtitle: 'Excalidraw로 다이어그램 작성' },
          { items: [
            'excalidraw.com 접속 (가입 불필요, 즉시 사용)',
            '손그림 느낌 + 정확한 도형',
            '4개 박스 + 화살표로 위 다이어그램 재현',
            '"공유" 버튼으로 팀에 링크 전달',
            '.excalidraw 파일로 저장 → GitHub에 커밋',
          ] },

          { subtitle: 'Mermaid 다이어그램 — README에 자동 렌더' },
          { code: { lang: 'text', content: `graph TD
  A[사용자 브라우저] -->|HTTPS| B[Supabase]
  B --> C[Edge Function]
  C -->|API| D[Solar Pro]
  C -.폴백.-> E[HyperCLOVA X]
  B --> F[(PostgreSQL)]
  B --> G[Storage]` } },
          { text: '위 코드를 README.md에 ```mermaid ... ``` 로 감싸면 GitHub가 자동 렌더링.' },

          { subtitle: '실습' },
          { items: [
            'Excalidraw로 팀 프로젝트 아키텍처 그리기',
            '데이터 흐름 다이어그램 (핵심 기능 1개)',
            '보안 체크리스트 — 키·토큰·비밀번호 위치 검토',
            'Mermaid로 README에 다이어그램 추가',
          ] },
        ],
      },

      {
        id: 'reg-7-wireframe',
        title: '와이어프레임 + UX 흐름',
        icon: '🎨',
        summary: '와이어프레임 도구 비교, 페이지별 와이어프레임 작성, User Flow 도식화, 실제 디자인 영감 큐레이션.',
        content: [
          { subtitle: '와이어프레임이란?' },
          { text: '실제 디자인 전에 화면 구조·레이아웃·요소 배치를 그린 저충실도 스케치. 색·이미지·세부 디자인 없이 "어디에 무엇이 있을지"만 정의.' },

          { subtitle: '와이어프레임 도구 비교' },
          { table: {
            headers: ['도구', '난이도', '강점', '권장 시나리오'],
            rows: [
              ['손그림 (종이)', '★', '가장 빠름', '아이디어 발산'],
              ['Excalidraw', '★', '디지털 손그림', '팀 공유'],
              ['Whimsical', '★★', '풍부한 컴포넌트', '본격 와이어프레임'],
              ['Figma', '★★★', '디자인까지 가능', '전체 디자인 진행'],
              ['Balsamiq', '★★', '거친 스타일', '저충실도 강조'],
              ['v0 by Vercel', '★★', 'AI 자동 생성', '빠른 프로토타입'],
            ],
          } },

          { subtitle: 'AI Reboot 진로 코칭 — 페이지별 와이어프레임' },
          { code: { lang: 'text', content: `[홈 (/)]
┌─────────────────────────────────┐
│ [로고]            [로그인]       │
├─────────────────────────────────┤
│                                 │
│   AI가 30분에 찾는 당신의 진로    │
│                                 │
│   [시작하기 →]                   │
│                                 │
├─────────────────────────────────┤
│ 어떻게 동작하나요?               │
│ [아이콘1] [아이콘2] [아이콘3]     │
│ 가입       대화       결과       │
└─────────────────────────────────┘

[로그인 (/login)]
┌─────────────────────────────────┐
│         로그인                   │
│  ┌─────────────────────┐        │
│  │ 이메일               │        │
│  └─────────────────────┘        │
│  ┌─────────────────────┐        │
│  │ 비밀번호             │        │
│  └─────────────────────┘        │
│  [ 로그인 ]                      │
│  ── 또는 ──                     │
│  [G Google로 로그인]             │
│  [K Kakao로 로그인]              │
└─────────────────────────────────┘

[챗봇 (/chat)]
┌─────────────────────────────────┐
│ [< 뒤로]   진로 진단    [종료]   │
├─────────────────────────────────┤
│ 🤖 안녕하세요! 몇 가지 질문을…   │
│                                 │
│              평소 어떤 활동에 🙋│
│              시간을 가장 많이…   │
│                                 │
│ 🤖 흥미롭네요. 그렇다면…         │
│                                 │
├─────────────────────────────────┤
│ ┌───────────────────────┐ [→]  │
│ │ 입력...                │       │
│ └───────────────────────┘       │
└─────────────────────────────────┘

[결과 (/result)]
┌─────────────────────────────────┐
│      진단 결과                   │
├─────────────────────────────────┤
│ 추천 직무 TOP 3                  │
│ ┌──────────────────────────┐    │
│ │ 1. 백엔드 개발자  85% 적합│    │
│ │ [학습 로드맵 보기 →]      │    │
│ └──────────────────────────┘    │
│ ┌──────────────────────────┐    │
│ │ 2. 데이터 분석가  72%     │    │
│ └──────────────────────────┘    │
│                                 │
│ [PDF 다운로드]  [공유]           │
└─────────────────────────────────┘` } },

          { subtitle: 'User Flow — 사용자 여정' },
          { code: { lang: 'text', content: `[랜딩 → 가입 → 진단 → 결과 → 학습 시작]

랜딩 (/)
   │ "시작하기" 클릭
   ▼
가입/로그인 (/login)
   │ 가입 완료
   ▼
환영 (/welcome)
   │ "진단 시작"
   ▼
챗봇 (/chat)
   │ 15턴 대화
   ▼
결과 (/result)
   │ 직무 선택
   ▼
학습 로드맵 (/roadmap/:job)
   │ "다음 단계로"
   ▼
외부 학습 사이트
   (이탈 — 우리 서비스 종료)` } },

          { subtitle: '와이어프레임 작성 체크리스트' },
          { items: [
            '☐ 모든 핵심 페이지 (Must 스토리에 해당)',
            '☐ 페이지 간 이동 흐름 명확',
            '☐ 입력·버튼·결과 표시 영역 표시',
            '☐ 모바일 화면 별도 (320px 기준)',
            '☐ 로딩·에러·빈 상태 와이어프레임',
            '☐ 팀원 모두 같은 그림 공유',
          ] },

          { subtitle: '디자인 영감 사이트' },
          { items: [
            'Mobbin — mobbin.com (실제 앱 UI 패턴 모음)',
            'Refero — refero.design (다양한 산업 디자인)',
            'Dribbble — dribbble.com (디자이너 갤러리)',
            'Awwwards — awwwards.com (수상 사이트)',
            'UI Garage — uigarage.net (카테고리별)',
          ] },

          { subtitle: '실습' },
          { items: [
            'Excalidraw로 핵심 5페이지 와이어프레임',
            'User Flow 다이어그램',
            '모바일 버전 (320px) 별도 와이어프레임',
            '팀원 리뷰 + 피드백 반영',
            'GitHub Issues 또는 README에 와이어프레임 공유',
          ] },
        ],
      },

      {
        id: 'reg-7-practice-1',
        title: '실습 1 · Crazy 8s 브레인스토밍 (30분)',
        icon: '🧪',
        summary: '8분 안에 8개 솔루션 스케치 + 닷보팅으로 팀 아이디어 1개 선정.',
        content: [
          { subtitle: '준비물' },
          { items: [
            'A4 종이 1장 (8칸으로 접기)',
            '펜·연필',
            '타이머',
            '닷 보팅용 스티커 (또는 펜으로 표시)',
            '팀원 3~5명',
          ] },

          { subtitle: '진행 순서 (총 30분)' },
          { items: [
            '[5분] 문제 정의 — "쉬었음청년의 ___ 문제"',
            '[8분] 각자 본인 종이 8칸에 1분당 1개 솔루션 그림',
            '[7분] 돌아가며 발표 (각 30초씩)',
            '[10분] 닷 보팅 (각자 3표) → 최다 득표 선정',
          ] },

          { subtitle: '8칸 양식 (종이를 3번 접기)' },
          { code: { lang: 'text', content: `┌───────┬───────┐
│   1   │   2   │   ← 첫 줄 2개
├───────┼───────┤
│   3   │   4   │
├───────┼───────┤
│   5   │   6   │
├───────┼───────┤
│   7   │   8   │   ← 8번째 칸
└───────┴───────┘

각 칸에 솔루션 스케치 (글자 + 간단한 그림)
- 글자만 X (시각적 사고 강제)
- 너무 디테일 X (8분 안에 8개)
- 평가·판단 X (양 먼저)` } },

          { subtitle: '발산 단계의 7가지 규칙' },
          { items: [
            '1. 양이 질을 만든다 — 8개 다 채우기',
            '2. 비판 금지 — "이건 안 될 것 같은데..." X',
            '3. 거친 아이디어 환영 — "AI가 직접 면접 보기" 같은 것도 OK',
            '4. 발판으로 사용 — 옆 칸 아이디어를 변형',
            '5. 시각화 — 그림 + 키워드',
            '6. 시간 엄수 — 1분/칸',
            '7. 침묵 — 말하지 말고 그리기',
          ] },

          { subtitle: '결과 — 본인 팀 아이디어' },
          { code: { lang: 'text', content: `[기록 양식]

[팀 닷 보팅 결과]
1위 (8표): _______________________
2위 (5표): _______________________
3위 (3표): _______________________

[선정된 아이디어]
이름: _____________________________
한 줄 가치 제안: ___________________
타겟 사용자: ______________________
핵심 차별점: ______________________

[다음 단계]
Day 7 실습 2에서 PRD 작성 진입` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 본인 종이에 8개 솔루션 모두 채움',
            '☐ 침묵 유지 (스케치 단계)',
            '☐ 7분 발표에 모든 팀원 참여',
            '☐ 닷 보팅으로 1개 선정',
            '☐ 회의록 작성',
          ] },
        ],
      },

      {
        id: 'reg-7-practice-2',
        title: '실습 2 · 페르소나 작성 (25분)',
        icon: '🧪',
        summary: '추상적 사용자를 구체적인 1명으로 — 페르소나 카드 작성 + 사용자 인터뷰 가이드.',
        content: [
          { subtitle: '페르소나 카드 작성' },
          { code: { lang: 'text', content: `[페르소나 카드 양식 — 본인 팀에 맞춰 작성]

📷 [얼굴 이미지 또는 일러스트]

기본 정보
- 이름:        김민지 (가상)
- 나이:        28세
- 성별:        여
- 직업:        구직 활동 중
- 거주지:      경기도 수원
- 가족:        부모님과 동거

배경 스토리 (3~4문장)
인문 전공, 대기업 마케팅 2년 경력 후 권고사직.
1년간 진로 탐색했으나 방향 못 잡음. 부모님 압박 + 본인 자존감 하락.
디지털 직군 전환 고려 중이나 어디서 시작해야 할지 모름.

목표 (Wants)
- 빠르게 (3~6개월) 디지털 직군 진입
- 포트폴리오 1개 확보
- 면접에서 자신 있게 말할 수 있는 실력

좌절점 (Pain Points)
- 코딩 부트캠프 6개월 + 비쌈 + 진입 두려움
- 유튜브 강의 끝까지 못 함
- 면접에서 "포트폴리오 없음" 거절
- 친구들 다 취업한 상태에서의 압박

행동 패턴
- 평일 4시간 집중 가능
- 출퇴근 1시간 유튜브 청취 (취업·자기계발)
- 카톡 + 인스타 활성
- 노트북 보유, 코딩 도구 0

기술 수준
- Word·엑셀 OK
- 코딩 경험 0
- ChatGPT 정도 사용

대표적인 하루
"오전 8시 기상, 카페에서 노트북 → 12시 점심
 → 오후 학습/구직 사이트 → 18시 운동 → 21시 다시 학습"

좋아하는 것
- Netflix 다큐
- 카페에서 일하기
- 인스타그램 자기계발 콘텐츠

싫어하는 것
- 너무 긴 강의
- 비싼 등록비
- 비논리적 마케팅` } },

          { subtitle: '검증 — 사용자 인터뷰 (선택)' },
          { code: { lang: 'text', content: `[The Mom Test — 좋은 질문 5개]

❌ "이런 앱 있으면 쓸 거예요?" (가상 미래)
✅ "지금 진로 고민할 때 어떻게 하세요?" (현재 행동)

❌ "AI 도구 도움 될 것 같죠?" (유도)
✅ "최근에 새 기술 배운 경험 말씀해주세요" (실제)

❌ "이거 돈 주고 살래요?" (지불 의사)
✅ "이 문제로 돈을 써본 적 있나요? 얼마?" (실제 지출)

❌ "마음에 들어요?" (의견)
✅ "이 영상 보고 어떤 느낌이었어요?" (반응)

❌ "어떤 기능 추가했으면 좋겠어요?" (요구사항 수집)
✅ "지금 가장 답답한 게 뭐예요?" (문제 발견)` } },

          { subtitle: 'JTBD 양식 — Jobs To Be Done' },
          { code: { lang: 'text', content: `[양식]
상황 (Situation): _______________________
하고 싶은 것 (Want): _____________________
이유 (So that): __________________________

[예시]
상황: 김민지가 평일 저녁 노트북 앞에서
하고 싶은 것: 4주 안에 동작하는 AI 서비스 1개 완성
이유: 면접에서 보여줄 포트폴리오 확보 + 자신감 회복

→ 우리 서비스는 "4주 후 동작하는 결과물"을 약속해야 함` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 가상의 이름·나이·배경 구체적',
            '☐ 좌절점 4개 이상',
            '☐ 행동 패턴이 측정 가능 (시간·매체)',
            '☐ JTBD 양식 작성',
            '☐ 팀 전원이 같은 페르소나에 동의',
          ] },
        ],
      },

      {
        id: 'reg-7-practice-3',
        title: '실습 3 · PRD 8섹션 작성 (40분)',
        icon: '🧪',
        summary: '1페이지 PRD 8섹션을 AI 협업으로 완성하는 표준 워크플로우.',
        content: [
          { subtitle: '8섹션 양식 — 본인 팀에 맞춰' },
          { code: { lang: 'markdown', content: `# [서비스명] — [한 줄 가치 제안]

## 1. Problem (문제)
[누구의 어떤 문제? 3~5문장]
[통계 또는 근거 1~2개]

## 2. Target User (대상 사용자)
[페르소나 카드 1단락 요약]

## 3. Solution (솔루션)
[AI가 어떻게 해결? 3~5문장]
[핵심 차별점]

## 4. Key Features (핵심 기능)
- [기능 1]: 한 줄 설명
- [기능 2]: 한 줄 설명
- [기능 3]: 한 줄 설명
- [기능 4]: 한 줄 설명
- [기능 5]: 한 줄 설명

## 5. Tech Stack
- Frontend: React 19 + Vite 7 + TypeScript
- Backend: Supabase (Auth + DB + Storage + Edge Functions)
- LLM: Solar Pro (주력) + HyperCLOVA X (폴백)
- Hosting: GitHub Pages
- AI Tools: Cursor + Claude Code

## 6. LLM Usage (국내 LLM 활용)
[핵심 기능에 어떻게 통합? 2~3문장]
[프롬프트 전략·비용 관리]

## 7. MVP Scope (6월 22일까지)
### Must (필수)
- [필수 기능 4~5개]

### Should (있으면 좋음)
- [중요 기능 2~3개]

### Could (여유 시간)
- [부가 기능 2~3개]

### Won't (이번엔 안 함)
- [명시적으로 제외 3~4개]

## 8. Success Metric (성공 지표)
- [정량 지표 1]: 예) 50명 가입
- [정량 지표 2]: 예) 진단 완료율 70%
- [정성 지표]: 예) 만족도 4.0/5` } },

          { subtitle: 'AI 협업 프롬프트' },
          { code: { lang: 'text', content: `[Cursor 또는 Claude.ai에 입력]

너는 시니어 PM이다. 우리 팀이 만들 서비스의 PRD를
8섹션으로 작성하라.

[서비스 아이디어]
[1~2문단으로 본인 팀 아이디어 설명]

[페르소나]
[Day 7 실습 2 결과 붙여넣기]

[제약]
- 4주 안에 만들 수 있는 범위만
- 국내 LLM(Solar/HyperCLOVA X) 활용 명시
- 측정 가능한 성공 지표
- React + Supabase 기술 스택

작성 후 다음을 추가로 제안하라:
- 가장 큰 위험 요소 3가지
- 사용자 인터뷰 시 물어야 할 질문 5개
- MVP 외부 검증 방법 1개` } },

          { subtitle: '검수 체크리스트' },
          { items: [
            '☐ 8섹션 모두 채워짐',
            '☐ 페르소나가 구체적',
            '☐ Key Features 5개 이하',
            '☐ Must는 4주 내 가능?',
            '☐ Won\'t를 명시 (욕심 방지)',
            '☐ 성공 지표가 숫자',
            '☐ 팀원 모두 동의',
          ] },
        ],
      },

      {
        id: 'reg-7-practice-4',
        title: '실습 4 · 사용자 스토리 + MoSCoW (30분)',
        icon: '🧪',
        summary: '핵심 사용자 스토리 7~10개 작성 + INVEST 점검 + MoSCoW 우선순위.',
        content: [
          { subtitle: '단계 1 · 스토리 작성 (15분)' },
          { code: { lang: 'text', content: `[스토리 양식]
As a [페르소나]
I want to [기능/행동]
so that [얻는 가치].

수락 기준:
- Given [상황]
- When [행동]
- Then [결과]

[작성 예시 5개]

[Story 1 · 가입]
As a 진로 고민 중인 28세 김민지
I want to 이메일 또는 Google로 30초 안에 가입
so that 즉시 진단을 시작할 수 있다.

수락 기준:
- Given 첫 방문 사용자
- When "시작하기" 클릭
- Then 가입 페이지 → 30초 이내 완료

[Story 2 · 진단 시작]
As a 가입 완료한 사용자
I want to AI와 자연어로 진단 대화 시작
so that 본인 적성을 발견할 수 있다.

[Story 3 · 진단 진행]
As a 진단 시작한 사용자
I want to 최소 10턴 대화로 적성 진단
so that 충분한 정보 기반의 결과를 얻는다.

[Story 4 · 결과 확인]
As a 진단 완료한 사용자
I want to 직무 추천 3개 + 적합도 표시
so that 다음 학습 방향을 결정한다.

[Story 5 · 학습 로드맵]
As a 직무 선택한 사용자
I want to 주차별 학습 가이드
so that 무엇부터 시작할지 명확하다.

[추가 작성 — 본인 팀 스토리 5개 더]` } },

          { subtitle: '단계 2 · INVEST 점검 (5분)' },
          { table: {
            headers: ['Story', 'I', 'N', 'V', 'E', 'S', 'T'],
            rows: [
              ['Story 1', '✓', '✓', '✓', '✓', '✓', '✓'],
              ['Story 2', '?', '?', '?', '?', '?', '?'],
              ['Story 3', '?', '?', '?', '?', '?', '?'],
            ],
          } },

          { subtitle: '단계 3 · MoSCoW 분류 (5분)' },
          { code: { lang: 'text', content: `[Must — 100% 필수]
- Story 1, 2, 3, 4, 5 (가입~결과)

[Should — 50% 목표]
- 결과 PDF 다운로드
- 대화 기록 다시 보기
- 모바일 반응형

[Could — 여유 시간]
- 다크모드
- 5색 컬러 테마
- 알림

[Won't — 이번엔 안 함]
- 결제 시스템
- 모바일 앱
- 멘토 매칭` } },

          { subtitle: '단계 4 · 포인트 추정 (5분)' },
          { code: { lang: 'text', content: `[피보나치: 1, 2, 3, 5, 8, 13]

Story 1 (가입):           2pt
Story 2 (진단 시작):       3pt
Story 3 (진단 진행):       8pt   ← LLM 통합·스트리밍
Story 4 (결과 화면):       5pt
Story 5 (학습 로드맵):     3pt
PDF 다운로드:            3pt
대화 기록:              5pt
모바일 반응형:           8pt

Must 합:    21pt
Should 합:  16pt
총:        37pt

[검증]
4주 × 4일 × 4시간 = 64시간
14인일 (개인 단위) ≈ 25~35 포인트 처리 가능

37pt 일정 빠듯 → Should의 일부는 Could로 강등 검토` } },

          { subtitle: 'GitHub Issues 이전 (선택)' },
          { items: [
            '각 스토리 → GitHub Issue 1개',
            '라벨: must / should / could / won\'t',
            '라벨: 1pt / 2pt / 3pt / 5pt / 8pt',
            'Milestone: Week 1, Week 2, Week 3, Week 4',
            'Projects → Kanban 보드',
          ] },
        ],
      },

      {
        id: 'reg-7-practice-5',
        title: '실습 5 · 아키텍처 + 와이어프레임 (30분)',
        icon: '🧪',
        summary: 'Excalidraw로 시스템 아키텍처 + 페이지별 와이어프레임 작성.',
        content: [
          { subtitle: '도구 준비' },
          { items: [
            'excalidraw.com (가입 불필요)',
            '또는 종이 + 펜',
            '또는 Figma (디자인 통합)',
          ] },

          { subtitle: '단계 1 · 시스템 아키텍처 (15분)' },
          { code: { lang: 'text', content: `[표준 5박스 아키텍처]

[사용자] ↔ [브라우저 (React)]
                 ↓
              [Supabase]
                 ↓
   ┌─────────────┼─────────────┐
   │             │             │
[Auth]      [Database]     [Storage]
                 ↓
        [Edge Function]
                 ↓
       [Solar / HyperCLOVA X]

[작성 단계]
1. 사용자·브라우저·Supabase·LLM 4개 박스
2. 화살표 — 데이터 흐름 (요청·응답)
3. 보안 표시 — RLS, JWT, API 키 위치
4. 각 박스 안에 사용 기술 표시
5. 색상 — 본인이 만들 부분 vs 인프라 구분` } },

          { subtitle: '단계 2 · 데이터 흐름 (10분)' },
          { code: { lang: 'text', content: `[핵심 기능 1개 — 진단 챗봇 흐름]

1) 사용자 메시지 입력
   브라우저: setMessages([...prev, userMsg])

2) Edge Function 호출
   브라우저 → Supabase → ask-llm Function
   인증 토큰 자동 전달

3) LLM API 호출
   Edge Function → Solar API
   서버 측 API 키 사용

4) 응답 스트리밍
   Solar → Edge → 브라우저
   토큰 단위로 화면 표시

5) DB 저장
   브라우저: supabase.from('chat_messages').insert()
   RLS로 본인 데이터만 저장

[그림으로 표현]
[사용자]─입력→[React]─[invoke]→[Edge Fn]─[API]→[Solar]
                ↑                                    │
                └────────[스트림]──────────────────┘
                ↓
            [Supabase DB]` } },

          { subtitle: '단계 3 · 페이지별 와이어프레임 (15분)' },
          { code: { lang: 'text', content: `[홈 페이지]
┌─────────────────────────┐
│ [로고]      [로그인]      │
├─────────────────────────┤
│                         │
│  AI가 30분에 찾는        │
│  당신의 진로             │
│                         │
│  [시작하기 →]            │
└─────────────────────────┘

[로그인]
┌─────────────────────────┐
│      로그인              │
│  ┌─────────────────┐    │
│  │ 이메일           │    │
│  └─────────────────┘    │
│  ┌─────────────────┐    │
│  │ 비밀번호         │    │
│  └─────────────────┘    │
│  [ 로그인 ]              │
│  ── 또는 ──             │
│  [G Google]             │
└─────────────────────────┘

[챗봇]
┌─────────────────────────┐
│ [<]   진단    [종료]    │
├─────────────────────────┤
│ 🤖 안녕하세요...         │
│       나는 마케팅 경험.. 🙋 │
│ 🤖 흥미롭네요...         │
├─────────────────────────┤
│ [입력...]         [→]    │
└─────────────────────────┘

[결과]
┌─────────────────────────┐
│      진단 결과           │
│  ┌─────────────────┐    │
│  │ 1. 백엔드 85%   │    │
│  │ [로드맵 →]      │    │
│  └─────────────────┘    │
│  ┌─────────────────┐    │
│  │ 2. 데이터 72%   │    │
│  └─────────────────┘    │
└─────────────────────────┘` } },

          { subtitle: '단계 4 · 모바일 와이어 (5분)' },
          { items: [
            '데스크탑 와이어를 320px 폭으로 축소',
            '햄버거 메뉴로 변환',
            '한 화면 한 액션 원칙',
            '폼 입력은 56px 이상',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 시스템 아키텍처 — 5박스 + 데이터 흐름',
            '☐ 핵심 페이지 5개 와이어프레임',
            '☐ 모바일 버전 별도',
            '☐ Excalidraw 또는 종이 사진 저장',
            '☐ GitHub README에 임베드',
          ] },
        ],
      },

      {
        id: 'reg-7-resources',
        title: '심화 자료 + Day 7 마무리',
        icon: '📚',
        summary: '제품 기획·디자인 심화 자료 + Day 7 자가 평가 + 다음 단계 안내.',
        content: [
          { subtitle: '필수 도서' },
          { items: [
            '『Inspired』 마티 케이건 — PM 필독서',
            '『린 스타트업』 에릭 리스 — MVP 사고',
            '『The Mom Test』 롭 피츠패트릭 — 사용자 인터뷰',
            '『해커스 디자인 시스템』 — 디자인 시스템 입문',
            '『UX 디자인 권하는 사회』 — 한국 UX 책 추천',
          ] },

          { subtitle: '온라인 자료' },
          { items: [
            'Reforge — reforge.com (유료 PM 강의)',
            'Lenny\'s Newsletter — lennysnewsletter.com (PM 뉴스레터)',
            'Notion templates → "PRD" 검색',
            'Figma Community → "Wireframe Kit" 검색',
            'YouTube "Aakash Gupta" (PM 채널)',
          ] },

          { subtitle: '경진대회 출품 가이드' },
          { items: [
            '국내 LLM(Solar/HyperCLOVA X/EXAONE) 핵심 기능에 통합',
            '"문제 해결력" 30% 가중치 — 명확한 문제 정의가 가장 중요',
            'UI/UX 20% — 완성도 높은 디자인 + 모바일 대응',
            '발표 자료 8슬라이드 + 3분 데모',
            'GitHub README에 데모 GIF + 실행 방법',
          ] },

          { subtitle: 'Day 7 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['문제 정의', '"좋은 아이디어"만', '페르소나 + 5 Whys', 'JTBD + 검증 인터뷰'],
              ['PRD', '없음', '8섹션 채움', 'AI 협업 + 팀 리뷰 완료'],
              ['스토리·MoSCoW', '없음', '5개 스토리', 'INVEST + 포인트 추정'],
              ['아키텍처', '없음', '간단한 도식', '데이터 흐름 + 보안'],
              ['와이어프레임', '없음', '핵심 페이지만', '모바일 + User Flow + 빈 상태'],
            ],
          } },

          { subtitle: '다음 단계' },
          { text: 'Day 7에서 설계를 완성했다면, Day 8부터 본격 구현 시작. LLM API·프론트엔드·백엔드 연동을 통해 PRD가 동작하는 제품이 됩니다.' },
        ],
      },
    ],
  },

  {
    id: 'reg-check-2',
    title: 'Day 9 · 2차 학습점검일',
    icon: '🔎',
    description: 'React·Supabase·AI·LLM API 연동 학습 내용을 점검하고, 프로젝트 2차 팀별 회의를 진행하는 날입니다.',
    content: [
      { subtitle: '⚛️ React 점검', items: [
        '컴포넌트·Props·State·JSX 이해',
        '핵심 Hook(useState·useEffect)과 의존성 배열',
        '리스트·조건부 렌더링과 이벤트 처리',
        '라우팅(react-router)과 페이지 구성',
      ] },
      { subtitle: '🗄️ Supabase 백엔드 점검', items: [
        '테이블 설계와 CRUD(select·insert·update·delete)',
        '인증(Auth)과 세션 관리',
        'RLS(행 수준 보안) 기본 개념',
        '프론트엔드 연동(supabase-js) 흐름',
      ] },
      { subtitle: '🤖 AI · LLM API 연동 점검', items: [
        'LLM API 호출 구조(요청·응답·토큰)',
        '프롬프트 설계와 파라미터(temperature 등)',
        'API 키 보안과 환경변수 관리',
        '응답 처리·에러 핸들링·스트리밍 기초',
      ] },
      { callout: { type: 'tip', text: '연동이 막히는 지점(인증·CORS·키 관리)을 미리 점검해 두면 실전 프로젝트에서 시간을 크게 아낄 수 있습니다.' } },
      { subtitle: '👥 프로젝트 2차 팀별 회의', items: [
        '1차 회의 이후 진행 상황 공유',
        '핵심 기능 구현 현황 점검 및 일정 조정',
        '기술 이슈·블로커 정리와 역할 재분담',
        '발표 시나리오·데모 범위 초안 논의',
      ] },
      { callout: { type: 'info', text: '2차 회의 결과와 남은 마일스톤을 팀 게시판에 업데이트하세요.' } },
    ],
  },

  {
    id: 'reg-8',
    title: 'Day 10 · LLM API 연동',
    icon: '🔌',
    description: 'OpenAI 호환 형식, messages 배열 구조, 스트리밍 응답, temperature/max_tokens 튜닝, 에러 처리·재시도까지 — 프로덕션 품질의 LLM 통합을 코드로 구현합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'REST API 기본 + Solar 표준 호출', 'fetch 호출 성공'],
          ['S2', '50분', 'messages 배열 + 다중 턴 대화', '대화형 챗봇 골격'],
          ['S3', '50분', '스트리밍 응답 + 토큰 단위 표시', '실시간 챗 UI'],
          ['S4', '50분', '에러 처리·재시도·비용 관리', '안정적인 프로덕션 함수'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        'fetch로 Solar API를 호출하고 응답을 파싱한다',
        'messages 배열 + system/user/assistant 역할을 활용한다',
        '스트리밍 응답을 ReadableStream으로 실시간 표시한다',
        'temperature·max_tokens·stop 등 핵심 파라미터를 튜닝한다',
      ] },

      { subtitle: 'REST API 기본 구조' },
      { table: {
        headers: ['요소', '값', '의미'],
        rows: [
          ['method', 'POST', '서버에 데이터 전송'],
          ['headers.Authorization', 'Bearer <key>', 'API 키 인증'],
          ['headers.Content-Type', 'application/json', '본문 형식'],
          ['body', 'JSON 문자열', '실제 요청 데이터'],
        ],
      } },

      { subtitle: 'Solar API 표준 호출' },
      { code: { lang: 'typescript', content: `// src/utils/solar.ts
const API_URL = 'https://api.upstage.ai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_SOLAR_API_KEY;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatSolar(messages: Message[]): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'solar-pro',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    throw new Error(\`Solar API 오류: \${res.status}\`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}` } },

      { subtitle: 'messages 배열 — 대화 컨텍스트 유지' },
      { code: { lang: 'typescript', content: `// 첫 메시지
const messages: Message[] = [
  { role: 'system', content: '너는 친절한 진로 코치다. 한국어로만 답하라.' },
  { role: 'user',   content: '저는 28세 비전공자입니다. 어떻게 시작해야 할까요?' },
];

const reply1 = await chatSolar(messages);
messages.push({ role: 'assistant', content: reply1 });

// 후속 질문
messages.push({ role: 'user', content: '바이브코딩이 무엇인가요?' });
const reply2 = await chatSolar(messages);
// → reply2는 이전 대화 맥락을 알고 답함` } },
      { callout: { type: 'info', text: 'system 메시지는 보통 처음에 1번만 두고, user/assistant가 번갈아 누적됩니다. 대화가 길어지면 토큰이 누적되어 비용·지연이 늘어나므로 적당한 시점에서 요약 또는 새 세션으로 분리해야 합니다.' } },

      { subtitle: '핵심 파라미터' },
      { table: {
        headers: ['파라미터', '범위', '효과', '권장'],
        rows: [
          ['temperature', '0.0 ~ 2.0', '높을수록 창의·낮을수록 결정적', '대화: 0.7, 분류: 0.0'],
          ['max_tokens', '1 ~ ctx 한도', '응답 최대 길이', '챗 1024, 요약 512'],
          ['top_p', '0.0 ~ 1.0', '확률 누적 상위 p%에서 선택', '0.9 (대부분 유지)'],
          ['stop', '문자열 배열', '여기서 응답 중단', '"Q:", "###" 등'],
          ['stream', 'true/false', '토큰 단위 스트리밍', '챗 UI는 true'],
        ],
      } },

      { subtitle: '스트리밍 응답 처리' },
      { text: '한 번에 응답을 받으면 사용자가 5~10초 대기. 스트리밍을 쓰면 토큰이 생성되는 즉시 화면에 표시되어 체감 속도가 크게 개선됩니다.' },
      { code: { lang: 'typescript', content: `export async function streamSolar(
  messages: Message[],
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${API_KEY}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'solar-pro', messages, stream: true }),
  });

  const reader  = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\\n');
    buffer = lines.pop() || '';                      // 미완성 줄은 다음 청크와 합침

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch { /* 부분 JSON 무시 */ }
    }
  }
}` } },

      { subtitle: '에러 처리 + 재시도' },
      { code: { lang: 'typescript', content: `// 지수 백오프 (1s → 2s → 4s)
export async function chatWithRetry(
  messages: Message[],
  retries = 3
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      return await chatSolar(messages);
    } catch (err: any) {
      if (i === retries - 1) throw err;
      // 429 (rate limit) 또는 5xx만 재시도
      const status = err.status || err.code;
      if (status !== 429 && (status < 500 || status >= 600)) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('재시도 한도 초과');
}` } },

      { subtitle: '비용 계산식' },
      { text: '대부분의 LLM은 입력 토큰과 출력 토큰을 별도로 과금합니다. 입력은 저렴, 출력은 비싸므로 system 프롬프트가 길면 누적 비용이 커집니다.' },
      { code: { lang: 'text', content: `예: Solar Pro 기준 (가상의 단가)
- 입력: $0.0005 / 1K tokens
- 출력: $0.0015 / 1K tokens

대화 1회 = system(200) + user(100) + assistant(500)
        = 입력 300 + 출력 500
        = (300 × 0.0005 + 500 × 0.0015) / 1000
        = $0.0009 (약 1.2원)

→ 1만 명 × 10턴 = 약 12만 원
대화 누적 시 system이 매번 포함되므로 길이 관리가 비용 관리` } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "스트리밍이 꼭 필요한가요?" — UX 차이가 큼. 응답 5초 vs 즉시 표시는 체감 천양지차. 챗봇은 사실상 필수.',
        'Q. "대화 기록이 너무 길어지면?" — 토큰 한도 초과 위험. 일정 길이 넘으면 이전 대화를 요약해서 system 메시지에 합치는 패턴.',
        'Q. "함수 호출(function calling)은 무엇인가요?" — LLM이 정의된 함수를 호출하도록 유도. 예: "오늘 날씨" → get_weather() 함수 호출 → 결과를 다시 LLM이 자연어로 변환.',
        'Q. "비용을 줄이려면?" — ① 짧은 system 프롬프트 ② 캐싱 ③ Mini/Lite 모델로 분류 + Pro 모델로 생성 (라우팅) ④ max_tokens 제한.',
        'Q. "Rate limit에 자주 걸려요" — 지수 백오프 재시도 + 동시 요청 수 제한 (Semaphore 패턴). 유료 플랜 업그레이드는 마지막 카드.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. messages 배열의 role 값 3가지를 답하시오.',
        '2. 응답을 결정적으로 만들려면 temperature를 얼마로 설정하나?',
        '3. 스트리밍 응답에서 마지막에 오는 시그널은?',
        '4. 429 응답 코드는 무엇을 의미하는가?',
        '5. 비용을 줄이는 캐싱 전략 1가지를 답하시오.',
      ] },
      { callout: { type: 'tip', text: '정답: 1) system, user, assistant  2) 0 (또는 0에 가까운 값)  3) [DONE]  4) Too Many Requests (rate limit 초과)  5) 자주 묻는 질문 상위 N개를 Redis/DB에 캐싱' } },

      { subtitle: '참고 자료' },
      { items: [
        'OpenAI API 문서: platform.openai.com/docs (표준이므로 학습 추천)',
        'Solar 문서: developers.upstage.ai',
        'Server-Sent Events (SSE) MDN: developer.mozilla.org/ko/docs/Web/API/Server-sent_events',
        '스트리밍 패턴: vercel.ai 라이브러리 GitHub',
        '비용 계산기: openai.com/api/pricing',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        'fetch로 Solar API 동기 호출 → 응답 JSON 구조 파악',
        '대화형 messages 배열 + 후속 질문 처리 구현',
        '스트리밍 응답으로 챗 UI 구현 (토큰 단위 표시)',
        'temperature 0.0 / 0.7 / 1.5 응답 차이 비교 노트',
        '의도적으로 rate limit 유발 → 재시도 로직 동작 확인',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 9부터는 실제 팀 프로젝트의 프론트엔드 본 개발. 디자인 토큰·컴포넌트 분리·4가지 상태 UI로 완성도를 끌어올립니다.' },
    ],
    subSections: [
      {
        id: 'reg-8-rest',
        title: 'REST API 기본 + Solar 호출',
        icon: '🌐',
        summary: 'HTTP 메서드·상태 코드·헤더 표준부터 Solar API 첫 호출까지. 모든 LLM 통합의 토대.',
        content: [
          { subtitle: 'HTTP 메서드 5종' },
          { table: {
            headers: ['메서드', '용도', '본문', '멱등성'],
            rows: [
              ['GET', '리소스 조회', '없음', '예'],
              ['POST', '새 리소스 생성', '있음', '아니오'],
              ['PUT', '리소스 전체 교체', '있음', '예'],
              ['PATCH', '리소스 부분 수정', '있음', '아니오'],
              ['DELETE', '리소스 삭제', '없음', '예'],
            ],
          } },

          { subtitle: 'HTTP 상태 코드 핵심' },
          { table: {
            headers: ['코드', '의미', '예'],
            rows: [
              ['200', 'OK', '정상 응답'],
              ['201', 'Created', '리소스 생성됨'],
              ['204', 'No Content', '성공 + 본문 없음'],
              ['301', 'Moved Permanently', '영구 리다이렉트'],
              ['400', 'Bad Request', '요청 형식 오류'],
              ['401', 'Unauthorized', '인증 필요'],
              ['403', 'Forbidden', '권한 없음'],
              ['404', 'Not Found', '리소스 없음'],
              ['429', 'Too Many Requests', 'Rate limit 초과'],
              ['500', 'Internal Server Error', '서버 오류'],
              ['503', 'Service Unavailable', '일시 사용 불가'],
            ],
          } },

          { subtitle: 'Solar API 표준 호출' },
          { code: { lang: 'typescript', content: `// src/utils/solar.ts
const API_URL = 'https://api.upstage.ai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_SOLAR_API_KEY;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SolarResponse {
  choices: Array<{
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chatSolar(messages: Message[]): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'solar-pro',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(\`Solar API \${res.status}: \${error.message}\`);
  }

  const data: SolarResponse = await res.json();
  return data.choices[0].message.content;
}` } },

          { subtitle: '실습 — 첫 호출' },
          { code: { lang: 'typescript', content: `// React 컴포넌트에서 호출
import { useState } from 'react';
import { chatSolar } from '@/utils/solar';

export default function FirstLLMTest() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await chatSolar([
        { role: 'system', content: '반드시 한국어로만 답하라.' },
        { role: 'user', content: prompt },
      ]);
      setResponse(result);
    } catch (err: any) {
      setResponse('오류: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button disabled={loading}>{loading ? '답변 중…' : '전송'}</button>
      <pre>{response}</pre>
    </form>
  );
}` } },

          { subtitle: '실습' },
          { items: [
            'src/utils/solar.ts 작성 + chatSolar 함수',
            '간단한 React 컴포넌트로 첫 호출 성공',
            '응답 JSON 구조 분석 (choices·usage 등)',
            '토큰 사용량을 화면에 표시',
          ] },
        ],
      },

      {
        id: 'reg-8-messages',
        title: 'messages 배열 + 다중 턴 대화',
        icon: '💬',
        summary: 'system/user/assistant 역할, 대화 컨텍스트 누적, 시스템 프롬프트 설계 패턴, 대화 길이 관리.',
        content: [
          { subtitle: '역할 (Role) 3종' },
          { table: {
            headers: ['Role', '용도', '예'],
            rows: [
              ['system', '모델 역할·말투·제약 지정', '"너는 친절한 진로 코치다"'],
              ['user', '사용자 메시지', '"제 적성을 알려주세요"'],
              ['assistant', '모델의 이전 답변', '대화 히스토리'],
            ],
          } },

          { subtitle: '다중 턴 대화 구조' },
          { code: { lang: 'typescript', content: `// 대화가 진행됨에 따라 messages 배열에 누적
const messages: Message[] = [
  // 시작: system 1개
  { role: 'system', content: '너는 친절한 진로 코치다. 한국어로만 답하라.' },

  // 사용자 첫 질문
  { role: 'user', content: '저는 28세 비전공자입니다. 어떻게 시작해야 할까요?' },

  // 모델 첫 답변 (이전 호출 결과 저장)
  { role: 'assistant', content: '먼저 본인의 강점을 알아봅시다. 평소 어떤 활동에...' },

  // 사용자 후속
  { role: 'user', content: '저는 글쓰기를 좋아합니다.' },
];

// 다음 호출 — 모델이 이전 대화 맥락을 알고 답변
const reply = await chatSolar(messages);` } },

          { subtitle: '시스템 프롬프트 설계 패턴' },
          { code: { lang: 'text', content: `[패턴 1 · 역할 + 톤]
너는 30년 경력의 시니어 진로 코치다.
공감적이고 격려하는 톤으로 대화하라.
의학·법률 등 전문 영역은 단정하지 말 것.

[패턴 2 · 출력 형식 강제]
너는 면접 시뮬레이션 봇이다.
질문 → 사용자 답변 → 다음 질문 형태로 진행.
한 번에 1개 질문만 하라.

[패턴 3 · 제약 명시]
다음 제약을 반드시 지켜라:
1. 한국어로만 답한다
2. 1번 답변은 200자 이하
3. 약물·자해·폭력 주제는 거부

[패턴 4 · Few-shot]
[예시 대화]
사용자: 우울해요
응답: 그런 감정을 느끼시는군요. 어떤 일이 있으셨나요?

사용자: 직장에서 힘들어요
응답: 자세히 들려주세요. 동료와의 관계인가요, 업무 자체인가요?

[실제 대화]
사용자: {{ 사용자 입력 }}
응답:` } },

          { subtitle: '대화 길이 관리 — 토큰 예산' },
          { code: { lang: 'typescript', content: `// 토큰 누적 계산 (대략)
function estimateTokens(messages: Message[]): number {
  return messages.reduce((sum, m) => sum + m.content.length / 2, 0);
  // 영어: ~4글자/토큰, 한국어: ~2글자/토큰 (대략)
}

// 컨텍스트 한도 관리
const MAX_TOKENS = 30000;   // Solar 32K 컨텍스트의 80%

async function safeChat(messages: Message[]) {
  let history = [...messages];

  // 한도 초과 시 오래된 대화부터 요약
  while (estimateTokens(history) > MAX_TOKENS) {
    const oldMessages = history.splice(1, 5);  // system 다음 5개 제거
    const summary = await summarize(oldMessages);
    history.splice(1, 0, {
      role: 'system',
      content: \`[이전 대화 요약] \${summary}\`,
    });
  }

  return chatSolar(history);
}

async function summarize(messages: Message[]): Promise<string> {
  return chatSolar([
    { role: 'system', content: '다음 대화를 3문장으로 요약하라.' },
    { role: 'user', content: messages.map(m => \`\${m.role}: \${m.content}\`).join('\\n') },
  ]);
}` } },

          { subtitle: '대화 저장 (Supabase)' },
          { code: { lang: 'sql', content: `-- 대화 세션
create table chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id),
  title       text,
  created_at  timestamptz default now()
);

-- 메시지
create table chat_messages (
  id          bigserial primary key,
  session_id  uuid not null references chat_sessions(id) on delete cascade,
  role        text not null check (role in ('system', 'user', 'assistant')),
  content     text not null,
  tokens      int,
  created_at  timestamptz default now()
);

create index chat_messages_session_idx on chat_messages (session_id);

-- RLS
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

create policy "Users own sessions" on chat_sessions
  for all using (auth.uid() = user_id);

create policy "Users own messages" on chat_messages
  for all using (
    auth.uid() = (select user_id from chat_sessions where id = session_id)
  );` } },

          { subtitle: '대화 로드 + 이어가기' },
          { code: { lang: 'typescript', content: `async function loadSession(sessionId: string): Promise<Message[]> {
  const { data } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at');

  return data as Message[];
}

async function sendMessage(sessionId: string, userMessage: string) {
  const history = await loadSession(sessionId);
  history.push({ role: 'user', content: userMessage });

  // 사용자 메시지 저장
  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    role: 'user',
    content: userMessage,
  });

  // LLM 호출
  const reply = await chatSolar(history);

  // 모델 응답 저장
  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    role: 'assistant',
    content: reply,
  });

  return reply;
}` } },

          { subtitle: '실습' },
          { items: [
            'system 프롬프트로 진로 코치 봇 만들기',
            '5턴 이상 대화 — 컨텍스트 유지 확인',
            'chat_sessions + chat_messages 테이블 + RLS',
            '대화 저장 + 다음 로그인 시 이어보기',
          ] },
        ],
      },

      {
        id: 'reg-8-streaming',
        title: '스트리밍 응답 — 실시간 표시',
        icon: '🌊',
        summary: 'Server-Sent Events 기반 스트리밍 응답 처리. fetch + ReadableStream으로 토큰 단위 표시.',
        content: [
          { subtitle: '왜 스트리밍인가' },
          { text: '응답 5초 대기 vs 즉시 첫 토큰 표시 — UX 천양지차. ChatGPT가 글자를 한 글자씩 보여주는 그 효과.' },

          { subtitle: '스트리밍 호출' },
          { code: { lang: 'typescript', content: `export async function streamSolar(
  messages: Message[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'solar-pro',
      messages,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  if (!res.body) throw new Error('No body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\\n');
    buffer = lines.pop() || '';   // 미완성 줄 보관

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch {
        // 부분 JSON — 무시
      }
    }
  }
}` } },

          { subtitle: 'React 챗 UI 통합' },
          { code: { lang: 'tsx', content: `function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);

  async function send() {
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    try {
      await streamSolar(
        [...messages, userMsg],
        (chunk) => {
          // 마지막 assistant 메시지에 chunk 추가
          setMessages(prev => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
            return copy;
          });
        }
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={m.role}>
            {m.content}
            {streaming && i === messages.length - 1 && '▋'}
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input value={input} onChange={e => setInput(e.target.value)} disabled={streaming} />
        <button disabled={streaming}>전송</button>
      </form>
    </div>
  );
}` } },

          { subtitle: '취소 + AbortController' },
          { code: { lang: 'tsx', content: `function ChatBox() {
  const controllerRef = useRef<AbortController | null>(null);

  async function send() {
    controllerRef.current = new AbortController();
    try {
      await streamSolar(messages, onChunk, controllerRef.current.signal);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      throw err;
    }
  }

  function cancel() {
    controllerRef.current?.abort();
  }

  return (
    <>
      <button onClick={send} disabled={streaming}>전송</button>
      <button onClick={cancel} disabled={!streaming}>중단</button>
    </>
  );
}` } },

          { subtitle: '실습' },
          { items: [
            'streamSolar 함수 작성',
            'React 챗 UI에 통합 → 토큰 단위 표시',
            '커서(▋) 깜빡임 + 자동 스크롤',
            '중단 버튼 + AbortController',
          ] },
        ],
      },

      {
        id: 'reg-8-error',
        title: '에러 처리·재시도·비용 관리',
        icon: '🛡️',
        summary: '운영 환경에서 필수인 에러 처리·지수 백오프 재시도·rate limit·비용 모니터링·폴백 전략.',
        content: [
          { subtitle: '핵심 파라미터 5종' },
          { table: {
            headers: ['파라미터', '범위', '효과', '권장'],
            rows: [
              ['temperature', '0.0 ~ 2.0', '창의성 vs 결정성', '대화 0.7, 분류 0.0'],
              ['max_tokens', '1 ~ ctx 한도', '응답 최대 길이', '챗 1024, 요약 512'],
              ['top_p', '0.0 ~ 1.0', '확률 누적 상위 p%', '0.9 (기본 유지)'],
              ['stop', 'string[]', '특정 문자에서 중단', '"###", "Q:" 등'],
              ['frequency_penalty', '-2 ~ 2', '반복 토큰 감점', '0~0.5 (반복 줄임)'],
            ],
          } },

          { subtitle: '재시도 — 지수 백오프' },
          { code: { lang: 'typescript', content: `async function chatWithRetry(
  messages: Message[],
  retries = 3
): Promise<string> {
  let lastError: any;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await chatSolar(messages);
    } catch (err: any) {
      lastError = err;

      // 재시도해도 의미 없는 에러는 즉시 throw
      if (err.message.includes('401') || err.message.includes('400')) {
        throw err;
      }

      // 429 (rate limit) 또는 5xx만 재시도
      if (err.message.includes('429') || /5\\d\\d/.test(err.message)) {
        const delay = 1000 * Math.pow(2, attempt);  // 1s → 2s → 4s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw err;   // 그 외는 즉시 실패
    }
  }

  throw lastError;
}` } },

          { subtitle: 'Rate Limit 대응' },
          { code: { lang: 'typescript', content: `// 동시 요청 수 제한 (Semaphore)
class Semaphore {
  private queue: (() => void)[] = [];
  private current = 0;
  constructor(private max: number) {}

  async acquire() {
    if (this.current >= this.max) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.current++;
  }

  release() {
    this.current--;
    const next = this.queue.shift();
    if (next) next();
  }
}

const llmSemaphore = new Semaphore(3);   // 동시 3개

async function rateLimitedChat(messages: Message[]) {
  await llmSemaphore.acquire();
  try {
    return await chatSolar(messages);
  } finally {
    llmSemaphore.release();
  }
}` } },

          { subtitle: '폴백 (Fallback) 전략' },
          { code: { lang: 'typescript', content: `async function chatWithFallback(messages: Message[]): Promise<string> {
  // 1순위: Solar
  try {
    return await chatSolar(messages);
  } catch (err) {
    console.warn('Solar 실패 → HyperCLOVA 폴백', err);
  }

  // 2순위: HyperCLOVA
  try {
    return await chatHyperCLOVA(messages);
  } catch (err) {
    console.warn('HyperCLOVA 실패 → 정적 응답', err);
  }

  // 최종: 정적 폴백
  return '죄송합니다. 일시적으로 답변할 수 없습니다. 잠시 후 다시 시도해주세요.';
}` } },

          { subtitle: '비용 모니터링' },
          { code: { lang: 'typescript', content: `// 토큰 사용량 + 비용 추정
interface UsageLog {
  user_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_krw: number;
}

const PRICING = {
  'solar-pro': { input: 0.65, output: 1.95 },   // 1000 토큰당 원
};

async function chatWithLogging(messages: Message[], userId: string) {
  const res = await fetch(API_URL, { /* ... */ });
  const data = await res.json();
  const usage = data.usage;

  // Supabase에 로깅
  await supabase.from('llm_usage_logs').insert({
    user_id: userId,
    model: 'solar-pro',
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    estimated_cost_krw:
      (usage.prompt_tokens * PRICING['solar-pro'].input +
       usage.completion_tokens * PRICING['solar-pro'].output) / 1000,
  });

  return data.choices[0].message.content;
}

// 일일 사용량 대시보드
const { data } = await supabase
  .from('llm_usage_logs')
  .select('estimated_cost_krw')
  .gte('created_at', new Date().toISOString().split('T')[0]);

const todayCost = data?.reduce((sum, r) => sum + r.estimated_cost_krw, 0) ?? 0;` } },

          { subtitle: '캐싱 — 비용 절감 핵심' },
          { code: { lang: 'typescript', content: `// FAQ 같은 동일 질문은 캐싱
const cache = new Map<string, { data: string; ts: number }>();
const TTL = 1000 * 60 * 60 * 24;  // 24시간

function cacheKey(messages: Message[]): string {
  // user 메시지만 키로 (system 변경에 영향 받지 않게)
  return messages.filter(m => m.role === 'user').map(m => m.content).join('|');
}

export async function cachedChat(messages: Message[]): Promise<string> {
  const key = cacheKey(messages);
  const hit = cache.get(key);

  if (hit && Date.now() - hit.ts < TTL) {
    console.log('cache hit');
    return hit.data;
  }

  const result = await chatSolar(messages);
  cache.set(key, { data: result, ts: Date.now() });
  return result;
}

// 프로덕션: Redis 또는 Supabase 테이블 사용` } },

          { subtitle: '실습' },
          { items: [
            'chatWithRetry — 지수 백오프 + 재시도 가능 에러 구분',
            'Semaphore로 동시 3개 제한',
            '폴백: Solar → HyperCLOVA → 정적',
            'llm_usage_logs 테이블 + 비용 일일 합산',
            '캐싱으로 동일 질문 1회만 API 호출 확인',
          ] },
        ],
      },

      {
        id: 'reg-8-edge',
        title: 'Edge Function — 키 보호',
        icon: '🛡️',
        summary: '프로덕션에서는 LLM 키를 절대 클라이언트에 두지 않음. Supabase Edge Function으로 서버 측 호출.',
        content: [
          { subtitle: '왜 Edge Function이 필수인가' },
          { callout: { type: 'warn', text: '클라이언트에 LLM API 키를 두면 DevTools로 봇이 24시간 안에 스캔·도용. 비용 폭증 + 키 폐기 사고의 99%가 이 패턴. 프로덕션은 반드시 서버에서 호출.' } },

          { subtitle: 'Edge Function 생성' },
          { code: { lang: 'bash', content: `# Supabase CLI 설치
npm install -D supabase

# 로그인
npx supabase login

# 프로젝트 연결
npx supabase link --project-ref <your-project-ref>

# 함수 생성
npx supabase functions new ask-llm

# 파일 위치: supabase/functions/ask-llm/index.ts` } },

          { subtitle: '함수 코드' },
          { code: { lang: 'typescript', content: `// supabase/functions/ask-llm/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 인증 확인 (Supabase가 자동 검증)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages } = await req.json();
    const apiKey = Deno.env.get('SOLAR_API_KEY');

    if (!apiKey) {
      throw new Error('SOLAR_API_KEY not set');
    }

    const res = await fetch('https://api.upstage.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'solar-pro',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});` } },

          { subtitle: '배포 + 환경변수' },
          { code: { lang: 'bash', content: `# 환경변수 설정 (Supabase 비밀)
npx supabase secrets set SOLAR_API_KEY=up_xxx

# 배포
npx supabase functions deploy ask-llm

# 함수 호출 URL:
# https://xxxx.supabase.co/functions/v1/ask-llm` } },

          { subtitle: '클라이언트에서 호출' },
          { code: { lang: 'typescript', content: `// SDK 사용 — 인증 자동
const { data, error } = await supabase.functions.invoke('ask-llm', {
  body: { messages },
});

// 또는 직접 fetch
const res = await fetch(
  \`\${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-llm\`,
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${session?.access_token}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  }
);` } },

          { subtitle: '스트리밍 Edge Function' },
          { code: { lang: 'typescript', content: `// 스트리밍 응답 프록시
serve(async (req) => {
  const { messages } = await req.json();
  const apiKey = Deno.env.get('SOLAR_API_KEY')!;

  const upstream = await fetch('https://api.upstage.ai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: \`Bearer \${apiKey}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'solar-pro', messages, stream: true }),
  });

  // 응답 본문을 그대로 클라이언트로 전달
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
});` } },

          { subtitle: '실습' },
          { items: [
            'supabase CLI 셋업 + 프로젝트 연결',
            'ask-llm 함수 작성 + 배포',
            'SOLAR_API_KEY를 secrets로 설정',
            '클라이언트에서 functions.invoke로 호출',
            '브라우저 Network 탭에서 키 노출 없는지 확인',
          ] },
        ],
      },

      {
        id: 'reg-8-practice-1',
        title: '실습 1 · Solar API 첫 호출 + 응답 분석 (30분)',
        icon: '🧪',
        summary: 'API 키 발급부터 첫 호출, 응답 JSON 파싱, 토큰 사용량 측정까지.',
        content: [
          { subtitle: '단계' },
          { items: [
            '1. console.upstage.ai 가입 + API 키 발급',
            '2. .env.local에 VITE_SOLAR_API_KEY 저장',
            '3. src/utils/solar.ts에 chatSolar 함수 작성',
            '4. React 컴포넌트로 첫 호출',
            '5. 응답 JSON 구조 분석 + 토큰 사용량 표시',
          ] },

          { subtitle: 'src/utils/solar.ts' },
          { code: { lang: 'typescript', content: `const API_URL = 'https://api.upstage.ai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_SOLAR_API_KEY;

interface Message { role: 'system' | 'user' | 'assistant'; content: string; }

interface SolarResponse {
  choices: Array<{ message: Message; finish_reason: string }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function chatSolar(messages: Message[]): Promise<{ content: string; usage: any }> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'solar-pro',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${await res.text()}\`);

  const data: SolarResponse = await res.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
  };
}` } },

          { subtitle: 'React 컴포넌트' },
          { code: { lang: 'tsx', content: `function FirstLLMTest() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const { content, usage } = await chatSolar([
        { role: 'system', content: '반드시 한국어로만 답하라.' },
        { role: 'user', content: prompt },
      ]);
      setResponse(content);
      setUsage(usage);
    } catch (err: any) {
      setResponse('오류: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button onClick={send} disabled={loading}>전송</button>
      <pre>{response}</pre>
      {usage && (
        <small>
          입력: {usage.prompt_tokens} / 출력: {usage.completion_tokens} / 총: {usage.total_tokens} 토큰
        </small>
      )}
    </div>
  );
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ API 키 발급 + .env 저장 (마스킹)',
            '☐ 첫 응답 받음',
            '☐ 토큰 사용량 화면 표시',
            '☐ 에러 처리 (네트워크·인증)',
            '☐ 한국어 응답 강제 동작',
          ] },
        ],
      },

      {
        id: 'reg-8-practice-2',
        title: '실습 2 · 다중 턴 대화 + 컨텍스트 유지 (30분)',
        icon: '🧪',
        summary: 'messages 배열에 대화 누적 + 시스템 프롬프트 설계 + 길이 관리.',
        content: [
          { subtitle: '구현' },
          { code: { lang: 'tsx', content: `function ConversationDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: \`
너는 친절한 진로 코치다.
- 한국어로만 답한다.
- 한 번에 1개 질문만 한다.
- 사용자의 답변에서 키워드를 발견해 다음 질문을 만든다.
- 의학·법률 단정 X.
\`.trim() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    const userMsg: Message = { role: 'user', content: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const { content } = await chatSolar(newHistory);
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } finally {
      setLoading(false);
    }
  }

  // 사용자에게 보여줄 메시지 (system 제외)
  const visible = messages.filter(m => m.role !== 'system');

  return (
    <div>
      <div className="messages">
        {visible.map((m, i) => (
          <div key={i} className={m.role}>
            <strong>{m.role === 'user' ? '나' : 'AI'}:</strong> {m.content}
          </div>
        ))}
        {loading && <p>답변 중…</p>}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }}>
        <input value={input} onChange={e => setInput(e.target.value)} disabled={loading} />
        <button>전송</button>
      </form>
    </div>
  );
}` } },

          { subtitle: '검증 — 컨텍스트 유지 테스트' },
          { items: [
            '1턴: "저는 28세입니다"',
            '2턴: "비전공자예요"',
            '3턴: "글쓰기를 좋아해요"',
            '4턴: "제가 몇 살이라고 했죠?"',
            '→ AI가 "28세"를 기억하면 컨텍스트 유지 ✓',
          ] },

          { subtitle: '길이 관리 (선택)' },
          { code: { lang: 'typescript', content: `// 대화가 100턴 넘으면 요약
async function smartChat(messages: Message[]): Promise<string> {
  if (messages.length > 50) {
    const oldMessages = messages.slice(1, -10);  // system 제외, 최근 10개 유지
    const recent = messages.slice(-10);
    const summary = await chatSolar([
      { role: 'system', content: '다음 대화를 3문장으로 요약하라' },
      { role: 'user', content: oldMessages.map(m => \`\${m.role}: \${m.content}\`).join('\\n') },
    ]);
    return chatSolar([
      messages[0],   // 원본 system
      { role: 'system', content: \`[이전 대화 요약] \${summary.content}\` },
      ...recent,
    ]).then(r => r.content);
  }
  return (await chatSolar(messages)).content;
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 시스템 프롬프트로 톤 일관성',
            '☐ 컨텍스트 유지 (이전 정보 기억)',
            '☐ system 메시지 화면에 안 보임',
            '☐ 로딩 중 입력 비활성',
          ] },
        ],
      },

      {
        id: 'reg-8-practice-3',
        title: '실습 3 · 스트리밍 응답 + 챗 UI (40분)',
        icon: '🧪',
        summary: 'SSE 기반 스트리밍 + 토큰 단위 실시간 표시 + 커서 깜빡임 + 자동 스크롤.',
        content: [
          { subtitle: 'streamSolar 함수' },
          { code: { lang: 'typescript', content: `// src/utils/solar.ts에 추가
export async function streamSolar(
  messages: Message[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'solar-pro', messages, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) throw new Error('Stream failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch {
        // 부분 JSON 무시
      }
    }
  }
}` } },

          { subtitle: '챗 UI 컴포넌트' },
          { code: { lang: 'tsx', content: `function StreamingChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: '한국어로만 답하라' },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 자동 스크롤
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    abortRef.current = new AbortController();

    try {
      await streamSolar(
        [...messages, userMsg],
        (chunk) => {
          setMessages(prev => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
            return copy;
          });
        },
        abortRef.current.signal
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    } finally {
      setStreaming(false);
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  const visible = messages.filter(m => m.role !== 'system');

  return (
    <div className="chat-streaming">
      <div ref={listRef} className="messages">
        {visible.map((m, i) => (
          <div key={i} className={\`msg msg-\${m.role}\`}>
            {m.content}
            {streaming && i === visible.length - 1 && m.role === 'assistant' && (
              <span className="cursor">▋</span>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={e => { e.preventDefault(); send(); }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={streaming}
        />
        {streaming ? (
          <button type="button" onClick={cancel}>중단</button>
        ) : (
          <button>전송</button>
        )}
      </form>
    </div>
  );
}` } },

          { subtitle: '커서 깜빡임 CSS' },
          { code: { lang: 'css', content: `.cursor {
  display: inline-block;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 토큰 단위로 점진적 표시',
            '☐ 커서 깜빡임',
            '☐ 자동 스크롤',
            '☐ 중단 버튼 → AbortController',
            '☐ 빠른 입력 시 race condition 없음',
          ] },
        ],
      },

      {
        id: 'reg-8-practice-4',
        title: '실습 4 · 에러 처리 + 재시도 + 폴백 (30분)',
        icon: '🧪',
        summary: '지수 백오프 재시도 + 1순위·2순위·정적 폴백 + 사용자 친화적 메시지.',
        content: [
          { subtitle: '재시도 함수' },
          { code: { lang: 'typescript', content: `async function chatWithRetry(messages: Message[], retries = 3): Promise<string> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      const { content } = await chatSolar(messages);
      return content;
    } catch (err: any) {
      lastError = err;

      // 재시도 무의미한 에러 — 즉시 throw
      if (err.message.includes('401') || err.message.includes('400')) {
        throw err;
      }

      // 429 (rate limit) 또는 5xx만 재시도
      if (err.message.includes('429') || /5\\d\\d/.test(err.message)) {
        const delay = 1000 * Math.pow(2, i);   // 1s → 2s → 4s
        console.warn(\`재시도 \${i + 1}/\${retries} (\${delay}ms 후)\`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}` } },

          { subtitle: '폴백 전략 — 3단 안전망' },
          { code: { lang: 'typescript', content: `async function chatWithFallback(messages: Message[]): Promise<string> {
  // 1순위: Solar (재시도 포함)
  try {
    return await chatWithRetry(messages);
  } catch (err) {
    console.warn('Solar 실패 → HyperCLOVA 폴백', err);
  }

  // 2순위: HyperCLOVA
  try {
    return await chatHyperCLOVA(messages);
  } catch (err) {
    console.warn('HyperCLOVA 실패 → 정적 폴백', err);
  }

  // 최종 폴백 — 정적 응답
  return '죄송합니다. 일시적으로 답변할 수 없습니다. 잠시 후 다시 시도해주세요.';
}` } },

          { subtitle: '사용자 친화적 에러 메시지' },
          { code: { lang: 'typescript', content: `function friendlyError(err: any): string {
  const msg = err.message || '';

  if (msg.includes('NetworkError')) return '인터넷 연결을 확인해주세요.';
  if (msg.includes('401')) return '인증이 만료되었습니다. 다시 로그인해주세요.';
  if (msg.includes('429')) return '요청이 많아 잠시 후 다시 시도해주세요.';
  if (msg.includes('500')) return '서버에 일시적인 문제가 있습니다.';
  if (msg.includes('Timeout')) return '응답이 너무 느립니다. 다시 시도해주세요.';

  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

// 사용
try {
  const reply = await chatWithFallback(messages);
} catch (err) {
  setError(friendlyError(err));
}` } },

          { subtitle: '강제 실패 시뮬레이션 — 검증' },
          { items: [
            '1. .env에서 API 키 일시 변경 → 401 발생 확인',
            '2. 네트워크를 Chrome DevTools에서 Offline → NetworkError',
            '3. 빠른 연속 호출 (10회) → 429 발생 + 재시도 동작 확인',
            '4. 의도적으로 5xx 시뮬레이션 — fetch mock으로',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 재시도 함수 동작 (콘솔에 재시도 N회 로그)',
            '☐ 폴백 함수 동작 (1순위 실패 시 2순위)',
            '☐ 사용자 친화적 메시지 표시',
            '☐ 모든 에러를 try-catch로 잡음',
            '☐ 401 등은 재시도 안 함',
          ] },
        ],
      },

      {
        id: 'reg-8-practice-5',
        title: '실습 5 · 캐싱 + 비용 로깅 (25분)',
        icon: '🧪',
        summary: 'FAQ 캐싱으로 비용 50%↓ + 토큰 사용량 일일 모니터링.',
        content: [
          { subtitle: '메모리 캐싱' },
          { code: { lang: 'typescript', content: `// 단순 메모리 캐시 (개발용)
const cache = new Map<string, { content: string; ts: number }>();
const TTL = 1000 * 60 * 60 * 24;   // 24시간

function cacheKey(messages: Message[]): string {
  // user 메시지만 키로 (system 변화 영향 X)
  return messages.filter(m => m.role === 'user').map(m => m.content).join('|');
}

export async function cachedChat(messages: Message[]): Promise<string> {
  const key = cacheKey(messages);
  const hit = cache.get(key);

  if (hit && Date.now() - hit.ts < TTL) {
    console.log('cache hit');
    return hit.content;
  }

  const content = await chatWithFallback(messages);
  cache.set(key, { content, ts: Date.now() });
  return content;
}` } },

          { subtitle: 'Supabase 기반 영구 캐싱' },
          { code: { lang: 'sql', content: `create table llm_cache (
  cache_key   text primary key,
  content     text not null,
  hit_count   int default 1,
  created_at  timestamptz default now(),
  expires_at  timestamptz default (now() + interval '1 day')
);

create index llm_cache_expires_idx on llm_cache (expires_at);

-- 만료된 캐시 정리 (cron 또는 트리거)
create or replace function clean_expired_cache()
returns void as $$
begin
  delete from llm_cache where expires_at < now();
end;
$$ language plpgsql;` } },
          { code: { lang: 'typescript', content: `export async function cachedChatDB(messages: Message[]): Promise<string> {
  const key = cacheKey(messages);

  // 1) 캐시 조회
  const { data } = await supabase
    .from('llm_cache')
    .select('content')
    .eq('cache_key', key)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (data) {
    // hit_count++
    await supabase.rpc('increment_cache_hit', { p_key: key });
    return data.content;
  }

  // 2) 캐시 미스 → API 호출
  const content = await chatWithFallback(messages);

  // 3) 캐시에 저장
  await supabase.from('llm_cache').upsert({ cache_key: key, content });

  return content;
}` } },

          { subtitle: '비용 로깅' },
          { code: { lang: 'sql', content: `create table llm_usage_logs (
  id              bigserial primary key,
  user_id         uuid references auth.users(id),
  model           text not null,
  prompt_tokens   int not null,
  completion_tokens int not null,
  cost_krw        numeric(10, 2),
  created_at      timestamptz default now()
);

create index llm_usage_user_date_idx on llm_usage_logs (user_id, created_at);` } },
          { code: { lang: 'typescript', content: `const PRICING = {
  'solar-pro': { input: 0.65, output: 1.95 },   // 1000 토큰당 원
};

async function chatWithLogging(messages: Message[], userId: string) {
  const { content, usage } = await chatSolar(messages);

  const cost =
    (usage.prompt_tokens * PRICING['solar-pro'].input +
     usage.completion_tokens * PRICING['solar-pro'].output) / 1000;

  await supabase.from('llm_usage_logs').insert({
    user_id: userId,
    model: 'solar-pro',
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    cost_krw: cost,
  });

  return content;
}

// 일일 사용량 조회
async function getTodayCost(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('llm_usage_logs')
    .select('cost_krw')
    .gte('created_at', today);

  return data?.reduce((sum, r) => sum + Number(r.cost_krw), 0) ?? 0;
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 동일 질문 2회 → 두 번째는 캐시 hit',
            '☐ 캐시 hit 시 비용 0',
            '☐ 일일 사용량 조회 가능',
            '☐ 사용자별 비용 추적',
            '☐ 만료된 캐시 자동 정리',
          ] },
        ],
      },

      {
        id: 'reg-8-resources',
        title: '심화 + 자가 평가',
        icon: '📚',
        summary: 'LLM API 학습 심화 자료 + Day 8 자가 평가 + 다음 단계.',
        content: [
          { subtitle: '심화 자료' },
          { items: [
            'OpenAI API 문서 (표준): platform.openai.com/docs',
            'Anthropic API: docs.anthropic.com',
            'Solar 문서: developers.upstage.ai',
            'Vercel AI SDK: sdk.vercel.ai — 스트리밍 추상화',
            'LangChain 한국어: js.langchain.com (도구 사용·체인)',
          ] },

          { subtitle: '심화 주제' },
          { items: [
            'RAG (Retrieval-Augmented Generation) — 외부 지식 결합',
            'Function Calling — LLM이 함수 호출하게',
            'Vector DB (pgvector) — 임베딩 검색',
            'Agent — 다단계 도구 사용 자동화',
            'Prompt Caching — 동일 prefix 캐싱으로 비용 50%↓',
          ] },

          { subtitle: 'Day 8 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['REST API', '없음', 'fetch 호출', '메서드·상태 코드 자유'],
              ['messages 배열', '단일 질문', '대화 컨텍스트', '시스템 프롬프트 + 길이 관리'],
              ['스트리밍', '없음', '기본 동작', '취소 + 커서 + 자동 스크롤'],
              ['에러 처리', '없음', 'try-catch', '재시도 + 폴백 + 모니터링'],
              ['보안', '키 노출', '환경변수', 'Edge Function + secrets'],
            ],
          } },
        ],
      },
    ],
  },

  {
    id: 'reg-9',
    title: 'Day 11 · 프로젝트 프론트엔드 개발',
    icon: '🎨',
    description: '디자인 토큰 · 컴포넌트 분리 · 로딩/에러/빈 상태 UI · 모바일 우선 반응형 — 실전 프론트엔드 품질을 결정하는 핵심 패턴을 한꺼번에 적용합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', '디자인 토큰(CSS 변수) + 다크모드 대응', '토큰 시스템 구축'],
          ['S2', '50분', 'Atomic Design — Atom/Molecule/Organism', '재사용 컴포넌트 5개'],
          ['S3', '50분', '4가지 상태 UI (로딩·에러·빈·성공)', '데이터 의존 페이지 1개'],
          ['S4', '50분', '모바일 퍼스트 반응형 + 터치 타깃', '모바일/태블릿/PC 검증'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        '디자인 시스템 토큰(색·간격·타이포)을 CSS 변수로 정의한다',
        'Atomic Design 원칙으로 컴포넌트를 단계별로 분리한다',
        '로딩·에러·빈·성공 4가지 상태 UI를 모두 구현한다',
        '모바일 퍼스트로 반응형을 작성한다',
      ] },

      { subtitle: '디자인 토큰 — CSS 변수' },
      { text: '"마법의 숫자"를 모두 변수로 추출하면 (1) 일관성, (2) 다크모드 대응, (3) 테마 변경의 3가지 이득을 얻습니다.' },
      { code: { lang: 'css', content: `/* src/styles/tokens.css */
:root {
  /* Color */
  --primary-blue:       #0046C8;
  --primary-blue-light: #4A8FE7;
  --bg-primary:         #ffffff;
  --bg-secondary:       #f8f9fa;
  --text-primary:       #1a1a1a;
  --text-secondary:     #6b7280;
  --border-color:       #e5e7eb;

  /* Spacing — 4px 그리드 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Typography */
  --font-sm:   13px;
  --font-base: 15px;
  --font-lg:   18px;
  --font-xl:   22px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

[data-theme="dark"] {
  --bg-primary:     #1a1a1a;
  --bg-secondary:   #2a2a2a;
  --text-primary:   #f0f0f0;
  --text-secondary: #b0b0b0;
  --border-color:   #3a3a3a;
}` } },

      { subtitle: 'Atomic Design — 컴포넌트 분리 단계' },
      { table: {
        headers: ['단계', '예', '재사용성'],
        rows: [
          ['Atom (원자)', 'Button, Input, Badge', '매우 높음'],
          ['Molecule (분자)', 'SearchBar (Input+Button)', '높음'],
          ['Organism (유기체)', 'NavBar, Footer, Card', '중간'],
          ['Template (템플릿)', 'PublicLayout', '낮음'],
          ['Page (페이지)', 'Home, About', '없음'],
        ],
      } },

      { subtitle: '4가지 상태 UI 패턴' },
      { code: { lang: 'tsx', content: `export default function UserList() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => { /* fetch... */ }, []);

  // 1) 로딩 상태
  if (loading) return <Spinner />;

  // 2) 에러 상태
  if (error) return (
    <div className="error-card">
      <p>오류: {error}</p>
      <button onClick={retry}>다시 시도</button>
    </div>
  );

  // 3) 빈 상태
  if (users.length === 0) return (
    <div className="empty-card">
      <p>아직 등록된 사용자가 없습니다.</p>
      <button onClick={() => navigate('/register')}>가입하기</button>
    </div>
  );

  // 4) 성공 상태
  return (
    <ul>
      {users.map(u => <UserCard key={u.id} user={u} />)}
    </ul>
  );
}` } },
      { callout: { type: 'warn', text: '"로딩/에러 처리 없이 성공만 가정"은 가장 흔한 실수입니다. 모든 비동기 작업에 4가지 상태를 항상 고려하세요. 빈 상태도 진정한 UX의 일부입니다.' } },

      { subtitle: '모바일 퍼스트 반응형' },
      { code: { lang: 'css', content: `/* 기본 = 모바일 */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

/* 태블릿 ↑ */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* 데스크탑 ↑ */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}` } },

      { subtitle: '터치 타깃 — 최소 44×44px' },
      { text: 'Apple HIG·Google Material 모두 최소 44px(또는 48dp)을 권고. 작으면 모바일 사용자가 정확히 누르지 못합니다.' },
      { code: { lang: 'css', content: `.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 0 var(--space-4);
  font-size: var(--font-base);
}` } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "디자인 시스템을 처음부터 직접 만들어야 하나요?" — 시간 부족하면 shadcn/ui, Radix UI 등 기성품 활용. 본 과정은 학습 목적이라 직접.',
        'Q. "Atomic Design을 엄격히 지켜야 하나요?" — 가이드일 뿐. 작은 프로젝트는 components/ 하위에 단순 분류로도 충분.',
        'Q. "디자인 시안이 없어요" — Figma Community 무료 템플릿 활용. AI에게 "Stripe 스타일 랜딩 페이지 컴포넌트 구조"도 물어보기.',
        'Q. "로딩 스피너 vs 스켈레톤 UI?" — 즉시 끝나는 작업은 스피너, 카드형 데이터는 스켈레톤이 체감 빠름.',
        'Q. "다크모드 색 어떻게 정하나요?" — 명도만 반전하면 어색. 채도도 약간 낮추기. Tailwind dark mode 색 참고 추천.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. CSS 변수의 장점 1가지를 답하시오.',
        '2. Atomic Design 5단계의 두 번째는?',
        '3. 비동기 컴포넌트의 4가지 상태는?',
        '4. 모바일 퍼스트의 미디어 쿼리는 max-width vs min-width 중 어느 것?',
        '5. 터치 타깃 최소 권장 크기는?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) 일관성·다크모드·테마 변경 용이 (이 중 하나)  2) Molecule  3) 로딩·에러·빈·성공  4) min-width  5) 44×44px (Apple HIG) 또는 48dp (Material)' } },

      { subtitle: '참고 자료' },
      { items: [
        'Atomic Design 원전: bradfrost.com/blog/post/atomic-web-design',
        'Tailwind CSS: tailwindcss.com (디자인 토큰 표준 참고)',
        'shadcn/ui: ui.shadcn.com (복붙형 컴포넌트)',
        'Apple HIG: developer.apple.com/design/human-interface-guidelines',
        'Material Design: m3.material.io',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        '팀 프로젝트 색·간격·타이포를 CSS 변수로 추출 + 다크모드 대응',
        '핵심 페이지 1개를 Atom→Molecule→Organism 순으로 재구성',
        '비동기 데이터를 가진 컴포넌트에 4가지 상태 UI 모두 구현',
        '모바일/태블릿/데스크탑 3종에서 정상 동작 확인 (DevTools 리사이즈)',
        '터치 타깃 44px 이상 확보 + 실제 모바일에서 손가락 클릭 테스트',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 10에서는 오늘 만든 프론트엔드를 Day 6의 Supabase 백엔드와 연결합니다. Realtime·파일 업로드까지 풀세트 통합.' },
    ],
    subSections: [
      {
        id: 'reg-9-tokens',
        title: '디자인 토큰 — 변수로 시스템화',
        icon: '🎨',
        summary: 'CSS 변수 기반 디자인 시스템 — 색·타이포·간격·반경·그림자를 토큰화해서 일관성·다크모드·테마 전환을 동시 해결.',
        content: [
          { subtitle: '디자인 토큰이란?' },
          { text: '디자인 결정(색·간격 등)을 이름 있는 변수로 추상화한 것. "파란색"이 아닌 "primary"로 부르면 다크모드·브랜드 변경 시 한 곳만 수정하면 됩니다.' },

          { subtitle: '토큰 카테고리 6종' },
          { table: {
            headers: ['카테고리', '용도', '예시'],
            rows: [
              ['Color', '브랜드·텍스트·배경', '--primary, --text-primary'],
              ['Typography', '폰트·크기·줄간격', '--font-base, --font-lg'],
              ['Spacing', '패딩·마진·간격', '--space-2 (8px), --space-4 (16px)'],
              ['Radius', '둥근 모서리', '--radius-sm, --radius-md'],
              ['Shadow', '그림자', '--shadow-sm, --shadow-lg'],
              ['Z-index', '레이어 순서', '--z-modal (1000), --z-toast (2000)'],
            ],
          } },

          { subtitle: '실전 디자인 토큰 시스템' },
          { code: { lang: 'css', content: `/* src/styles/tokens.css */

:root {
  /* ─── Color ─── */
  --primary-blue:       #0046C8;
  --primary-blue-dark:  #002E8A;
  --primary-blue-light: #4A8FE7;

  --bg-primary:   #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-card:      #ffffff;

  --text-primary:   #1a1a1a;
  --text-secondary: #6b7280;
  --text-muted:     #9ca3af;
  --text-inverse:   #ffffff;

  --border-color:  #e5e7eb;
  --line:          #f0f0f0;

  --success: #10b981;
  --warning: #f59e0b;
  --danger:  #ef4444;
  --info:    #3b82f6;

  /* ─── Typography ─── */
  --font-family: 'Pretendard', -apple-system, sans-serif;

  --font-xs:   11px;
  --font-sm:   13px;
  --font-base: 15px;
  --font-md:   17px;
  --font-lg:   20px;
  --font-xl:   24px;
  --font-2xl:  32px;

  --line-tight:   1.3;
  --line-normal:  1.6;
  --line-relaxed: 1.9;

  --font-regular: 400;
  --font-medium:  500;
  --font-semibold: 600;
  --font-bold:    700;

  /* ─── Spacing (4px 그리드) ─── */
  --space-0:  0;
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* ─── Radius ─── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* ─── Shadow ─── */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* ─── Z-index ─── */
  --z-base:    0;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-modal:    1000;
  --z-toast:    2000;

  /* ─── 레이아웃 ─── */
  --container-max: 1280px;
  --nav-height:    72px;

  /* ─── Animation ─── */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   400ms ease;
}

/* ─── 다크모드 오버라이드 ─── */
[data-theme="dark"] {
  --bg-primary:   #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-card:      #2a2a2a;

  --text-primary:   #f0f0f0;
  --text-secondary: #b0b0b0;
  --text-muted:     #6b7280;

  --border-color: #3a3a3a;
  --line:         #353535;

  --primary-blue-light: #6BA3F0;   /* 다크에서 약간 밝게 */

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}` } },

          { subtitle: '컴포넌트에서 토큰 사용' },
          { code: { lang: 'css', content: `.btn {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  background: var(--primary-blue);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: background var(--transition-fast);
}

.btn:hover {
  background: var(--primary-blue-dark);
  box-shadow: var(--shadow-md);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.input {
  padding: var(--space-3);
  font-size: var(--font-base);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
}` } },

          { subtitle: '토큰의 가치 — 변경 시 비교' },
          { table: {
            headers: ['시나리오', '하드코딩', '토큰'],
            rows: [
              ['브랜드 색 변경', '50+ 파일 수정', '1줄 수정'],
              ['다크모드 추가', '전 컴포넌트 재작성', 'data-theme 추가'],
              ['간격 통일', '눈으로 px 추적', 'space-N 사용'],
              ['디자인 시스템 문서화', '불가능', '토큰 목록 = 문서'],
            ],
          } },

          { subtitle: '실습' },
          { items: [
            '6개 카테고리 토큰 시스템 작성',
            '본인 프로젝트의 모든 색·간격을 토큰으로 교체',
            '다크모드 토큰 오버라이드 + 토글 동작',
            'Tailwind 같은 유틸리티 클래스 흉내 (.text-lg, .p-4)',
          ] },
        ],
      },

      {
        id: 'reg-9-atomic',
        title: 'Atomic Design — 컴포넌트 분할',
        icon: '🧩',
        summary: '5단계 컴포넌트 분할로 재사용·테스트·유지보수를 동시에. 실전에서의 단순화 가이드.',
        content: [
          { subtitle: 'Atomic Design 5단계' },
          { table: {
            headers: ['단계', '비유', '예', '재사용성'],
            rows: [
              ['Atom (원자)', '레고 1블록', 'Button, Input, Badge', '★★★★★'],
              ['Molecule (분자)', '블록 조합', 'SearchBar (Input+Button)', '★★★★'],
              ['Organism (유기체)', '독립 영역', 'NavBar, Footer, Card', '★★★'],
              ['Template (템플릿)', '페이지 골격', 'PublicLayout', '★★'],
              ['Page (페이지)', '완성 페이지', 'Home, About', '★'],
            ],
          } },

          { subtitle: '실전 단순화 — 본 강의 권장' },
          { text: 'Atomic Design은 가이드일 뿐. 본 4주 프로젝트는 atoms·molecules·pages 3단계로 충분합니다.' },
          { code: { lang: 'text', content: `src/
├── components/
│   ├── ui/              # atoms + molecules
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   └── SearchBar.tsx
│   ├── layout/          # organisms
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PublicLayout.tsx
│   └── feature/         # 기능별 그룹
│       ├── chat/
│       │   ├── ChatMessage.tsx
│       │   ├── ChatInput.tsx
│       │   └── ChatWindow.tsx
│       └── auth/
│           ├── LoginForm.tsx
│           └── SignupForm.tsx
└── pages/               # pages
    ├── Home.tsx
    ├── Chat.tsx
    └── Login.tsx` } },

          { subtitle: 'Atom 예시 — Button' },
          { code: { lang: 'tsx', content: `// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    \`btn-\${variant}\`,
    \`btn-\${size}\`,
    isLoading && 'btn-loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button {...rest} disabled={disabled || isLoading} className={classes}>
      {isLoading ? (
        <span className="spinner" />
      ) : (
        <>
          {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

// 사용
<Button>기본</Button>
<Button variant="secondary" size="lg">크게</Button>
<Button isLoading>저장 중</Button>
<Button leftIcon="📧" variant="primary">이메일 보내기</Button>` } },

          { subtitle: 'Molecule 예시 — SearchBar' },
          { code: { lang: 'tsx', content: `// src/components/ui/SearchBar.tsx
import Input from './Input';
import Button from './Button';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, onSubmit, placeholder }: SearchBarProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="search-bar">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? '검색...'}
      />
      <Button type="submit">검색</Button>
    </form>
  );
}` } },

          { subtitle: 'Organism 예시 — NavBar' },
          { code: { lang: 'tsx', content: `// src/components/layout/Navbar.tsx
import { Link, NavLink } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">DreamIT</Link>

      <ul className="nav-menu">
        <li><NavLink to="/about">소개</NavLink></li>
        <li><NavLink to="/chat">진단</NavLink></li>
      </ul>

      <div className="nav-actions">
        {user ? (
          <>
            <span>{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>로그아웃</Button>
          </>
        ) : (
          <Link to="/login"><Button size="sm">로그인</Button></Link>
        )}
      </div>
    </nav>
  );
}` } },

          { subtitle: '컴포넌트 props 설계 원칙' },
          { items: [
            '필수 vs 선택적 명확히 (TypeScript optional ?)',
            '기본값을 합리적으로 (variant = "primary")',
            'children을 잘 활용 (Composition over Configuration)',
            'render prop·polymorphic 등은 필요할 때만',
            '5개 이상 prop이면 그룹화 검토 (variant + size 같이)',
            'aria-* 속성은 ...rest로 통과',
          ] },

          { subtitle: '실습' },
          { items: [
            'ui/ 폴더에 Button·Input·Badge·Card 4개 작성',
            'feature/chat/ 폴더에 ChatMessage·ChatInput·ChatWindow',
            'layout/Navbar 작성 + Outlet과 결합',
            'pages/Chat.tsx는 위 컴포넌트 조립만',
          ] },
        ],
      },

      {
        id: 'reg-9-states',
        title: '4가지 상태 UI — 완성도의 핵심',
        icon: '🔄',
        summary: '로딩·에러·빈·성공 4가지 상태를 모두 디자인. 사용자가 신뢰할 수 있는 UX의 기본.',
        content: [
          { subtitle: '왜 4가지 상태가 필수인가' },
          { text: '"성공만 가정한 UI"는 가장 흔한 실수. 네트워크 끊김·데이터 0건·로딩 중에 사용자가 빈 화면이나 깨진 화면을 보면 신뢰 상실.' },

          { subtitle: '4가지 상태 시각화' },
          { code: { lang: 'tsx', content: `function UserList() {
  const { data: users, loading, error } = useFetch<User[]>('/api/users');

  // 1) 로딩
  if (loading) return <LoadingSkeleton />;

  // 2) 에러
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  // 3) 빈
  if (!users || users.length === 0) return <EmptyView />;

  // 4) 성공
  return <UserListView users={users} />;
}` } },

          { subtitle: '로딩 상태 — Spinner vs Skeleton' },
          { code: { lang: 'tsx', content: `// Spinner — 짧은 작업 (500ms 미만)
function Spinner() {
  return <div className="spinner" />;
}

// Skeleton — 카드형 데이터 (1~3초)
function UserCardSkeleton() {
  return (
    <div className="card skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-line w-3/4" />
      <div className="skeleton-line w-1/2" />
    </div>
  );
}

// 여러 개 — 실제 카드 수와 비슷하게
function ListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => <UserCardSkeleton key={i} />)}
    </>
  );
}` } },
          { code: { lang: 'css', content: `/* 스켈레톤 애니메이션 */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--border-color) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-line {
  height: 14px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.skeleton-line.w-3\\/4 { width: 75%; }
.skeleton-line.w-1\\/2 { width: 50%; }` } },

          { subtitle: '에러 상태' },
          { code: { lang: 'tsx', content: `function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-view">
      <div className="error-icon">⚠️</div>
      <h3>문제가 발생했습니다</h3>
      <p className="error-detail">{message}</p>
      {onRetry && (
        <Button onClick={onRetry}>다시 시도</Button>
      )}
    </div>
  );
}

// 사용자 친화적 메시지 매핑
function friendlyMessage(err: any): string {
  if (err.message.includes('NetworkError')) return '인터넷 연결을 확인해주세요.';
  if (err.message.includes('401')) return '로그인이 필요합니다.';
  if (err.message.includes('500')) return '서버에 일시적인 문제가 있습니다.';
  return '알 수 없는 오류가 발생했습니다.';
}` } },

          { subtitle: '빈 상태 — Empty State' },
          { code: { lang: 'tsx', content: `function EmptyView({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="empty-view">
      <div className="empty-illust">📭</div>
      <h3>아직 등록된 항목이 없습니다</h3>
      <p>첫 번째 항목을 추가해보세요.</p>
      {onCreate && (
        <Button onClick={onCreate}>새로 만들기</Button>
      )}
    </div>
  );
}

// 검색 결과 0건 (다른 디자인)
function NoResults({ keyword }: { keyword: string }) {
  return (
    <div className="empty-view">
      <h3>"{keyword}"에 대한 결과가 없습니다</h3>
      <p>다른 검색어로 시도해보세요.</p>
    </div>
  );
}` } },

          { subtitle: '상태 UI 공통 컴포넌트 — DataView' },
          { code: { lang: 'tsx', content: `// 4가지 상태를 한 컴포넌트로 관리
interface DataViewProps<T> {
  loading: boolean;
  error: string | null;
  data: T[] | null;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  onRetry?: () => void;
  children: (data: T[]) => ReactNode;
}

export default function DataView<T>({
  loading, error, data,
  loadingComponent, errorComponent, emptyComponent,
  onRetry, children,
}: DataViewProps<T>) {
  if (loading) return <>{loadingComponent || <Spinner />}</>;
  if (error) return <>{errorComponent || <ErrorView message={error} onRetry={onRetry} />}</>;
  if (!data || data.length === 0) return <>{emptyComponent || <EmptyView />}</>;
  return <>{children(data)}</>;
}

// 사용
<DataView
  loading={loading}
  error={error}
  data={users}
  onRetry={refetch}
>
  {(users) => (
    <ul>{users.map(u => <UserCard key={u.id} user={u} />)}</ul>
  )}
</DataView>` } },

          { subtitle: '실습' },
          { items: [
            '로딩 Spinner + Skeleton 2종',
            '에러 메시지 매핑 함수 + Retry 버튼',
            '빈 상태 컴포넌트',
            'DataView 제네릭 컴포넌트로 추출',
            '의도적으로 네트워크 끊고 에러 상태 확인',
          ] },
        ],
      },

      {
        id: 'reg-9-responsive',
        title: '모바일 퍼스트 + 터치 UI',
        icon: '📱',
        summary: '한국 트래픽 70%가 모바일. 모바일 퍼스트 워크플로우, 터치 타깃, 햄버거 메뉴 등 모바일 특화 UX.',
        content: [
          { subtitle: '모바일 퍼스트 5원칙' },
          { items: [
            '모바일 디자인 먼저 → 큰 화면으로 확장',
            '터치 타깃 44px 이상',
            '폰트 16px 이상 (모바일 자동 줌 방지)',
            '한 화면에 1개 주 액션',
            '단순한 네비게이션 (햄버거 또는 하단 탭)',
          ] },

          { subtitle: '브레이크포인트 표준' },
          { code: { lang: 'css', content: `/* 모바일 퍼스트 — 기본은 모바일 */
.container {
  padding: var(--space-4);
}

/* 태블릿 (640px+) */
@media (min-width: 640px) {
  .container { padding: var(--space-6); }
}

/* 노트북 (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
    max-width: var(--container-max);
    margin: 0 auto;
  }
}

/* 데스크탑 (1280px+) */
@media (min-width: 1280px) {
  /* 큰 화면 특화 스타일 */
}` } },

          { subtitle: '반응형 네비게이션' },
          { code: { lang: 'tsx', content: `function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/">로고</Link>

      {/* 모바일 햄버거 */}
      <button
        className="hamburger"
        aria-label="메뉴 토글"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* 메뉴 */}
      <ul className={\`nav-menu \${isOpen ? 'open' : ''}\`}>
        <li><NavLink to="/about">소개</NavLink></li>
        <li><NavLink to="/chat">진단</NavLink></li>
      </ul>
    </nav>
  );
}` } },
          { code: { lang: 'css', content: `/* 모바일 — 햄버거 보이고 메뉴 숨김 */
.hamburger { display: block; }
.nav-menu {
  display: none;
  position: absolute;
  top: var(--nav-height);
  left: 0;
  right: 0;
  background: var(--bg-card);
  padding: var(--space-4);
  flex-direction: column;
}
.nav-menu.open { display: flex; }

/* 데스크탑 — 햄버거 숨김, 메뉴 가로 */
@media (min-width: 1024px) {
  .hamburger { display: none; }
  .nav-menu {
    display: flex !important;
    position: static;
    flex-direction: row;
    background: transparent;
    padding: 0;
  }
}` } },

          { subtitle: '터치 타깃 표준' },
          { items: [
            'Apple HIG: 44×44 pt',
            'Material: 48×48 dp',
            '실전 권장: 최소 44px, 인접 요소 간격 8px',
            '폼 입력은 56px 이상 추천 (한 손 엄지)',
            '에러: 화면 하단 토스트, 헤더 위 알림 X',
          ] },
          { code: { lang: 'css', content: `.btn, .input, a.menu-item {
  min-height: 44px;
  min-width: 44px;
}

/* 인접 버튼 간격 */
.btn + .btn { margin-left: var(--space-2); }

/* 모바일 입력은 더 크게 */
@media (max-width: 767px) {
  .input { min-height: 56px; font-size: 16px; }
}` } },

          { subtitle: '모바일 특화 패턴' },
          { items: [
            '바텀 시트 (Bottom Sheet) — 모달 대신',
            '풀-투-리프레시 — 당겨서 새로고침',
            '스와이프 액션 — 좌우 스와이프로 삭제·아카이브',
            '하단 탭 네비게이션 — 햄버거 대신',
            'Safe Area Inset — 노치 대응',
          ] },
          { code: { lang: 'css', content: `/* iPhone 노치 대응 */
.app-bottom {
  padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
}

/* 입력창 키보드 대응 */
.fixed-input {
  position: sticky;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
}` } },

          { subtitle: '실습' },
          { items: [
            '햄버거 메뉴 — 모바일에서만, 데스크탑은 가로',
            '모든 인터랙티브 요소 44px 이상',
            'Safe Area Inset 적용 (노치 대응)',
            'Chrome DevTools 5개 기기에서 검증',
            '실제 모바일에서 손가락으로 테스트',
          ] },
        ],
      },

      {
        id: 'reg-9-practice',
        title: '실습 · 챗봇 UI 완성 (3시간)',
        icon: '🧪',
        summary: '디자인 토큰·Atomic·4가지 상태·모바일 퍼스트를 모두 결합한 챗봇 UI 본격 구현.',
        content: [
          { subtitle: '프로젝트 목표' },
          { text: 'Day 7~8에서 설계·구현한 LLM 챗봇의 UI 완성도를 끌어올립니다. 모바일에서도 매끄럽게 동작하고, 4가지 상태가 모두 처리되며, 디자인 토큰으로 일관성 유지.' },

          { subtitle: '컴포넌트 분할' },
          { code: { lang: 'text', content: `pages/Chat.tsx
└── ChatWindow (organism)
    ├── ChatHeader (molecule)
    │   ├── BackButton (atom)
    │   ├── Title (atom)
    │   └── EndButton (atom)
    ├── MessageList (organism)
    │   └── ChatMessage (molecule)
    │       ├── Avatar (atom)
    │       └── Bubble (atom)
    └── ChatInput (molecule)
        ├── Textarea (atom)
        └── SendButton (atom)` } },

          { subtitle: '핵심 코드 — ChatWindow' },
          { code: { lang: 'tsx', content: `// pages/Chat.tsx
import { useState, useRef, useEffect } from 'react';
import ChatHeader from '@/components/feature/chat/ChatHeader';
import MessageList from '@/components/feature/chat/MessageList';
import ChatInput from '@/components/feature/chat/ChatInput';
import { streamSolar } from '@/utils/solar';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: '너는 친절한 진로 코치다. 한국어로만 답하라.' },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    setError(null);
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      await streamSolar(
        [...messages, userMsg],
        (chunk) => {
          setMessages(prev => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
            return copy;
          });
        }
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStreaming(false);
    }
  }

  // 사용자에게 보여줄 메시지만 필터 (system 제외)
  const visibleMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="chat-window">
      <ChatHeader title="진로 진단" />

      <div ref={listRef} className="message-list-container">
        {visibleMessages.length === 0 ? (
          <EmptyView message="대화를 시작하려면 입력하세요" />
        ) : (
          <MessageList messages={visibleMessages} streaming={streaming} />
        )}
      </div>

      {error && (
        <ErrorBanner message={error} onClose={() => setError(null)} />
      )}

      <ChatInput onSend={send} disabled={streaming} />
    </div>
  );
}` } },

          { subtitle: 'ChatMessage — 사용자/AI 차별' },
          { code: { lang: 'tsx', content: `interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <div className={\`message message-\${role}\`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="message-bubble">
        <p>{content}{isStreaming && '▋'}</p>
      </div>
    </div>
  );
}` } },

          { subtitle: '챗봇 CSS' },
          { code: { lang: 'css', content: `.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;   /* 모바일 주소창 대응 */
}

.message-list-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.message {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.message-user {
  flex-direction: row-reverse;
}

.message-bubble {
  max-width: 75%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
}

.message-user .message-bubble {
  background: var(--primary-blue);
  color: var(--text-inverse);
  border-bottom-right-radius: var(--radius-sm);
}

.message-assistant .message-bubble {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom-left-radius: var(--radius-sm);
}

.chat-input-form {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
  padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 디자인 토큰 100% 사용 (하드코딩 0개)',
            '☐ Atom·Molecule·Organism 명확히 분리',
            '☐ 4가지 상태 모두 처리 (특히 빈 상태)',
            '☐ 모바일에서 매끄러운 스크롤·입력',
            '☐ 다크모드 토글 동작',
            '☐ Lighthouse 모바일 90+',
          ] },
        ],
      },

      {
        id: 'reg-9-practice-2',
        title: '실습 2 · 디자인 토큰 시스템 구축 (30분)',
        icon: '🧪',
        summary: '6개 카테고리(색·타이포·간격·반경·그림자·z-index) 토큰을 CSS 변수로 정의 + 다크모드 오버라이드.',
        content: [
          { subtitle: '본인 프로젝트의 src/styles/tokens.css 작성' },
          { code: { lang: 'css', content: `/* 본 강의 실습 12 (Day 9-1) 참고하여 본인 프로젝트에 적용 */
:root {
  /* Color (10개 이상) */
  --primary, --primary-hover, --primary-light, ...

  /* Typography (5개 이상) */
  --font-family, --font-sm, --font-base, --font-lg, ...

  /* Spacing (8개) — 4px 그리드 */
  --space-1: 4px; --space-2: 8px; ... --space-12: 48px;

  /* Radius (5개) */
  --radius-sm, --radius-md, --radius-lg, --radius-full

  /* Shadow (4개) */
  --shadow-sm, --shadow-md, --shadow-lg

  /* Z-index (5개) */
  --z-dropdown, --z-modal, --z-toast
}

[data-theme="dark"] {
  /* Color 오버라이드 */
}` } },

          { subtitle: '검증' },
          { items: [
            '본인 프로젝트의 모든 CSS 파일 검사',
            'hex 색상 코드 검색 → 0개여야 함',
            'px 매직 넘버 → space 변수로 치환',
            '다크모드 토글 시 모든 색 자동 변경',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 6개 카테고리 모두 토큰 정의',
            '☐ 하드코딩 0개 (var 100%)',
            '☐ 다크모드 오버라이드 동작',
            '☐ Tailwind 같은 유틸리티 만들기 (선택)',
          ] },
        ],
      },

      {
        id: 'reg-9-practice-3',
        title: '실습 3 · 컴포넌트 분할 — Atomic Design (35분)',
        icon: '🧪',
        summary: 'ui/molecules/feature 3계층으로 컴포넌트 재구성. Button·Card·SearchBar 등 핵심 atom 7개.',
        content: [
          { subtitle: '폴더 구조 재정의' },
          { code: { lang: 'text', content: `src/
├── components/
│   ├── ui/                # Atom + Molecule
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Spinner.tsx
│   │   ├── Avatar.tsx
│   │   ├── SearchBar.tsx
│   │   └── index.ts       # barrel export
│   ├── layout/            # Organism
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PublicLayout.tsx
│   └── feature/           # 기능별
│       ├── chat/
│       └── auth/
└── pages/                 # Page` } },

          { subtitle: 'Button.tsx — Atom 표준' },
          { code: { lang: 'tsx', content: `import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={\`btn btn-\${variant} btn-\${size} \${className}\`}
    >
      {isLoading ? '...' : <>{leftIcon}{children}</>}
    </button>
  );
}` } },

          { subtitle: 'SearchBar.tsx — Molecule' },
          { code: { lang: 'tsx', content: `import Input from './Input';
import Button from './Button';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export default function SearchBar({ value, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
      <Input value={value} onChange={onChange} placeholder="검색..." />
      <Button type="submit">검색</Button>
    </form>
  );
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 7개 이상 Atom 작성',
            '☐ 2개 이상 Molecule (SearchBar 등)',
            '☐ Pages는 컴포넌트 조립만',
            '☐ Props 인터페이스 명확',
            '☐ index.ts barrel export',
          ] },
        ],
      },

      {
        id: 'reg-9-practice-4',
        title: '실습 4 · 4가지 상태 UI + DataView 추상화 (30분)',
        icon: '🧪',
        summary: '로딩·에러·빈·성공 4상태를 모든 비동기 컴포넌트에 일관 적용 + 제네릭 DataView 추상화.',
        content: [
          { subtitle: 'DataView 제네릭 컴포넌트' },
          { code: { lang: 'tsx', content: `// src/components/ui/DataView.tsx
interface Props<T> {
  loading: boolean;
  error: string | null;
  data: T[] | null;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  children: (data: T[]) => ReactNode;
}

export default function DataView<T>({
  loading, error, data, onRetry,
  loadingComponent, errorComponent, emptyComponent,
  children,
}: Props<T>) {
  if (loading) return <>{loadingComponent ?? <Spinner />}</>;
  if (error) return <>{errorComponent ?? <ErrorView msg={error} onRetry={onRetry} />}</>;
  if (!data || data.length === 0) return <>{emptyComponent ?? <EmptyView />}</>;
  return <>{children(data)}</>;
}` } },

          { subtitle: '4가지 상태 컴포넌트' },
          { code: { lang: 'tsx', content: `function Spinner() {
  return <div className="spinner" aria-label="로딩 중" />;
}

function CardSkeleton() {
  return (
    <div className="skeleton">
      <div className="skel-line w-3/4" />
      <div className="skel-line w-1/2" />
    </div>
  );
}

function ErrorView({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="error-view">
      <p>⚠️ {msg}</p>
      {onRetry && <button onClick={onRetry}>다시 시도</button>}
    </div>
  );
}

function EmptyView() {
  return (
    <div className="empty-view">
      <p>📭 아직 항목이 없습니다</p>
    </div>
  );
}` } },

          { subtitle: '사용' },
          { code: { lang: 'tsx', content: `<DataView
  loading={loading}
  error={error}
  data={users}
  onRetry={refetch}
>
  {(users) => (
    <ul>{users.map(u => <UserCard key={u.id} user={u} />)}</ul>
  )}
</DataView>` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ DataView 제네릭 작성',
            '☐ 4가지 상태 모두 컴포넌트화',
            '☐ 본인 프로젝트의 3개 페이지에 적용',
            '☐ 의도적으로 네트워크 끊고 ErrorView 동작',
          ] },
        ],
      },

      {
        id: 'reg-9-practice-5',
        title: '실습 5 · 모바일 햄버거 + Safe Area (25분)',
        icon: '🧪',
        summary: '모바일 햄버거 메뉴 + iPhone 노치 safe-area-inset 대응.',
        content: [
          { subtitle: '햄버거 메뉴' },
          { code: { lang: 'tsx', content: `// 실습 5 (Day 2)의 햄버거 메뉴를 본인 프로젝트에 적용

// src/components/layout/Navbar.tsx
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // 라우트 변경 시 자동 닫기
  useEffect(() => { setIsOpen(false); }, [location]);

  return (
    <nav className="navbar">
      <Link to="/" className="logo">로고</Link>
      <button
        className="hamburger"
        aria-label="메뉴"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(o => !o)}
      >
        ☰
      </button>
      <ul className={\`nav-menu \${isOpen ? 'open' : ''}\`}>
        <li><NavLink to="/about">소개</NavLink></li>
        <li><NavLink to="/chat">진단</NavLink></li>
      </ul>
    </nav>
  );
}` } },

          { subtitle: 'Safe Area Inset' },
          { code: { lang: 'css', content: `/* iPhone 노치 대응 */
.app-bottom-bar {
  position: fixed;
  bottom: 0;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

/* 좌우 (iPhone 가로 모드) */
.fullscreen {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* iOS dynamic viewport */
.chat-window {
  height: 100dvh;   /* 주소창 변화 자동 반영 */
}` } },

          { subtitle: 'index.html 메타' },
          { code: { lang: 'html', content: `<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
<!-- viewport-fit=cover로 safe-area 영역까지 사용 -->` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 모바일에서 햄버거 메뉴 동작',
            '☐ 라우트 변경 시 자동 닫기',
            '☐ iPhone에서 노치 영역 침범 없음',
            '☐ Safari 주소창 변화 대응 (dvh)',
            '☐ 실제 모바일 기기에서 검증',
          ] },
        ],
      },

      {
        id: 'reg-9-practice-6',
        title: '실습 6 · 챗봇 UI 완성 + Lighthouse 90+ (45분)',
        icon: '🧪',
        summary: 'Day 7~8의 챗봇에 디자인 토큰·4상태·반응형·다크모드 모두 적용 후 Lighthouse 90점 달성.',
        content: [
          { subtitle: '통합 작업 — Day 8 결과물에 적용' },
          { items: [
            '디자인 토큰 적용 (실습 2 결과)',
            '컴포넌트 분할 — ChatHeader·MessageList·ChatInput',
            '4가지 상태 — 로딩·에러·빈·성공',
            '햄버거 메뉴 통합',
            'Safe Area Inset',
            '다크모드 토글 동작',
          ] },

          { subtitle: 'Lighthouse 측정 + 개선' },
          { code: { lang: 'bash', content: `# 빌드 후 측정
npm run build && npm run preview
# → http://localhost:4173

# Chrome DevTools → Lighthouse → "Analyze page load" (Mobile)

[흔한 개선 포인트]
- 이미지 lazy loading: <img loading="lazy" />
- 폰트 preload: <link rel="preload" href="..." as="font">
- 코드 스플리팅 (React.lazy)
- 색 대비 4.5:1
- alt 텍스트 모든 이미지` } },

          { subtitle: '목표' },
          { items: [
            'Performance 80+ (모바일)',
            'Accessibility 95+',
            'Best Practices 95+',
            'SEO 95+',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 모든 디자인 토큰 적용',
            '☐ 컴포넌트 분할 완료',
            '☐ 4상태 UI',
            '☐ 모바일 햄버거 + Safe Area',
            '☐ 다크모드 토글',
            '☐ Lighthouse 4지표 80+ (Performance 제외 95+ 권장)',
          ] },
        ],
      },

      {
        id: 'reg-9-resources',
        title: '심화 + 자가 평가',
        icon: '📚',
        summary: '디자인 시스템·접근성 심화 자료 + Day 9 자가 평가.',
        content: [
          { subtitle: '심화 자료' },
          { items: [
            'Design Tokens W3C: design-tokens.github.io',
            'Tailwind CSS: tailwindcss.com (토큰 시스템 표준)',
            'shadcn/ui: ui.shadcn.com (복붙형 컴포넌트)',
            'Radix UI: radix-ui.com (접근성 ready)',
            '도서 『Refactoring UI』 — UI 마이크로 개선',
          ] },

          { subtitle: '심화 주제' },
          { items: [
            'Container Queries — 부모 크기 기반 반응형',
            'CSS-in-JS (styled-components, vanilla-extract)',
            'Tailwind v4 + Catalyst',
            'Framer Motion — 애니메이션',
            '디자인 시스템 문서화 (Storybook)',
          ] },

          { subtitle: 'Day 9 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['디자인 토큰', '하드코딩', '색만 변수', '6개 카테고리 시스템'],
              ['컴포넌트 분할', '거대 단일 파일', 'props 분리', 'Atomic + render prop'],
              ['4가지 상태', '성공만', '로딩+에러', '4종 + DataView 추출'],
              ['모바일', '데스크탑만', '기본 반응형', '햄버거 + safe-area'],
              ['접근성', 'div만', '시맨틱 사용', 'ARIA + Lighthouse 95+'],
            ],
          } },
        ],
      },
    ],
  },

  {
    id: 'reg-10',
    title: 'Day 12 · 프로젝트 백엔드 연동',
    icon: '🔗',
    description: 'Supabase Realtime 구독, 파일 업로드 + 미리보기, 폼 검증 분리, .env 환경별 분리 — 실제 프로젝트의 백엔드 연동 흐름을 빈틈없이 학습합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'React-Supabase CRUD 연동', '동작하는 CRUD 화면'],
          ['S2', '50분', 'Realtime 구독 + 다른 탭 동기화', '실시간 반영 동작'],
          ['S3', '50분', '파일 업로드 + Storage + 미리보기', '프로필 사진 변경'],
          ['S4', '50분', '폼 검증 + .env 환경 분리 + 통합 테스트', '프로덕션 빌드 검증'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        'Supabase 테이블 CRUD를 React 컴포넌트와 연동한다',
        'Realtime 구독으로 실시간 데이터 변경을 반영한다',
        'Storage로 이미지 업로드 + 미리보기를 구현한다',
        '.env를 환경별(development/production)로 분리한다',
      ] },

      { subtitle: 'React에서 Supabase CRUD' },
      { code: { lang: 'tsx', content: `// src/pages/Posts.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Post { id: number; title: string; body: string; }

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');

  // 초기 로드
  useEffect(() => {
    supabase.from('posts').select('*').order('id', { ascending: false })
      .then(({ data }) => data && setPosts(data));
  }, []);

  // INSERT
  const addPost = async () => {
    const { data, error } = await supabase
      .from('posts').insert({ title, body: '내용...' })
      .select().single();
    if (data) setPosts([data, ...posts]);
    setTitle('');
  };

  return (
    <div>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button onClick={addPost}>추가</button>
      <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}` } },

      { subtitle: 'Realtime 구독 — 실시간 반영' },
      { code: { lang: 'typescript', content: `useEffect(() => {
  // posts 테이블 변경을 실시간 구독
  const channel = supabase
    .channel('posts-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new as Post, ...prev]);
        }
        if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      }
    )
    .subscribe();

  // 클린업 — 컴포넌트 언마운트 시 구독 해제
  return () => { supabase.removeChannel(channel); };
}, []);` } },
      { callout: { type: 'tip', text: 'Realtime은 채팅·실시간 알림·협업 도구에서 강력하지만, 일반 게시판에는 과합니다. 새로고침으로 충분한 곳에는 굳이 쓰지 마세요 — 비용·복잡도 증가.' } },

      { subtitle: '파일 업로드 + 즉시 미리보기' },
      { code: { lang: 'tsx', content: `export default function AvatarUploader({ userId }: { userId: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) 즉시 미리보기 — FileReader 또는 createObjectURL
    setPreview(URL.createObjectURL(file));

    // 2) Storage에 업로드
    setUploading(true);
    const path = \`\${userId}/avatar.jpg\`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    setUploading(false);

    if (error) { alert('업로드 실패'); return; }

    // 3) 공개 URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars').getPublicUrl(path);

    // 4) profiles 테이블에 URL 저장
    await supabase.from('profiles')
      .update({ avatar_url: publicUrl }).eq('id', userId);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFile} />
      {uploading && <p>업로드 중…</p>}
      {preview && <img src={preview} width={120} />}
    </div>
  );
}` } },

      { subtitle: '폼 검증 — 클라이언트 vs DB' },
      { table: {
        headers: ['검증 위치', '용도', '예'],
        rows: [
          ['클라이언트 (즉시)', '사용자 경험', '필수값 누락 즉시 빨간 메시지'],
          ['DB CHECK 제약', '데이터 무결성', 'CHECK (age >= 0)'],
          ['RLS 정책', '권한 검증', 'auth.uid() = author_id'],
        ],
      } },
      { callout: { type: 'warn', text: '클라이언트 검증만 믿지 마세요. DevTools로 우회 가능하므로 DB 또는 Edge Function에서 한 번 더 검증해야 합니다 — "Never trust the client".' } },

      { subtitle: '.env 환경별 분리' },
      { code: { lang: 'bash', content: `# .env (모든 환경 공통)
VITE_APP_NAME="AI Reboot Academy"

# .env.development (npm run dev)
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev_key_...

# .env.production (npm run build)
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_key_...

# .env.local — gitignore 대상, 개인 비밀
VITE_PERSONAL_DEBUG_KEY=...` } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "Realtime이 동작하지 않아요" — ① 테이블의 Replication 활성화 확인 ② RLS가 SELECT를 허용하는지 ③ supabase.removeChannel 호출 누락 (메모리 누수).',
        'Q. "파일 업로드 용량 제한은?" — 기본 50MB. 프로젝트 설정에서 조정 가능. 큰 파일은 멀티파트 업로드 필요.',
        'Q. ".env 변수가 안 읽혀요" — Vite는 반드시 VITE_ 접두사 필요. .env 변경 후 dev 서버 재시작 필수.',
        'Q. "프로덕션 빌드에서만 에러가 나요" — 환경변수 누락이 1순위. .env.production 또는 배포 플랫폼 환경변수 설정 확인.',
        'Q. "이미지가 너무 커서 느려요" — 업로드 전 클라이언트에서 압축 (browser-image-compression 라이브러리) 또는 Supabase Image Transformation 활용.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. Vite 환경변수에 반드시 붙어야 하는 접두사는?',
        '2. Realtime 채널을 컴포넌트 언마운트 시 어떻게 정리하는가?',
        '3. Storage upload의 upsert: true 옵션은 무엇을 의미하는가?',
        '4. 클라이언트 검증만 신뢰하면 안 되는 이유는?',
        '5. .env.local과 .env.production 중 어느 것을 git에 커밋해야 하는가?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) VITE_  2) supabase.removeChannel(channel)  3) 같은 경로에 파일이 있으면 덮어쓰기  4) DevTools로 우회 가능 → DB 또는 Edge Function에서 재검증 필요  5) 둘 다 커밋 금지 (.env.example만 공유, 실제 키는 배포 플랫폼 환경변수로)' } },

      { subtitle: '참고 자료' },
      { items: [
        'Supabase Realtime: supabase.com/docs/guides/realtime',
        'Supabase Storage: supabase.com/docs/guides/storage',
        'Vite 환경변수: vite.dev/guide/env-and-mode',
        '이미지 압축: github.com/Donaldcwl/browser-image-compression',
        '폼 라이브러리: react-hook-form.com (대형 폼에 추천)',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        '프로젝트 핵심 테이블 1개를 Supabase에 생성 + React CRUD 화면 구현',
        'Realtime 구독으로 다른 탭에서 추가한 데이터가 즉시 반영되도록',
        '프로필 사진 업로드 기능 — 즉시 미리보기 + Storage 저장 + URL 반영',
        '.env.development와 .env.production을 분리하고 빌드별 차이 확인',
        '프로덕션 빌드(npm run build && npm run preview)에서 실제 동작 확인',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 11에서는 만들어놓은 모든 기능을 테스트·디버깅. Chrome DevTools·React DevTools·Lighthouse로 품질을 끌어올립니다.' },
    ],
    subSections: [
      {
        id: 'reg-10-crud-ui',
        title: 'Supabase CRUD를 React에 통합',
        icon: '🔗',
        summary: 'Supabase 클라이언트와 React를 연결하는 표준 패턴 — custom hook, 낙관적 업데이트, 에러 처리까지.',
        content: [
          { subtitle: 'useSupabaseQuery — custom hook' },
          { code: { lang: 'typescript', content: `// src/hooks/useSupabaseQuery.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

export function useSupabaseQuery<T>(
  queryFn: () => Promise<PostgrestSingleResponse<T>>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await queryFn();
    if (error) setError(error.message);
    else setData(data);
    setLoading(false);
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

// 사용
const { data: posts, loading, error, refetch } = useSupabaseQuery(
  () => supabase.from('posts').select('*').order('created_at', { ascending: false }),
  []
);` } },

          { subtitle: 'CRUD 컴포넌트 패턴' },
          { code: { lang: 'tsx', content: `function PostsPage() {
  const { data: posts, refetch } = useSupabaseQuery(
    () => supabase.from('posts').select('*').order('id', { ascending: false }),
    []
  );

  async function createPost(title: string) {
    const { error } = await supabase
      .from('posts')
      .insert({ title, body: '' });
    if (!error) refetch();
  }

  async function deletePost(id: number) {
    if (!confirm('정말 삭제?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) refetch();
  }

  async function updateStatus(id: number, status: string) {
    const { error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', id);
    if (!error) refetch();
  }

  return (
    <DataView loading={loading} error={error} data={posts}>
      {(posts) => (
        <ul>
          {posts.map(p => (
            <PostRow
              key={p.id}
              post={p}
              onDelete={() => deletePost(p.id)}
              onPublish={() => updateStatus(p.id, 'published')}
            />
          ))}
        </ul>
      )}
    </DataView>
  );
}` } },

          { subtitle: '낙관적 업데이트 — 즉시 반응' },
          { code: { lang: 'tsx', content: `// 서버 응답을 기다리지 않고 UI 즉시 업데이트
async function toggleLike(postId: number) {
  // 1) UI 즉시 변경
  setPosts(prev => prev.map(p =>
    p.id === postId ? { ...p, likes: p.likes + 1 } : p
  ));

  // 2) 서버 호출
  const { error } = await supabase
    .from('posts')
    .update({ likes: post.likes + 1 })
    .eq('id', postId);

  // 3) 실패 시 되돌리기
  if (error) {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: p.likes - 1 } : p
    ));
    alert('좋아요 실패');
  }
}` } },

          { subtitle: '서버 에러 처리 패턴' },
          { code: { lang: 'typescript', content: `function friendlyError(error: any): string {
  if (!error) return '';

  // PostgrestError code
  switch (error.code) {
    case '23505': return '이미 존재하는 항목입니다.';      // unique violation
    case '23503': return '참조 무결성 오류.';              // foreign key
    case '42501': return '권한이 없습니다.';                // permission denied
    case 'PGRST116': return '항목을 찾을 수 없습니다.';     // single() 결과 없음
    case 'PGRST301': return '인증이 필요합니다.';           // JWT expired
  }

  // RLS 위반
  if (error.message?.includes('row-level security')) {
    return '접근 권한이 없습니다.';
  }

  return error.message || '알 수 없는 오류';
}` } },

          { subtitle: 'TanStack Query 진입 — 다음 단계 추천' },
          { text: '현재 구현은 학습 목적. 실전에서는 TanStack Query(이전 React Query) 도입을 추천합니다. 캐싱·자동 재요청·낙관적 업데이트가 내장.' },
          { code: { lang: 'typescript', content: `// 미래 — TanStack Query
const { data: posts } = useQuery({
  queryKey: ['posts'],
  queryFn: () => supabase.from('posts').select('*'),
});

const mutation = useMutation({
  mutationFn: (newPost) => supabase.from('posts').insert(newPost),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
});` } },

          { subtitle: '실습' },
          { items: [
            'useSupabaseQuery custom hook 작성',
            'CRUD UI — 생성·읽기·수정·삭제 모두',
            '낙관적 업데이트로 좋아요 토글',
            'friendlyError 매핑 + 사용자 친화적 메시지',
            'TanStack Query 1개 쿼리만 시범 도입',
          ] },
        ],
      },

      {
        id: 'reg-10-realtime',
        title: 'Realtime — 다중 사용자 동기화',
        icon: '⚡',
        summary: 'Supabase Realtime으로 채팅·알림·협업 도구의 핵심 기능 구현. INSERT/UPDATE/DELETE 실시간 반영 + presence.',
        content: [
          { subtitle: 'Realtime 활성화 + 구독 패턴' },
          { code: { lang: 'tsx', content: `function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // 1) 초기 로드
    supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at')
      .then(({ data }) => data && setMessages(data));

    // 2) 실시간 구독
    const channel = supabase
      .channel(\`room:\${roomId}\`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: \`room_id=eq.\${roomId}\`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  async function send(text: string) {
    await supabase.from('messages').insert({
      room_id: roomId,
      content: text,
      author_id: user.id,
    });
    // Realtime이 자동으로 setMessages 업데이트
  }

  return (
    <div>
      {messages.map(m => <ChatMessage key={m.id} {...m} />)}
      <ChatInput onSend={send} />
    </div>
  );
}` } },

          { subtitle: 'Presence — 누가 접속 중?' },
          { code: { lang: 'tsx', content: `function RoomUsers({ roomId }: { roomId: string }) {
  const [users, setUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(\`presence:\${roomId}\`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userIds = Object.values(state).flat().map((s: any) => s.user_id);
        setUsers([...new Set(userIds)]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [roomId, user]);

  return (
    <div className="online-users">
      <p>현재 접속: {users.length}명</p>
      {users.map(uid => <Avatar key={uid} id={uid} />)}
    </div>
  );
}` } },

          { subtitle: 'Broadcast — DB 없는 실시간 통신' },
          { code: { lang: 'tsx', content: `// 타이핑 표시 ("○○님이 입력 중...")
function TypingIndicator({ roomId }: { roomId: string }) {
  const [typing, setTyping] = useState<string[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channel = supabase
      .channel(\`typing:\${roomId}\`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTyping(prev => {
          if (prev.includes(payload.user)) return prev;
          const next = [...prev, payload.user];
          setTimeout(() => {
            setTyping(now => now.filter(u => u !== payload.user));
          }, 3000);
          return next;
        });
      })
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  return typing.length > 0 ? (
    <p className="typing">{typing.join(', ')} 입력 중...</p>
  ) : null;
}

// 입력 시 broadcast 전송
function ChatInput({ onSend, roomId }) {
  function handleTyping() {
    supabase.channel(\`typing:\${roomId}\`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user: user.email },
    });
  }

  return <input onChange={handleTyping} />;
}` } },

          { subtitle: '실시간 카운터·투표' },
          { code: { lang: 'tsx', content: `// 라이브 투표 — 모든 사용자가 즉시 결과 본다
function LivePoll({ pollId }: { pollId: string }) {
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase
      .from('poll_votes')
      .select('option')
      .eq('poll_id', pollId)
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        data?.forEach(v => { counts[v.option] = (counts[v.option] || 0) + 1; });
        setVotes(counts);
      });

    const channel = supabase
      .channel(\`poll:\${pollId}\`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'poll_votes', filter: \`poll_id=eq.\${pollId}\` },
        (payload) => {
          const opt = payload.new.option;
          setVotes(prev => ({ ...prev, [opt]: (prev[opt] || 0) + 1 }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pollId]);

  async function vote(option: string) {
    await supabase.from('poll_votes').insert({ poll_id: pollId, option, user_id: user.id });
  }

  return (
    <div>
      {['A', 'B', 'C'].map(opt => (
        <button key={opt} onClick={() => vote(opt)}>
          {opt} ({votes[opt] || 0}표)
        </button>
      ))}
    </div>
  );
}` } },

          { subtitle: '실습' },
          { items: [
            '간단한 채팅방 — 두 브라우저 탭에서 실시간 동기화',
            'Presence로 접속자 목록',
            'Broadcast로 타이핑 표시',
            '실시간 투표 또는 좋아요 카운터',
          ] },
        ],
      },

      {
        id: 'reg-10-storage-advanced',
        title: 'Storage 심화 — 업로드 + 변환',
        icon: '📦',
        summary: '파일 업로드 진행률·자동 압축·이미지 변환·CDN 캐싱·signed URL까지 Storage 전체 활용.',
        content: [
          { subtitle: '이미지 압축 (업로드 전)' },
          { code: { lang: 'typescript', content: `// 라이브러리 사용
// npm install browser-image-compression
import imageCompression from 'browser-image-compression';

async function uploadAvatar(file: File, userId: string) {
  // 1) 압축 (max 1MB, 1920px)
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  console.log(\`원본 \${file.size / 1024}KB → 압축 \${compressed.size / 1024}KB\`);

  // 2) Supabase 업로드
  const { error } = await supabase.storage
    .from('avatars')
    .upload(\`\${userId}/profile.jpg\`, compressed, {
      upsert: true,
      contentType: 'image/jpeg',
    });

  return error;
}` } },

          { subtitle: '업로드 진행률' },
          { code: { lang: 'typescript', content: `// Supabase JS는 onUploadProgress 지원 (XHR 사용)
const { error } = await supabase.storage
  .from('avatars')
  .upload(\`\${userId}/profile.jpg\`, file, {
    upsert: true,
    onUploadProgress: (event) => {
      const percent = Math.round((event.loaded / event.total) * 100);
      setProgress(percent);
    },
  });

// 컴포넌트
{progress > 0 && progress < 100 && (
  <div className="progress">
    <div className="progress-bar" style={{ width: \`\${progress}%\` }} />
    <span>{progress}%</span>
  </div>
)}` } },

          { subtitle: '이미지 변환 (자동 리사이즈)' },
          { code: { lang: 'typescript', content: `// public URL에 transform 옵션
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(\`\${userId}/profile.jpg\`, {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover',
      quality: 80,
    },
  });

// 다양한 크기 — srcset
const thumb = supabase.storage.from('avatars').getPublicUrl(path, {
  transform: { width: 64, height: 64, resize: 'cover' },
});
const medium = supabase.storage.from('avatars').getPublicUrl(path, {
  transform: { width: 200, height: 200, resize: 'cover' },
});
const large = supabase.storage.from('avatars').getPublicUrl(path, {
  transform: { width: 400, height: 400, resize: 'cover' },
});

<img
  src={medium.data.publicUrl}
  srcSet={\`\${thumb.data.publicUrl} 64w, \${medium.data.publicUrl} 200w, \${large.data.publicUrl} 400w\`}
  sizes="(max-width: 640px) 64px, 200px"
/>` } },

          { subtitle: 'Signed URL — 비공개 파일' },
          { code: { lang: 'typescript', content: `// private 버킷 — 임시 URL
const { data, error } = await supabase.storage
  .from('private-docs')
  .createSignedUrl('contract.pdf', 3600);  // 1시간

if (data) {
  window.open(data.signedUrl, '_blank');
}

// 여러 파일 한 번에
const { data } = await supabase.storage
  .from('private-docs')
  .createSignedUrls(['file1.pdf', 'file2.pdf'], 3600);
// data: [{ signedUrl, path }, ...]` } },

          { subtitle: '드래그 앤 드롭 업로드' },
          { code: { lang: 'tsx', content: `function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={\`drop-zone \${dragging ? 'dragging' : ''}\`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      <p>{dragging ? '여기에 놓아주세요' : '파일을 드래그하거나 클릭'}</p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </div>
  );
}` } },

          { subtitle: '실습' },
          { items: [
            'browser-image-compression 도입 + 압축 비율 확인',
            '업로드 진행률 표시',
            '이미지 변환으로 썸네일 자동 생성',
            '드래그 앤 드롭 + 클릭 모두 지원',
            'signed URL로 비공개 PDF 1회 다운로드',
          ] },
        ],
      },

      {
        id: 'reg-10-forms',
        title: '폼 + 검증 — react-hook-form',
        icon: '📝',
        summary: '복잡한 폼을 효율적으로 다루는 react-hook-form + Zod 검증 패턴.',
        content: [
          { subtitle: '왜 react-hook-form인가' },
          { text: 'useState로 각 입력값을 따로 관리하면 5개 필드부터 코드가 폭증. react-hook-form은 입력값을 자동 관리하고 검증·에러 표시까지 통합.' },

          { subtitle: '셋업' },
          { code: { lang: 'bash', content: `npm install react-hook-form zod @hookform/resolvers` } },

          { subtitle: '회원가입 폼 예제' },
          { code: { lang: 'tsx', content: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1) 스키마 정의
const SignupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '8자 이상'),
  passwordConfirm: z.string(),
  name: z.string().min(2, '2자 이상'),
  age: z.coerce.number().min(14, '14세 이상').max(120),
  agree: z.boolean().refine(v => v === true, '동의 필요'),
}).refine(data => data.password === data.passwordConfirm, {
  message: '비밀번호 불일치',
  path: ['passwordConfirm'],
});

type SignupForm = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { name: '', email: '', password: '', passwordConfirm: '', age: 0, agree: false },
  });

  async function onSubmit(data: SignupForm) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, age: data.age } },
    });

    if (error) {
      alert('가입 실패: ' + error.message);
      return;
    }
    alert('가입 완료! 이메일을 확인하세요.');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field label="이름" error={errors.name?.message}>
        <input {...register('name')} />
      </Field>

      <Field label="이메일" error={errors.email?.message}>
        <input type="email" {...register('email')} />
      </Field>

      <Field label="비밀번호" error={errors.password?.message}>
        <input type="password" {...register('password')} />
      </Field>

      <Field label="비밀번호 확인" error={errors.passwordConfirm?.message}>
        <input type="password" {...register('passwordConfirm')} />
      </Field>

      <Field label="나이" error={errors.age?.message}>
        <input type="number" {...register('age')} />
      </Field>

      <Field error={errors.agree?.message}>
        <label>
          <input type="checkbox" {...register('agree')} />
          이용약관에 동의합니다
        </label>
      </Field>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '가입 중...' : '가입'}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label?: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {error && <p className="error">{error}</p>}
    </div>
  );
}` } },

          { subtitle: '복잡한 동적 폼' },
          { code: { lang: 'tsx', content: `// useFieldArray — 동적 배열 필드
import { useFieldArray } from 'react-hook-form';

const PrdSchema = z.object({
  title: z.string(),
  features: z.array(z.object({
    name: z.string().min(1),
    priority: z.enum(['must', 'should', 'could']),
  })).min(1),
});

function PrdForm() {
  const { control, register } = useForm({ resolver: zodResolver(PrdSchema) });
  const { fields, append, remove } = useFieldArray({ control, name: 'features' });

  return (
    <form>
      <input {...register('title')} />

      {fields.map((field, i) => (
        <div key={field.id}>
          <input {...register(\`features.\${i}.name\`)} />
          <select {...register(\`features.\${i}.priority\`)}>
            <option value="must">Must</option>
            <option value="should">Should</option>
            <option value="could">Could</option>
          </select>
          <button type="button" onClick={() => remove(i)}>삭제</button>
        </div>
      ))}

      <button type="button" onClick={() => append({ name: '', priority: 'must' })}>
        + 기능 추가
      </button>
    </form>
  );
}` } },

          { subtitle: '서버 검증과 함께' },
          { callout: { type: 'warn', text: '⚠️ 클라이언트 검증만 신뢰하지 마세요. DevTools로 우회 가능. Zod 스키마를 Edge Function에서도 재사용하면 더 안전합니다.' } },

          { subtitle: '실습' },
          { items: [
            'react-hook-form + Zod 셋업',
            '회원가입 폼 — 7개 필드 검증',
            '동적 폼 — useFieldArray로 항목 추가/삭제',
            '서버 응답 에러를 react-hook-form setError로 표시',
          ] },
        ],
      },

      {
        id: 'reg-10-env',
        title: '환경 분리 + 배포 준비',
        icon: '🔐',
        summary: '.env 환경별 분리, 비밀 관리, GitHub Actions 자동 배포까지 — 프로덕션 운영 준비.',
        content: [
          { subtitle: '환경변수 3종' },
          { code: { lang: 'bash', content: `# .env (공통 — 비공개)
VITE_APP_NAME="AI Reboot Academy"

# .env.development (npm run dev 시 자동)
VITE_SUPABASE_URL=https://dev-xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=dev_eyJ...
VITE_API_URL=http://localhost:3000

# .env.production (npm run build 시 자동)
VITE_SUPABASE_URL=https://prod-xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=prod_eyJ...
VITE_API_URL=https://api.example.com

# .env.local (개인 비밀 — 자동 gitignore)
VITE_PERSONAL_DEBUG_KEY=...` } },

          { subtitle: '.env.example — 커밋용 템플릿' },
          { code: { lang: 'bash', content: `# .env.example (커밋 OK)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_API_URL=https://your-api.com

# 신규 팀원은 이걸 .env.local로 복사 후 실제 값 채움
# cp .env.example .env.local` } },

          { subtitle: '환경별 분기 코드' },
          { code: { lang: 'typescript', content: `// src/config.ts
export const config = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,   // 'development' / 'production'

  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  api: {
    baseUrl: import.meta.env.VITE_API_URL,
  },

  features: {
    enableAnalytics: import.meta.env.PROD,
    enableDebugPanel: import.meta.env.DEV,
  },
};

// 사용
import { config } from '@/config';
if (config.isDev) console.log('개발 모드');` } },

          { subtitle: '빌드 명령어' },
          { code: { lang: 'bash', content: `# 기본 production 빌드
npm run build

# 명시적 모드
npx vite build --mode production
npx vite build --mode staging        # .env.staging 사용

# 빌드 결과 미리보기
npm run preview                       # → http://localhost:4173` } },

          { subtitle: 'GitHub Actions 자동 배포' },
          { code: { lang: 'yaml', content: `# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: rest.dreamitbiz.com` } },

          { subtitle: 'GitHub Secrets 설정' },
          { items: [
            '리포지토리 → Settings → Secrets and variables → Actions',
            'New repository secret 클릭',
            'Name: VITE_SUPABASE_URL, Value: 실제 키',
            'Name: VITE_SUPABASE_ANON_KEY, Value: 실제 키',
            'Push 시 자동 배포',
          ] },

          { subtitle: '배포 전 점검 체크리스트' },
          { items: [
            '☐ npm run typecheck 통과',
            '☐ npm run lint 0 경고',
            '☐ npm run build 성공',
            '☐ npm run preview에서 정상 동작',
            '☐ .env.local이 .gitignore에 포함',
            '☐ git log에 키 노출 흔적 없음 (git log -p | grep -i "anon_key")',
            '☐ Lighthouse 모든 지표 80+',
          ] },

          { subtitle: '실습' },
          { items: [
            '.env.example 작성',
            'config.ts로 환경변수 중앙 관리',
            'staging 모드 추가 (npm run build:staging)',
            'GitHub Actions 자동 배포 설정',
            '배포 전 점검 체크리스트 모두 통과',
          ] },
        ],
      },

      {
        id: 'reg-10-practice-1',
        title: '실습 1 · useSupabaseQuery Hook 작성 (25분)',
        icon: '🧪',
        summary: '재사용 가능한 데이터 fetching custom hook + loading/error/refetch 자동 관리.',
        content: [
          { subtitle: 'Hook 구현' },
          { code: { lang: 'typescript', content: `// src/hooks/useSupabaseQuery.ts
import { useState, useEffect, useCallback, type DependencyList } from 'react';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

export function useSupabaseQuery<T>(
  queryFn: () => Promise<PostgrestSingleResponse<T>>,
  deps: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await queryFn();
    if (error) setError(error.message);
    else setData(data);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

// 사용
const { data: posts, loading, error, refetch } = useSupabaseQuery(
  () => supabase.from('posts').select('*').order('id', { ascending: false }),
  []
);` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 3개 이상 컴포넌트에서 재사용',
            '☐ refetch 함수 동작',
            '☐ 의존성 변경 시 자동 재호출',
            '☐ DataView와 함께 사용',
          ] },
        ],
      },

      {
        id: 'reg-10-practice-2',
        title: '실습 2 · 게시판 CRUD UI 풀세트 (40분)',
        icon: '🧪',
        summary: 'Day 6 게시판에 React UI 추가 — 생성·읽기·수정·삭제 + 낙관적 업데이트.',
        content: [
          { subtitle: '구현' },
          { code: { lang: 'tsx', content: `function PostsPage() {
  const { data: posts, loading, error, refetch } = useSupabaseQuery<Post[]>(
    () => supabase.from('posts').select('*').order('id', { ascending: false }),
    []
  );
  const { user } = useAuth();

  async function createPost(title: string, body: string) {
    if (!user) return;

    // 낙관적 업데이트
    const tempId = Date.now();
    setPosts(prev => [{ id: tempId, title, body, author_id: user.id, status: 'draft' } as Post, ...(prev || [])]);

    const { data, error } = await supabase
      .from('posts')
      .insert({ title, body, author_id: user.id })
      .select()
      .single();

    if (error) {
      setPosts(prev => prev?.filter(p => p.id !== tempId) ?? null);
      alert('실패');
    } else {
      refetch();   // 정확한 ID로 갱신
    }
  }

  async function updatePost(id: number, updates: Partial<Post>) {
    setPosts(prev => prev?.map(p => p.id === id ? { ...p, ...updates } : p) ?? null);
    const { error } = await supabase.from('posts').update(updates).eq('id', id);
    if (error) { refetch(); alert('실패'); }
  }

  async function deletePost(id: number) {
    if (!confirm('삭제할까요?')) return;
    setPosts(prev => prev?.filter(p => p.id !== id) ?? null);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) { refetch(); alert('실패'); }
  }

  return (
    <DataView loading={loading} error={error} data={posts} onRetry={refetch}>
      {(posts) => (
        <ul>
          {posts.map(p => <PostRow key={p.id} post={p} onUpdate={updatePost} onDelete={deletePost} />)}
        </ul>
      )}
    </DataView>
  );
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ CRUD 4개 모두 동작',
            '☐ 낙관적 업데이트 (UI 즉시 반응)',
            '☐ 실패 시 자동 롤백',
            '☐ 본인 글만 수정·삭제 버튼 표시',
            '☐ confirm으로 삭제 확인',
          ] },
        ],
      },

      {
        id: 'reg-10-practice-3',
        title: '실습 3 · Realtime 채팅방 + Presence (40분)',
        icon: '🧪',
        summary: '두 사용자가 동시 접속해 실시간 채팅 + 접속자 수 + 타이핑 표시.',
        content: [
          { subtitle: '구현' },
          { text: 'Day 6 실습 4의 채팅방을 본인 프로젝트에 통합. 다중 채팅방 (room_id) + 메시지 영구 저장 + Presence 접속자 표시 + Broadcast 타이핑 표시.' },

          { subtitle: '확장' },
          { items: [
            '여러 채팅방 지원 (/chat/:roomId)',
            '메시지 시간 표시',
            '같은 사용자 연속 메시지는 아바타 1번만',
            '이미지 첨부 (Storage 결합)',
            '메시지 검색',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 두 브라우저 탭에서 동기화',
            '☐ Presence 접속자 수 정확',
            '☐ 타이핑 표시 동작',
            '☐ 새로고침 후 메시지 유지',
            '☐ cleanup으로 메모리 누수 없음',
          ] },
        ],
      },

      {
        id: 'reg-10-practice-4',
        title: '실습 4 · 이미지 업로드 + 압축 + 미리보기 (30분)',
        icon: '🧪',
        summary: 'browser-image-compression + Storage + DataView 통합한 프로필 사진 컴포넌트.',
        content: [
          { subtitle: '단계' },
          { items: [
            'npm install browser-image-compression',
            'AvatarUploader 컴포넌트 작성 (Day 6 실습 3 참조)',
            '진행률 표시',
            '드래그 앤 드롭 추가',
            'DB profiles.avatar_url 업데이트',
            '헤더 아바타에 자동 반영',
          ] },

          { subtitle: '드래그 앤 드롭 추가' },
          { code: { lang: 'tsx', content: `function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={\`drop-zone \${dragging ? 'dragging' : ''}\`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      }}
    >
      <p>{dragging ? '여기에 놓아주세요' : '드래그 또는 클릭'}</p>
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 클릭 + 드래그 둘 다 동작',
            '☐ 즉시 미리보기',
            '☐ 압축 비율 50%+',
            '☐ 진행률 표시',
            '☐ 다른 사용자 폴더 침범 시도 → 차단',
          ] },
        ],
      },

      {
        id: 'reg-10-practice-5',
        title: '실습 5 · react-hook-form + Zod 회원가입 (30분)',
        icon: '🧪',
        summary: '복잡한 폼을 효율적으로 — 7개 필드 + Zod 스키마 검증 + 에러 표시.',
        content: [
          { subtitle: '셋업' },
          { code: { lang: 'bash', content: `npm install react-hook-form zod @hookform/resolvers` } },

          { subtitle: '구현 — Day 10 본문의 폼 예제를 그대로 적용' },
          { items: [
            'SignupSchema 정의 (Zod)',
            'useForm + zodResolver',
            '각 필드 register',
            'errors 자동 표시',
            'handleSubmit + Supabase auth.signUp 연동',
          ] },

          { subtitle: '확장 — useFieldArray로 동적 필드' },
          { code: { lang: 'tsx', content: `// PRD 폼처럼 동적 항목
const { fields, append, remove } = useFieldArray({ control, name: 'features' });

{fields.map((field, i) => (
  <div key={field.id}>
    <input {...register(\`features.\${i}.name\`)} />
    <button type="button" onClick={() => remove(i)}>삭제</button>
  </div>
))}

<button type="button" onClick={() => append({ name: '' })}>+ 추가</button>` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 7개 필드 모두 Zod 검증',
            '☐ 비밀번호 일치 검증 (refine)',
            '☐ 동적 필드 추가/삭제',
            '☐ Supabase 가입 성공',
            '☐ 에러 메시지 한국어 친화적',
          ] },
        ],
      },

      {
        id: 'reg-10-practice-6',
        title: '실습 6 · GitHub Actions 자동 배포 (25분)',
        icon: '🧪',
        summary: 'main 푸시 시 자동 빌드·배포 + Secrets 관리.',
        content: [
          { subtitle: '단계' },
          { items: [
            '1. .github/workflows/deploy.yml 작성',
            '2. GitHub Settings → Secrets에 VITE_SUPABASE_URL·VITE_SUPABASE_ANON_KEY 등록',
            '3. main 브랜치 푸시',
            '4. Actions 탭에서 빌드 진행 확인',
            '5. 자동 배포된 URL 접속',
          ] },

          { subtitle: 'deploy.yml — 본문 예제 참조' },
          { code: { lang: 'yaml', content: `name: Deploy
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
      - id: deployment
        uses: actions/deploy-pages@v4` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ main 푸시 → Actions 자동 실행',
            '☐ Secrets로 키 보호',
            '☐ 빌드 실패 시 알림',
            '☐ 배포 URL 자동 갱신',
            '☐ 빌드 로그에 키 노출 없음',
          ] },
        ],
      },

      {
        id: 'reg-10-resources',
        title: '심화 + 자가 평가',
        icon: '📚',
        summary: 'Day 10 학습 심화 자료 + 자가 평가 + 다음 단계.',
        content: [
          { subtitle: '심화 자료' },
          { items: [
            'TanStack Query: tanstack.com/query (서버 상태 표준)',
            'react-hook-form: react-hook-form.com',
            'Zod: zod.dev (TypeScript-first 스키마)',
            'browser-image-compression: github.com/Donaldcwl/browser-image-compression',
            'GitHub Actions: docs.github.com/ko/actions',
          ] },

          { subtitle: 'Day 10 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['CRUD 통합', '직접 호출', 'custom hook', 'TanStack Query'],
              ['Realtime', '없음', 'INSERT 구독', 'Presence + Broadcast'],
              ['Storage', '단순 업로드', '미리보기', '압축 + 진행률 + 변환'],
              ['폼', 'useState만', 'react-hook-form', 'Zod + useFieldArray'],
              ['배포', '수동', 'gh-pages CLI', 'GitHub Actions'],
            ],
          } },
        ],
      },
    ],
  },

  {
    id: 'reg-11',
    title: 'Day 13 · 테스트 및 디버깅',
    icon: '🐛',
    description: 'Chrome DevTools 4대 탭, React DevTools Profiler, Lighthouse 4지표, AI 코드 리뷰 — 실서비스 품질로 끌어올리기 위한 점검 도구를 종합 학습합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'Chrome DevTools 4탭 마스터', '느린 API 1개 식별·개선'],
          ['S2', '50분', 'React DevTools Profiler', '리렌더 원인 발견·수정'],
          ['S3', '50분', 'Lighthouse 4지표 + 개선', '4지표 80점 이상'],
          ['S4', '50분', 'AI 코드 리뷰 + 자주 발생하는 에러 5종', '진짜 문제 1개 이상 개선'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        'Chrome DevTools의 4대 탭(Console/Network/Sources/Performance)을 활용한다',
        'React DevTools로 컴포넌트 상태·리렌더 원인을 추적한다',
        'Lighthouse 4지표(Performance/Accessibility/Best Practices/SEO)를 80점 이상으로 개선한다',
        '자주 발생하는 React 에러 5종의 원인과 해결법을 안다',
      ] },

      { subtitle: 'Chrome DevTools 4대 탭' },
      { table: {
        headers: ['탭', '주요 용도', '단축키'],
        rows: [
          ['Console', '로그·에러·임시 실행', 'Cmd+Opt+J'],
          ['Network', 'API 호출·응답·소요시간', 'Cmd+Opt+I → N'],
          ['Sources', '브레이크포인트·디버깅', 'Cmd+Opt+I → S'],
          ['Performance', '성능 프로파일링', 'Cmd+Opt+I → P'],
        ],
      } },

      { subtitle: 'Network 탭 활용 패턴' },
      { items: [
        'XHR/Fetch 필터로 API 호출만 보기',
        'Status 컬럼 정렬 → 4xx·5xx 에러 한눈에',
        'Time 컬럼 → 느린 API 식별 (1초 이상)',
        'Preserve log 체크 → 페이지 이동 후에도 로그 유지',
        'Throttling으로 느린 3G 시뮬레이션 → 로딩 UI 검증',
      ] },

      { subtitle: 'React DevTools — 컴포넌트 추적' },
      { items: [
        'Components 탭 → 트리에서 특정 컴포넌트 선택 → 현재 Props/State 확인',
        'Profiler 탭 → 녹화 시작 → 사용자 액션 → 정지 → 리렌더 원인 분석',
        '"왜 이 컴포넌트가 리렌더 됐나" → Component → Props 차이 확인',
        'Highlight updates 옵션 → 화면에서 리렌더 발생 영역 시각화',
      ] },

      { subtitle: 'Lighthouse — 4가지 지표' },
      { table: {
        headers: ['지표', '의미', '목표', '주요 개선'],
        rows: [
          ['Performance', '로딩·인터랙션 속도', '90+', '이미지 최적화·코드 스플리팅'],
          ['Accessibility', '접근성·시맨틱', '95+', 'alt 텍스트·대비·키보드 이동'],
          ['Best Practices', '보안·표준 준수', '95+', 'HTTPS·취약 라이브러리 제거'],
          ['SEO', '검색엔진 최적화', '95+', 'meta·title·sitemap'],
        ],
      } },

      { subtitle: 'Lighthouse 실행' },
      { code: { lang: 'bash', content: `# 1) Chrome DevTools → Lighthouse 탭 → Analyze
# 2) 또는 CLI
npm install -g lighthouse
lighthouse https://rest.dreamitbiz.com --view

# 3) 결과 확인 + 개선 → 다시 실행 (반복)` } },

      { subtitle: '자주 발생하는 React 에러 5종' },
      { table: {
        headers: ['에러 메시지', '원인', '해결'],
        rows: [
          ['Each child should have a unique "key"', 'map 시 key prop 누락', 'key={item.id} 추가'],
          ['Rendered fewer hooks than expected', 'Hook을 조건문 안에서 호출', '항상 최상단에서 호출'],
          ['Can\'t perform state update on unmounted', 'unmount 후 setState', 'cleanup 또는 AbortController'],
          ['Maximum update depth exceeded', 'setState가 무한 루프', 'useEffect 의존성·조건 점검'],
          ['Cannot read property of undefined', '데이터 도착 전 접근', 'optional chaining (data?.user)'],
        ],
      } },

      { subtitle: 'AI에게 코드 리뷰 받기' },
      { code: { lang: 'text', content: `[역할] 너는 React 시니어 개발자로서 코드 리뷰를 한다.
[맥락] 다음은 우리 프로젝트의 핵심 컴포넌트다. (Vite 7 + TS + Supabase)
[지시]
  1) 잠재적 버그 또는 안티패턴 발견하면 줄 번호로 지적
  2) 성능 개선(useMemo/useCallback) 가능한 부분 찾기
  3) 가독성 개선 제안
  4) 모든 지적은 "왜 문제인지 + 어떻게 고치는지" 함께
[출력] 표 형식: 줄번호 | 분류 | 문제 | 개선안

[코드]
\`\`\`tsx
(파일 내용 붙여넣기)
\`\`\`` } },
      { callout: { type: 'tip', text: 'AI 리뷰는 100% 신뢰하지 말고 "후보 발견 도구"로 사용하세요. AI가 지적한 것 중 50%는 실제 문제, 30%는 스타일 차이, 20%는 잘못된 지적입니다. 본인이 판단해 적용하세요.' } },

      { subtitle: '디버깅 멘탈 모델' },
      { code: { lang: 'text', content: `[과학적 디버깅 5단계]

1. 재현
   - 정확히 어떤 조작에서 발생하는가?
   - 100% 재현되는가, 일부만 재현되는가?
   - 재현되지 않으면 일단 멈추고 더 많은 정보 수집

2. 가설
   - "X가 원인일 것이다" — 1개 가설부터
   - 너무 많은 가설은 검증 비용 폭발

3. 실험
   - 가설을 확인하는 최소 실험 설계
   - console.log·breakpoint·테스트 케이스

4. 검증
   - 실험 결과가 가설을 지지/반박하는가?
   - 가설 기각 시 2번으로

5. 수정·재현 시도
   - 진짜 원인이 맞다면 수정
   - 수정 후 재현되지 않으면 종결` } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "console.log 너무 많이 써요" — 학습 단계는 OK. 익숙해지면 브레이크포인트가 더 효율적. Sources 탭에서 줄 번호 클릭.',
        'Q. "Lighthouse 90+ 받기 어려워요" — 이미지 최적화·코드 스플리팅·폰트 preload·CDN. 90+는 진짜 빠른 사이트의 기준.',
        'Q. "에러가 production에서만 나요" — Sentry 같은 에러 모니터링 도입. 무료 플랜으로 시작 가능.',
        'Q. "useMemo·useCallback 언제 쓰나요?" — Profiler로 측정 후 적용. 조기 최적화는 코드만 복잡하게.',
        'Q. "테스트 코드를 꼭 써야 하나요?" — 본 4주에서는 필수 아님. 다만 핵심 비즈니스 로직(LLM 호출 함수 등) 1~2개는 Vitest로 작성 권장.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. Network 탭에서 1초 이상 걸리는 호출을 식별하는 방법은?',
        '2. React DevTools의 Highlight updates 옵션은 무엇을 시각화하는가?',
        '3. Lighthouse Performance 점수의 핵심 지표 1개를 답하시오.',
        '4. "Maximum update depth exceeded" 에러의 원인은?',
        '5. AI 리뷰를 100% 신뢰하면 안 되는 이유는?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) Time 컬럼 정렬 + 시간 기준 필터  2) 리렌더가 발생한 컴포넌트 영역  3) LCP·FID·CLS 중 하나 (Core Web Vitals)  4) setState가 무한 루프 — useEffect 의존성 또는 조건 점검  5) 환각·잘못된 지적이 30~50% 섞임 → 본인이 판단 필요' } },

      { subtitle: '참고 자료' },
      { items: [
        'Chrome DevTools: developer.chrome.com/docs/devtools',
        'React DevTools: react.dev/learn/react-developer-tools',
        'Lighthouse: developer.chrome.com/docs/lighthouse',
        'Web.dev: web.dev/learn (성능·접근성 학습)',
        '도서: 『도메인 주도 설계 시작하기』 최범균 (이후 단계)',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        'Network 탭으로 우리 프로젝트의 모든 API 호출 점검 + 1초 이상 호출 1개 이상 개선',
        'React DevTools Profiler로 5초 녹화 → 리렌더 원인 1개 발견 + 수정',
        'Lighthouse 실행 → 4지표 80점 이상 달성',
        'AI 리뷰로 핵심 컴포넌트 1개 점검 + 진짜 문제 1개 이상 개선',
        '5단계 디버깅 멘탈 모델로 실제 버그 1개 해결 + 과정 기록',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 12에서는 배포. GitHub Pages·CNAME·발표 자료 8슬라이드 구성까지 — 외부에 공개할 준비를 완성합니다.' },
    ],
    subSections: [
      {
        id: 'reg-11-devtools',
        title: 'Chrome DevTools 완전 정복',
        icon: '🔍',
        summary: 'Elements·Console·Sources·Network·Performance·Application 6대 탭 + 50개 핵심 기능 마스터.',
        content: [
          { subtitle: 'DevTools 6대 탭' },
          { table: {
            headers: ['탭', '핵심 용도', '단축키'],
            rows: [
              ['Elements', 'DOM·CSS 검사·수정', 'Cmd/Ctrl+Shift+C'],
              ['Console', '로그·즉시 실행·에러', 'Cmd/Ctrl+Opt+J'],
              ['Sources', '디버깅·브레이크포인트', 'Cmd/Ctrl+Opt+I → S'],
              ['Network', 'HTTP 요청·응답', 'Cmd/Ctrl+Opt+I → N'],
              ['Performance', '성능 프로파일링', 'Cmd/Ctrl+Opt+I → P'],
              ['Application', '저장소·쿠키·서비스 워커', 'Cmd/Ctrl+Opt+I → A'],
            ],
          } },

          { subtitle: 'Elements 탭 — 핵심 기능 10개' },
          { items: [
            'Cmd+Shift+C → 화면 요소 클릭 → DOM 위치 점프',
            '요소 우클릭 → "Edit as HTML" 즉석 수정',
            'Styles 탭 → CSS 즉시 변경 (저장 안 됨, 실험용)',
            ':hov 버튼 → :hover·:focus 상태 강제',
            'Computed 탭 → 최종 적용된 CSS 값',
            'Box Model 시각화 (오른쪽 패널 하단)',
            'flex/grid 배지 클릭 → 시각화',
            '$0 → 현재 선택 요소 (Console에서)',
            '클래스명 위에 V 박스 → 활성/비활성 토글',
            '"Break on..." → DOM 변경 시 자동 중단',
          ] },

          { subtitle: 'Console 탭 — 강력한 디버깅' },
          { code: { lang: 'javascript', content: `// 기본
console.log('값:', value);
console.error('에러:', err);
console.warn('경고:', issue);
console.table(users);              // 표 형태 (배열·객체에 최강)

// 그룹화
console.group('API 호출');
console.log('URL:', url);
console.log('응답:', data);
console.groupEnd();

// 시간 측정
console.time('fetch-users');
await fetch('/api/users');
console.timeEnd('fetch-users');    // → "fetch-users: 234ms"

// 트레이스
console.trace('호출 경로');

// 조건부 로그
console.assert(user.age > 0, '나이는 양수여야 함');

// 스타일링 (재미)
console.log('%c큰 글자', 'font-size: 32px; color: red;');

// DevTools에서만 — copy()
copy(JSON.stringify(data));        // 클립보드로

// 즉석 실행
$0.style.background = 'red';        // 선택 요소 색 변경
$$('button')                        // querySelectorAll
$('h1')                             // querySelector` } },

          { subtitle: 'Sources 탭 — 브레이크포인트 디버깅' },
          { items: [
            'Cmd+P → 파일 빠른 열기',
            '줄 번호 클릭 → 브레이크포인트',
            'F8 (또는 ▶) → 다음 브레이크까지 실행',
            'F10 → Step Over (다음 줄)',
            'F11 → Step Into (함수 안으로)',
            'Shift+F11 → Step Out (함수 밖으로)',
            '우측 Scope → 현재 변수 값 확인',
            '우측 Watch → 특정 식 모니터링',
            '우측 Call Stack → 호출 경로',
            '조건부 브레이크포인트 — 줄 번호 우클릭',
          ] },

          { subtitle: 'Network 탭 — API 디버깅 마스터' },
          { code: { lang: 'text', content: `[필터]
- Fetch/XHR     → API만
- Img·CSS·JS    → 리소스 타입별
- 검색창에 url   → 특정 URL만
- has-response-header:cache-control → 헤더 조건

[컬럼 활용]
- Name      → URL
- Status    → 200/404/500 등
- Type      → fetch/xhr/document
- Initiator → 누가 호출했나 (스택트레이스)
- Size      → 전송 크기
- Time      → 응답 시간
- Waterfall → 시간 흐름 시각화

[디버깅]
- 응답 → Preview 탭 → JSON 시각화
- 응답 → Response 탭 → raw 본문
- 요청 → Headers 탭 → Request/Response headers
- 우클릭 → "Copy as cURL" → 터미널에 붙여넣어 재현
- 우클릭 → "Save all as HAR" → 분석 공유

[Throttling]
- 우상단 dropdown → Slow 3G / Fast 3G
- 느린 네트워크 시뮬레이션 → 로딩 UI 검증` } },

          { subtitle: 'Performance 탭 — 프로파일링' },
          { items: [
            '⚪ 녹화 시작 → 사용자 액션 → 정지',
            'Main thread → 어떤 함수가 오래 걸렸나',
            'Network → 동시에 어떤 요청이 일어났나',
            'Frames → 60fps 기준 (16.67ms/frame)',
            '빨간 막대 = Long Task (50ms 이상)',
            '"Bottom-Up" → 가장 느린 함수 톱',
            '"Call Tree" → 호출 트리',
          ] },

          { subtitle: 'Application 탭 — 저장소 검사' },
          { items: [
            'Cookies → 도메인별 쿠키 보기/삭제',
            'Local Storage → key-value 검사',
            'Session Storage → 세션 단위',
            'IndexedDB → 큰 데이터 저장소',
            'Service Workers → PWA 캐시',
            'Manifest → PWA 설정',
            'Clear storage → 모든 데이터 초기화 (테스트용)',
          ] },

          { subtitle: '실습' },
          { items: [
            '본인 프로젝트에서 1초 이상 걸리는 API 호출 찾기',
            'Performance 녹화 → 가장 느린 함수 1개 식별',
            'Sources에서 브레이크포인트로 변수 값 추적',
            'Throttling으로 Slow 3G 시뮬레이션 → 로딩 UI 검증',
            'console.table로 사용자 목록 시각화',
          ] },
        ],
      },

      {
        id: 'reg-11-react-devtools',
        title: 'React DevTools — 컴포넌트 디버깅',
        icon: '⚛️',
        summary: 'React 전용 DevTools로 컴포넌트 트리·Props·State·리렌더 원인을 정밀 추적.',
        content: [
          { subtitle: '설치' },
          { items: [
            'Chrome 웹 스토어에서 "React Developer Tools" 검색·설치',
            '설치 후 DevTools 열면 Components·Profiler 탭 추가됨',
            '개발 모드에서만 표시 (production은 자동 숨김)',
          ] },

          { subtitle: 'Components 탭' },
          { items: [
            '컴포넌트 트리 — 전체 React 트리 탐색',
            '검색 — 컴포넌트 이름으로 빠르게 찾기',
            '선택 컴포넌트의 props·state·hooks 즉시 표시',
            '우측 패널 → props 값 더블클릭 → 즉석 수정 (UI 변화 즉시)',
            '"⚙️" → 옵션 → "Highlight updates when components render" 켜기',
            '→ 리렌더 발생 시 화면 영역 표시 (성능 디버깅 강력)',
          ] },

          { subtitle: 'Profiler 탭 — 성능 분석' },
          { items: [
            '⚪ 녹화 시작',
            '사용자 액션 수행 (클릭·입력)',
            '⏹ 정지',
            'Ranked → 가장 오래 걸린 컴포넌트',
            'Flame Graph → 시각적 트리',
            '특정 commit 선택 → 어떤 컴포넌트가 리렌더 됐는지',
            '"Why did this render?" — 원인 표시 (props 변경 등)',
          ] },

          { subtitle: '리렌더 원인 분석 5가지' },
          { table: {
            headers: ['원인', '해결'],
            rows: [
              ['Hooks changed', 'state·context 변경 — 의도된 경우 OK'],
              ['Props changed', '특정 prop 변경 — useMemo 검토'],
              ['Parent re-rendered', '부모가 리렌더 → 자식도 — React.memo'],
              ['Context changed', 'Context value 변경 — useMemo로 안정화'],
              ['Hooks order changed', '⚠️ 버그 — Hook을 조건 안에서 호출'],
            ],
          } },

          { subtitle: 'React.memo로 최적화' },
          { code: { lang: 'tsx', content: `// 부모 리렌더에도 props 변경 없으면 리렌더 안 함
const UserCard = React.memo(function UserCard({ user, onClick }) {
  return (
    <div onClick={onClick}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// 주의: onClick이 매번 새 함수면 효과 없음 → useCallback 필요
function UserList({ users }) {
  // ❌ 매번 새 함수
  const handleClick = (id: number) => { /* ... */ };

  // ✅ useCallback
  const handleClick = useCallback((id: number) => { /* ... */ }, []);

  return users.map(u => <UserCard user={u} onClick={handleClick} />);
}` } },

          { subtitle: 'useMemo로 비용 큰 계산 최적화' },
          { code: { lang: 'tsx', content: `function ExpensiveList({ items, keyword }) {
  // ❌ 매 렌더마다 필터+정렬
  const filtered = items.filter(i => i.name.includes(keyword)).sort(...);

  // ✅ items·keyword 변경 시에만 재계산
  const filtered = useMemo(() => {
    return items.filter(i => i.name.includes(keyword)).sort(...);
  }, [items, keyword]);

  return filtered.map(...);
}` } },
          { callout: { type: 'tip', text: '⚠️ 조기 최적화는 함정. Profiler로 진짜 느린 곳 측정 후 적용. memo·useMemo·useCallback은 자체 비용도 있음.' } },

          { subtitle: '실습' },
          { items: [
            '본인 프로젝트에서 Highlight updates 켜고 클릭 → 어디가 리렌더',
            'Profiler로 5초 녹화 → 최장 commit 분석',
            '불필요한 리렌더 1개 발견 → React.memo·useMemo로 해결',
            '"Why did this render?" 활용해 원인 명시',
          ] },
        ],
      },

      {
        id: 'reg-11-lighthouse',
        title: 'Lighthouse — 4지표 최적화',
        icon: '🏆',
        summary: 'Performance·Accessibility·Best Practices·SEO 4지표를 모두 90+로 끌어올리는 실전 가이드.',
        content: [
          { subtitle: 'Lighthouse 4지표' },
          { table: {
            headers: ['지표', '의미', '목표', '주요 영향'],
            rows: [
              ['Performance', '로딩·인터랙션 속도', '90+', 'LCP·FID·CLS'],
              ['Accessibility', '접근성·시맨틱', '95+', 'alt·대비·키보드'],
              ['Best Practices', '보안·표준 준수', '95+', 'HTTPS·취약점'],
              ['SEO', '검색엔진 최적화', '95+', 'meta·title'],
            ],
          } },

          { subtitle: 'Core Web Vitals' },
          { table: {
            headers: ['지표', '의미', '좋음 기준'],
            rows: [
              ['LCP', 'Largest Contentful Paint — 가장 큰 콘텐츠 표시', '< 2.5s'],
              ['INP', 'Interaction to Next Paint — 클릭 반응', '< 200ms'],
              ['CLS', 'Cumulative Layout Shift — 레이아웃 흔들림', '< 0.1'],
              ['FCP', 'First Contentful Paint — 첫 콘텐츠', '< 1.8s'],
              ['TTFB', 'Time to First Byte — 서버 응답', '< 800ms'],
            ],
          } },

          { subtitle: 'Performance 개선 10가지' },
          { items: [
            '이미지 최적화 — WebP/AVIF, 적정 크기, lazy loading',
            '코드 스플리팅 — React.lazy + Suspense',
            'CSS 최적화 — Critical CSS 인라인',
            '폰트 — font-display: swap, preload',
            'JavaScript 압축·tree shaking (Vite 자동)',
            'CDN — 정적 자산 분산',
            'gzip·brotli 압축',
            '서비스 워커 캐싱',
            '서드파티 스크립트 줄이기 (Google Analytics 등)',
            '서버 응답 시간 — DB 쿼리 최적화',
          ] },

          { subtitle: '이미지 최적화 코드' },
          { code: { lang: 'html', content: `<!-- lazy loading -->
<img src="hero.jpg" loading="lazy" alt="..." />

<!-- 적정 크기 (srcset) -->
<img
  src="hero-1024.webp"
  srcset="hero-640.webp 640w, hero-1024.webp 1024w, hero-1920.webp 1920w"
  sizes="(max-width: 768px) 100vw, 1024px"
  alt="..."
/>

<!-- WebP + JPG 폴백 -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="...">
</picture>` } },

          { subtitle: '폰트 최적화' },
          { code: { lang: 'html', content: `<head>
  <!-- preconnect — DNS·TCP·TLS 미리 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- preload — 가장 중요한 폰트만 -->
  <link rel="preload" href="/fonts/Pretendard.woff2" as="font" type="font/woff2" crossorigin>

  <!-- swap — 폰트 로딩 중에도 텍스트 즉시 표시 -->
  <style>
    @font-face {
      font-family: 'Pretendard';
      src: url('/fonts/Pretendard.woff2') format('woff2');
      font-display: swap;
    }
  </style>
</head>` } },

          { subtitle: 'Accessibility 95+' },
          { items: [
            '모든 <img>에 alt 속성',
            '<button>·<a>의 의미 있는 텍스트 (또는 aria-label)',
            '폼 <input>에 <label> 연결',
            '제목 계층 (h1 → h2 → h3) 순서대로',
            '키보드 Tab으로 모든 요소 접근',
            '포커스 표시 명확 (outline 없애지 말 것)',
            '색 대비 4.5:1 이상 (WebAIM Contrast Checker)',
            '동영상에 자막',
            'aria-* 적재적소',
          ] },

          { subtitle: 'SEO 95+' },
          { code: { lang: 'html', content: `<head>
  <title>페이지 제목 (50자 이내)</title>
  <meta name="description" content="페이지 요약 160자 이내">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Open Graph -->
  <meta property="og:title" content="제목">
  <meta property="og:description" content="요약">
  <meta property="og:image" content="https://example.com/og.png">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:type" content="website">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://example.com/page">

  <!-- robots.txt + sitemap.xml -->
</head>` } },

          { subtitle: 'Best Practices' },
          { items: [
            'HTTPS 강제',
            '취약 라이브러리 제거 (npm audit)',
            'console.error 없음 (production에서)',
            'document.write 사용 금지',
            'image aspect ratio 명시 (CLS 방지)',
            '대비·줄간격 검사',
          ] },

          { subtitle: '실행 방법' },
          { code: { lang: 'bash', content: `# 방법 1: Chrome DevTools
# DevTools → Lighthouse 탭 → "Analyze page load"

# 방법 2: CLI
npm install -g lighthouse
lighthouse https://rest.dreamitbiz.com --view --preset=desktop

# 방법 3: PageSpeed Insights (Google)
# pagespeed.web.dev — 실제 사용자 데이터(CrUX) 포함` } },

          { subtitle: '실습' },
          { items: [
            'Lighthouse 실행 → 4지표 현재 점수 기록',
            '가장 낮은 지표 1개 → 상위 3개 개선점 적용',
            '재측정 → 5점 이상 개선 확인',
            'Mobile 모드 + Desktop 모드 둘 다 측정',
            '최종 목표 — 4지표 모두 90+ (Performance는 80+도 OK)',
          ] },
        ],
      },

      {
        id: 'reg-11-debug',
        title: '디버깅 멘탈 모델 + 흔한 에러',
        icon: '🐛',
        summary: '과학적 디버깅 5단계 + 자주 발생하는 React·JS·Supabase 에러 20종 카탈로그.',
        content: [
          { subtitle: '과학적 디버깅 5단계' },
          { code: { lang: 'text', content: `1. 재현 (Reproduce)
   - 정확히 어떤 조작 → 어떤 결과?
   - 100% vs 가끔?
   - 재현 안 되면 → 더 많은 정보 수집

2. 가설 (Hypothesis)
   - "X가 원인일 것이다" — 1개 가설부터
   - 가설은 단순할수록 좋음

3. 실험 (Experiment)
   - 가설을 검증하는 최소 변경
   - console.log·breakpoint·테스트

4. 검증 (Verify)
   - 결과가 가설과 일치?
   - 일치 → 진짜 원인 / 불일치 → 2단계로

5. 수정 + 회귀 (Fix + Regression)
   - 수정 적용
   - 동일 시나리오 재현 안 됨 확인
   - 다른 부분 영향 없는지 확인` } },

          { subtitle: '에러 메시지 읽는 법' },
          { code: { lang: 'text', content: `TypeError: Cannot read properties of undefined (reading 'map')
   at UserList (src/pages/UserList.tsx:23:18)
   at renderWithHooks (...)

[파싱]
- 에러 종류:  TypeError (타입 오류)
- 메시지:     undefined의 .map을 읽을 수 없음
- 위치:       UserList 컴포넌트의 23번째 줄, 18번째 글자
- 스택:       어떤 흐름으로 도달했나

[디버깅 순서]
1. 23번째 줄 코드 확인 (users.map(...))
2. users가 undefined인 이유? (fetch 실패? 초기값 누락?)
3. 원인 수정 (?. 또는 || [] 또는 useState 초기값)` } },

          { subtitle: '자주 발생하는 React 에러 12종' },
          { table: {
            headers: ['#', '에러', '원인', '해결'],
            rows: [
              ['1', 'Each child should have a unique "key"', 'map 시 key 누락', 'key={item.id}'],
              ['2', 'Rendered fewer hooks than expected', 'Hook을 조건 안', '최상단으로 이동'],
              ['3', 'Cannot read properties of undefined', '데이터 도착 전 접근', '?. 옵셔널 체이닝'],
              ['4', 'Maximum update depth exceeded', '무한 setState', '의존성·조건 점검'],
              ['5', 'Can\'t perform state update on unmounted', 'unmount 후 setState', 'cleanup·AbortController'],
              ['6', 'Function is not a function', '함수 호출 오류', '값 vs 함수 확인'],
              ['7', 'Hydration mismatch', 'SSR/CSR 불일치', '동일 HTML 보장'],
              ['8', 'Cannot read properties of null', 'ref·DOM 접근 시점', 'useEffect 안에서'],
              ['9', 'Objects are not valid as React child', 'JSX에 객체 직접 렌더', 'JSON.stringify 또는 분해'],
              ['10', 'A component is changing controlled to uncontrolled', 'value undefined ↔ string', '항상 string'],
              ['11', 'Warning: setState called during render', '렌더 중 setState', 'useEffect로 이동'],
              ['12', 'Hooks can only be called inside function', 'class·일반 함수에서 호출', '함수형 컴포넌트만'],
            ],
          } },

          { subtitle: 'Supabase 에러 5종' },
          { table: {
            headers: ['에러', '원인', '해결'],
            rows: [
              ['new row violates row-level security', 'RLS 정책 없음·미충족', 'INSERT 정책 + WITH CHECK'],
              ['JWT expired', '토큰 만료', 'refresh 또는 재로그인'],
              ['relation does not exist', '테이블명 오타', '정확히 확인'],
              ['permission denied for table', 'anon에 권한 없음', 'RLS 정책 + grant'],
              ['Failed to fetch', '환경변수 누락', '.env.local 확인 + dev 재시작'],
            ],
          } },

          { subtitle: 'AI에게 에러 도움 요청 양식' },
          { code: { lang: 'text', content: `[에러 발생 상황]
[버튼 클릭 시점 / 페이지 로드 시점 등]

[정확한 에러 메시지]
\`\`\`
TypeError: Cannot read properties of undefined (reading 'name')
    at UserCard (UserCard.tsx:15:22)
\`\`\`

[관련 코드]
\`\`\`tsx
function UserCard({ user }) {
  return <h3>{user.name}</h3>;  // ← 여기
}

// 사용
<UserCard user={users[0]} />
\`\`\`

[이미 시도한 것]
- users가 빈 배열일 때 발생 확인
- useState 초기값을 빈 배열로 → 동일 에러

[질문]
가장 단순하고 안전한 해결 방법은?

[기대 답변 예시]
- 옵셔널 체이닝 user?.name
- 조건부 렌더 if (!user) return null
- 어느 쪽이 더 React스러운가?` } },

          { subtitle: '실습' },
          { items: [
            '의도적으로 5개 에러 만들기 (key 누락·useState 초기값 누락 등)',
            '각 에러 메시지를 정확히 읽고 위치 식별',
            '5단계 디버깅 모델 적용해 해결',
            '해결 과정을 학습 노트에 기록',
            'AI에게 위 양식대로 도움 요청 → 답변 검증',
          ] },
        ],
      },

      {
        id: 'reg-11-testing',
        title: '단위 테스트 입문 — Vitest',
        icon: '🧪',
        summary: '본 과정에서는 필수 아니지만 핵심 함수 1~2개 테스트는 적극 권장. Vitest + Testing Library로 빠르게 시작.',
        content: [
          { subtitle: '왜 테스트인가' },
          { items: [
            '리팩토링 두려움 제거 — 변경 후 안전 확인',
            '회귀 버그 방지 — 이전에 고친 버그가 다시 발생 X',
            '문서화 효과 — 테스트가 곧 사용 예제',
            'AI 코드 검증 — AI가 짠 함수가 정말 동작하는가',
          ] },

          { subtitle: '셋업' },
          { code: { lang: 'bash', content: `# Vite 프로젝트
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# vite.config.ts에 추가
/// <reference types="vitest" />
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});

# src/test/setup.ts
import '@testing-library/jest-dom';

# package.json
"test": "vitest",
"test:ui": "vitest --ui"` } },

          { subtitle: '함수 단위 테스트' },
          { code: { lang: 'typescript', content: `// src/utils/formatPrice.ts
export function formatPrice(amount: number, currency = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
  }).format(amount);
}

// src/utils/formatPrice.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('기본 한국 원화 형식', () => {
    expect(formatPrice(1000)).toBe('₩1,000');
  });

  it('USD 형식', () => {
    expect(formatPrice(1000, 'USD')).toContain('$1,000');
  });

  it('0원 처리', () => {
    expect(formatPrice(0)).toBe('₩0');
  });

  it('음수 처리', () => {
    expect(formatPrice(-500)).toContain('-');
  });
});

# 실행
npm test` } },

          { subtitle: '컴포넌트 테스트' },
          { code: { lang: 'tsx', content: `// src/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('자식 텍스트를 렌더링한다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByText('저장')).toBeInTheDocument();
  });

  it('클릭 시 onClick 호출', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByText('클릭'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 시 클릭 안 됨', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>클릭</Button>);
    fireEvent.click(screen.getByText('클릭'));
    expect(onClick).not.toHaveBeenCalled();
  });
});` } },

          { subtitle: 'Hook 테스트' },
          { code: { lang: 'typescript', content: `// useFetch.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test' }),
    });
  });

  it('데이터 fetch 성공', async () => {
    const { result } = renderHook(() => useFetch('/api/user'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ id: 1, name: 'Test' });
    });
  });
});` } },

          { subtitle: '본 강의 권장 — 최소 테스트' },
          { items: [
            'LLM 호출 함수 — 모킹 + 응답 파싱 검증',
            '비용 계산 함수 — 다양한 입력으로',
            '폼 검증 함수 (Zod) — 유효/무효 케이스',
            '복잡한 비즈니스 로직 (있다면)',
          ] },
          { callout: { type: 'tip', text: '본 4주 과정은 테스트가 필수 아닙니다. 다만 핵심 함수 2~3개라도 테스트하면 발표 시 "테스트 커버리지가 있습니다"라는 강력한 어필이 됩니다.' } },

          { subtitle: '실습 (선택)' },
          { items: [
            'Vitest 셋업',
            'formatPrice·formatDate 등 단순 함수 테스트',
            'Button 컴포넌트 클릭 이벤트 테스트',
            '본인 핵심 함수 1개 테스트 추가',
          ] },
        ],
      },

      {
        id: 'reg-11-practice-1',
        title: '실습 1 · Network 탭으로 느린 API 찾기 (25분)',
        icon: '🧪',
        summary: '본인 프로젝트의 모든 API 호출 점검 + 1초 이상 호출 식별 + 개선.',
        content: [
          { subtitle: '단계' },
          { items: [
            '1. 본인 프로젝트 dev 서버 실행',
            '2. DevTools → Network 탭 → Fetch/XHR 필터',
            '3. 핵심 시나리오 1회 수행 (가입·로그인·진단 등)',
            '4. Time 컬럼 정렬 → 1초 이상 호출 찾기',
            '5. 해당 호출 우클릭 → "Copy as cURL"로 재현',
            '6. 원인 파악 + 개선',
          ] },

          { subtitle: '느린 호출 원인 5가지' },
          { items: [
            'DB 쿼리 미인덱싱 → 인덱스 추가',
            '관계 조인 N+1 → 한 번에 select(\'*, related(*)\')',
            'LLM 응답 길이 → max_tokens 줄이기',
            '이미지 큰 용량 → 압축 + transform',
            '서드파티 스크립트 → defer/async',
          ] },

          { subtitle: '개선 결과 기록' },
          { table: {
            headers: ['API', 'Before', 'After', '개선'],
            rows: [
              ['/api/users (전체)', '2.3s', '0.4s', '인덱스 추가'],
              ['/api/posts/:id', '1.8s', '0.6s', '관계 조인'],
              ['LLM 호출', '5s', '5s', '스트리밍 도입'],
            ],
          } },
        ],
      },

      {
        id: 'reg-11-practice-2',
        title: '실습 2 · React DevTools Profiler 분석 (25분)',
        icon: '🧪',
        summary: '리렌더 원인 추적 + React.memo·useMemo로 최적화.',
        content: [
          { subtitle: '단계' },
          { items: [
            'React DevTools 설치 (Chrome 확장)',
            'Components 탭 → "Highlight updates" 옵션 켜기',
            '본인 페이지에서 입력·클릭 → 어디가 리렌더?',
            'Profiler 탭 → ⚪ 녹화 → 5초 사용자 액션 → 정지',
            'Ranked → 가장 오래 걸린 컴포넌트',
            '"Why did this render?" 원인 확인',
          ] },

          { subtitle: '대표 최적화 패턴' },
          { code: { lang: 'tsx', content: `// Before — UserCard가 부모 리렌더 시 매번 리렌더
function UserCard({ user, onClick }) { ... }

// After — props 변경 시에만 리렌더
const UserCard = React.memo(function UserCard({ user, onClick }) {
  return <div onClick={onClick}>{user.name}</div>;
});

// 주의: onClick이 매번 새 함수면 효과 없음 → useCallback 필요
function UserList({ users }) {
  const handleClick = useCallback((id: number) => { /* ... */ }, []);
  return users.map(u => <UserCard key={u.id} user={u} onClick={handleClick} />);
}

// useMemo — 비싼 계산
const filtered = useMemo(
  () => users.filter(u => u.name.includes(keyword)).sort(...),
  [users, keyword]
);` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ Highlight updates로 시각화',
            '☐ 1개 이상 불필요한 리렌더 발견',
            '☐ React.memo 또는 useMemo로 해결',
            '☐ 개선 후 다시 측정 → 50%+ 개선',
            '☐ 학습 노트에 Before/After 기록',
          ] },
        ],
      },

      {
        id: 'reg-11-practice-3',
        title: '실습 3 · Lighthouse 4지표 90+ 도전 (30분)',
        icon: '🧪',
        summary: '모든 4지표를 90+로 끌어올리는 실전 개선 작업.',
        content: [
          { subtitle: '측정' },
          { code: { lang: 'bash', content: `npm run build && npm run preview
# Chrome DevTools → Lighthouse → Mobile → Analyze` } },

          { subtitle: '개선 카탈로그' },
          { table: {
            headers: ['문제', '개선'],
            rows: [
              ['이미지 큼', 'srcset + WebP + lazy loading'],
              ['LCP 느림', 'preload + 인라인 critical CSS'],
              ['CLS 발생', '이미지 width·height 명시'],
              ['alt 누락', '모든 <img>에 alt 추가'],
              ['색 대비 부족', 'WebAIM 도구로 4.5:1 확보'],
              ['HTTPS 미강제', 'GitHub Pages Enforce HTTPS'],
              ['SEO meta 부족', 'description·OG·canonical'],
            ],
          } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ Performance 80+ (모바일)',
            '☐ Accessibility 95+',
            '☐ Best Practices 95+',
            '☐ SEO 95+',
            '☐ 개선 사이클 — 측정 → 개선 → 재측정',
          ] },
        ],
      },

      {
        id: 'reg-11-practice-4',
        title: '실습 4 · 디버깅 5단계 모델 적용 (30분)',
        icon: '🧪',
        summary: '실제 버그를 과학적 디버깅 5단계로 해결하는 실전.',
        content: [
          { subtitle: '본인 프로젝트에서 진짜 버그 1개 발견 → 해결 과정 기록' },
          { code: { lang: 'text', content: `[디버깅 기록 양식]

[버그 명]
예: "로그인 후 새로고침하면 로그아웃됨"

[1단계 · 재현 (5분)]
- 정확한 단계:
  1. 로그인 화면 → 이메일·비밀번호 입력
  2. "로그인" 클릭 → /dashboard 이동
  3. F5 새로고침
  4. → 로그인 페이지로 자동 이동
- 재현률: 100%
- 발견 환경: Chrome 120, Mac

[2단계 · 가설]
가설 1: Supabase 세션 저장 안 됨
가설 2: AuthContext가 mount 시 세션 복원 안 함
가설 3: localStorage 차단

→ 가장 단순한 1번부터 검증

[3단계 · 실험]
- 새로고침 후 DevTools Console에서:
  await supabase.auth.getSession()
- 결과: { data: { session: { ... } } }
- → 세션은 저장됨! 1번 가설 기각

- 가설 2 검증:
- AuthContext.tsx 코드 확인
- → useEffect에서 getSession 호출 누락 발견

[4단계 · 검증]
useEffect 추가:
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setUser(data.session?.user));
}, []);

새로고침 → 로그인 유지 ✓

[5단계 · 회귀 시도]
- 다른 페이지에서도 로그인 유지 확인
- 로그아웃 → 새로고침 → 로그인 페이지 정상 표시
- → 부작용 없음, 종결` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 진짜 버그 1개 발견',
            '☐ 5단계 모두 적용',
            '☐ 가설 → 실험 → 검증 사이클',
            '☐ 회귀 테스트 포함',
            '☐ 학습 노트에 양식 그대로 기록',
          ] },
        ],
      },

      {
        id: 'reg-11-practice-5',
        title: '실습 5 · Vitest로 핵심 함수 테스트 (35분)',
        icon: '🧪',
        summary: 'Vitest 셋업 + LLM 호출 함수·폼 검증·유틸 함수에 단위 테스트 작성.',
        content: [
          { subtitle: '셋업' },
          { code: { lang: 'bash', content: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# vite.config.ts
/// <reference types="vitest" />
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});

# src/test/setup.ts
import '@testing-library/jest-dom';

# package.json
"test": "vitest"` } },

          { subtitle: '테스트 1 · 유틸 함수' },
          { code: { lang: 'typescript', content: `// src/utils/formatPrice.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('한국 원화 형식', () => {
    expect(formatPrice(1000)).toBe('₩1,000');
  });
  it('0원', () => {
    expect(formatPrice(0)).toBe('₩0');
  });
  it('음수', () => {
    expect(formatPrice(-500)).toContain('-');
  });
  it('소수점 처리', () => {
    expect(formatPrice(1000.5)).toBe('₩1,001');
  });
});` } },

          { subtitle: '테스트 2 · LLM 함수 (모킹)' },
          { code: { lang: 'typescript', content: `// src/utils/solar.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatSolar } from './solar';

describe('chatSolar', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it('정상 응답 파싱', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '안녕' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    });

    const result = await chatSolar([{ role: 'user', content: '안녕' }]);
    expect(result.content).toBe('안녕');
    expect(result.usage.total_tokens).toBe(15);
  });

  it('401 응답 시 에러', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    });

    await expect(chatSolar([{ role: 'user', content: '' }])).rejects.toThrow('HTTP 401');
  });
});` } },

          { subtitle: '테스트 3 · 컴포넌트' },
          { code: { lang: 'tsx', content: `// src/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('자식 렌더링', () => {
    render(<Button>저장</Button>);
    expect(screen.getByText('저장')).toBeInTheDocument();
  });

  it('클릭 시 onClick 호출', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByText('클릭'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 시 클릭 무시', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>클릭</Button>);
    fireEvent.click(screen.getByText('클릭'));
    expect(onClick).not.toHaveBeenCalled();
  });
});` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ Vitest 셋업 + npm test 실행',
            '☐ 3개 이상 함수 테스트',
            '☐ Mock 사용 (fetch 등)',
            '☐ Component 1개 이상 테스트',
            '☐ 모든 테스트 통과',
          ] },
        ],
      },

      {
        id: 'reg-11-practice-6',
        title: '실습 6 · ErrorBoundary 안전망 (20분)',
        icon: '🧪',
        summary: '예상치 못한 에러로 화면 깨짐 방지하는 표준 안전망.',
        content: [
          { subtitle: 'ErrorBoundary 컴포넌트' },
          { code: { lang: 'tsx', content: `// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, info);
    // Sentry 등 에러 추적 서비스
    // captureException(error, { extra: info });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="error-boundary">
          <h1>⚠️ 문제가 발생했습니다</h1>
          <p>{this.state.error.message}</p>
          <button onClick={this.reset}>다시 시도</button>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      );
    }

    return this.props.children;
  }
}` } },

          { subtitle: '적용' },
          { code: { lang: 'tsx', content: `// src/App.tsx
<ErrorBoundary>
  <BrowserRouter>
    <Routes>...</Routes>
  </BrowserRouter>
</ErrorBoundary>

// 또는 특정 영역만
<ErrorBoundary fallback={(err, reset) => (
  <div>차트 로드 실패 — <button onClick={reset}>재시도</button></div>
)}>
  <HeavyChart />
</ErrorBoundary>` } },

          { subtitle: '검증' },
          { items: [
            '의도적으로 컴포넌트에서 throw new Error("test")',
            'ErrorBoundary가 에러 표시',
            '"다시 시도" 클릭 → reset 동작',
            'production에서 console.error 없이 우아하게 처리',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ ErrorBoundary 작성',
            '☐ App 최상위에 적용',
            '☐ fallback 커스터마이징',
            '☐ reset 기능 동작',
            '☐ 의도적 에러로 검증',
          ] },
        ],
      },

      {
        id: 'reg-11-resources',
        title: '심화 + 자가 평가',
        icon: '📚',
        summary: '디버깅·테스트 심화 자료 + Day 11 자가 평가 + 다음 단계.',
        content: [
          { subtitle: '심화 자료' },
          { items: [
            'Chrome DevTools: developer.chrome.com/docs/devtools',
            'React DevTools: react.dev/learn/react-developer-tools',
            'Lighthouse: developer.chrome.com/docs/lighthouse',
            'Web.dev Learn: web.dev/learn (Google 공식)',
            'Vitest: vitest.dev',
            'Testing Library: testing-library.com',
          ] },

          { subtitle: '심화 주제' },
          { items: [
            'Sentry — 프로덕션 에러 모니터링',
            'PostHog — 사용자 행동 분석',
            'Playwright — E2E 테스트',
            'MSW (Mock Service Worker) — API 모킹',
            'Web Vitals 측정 — 실 사용자 데이터',
          ] },

          { subtitle: 'Day 11 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['DevTools', 'console.log만', 'Network·Elements', '6탭 + Performance'],
              ['React DevTools', '없음', '컴포넌트 트리', 'Profiler + 최적화'],
              ['Lighthouse', '없음', '측정만', '4지표 90+ 달성'],
              ['디버깅', '에러 무시', '메시지 읽기', '5단계 모델 적용'],
              ['테스트', '없음', '1~2개 함수', '컴포넌트 + Hook 테스트'],
            ],
          } },
        ],
      },
    ],
  },

  {
    id: 'reg-12',
    title: 'Day 14 · 배포와 발표 준비',
    icon: '🚀',
    description: 'Vite 빌드·GitHub Pages 자동화·CNAME·base path 설정과 5~10분 발표 자료 8슬라이드 권장 구성을 마무리합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', 'Vite 빌드 + gh-pages 자동 배포', '첫 GitHub Pages 배포'],
          ['S2', '50분', 'CNAME 커스텀 도메인 + Vite base', '실제 도메인 접근'],
          ['S3', '50분', '배포 후 체크리스트 + SPA 404 해결', '모든 라우트 동작'],
          ['S4', '50분', '8슬라이드 발표 자료 작성', '슬라이드 v1 완성'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        'Vite 프로덕션 빌드 결과물을 이해한다',
        'gh-pages 패키지로 자동 배포를 설정한다',
        '커스텀 도메인(CNAME) + Vite base path를 설정한다',
        '5~10분 발표를 위한 8슬라이드 구성을 작성한다',
      ] },

      { subtitle: 'Vite 빌드 흐름' },
      { code: { lang: 'bash', content: `npm run build

# 동작
# 1) TypeScript 검사 (tsc -b)
# 2) Rollup으로 번들링 + 코드 스플리팅
# 3) Tree-shaking으로 미사용 코드 제거
# 4) Minify + 청크 분리 + 해시 추가
# 5) dist/ 폴더에 정적 산출물 출력

ls dist
# index.html, assets/ (JS/CSS/이미지)` } },

      { subtitle: 'gh-pages 자동화' },
      { code: { lang: 'json', content: `// package.json
{
  "scripts": {
    "dev":       "vite",
    "build":     "tsc -b && vite build",
    "preview":   "vite preview",
    "typecheck": "tsc -b",
    "predeploy": "npm run build",
    "deploy":    "gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.0"
  }
}` } },
      { code: { lang: 'bash', content: `# 1회 설치
npm install -D gh-pages

# 배포 (build → push 자동)
npm run deploy

# 결과
# - gh-pages 브랜치에 dist 내용 push
# - GitHub Settings → Pages → Branch: gh-pages 선택
# - 약 1~3분 후 https://<user>.github.io/<repo>/ 에서 접근 가능` } },

      { subtitle: '커스텀 도메인 — CNAME 파일' },
      { code: { lang: 'text', content: `// public/CNAME
rest.dreamitbiz.com` } },
      { items: [
        'public/CNAME 파일에 도메인 1줄 작성 (빌드 시 dist로 복사됨)',
        '도메인 등록업체의 DNS 설정 → CNAME 레코드: rest → <user>.github.io',
        'GitHub Settings → Pages → Custom domain 확인 + Enforce HTTPS',
        '약 5~30분 후 https://rest.dreamitbiz.com 정상 접근',
      ] },

      { subtitle: 'Vite base path 설정' },
      { text: '커스텀 도메인을 쓰면 base는 "/"가 맞지만, GitHub Pages 기본 URL(<user>.github.io/<repo>/)을 쓸 때는 "/<repo>/"로 지정해야 합니다.' },
      { code: { lang: 'typescript', content: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',                  // 커스텀 도메인 사용 시
  // base: '/repo-name/',     // GitHub 기본 URL 사용 시
});` } },
      { callout: { type: 'warn', text: 'base를 잘못 설정하면 모든 자산이 404 됩니다. 빈 화면이 뜨면 첫 의심: base 확인. 커스텀 도메인이면 반드시 "/".' } },

      { subtitle: '배포 후 체크리스트' },
      { items: [
        '✅ 메인 페이지가 정상 로드되는가',
        '✅ SPA 라우팅(/about 등)이 새로고침 시에도 동작하는가 (404.html 트릭)',
        '✅ API 호출이 production .env 키로 정상 동작하는가',
        '✅ 이미지·폰트 등 정적 자산이 모두 로드되는가',
        '✅ HTTPS 강제 + 인증서 정상 발급',
        '✅ Lighthouse 점수 production에서 측정',
      ] },

      { subtitle: '발표 자료 8슬라이드 권장 구성 (5~10분)' },
      { table: {
        headers: ['#', '슬라이드', '시간'],
        rows: [
          ['1', '타이틀 — 서비스명 + 한 줄 가치 제안 + 팀명', '30초'],
          ['2', '문제 — 누구의 어떤 문제 (페르소나·통계)', '1분'],
          ['3', '솔루션 — AI가 어떻게 해결하는가', '1분'],
          ['4', '핵심 기능 — 3~5개, 1줄씩', '1분'],
          ['5', '기술 스택 + 국내 LLM 활용', '1분'],
          ['6', '라이브 데모 (3분)', '3분'],
          ['7', '성과·지표·검증 결과', '1분'],
          ['8', '향후 계획 + Thank You + 연락처', '30초'],
        ],
      } },

      { subtitle: 'SPA 404 트릭 (GitHub Pages용)' },
      { code: { lang: 'html', content: `<!-- public/404.html — GitHub Pages는 404 시 이 파일을 서빙 -->
<!doctype html>
<html>
<head>
  <script>
    // 현재 경로를 쿼리로 변환해 index.html로 보내기
    var l = window.location;
    var path = l.pathname.slice(1).split('/').join('/');
    l.replace(l.protocol + '//' + l.host + '/?/' + path + l.search + l.hash);
  </script>
</head>
<body></body>
</html>` } },
      { code: { lang: 'html', content: `<!-- index.html에 추가 — 쿼리를 다시 경로로 복원 -->
<script>
  (function(l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?');
      window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
    }
  }(window.location));
</script>` } },
      { callout: { type: 'info', text: 'SPA는 클라이언트 라우팅이라 /about에서 새로고침하면 GitHub Pages가 about.html을 찾다 404. 위 트릭으로 모든 404를 index.html로 보내 React Router가 처리하게 합니다.' } },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "Vercel/Netlify와 비교해 GitHub Pages는?" — 정적만 가능(서버 없음), 무료, 커스텀 도메인 지원. SPA는 모두 OK. Edge Function이 필요하면 Vercel.',
        'Q. "배포 후 변경이 반영 안 돼요" — CDN 캐시. Ctrl+Shift+R(강력 새로고침) 또는 5~30분 대기.',
        'Q. "HTTPS는 자동인가요?" — GitHub Pages는 무료 HTTPS 제공. 커스텀 도메인도 자동 인증서.',
        'Q. "환경변수가 빌드에 안 들어가요" — VITE_ 접두사 + 빌드 시점에 .env.production 존재 필요.',
        'Q. "여러 사이트를 한 저장소에서?" — 권장 안 함. 1 repo = 1 site가 가장 단순. 모노레포는 학습 후.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. gh-pages 패키지가 배포하는 기본 브랜치명은?',
        '2. 커스텀 도메인을 위해 public 폴더에 둬야 하는 파일은?',
        '3. Vite base가 "/"이 아닌 경우는?',
        '4. SPA 404 문제를 해결하는 표준 파일명은?',
        '5. predeploy 스크립트의 역할은?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) gh-pages  2) CNAME (확장자 없음)  3) GitHub 기본 URL <user>.github.io/<repo>/ 사용 시 "/<repo>/"  4) public/404.html  5) deploy 직전 자동 실행되는 사전 작업 — 보통 npm run build' } },

      { subtitle: '참고 자료' },
      { items: [
        'gh-pages 패키지: github.com/tschaub/gh-pages',
        'Vite 배포 가이드: vite.dev/guide/static-deploy',
        'GitHub Pages: docs.github.com/ko/pages',
        '발표 디자인: Pitch.com, Canva (무료 템플릿)',
        '도메인 등록: 가비아·Cloudflare·Namecheap',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        'gh-pages로 팀 프로젝트 GitHub Pages 배포 성공',
        'CNAME + DNS 설정으로 커스텀 도메인 연결',
        '404.html 트릭으로 SPA 라우팅 새로고침 문제 해결',
        '배포 후 체크리스트 6개 모두 통과',
        '발표 자료 8슬라이드 1차 초안 + 데모 3분 시나리오 작성',
      ] },

      { subtitle: '다음 시간 예고' },
      { text: 'Day 13 — 마지막 날. 5~10분 발표·라이브 데모·피어 리뷰로 4주의 여정을 마무리하고, 경진대회 출품 준비를 완성합니다.' },
    ],
    subSections: [
      {
        id: 'reg-12-build',
        title: 'Vite 빌드 흐름 깊이 이해',
        icon: '🔨',
        summary: 'npm run build가 내부에서 무엇을 하는지, tree shaking·minify·청크 분리·해시까지 모든 단계 이해.',
        content: [
          { subtitle: '빌드 = 무엇을 하는가' },
          { code: { lang: 'text', content: `npm run build → "tsc -b && vite build"

1. TypeScript 검사 (tsc -b)
   - 모든 .ts/.tsx 타입 체크
   - 에러 1개라도 있으면 빌드 중단
   - 산출물 없음 (noEmit: true)

2. Vite 빌드 시작
   - Rollup으로 번들링
   - esbuild로 트랜스파일 (TS → JS)

3. Tree Shaking
   - 사용 안 하는 코드 제거
   - import 했지만 안 쓴 함수 제거
   - 결과: 최종 번들 크기 ↓

4. 코드 스플리팅
   - lazy import → 별도 청크
   - vendor 분리 (node_modules)
   - dynamic import → 추가 청크

5. Minify (Terser)
   - 변수명 축약 (a, b, c, ...)
   - 공백·줄바꿈 제거
   - 죽은 코드 (dead code) 제거

6. CSS 처리
   - PostCSS 통과
   - 압축
   - CSS 코드 스플리팅 (라우트별)

7. 자산 처리
   - 이미지·폰트 등 hash 부여
   - 절대 경로 변환
   - import.meta.env 치환

8. 출력
   - dist/index.html
   - dist/assets/*.js (해시 포함)
   - dist/assets/*.css

총 소요: 3~10초 (프로젝트 크기에 따라)` } },

          { subtitle: '빌드 산출물 분석' },
          { code: { lang: 'text', content: `dist/
├── index.html                          # 진입점
├── 404.html                            # SPA 라우팅용
├── CNAME                               # 커스텀 도메인
├── favicon.svg
└── assets/
    ├── index-Cu5XoR90.css              # 메인 CSS (해시 포함)
    ├── index-PEdig-IT.js               # 메인 JS
    ├── Home-lHovLBtk.js                # lazy 청크
    ├── About-c9wxF22v.js               # lazy 청크
    ├── Learning-2H337hSx.js            # lazy 청크
    ├── ProjectGuide-uZVoRsVQ.js        # lazy 청크
    └── react-vendor-xxxxx.js           # vendor 분리

[해시의 의미]
파일명에 해시 → 내용이 바뀌면 해시도 바뀜
→ 브라우저가 자동으로 새 파일 다운로드
→ 캐싱과 새 버전 배포 동시 만족` } },

          { subtitle: 'Bundle Analyzer — 크기 시각화' },
          { code: { lang: 'bash', content: `npm install -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, filename: 'dist/stats.html' }),
  ],
});

# 빌드 후 자동으로 stats.html 열림
# 각 모듈별 크기·비율 시각화` } },

          { subtitle: '빌드 최적화 — 청크 분리' },
          { code: { lang: 'typescript', content: `// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
    chunkSizeWarningLimit: 500,  // 청크 크기 경고 임계값 (kB)
  },
});

// 효과
// - 라이브러리 변경 안 되면 청크 해시 유지 → 브라우저 캐시 활용
// - 페이지 코드만 변경되면 작은 청크만 재다운로드` } },

          { subtitle: '환경별 빌드' },
          { code: { lang: 'bash', content: `# 모드별 빌드
npx vite build --mode production    # .env.production
npx vite build --mode staging       # .env.staging
npx vite build --mode development   # 개발 빌드 (보통 안 함)

# package.json
"scripts": {
  "build":         "tsc -b && vite build",
  "build:staging": "tsc -b && vite build --mode staging",
}

# 빌드 시 환경변수 확인
console.log(import.meta.env.MODE)        // 'production'
console.log(import.meta.env.PROD)        // true
console.log(import.meta.env.DEV)         // false` } },

          { subtitle: 'preview — 빌드 결과 미리보기' },
          { code: { lang: 'bash', content: `npm run preview      # 기본 4173 포트

# 또는 옵션
npx vite preview --port 8080
npx vite preview --host 0.0.0.0     # 외부 접근 허용

# 용도
# - 빌드 결과가 실제 production과 동일한지 확인
# - dev에서는 안 보이던 버그 발견 가능 (의존성 누락 등)` } },

          { subtitle: '실습' },
          { items: [
            'npm run build 후 dist 폴더 구조 분석',
            'Bundle Analyzer 도입 + 큰 모듈 식별',
            'manualChunks로 vendor 분리',
            '청크 크기 비교 (Before/After)',
            'npm run preview로 빌드 결과 검증',
          ] },
        ],
      },

      {
        id: 'reg-12-ghpages',
        title: 'GitHub Pages 배포 마스터',
        icon: '🚀',
        summary: 'gh-pages·CNAME·404 트릭·HTTPS·DNS까지 GitHub Pages 운영의 모든 것.',
        content: [
          { subtitle: 'GitHub Pages는 무엇인가' },
          { items: [
            'GitHub 저장소를 정적 사이트로 호스팅',
            '무료 (퍼블릭 저장소)',
            '커스텀 도메인 + 무료 HTTPS',
            'SPA·정적 사이트 지원',
            '서버사이드 코드 X (Node.js·Python 백엔드 불가)',
            'Edge Function 등은 Supabase·Vercel·Cloudflare로',
          ] },

          { subtitle: 'gh-pages 패키지 셋업' },
          { code: { lang: 'bash', content: `npm install -D gh-pages

# package.json
"scripts": {
  "build":     "tsc -b && vite build",
  "predeploy": "npm run build",          # deploy 직전 자동 실행
  "deploy":    "gh-pages -d dist"        # dist 폴더를 gh-pages 브랜치에 푸시
}

# 배포 명령
npm run deploy

# 동작
# 1. predeploy → npm run build → dist 생성
# 2. deploy → dist 내용을 gh-pages 브랜치에 force push
# 3. GitHub Pages가 gh-pages 브랜치 자동 서빙` } },

          { subtitle: 'GitHub 설정' },
          { items: [
            '저장소 → Settings → Pages',
            'Source: Deploy from a branch',
            'Branch: gh-pages, Folder: / (root)',
            'Save 클릭',
            '약 1~3분 후 https://<user>.github.io/<repo>/ 에서 접근',
            'Enforce HTTPS 체크 (인증서 발급 후 5~30분)',
          ] },

          { subtitle: 'Vite base 설정 — 중요' },
          { code: { lang: 'typescript', content: `// vite.config.ts

// 케이스 1: 커스텀 도메인 (rest.dreamitbiz.com)
export default defineConfig({
  base: '/',
});

// 케이스 2: GitHub 기본 URL (user.github.io/repo-name/)
export default defineConfig({
  base: '/repo-name/',
});

// 케이스 3: 환경별 다르게
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/repo-name/' : '/',
});

// ⚠️ base 잘못 설정 → 모든 자산 404
// 빈 화면 + Network 탭에 404 보이면 base 의심` } },

          { subtitle: '커스텀 도메인 — CNAME 파일' },
          { code: { lang: 'text', content: `// public/CNAME (확장자 없음)
rest.dreamitbiz.com

// 빌드 시 dist/CNAME으로 복사됨
// gh-pages가 이걸 함께 푸시
// GitHub이 자동으로 도메인 등록` } },

          { subtitle: 'DNS 설정 — 도메인 등록업체' },
          { code: { lang: 'text', content: `[CNAME 레코드 — 서브도메인]
Type:   CNAME
Name:   rest
Value:  <username>.github.io
TTL:    3600

[A 레코드 — 루트 도메인 (apex)]
Type:   A
Name:   @
Value:  185.199.108.153
        185.199.109.153
        185.199.110.153
        185.199.111.153
TTL:    3600

[전파 시간]
- CNAME: 5~30분
- A: 10분~2시간
- 완전 글로벌: 최대 48시간` } },

          { subtitle: 'SPA 404 트릭 — 새로고침 문제 해결' },
          { text: 'GitHub Pages는 정적 서버라 /about에서 새로고침하면 about.html을 찾다 404. 트릭으로 모든 404를 index.html로 보내 React Router가 처리.' },
          { code: { lang: 'html', content: `<!-- public/404.html — GitHub Pages가 404 시 서빙 -->
<!doctype html>
<html>
<head>
  <script>
    var l = window.location;
    var path = l.pathname.slice(1);
    l.replace(
      l.protocol + '//' + l.host +
      '/?/' + path + l.search + l.hash
    );
  </script>
</head>
<body></body>
</html>

<!-- index.html에 추가 — 쿼리를 다시 경로로 복원 -->
<script>
  (function(l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?');
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location));
</script>` } },

          { subtitle: '배포 후 점검 체크리스트' },
          { items: [
            '☐ 메인 페이지 정상 로드',
            '☐ 모든 라우트 동작 (새로고침 시에도)',
            '☐ 모든 정적 자산 로드 (이미지·폰트·CSS)',
            '☐ API 호출 정상 (production .env 키)',
            '☐ HTTPS 강제 + 인증서 발급',
            '☐ www → non-www 또는 그 반대 리다이렉트 설정',
            '☐ SEO 메타 태그 확인',
            '☐ OG 이미지 SNS 공유 미리보기 검증',
            '☐ 모바일에서 정상 (실제 기기)',
            '☐ Lighthouse production 측정 80+',
          ] },

          { subtitle: 'GitHub Actions 자동 배포 (선택)' },
          { code: { lang: 'yaml', content: `# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4` } },

          { subtitle: '실습' },
          { items: [
            'gh-pages 패키지 셋업 + npm run deploy 성공',
            'CNAME 파일 + DNS 설정으로 커스텀 도메인',
            '404.html 트릭 적용 + 새로고침 테스트',
            '배포 후 체크리스트 10개 통과',
            'GitHub Actions 자동 배포 셋업 (선택)',
          ] },
        ],
      },

      {
        id: 'reg-12-slides',
        title: '발표 자료 작성 — 8슬라이드 마스터',
        icon: '📊',
        summary: '5~10분 발표를 위한 8슬라이드 표준 구성 + 디자인 원칙 + 도구 비교.',
        content: [
          { subtitle: '8슬라이드 표준 구성' },
          { table: {
            headers: ['#', '슬라이드', '시간', '핵심'],
            rows: [
              ['1', '타이틀', '30초', '서비스명 + 가치 제안 + 팀명'],
              ['2', '문제', '1분', '누구의 어떤 문제 (페르소나·통계)'],
              ['3', '솔루션', '1분', 'AI가 어떻게 해결하는가'],
              ['4', '핵심 기능', '1분', '3~5개 기능, 각 1줄'],
              ['5', '기술 스택', '1분', 'React + Supabase + 국내 LLM'],
              ['6', '라이브 데모', '3분', '실제 사용 시연'],
              ['7', '성과·검증', '1분', '사용자 수·만족도·KPI'],
              ['8', '향후·연락처', '30초', 'Roadmap + Thank You'],
            ],
          } },

          { subtitle: '슬라이드 1 — 타이틀' },
          { code: { lang: 'text', content: `[디자인]
- 큰 글씨 (60pt+) — 서비스명
- 부제 (24pt) — 가치 제안 1문장
- 하단 (16pt) — 팀명 + 발표일

[예시]
┌─────────────────────────────────┐
│                                 │
│      Career Reboot              │
│                                 │
│   AI가 30분에 찾는 당신의 진로    │
│                                 │
│                                 │
│         Team DreamIT             │
│        2026.06.22                │
└─────────────────────────────────┘

[금기]
- 작은 글씨로 가득 채우기
- 로고만 띄우고 텍스트 없음
- 자기소개·이력서 같은 정보` } },

          { subtitle: '슬라이드 2 — 문제' },
          { code: { lang: 'text', content: `[구성 요소]
- 페르소나 사진 또는 일러스트
- 한 문장 핵심 문제
- 통계·근거 1~2개

[예시]
┌─────────────────────────────────┐
│  김민지, 28세, 인문 전공          │
│                                 │
│  "1년간 진로를 찾지 못했어요"     │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━           │
│  📊 쉬었음청년 67만명             │
│     매년 5만명씩 증가             │
│     (통계청, 2025)               │
└─────────────────────────────────┘

[금기]
- "교육 시장은 ____조 원" — 너무 거시적
- 데이터 출처 없음` } },

          { subtitle: '슬라이드 3 — 솔루션' },
          { code: { lang: 'text', content: `[구성]
- "AI가 ___을 통해 ___을 해결" 문장
- 핵심 차별점 1~2개

[예시]
┌─────────────────────────────────┐
│  Solar AI와 30분 대화로           │
│  당신만의 진로 진단               │
│                                 │
│  • 국내 LLM 한국어 자연어 진단     │
│  • 직무 매칭 + 8주 학습 로드맵    │
│  • 0~코딩 비전공자 위한 챗봇 UX   │
└─────────────────────────────────┘` } },

          { subtitle: '슬라이드 4 — 핵심 기능' },
          { code: { lang: 'text', content: `[구성: 3×3 또는 4×1 그리드]
- 각 기능 = 아이콘 + 이름 + 한 줄 설명

[예시]
┌─────────────────────────────────┐
│  핵심 기능                       │
│                                 │
│  💬                  🎯          │
│  대화형 진단         직무 추천    │
│  Solar로 15턴 대화   3개 직무 적합│
│                                 │
│  📚                  📊          │
│  학습 로드맵         진도 추적    │
│  주차별 단계        실시간 트래킹 │
└─────────────────────────────────┘` } },

          { subtitle: '슬라이드 5 — 기술 스택' },
          { code: { lang: 'text', content: `[구성]
- 아키텍처 다이어그램 또는 로고 그리드

[예시]
┌─────────────────────────────────┐
│  Frontend  React 19 + Vite 7    │
│  Backend   Supabase Edge Fn     │
│  Database  PostgreSQL + RLS     │
│  LLM       Solar Pro (Upstage)  │
│  Hosting   GitHub Pages         │
│  Auth      Email + Google OAuth │
└─────────────────────────────────┘

[강조 포인트]
- 국내 LLM 사용 (경진대회 평가 핵심)
- 전체 무료 인프라로 운영 가능` } },

          { subtitle: '슬라이드 6 — 라이브 데모 (3분)' },
          { text: '슬라이드보다 실제 동작이 100배 강력. 발표의 클라이맥스.' },
          { code: { lang: 'text', content: `[데모 시나리오]
00:00 랜딩 페이지 진입
      "처음 사이트에 오신 분"

00:20 회원가입 (사전 등록 계정으로 로그인)

00:40 진단 챗봇 시작
      AI 응답 1턴 시연

01:30 결과 화면 + 직무 3개

02:10 학습 로드맵 1개 클릭

02:50 마무리 멘트

[안전장치]
- 사전 등록 계정·더미 데이터 준비
- 5초짜리 GIF 백업
- 인터넷 끊김 대비 영상 백업
- 화면 공유 사전 테스트 (Zoom·OBS)` } },

          { subtitle: '슬라이드 7 — 성과·검증' },
          { code: { lang: 'text', content: `[구성: 큰 숫자 + 짧은 설명]
- 베타 테스트 결과
- 만족도·완료율
- 사용자 인용

[예시]
┌─────────────────────────────────┐
│  베타 테스트 결과                 │
│                                 │
│  52명         4.2/5             │
│  사용자       만족도              │
│                                 │
│  78%          평균 23분          │
│  완료율       체류 시간           │
│                                 │
│  "정말 도움이 됐어요!"            │
│   — 28세 베타 사용자              │
└─────────────────────────────────┘` } },

          { subtitle: '슬라이드 8 — 향후·연락처' },
          { code: { lang: 'text', content: `[구성]
- Roadmap (다음 단계)
- 연락처 + QR
- Thank You

[예시]
┌─────────────────────────────────┐
│  다음 단계                       │
│  ① 모바일 앱                     │
│  ② 멘토 매칭                     │
│  ③ 기업 협업                     │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━           │
│                                 │
│  https://rest.dreamitbiz.com    │
│  [QR 코드]                       │
│                                 │
│  Thank You                       │
└─────────────────────────────────┘` } },

          { subtitle: '슬라이드 도구 비교' },
          { table: {
            headers: ['도구', '강점', '약점'],
            rows: [
              ['Pitch.com', '템플릿·협업·웹 기반', '오프라인 X'],
              ['Canva', '디자인 풍부', '대용량 슬라이드 느림'],
              ['Google Slides', '협업 강력·무료', '디자인 단순'],
              ['Keynote', '미려한 애니메이션', 'Mac 전용'],
              ['PowerPoint', '범용·정확', '구식 이미지'],
              ['Slides.com', '개발자 친화 (마크다운)', '커스텀 한계'],
            ],
          } },

          { subtitle: '실습' },
          { items: [
            '8슬라이드 1차 초안 작성',
            '팀 내 리뷰 + 피드백',
            '데모 시나리오 작성',
            'PDF 백업 + 5초 GIF 5개 준비',
            '발표 리허설 1회 (5~10분)',
          ] },
        ],
      },

      {
        id: 'reg-12-readme',
        title: 'README + 프로젝트 마무리',
        icon: '📝',
        summary: '경진대회 평가 시 가장 먼저 보는 README. 매력적이고 명확한 README 작성 가이드 + 추가 마무리 작업.',
        content: [
          { subtitle: 'README 표준 구조' },
          { code: { lang: 'markdown', content: `# Career Reboot — AI 진로 코칭

> AI가 30분에 찾는 당신의 진로

[![Demo](https://img.shields.io/badge/Demo-Live-success)](https://rest.dreamitbiz.com)
[![Stars](https://img.shields.io/github/stars/your-team/repo)](#)

[데모 GIF — 핵심 기능 5초]

## 🌟 소개
쉬었음청년이 30분 대화로 본인 적성을 진단받고 맞춤형 학습 로드맵을 얻는
AI 진로 코칭 서비스입니다. 국내 LLM Solar Pro를 활용해 한국어에 최적화.

## ✨ 핵심 기능
- 🤖 **대화형 진단** — Solar AI와 15턴 자연어 대화
- 🎯 **직무 추천** — 본인 적성 기반 직무 3개 추천
- 📚 **학습 로드맵** — 8주 단계별 가이드
- 📊 **진도 추적** — 학습 진행 시각화

## 🛠 기술 스택
- **Frontend**: React 19 + Vite 7 + TypeScript 5.8
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **LLM**: Solar Pro (Upstage) + HyperCLOVA X 폴백
- **Hosting**: GitHub Pages
- **Tools**: Cursor + Claude Code

## 🚀 빠른 시작
\`\`\`bash
# 1) 클론
git clone https://github.com/your-team/career-reboot
cd career-reboot

# 2) 의존성 설치
npm install

# 3) 환경변수 설정
cp .env.example .env.local
# .env.local에 Supabase·Solar 키 입력

# 4) 실행
npm run dev
# → http://localhost:5173
\`\`\`

## 📂 폴더 구조
\`\`\`
src/
├── components/    # UI 컴포넌트
├── pages/         # 라우트 페이지
├── hooks/         # custom hooks
├── contexts/      # 전역 상태
├── utils/         # 유틸 함수
└── types/         # TS 타입
\`\`\`

## 👥 팀
- 홍길동 — PM·기획
- 김철수 — Frontend
- 이영희 — Backend·LLM

## 📄 라이선스
MIT

## 🏆 AI Reboot 경진대회 2026 출품작
` } },

          { subtitle: 'README 디자인 팁' },
          { items: [
            '첫 5초에 매력 결정 — 데모 GIF 또는 스크린샷',
            'Shields.io 배지 — 시각적 정보 (build·license·stars)',
            '이모지 절제해서 사용 (섹션 헤더에)',
            '한 줄 가치 제안을 제목 바로 아래',
            'Live Demo 링크 최상단',
            '설치·실행 명령은 복사 가능한 코드 블록',
            '스크린샷·다이어그램은 docs/ 폴더에',
          ] },

          { subtitle: '데모 GIF 만들기' },
          { items: [
            'macOS — CleanShot X (유료) 또는 Cmd+Shift+5',
            'Windows — ScreenToGif (무료, 강력)',
            '브라우저 확장 — Loom (무료)',
            'CLI — ffmpeg (mp4 → gif 변환)',
            '권장: 10초 이내, 1280×720, 5MB 이하',
          ] },

          { subtitle: '발표용 백업 영상' },
          { code: { lang: 'bash', content: `# OBS Studio로 화면 녹화 (무료)
# 1. obsproject.com 다운로드
# 2. Sources → "+" → Display Capture
# 3. 녹화 시작 → 데모 시연 → 정지
# 4. 파일: ~/Videos/2026-06-22 21-30-00.mkv

# mp4 변환 (선택)
ffmpeg -i input.mkv -c:v libx264 -c:a aac demo.mp4

# 발표 시 사용:
# - 인터넷 끊김 대비
# - "이미 녹화된 영상으로 보여드립니다" 매끄럽게 전환` } },

          { subtitle: '경진대회 출품 자료' },
          { items: [
            '☐ Live Demo URL — https://rest.dreamitbiz.com',
            '☐ GitHub 저장소 (Public)',
            '☐ README + 데모 GIF',
            '☐ 발표 자료 PDF (8슬라이드)',
            '☐ 발표 영상 (3분 데모 녹화)',
            '☐ 팀원 정보 (이름·연락처·역할)',
            '☐ 사용한 국내 LLM 명시 (Solar Pro)',
            '☐ 베타 테스트 결과 (있다면)',
          ] },

          { subtitle: '프로젝트 마무리 작업' },
          { items: [
            '☐ 모든 console.log 제거 (또는 debug 플래그)',
            '☐ TODO 주석 처리 (이슈로 옮기기)',
            '☐ 사용 안 하는 import·변수 제거 (ESLint)',
            '☐ 환경변수 확인 (production 키 정상)',
            '☐ .env.example 최신화',
            '☐ npm audit fix',
            '☐ 라이선스 파일 (LICENSE)',
            '☐ .gitignore 점검',
          ] },

          { subtitle: '실습' },
          { items: [
            '매력적인 README 작성 (데모 GIF 포함)',
            '발표 자료 PDF 백업',
            '3분 데모 영상 녹화',
            '경진대회 출품 자료 8개 모두 준비',
            '프로젝트 마무리 체크리스트 통과',
          ] },
        ],
      },

      {
        id: 'reg-12-rehearsal',
        title: '발표 리허설 + 안정성 검증',
        icon: '🎤',
        summary: '실전 발표 전 필수 — 시간 측정·예상 질문·기술 백업·심리 안정까지.',
        content: [
          { subtitle: '리허설 사이클' },
          { items: [
            '1차: 혼자 — 시간 측정 + 슬라이드 매끄러움',
            '2차: 팀 내 — 피어 리뷰 + 피드백 반영',
            '3차: 외부 — 친구·가족 앞에서 (코드 모르는 사람 기준)',
            '4차: 실제 환경 — 발표장 와이파이·프로젝터로 한 번',
          ] },

          { subtitle: '시간 배분 — 5분 발표' },
          { table: {
            headers: ['구간', '시간', '슬라이드'],
            rows: [
              ['도입 (문제 + 솔루션)', '1분', '1~3'],
              ['기술 스택 + 핵심 기능', '1분', '4~5'],
              ['라이브 데모', '2분', '6'],
              ['성과 + 향후', '1분', '7~8'],
              ['Q&A 여유', '0~1분', '-'],
            ],
          } },

          { subtitle: '시간 배분 — 10분 발표' },
          { table: {
            headers: ['구간', '시간', '슬라이드'],
            rows: [
              ['도입', '2분', '1~3'],
              ['기술 + 기능', '2분', '4~5'],
              ['라이브 데모', '3~4분', '6'],
              ['성과 + 향후', '1~2분', '7~8'],
              ['Q&A', '1분', '-'],
            ],
          } },

          { subtitle: '데모 안정성 — 사전 점검' },
          { items: [
            '☐ 인터넷 — 발표장 와이파이 + 모바일 핫스팟 백업',
            '☐ API 키 — Solar·Supabase 한도 충분',
            '☐ 데모 계정 — 사전 로그인 + 더미 데이터 입력',
            '☐ 브라우저 — 캐시 정리 + 자동완성 비활성',
            '☐ 핫키 — 데모 계정 ID·PWD 메모에 (긴급용)',
            '☐ 시간 — 발표 30분 전 모든 페이지 한 번 새로고침',
            '☐ 모니터 — 해상도·확대율 미리 설정',
            '☐ 알림 — 모든 알림 꺼두기 (Do Not Disturb)',
          ] },

          { subtitle: '예상 질문 10종' },
          { table: {
            headers: ['질문', '답변 방향'],
            rows: [
              ['왜 이 LLM을 골랐나요?', '비용·한국어 성능·대회 요건 비교 후 결정'],
              ['보안은 어떻게?', 'Edge Function 키 보호 + RLS 행 단위'],
              ['실패 케이스?', '솔직 인정 + 보완 계획 1문장'],
              ['확장성?', '현재 N명 처리 가능 + 병목 지점'],
              ['차별점?', '국내 LLM·도메인·UX 중 1~2개'],
              ['비용 모델?', '무료 시작 → Pro 5천원/월 (예시)'],
              ['타겟 사용자?', '페르소나 + 시장 규모'],
              ['MVP 후 다음?', 'Roadmap 슬라이드 참조'],
              ['팀원 역할?', '각자 1줄'],
              ['배운 점?', '솔직한 회고'],
            ],
          } },
          { callout: { type: 'tip', text: '모르는 질문 — "좋은 지적입니다. 그 부분은 아직 검증하지 못했습니다. 좋은 후속 과제입니다." 거짓말 절대 금지. 솔직함이 신뢰.' } },

          { subtitle: '발표 심리 — 떨림 관리' },
          { items: [
            '시작 첫 30초만 외워두기 — 자기소개 + 한 문장',
            '심호흡 — 들숨 4초, 내쉼 6초 (긴장 완화)',
            '청중 한 명 골라 자주 눈맞춤',
            '실수해도 사과하지 않고 계속 진행',
            '말 빠르게 하지 말기 — 의도적 일시 정지',
            '물 한 잔 사전 준비',
          ] },

          { subtitle: '발표 후 — 피드백 수집' },
          { items: [
            '동료에게 "가장 인상 깊은 점 1개" 질문',
            '"개선 제안 1개" 요청',
            '피드백 즉시 메모',
            'GitHub Issues에 "Post-presentation feedback" 추가',
            '다음 발표 시 반영',
          ] },

          { subtitle: '실습' },
          { items: [
            '팀 내 풀 리허설 1회 (시간 측정)',
            '시간 초과 시 어디를 줄일지 결정',
            '예상 질문 10개에 답변 미리 작성',
            '데모 안정성 8개 체크리스트 통과',
            '심리 안정 루틴 결정 + 연습',
          ] },
        ],
      },

      {
        id: 'reg-12-practice-1',
        title: '실습 1 · 첫 production 빌드 + 분석 (25분)',
        icon: '🧪',
        summary: 'npm run build → 청크 분석 → manualChunks 최적화.',
        content: [
          { subtitle: '단계' },
          { code: { lang: 'bash', content: `# 1) 빌드
npm run build

# 2) dist 폴더 분석
ls -lh dist/assets/
# index-XXX.js 크기 확인
# 각 lazy 청크 분리되었나?

# 3) Bundle Analyzer (선택)
npm install -D rollup-plugin-visualizer

# vite.config.ts에 추가
import { visualizer } from 'rollup-plugin-visualizer';
plugins: [react(), visualizer({ open: true, filename: 'dist/stats.html' })]

# 빌드 → stats.html 자동 열림 → 큰 모듈 식별

# 4) manualChunks 적용
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'supabase': ['@supabase/supabase-js'],
        'forms': ['react-hook-form', 'zod'],
      },
    },
  },
}

# 5) 다시 빌드 → 비교` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 빌드 성공',
            '☐ 청크 분리 확인',
            '☐ Bundle Analyzer 사용',
            '☐ manualChunks 적용',
            '☐ vendor 청크 분리 효과 측정',
          ] },
        ],
      },

      {
        id: 'reg-12-practice-2',
        title: '실습 2 · gh-pages 첫 배포 (20분)',
        icon: '🧪',
        summary: 'gh-pages 패키지로 첫 배포 + URL 확인.',
        content: [
          { subtitle: '단계' },
          { code: { lang: 'bash', content: `# 1) 설치
npm install -D gh-pages

# 2) package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# 3) vite.config.ts (커스텀 도메인 없으면)
base: '/<repo-name>/',

# 4) 배포
npm run deploy

# 5) GitHub 저장소 → Settings → Pages
# Source: gh-pages branch
# Save → 1~3분 후 URL 활성화

# 6) 확인
# https://<user>.github.io/<repo-name>/` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ npm run deploy 성공',
            '☐ GitHub Pages 설정 완료',
            '☐ URL에서 정상 표시',
            '☐ 모든 라우트 동작',
            '☐ 정적 자산 로드',
          ] },
        ],
      },

      {
        id: 'reg-12-practice-3',
        title: '실습 3 · 커스텀 도메인 연결 (30분)',
        icon: '🧪',
        summary: 'CNAME 파일 + DNS 설정으로 커스텀 도메인 + HTTPS 인증서.',
        content: [
          { subtitle: '단계' },
          { items: [
            '1. 도메인 등록 (가비아·Cloudflare·Namecheap 등)',
            '2. public/CNAME 파일 작성',
            '3. vite.config.ts → base: \'/\'',
            '4. 도메인 등록업체 DNS → CNAME 레코드 추가',
            '5. GitHub Settings → Pages → Custom domain 입력',
            '6. Enforce HTTPS 체크',
            '7. 5~30분 대기',
          ] },

          { subtitle: 'public/CNAME' },
          { code: { lang: 'text', content: `my-app.example.com` } },

          { subtitle: 'DNS 설정 — 서브도메인' },
          { code: { lang: 'text', content: `Type:   CNAME
Name:   my-app
Value:  <user>.github.io
TTL:    3600` } },

          { subtitle: 'DNS 설정 — 루트 도메인 (apex)' },
          { code: { lang: 'text', content: `Type:   A
Name:   @
Value:  185.199.108.153
        185.199.109.153
        185.199.110.153
        185.199.111.153
TTL:    3600` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 커스텀 도메인에서 접근',
            '☐ HTTPS 자동 인증서',
            '☐ www → non-www 또는 그 반대 리다이렉트',
            '☐ 모든 라우트 동작',
            '☐ SPA 404 트릭 적용',
          ] },
        ],
      },

      {
        id: 'reg-12-practice-4',
        title: '실습 4 · SPA 404 트릭 + 배포 후 점검 (20분)',
        icon: '🧪',
        summary: 'GitHub Pages의 SPA 라우팅 새로고침 문제 해결 + 10개 체크리스트.',
        content: [
          { subtitle: 'public/404.html 추가' },
          { code: { lang: 'html', content: `<!doctype html>
<html>
<head>
<script>
  var l = window.location;
  var path = l.pathname.slice(1);
  l.replace(l.protocol + '//' + l.host + '/?/' + path + l.search + l.hash);
</script>
</head>
<body></body>
</html>` } },

          { subtitle: 'index.html에 복원 스크립트' },
          { code: { lang: 'html', content: `<script>
  (function(l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?');
      window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
    }
  }(window.location));
</script>` } },

          { subtitle: '배포 후 10개 체크리스트' },
          { items: [
            '☐ 메인 페이지 정상 로드',
            '☐ /about·/dashboard 등 직접 URL 접근',
            '☐ 새로고침 시에도 동작 (404 트릭)',
            '☐ HTTPS 강제 + 자물쇠 아이콘',
            '☐ 모든 이미지 로드',
            '☐ 폰트 로드',
            '☐ API 호출 정상 (production 키)',
            '☐ 모바일에서 정상',
            '☐ DevTools Console 에러 0',
            '☐ Lighthouse production 측정 80+',
          ] },
        ],
      },

      {
        id: 'reg-12-practice-5',
        title: '실습 5 · 8슬라이드 발표 자료 작성 (45분)',
        icon: '🧪',
        summary: '8슬라이드 표준 구조 + Pitch/Canva로 디자인 + PDF 백업.',
        content: [
          { subtitle: '도구 선택' },
          { items: [
            'Pitch.com (무료 — 협업 + 웹 기반)',
            'Canva (무료 — 풍부한 템플릿)',
            'Google Slides (무료 + 공유 강력)',
            'Keynote (Mac — 미려한 애니메이션)',
          ] },

          { subtitle: '8슬라이드 구조 (각 슬라이드 1줄 가이드)' },
          { table: {
            headers: ['#', '슬라이드', '핵심'],
            rows: [
              ['1', '타이틀', '서비스명 + 가치제안 + 팀명'],
              ['2', '문제', '페르소나 + 통계 1~2개'],
              ['3', '솔루션', 'AI가 어떻게 해결'],
              ['4', '핵심 기능', '아이콘 + 3~5개 기능'],
              ['5', '기술 스택', '국내 LLM 강조'],
              ['6', '라이브 데모', '3분 시연'],
              ['7', '성과·검증', '베타 결과 숫자'],
              ['8', '향후·연락처', 'Roadmap + Thank You'],
            ],
          } },

          { subtitle: '디자인 원칙' },
          { items: [
            '한 슬라이드 한 메시지',
            '글자는 24pt 이상 (뒷자리 가독성)',
            '큰 숫자 + 짧은 텍스트',
            '이미지·아이콘으로 시각화',
            '본 강의 운영사 색(#0D2B5E) 활용',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 8슬라이드 모두 완성',
            '☐ 첫 슬라이드 매력적',
            '☐ 데모 슬라이드는 텍스트 최소',
            '☐ 마지막 슬라이드 연락처',
            '☐ PDF 백업 (.pdf)',
          ] },
        ],
      },

      {
        id: 'reg-12-practice-6',
        title: '실습 6 · 데모 시나리오 + 백업 영상 (30분)',
        icon: '🧪',
        summary: '3분 데모 시나리오 작성 + Loom/OBS로 백업 영상 녹화.',
        content: [
          { subtitle: '시나리오 양식' },
          { code: { lang: 'text', content: `[데모 시나리오 — 3분]

00:00~00:15  랜딩 페이지 진입
             멘트: "처음 사이트에 오신 분..."

00:15~00:30  회원가입 (사전 계정 즉시 로그인)
             멘트: "30초 만에 가입..."

00:30~01:00  진단 시작 → 첫 질문
             멘트: "AI가 자연어로..."
             [사용자 답변 1턴]

01:00~02:00  진단 진행 (5턴 빠르게)
             미리 준비한 답변 빠르게 클릭

02:00~02:30  결과 화면 → 직무 3개 추천
             멘트: "30분 대화 결과..."

02:30~02:50  학습 로드맵 1개 클릭
             멘트: "맞춤형 8주 가이드..."

02:50~03:00  마무리 멘트
             "이렇게 한 사용자의 진로가 바뀝니다"

[안전장치]
- Plan A: Live (제일 좋음)
- Plan B: 녹화 영상 (인터넷 끊김 시)
- Plan C: GIF 5개 (느릴 때)
- Plan D: 스크린샷 (최후)` } },

          { subtitle: '백업 영상 녹화' },
          { code: { lang: 'bash', content: `# 옵션 1: Loom (가장 쉬움)
# loom.com → Chrome 확장 → 녹화 → 자동 클라우드 저장

# 옵션 2: OBS Studio (무료, 강력)
# obsproject.com 다운로드
# Sources → Display Capture
# 녹화 시작 → 데모 시연 → 정지

# 옵션 3: macOS Cmd+Shift+5
# 화면 일부 녹화 → 자동 mp4 저장

# 옵션 4: Windows + G (Game Bar)
# Win+G → 캡처 → 녹화` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 3분 시나리오 초 단위 작성',
            '☐ 백업 영상 녹화 (mp4)',
            '☐ 핵심 GIF 5개',
            '☐ 사전 데모 계정 + 데이터 준비',
            '☐ 실제 환경에서 1회 리허설',
          ] },
        ],
      },

      {
        id: 'reg-12-resources',
        title: '심화 + 자가 평가',
        icon: '📚',
        summary: '발표·디자인 심화 자료 + Day 12 자가 평가.',
        content: [
          { subtitle: '발표 자료' },
          { items: [
            '도서 『프레젠테이션 젠』 가르 레이놀즈 — 미니멀 디자인',
            '도서 『TED 프레젠테이션』 카민 갤로',
            'YouTube TED-Ed "How to give a great presentation"',
            'YouTube "지미 정 (Jimmy Jung)" — 한국어 발표 코칭',
            'Pitch.com Templates — 무료 시작점',
          ] },

          { subtitle: '디자인 자료' },
          { items: [
            'Canva (무료 — 한국어 템플릿)',
            'Figma Community → "Pitch Deck" 검색',
            'Loom — 화면 녹화·공유',
            'Shields.io — README 배지',
            'Carbon (carbon.now.sh) — 코드 이미지화',
          ] },

          { subtitle: 'Day 12 자가 평가' },
          { table: {
            headers: ['역량', '1점', '3점', '5점'],
            rows: [
              ['빌드 이해', 'npm run build만', '청크·해시 의미', 'manualChunks·analyzer'],
              ['배포', '수동', 'gh-pages CLI', 'GitHub Actions·CNAME·HTTPS'],
              ['SPA 처리', '없음', '404.html 트릭', '커스텀 도메인 + base 설정'],
              ['발표 자료', '없음', '8슬라이드 채움', '리허설 + 백업 + Q&A 준비'],
              ['README', '기본 정보', '설치·실행', '데모 GIF·배지·이미지'],
            ],
          } },
        ],
      },
    ],
  },

  {
    id: 'reg-13',
    title: 'Day 15 · 최종 발표 및 평가',
    icon: '🏆',
    description: '5~10분 발표·라이브 데모·피어 리뷰·예상 질문 대응 — 경진대회 출품 직전 모든 요소를 완성하고 검증합니다. (4시간 강의 / 50분 × 4세션)',
    content: [
      { subtitle: '강의 흐름 (4시간 · 50분 × 4세션)' },
      { table: {
        headers: ['세션', '시간', '주제', '핵심 산출물'],
        rows: [
          ['S1', '50분', '팀 내 풀 리허설 (5~10분 × 1회)', '시간 측정 + 문제점 식별'],
          ['S2', '50분', '팀별 본 발표 + 피어 리뷰', '발표 점수 + 피드백 받기'],
          ['S3', '50분', '팀별 본 발표 후반 + 피어 리뷰', '발표 점수 + 피드백 받기'],
          ['S4', '50분', '경진대회 출품 최종 점검 + 전체 회고', '출품 완료 확정'],
        ],
      } },

      { subtitle: '학습 목표', items: [
        '5~10분 분량의 팀 발표를 자연스럽게 진행한다',
        '3분 라이브 데모를 시나리오대로 안정적으로 수행한다',
        '다른 팀 발표를 객관적으로 피어 리뷰한다',
        '경진대회 출품을 위한 모든 자료를 점검·확정한다',
      ] },

      { subtitle: '발표 시간 배분' },
      { table: {
        headers: ['구간', '5분 발표', '10분 발표'],
        rows: [
          ['도입 (문제·솔루션)', '1분', '2분'],
          ['기술 스택 + 핵심 기능', '1분', '2분'],
          ['라이브 데모', '2분', '3~4분'],
          ['성과·향후 계획', '1분', '1~2분'],
          ['Q&A 여유', '0.5분', '1분'],
        ],
      } },

      { subtitle: '데모 시나리오 작성' },
      { text: '데모는 코드 시연이 아닙니다. 사용자의 행동을 따라 서비스의 가치를 보여주는 것입니다.' },
      { code: { lang: 'text', content: `[데모 시나리오 예시 — 3분]

00:00  랜딩 페이지 진입
       "쉬었음청년이 처음 사이트에 오면…"

00:20  회원가입 (이미 등록한 데모 계정으로 로그인)
       "30초 만에 가입 가능합니다."

00:40  진단 시작 → AI 챗봇과 대화 1턴
       "Solar LLM이 한국어로 자연스럽게 응대합니다."

01:30  진단 결과 화면
       "5분 대화 후 본인 적성·추천 직무 3개 도출."

02:10  추천 직무 1개 선택 → 학습 로드맵 화면
       "맞춤형 8주 학습 플랜 제공."

02:50  마무리 멘트로 슬라이드 전환` } },

      { subtitle: '데모 안정성 — 사전 점검' },
      { items: [
        '인터넷 연결 — 모바일 핫스팟 백업',
        'API 키 잔액·rate limit 확인',
        '브라우저 캐시 정리 + 자동완성·비밀번호 노출 방지',
        '데모용 계정 사전 로그인 + 더미 데이터 사전 입력',
        '핵심 기능별 5초짜리 백업 GIF/스크린샷 준비',
      ] },

      { subtitle: '예상 질문 5종 + 모범 답안' },
      { table: {
        headers: ['질문', '핵심 답변 방향'],
        rows: [
          ['왜 이 LLM을 골랐나요?', '비용·한국어 성능·경진대회 요건 → 비교 후 결정'],
          ['보안은 어떻게 처리하셨나요?', 'Edge Function으로 키 보호 + RLS로 행 단위 권한'],
          ['실패 케이스는 무엇인가요?', '솔직히 인정 + 어떻게 보완했는지 1문장'],
          ['확장성은 어떻게 보장하나요?', '현재 N명 처리 가능 + 병목 지점 + 다음 단계'],
          ['차별점이 무엇인가요?', '국내 LLM·도메인 특화·UX 3가지 중 1~2개'],
        ],
      } },
      { callout: { type: 'tip', text: '예상 질문에 모르는 게 나오면 "그 부분은 아직 검증하지 못했습니다. 좋은 지적입니다."가 가장 신뢰가는 답변입니다. 거짓말은 즉시 들킵니다.' } },

      { subtitle: '피어 리뷰 양식' },
      { table: {
        headers: ['항목', '평가 포인트', '점수'],
        rows: [
          ['문제 정의', '명확하고 공감되는가', '/30'],
          ['LLM 활용', '국내 LLM이 핵심 기능에 쓰였나', '/25'],
          ['UI/UX', '직관적이고 완성도 있는가', '/20'],
          ['기술 구현', '실제 동작 + 안정성', '/15'],
          ['발표력', '논리·시간 관리·전달력', '/10'],
        ],
      } },

      { subtitle: '경진대회 출품 최종 체크리스트' },
      { items: [
        '✅ 서비스가 공개 URL에서 정상 동작 (rest.dreamitbiz.com/팀별 경로)',
        '✅ 국내 LLM이 핵심 기능에 통합됨 (Solar/HyperCLOVA X/EXAONE)',
        '✅ GitHub 저장소 공개 + README 완성 (소개·실행법·기술 스택)',
        '✅ 발표 슬라이드 PDF 백업',
        '✅ 3분 데모 영상 녹화 (대회 제출용 백업)',
        '✅ 팀원 전원 연락처 확인 + 발표 분담',
        '✅ 발표 1회 이상 풀 리허설 완료',
      ] },

      { subtitle: '자주 묻는 질문 (FAQ)' },
      { items: [
        'Q. "발표가 너무 떨려요" — 시작 30초만 외워두고, 나머지는 슬라이드 흐름에 맞춰 자연스럽게. 실수해도 사과하지 말고 계속 진행.',
        'Q. "데모가 망가지면?" — 백업 영상 또는 GIF로 즉시 전환. "사전 녹화된 데모 보여드리겠습니다" 자연스럽게 처리.',
        'Q. "질문에 답을 모르면?" — "좋은 지적입니다. 그 부분은 아직 검증하지 못했습니다. 다음 단계로 검토하겠습니다." — 솔직함이 최고.',
        'Q. "수상 못 했어요" — 4주 만에 0에서 작동하는 AI 서비스를 만들어 발표까지 한 것 자체가 큰 성취. GitHub·포트폴리오로 활용.',
        'Q. "이후 어떻게 학습을 이어가나요?" — ① 현재 프로젝트 지속 개선 ② 새 프로젝트 1개 더 ③ 본인이 쓴 기술의 공식 문서 정독 ④ 커뮤니티 참여.',
      ] },

      { subtitle: '자가 점검 퀴즈' },
      { items: [
        '1. 5분 발표에서 라이브 데모에 할당하는 권장 시간은?',
        '2. 데모 중 인터넷이 끊겼을 때 대비책은?',
        '3. 경진대회 평가 5개 항목 중 가중치 가장 높은 것은?',
        '4. "차별점이 무엇인가요" 질문에 답할 때 강조할 점 1가지는?',
        '5. 발표 첫 슬라이드의 권장 구성은?',
      ] },
      { callout: { type: 'tip', text: '정답: 1) 약 2분  2) 모바일 핫스팟 백업 + 사전 녹화 영상  3) 문제 해결력 (30%)  4) 국내 LLM 활용·도메인 특화·UX 중 1~2개  5) 서비스명 + 한 줄 가치 제안 + 팀명' } },

      { subtitle: '참고 자료' },
      { items: [
        '발표 잘하기: TED-Ed "How to give a great presentation"',
        '도서: 『프레젠테이션 젠』 가르 레이놀즈',
        '슬라이드 영감: pitch.com/templates',
        '경진대회 정보: AI 리부트 경진대회 공식 페이지',
        '계속 학습: 한국 AI 커뮤니티 (모두의 연구소, AI Korea)',
      ] },

      { subtitle: '실습 (4시간)' },
      { items: [
        '팀 내 발표 풀 리허설 1회 (5~10분 + 데모 3분)',
        '피어 리뷰 양식으로 다른 팀 1팀 평가 + 피드백 작성',
        '본 팀 발표에 받은 피드백 반영하여 슬라이드·시나리오 보강',
        '경진대회 출품 최종 체크리스트 7개 모두 통과',
        '4주 회고 — 가장 배운 것·아쉬운 점·다음 학습 계획 작성',
      ] },

      { subtitle: '강의 마무리 — 4주 80시간 완주를 축하합니다' },
      { text: '선수과정 20H + 정규과정 52H + 기술코칭 8H = 80시간의 여정을 완주하셨습니다. AI 코딩 도구와 국내 LLM을 활용해 0에서 동작하는 AI 서비스를 만들고, 경진대회 출품까지 도달한 것은 결코 가벼운 성취가 아닙니다. 이제 본인만의 다음 프로젝트로 학습을 이어가시기 바랍니다.' },
      { callout: { type: 'info', text: '본 강의는 본 사이트 운영사인 드림아이티비즈(DreamIT Biz)의 이애본 대표(총괄 책임교수)가 직접 설계·운영했습니다. 강의 종료 후에도 본 사이트는 계속 운영되며, 후속 코칭과 커뮤니티를 통해 지속적으로 함께합니다.' } },
    ],
    subSections: [
      {
        id: 'reg-13-presentation',
        title: '발표 — 5~10분 마스터',
        icon: '🎤',
        summary: '경진대회 본 발표를 위한 시간 관리·딕션·청중 사로잡기 + 발표 후 Q&A 처리 기법.',
        content: [
          { subtitle: '발표 시작 30초 — 절대 외워두기' },
          { text: '첫 30초가 청중의 집중도를 결정합니다. 외워두면 떨림이 90% 사라지고 자연스러운 흐름을 만들 수 있습니다.' },
          { code: { lang: 'text', content: `[표준 시작 멘트 — 30초]

(1초) [잠시 청중과 눈맞춤]

(5초) 안녕하세요. 팀 DreamIT의 홍길동입니다.

(10초) 저희는 쉬었음청년 67만 명이 진로를 찾지 못해
       1년 이상 공백을 겪는 문제를,

(10초) AI 챗봇과 30분 대화로 본인 적성을 진단해주는
       Career Reboot 서비스로 해결하고자 합니다.

(5초) 지금부터 5분 동안 함께 보시죠.` } },

          { subtitle: '딕션 + 발성 5원칙' },
          { items: [
            '말 속도 — 평소보다 20% 천천히 (떨면 빨라짐)',
            '문장 끝 톤 내려가게 (자신감)',
            '강조어 — 핵심 단어 직전에 짧은 정지',
            '"음·어" 줄이기 — 침묵이 낫다',
            '복식 호흡 — 작은 호흡 자주, 큰 호흡 가끔',
          ] },

          { subtitle: '청중 사로잡기 5기법' },
          { items: [
            '질문 던지기 — "혹시 ___ 경험 있으신가요?"',
            '통계로 충격 — "67만 명. 한국 인구의 1.3%입니다"',
            '스토리 — 페르소나 1명의 짧은 이야기',
            '대비 — "기존엔 X였습니다. 우리는 Y합니다"',
            '눈맞춤 — 청중 3~4명을 골라 순환',
          ] },

          { subtitle: '슬라이드 전환 — 매끄러운 연결어' },
          { table: {
            headers: ['상황', '연결어'],
            rows: [
              ['문제 → 솔루션', '"이 문제를 어떻게 해결할까요"'],
              ['솔루션 → 기능', '"구체적으로 어떤 기능인지"'],
              ['기능 → 기술', '"이걸 어떻게 만들었냐면"'],
              ['기술 → 데모', '"실제로 어떻게 동작하는지 보여드리겠습니다"'],
              ['데모 → 성과', '"이렇게 만든 결과"'],
              ['성과 → 마무리', '"앞으로의 계획은"'],
            ],
          } },

          { subtitle: '라이브 데모 — 4가지 위기 대응' },
          { table: {
            headers: ['위기', '즉각 대응', '평소 준비'],
            rows: [
              ['인터넷 끊김', '"녹화된 영상으로 보여드리겠습니다"', '모바일 핫스팟 + 영상 백업'],
              ['로그인 실패', '"테스트 계정으로 다시 진행"', '계정 2개 + 비밀번호 메모'],
              ['API 응답 느림', '"AI가 생각 중입니다" 멘트', '평소 응답 시간 측정'],
              ['브라우저 멈춤', '"잠시 새로고침"', '미리 한 번 새로고침 후 진행'],
            ],
          } },

          { subtitle: 'Q&A 시간 — 자신 있게' },
          { code: { lang: 'text', content: `[질문 받기 5단계]

1. 들으면서 메모 (1~2단어)
2. 들은 후 1~2초 정리
3. "좋은 질문 감사합니다" (가벼운 인정)
4. 답변 (1~2문장 핵심)
5. "추가 설명 필요하시면 말씀해주세요"

[모르는 질문 — 정직한 응답]
"좋은 지적입니다. 그 부분은 아직 검증하지
 못했습니다. 향후 사용자 피드백을 통해
 확인해보겠습니다."

[적대적 질문 — 평정심]
공격적 질문이 와도 방어적·감정적 X.
"그 우려는 충분히 이해합니다.
 저희도 ___ 측면에서 보완하려 합니다."

[너무 긴 질문]
"질문을 정리하면 ___이라는 말씀이시죠?"
재구성으로 시간 절약` } },

          { subtitle: '발표 후 — 즉시 해야 할 것' },
          { items: [
            '심판·심사위원에게 가까이 가서 짧은 인사',
            '명함 또는 연락처 교환',
            '받은 피드백 메모 (잊지 않게 즉시)',
            '청중 중 관심 보인 사람에게 후속 연락 약속',
            '팀원에게 "오늘 잘했어!" 칭찬',
          ] },

          { subtitle: '실습' },
          { items: [
            '시작 30초 외우기 + 거울 앞 1회 연습',
            '5분 풀 리허설 + 시간 측정',
            'Q&A 예상 10개에 답변 즉답 연습',
            '데모 위기 4종 대응 멘트 준비',
            '팀원 간 상호 피드백',
          ] },
        ],
      },

      {
        id: 'reg-13-demo',
        title: '라이브 데모 — 3분 시나리오',
        icon: '🎬',
        summary: '발표의 클라이맥스. 3분 안에 서비스의 가치를 보여주는 단계별 시나리오 + 안전장치.',
        content: [
          { subtitle: '왜 데모가 중요한가' },
          { text: '슬라이드 100장보다 실제 동작 30초가 강력합니다. 청중은 "이게 진짜 되는구나"를 느끼는 순간 신뢰가 폭증합니다. 발표 점수의 30~40%가 데모에서 결정됨.' },

          { subtitle: '3분 시나리오 — 표준 구조' },
          { code: { lang: 'text', content: `[Career Reboot 데모 시나리오 — 정확히 3분]

00:00~00:15 (15초)
  랜딩 페이지 → 메인 화면 한 번 보여주기
  멘트: "처음 사이트에 오신 분은 이렇게 보입니다.
        화려한 설명 없이, 한 번에 본질로 갑니다."

00:15~00:30 (15초)
  "시작하기" 버튼 클릭 → 가입 페이지
  사전 등록 계정으로 즉시 로그인
  멘트: "데모를 위해 미리 가입한 계정으로 들어가겠습니다."

00:30~00:50 (20초)
  진단 시작 → 첫 질문 표시
  사용자 답변 1턴 직접 입력
  멘트: "AI가 자연어로 진단을 시작합니다.
        한국어 처리에 최적화된 Solar Pro를 사용했습니다."

00:50~01:50 (60초)
  AI 응답 후 사용자 답변 2~3턴 빠르게 진행
  중간에 멘트: "총 15턴 대화가 진행됩니다. 시연에서는 짧게."
  미리 입력한 답변을 빠르게 클릭

01:50~02:20 (30초)
  진단 완료 → 결과 화면 표시
  추천 직무 3개 표시
  멘트: "30분 대화 결과 3개 직무가 추천됩니다.
        백엔드 개발자, 데이터 분석가, AI 엔지니어
        — 각각 적합도와 함께"

02:20~02:50 (30초)
  추천 직무 1개 클릭 → 학습 로드맵
  멘트: "선택하신 직무에 맞춰 8주 학습 로드맵이
        자동 생성됩니다. 주차별 학습 내용과
        추천 자료가 큐레이션되어 있습니다."

02:50~03:00 (10초)
  마무리 — 처음 화면으로 돌아가 인사
  멘트: "처음 사이트에 온 사용자가 30분 후 명확한
        다음 단계를 갖고 떠납니다. 이게 우리 서비스의 가치입니다."

  → 슬라이드 7번 (성과·검증)으로 전환` } },

          { subtitle: '시나리오 작성 5원칙' },
          { items: [
            '핵심 가치 → 부가 기능 순서',
            '말을 줄이고 동작 보여주기',
            '대기 시간 0초 — 모든 데이터 사전 준비',
            '시각적 임팩트 — 큰 변화 (빈 → 가득)',
            '마지막 30초에 결과 보여주기 (감정적 마무리)',
          ] },

          { subtitle: '데모용 데이터 사전 준비' },
          { items: [
            '계정 2~3개 미리 가입',
            '진단 답변 미리 준비 (붙여넣기용 메모장)',
            '결과 데이터가 매력적인지 확인 (실제 추천 결과)',
            '학습 로드맵 1~2개 미리 채워두기',
            '데모 시작 직전 한 번 클릭해서 캐싱',
          ] },

          { subtitle: '안전장치 4중' },
          { table: {
            headers: ['Plan', '내용'],
            rows: [
              ['A — Live', '실제 사이트에서 시연 (제일 좋음)'],
              ['B — Backup video', '미리 녹화한 영상 (인터넷 끊김 시)'],
              ['C — GIF', '핵심 5개 단계 5초짜리 GIF (느릴 때)'],
              ['D — Screenshot', '정적 이미지 (최후 수단)'],
            ],
          } },

          { subtitle: '데모 전환 멘트' },
          { code: { lang: 'text', content: `[자연스러운 데모 시작]
"여기까지 설명이었습니다. 이제 실제로 어떻게
 동작하는지 보여드리겠습니다."
[데모 시작]

[데모 도중 문제 — A→B 전환]
"네트워크가 잠시 불안정한 것 같습니다.
 미리 녹화한 영상으로 보여드리겠습니다."
[Plan B 영상 재생]

[데모 종료]
"이렇게 30분이 사용자의 진로를 바꿉니다.
 마지막으로 우리가 측정한 결과입니다."
[슬라이드 7로 전환]` } },

          { subtitle: '실습' },
          { items: [
            '3분 시나리오 초 단위로 작성',
            '데모용 데이터 사전 준비 완료',
            'Plan B 영상 3분 녹화 (Loom 또는 OBS)',
            '핵심 GIF 5개 준비',
            '실제 발표장 환경에서 1회 시연 (와이파이 차단 시뮬레이션)',
          ] },
        ],
      },

      {
        id: 'reg-13-peer-review',
        title: '피어 리뷰 — 다른 팀 평가',
        icon: '👥',
        summary: '동료 팀 발표를 객관적으로 평가하고 건설적 피드백을 주는 방법.',
        content: [
          { subtitle: '피어 리뷰 양식 (100점)' },
          { table: {
            headers: ['항목', '배점', '평가 포인트'],
            rows: [
              ['문제 정의', '20', '명확하고 공감되는가 / 통계 근거'],
              ['솔루션 적합성', '20', 'AI가 진짜 해결하는가 / 차별성'],
              ['국내 LLM 활용', '15', 'Solar 등 핵심 기능에 통합'],
              ['UI/UX', '15', '직관·완성도·모바일 대응'],
              ['기술 구현', '10', '실제 동작 + 안정성'],
              ['발표력', '10', '논리·시간 관리·전달력'],
              ['데모', '10', '시연 매끄러움·임팩트'],
            ],
          } },

          { subtitle: '건설적 피드백 패턴 — SBI' },
          { code: { lang: 'text', content: `[Situation-Behavior-Impact]

S (Situation): 어떤 상황에서
B (Behavior): 어떤 행동을 했고
I (Impact): 어떤 영향이 있었다

[좋은 피드백 예시]
"문제 정의 슬라이드에서 (S),
 67만 명이라는 구체적 숫자를 제시한 것 (B)이
 청중에게 문제의 규모를 명확히 전달했습니다 (I)."

"데모 중 (S) AI 응답이 느려졌을 때 (B)
 'AI가 생각 중입니다'라고 자연스럽게 멘트한 것 (B)이
 청중의 어색함을 없앴습니다 (I)."

[나쁜 피드백 예시]
"발표 잘했어요."   ← 구체성 0
"좀 별로였어요."   ← 부정적 + 불명확` } },

          { subtitle: '피드백 톤 — 3대 1 비율' },
          { text: '긍정 3 : 개선 1 비율이 가장 받아들이기 좋음. 개선 제안만 늘어놓으면 방어적이 되고, 칭찬만 하면 성장 X.' },
          { code: { lang: 'text', content: `[균형잡힌 피드백 예시 — 5분]

긍정 1: 문제 정의가 매우 명확했습니다.
긍정 2: 데모가 시간 안에 매끄럽게 진행됐어요.
긍정 3: 국내 LLM 활용도가 인상 깊었습니다.

개선 제안: 발표 시 슬라이드 3에서 글자가 작아
        뒷자리에서 안 보였습니다. 다음에는 24pt
        이상 권장합니다.

[마무리]
전반적으로 잘 준비된 발표였습니다.
경진대회 좋은 결과 기대합니다.` } },

          { subtitle: '리뷰 작성 양식' },
          { code: { lang: 'text', content: `[팀명] Career Reboot
[평가일] 2026-06-22
[평가자] 홍길동 (Team DreamIT)

[항목별 점수]
- 문제 정의 (20):     18/20
- 솔루션 (20):        16/20
- 국내 LLM (15):      15/15
- UI/UX (15):         13/15
- 기술 (10):          8/10
- 발표력 (10):        9/10
- 데모 (10):          9/10
합계: 88/100

[긍정 평가 3가지]
1. 페르소나가 매우 구체적이어서 공감이 잘 됐습니다.
2. Solar API 활용이 핵심 기능에 잘 녹아 있었습니다.
3. 데모에서 실시간 응답이 자연스러웠습니다.

[개선 제안 1가지]
모바일 화면 시연이 없었습니다. 한국 트래픽 70%가
모바일임을 고려하면 모바일 데모도 30초 정도
추가하면 더 강력할 것 같습니다.

[총평]
완성도 높고 실제 사용 가능한 수준의 MVP입니다.
경진대회 본선 진출 기대합니다.` } },

          { subtitle: '실습' },
          { items: [
            '다른 팀 1팀 발표 점수표 작성',
            'SBI 패턴으로 긍정 3 + 개선 1 작성',
            '발표 종료 후 즉시 전달',
            '본인 팀이 받은 피드백 즉시 메모',
            '받은 피드백 중 1개를 즉시 슬라이드에 반영',
          ] },
        ],
      },

      {
        id: 'reg-13-competition',
        title: '경진대회 출품 + 최종 점검',
        icon: '🏆',
        summary: 'AI 리부트 경진대회 출품 전 모든 자료를 최종 점검하고 제출하는 단계별 가이드.',
        content: [
          { subtitle: 'AI 리부트 경진대회 평가 기준' },
          { table: {
            headers: ['항목', '가중치', '핵심'],
            rows: [
              ['서비스의 문제 해결력', '30%', '명확한 문제 + 실제 솔루션'],
              ['국내 LLM 활용도', '25%', '핵심 기능에 통합'],
              ['UI/UX 완성도', '20%', '직관·모바일·디자인'],
              ['기술 구현력', '15%', '실제 동작 + 안정성'],
              ['발표력', '10%', '논리·시간·임팩트'],
            ],
          } },

          { subtitle: '출품 자료 8종' },
          { items: [
            '☐ Live Demo URL — https://rest.dreamitbiz.com',
            '☐ GitHub Repository (Public) — README 완성',
            '☐ 발표 자료 (PDF, 8슬라이드)',
            '☐ 발표 영상 (3분 데모 녹화)',
            '☐ 팀 정보 (이름·연락처·역할)',
            '☐ 사용 LLM 명시 (Solar Pro 사용 증빙)',
            '☐ 베타 테스트 결과 (있다면)',
            '☐ 향후 발전 계획서',
          ] },

          { subtitle: '최종 점검 체크리스트 30개' },
          { items: [
            '☐ 서비스가 공개 URL에서 정상 동작 (다른 기기·다른 네트워크)',
            '☐ HTTPS 적용 + 인증서 정상',
            '☐ 모바일에서 정상 (iOS·Android 둘 다)',
            '☐ 회원가입·로그인 정상',
            '☐ 핵심 기능 (챗봇·결과) 정상 동작',
            '☐ 국내 LLM이 실제 호출되고 응답함',
            '☐ 결과 페이지에 의미 있는 데이터',
            '☐ 모든 라우트 동작 (새로고침 시에도)',
            '☐ 에러 처리 — 네트워크 끊김 등',
            '☐ 빈 상태·로딩 상태 UI',
            '☐ 다크모드 정상 (있다면)',
            '☐ Lighthouse 모바일 80+',
            '☐ axe DevTools 접근성 90+',
            '☐ 콘솔에 에러 없음',
            '☐ 모든 console.log 제거 또는 debug 모드',
            '☐ GitHub Repo Public',
            '☐ README 데모 GIF 포함',
            '☐ README 실행 방법 정확',
            '☐ .env.example 최신',
            '☐ LICENSE 파일',
            '☐ .gitignore에 .env·node_modules 포함',
            '☐ git log에 API 키 노출 흔적 없음',
            '☐ npm audit 0 high·critical',
            '☐ 발표 자료 PDF 백업',
            '☐ 발표 영상 mp4 백업',
            '☐ 사용자 인용 또는 베타 결과',
            '☐ 팀원 전원 이름·연락처 명시',
            '☐ 발표 시간 5~10분 내',
            '☐ 데모 3분 안전 진행 가능',
            '☐ Q&A 예상 질문 10개 답변 준비',
          ] },

          { subtitle: 'README 최종 점검' },
          { items: [
            '제목 + 한 줄 가치 제안',
            '데모 GIF 또는 스크린샷 (5초 이내 핵심)',
            'Live Demo 링크',
            '주요 기능 4~6개',
            '기술 스택 (특히 국내 LLM 명시)',
            '설치·실행 명령어 (복사 가능)',
            '폴더 구조',
            '팀원 정보',
            '라이선스',
            '경진대회 출품 표시',
          ] },

          { subtitle: '제출 — 마지막 단계' },
          { items: [
            '경진대회 홈페이지 접속',
            '필수 항목 빠짐없이 입력',
            '제출 전 PDF·영상 한 번 더 열어보기',
            '제출 후 확인 이메일 캡처',
            '팀 전원에게 제출 완료 공유',
            '하루 동안 사이트 모니터링 (혹시 다운 시 대응)',
          ] },

          { subtitle: '제출 후 — 운영 모니터링' },
          { items: [
            'Supabase 사용량 — 무료 한도 초과 안 하게',
            'LLM API 사용량 + 비용',
            '예상치 못한 에러 (Sentry 등)',
            '심판·심사위원이 직접 사용해볼 수 있도록 가이드',
            '문제 발견 시 즉시 패치 + 재배포',
          ] },

          { subtitle: '실습 — 최종 마무리' },
          { items: [
            '최종 체크리스트 30개 모두 통과',
            '경진대회 출품 자료 8종 모두 준비',
            'GitHub README 매력적으로 작성',
            '제출 + 확인',
            '팀원 + 강사에게 감사 인사',
          ] },
        ],
      },

      {
        id: 'reg-13-retrospective',
        title: '4주 회고 + 다음 단계',
        icon: '🎯',
        summary: '4주의 학습 여정을 돌아보고 다음 학습 계획을 수립합니다. 학습은 본 강의 종료가 아닌 시작.',
        content: [
          { subtitle: '4주 회고 양식 — KPT' },
          { code: { lang: 'text', content: `[Keep — 잘한 것, 계속할 것]
- 무엇이 잘 됐나?
- 어떤 습관이 도움이 됐나?
- 다음 프로젝트에도 가져갈 것?

[Problem — 어려웠던 것, 개선할 것]
- 무엇이 막혔나?
- 시간을 가장 많이 쓴 곳?
- 다시 한다면 다르게 할 것?

[Try — 다음에 시도할 것]
- 새로 배우고 싶은 것?
- 다음 프로젝트 아이디어?
- 어떤 도구·기법을 더 깊이?` } },

          { subtitle: '4주 학습 정리 — 다섯 가지 가장 큰 배움' },
          { items: [
            '바이브코딩 — AI와 협업하는 새로운 코딩 패러다임',
            '국내 LLM — Solar Pro 등 한국어 최적화 모델 실전 활용',
            'Supabase — 풀스택 백엔드를 코드로 구축',
            'React 19 + Vite 7 — 모던 프론트엔드 표준',
            '제품 사고 — 코딩 전 문제 정의·MVP·검증',
          ] },

          { subtitle: '학습 곡선 — 본인 위치 파악' },
          { table: {
            headers: ['단계', '특징', '다음 학습'],
            rows: [
              ['1주차 충격', '"이게 다 되네?"', '검수 습관 만들기'],
              ['2주차 환멸', '"역시 AI는…"', '한계 인지 + 개선 사이클'],
              ['3주차 균형', '검수의 중요성', '본인 영역 식별'],
              ['4주차 숙련', 'AI를 도구로', '깊이 있는 1개 영역 선택'],
              ['1개월~ 전문가', '독립적 판단', '오픈소스 기여·블로그·강의'],
            ],
          } },

          { subtitle: '다음 학습 로드맵 — 3단계' },
          { code: { lang: 'text', content: `[Phase 1 — 본 프로젝트 지속 운영 (1~2개월)]
- 사용자 피드백 수집 + 개선
- 추가 기능 1~2개 (Should 등급)
- 1,000명 가입 목표
- 운영 로그·비용 모니터링

[Phase 2 — 신규 프로젝트 (2~3개월)]
- 본 프로젝트와 다른 도메인 (예: 교육·금융·헬스)
- 본 강의 + 새 기술 1개 추가
  → Next.js (SSR)
  → React Native (모바일)
  → AI Agent (LangChain)
  → 또는 다른 백엔드 (Vercel·Cloudflare)

[Phase 3 — 전문성 심화 (6개월~)]
- 1개 영역 선택해서 깊이
  → AI/ML 엔지니어링
  → 풀스택 프로덕트
  → 데브옵스·인프라
- 오픈소스 기여 1개 이상
- 블로그·강의·세미나 발표` } },

          { subtitle: '취업 활용 — 포트폴리오로' },
          { items: [
            'GitHub 잔디 — 4주 동안 매일 commit 흔적',
            'README 매력적으로 다듬기 (이미지·이모지)',
            '본 프로젝트를 포트폴리오 사이트에 게시',
            'LinkedIn 프로필 업데이트 — 스킬·프로젝트',
            '면접에서 본 프로젝트 5분 설명 준비',
          ] },

          { subtitle: '커뮤니티 + 네트워크' },
          { items: [
            'AI Reboot 경진대회 동기들과 연락',
            '동료 팀원 LinkedIn 연결',
            '강사 + 운영사 SNS·뉴스레터 구독',
            'Discord — Cursor·Anthropic·Korean LLM',
            '오프라인 — 모두의연구소·AI Korea 모임',
          ] },

          { subtitle: '본 강의 후속 — 운영사 메시지' },
          { text: '본 사이트(rest.dreamitbiz.com)는 강의 종료 후에도 계속 운영됩니다. 학습 노트는 평생 무료 열람 가능하고, 후속 코칭·1:1 멘토링은 신청 가능합니다. 본 강사(이애본 박사)의 다른 강의(University·Coding-Hub 등)에도 참여할 수 있습니다.' },

          { subtitle: '실습 — 최종 회고' },
          { items: [
            'KPT 양식으로 4주 회고 작성 (블로그 또는 노트)',
            '본인의 다음 3개월 학습 로드맵 작성',
            '동료 팀원 + 강사에게 감사 메시지',
            'GitHub 프로필에 본 프로젝트 핀',
            'LinkedIn에 본 강의 수료 + 프로젝트 추가',
          ] },
        ],
      },

      {
        id: 'reg-13-practice-1',
        title: '실습 1 · 발표 시작 30초 외우기 (15분)',
        icon: '🧪',
        summary: '첫 30초만 외워두면 떨림 90% 사라짐. 거울 앞 1회 + 동료 앞 1회.',
        content: [
          { subtitle: '본인 팀에 맞춰 30초 멘트 작성' },
          { code: { lang: 'text', content: `[표준 양식]

(1초) [눈맞춤]

(5초) 안녕하세요. 팀 [팀명]의 [본인 이름]입니다.

(10초) 저희는 [페르소나]가 [핵심 문제]를 겪는 문제를,

(10초) [핵심 솔루션]을 통해 해결하고자 합니다.

(5초) 지금부터 [N분] 동안 함께 보시죠.

[작성 예시 — Career Reboot]

안녕하세요. 팀 DreamIT의 김민지입니다.
저희는 쉬었음청년 67만 명이 진로를 찾지 못해
1년 이상 공백을 겪는 문제를,
국내 LLM Solar 챗봇과의 30분 대화로 적성 진단을
제공하는 Career Reboot 서비스로 해결하고자 합니다.
지금부터 5분 동안 함께 보시죠.` } },

          { subtitle: '연습 단계' },
          { items: [
            '본인 멘트 작성 (5분)',
            '거울 앞에서 5회 반복',
            '시간 측정 — 정확히 30초인가?',
            '동료에게 들어달라고 + 피드백',
            '수정 후 다시 5회',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 정확히 30초',
            '☐ 첫 30초 막힘 없이 진행',
            '☐ 자연스러운 눈맞춤',
            '☐ 핵심 메시지 명확',
            '☐ 동료 피드백 통과',
          ] },
        ],
      },

      {
        id: 'reg-13-practice-2',
        title: '실습 2 · 3분 데모 풀 리허설 (30분)',
        icon: '🧪',
        summary: '실제 환경에서 데모 풀 리허설 — 시간 측정 + 위기 대응 시뮬레이션.',
        content: [
          { subtitle: 'Day 12에서 작성한 시나리오로 풀 리허설' },

          { subtitle: '단계' },
          { items: [
            '1. 발표 환경 셋업 (Zoom·OBS·노트북)',
            '2. 사전 계정 로그인 + 데모 데이터 확인',
            '3. 시작 30초 멘트 → 데모 3분 → 마무리',
            '4. 타이머로 정확한 시간 측정',
            '5. 동료가 보고 피드백',
            '6. 위기 시뮬레이션 — 의도적으로 인터넷 끄기 → Plan B 전환 연습',
            '7. 시간 초과 시 어디 줄일지 결정',
          ] },

          { subtitle: '리허설 체크리스트' },
          { items: [
            '☐ 정확히 3분 (±10초)',
            '☐ 멘트 막힘 없음',
            '☐ 화면 전환 자연스러움',
            '☐ 데모 입력 정상',
            '☐ Plan B (영상) 전환 자연스러움',
            '☐ 마무리 멘트 자연스러움',
          ] },

          { subtitle: '시간 분배 조정' },
          { table: {
            headers: ['구간', '계획', '실제', '조정'],
            rows: [
              ['시작 멘트', '15s', '?', '단축?'],
              ['가입+진단 시작', '45s', '?', '?'],
              ['진단 진행', '60s', '?', '?'],
              ['결과', '30s', '?', '?'],
              ['로드맵', '20s', '?', '?'],
              ['마무리', '10s', '?', '?'],
            ],
          } },
        ],
      },

      {
        id: 'reg-13-practice-3',
        title: '실습 3 · 예상 질문 10개 답변 준비 (25분)',
        icon: '🧪',
        summary: '본인 팀에 올 수 있는 질문 10개와 답변을 준비.',
        content: [
          { subtitle: '표준 예상 질문 10개' },
          { code: { lang: 'text', content: `[기술 관련]
1. 왜 이 LLM(Solar)을 골랐나요?
2. 보안은 어떻게 처리하셨나요?
3. 확장성 — 1만 명이 쓰면 어떻게 되나요?
4. 비용 모델은?
5. 다른 LLM (GPT-5 등)도 고려하셨나요?

[제품 관련]
6. 차별점이 무엇인가요?
7. 타겟 사용자는 누구인가요?
8. MVP 후 다음 단계는?
9. 베타 테스트 결과는?

[팀 관련]
10. 팀원 역할 분담은?` } },

          { subtitle: '본인 팀 답변 작성 양식' },
          { code: { lang: 'text', content: `[질문 1] 왜 Solar를 골랐나요?
[답변] 비교한 모델: Solar / HyperCLOVA X / GPT-5.
       선정 이유: (1) 국내 LLM 활용도 25% 경진대회 평가 충족,
                  (2) 한국어 토큰 효율 30% 우위, (3) 비용 절반.
       폴백: HyperCLOVA X로 자동 전환 구현.

[질문 2] 보안은?
[답변] 3중 안전망:
       (1) API 키 → Supabase Edge Function으로 서버 보관
       (2) DB → RLS 정책으로 행 단위 권한
       (3) HTTPS 강제 + Enforce 인증서

... (10개 모두 작성)` } },

          { subtitle: '모르는 질문 대응 멘트' },
          { code: { lang: 'text', content: `[표준 멘트]
"좋은 지적입니다. 그 부분은 아직 검증하지 못했습니다.
 향후 사용자 피드백을 통해 확인해보겠습니다."

또는

"훌륭한 후속 과제로 받아들이겠습니다.
 다음 버전에서 다루도록 하겠습니다."

[금지 사항]
- 거짓말 (즉시 들킴)
- 방어적 어조 ("그건 아니고요...")
- 길게 변명
- "잘 모르겠어요" 단독 (반드시 후속 멘트)` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 10개 질문 모두 답변 작성',
            '☐ 답변은 30초 이내 길이',
            '☐ 모르는 질문 멘트 준비',
            '☐ 동료와 모의 Q&A 1회',
          ] },
        ],
      },

      {
        id: 'reg-13-practice-4',
        title: '실습 4 · 피어 리뷰 작성 (20분)',
        icon: '🧪',
        summary: 'SBI 패턴으로 다른 팀 발표에 건설적 피드백 작성.',
        content: [
          { subtitle: '평가 양식 (100점)' },
          { table: {
            headers: ['항목', '배점', '평가 포인트'],
            rows: [
              ['문제 정의', '20', '명확한가 / 공감되는가 / 통계 있는가'],
              ['솔루션 적합성', '20', 'AI가 진짜 해결하는가 / 차별성'],
              ['국내 LLM 활용', '15', '핵심 기능에 통합'],
              ['UI/UX', '15', '직관·완성도·모바일'],
              ['기술 구현', '10', '실제 동작 + 안정성'],
              ['발표력', '10', '논리·시간 관리'],
              ['데모', '10', '시연 매끄러움'],
            ],
          } },

          { subtitle: 'SBI 패턴 피드백' },
          { code: { lang: 'text', content: `[Situation-Behavior-Impact]

S (Situation): 어떤 상황에서
B (Behavior): 어떤 행동을 했고
I (Impact): 어떤 영향이 있었다

[좋은 피드백 예]
"문제 정의 슬라이드에서 (S),
 67만 명이라는 구체적 숫자를 제시한 것 (B)이
 청중에게 문제의 규모를 명확히 전달했습니다 (I)."

[나쁜 피드백 예]
"발표 잘했어요" ← 구체성 0
"문제가 좀 약했어요" ← 부정 + 불명확` } },

          { subtitle: '3:1 비율 (긍정 3 : 개선 1)' },
          { code: { lang: 'text', content: `[리뷰 예시 — 5분]

긍정 1: 페르소나 묘사가 매우 구체적이어서 공감 잘 됐어요.
긍정 2: 데모가 시간 안에 매끄럽게 진행됐어요.
긍정 3: 국내 LLM 활용도가 인상 깊었습니다.

개선 제안: 발표 슬라이드 3의 글자가 작아 뒷자리에서
        안 보였습니다. 다음에는 24pt 이상 권장합니다.

총평: 전반적으로 잘 준비된 발표였습니다.
     경진대회 좋은 결과 기대합니다.` } },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 100점 양식으로 점수 매김',
            '☐ SBI 패턴 사용',
            '☐ 긍정 3 + 개선 1 비율',
            '☐ 구체적 (사례 + 영향)',
            '☐ 발표 직후 전달',
          ] },
        ],
      },

      {
        id: 'reg-13-practice-5',
        title: '실습 5 · 경진대회 출품 최종 점검 (30분)',
        icon: '🧪',
        summary: '30개 체크리스트 모두 통과 + 8종 출품 자료 준비 완료.',
        content: [
          { subtitle: '30개 최종 체크리스트' },
          { items: [
            '☐ 서비스가 공개 URL에서 정상 동작',
            '☐ 다른 기기·다른 네트워크에서도 동작',
            '☐ HTTPS 강제 + 인증서 정상',
            '☐ 모바일에서 정상 (iOS·Android)',
            '☐ 회원가입·로그인 정상',
            '☐ 핵심 기능 모두 동작',
            '☐ 국내 LLM 실제 호출 확인',
            '☐ 결과 페이지에 의미 있는 데이터',
            '☐ 모든 라우트 새로고침 정상',
            '☐ 에러 처리 완성',
            '☐ 빈/로딩/에러/성공 4상태',
            '☐ 다크모드 동작',
            '☐ Lighthouse 모바일 80+',
            '☐ axe DevTools 접근성 90+',
            '☐ Console 에러 0',
            '☐ console.log 제거 (debug 모드 외)',
            '☐ GitHub Repo Public',
            '☐ README 데모 GIF 포함',
            '☐ README 실행 방법 정확',
            '☐ .env.example 최신',
            '☐ LICENSE 파일',
            '☐ .gitignore 정확',
            '☐ git log 키 노출 없음',
            '☐ npm audit 0 high·critical',
            '☐ 발표 자료 PDF 백업',
            '☐ 발표 영상 mp4 백업',
            '☐ 베타 결과 (있다면)',
            '☐ 팀원 정보 명시',
            '☐ 발표 시간 5~10분 내',
            '☐ Q&A 답변 10개 준비',
          ] },

          { subtitle: '출품 자료 8종 준비' },
          { items: [
            '☐ Live Demo URL',
            '☐ GitHub Repository (Public)',
            '☐ 발표 자료 (PDF, 8슬라이드)',
            '☐ 발표 영상 (3분 mp4)',
            '☐ 팀 정보 (이름·연락처·역할)',
            '☐ 사용 LLM 명시 (Solar Pro)',
            '☐ 베타 테스트 결과',
            '☐ 향후 발전 계획서',
          ] },

          { subtitle: '제출' },
          { items: [
            '경진대회 홈페이지 접속',
            '필수 항목 모두 입력',
            '제출 전 PDF·영상 한 번 더 열어보기',
            '제출 → 확인 이메일 캡처',
            '팀 전원에게 공유',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ 30개 체크리스트 모두 통과',
            '☐ 8종 자료 모두 준비',
            '☐ 제출 완료 + 확인',
            '☐ 운영 모니터링 (24시간)',
          ] },
        ],
      },

      {
        id: 'reg-13-practice-6',
        title: '실습 6 · 4주 회고 + 다음 학습 계획 (30분)',
        icon: '🧪',
        summary: 'KPT 회고 + 본인 다음 3개월 학습 로드맵 작성.',
        content: [
          { subtitle: 'KPT 양식' },
          { code: { lang: 'text', content: `[Keep — 잘한 것, 계속할 것]
- 무엇이 잘 됐나?
- 어떤 습관이 도움이 됐나?
- 다음 프로젝트에도 가져갈 것?

[Problem — 어려웠던 것, 개선할 것]
- 무엇이 막혔나?
- 시간을 가장 많이 쓴 곳?
- 다시 한다면 다르게 할 것?

[Try — 다음에 시도할 것]
- 새로 배우고 싶은 것?
- 다음 프로젝트 아이디어?
- 어떤 도구·기법을 더 깊이?` } },

          { subtitle: '4주 전 vs 후 자가 평가' },
          { code: { lang: 'text', content: `|역량               |Before  |After   |성장 |
|-------------------|--------|--------|-----|
|AI/LLM 이해         | __     | __     |     |
|프롬프트 엔지니어링  | __     | __     |     |
|HTML/CSS           | __     | __     |     |
|JavaScript         | __     | __     |     |
|React              | __     | __     |     |
|TypeScript         | __     | __     |     |
|Supabase           | __     | __     |     |
|LLM API 통합       | __     | __     |     |
|디자인·UX          | __     | __     |     |
|배포               | __     | __     |     |
|디버깅·테스트       | __     | __     |     |
|발표·커뮤니케이션   | __     | __     |     |
|-------------------|--------|--------|-----|
|합계               | ___    | ___    |     |

→ 가장 큰 성장 영역 = 강점
→ 약한 영역 = 다음 학습 우선순위` } },

          { subtitle: '3개월 학습 로드맵' },
          { code: { lang: 'text', content: `[Phase 1 · 1개월: 본 프로젝트 운영]
- 사용자 50~100명 모집
- 피드백 수집 + 개선 5회 이상
- 운영 비용·로그 모니터링
- 블로그 글 1편 (회고)

[Phase 2 · 2개월차: 신규 프로젝트]
- 본 강의와 다른 도메인 선택 (헬스·금융 등)
- 새 기술 1개 도입 (Next.js / React Native 등)
- 4주 안에 MVP 완성

[Phase 3 · 3개월차: 전문성 심화]
- 1개 영역 선택 (AI / 풀스택 / 데브옵스)
- 오픈소스 PR 1개 이상
- 강의·블로그 글 3편

[취업 활용]
- GitHub 잔디 매일
- README 다듬기
- 포트폴리오 사이트 게시
- LinkedIn 업데이트
- 면접 시 5분 설명 준비` } },

          { subtitle: '졸업 메시지 작성' },
          { items: [
            '본인이 가장 자랑스러운 점 1줄',
            '팀원에게 감사 메시지',
            '강사에게 감사 메시지',
            '본인의 다음 1년 목표',
            '졸업 인증샷 (선택)',
          ] },

          { subtitle: '평가 기준' },
          { items: [
            '☐ KPT 회고 작성',
            '☐ Before/After 자가 평가',
            '☐ 3개월 로드맵 작성',
            '☐ LinkedIn에 본 강의 수료 + 프로젝트 추가',
            '☐ 동기·강사에게 감사 메시지',
          ] },
        ],
      },

      {
        id: 'reg-13-resources',
        title: '평생 학습 자료 + 마무리',
        icon: '📚',
        summary: '본 4주 이후 평생 활용할 수 있는 학습 자료 + 강의 종료 메시지.',
        content: [
          { subtitle: 'AI·LLM 평생 학습 자료' },
          { items: [
            '📰 뉴스: TechCrunch AI, 잡고AI 한국어 뉴스레터',
            '📺 YouTube: Andrej Karpathy, Theo Browne, Fireship',
            '🐦 X(트위터): @karpathy @swyx @AnthropicAI @OpenAI',
            '📚 도서: 『AI 만들기』·『The Pragmatic Programmer』',
            '🎓 강의: deeplearning.ai 무료 코스',
            '🔬 논문: arxiv.org/list/cs.CL',
            '🌐 한국: 모두의 AI 연구소·AI Korea',
          ] },

          { subtitle: '실력 향상 — 매주 루틴' },
          { code: { lang: 'text', content: `[권장 주간 루틴 — 1일 1시간]

월: 새 기술 1개 학습 (30분)
화: 본인 프로젝트 개선 (60분)
수: 오픈소스 코드 읽기 (30분)
목: 새 라이브러리·API 실험 (60분)
금: 회고 + 다음 주 계획 (30분)
토: 사이드 프로젝트 (2~3시간)
일: 휴식 또는 가벼운 학습

[월 1회]
- 새 도서 1권
- 컨퍼런스·세미나 1개
- 블로그 글 1편 작성` } },

          { subtitle: '실력 검증 — 자기 평가 매트릭스' },
          { table: {
            headers: ['차원', '주니어', '미들', '시니어'],
            rows: [
              ['React', 'Hook 사용', '커스텀 Hook + Context', '아키텍처 설계'],
              ['LLM', 'API 호출', '프롬프트 + 폴백', 'RAG + Agent + 파인튜닝'],
              ['배포', '수동 deploy', 'CI/CD 자동', 'Multi-region + Canary'],
              ['디자인', 'CSS 기본', '디자인 시스템', 'UX 리서치 + 검증'],
              ['협업', 'GitHub 사용', 'PR + 리뷰', '아키텍처 결정·멘토링'],
            ],
          } },

          { subtitle: '본 강의 마무리 메시지' },
          { text: '4주 80시간의 여정을 완주하신 모든 분께 진심으로 축하드립니다. 본 강의는 끝이지만, 이는 더 큰 여정의 시작입니다. AI 시대의 개발자로서 평생 학습하는 자세를 갖고, 본인의 호기심을 따라가시기 바랍니다.' },
          { callout: { type: 'info', text: '본 강의를 이끌어주신 이애본 대표(드림아이티비즈) — 한신대학교 AI·SW대학 겸임교수 — 께 감사드립니다. 본 사이트는 강의 종료 후에도 계속 운영되며, 후속 코칭·신규 강의·커뮤니티를 통해 지속적으로 함께합니다.' } },

          { subtitle: '연락처 + 후속' },
          { items: [
            '📧 강사 직통: aebon@dreamitbiz.com',
            '🌐 본사이트: www.dreamitbiz.com',
            '🔗 LinkedIn: 이애본 박사',
            '💬 카카오톡: @aebon',
            '📚 후속 강의 목록: https://www.dreamitbiz.com/courses',
            '🤝 1:1 멘토링: aebon@dreamitbiz.com로 신청',
          ] },

          { subtitle: '최종 자가 평가 — 4주 전과 후' },
          { code: { lang: 'text', content: `[강의 시작 전 vs 4주 후 비교표]

역량별로 본인이 직접 1~5점 평가:

|역량               |Before  |After   |
|-------------------|--------|--------|
|AI/LLM 기본 이해    | ___    | ___    |
|프롬프트 엔지니어링  | ___    | ___    |
|HTML/CSS           | ___    | ___    |
|JavaScript         | ___    | ___    |
|React              | ___    | ___    |
|TypeScript         | ___    | ___    |
|Supabase           | ___    | ___    |
|LLM API 통합       | ___    | ___    |
|디자인·UX          | ___    | ___    |
|배포               | ___    | ___    |
|디버깅·테스트       | ___    | ___    |
|발표·커뮤니케이션   | ___    | ___    |

총점 변화: ___ → ___

→ 본인의 성장을 시각적으로 확인
→ 가장 큰 성장 영역 = 본인의 강점
→ 약한 영역 = 다음 학습 우선순위` } },

          { subtitle: '졸업 축하 — 다음 만남까지' },
          { text: '본 강의를 완주하셨다면 이제 AI 시대의 개발자입니다. 본인의 다음 프로젝트로 학습을 이어가시고, 어려움이 생기면 언제든 본 사이트로 돌아오세요. 학습 노트는 영구 무료입니다. 후속 코칭·커뮤니티·신규 강의로 계속 함께하겠습니다. 다음 만남을 기약하며, 건강과 성장을 기원합니다. 🎓' },
        ],
      },
    ],
  },
];

/* ═════════════════════════════════════════════════════════
 *  기술코칭 (4회, 8H) — 1:1 전문가 코칭
 * ═════════════════════════════════════════════════════════ */
export const coachingTopics: Topic[] = [
  {
    id: 'coach-1',
    title: '1회차 · AI 서비스 아키텍처 코칭',
    icon: '🏗️',
    description: '프로젝트의 전체 아키텍처를 검토하고 개선 방향을 코칭합니다.',
    content: [
      { subtitle: '코칭 목표', items: ['프로젝트 아키텍처 리뷰', '기술 스택 적합성 평가', 'LLM API 활용 전략 수립'] },
      { subtitle: '주요 내용', text: '각 팀의 프로젝트 구조를 전문가와 함께 검토합니다. 프론트엔드-백엔드-AI 연동 아키텍처의 적절성을 평가하고, 개선점을 제안합니다.' },
      { subtitle: '체크포인트', items: ['컴포넌트 구조가 적절한가?', 'API 호출 패턴이 효율적인가?', '에러 처리가 충분한가?', '보안 취약점은 없는가?'] },
    ],
  },
  {
    id: 'coach-2',
    title: '2회차 · UI/UX 개선 코칭',
    icon: '🎯',
    description: '사용자 경험과 인터페이스 디자인을 전문가와 함께 개선합니다.',
    content: [
      { subtitle: '코칭 목표', items: ['UI 디자인 리뷰 및 개선', '사용자 흐름(User Flow) 최적화', '접근성(Accessibility) 점검'] },
      { subtitle: '주요 내용', text: '좋은 AI 서비스는 기술뿐 아니라 사용자 경험이 중요합니다. 직관적인 인터페이스, 적절한 피드백, 일관된 디자인 시스템을 갖추어야 합니다.' },
      { subtitle: 'UI/UX 체크리스트', items: ['색상 대비와 가독성', '버튼 크기와 터치 타겟 (최소 44px)', '로딩 상태와 에러 상태 표시', '모바일 반응형 적합성'] },
    ],
  },
  {
    id: 'coach-3',
    title: '3회차 · LLM 최적화 코칭',
    icon: '⚡',
    description: 'LLM API 호출 최적화와 프롬프트 튜닝을 코칭합니다.',
    content: [
      { subtitle: '코칭 목표', items: ['프롬프트 품질 개선', 'API 호출 비용 최적화', '응답 품질 향상 전략'] },
      { subtitle: '주요 내용', text: 'LLM API의 비용과 성능을 최적화합니다. 프롬프트를 정교하게 다듬고, 캐싱 전략을 적용하며, 응답의 일관성을 높이는 방법을 학습합니다.' },
      { subtitle: '최적화 기법', items: ['시스템 프롬프트 정교화', '온도(temperature)와 max_tokens 최적값', '응답 캐싱으로 비용 절감', '폴백(fallback) 모델 전략'] },
    ],
  },
  {
    id: 'coach-4',
    title: '4회차 · 경진대회 최종 점검',
    icon: '🎖️',
    description: '경진대회 출품 전 최종 점검과 발표 리허설을 진행합니다.',
    content: [
      { subtitle: '코칭 목표', items: ['최종 배포 상태 점검', '발표 자료 완성도 검토', '시연 시나리오 리허설'] },
      { subtitle: '주요 내용', text: '경진대회 출품 직전 모든 요소를 최종 점검합니다. 서비스 안정성, 발표 자료의 완성도, 시연 시나리오의 자연스러움을 확인합니다.' },
      { subtitle: '최종 체크리스트', items: ['서비스가 정상 배포되어 접근 가능한가?', '국내 LLM이 핵심 기능에 활용되고 있는가?', '발표 자료가 5~10분 분량으로 준비되었는가?', '예상 질문에 대한 답변이 준비되었는가?'] },
    ],
  },
];
