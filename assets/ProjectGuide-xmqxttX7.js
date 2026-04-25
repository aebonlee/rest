import{j as e,a as L,b as B,r as T}from"./index-Cl8Tkm2H.js";import{S as F}from"./SEOHead-CtVSyDgK.js";const y=[{id:1,title:"한국형 AI 동화책 제작 앱",subtitle:"한국적 소재와 아이의 나이, 주제를 입력하면 맞춤형 동화책을 생성하는 앱",color:"#EC4899",icon:"📚",overview:"한국의 전래동화, 명절, 지역 설화 등 한국적 소재를 활용하여 아이의 나이와 관심 주제에 맞는 동화를 Solar LLM이 자동 생성합니다. 각 장면마다 삽화 프롬프트가 함께 생성되며, 독후활동 질문까지 자동으로 제공하여 교육적 가치를 극대화합니다.",targetUsers:["유아·초등학생 (5~12세)","학부모","유치원·초등학교 교사","도서관 교육 담당자","다문화 가정 학부모"],objectives:["Solar Chat API를 활용한 구조화된 스토리 생성 파이프라인 구축","연령별 어휘 수준 조절 프롬프트 설계","장면 분할 및 삽화 프롬프트 자동 생성","교육적 독후활동 질문 생성 시스템 구현","React 기반 동화 뷰어 UI 개발"],architecture:{description:"사용자 입력(나이, 주제, 소재) → Solar LLM 스토리 생성 → 장면 분할 → 삽화 프롬프트 생성 → 독후활동 생성의 순차 파이프라인 구조",components:[{name:"입력 폼",description:"아이 나이, 주제, 한국 소재 선택 UI",tech:"React + Tailwind"},{name:"스토리 엔진",description:"Solar Chat API로 동화 생성 및 장면 분할",tech:"Solar Chat API"},{name:"삽화 생성기",description:"각 장면의 시각적 설명을 이미지 프롬프트로 변환",tech:"Solar Chat API"},{name:"교육 모듈",description:"독후활동 질문, 교훈 추출, 어휘 목록 생성",tech:"Solar Chat API"},{name:"뷰어",description:"페이지 넘기기 UX, 오디오 재생(TTS)",tech:"React + Web Speech API"}],diagram:`┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  사용자 입력  │────▶│  Solar Chat  │────▶│  장면 분할기  │
│ (나이/주제)  │     │  (스토리 생성) │     │ (5~8 장면)   │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                    ┌──────────────┐     ┌────────▼───────┐
                    │  독후활동 생성 │◀────│  삽화 프롬프트  │
                    │ (질문/교훈)   │     │  생성기        │
                    └──────┬───────┘     └────────────────┘
                           │
                    ┌──────▼───────┐
                    │  동화 뷰어    │
                    │ (최종 출력)   │
                    └──────────────┘`},pipeline:{steps:[{step:1,title:"입력 수집",description:"아이의 나이, 관심 주제(우정/용기/자연 등), 한국 소재(탈춤/한복/설날 등) 수집",tools:"React Form"},{step:2,title:"스토리 생성",description:"Solar Chat API에 구조화된 프롬프트로 5~8장면 동화 생성. 기승전결 구조 + 교훈 포함",tools:"Solar Chat API"},{step:3,title:"장면 분할",description:"생성된 스토리를 장면 단위로 파싱. 각 장면에 제목, 본문, 배경 정보 추출",tools:"JSON Parsing"},{step:4,title:"삽화 프롬프트 생성",description:"각 장면을 영문 이미지 프롬프트로 변환 (한국적 요소 + 아동 친화적 스타일)",tools:"Solar Chat API"},{step:5,title:"독후활동 생성",description:"이해력 질문, 감정 탐색, 창작 활동 제안, 어휘 목록 자동 생성",tools:"Solar Chat API"},{step:6,title:"렌더링 & 출력",description:"동화 뷰어 UI에 텍스트+삽화+활동을 통합 렌더링",tools:"React + CSS"}]},solarApi:{description:"Solar Chat API의 시스템 프롬프트와 사용자 프롬프트를 조합하여 연령별 맞춤 동화를 생성합니다.",endpoints:[{name:"Solar Chat Completion",purpose:"동화 스토리 생성 (기승전결 구조)",example:`POST https://api.upstage.ai/v1/solar/chat/completions
{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 한국 아동문학 전문가입니다. {age}세 아이를 위한 동화를 작성합니다."},
    {"role": "user", "content": "주제: {topic}, 소재: {material}, 장면 수: 6장면으로 동화를 만들어주세요."}
  ],
  "temperature": 0.8,
  "max_tokens": 2000
}`},{name:"Solar Chat (삽화 프롬프트)",purpose:"각 장면을 이미지 생성 프롬프트로 변환",example:'{"role": "user", "content": "다음 장면을 영문 이미지 프롬프트로 변환해주세요. 스타일: 수채화, 한국적 요소 포함, 아동 친화적\\n장면: {scene_text}"}'}]},prompts:{description:"연령별 어휘 수준 조절과 한국적 소재 활용을 위한 체계적 프롬프트 설계",examples:[{title:"스토리 생성 프롬프트",prompt:`[시스템] 당신은 한국 전래동화 스타일의 아동문학 작가입니다.
[규칙]
- 대상 연령: {age}세
- 문장 길이: {age <= 6 ? "15자 이내" : "25자 이내"}
- 장면 수: {scenes}개
- 반드시 교훈 포함
- 한국 문화 요소 자연스럽게 포함

[사용자] "{material}" 소재로 "{topic}" 주제의 동화를 만들어주세요.
JSON 형식으로 출력: {scenes: [{title, text, background, emotion}]}`,note:"연령에 따라 문장 길이, 어휘 수준, 감정 복잡도를 자동 조절"},{title:"독후활동 생성 프롬프트",prompt:`다음 동화를 읽은 {age}세 아이를 위한 독후활동을 만들어주세요:
1. 이해력 질문 3개 (O/X 또는 단답형)
2. 감정 탐색 질문 2개 ("주인공은 왜 슬펐을까?")
3. 창작 활동 1개 ("나만의 결말 만들기")
4. 새로운 어휘 목록 (뜻 포함)`,note:"연령별로 질문 난이도와 활동 유형이 달라짐"}]},implementation:{frontend:{description:"React 기반 SPA. 동화 생성 폼, 로딩 애니메이션, 페이지 넘기기 뷰어, 독후활동 카드",pages:["홈 (소개 & 시작)","동화 만들기 (입력 폼)","생성 중 (로딩 & 프로그레스)","동화 뷰어 (장면별 읽기)","독후활동 (질문 & 활동)","내 동화 목록 (저장된 동화)"],stack:"React 19 + TypeScript + Tailwind CSS + Framer Motion"},backend:{description:"Supabase Edge Functions로 Solar API 호출을 중개. API Key 보호 + 사용량 제한",apis:["POST /generate-story — 동화 생성","POST /generate-illustrations — 삽화 프롬프트 생성","POST /generate-activities — 독후활동 생성","GET /my-stories — 저장된 동화 목록","POST /save-story — 동화 저장"],stack:"Supabase Edge Functions (Deno) + Solar API"},database:{tables:[{name:"solar_stories",fields:"id, user_id, title, age, topic, material, scenes(jsonb), activities(jsonb), created_at"},{name:"solar_story_feedback",fields:"id, story_id, user_id, rating, comment, created_at"}]}},deployment:{steps:["React 앱 빌드 (vite build)","GitHub Pages 배포 (gh-pages -d dist)","Supabase Edge Functions 배포 (supabase functions deploy)","Solar API Key를 Supabase Secrets에 등록","커스텀 도메인 연결"],infra:"GitHub Pages (프론트) + Supabase (백엔드/DB) + Solar API"},expansion:["K-콘텐츠 해외 수출 (다국어 동화 생성)","다문화 가정 한국문화 교육 도구","초등 국어 수업 보조 교재 생성","동화 기반 한국어 학습 앱으로 확장","AI 동화 공모전 연계"]},{id:2,title:"문화재 AI 해설 앱",subtitle:"한국 문화재와 국가유산을 학습자 수준에 맞게 쉽게 설명하고 퀴즈를 제공하는 앱",color:"#F59E0B",icon:"🏛️",overview:"국보, 보물, 사적 등 한국 문화재 데이터를 Solar LLM이 학습자 수준(초등/중등/고등/성인)에 맞게 재구성하여 설명합니다. 핵심 키워드 추출, 관찰 포인트 안내, 퀴즈 생성, 현장 탐방 미션까지 종합적인 문화유산 교육 경험을 제공합니다.",targetUsers:["초·중·고등학생","가족 관람객","외국인 한국문화 학습자","문화해설 교육생/자원봉사자","역사 교사"],objectives:["Solar Embedding을 활용한 문화재 정보 RAG 시스템 구축","학습자 수준별 해설 텍스트 재생성 기법 습득","퀴즈 자동 생성 및 정답 검증 로직 구현","위치 기반 탐방 미션 설계","공공데이터 API 연동 실습"],architecture:{description:"문화재청 공공데이터를 벡터 DB에 저장하고, 사용자 질의 시 RAG로 관련 정보를 검색한 뒤 Solar Chat으로 수준별 해설을 생성하는 구조",components:[{name:"데이터 수집기",description:"문화재청 OpenAPI에서 문화재 정보 수집 및 전처리",tech:"Python + 공공데이터 API"},{name:"벡터 DB",description:"문화재 설명을 Solar Embedding으로 벡터화하여 저장",tech:"Solar Embedding + Supabase pgvector"},{name:"RAG 엔진",description:"사용자 질의와 유사한 문화재 정보를 검색",tech:"Solar Embedding + 코사인 유사도"},{name:"해설 생성기",description:"검색된 정보를 수준별로 재구성하여 설명",tech:"Solar Chat API"},{name:"퀴즈 엔진",description:"해설 내용 기반 4지선다/OX 퀴즈 자동 생성",tech:"Solar Chat API"}],diagram:`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  문화재청 API │────▶│ 전처리/청킹  │────▶│ Solar Embed  │
│  (공공데이터)  │     │ (텍스트 분할) │     │ (벡터화)     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │ 저장
┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
│  수준별 해설   │◀────│  Solar Chat  │◀────│  pgvector    │
│  + 퀴즈 출력  │     │  (RAG 생성)   │     │  (벡터 검색)  │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                                         ▲
       │              ┌──────────────┐           │
       └──────────────│  사용자 질의   │───────────┘
                      │ (문화재 + 수준) │
                      └──────────────┘`},pipeline:{steps:[{step:1,title:"데이터 수집",description:"문화재청 공공데이터 포털에서 국보/보물/사적 정보 JSON 수집 (약 5,000건)",tools:"공공데이터 API + Python"},{step:2,title:"텍스트 전처리",description:"수집 데이터를 500토큰 단위로 청킹, 메타데이터(시대/지역/분류) 태깅",tools:"Python + LangChain"},{step:3,title:"벡터 임베딩",description:"Solar Embedding API로 각 청크를 벡터로 변환 (1536차원)",tools:"Solar Embedding API"},{step:4,title:"벡터 저장",description:"Supabase pgvector에 벡터 + 메타데이터 저장",tools:"Supabase + pgvector"},{step:5,title:"RAG 검색",description:"사용자 질의를 임베딩 → 코사인 유사도 Top-5 검색",tools:"Solar Embedding + SQL"},{step:6,title:"수준별 해설 생성",description:"검색된 컨텍스트 + 사용자 수준으로 맞춤 해설 생성",tools:"Solar Chat API"}]},solarApi:{description:"Solar Embedding으로 문화재 정보를 벡터화하고, Solar Chat으로 수준별 해설과 퀴즈를 생성합니다.",endpoints:[{name:"Solar Embedding",purpose:"문화재 텍스트를 벡터로 변환 (인덱싱 & 검색 모두)",example:`POST https://api.upstage.ai/v1/solar/embeddings
{
  "model": "solar-embedding-1-large",
  "input": "숭례문은 조선 태조 5년(1396)에 완성된 서울 도성의 남쪽 정문으로..."
}`},{name:"Solar Chat (수준별 해설)",purpose:"검색된 문화재 정보를 학습자 수준에 맞게 재구성",example:`{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 문화재 해설 전문가입니다. {level} 수준에 맞게 설명하세요."},
    {"role": "user", "content": "[참고자료]\\n{context}\\n\\n위 문화재를 {level} 학생이 이해할 수 있게 설명해주세요."}
  ]
}`}]},prompts:{description:"수준별 어휘 조절과 퀴즈 생성을 위한 프롬프트 체계",examples:[{title:"수준별 해설 프롬프트",prompt:`[시스템] 문화재 해설 전문가로서 다음 규칙을 따르세요:
- 초등: 비유/예시 활용, 50자 이내 문장, 질문형 유도
- 중등: 역사적 맥락 포함, 핵심 용어 굵게 표시
- 고등: 학술적 배경, 비교 분석, 시대적 의의
- 성인: 전문 용어 허용, 보존 과학적 관점 포함

[참고자료] {rag_context}
[사용자] {heritage_name}을 {level} 수준으로 설명해주세요.`,note:"수준 파라미터에 따라 어휘, 문장 길이, 설명 깊이가 자동 조절됨"},{title:"퀴즈 생성 프롬프트",prompt:`다음 문화재 해설을 바탕으로 퀴즈를 만들어주세요:
{explanation}

출력 형식 (JSON):
- 4지선다 3문제 + OX 2문제
- 각 문제: question, options(4개), answer, explanation
- 난이도: {level}에 맞게 조절`,note:"해설 내용에서만 출제하여 학습 효과 극대화"}]},implementation:{frontend:{description:"문화재 검색, 수준 선택, 해설 뷰, 퀴즈, 탐방 미션 지도",pages:["홈 (문화재 검색)","문화재 상세 (수준 선택 해설)","퀴즈 풀기","탐방 미션 (지도)","학습 기록","즐겨찾기"],stack:"React 19 + TypeScript + Kakao Map API + Tailwind"},backend:{description:"RAG 검색 + Solar API 호출 + 퀴즈 채점 로직",apis:["POST /search — RAG 기반 문화재 검색","POST /explain — 수준별 해설 생성","POST /quiz — 퀴즈 생성","POST /quiz/grade — 퀴즈 채점","GET /missions — 탐방 미션 목록"],stack:"Supabase Edge Functions + pgvector + Solar API"},database:{tables:[{name:"solar_heritage_vectors",fields:"id, heritage_id, chunk_text, embedding(vector), metadata(jsonb)"},{name:"solar_heritage_progress",fields:"id, user_id, heritage_id, level, quiz_score, visited_at"}]}},deployment:{steps:["공공데이터 수집 스크립트 실행","Solar Embedding으로 벡터 인덱싱","pgvector 테이블 생성 및 데이터 적재","Edge Functions 배포","프론트엔드 빌드 & 배포"],infra:"GitHub Pages + Supabase (pgvector) + Solar API + 공공데이터 API"},expansion:["지역 관광 연계 앱 (AR 문화재 해설)","문화유산 교육 공공 서비스","외국인 대상 K-Heritage 가이드","문화재 보존 시민 참여 플랫폼","초등 사회과 교과 연계 학습 도구"]},{id:3,title:"나이대별 한국사 학습·시험 앱",subtitle:"초등·중등·고등·성인 수준에 맞게 한국사를 설명하고 문제풀이를 제공하는 앱",color:"#3B82F6",icon:"📜",overview:"한국사 전 시대(선사~현대)를 학습자 수준별로 Solar LLM이 재구성하여 설명합니다. 시대별 핵심 사건, 인물, 문화를 이해하기 쉽게 정리하고, 자동 생성된 문제로 실력을 점검합니다. 오답 분석을 통해 취약 시대를 파악하고 맞춤 복습을 제공합니다.",targetUsers:["초·중·고등학생","한국사능력검정시험 준비생","수능 한국사 준비생","성인 역사 학습자","역사 교사"],objectives:["시대별 한국사 콘텐츠 구조화 및 청킹","Solar Chat을 활용한 수준별 설명 생성","다양한 문제 유형(4지선다/빈칸/연대순) 자동 생성","오답 분석 및 취약 시대 리포트 생성","학습 이력 기반 적응형 복습 시스템"],architecture:{description:"한국사 교과서 데이터를 시대별로 구조화한 뒤, 사용자 수준과 학습 이력에 따라 맞춤 설명과 문제를 생성하는 적응형 학습 시스템",components:[{name:"콘텐츠 DB",description:"시대별/주제별 한국사 정보 구조화 저장",tech:"Supabase + JSON"},{name:"설명 생성기",description:"수준별 한국사 설명을 Solar Chat으로 생성",tech:"Solar Chat API"},{name:"문제 생성기",description:"4지선다, 빈칸, 연대순 정리 등 다양한 유형",tech:"Solar Chat API"},{name:"오답 분석기",description:"틀린 문제의 시대/주제를 분석하여 취약점 도출",tech:"Solar Chat API + 통계"},{name:"적응형 엔진",description:"학습 이력 기반 복습 순서 및 난이도 조절",tech:"Algorithm + DB"}],diagram:`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  한국사 DB   │────▶│  수준별 설명  │────▶│  학습 뷰어   │
│ (시대별 구조) │     │  생성 (Solar) │     │  (읽기/듣기)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       ▼                                         ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  문제 생성    │────▶│  풀이 & 채점  │────▶│  오답 분석    │
│ (유형별)     │     │              │     │  + 리포트    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                           ┌──────▼───────┐
                                           │ 적응형 복습    │
                                           │ (취약 시대)   │
                                           └──────────────┘`},pipeline:{steps:[{step:1,title:"콘텐츠 구조화",description:"한국사 전 시대를 7개 대단원, 30개 소주제로 분류. 핵심 사건/인물/문화 태깅",tools:"JSON + Supabase"},{step:2,title:"수준별 설명 생성",description:"각 소주제를 4개 수준(초/중/고/성인)으로 Solar Chat이 재구성",tools:"Solar Chat API"},{step:3,title:"문제 생성",description:"설명 기반 4지선다, OX, 빈칸, 연대순 정리 문제 자동 생성",tools:"Solar Chat API"},{step:4,title:"학습 세션",description:"사용자가 설명을 읽고 문제를 풀면 정답/오답 기록",tools:"React + Supabase"},{step:5,title:"오답 분석",description:"시대별/주제별 정답률 분석, 취약 시대 Top-3 도출",tools:"SQL + Solar Chat"},{step:6,title:"맞춤 복습",description:"취약 시대 우선 복습 + 난이도 자동 조절",tools:"Algorithm"}]},solarApi:{description:"Solar Chat API로 수준별 설명, 다양한 문제 유형, 오답 해설을 생성합니다.",endpoints:[{name:"Solar Chat (수준별 설명)",purpose:"한국사 소주제를 학습자 수준에 맞게 설명",example:`{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "한국사 교사로서 {level} 학생에게 설명합니다. 핵심 키워드는 **굵게** 표시."},
    {"role": "user", "content": "조선 건국과 태조 이성계에 대해 설명해주세요. 수준: {level}"}
  ]
}`},{name:"Solar Chat (문제 생성)",purpose:"설명 내용 기반 다양한 유형의 문제 자동 생성",example:`{
  "messages": [
    {"role": "system", "content": "한국사 출제 전문가입니다. JSON 형식으로 문제를 생성합니다."},
    {"role": "user", "content": "다음 내용으로 4지선다 3문제, 연대순 1문제를 만드세요:\\n{content}\\n난이도: {difficulty}"}
  ]
}`}]},prompts:{description:"수준별 설명과 다양한 문제 유형을 위한 프롬프트 설계",examples:[{title:"시대 설명 프롬프트",prompt:`[시스템] 한국사 전문 교사입니다.
수준별 규칙:
- 초등: 이야기체, 비유 사용, 100자 이내 단락
- 중등: 인과관계 설명, 200자 단락, 핵심 용어 정의
- 고등: 사료 인용, 학술 분석, 다른 사건과 비교
- 성인: 역사학적 쟁점 포함, 최신 연구 반영

[사용자] "{era}" 시대의 "{topic}"을 {level} 수준으로 설명해주세요.`,note:"각 수준마다 어휘 수준, 문장 구조, 설명 깊이가 다름"},{title:"오답 해설 프롬프트",prompt:`학생이 다음 문제를 틀렸습니다:
문제: {question}
정답: {answer}, 학생 선택: {student_answer}

이 학생에게:
1. 왜 {student_answer}가 틀렸는지 설명
2. 왜 {answer}가 맞는지 설명
3. 관련 핵심 개념 정리
4. 유사 문제로 혼동하기 쉬운 포인트 안내`,note:"단순 정답 알려주기가 아닌 개념 이해를 돕는 피드백"}]},implementation:{frontend:{description:"시대 타임라인, 학습 뷰어, 문제 풀기, 성적표, 취약점 리포트",pages:["시대 타임라인 (전체 개요)","시대별 학습 (수준 선택)","문제 풀기 (유형별)","오답 노트","성적표 & 취약점 리포트","한능검 모의고사"],stack:"React 19 + TypeScript + Chart.js + Tailwind"},backend:{description:"문제 생성/채점, 학습 이력 관리, 적응형 추천",apis:["POST /explain — 수준별 설명 생성","POST /quiz/generate — 문제 생성","POST /quiz/grade — 채점 + 해설","GET /analytics — 학습 분석","GET /recommend — 복습 추천"],stack:"Supabase Edge Functions + Solar API"},database:{tables:[{name:"solar_history_content",fields:"id, era, topic, level, content, keywords(jsonb)"},{name:"solar_history_quizzes",fields:"id, user_id, era, topic, question, answer, user_answer, is_correct, created_at"},{name:"solar_history_analytics",fields:"id, user_id, era, correct_rate, weak_topics(jsonb), updated_at"}]}},deployment:{steps:["한국사 콘텐츠 DB 구축 (7개 시대)","수준별 설명 사전 생성 (캐싱)","문제 풀이 Edge Function 배포","프론트엔드 빌드 & 배포","학습 분석 대시보드 연동"],infra:"GitHub Pages + Supabase + Solar API"},expansion:["한국사능력검정시험 정식 대비 서비스","수능 한국사 기출 분석 연동","시대별 VR 체험 연계","교사용 학급 관리 대시보드","다국어(영/중/일) 한국사 학습"]},{id:4,title:"자격증 취약점 분석 학습 앱",subtitle:"자격증 준비생의 문제풀이 결과를 분석하여 취약 단원과 보충학습을 추천하는 앱",color:"#10B981",icon:"📋",overview:"자격증 시험(SQLD, 컴활, 정보처리기능사 등) 준비생이 문제를 풀면 AI가 단원별 정답률을 분석하고, 취약한 단원을 집중 보충할 수 있는 학습 계획과 유사 문제를 자동 생성합니다. Solar LLM이 오답 원인을 분석하고 격려형 피드백을 제공합니다.",targetUsers:["SQLD 준비생","컴퓨터활용능력 준비생","정보처리기능사/기사 준비생","한국사능력검정시험 준비생","직업상담사 등 국가자격 준비생"],objectives:["자격증별 단원 분류 체계 구축","Solar Chat을 활용한 오답 원인 분석 시스템","취약점 기반 유사 문제 자동 생성","학습 계획 자동 생성 및 격려 피드백","정답률 추이 시각화 대시보드"],architecture:{description:"문제풀이 → 채점 → 단원별 정답률 분석 → 취약점 도출 → 보충학습 추천 → 유사문제 생성의 순환형 학습 루프",components:[{name:"문제 은행",description:"자격증별 기출문제 + AI 생성 문제 DB",tech:"Supabase + JSON"},{name:"채점 엔진",description:"자동 채점 + 단원별 태깅",tech:"Logic + DB"},{name:"분석 엔진",description:"단원별 정답률, 취약 단원 Top-3, 추이 분석",tech:"SQL + Chart.js"},{name:"보충학습 생성기",description:"취약 단원 핵심 개념 정리 + 학습 계획",tech:"Solar Chat API"},{name:"유사문제 생성기",description:"틀린 문제와 유사한 새 문제 생성",tech:"Solar Chat API"}],diagram:`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  문제 은행    │────▶│  문제 풀기    │────▶│  자동 채점    │
│ (자격증별)   │     │  (사용자)     │     │ + 단원 태깅  │
└──────────────┘     └──────────────┘     └──────┬───────┘
       ▲                                         │
       │                                         ▼
┌──────┴───────┐     ┌──────────────┐     ┌──────────────┐
│ 유사문제 생성 │◀────│  보충학습     │◀────│  취약점 분석  │
│ (Solar Chat) │     │  계획 생성    │     │ (단원별 통계) │
└──────────────┘     └──────────────┘     └──────────────┘`},pipeline:{steps:[{step:1,title:"진단 평가",description:"자격증 선택 후 20문제 진단 테스트로 초기 수준 파악",tools:"React Quiz UI"},{step:2,title:"자동 채점",description:"정답 비교 + 각 문제에 단원/난이도 태깅",tools:"Logic + Supabase"},{step:3,title:"취약점 분석",description:"단원별 정답률 계산, 취약 단원 Top-3 선정, 정답률 추이 분석",tools:"SQL 집계"},{step:4,title:"오답 해설",description:"Solar Chat으로 틀린 문제의 원인 분석 + 핵심 개념 정리",tools:"Solar Chat API"},{step:5,title:"학습 계획 생성",description:"취약 단원 우선 3일/5일/7일 학습 계획 자동 생성",tools:"Solar Chat API"},{step:6,title:"유사문제 생성",description:"취약 단원에서 새로운 연습 문제 생성하여 반복 학습",tools:"Solar Chat API"}]},solarApi:{description:"Solar Chat API로 오답 분석, 학습 계획, 유사 문제, 격려 피드백을 생성합니다.",endpoints:[{name:"Solar Chat (오답 분석)",purpose:"틀린 문제의 원인 분석 및 핵심 개념 설명",example:`{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "자격증 학습 코치입니다. 친절하고 격려하는 톤으로 오답을 분석합니다."},
    {"role": "user", "content": "자격증: {cert}\\n문제: {question}\\n정답: {answer}\\n학생답: {user_answer}\\n\\n오답 원인과 핵심 개념을 설명해주세요."}
  ]
}`},{name:"Solar Chat (유사문제 생성)",purpose:"취약 단원의 새로운 연습 문제 생성",example:`{
  "messages": [
    {"role": "system", "content": "{cert} 출제위원입니다. 기출과 유사하지만 새로운 문제를 만듭니다."},
    {"role": "user", "content": "단원: {chapter}\\n난이도: {difficulty}\\n유형: 4지선다\\n문제 수: 5개\\nJSON 형식으로 출력"}
  ]
}`}]},prompts:{description:"격려형 피드백과 체계적 학습 계획을 위한 프롬프트",examples:[{title:"취약점 리포트 + 학습 계획",prompt:`학생의 자격증({cert}) 학습 현황:
- 전체 정답률: {total_rate}%
- 단원별: {chapter_stats}
- 취약 단원: {weak_chapters}
- 시험일: {exam_date}

다음을 생성해주세요:
1. 격려 메시지 (1-2문장)
2. 취약 단원 핵심 요약 (단원별 3줄)
3. {days}일 학습 계획 (일자별 학습 내용)
4. 합격 가능성 평가와 조언`,note:"학생의 현재 수준에 맞춘 현실적이고 격려적인 계획"},{title:"격려형 피드백",prompt:`학생이 {chapter} 단원에서 {rate}% 정답률을 기록했습니다.
이전 대비 {change}% {direction}했습니다.

격려와 구체적 학습 팁을 2-3문장으로 제공해주세요.
- 상승: 칭찬 + 다음 목표 제시
- 하락: 위로 + 원인 분석 + 구체적 조언
- 유지: 꾸준함 칭찬 + 돌파 전략`,note:"정서적 지지와 구체적 행동 지침을 함께 제공"}]},implementation:{frontend:{description:"자격증 선택, 문제 풀기, 오답 노트, 취약점 대시보드, 학습 계획",pages:["자격증 선택","진단 평가 / 연습 문제","채점 결과 & 해설","취약점 분석 대시보드","학습 계획 (캘린더)","오답 노트"],stack:"React 19 + TypeScript + Chart.js + Tailwind"},backend:{description:"채점, 통계 분석, Solar API 호출, 학습 이력 관리",apis:["POST /diagnose — 진단 평가 시작","POST /grade — 채점 + 분석","POST /explain — 오답 해설","POST /plan — 학습 계획 생성","POST /generate — 유사문제 생성"],stack:"Supabase Edge Functions + Solar API"},database:{tables:[{name:"solar_cert_questions",fields:"id, cert_type, chapter, question, options(jsonb), answer, difficulty"},{name:"solar_cert_attempts",fields:"id, user_id, cert_type, question_id, user_answer, is_correct, created_at"},{name:"solar_cert_analytics",fields:"id, user_id, cert_type, chapter_stats(jsonb), weak_chapters(jsonb), updated_at"}]}},deployment:{steps:["자격증별 기출문제 DB 구축","문제 태깅 (단원/난이도) 작업","채점+분석 Edge Function 배포","프론트엔드 빌드 & 배포","학습 리포트 이메일 알림 설정"],infra:"GitHub Pages + Supabase + Solar API"},expansion:["정식 자격증 학습 서비스 론칭","AI 모의고사 서비스","학원/교육기관 B2B 제공","자격증 커뮤니티 + 스터디 매칭","GPT-4 대비 Solar 성능 비교 리포트"]},{id:5,title:"청년지원정책 안내 챗봇",subtitle:"쉬었음 청년과 자립준비청년이 자신에게 맞는 지원정책을 쉽게 찾도록 돕는 챗봇",color:"#6366F1",icon:"🏢",overview:"복잡한 청년 지원 정책(취업, 주거, 금융, 교육, 심리 등)을 Solar LLM이 대화형으로 안내합니다. 사용자의 나이, 소득, 지역, 상황을 파악하여 맞춤 정책을 추천하고, 자격조건 확인부터 신청 절차까지 단계별로 안내합니다.",targetUsers:["쉬었음 청년 (15~34세)","자립준비청년 (보호종료아동)","취업준비생","경력단절 청년","정책 상담 공무원"],objectives:["정책 문서 RAG 시스템 구축 (정책브리핑, 온통청년)","Solar Chat 기반 대화형 정책 안내 챗봇 개발","사용자 프로파일 기반 맞춤 정책 추천","신청 절차 Step-by-step 안내 생성","쉬운 말로 재구성하는 Plain Language 변환"],architecture:{description:"정책 문서를 RAG로 검색하고, 사용자 프로파일(나이/지역/상황)을 파악한 뒤 맞춤 정책을 대화형으로 안내하는 챗봇 구조",components:[{name:"정책 데이터 수집기",description:"정책브리핑, 온통청년 등에서 청년정책 수집",tech:"Python + 크롤링"},{name:"정책 벡터 DB",description:"정책 내용을 임베딩하여 검색 가능하게 저장",tech:"Solar Embedding + pgvector"},{name:"프로파일 엔진",description:"대화를 통해 사용자 조건(나이/소득/지역) 파악",tech:"Solar Chat + State"},{name:"정책 매칭 엔진",description:"사용자 조건과 정책 자격조건 매칭",tech:"Logic + RAG"},{name:"안내 생성기",description:"매칭된 정책을 쉽게 설명 + 신청 절차 안내",tech:"Solar Chat API"}],diagram:`┌──────────────┐     ┌──────────────┐
│  정책 데이터  │────▶│ Solar Embed  │──────┐
│ (브리핑/온통) │     │ (벡터화)     │      │
└──────────────┘     └──────────────┘      ▼
                                     ┌──────────────┐
┌──────────────┐                     │  pgvector    │
│  사용자 대화  │──────┐              │  (정책 DB)   │
│ "나 25살..."  │      │              └──────┬───────┘
└──────────────┘      ▼                     │
                ┌──────────────┐     ┌──────▼───────┐
                │ 프로파일 파악 │────▶│  정책 매칭   │
                │ (나이/지역)  │     │ (RAG 검색)   │
                └──────────────┘     └──────┬───────┘
                                            │
                                     ┌──────▼───────┐
                                     │ 쉬운말 안내   │
                                     │ (Solar Chat) │
                                     └──────────────┘`},pipeline:{steps:[{step:1,title:"정책 데이터 수집",description:"정책브리핑, 온통청년, 지자체 사이트에서 청년정책 200+건 수집",tools:"Python + BeautifulSoup"},{step:2,title:"정책 구조화",description:"각 정책을 이름/대상/조건/혜택/신청방법/기한으로 구조화",tools:"Solar Chat + JSON"},{step:3,title:"벡터 인덱싱",description:"구조화된 정책을 Solar Embedding으로 벡터화하여 pgvector에 저장",tools:"Solar Embedding + Supabase"},{step:4,title:"대화 시작",description:"사용자와 자연어 대화로 조건 파악 (나이/지역/소득/관심분야)",tools:"Solar Chat + 상태관리"},{step:5,title:"정책 매칭",description:"파악된 조건으로 적합 정책 검색 (RAG + 조건 필터)",tools:"pgvector + SQL"},{step:6,title:"안내 생성",description:"매칭된 정책을 쉬운 말로 설명 + 신청 절차 단계별 안내",tools:"Solar Chat API"}]},solarApi:{description:"Solar Embedding으로 정책 검색, Solar Chat으로 대화형 안내를 제공합니다.",endpoints:[{name:"Solar Embedding (정책 검색)",purpose:"사용자 질문을 벡터화하여 관련 정책 검색",example:`POST https://api.upstage.ai/v1/solar/embeddings
{
  "model": "solar-embedding-1-large",
  "input": "25살 서울 거주 취업준비생인데 월세 지원받을 수 있나요?"
}`},{name:"Solar Chat (대화형 안내)",purpose:"정책을 쉬운 말로 설명하고 신청 절차 안내",example:`{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "청년정책 상담사입니다. 쉽고 친절하게, 존댓말로 안내합니다. 자격조건을 명확히 안내하고, 신청 방법을 단계별로 설명합니다."},
    {"role": "user", "content": "[검색된 정책]\\n{policy_context}\\n\\n[사용자 프로파일]\\n나이: 25, 지역: 서울, 상황: 취업준비\\n\\n이 정책을 쉽게 설명하고 신청 방법을 알려주세요."}
  ]
}`}]},prompts:{description:"쉬운 말 변환과 맞춤 안내를 위한 프롬프트 설계",examples:[{title:"프로파일 파악 대화",prompt:`[시스템] 청년정책 상담사입니다.
자연스러운 대화로 다음 정보를 파악하세요:
1. 나이 (필수)
2. 거주 지역 (필수)
3. 현재 상황 (취업준비/재직/무직/자영업)
4. 소득 수준 (중위소득 기준)
5. 관심 분야 (취업/주거/금융/교육/심리)

한 번에 여러 개 묻지 말고, 1-2개씩 자연스럽게 물어보세요.
이미 알고 있는 정보는 다시 묻지 마세요.`,note:"대화형으로 자연스럽게 조건을 파악하여 부담을 줄임"},{title:"쉬운 말 정책 안내",prompt:`다음 정책을 25세 청년이 이해할 수 있게 쉬운 말로 바꿔주세요:
{policy_text}

규칙:
- 전문용어 → 쉬운 말 (예: "중위소득 60%" → "월 소득 약 130만원 이하")
- 핵심만 간결하게 (5줄 이내)
- "~할 수 있어요" 체로 작성
- 신청 방법: 번호 매겨서 단계별로
- 주의사항이나 꿀팁 1개 추가`,note:"복잡한 행정 용어를 일상 언어로 변환"}]},implementation:{frontend:{description:"채팅 UI, 정책 카드, 신청 절차 스텝퍼, 북마크",pages:["챗봇 메인 (대화형 UI)","정책 검색 (키워드/카테고리)","정책 상세 (자격조건/혜택/신청)","내 맞춤 정책 목록","신청 체크리스트","정책 캘린더 (마감일)"],stack:"React 19 + TypeScript + Tailwind + 채팅 UI"},backend:{description:"RAG 검색, 프로파일 관리, 대화 이력, 정책 매칭",apis:["POST /chat — 대화형 정책 상담","POST /search — 정책 RAG 검색","GET /policies — 정책 목록","POST /match — 맞춤 정책 매칭","GET /checklist — 신청 체크리스트"],stack:"Supabase Edge Functions + pgvector + Solar API"},database:{tables:[{name:"solar_policies",fields:"id, name, category, target, conditions(jsonb), benefits, how_to_apply, deadline, embedding(vector)"},{name:"solar_policy_chats",fields:"id, user_id, messages(jsonb), profile(jsonb), matched_policies(jsonb), created_at"}]}},deployment:{steps:["청년정책 200건 수집 및 구조화","Solar Embedding으로 벡터 인덱싱","챗봇 Edge Function 배포","프론트엔드 빌드 & 배포","정책 업데이트 자동화 (월 1회)"],infra:"GitHub Pages + Supabase (pgvector) + Solar API"},expansion:["정부/지자체 공식 서비스 연계","다국어 지원 (이주 배경 청년)","음성 챗봇 (전화 상담 대체)","정책 알림 서비스 (마감일 전 알림)","사회복지사 업무 보조 도구"]},{id:6,title:"AI 자기소개서·면접 코치",subtitle:"청년 구직자의 경험을 자기소개서 문장과 면접 답변으로 구조화하는 앱",color:"#8B5CF6",icon:"👔",overview:"구직자가 자신의 경험(활동, 프로젝트, 아르바이트 등)을 입력하면 Solar LLM이 자기소개서 문항별 문장으로 구조화하고, 예상 면접 질문과 모범 답변을 생성합니다. STAR 기법(상황-과제-행동-결과) 기반으로 경험을 재구성하며, 문장 개선 피드백까지 제공합니다.",targetUsers:["취업준비생 (대학생/졸업생)","진로전환 희망자","경력직 이직 준비자","대학 취업지원센터","취업 컨설턴트"],objectives:["STAR 기법 기반 경험 구조화 시스템 구축","자소서 문항별 맞춤 문장 생성","면접 예상 질문 + 모범 답변 생성","문장 개선 피드백 (어색함/반복/구체성)","기업별/직무별 맞춤 톤 조절"],architecture:{description:"경험 입력 → STAR 구조화 → 문항 매칭 → 문장 생성 → 피드백 → 면접 준비의 종합 취업 코칭 시스템",components:[{name:"경험 입력기",description:"활동/프로젝트/경험을 자유롭게 입력",tech:"React Form"},{name:"STAR 변환기",description:"경험을 상황-과제-행동-결과로 구조화",tech:"Solar Chat API"},{name:"자소서 생성기",description:"구조화된 경험을 문항별 자소서 문장으로 작성",tech:"Solar Chat API"},{name:"피드백 엔진",description:"작성된 문장의 어색함, 반복, 구체성 분석",tech:"Solar Chat API"},{name:"면접 시뮬레이터",description:"자소서 기반 면접 질문 생성 + 답변 코칭",tech:"Solar Chat API"}],diagram:`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  경험 입력    │────▶│  STAR 변환   │────▶│  자소서 생성  │
│ (자유 기술)  │     │ (구조화)     │     │ (문항별)     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                     ┌──────────────┐     ┌──────▼───────┐
                     │  면접 코칭    │◀────│  문장 피드백  │
                     │ (Q&A 생성)   │     │ (개선 제안)   │
                     └──────────────┘     └──────────────┘`},pipeline:{steps:[{step:1,title:"경험 수집",description:"사용자가 경험을 자유롭게 기술 (활동명, 기간, 역할, 성과)",tools:"React Form"},{step:2,title:"STAR 구조화",description:"Solar Chat이 자유 기술을 Situation-Task-Action-Result로 변환",tools:"Solar Chat API"},{step:3,title:"문항 매칭",description:"지원 직무/회사의 자소서 문항과 경험 매칭 (지원동기/역량/도전 등)",tools:"Solar Chat + Logic"},{step:4,title:"자소서 생성",description:"문항별 500~1000자 자소서 문장 생성",tools:"Solar Chat API"},{step:5,title:"문장 피드백",description:"어색한 표현, 반복 어휘, 구체성 부족 등 개선점 분석",tools:"Solar Chat API"},{step:6,title:"면접 준비",description:"자소서 기반 예상 질문 + STAR 기반 모범 답변 생성",tools:"Solar Chat API"}]},solarApi:{description:"Solar Chat API로 경험 구조화, 문장 생성, 피드백, 면접 코칭을 수행합니다.",endpoints:[{name:"Solar Chat (STAR 변환)",purpose:"자유 기술 경험을 STAR 형식으로 구조화",example:`{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "취업 컨설턴트입니다. 경험을 STAR 기법으로 구조화합니다."},
    {"role": "user", "content": "다음 경험을 STAR(상황-과제-행동-결과)로 구조화해주세요:\\n{experience_text}\\nJSON: {situation, task, action, result, keywords}"}
  ]
}`},{name:"Solar Chat (면접 코칭)",purpose:"자소서 기반 면접 예상 질문 + 답변 생성",example:`{
  "messages": [
    {"role": "system", "content": "면접관으로서 이 자소서를 읽고 물어볼 질문을 생성합니다. 그리고 지원자 입장에서 STAR 기반 모범 답변도 제시합니다."},
    {"role": "user", "content": "자소서:\\n{resume_text}\\n\\n직무: {job_type}\\n예상 질문 5개 + 모범 답변을 생성해주세요."}
  ]
}`}]},prompts:{description:"STAR 기법 적용과 기업/직무별 톤 조절을 위한 프롬프트",examples:[{title:"자소서 문장 생성 프롬프트",prompt:`[시스템] 자소서 작성 전문가입니다.
규칙:
- STAR 기법 적용 (상황→과제→행동→결과)
- 정량적 성과 포함 (%, 건수, 기간 등)
- 회사가 원하는 역량과 경험 연결
- 자연스러운 문체, 600~800자

[사용자]
직무: {job_type}
회사: {company}
문항: "{question}"
경험 (STAR):
- 상황: {situation}
- 과제: {task}
- 행동: {action}
- 결과: {result}

이 경험으로 위 문항에 맞는 자소서를 작성해주세요.`,note:"기업 문화(스타트업 vs 대기업)에 따라 톤이 달라짐"},{title:"문장 피드백 프롬프트",prompt:`다음 자소서를 분석하고 개선점을 알려주세요:
{draft}

분석 항목:
1. 어색한 표현 (→ 대안 제시)
2. 반복 어휘/구문 (→ 동의어 제안)
3. 구체성 부족 (→ 추가할 내용 제안)
4. STAR 구조 완성도 (→ 보완 포인트)
5. 전체 점수 (100점 만점)`,note:"구체적 개선 방향을 제시하여 스스로 수정 가능"}]},implementation:{frontend:{description:"경험 입력, STAR 카드, 자소서 에디터, 피드백 뷰, 면접 시뮬레이터",pages:["경험 입력 (자유 기술)","STAR 구조화 결과","자소서 작성 (문항별 에디터)","피드백 & 수정 제안","면접 준비 (Q&A 리스트)","내 자소서 관리"],stack:"React 19 + TypeScript + Rich Text Editor + Tailwind"},backend:{description:"STAR 변환, 자소서 생성, 피드백, 면접 질문 생성",apis:["POST /star — STAR 구조화","POST /generate — 자소서 생성","POST /feedback — 문장 피드백","POST /interview — 면접 질문 생성","GET /my-resumes — 저장된 자소서"],stack:"Supabase Edge Functions + Solar API"},database:{tables:[{name:"solar_experiences",fields:"id, user_id, title, description, star(jsonb), keywords(text[]), created_at"},{name:"solar_resumes",fields:"id, user_id, company, job_type, questions(jsonb), drafts(jsonb), score, created_at"},{name:"solar_interviews",fields:"id, resume_id, questions(jsonb), answers(jsonb), created_at"}]}},deployment:{steps:["프론트엔드 빌드 & GitHub Pages 배포","Supabase Edge Functions 배포","Solar API Key 등록","예시 데이터 시딩","베타 테스트 (5명)"],infra:"GitHub Pages + Supabase + Solar API"},expansion:["정식 취업 코칭 서비스 론칭","이력서(Resume) 작성 기능 추가","AI 모의 면접 (음성/화상)","기업 채용 공고 연동 자동 매칭","대학 취업지원센터 B2B"]},{id:7,title:"회복탄력성 루틴 코치",subtitle:"쉬었음 청년의 감정 상태와 생활 패턴을 바탕으로 회복 루틴을 제안하는 AI 코치",color:"#14B8A6",icon:"💚",overview:'활동이 줄어든 청년(쉬었음 청년, 자립준비청년)의 감정 상태를 매일 체크하고, 그에 맞는 작은 루틴(산책, 글쓰기, 운동 등)을 AI가 추천합니다. 무리한 목표가 아닌 "오늘 할 수 있는 한 가지"를 제안하며, 격려 메시지와 자기성찰 질문으로 점진적 회복을 돕습니다.',targetUsers:["쉬었음 청년 (사회활동 축소된 상태)","자립준비청년 (보호종료아동)","진로 불안 청년","우울감·무기력감을 느끼는 청년","사회복지사/상담사"],objectives:["감정 체크인 대화 시스템 구축","감정 상태 기반 맞춤 루틴 추천 알고리즘","격려형·비판단적 메시지 생성","자기성찰 저널링 질문 생성","회복 추이 시각화 (감정 그래프)"],architecture:{description:"매일 감정 체크인 → 상태 분석 → 맞춤 루틴 추천 → 수행 확인 → 격려 → 회복 추이 기록의 일일 루프",components:[{name:"감정 체크인",description:"오늘의 감정을 대화형으로 파악 (1~10점 + 키워드)",tech:"Solar Chat + React"},{name:"루틴 추천기",description:"감정 수준에 맞는 실현 가능한 루틴 제안",tech:"Solar Chat API"},{name:"격려 생성기",description:"비판단적, 공감적 격려 메시지",tech:"Solar Chat API"},{name:"성찰 질문기",description:"하루를 돌아보는 저널링 질문 생성",tech:"Solar Chat API"},{name:"회복 트래커",description:"감정 추이, 루틴 수행률, 회복 그래프",tech:"React + Chart.js"}],diagram:`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 감정 체크인   │────▶│  상태 분석    │────▶│  루틴 추천   │
│ "오늘 기분?" │     │ (수준/키워드) │     │ (맞춤 1가지) │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                     ┌──────────────┐     ┌──────▼───────┐
                     │ 회복 트래커   │◀────│  격려 메시지  │
                     │ (추이 그래프) │     │  + 성찰 질문  │
                     └──────────────┘     └──────────────┘
                            ▲
                     ┌──────┴───────┐
                     │  루틴 수행    │
                     │  확인 (체크)  │
                     └──────────────┘`},pipeline:{steps:[{step:1,title:"감정 체크인",description:"오늘의 감정을 1~10점으로 표현 + 감정 키워드 선택 (무기력/불안/외로움/희망 등)",tools:"React UI + 이모지"},{step:2,title:"상태 분석",description:"Solar Chat이 감정 점수와 키워드, 최근 추이를 분석하여 현재 상태 파악",tools:"Solar Chat API"},{step:3,title:"루틴 추천",description:"감정 수준에 맞는 루틴 1~3가지 제안 (너무 어렵지 않은 것)",tools:"Solar Chat API"},{step:4,title:"격려 메시지",description:"비판단적, 공감적, 따뜻한 격려 메시지 생성",tools:"Solar Chat API"},{step:5,title:"루틴 수행 & 체크",description:"추천된 루틴 수행 후 완료 체크 (부분 완료도 OK)",tools:"React + Supabase"},{step:6,title:"저녁 성찰",description:"하루를 돌아보는 성찰 질문 + 짧은 글쓰기",tools:"Solar Chat API"}]},solarApi:{description:"Solar Chat API로 감정 분석, 루틴 추천, 격려 메시지, 성찰 질문을 생성합니다.",endpoints:[{name:"Solar Chat (루틴 추천)",purpose:"감정 상태에 맞는 실현 가능한 루틴 제안",example:`{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 따뜻하고 공감적인 회복 코치입니다. 절대 판단하거나 재촉하지 않습니다. 아주 작은 한 걸음을 제안합니다."},
    {"role": "user", "content": "감정 점수: {score}/10\\n감정 키워드: {keywords}\\n최근 3일 추이: {trend}\\n\\n오늘 할 수 있는 작은 루틴 1~2가지를 제안해주세요. 5분 이내로 할 수 있는 것으로요."}
  ],
  "temperature": 0.7
}`},{name:"Solar Chat (격려 메시지)",purpose:"비판단적이고 공감적인 격려",example:`{
  "messages": [
    {"role": "system", "content": "상담 심리사처럼 따뜻하게 말합니다. 비판하지 않고, 있는 그대로를 인정합니다. 2-3문장으로 짧게."},
    {"role": "user", "content": "사용자가 오늘 감정 {score}점이고, '{feeling}'이라고 했습니다. {did_routine ? '루틴을 완료했습니다' : '루틴을 하지 못했습니다'}. 격려해주세요."}
  ]
}`}]},prompts:{description:"심리적 안전감을 제공하는 비판단적 프롬프트 설계",examples:[{title:"감정 수준별 루틴 추천",prompt:`[시스템] 회복탄력성 코치입니다.
핵심 원칙:
- 절대 판단하지 않음 ("~해야 해" 금지)
- 아주 작은 것부터 (5분 이내)
- 선택권 제공 (2~3가지 중 고르기)
- 안 해도 괜찮다는 메시지 포함

감정 수준별 루틴 강도:
- 1~3점 (매우 힘듦): 숨쉬기, 물 마시기, 창문 열기
- 4~5점 (무기력): 짧은 산책, 좋아하는 음악 1곡, 스트레칭
- 6~7점 (보통): 15분 운동, 일기 쓰기, 요리하기
- 8~10점 (좋음): 새로운 도전, 누군가에게 연락, 계획 세우기

[사용자] 감정: {score}점, 키워드: {keywords}
오늘의 루틴을 추천해주세요.`,note:"감정이 낮을수록 더 작고 쉬운 루틴을 제안"},{title:"저녁 성찰 질문",prompt:`오늘 하루를 돌아보는 성찰 질문 1개를 만들어주세요.

사용자 상태:
- 아침 감정: {morning_score}점
- 수행한 루틴: {completed_routines}
- 키워드: {keywords}

규칙:
- 가벼운 질문 (무겁지 않게)
- 정답이 없는 열린 질문
- 자기 발견을 돕는 질문
- 예시: "오늘 가장 편안했던 순간은?", "나에게 '괜찮아'라고 말해준다면?"`,note:"강제하지 않고, 답하지 않아도 되는 분위기로"}]},implementation:{frontend:{description:"감정 체크인 UI, 루틴 카드, 격려 화면, 성찰 저널, 회복 그래프",pages:["감정 체크인 (이모지 + 점수)","오늘의 루틴 (카드형 추천)","격려 & 성찰 (저널링)","회복 그래프 (주간/월간)","루틴 히스토리","설정 (알림 시간)"],stack:"React 19 + TypeScript + Chart.js + Tailwind + 이모지"},backend:{description:"감정 기록, 루틴 추천/수행 관리, 격려 생성",apis:["POST /checkin — 감정 체크인","POST /routine — 루틴 추천","POST /complete — 루틴 완료 체크","POST /encourage — 격려 메시지","POST /reflect — 성찰 질문","GET /stats — 회복 통계"],stack:"Supabase Edge Functions + Solar API"},database:{tables:[{name:"solar_emotions",fields:"id, user_id, score(1-10), keywords(text[]), note, created_at"},{name:"solar_routines",fields:"id, user_id, date, recommended(jsonb), completed(jsonb), created_at"},{name:"solar_journals",fields:"id, user_id, question, answer, created_at"}]}},deployment:{steps:["프론트엔드 빌드 & 배포","Edge Functions 배포","Solar API Key 등록","알림 시스템 설정 (Push/Email)","베타 테스트 (심리상담사 감수)"],infra:"GitHub Pages + Supabase + Solar API + Web Push"},expansion:["청년 회복 프로그램 공식 도구 채택","정서지원 AI 서비스 (범용)","CBT(인지행동치료) 기반 확장","사회복지사 모니터링 대시보드","마음건강 커뮤니티 연계"]}],d=148,p=52,A=38,f=30,S=16,D={1:{nodes:[{id:"a",label:"사용자 입력",sub:"나이·주제",row:0,col:0},{id:"b",label:"Solar Chat",sub:"스토리 생성",row:0,col:1},{id:"c",label:"장면 분할기",sub:"5~8 장면",row:0,col:2},{id:"d",label:"삽화 프롬프트",sub:"생성기",row:1,col:2},{id:"e",label:"독후활동 생성",sub:"질문·교훈",row:1,col:1},{id:"f",label:"동화 뷰어",sub:"최종 출력",row:2,col:1}],arrows:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"d"},{from:"d",to:"e"},{from:"e",to:"f"}]},2:{nodes:[{id:"a",label:"문화재청 API",sub:"공공데이터",row:0,col:0},{id:"b",label:"전처리·청킹",sub:"텍스트 분할",row:0,col:1},{id:"c",label:"Solar Embed",sub:"벡터화",row:0,col:2},{id:"d",label:"수준별 해설",sub:"+ 퀴즈 출력",row:1,col:0},{id:"e",label:"Solar Chat",sub:"RAG 생성",row:1,col:1},{id:"f",label:"pgvector",sub:"벡터 검색",row:1,col:2},{id:"g",label:"사용자 질의",sub:"문화재·수준",row:2,col:1}],arrows:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"f"},{from:"f",to:"e"},{from:"e",to:"d"},{from:"g",to:"f"},{from:"g",to:"d"}]},3:{nodes:[{id:"a",label:"한국사 DB",sub:"시대별 구조",row:0,col:0},{id:"b",label:"수준별 설명",sub:"Solar 생성",row:0,col:1},{id:"c",label:"학습 뷰어",sub:"읽기·듣기",row:0,col:2},{id:"d",label:"문제 생성",sub:"유형별",row:1,col:0},{id:"e",label:"풀이 & 채점",row:1,col:1},{id:"f",label:"오답 분석",sub:"+ 리포트",row:1,col:2},{id:"g",label:"적응형 복습",sub:"취약 시대",row:2,col:2}],arrows:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"a",to:"d"},{from:"c",to:"f"},{from:"d",to:"e"},{from:"e",to:"f"},{from:"f",to:"g"}]},4:{nodes:[{id:"a",label:"문제 은행",sub:"자격증별",row:0,col:0},{id:"b",label:"문제 풀기",sub:"사용자",row:0,col:1},{id:"c",label:"자동 채점",sub:"+ 단원 태깅",row:0,col:2},{id:"d",label:"유사문제 생성",sub:"Solar Chat",row:1,col:0},{id:"e",label:"보충학습",sub:"계획 생성",row:1,col:1},{id:"f",label:"취약점 분석",sub:"단원별 통계",row:1,col:2}],arrows:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"f"},{from:"f",to:"e"},{from:"e",to:"d"},{from:"d",to:"a"}]},5:{nodes:[{id:"a",label:"정책 데이터",sub:"브리핑·온통",row:0,col:0},{id:"b",label:"Solar Embed",sub:"벡터화",row:0,col:1},{id:"c",label:"pgvector",sub:"정책 DB",row:0,col:2},{id:"d",label:"사용자 대화",sub:'"나 25살..."',row:1,col:0},{id:"e",label:"프로파일 파악",sub:"나이·지역",row:1,col:1},{id:"f",label:"정책 매칭",sub:"RAG 검색",row:1,col:2},{id:"g",label:"쉬운말 안내",sub:"Solar Chat",row:2,col:2}],arrows:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"f"},{from:"d",to:"e"},{from:"e",to:"f"},{from:"f",to:"g"}]},6:{nodes:[{id:"a",label:"경험 입력",sub:"자유 기술",row:0,col:0},{id:"b",label:"STAR 변환",sub:"구조화",row:0,col:1},{id:"c",label:"자소서 생성",sub:"문항별",row:0,col:2},{id:"d",label:"면접 코칭",sub:"Q&A 생성",row:1,col:1},{id:"e",label:"문장 피드백",sub:"개선 제안",row:1,col:2}],arrows:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"e"},{from:"e",to:"d"}]},7:{nodes:[{id:"a",label:"감정 체크인",sub:'"오늘 기분?"',row:0,col:0},{id:"b",label:"상태 분석",sub:"수준·키워드",row:0,col:1},{id:"c",label:"루틴 추천",sub:"맞춤 1가지",row:0,col:2},{id:"d",label:"회복 트래커",sub:"추이 그래프",row:1,col:1},{id:"e",label:"격려 메시지",sub:"+ 성찰 질문",row:1,col:2},{id:"f",label:"루틴 수행",sub:"확인 (체크)",row:2,col:1}],arrows:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"e"},{from:"e",to:"d"},{from:"f",to:"d"}]}},M=({projectId:s,color:t})=>{const o=D[s];if(!o)return null;const{nodes:h,arrows:c}=o,x=Object.fromEntries(h.map(a=>[a.id,a])),i=Math.max(...h.map(a=>a.col)),P=Math.max(...h.map(a=>a.row)),R=(i+1)*(d+A)-A+S*2,k=(P+1)*(p+f)-f+S*2,j=a=>({x:S+a.col*(d+A),y:S+a.row*(p+f),cx:S+a.col*(d+A)+d/2,cy:S+a.row*(p+f)+p/2}),N=a=>{const r=x[a.from],b=x[a.to];if(!r||!b)return null;const l=j(r),n=j(b),u=b.col-r.col,g=b.row-r.row;if(g===0&&u>0)return`M${l.x+d},${l.cy} L${n.x},${n.cy}`;if(g===0&&u<0)return`M${l.x},${l.cy} L${n.x+d},${n.cy}`;if(u===0&&g>0)return`M${l.cx},${l.y+p} L${n.cx},${n.y}`;if(u===0&&g<0)return`M${l.cx},${l.y} L${n.cx},${n.y+p}`;if(g>0){const _=l.cx,G=l.y+p,$=u>0?n.x:n.x+d,C=n.cy;return`M${_},${G} Q${_},${C} ${$},${C}`}const E=u>0?l.x+d:l.x,v=l.cy,I=n.cx,O=n.y+p;return`M${E},${v} Q${I},${v} ${I},${O}`},w=`arr-${s}`;return e.jsxs("svg",{viewBox:`0 0 ${R} ${k}`,className:"flow-diagram-svg",children:[e.jsx("defs",{children:e.jsx("marker",{id:w,markerWidth:"8",markerHeight:"6",refX:"7",refY:"3",orient:"auto",children:e.jsx("polygon",{points:"0,0 8,3 0,6",fill:t,fillOpacity:"0.7"})})}),c.map((a,r)=>{const b=N(a);return b?e.jsx("path",{d:b,fill:"none",stroke:t,strokeWidth:"1.5",strokeOpacity:"0.45",markerEnd:`url(#${w})`},r):null}),h.map(a=>{const r=j(a);return e.jsxs("g",{children:[e.jsx("rect",{x:r.x,y:r.y,width:d,height:p,rx:10,fill:"#fff",stroke:t,strokeWidth:"1.5",strokeOpacity:"0.6"}),e.jsx("text",{x:r.cx,y:a.sub?r.cy-7:r.cy+1,textAnchor:"middle",dominantBaseline:"middle",fontSize:"11.5",fontWeight:"600",fill:"#1f2937",children:a.label}),a.sub&&e.jsx("text",{x:r.cx,y:r.cy+9,textAnchor:"middle",dominantBaseline:"middle",fontSize:"9.5",fill:"#9ca3af",children:a.sub})]},a.id)})]})},m=({icon:s,title:t,children:o})=>e.jsxs("section",{className:"pgd-section",children:[e.jsxs("h2",{children:[e.jsx("span",{className:"pgd-section-icon",children:s})," ",t]}),e.jsx("div",{className:"pgd-card",children:o})]}),U=({project:s})=>e.jsxs(e.Fragment,{children:[e.jsxs(m,{icon:"ℹ️",title:"프로젝트 개요",children:[e.jsx("p",{className:"pgd-overview",children:s.overview}),e.jsxs("div",{className:"pgd-meta-grid",children:[e.jsxs("div",{children:[e.jsx("h4",{children:"주요 대상"}),e.jsx("ul",{children:s.targetUsers.map((t,o)=>e.jsx("li",{children:t},o))})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"학습 목표"}),e.jsx("ul",{children:s.objectives.map((t,o)=>e.jsx("li",{children:t},o))})]})]})]}),e.jsxs(m,{icon:"🏗️",title:"시스템 아키텍처",children:[e.jsx("p",{children:s.architecture.description}),e.jsx("div",{className:"pgd-diagram",children:e.jsx(M,{projectId:s.id,color:s.color})}),e.jsx("div",{className:"pgd-components",children:s.architecture.components.map((t,o)=>e.jsxs("div",{className:"pgd-component",children:[e.jsx("h4",{children:t.name}),e.jsx("p",{children:t.description}),e.jsx("span",{className:"pgd-tech-badge",children:t.tech})]},o))})]}),e.jsx(m,{icon:"🔄",title:"데이터 파이프라인",children:e.jsx("div",{className:"pgd-pipeline",children:s.pipeline.steps.map(t=>e.jsxs("div",{className:"pgd-pipeline-step",children:[e.jsx("div",{className:"pgd-step-num",style:{background:s.color},children:t.step}),e.jsxs("div",{className:"pgd-step-body",children:[e.jsx("h4",{children:t.title}),e.jsx("p",{children:t.description}),e.jsx("span",{className:"pgd-tech-badge",children:t.tools})]})]},t.step))})}),e.jsxs(m,{icon:"☀️",title:"Solar API 활용",children:[e.jsx("p",{children:s.solarApi.description}),s.solarApi.endpoints.map((t,o)=>e.jsxs("div",{className:"pgd-api-endpoint",children:[e.jsx("h4",{children:t.name}),e.jsx("p",{children:t.purpose}),e.jsx("div",{className:"pgd-code-block",children:e.jsx("code",{children:t.example})})]},o))]}),e.jsxs(m,{icon:"✨",title:"프롬프트 엔지니어링",children:[e.jsx("p",{children:s.prompts.description}),s.prompts.examples.map((t,o)=>e.jsxs("div",{className:"pgd-prompt",children:[e.jsx("h4",{children:t.title}),e.jsx("div",{className:"pgd-prompt-block",children:e.jsx("pre",{children:t.prompt})}),e.jsxs("p",{className:"pgd-prompt-note",children:["💡 ",t.note]})]},o))]}),e.jsxs(m,{icon:"💻",title:"구현 가이드",children:[e.jsxs("div",{className:"pgd-impl-grid",children:[e.jsxs("div",{className:"pgd-impl-item",children:[e.jsx("h3",{children:"🖥️ 프론트엔드"}),e.jsx("p",{children:s.implementation.frontend.description}),e.jsx("span",{className:"pgd-tech-badge",children:s.implementation.frontend.stack}),e.jsx("h4",{children:"주요 페이지"}),e.jsx("ul",{children:s.implementation.frontend.pages.map((t,o)=>e.jsx("li",{children:t},o))})]}),e.jsxs("div",{className:"pgd-impl-item",children:[e.jsx("h3",{children:"⚙️ 백엔드"}),e.jsx("p",{children:s.implementation.backend.description}),e.jsx("span",{className:"pgd-tech-badge",children:s.implementation.backend.stack}),e.jsx("h4",{children:"API 엔드포인트"}),e.jsx("ul",{children:s.implementation.backend.apis.map((t,o)=>e.jsx("li",{children:t},o))})]})]}),e.jsxs("div",{className:"pgd-db",children:[e.jsx("h3",{children:"🗄️ 데이터베이스"}),e.jsx("div",{className:"pgd-db-tables",children:s.implementation.database.tables.map((t,o)=>e.jsxs("div",{className:"pgd-db-table",children:[e.jsx("h4",{children:t.name}),e.jsx("code",{children:t.fields})]},o))})]})]}),e.jsxs(m,{icon:"🚀",title:"배포 계획",children:[e.jsx("span",{className:"pgd-tech-badge",children:s.deployment.infra}),e.jsx("ol",{className:"pgd-deploy-steps",children:s.deployment.steps.map((t,o)=>e.jsx("li",{children:t},o))})]}),e.jsx(m,{icon:"🌟",title:"확장 가능성",children:e.jsx("ul",{className:"pgd-expansion",children:s.expansion.map((t,o)=>e.jsxs("li",{children:[e.jsx("span",{style:{color:s.color},children:"✓"})," ",t]},o))})})]}),Q=()=>{const{id:s}=L(),t=B(),[o,h]=T.useState(s?Number(s):1);T.useEffect(()=>{s&&h(Number(s))},[s]);const c=y.find(i=>i.id===o)||y[0],x=i=>{h(i),t(`/project-guide/${i}`,{replace:!0}),window.scrollTo({top:0,behavior:"smooth"})};return e.jsxs(e.Fragment,{children:[e.jsx(F,{title:c.title,path:`/project-guide/${o}`}),e.jsx("section",{className:"page-header",children:e.jsxs("div",{className:"container",children:[e.jsx("h2",{children:"프로젝트 안내"}),e.jsx("p",{children:"AI 리부트 경진대회를 위한 7가지 프로젝트 가이드입니다. Solar LLM을 활용한 실전 프로젝트를 확인하세요."})]})}),e.jsxs("div",{className:"sidebar-layout",children:[e.jsx("aside",{className:"sidebar",children:e.jsx("nav",{className:"sidebar-menu",children:y.map(i=>e.jsxs("button",{className:`sidebar-item ${i.id===o?"active":""}`,onClick:()=>x(i.id),children:[e.jsx("span",{className:"sidebar-item-icon",children:i.icon}),e.jsx("span",{className:"sidebar-item-text",children:i.title})]},i.id))})}),e.jsxs("div",{className:"sidebar-content",children:[e.jsxs("div",{className:"pgd-hero-card",style:{borderLeftColor:c.color},children:[e.jsx("span",{className:"pgd-hero-icon",style:{background:`${c.color}18`,color:c.color},children:c.icon}),e.jsxs("div",{children:[e.jsx("h3",{className:"pgd-hero-title",children:c.title}),e.jsx("p",{className:"pgd-hero-subtitle",children:c.subtitle}),e.jsx("div",{className:"pg-card-tags",style:{marginTop:"8px"},children:c.solarApi.endpoints.map((i,P)=>e.jsx("span",{className:"pg-tag",children:i.name.split(" (")[0]},P))})]})]}),e.jsx(U,{project:c})]})]})]})};export{Q as default};
