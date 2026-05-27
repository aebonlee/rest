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
}

export interface Topic {
  id: string;
  title: string;
  icon: string;
  description: string;
  content: ContentSection[];
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
  },

  {
    id: 'reg-4',
    title: 'Day 4 · React 기초',
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
  },

  {
    id: 'reg-5',
    title: 'Day 5 · React 심화 + 라우팅',
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
  },

  {
    id: 'reg-6',
    title: 'Day 6 · Supabase 백엔드',
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
  },

  {
    id: 'reg-7',
    title: 'Day 7 · AI 서비스 설계',
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
  },

  {
    id: 'reg-8',
    title: 'Day 8 · LLM API 연동',
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
  },

  {
    id: 'reg-9',
    title: 'Day 9 · 프로젝트 프론트엔드 개발',
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
  },

  {
    id: 'reg-10',
    title: 'Day 10 · 프로젝트 백엔드 연동',
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
  },

  {
    id: 'reg-11',
    title: 'Day 11 · 테스트 및 디버깅',
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
  },

  {
    id: 'reg-12',
    title: 'Day 12 · 배포와 발표 준비',
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
  },

  {
    id: 'reg-13',
    title: 'Day 13 · 최종 발표 및 평가',
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
