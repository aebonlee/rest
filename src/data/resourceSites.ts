/* =============================================================================
 * resourceSites.ts — 학습자료 페이지에서 사용하는 "사이트 링크" 정적 데이터 모듈
 *
 * [이 파일을 한 줄로 말하면]
 *   학습자료 화면에 보여줄 "사이트 링크 목록"을 미리 적어둔 데이터 파일이다.
 *   화면을 그리는 코드(컴포넌트)는 이 파일에서 데이터를 "가져다 쓰기"만 한다.
 *
 * [초보자를 위한 배경 설명]
 *   - 이 파일에는 버튼을 누르면 무언가 실행되는 "로직(동작)"이 전혀 없다.
 *     오직 "데이터(값)"만 들어 있다. 그래서 '정적(static) 데이터'라고 부른다.
 *   - '.ts'는 TypeScript 파일이다. TypeScript는 JavaScript에 "타입(type, 자료의
 *     형태)"을 더한 언어다. 예를 들어 "name은 반드시 문자열이어야 한다"처럼
 *     값의 모양을 미리 약속해 두면, 실수로 잘못된 값을 넣었을 때 코드를 실행하기
 *     전에(=편집기에서) 미리 빨간 줄로 알려준다.
 *   - 'export'는 "이 파일 밖(다른 파일)에서도 가져다 쓸 수 있게 공개한다"는 뜻이다.
 *     export가 없으면 이 파일 안에서만 쓰는 비공개 값이 된다.
 *
 * [핵심 책임]
 *   - 각 사이트 링크의 메타데이터(이름, 설명, URL, 강조 여부 등)의 "형태(타입)" 정의.
 *   - DreamIT 자체 제작 사이트(owner: 'mine')와 외부 사이트(owner: 'external')를
 *     하나의 그룹 배열(SITE_GROUPS)로 통합 관리.
 *
 * [이 파일이 공개(export)하는 것 3가지]
 *   - interface SiteLink  : 개별 사이트 링크 1건의 "형태(설계도)".
 *   - interface SiteGroup : 분야별 사이트 묶음(그룹)의 "형태(설계도)".
 *   - const SITE_GROUPS   : 화면에 실제로 렌더링할 전체 그룹 데이터.
 *                           (이 데이터가 '단일 진실 공급원' — 즉 목록을 고치려면
 *                            여기 한 곳만 고치면 모든 화면에 반영된다는 뜻)
 * ========================================================================== */

/** 학습자료 페이지 데이터 — DreamIT 사에서 만든 사이트(분야별) + 외부 사이트 */

// ─────────────────────────────────────────────────────────────────────────
// interface(인터페이스)란?
//   - "이 데이터는 이런 속성들을 가져야 한다"고 미리 정해두는 TypeScript의 설계도다.
//   - 객체(중괄호 {}로 묶인 값)의 모양을 약속하는 용도로 가장 많이 쓴다.
//   - 실제 값이 아니라 "형태"만 정의하므로, 빌드 후 실행 코드에는 남지 않는다.
//
// 속성 이름 뒤의 물음표(?)는 "선택(optional) 속성"이라는 뜻이다.
//   - 물음표가 없으면(name, desc, url) → 반드시 있어야 하는 '필수' 값.
//   - 물음표가 있으면(featured?, accent?, badge?) → 없어도 되는 '선택' 값.
//   - 주의: 선택 속성을 코드에서 꺼내 쓸 때는 값이 없을(undefined) 수도 있음을
//           늘 염두에 둬야 한다. (예: site.badge가 비어 있을 수 있음)
// ─────────────────────────────────────────────────────────────────────────
// SiteLink: 화면에 표시되는 개별 링크 카드 1건의 데이터 형태.
//   - name     : 사이트 표시 이름
//   - desc     : 사이트 설명(카드 본문)
//   - url       : 이동할 외부 링크 주소
//   - featured?: (선택) 강조 카드 여부 — 레이아웃/스타일에서 우대 표시
//   - accent?  : (선택) 강조 색상(예: '#dc2626') — featured 카드 강조용
//   - badge?   : (선택) 카드에 붙일 배지 텍스트(예: '학습추천')
export interface SiteLink { name: string; desc: string; url: string; featured?: boolean; accent?: string; badge?: string; }
// SiteGroup: 동일 분야의 SiteLink들을 묶는 그룹 단위.
//   - id    : 그룹 고유 식별자(렌더링 시 React의 key 등으로 사용 — 항목을 구별하는 이름표)
//   - label : 그룹 표시 이름(예: 'AI 활용')
//   - icon  : 그룹 아이콘(이모지)
//   - owner : 'mine'(자체 제작) | 'external'(외부 도구) — 출처 구분/필터링용
//             ↑ 세로 막대(|)는 "또는(union, 유니언 타입)"을 뜻한다. 즉 owner에는
//               'mine' 또는 'external' 두 글자값 중 하나만 넣을 수 있고, 다른
//               아무 문자열이나 넣으면 TypeScript가 오류로 잡아준다.
//   - sites : 해당 그룹에 속한 사이트 링크 배열
//             ↑ 'SiteLink[]'에서 대괄호([])는 "그 타입의 배열(여러 개 목록)"을 뜻한다.
export interface SiteGroup { id: string; label: string; icon: string; owner: 'mine' | 'external'; sites: SiteLink[]; }

// ─────────────────────────────────────────────────────────────────────────
// SITE_GROUPS: 학습자료 화면이 렌더링하는 전체 데이터(단일 진실 공급원).
//   - 분야별 그룹(AI / 코딩·웹 / CS 전공 / IT 자격증 / 외부 도구)을 순서대로 나열.
//   - ': SiteGroup[]'는 "이 값은 SiteGroup 객체들의 배열이어야 한다"는 타입 표시다.
//     덕분에 각 그룹에 빠진 속성이나 오타가 있으면 즉시 오류로 알려준다.
//   - 'const'로 선언했으므로 SITE_GROUPS라는 이름에 다른 값을 다시 대입할 수 없다.
//     (불변에 가깝게 다뤄, 데이터가 실수로 바뀌는 것을 막는다.)
//   - 부수효과(네트워크 호출, 상태 변경 등)가 전혀 없는 순수 데이터이므로,
//     항목을 추가/수정/삭제하려면 아래 배열만 편집하면 된다.
//
// [데이터 구조 한눈에]
//   SITE_GROUPS(배열) → 각 칸이 그룹(SiteGroup) → 그룹 안의 sites(배열) → 각 칸이 링크(SiteLink)
//   즉 "배열 안에 객체, 그 객체 안에 또 배열" 형태의 2단 중첩 구조다.
// ─────────────────────────────────────────────────────────────────────────
export const SITE_GROUPS: SiteGroup[] = [
  // [그룹 1] AI 활용 — DreamIT 자체 제작(owner: 'mine'). 생성형 AI 도구·실무 학습 사이트 모음.
  // (아래 한 줄 한 줄이 SiteLink 한 건이다. 필수 속성 name/desc/url을 모두 갖춘다.)
  { id: 'ai', label: 'AI 활용', icon: '🤖', owner: 'mine', sites: [
    { name: 'AI 프롬프트 학습', desc: '효과적인 프롬프트 작성법, 프롬프트 엔지니어링 가이드', url: 'https://ai-prompt.dreamitbiz.com' },
    { name: 'ChatGPT 활용', desc: 'ChatGPT 사용법, GPTs, API 활용, 업무 자동화', url: 'https://chatgpt.dreamitbiz.com' },
    { name: 'Gemini 활용', desc: 'Google Gemini 사용법, Workspace 연동, 멀티모달 활용', url: 'https://gemini.dreamitbiz.com' },
    { name: 'Claude 활용', desc: 'Anthropic Claude 사용법, 프롬프트 기법, API 활용', url: 'https://claude.dreamitbiz.com' },
    { name: 'GenSpark 활용', desc: 'GenSpark AI 에이전트 기반 검색·리서치 활용 가이드', url: 'https://genspark.dreamitbiz.com' },
    { name: 'Microsoft Copilot', desc: 'MS Copilot 사용법, Office 연동, 코딩 보조', url: 'https://copilot.dreamitbiz.com' },
    { name: '파인튜닝 학습', desc: 'LLM 파인튜닝 실습, LoRA, QLoRA, 데이터셋 구축', url: 'https://fine-tuning.dreamitbiz.com' },
    { name: 'AI 데이터 학습', desc: 'AI 데이터 수집, 전처리, 라벨링, 데이터 품질 관리', url: 'https://ai-data.dreamitbiz.com' },
    { name: 'AI 미디어 학습', desc: 'AI 기반 이미지/영상/음성 생성, 편집, 활용', url: 'https://ai-media.dreamitbiz.com' },
    { name: 'AI 에이전트 학습', desc: 'AI 에이전트 설계, 개발, 배포, 오케스트레이션', url: 'https://ai-agents.dreamitbiz.com' },
    { name: '업무자동화 학습', desc: 'AI 기반 업무자동화 도구 활용, 워크플로우 설계', url: 'https://autowork.dreamitbiz.com' },
    { name: 'Solar LLM 학습', desc: '국산 LLM Solar 기반 AI 서비스 개발 실무 교육', url: 'https://solar.dreamitbiz.com' },
    { name: 'AX & DX 학습', desc: 'AI 전환(AX)과 디지털 전환(DX), 최신 트렌드 종합 학습', url: 'https://ax.dreamitbiz.com' },
    { name: '인공지능 기초 학습', desc: 'AI 기초, 활용, 윤리, 트렌드, AX, 용어사전까지 학습', url: 'https://basic-ai.dreamitbiz.com' },
    { name: 'NotebookLM 학습 센터', desc: 'Google NotebookLM 교육 과정 — 기초부터 사업계획서 작성까지', url: 'https://notebooklm.dreamitbiz.com' },
    { name: '코덱스 CLI 마스터', desc: 'OpenAI Codex CLI 완전 정복 — 설치부터 고급 프로젝트까지', url: 'https://codex.dreamitbiz.com' },
    { name: '생성형 AI 창업 교육', desc: '생성형 AI를 활용한 비즈니스 기획 및 성장 전략 교육', url: 'https://startup.dreamitbiz.com' },
    { name: 'Manus AI 학습 플랫폼', desc: 'Manus AI — 세계 최초 자율형 AI 에이전트 플랫폼 종합 학습', url: 'https://manus.dreamitbiz.com' },
  ] },
  // [그룹 2] 코딩·웹 개발 — DreamIT 자체 제작. 언어·프레임워크·웹 개발 학습 사이트 모음.
  { id: 'coding', label: '코딩·웹 개발', icon: '💻', owner: 'mine', sites: [
    { name: 'UI/UX 용어 사전', desc: 'Vibe Coding으로 배우는 인터랙티브 UI/UX 용어집', url: 'https://html.dreamitbiz.com' },
    { name: '바이브코딩 백엔드', desc: '바이브코딩으로 배우는 백엔드 완전정복', url: 'https://webstudy.dreamitbiz.com' },
    { name: 'React 학습', desc: 'React 기초부터 Hooks, 상태관리, 프로젝트 실습', url: 'https://reactstudy.dreamitbiz.com' },
    { name: 'C언어 학습', desc: 'C언어 기초 문법, 포인터, 구조체, 파일 처리', url: 'https://c-study.dreamitbiz.com' },
    { name: 'Java 학습', desc: 'Java 기초, OOP, 컬렉션, 스레드, 프로젝트 실습', url: 'https://java-study.dreamitbiz.com' },
    { name: 'Python 학습', desc: 'Python 기초, 데이터 분석, 자동화, 웹 스크래핑', url: 'https://python-study.dreamitbiz.com' },
    { name: '코딩 학습', desc: 'C, Java, Python 코딩 문제 풀기, 플레이그라운드', url: 'https://coding.dreamitbiz.com' },
    // 아래 항목은 featured: true, accent, badge가 모두 지정된 "강조 카드"다.
    //   - 선택 속성을 채우면, 화면 쪽 코드가 이 값들을 읽어 빨간색(accent) 강조 + '학습추천'
    //     배지(badge)를 붙여 입문자 추천 사이트로 눈에 띄게 보여준다.
    //   - 즉 선택 속성은 "특별한 카드만 추가로 가지는 옵션"이라고 이해하면 된다.
    { name: '웹 프론트엔드 기초', desc: '웹 개발의 첫걸음을 정성껏 담은 기초 학습 사이트 — HTML5 시맨틱 구조, CSS3 레이아웃(Flexbox·Grid)과 디자인, JavaScript 기본 문법·DOM 제어·이벤트, 반응형 웹까지 예제와 실습 중심으로 차근차근 익힙니다. 입문자가 웹을 처음 배우기에 가장 좋은 출발점입니다.', url: 'https://web.dreamitbiz.com', featured: true, accent: '#dc2626', badge: '학습추천' },
    // 아래 항목은 featured: true만 지정된 강조 카드다(별도 accent/badge 없음).
    //   → 같은 '강조'라도 어떤 선택 속성을 채우느냐에 따라 표현이 달라질 수 있음을 보여준다.
    { name: 'Sample Gallery — 웹 디자인 샘플', desc: '개인·회사·학습·블로그 등 다양한 정적 사이트 샘플과 소스코드 제공', url: 'https://sample.dreamitbiz.com', featured: true },
  ] },
  // [그룹 3] CS 전공 — DreamIT 자체 제작. 컴퓨터과학 전공 기초 과목 학습 사이트 모음.
  { id: 'cs', label: 'CS 전공', icon: '🧮', owner: 'mine', sites: [
    { name: 'AI·SW 개론', desc: 'SW·DS·AIoT·AI·XR·HMI 분야 탐색, 한신대학교 교과목', url: 'https://aisw.dreamitbiz.com' },
    { name: '자료구조 학습', desc: '선형/비선형 자료구조, 해시, 정렬, 고급 자료구조', url: 'https://data-structure.dreamitbiz.com' },
    { name: '데이터베이스 & SQL', desc: 'DB 기초, SQL, 웹 연동, 튜닝, Oracle, 시험 대비', url: 'https://db-study.dreamitbiz.com' },
    { name: '알고리즘 학습', desc: '정렬, 탐색, 그래프, DP, 그리디, 코딩 테스트 대비', url: 'https://algorithm.dreamitbiz.com' },
    { name: '소프트웨어 설계 & 구현', desc: '설계 원칙, UML, 디자인 패턴, OOP, TDD, 실습', url: 'https://software.dreamitbiz.com' },
  ] },
  // [그룹 4] IT 자격증 — DreamIT 자체 제작. 각종 IT/직무 자격증 시험 대비 학습 사이트 모음.
  { id: 'cert', label: 'IT 자격증', icon: '📜', owner: 'mine', sites: [
    { name: '직업상담사 시험 준비', desc: '직업상담사 1급·2급 필기·실기 CBT 학습 플랫폼', url: 'https://jobpath.dreamitbiz.com' },
    { name: '정보처리기사', desc: '정보처리기사 시험 대비 학습 플랫폼', url: 'https://eip.dreamitbiz.com' },
    { name: '리눅스 마스터 자격증', desc: '리눅스 마스터 2급/1급 시험 대비, 명령어 사전, 모의고사', url: 'https://linux-study.dreamitbiz.com' },
    { name: 'SQLD 자격증', desc: 'SQL 개발자 자격증 시험 대비 학습 플랫폼', url: 'https://sqld.dreamitbiz.com' },
    { name: 'AWS 자격증', desc: 'AWS 클라우드 자격증 시험 대비 학습 플랫폼', url: 'https://aws.dreamitbiz.com' },
    { name: 'AICE Associate 학습', desc: 'AICE Associate 자격증 시험 대비 학습 플랫폼', url: 'https://aice.dreamitbiz.com' },
  ] },
  // [그룹 5] 외부 AI·개발 도구 — owner: 'external'. DreamIT 외부의 공식 서비스/문서 링크 모음.
  //   - owner 값이 'external'이라는 점만 다르고, 데이터 형태(SiteLink)는 위 그룹들과 똑같다.
  //   - 화면 코드는 owner 값을 보고 자체 사이트(mine)와 외부 도구(external)를
  //     서로 다른 섹션이나 스타일로 구분해 보여줄 수 있다.
  { id: 'external', label: '외부 AI·개발 도구', icon: '🌐', owner: 'external', sites: [
    { name: 'ChatGPT', desc: 'OpenAI ChatGPT', url: 'https://chat.openai.com/' },
    { name: 'Claude', desc: 'Anthropic Claude', url: 'https://claude.ai/' },
    { name: 'Gemini', desc: 'Google Gemini', url: 'https://gemini.google.com/' },
    { name: 'Solar API', desc: 'Upstage Solar LLM API 문서', url: 'https://developers.upstage.ai/' },
    { name: 'Cursor', desc: 'AI 기반 코드 에디터', url: 'https://cursor.sh/' },
    { name: 'VS Code', desc: '코드 에디터', url: 'https://code.visualstudio.com/' },
    { name: 'GitHub', desc: '소스코드 관리·협업', url: 'https://github.com/' },
    { name: 'Supabase', desc: 'Backend-as-a-Service', url: 'https://supabase.com/' },
    { name: 'React 공식 문서', desc: 'React 프레임워크 문서', url: 'https://react.dev/' },
    { name: 'Vite 공식 문서', desc: 'Vite 빌드 도구 문서', url: 'https://vite.dev/' },
  ] },
  // [그룹 6] 디자인 참고 — owner: 'external'. 프로젝트 화면을 만들 때 참고할 UI/웹 디자인 영감·색상·폰트.
  { id: 'design', label: '디자인 참고', icon: '🎨', owner: 'external', sites: [
    { name: 'Dribbble', desc: 'UI·그래픽 디자인 샷 모음 — 화면 디자인 영감 얻기 좋음', url: 'https://dribbble.com/', featured: true, accent: '#ea4c89', badge: '디자인 영감' },
    { name: 'Behance', desc: 'Adobe의 디자이너 포트폴리오·작업물 갤러리', url: 'https://www.behance.net/' },
    { name: 'Mobbin', desc: '실제 앱·웹의 UI 패턴/플로우 레퍼런스 — 화면 구성 참고', url: 'https://mobbin.com/' },
    { name: 'Awwwards', desc: '우수 웹사이트 디자인 수상작 갤러리', url: 'https://www.awwwards.com/' },
    { name: 'Land-book', desc: '랜딩페이지 디자인 갤러리 — 소개 페이지 참고', url: 'https://land-book.com/' },
    { name: 'Godly', desc: '최신 웹 디자인 영감 큐레이션', url: 'https://godly.website/' },
    { name: 'Pinterest', desc: '무드보드·디자인 아이디어 수집', url: 'https://www.pinterest.com/' },
    { name: 'Coolors', desc: '색상 팔레트 생성기 — 우리 앱 색 조합 잡기', url: 'https://coolors.co/' },
    { name: 'Color Hunt', desc: '큐레이션된 색상 팔레트 모음', url: 'https://colorhunt.co/' },
    { name: 'Google Fonts', desc: '무료·상업용 웹폰트(한글 포함)', url: 'https://fonts.google.com/', badge: '무료·상업' },
  ] },
  // [그룹 7] 상업용 이미지·아이콘 — owner: 'external'. 무료 스톡 + AI 이미지 생성. ※ 라이선스는 사용 전 각 사이트 약관 확인.
  { id: 'images', label: '상업용 이미지·아이콘', icon: '🖼️', owner: 'external', sites: [
    { name: 'Unsplash', desc: '고화질 무료 사진 — 상업적 사용 가능(출처 표기 불필요)', url: 'https://unsplash.com/', featured: true, accent: '#111111', badge: '무료·상업' },
    { name: 'Pexels', desc: '무료 사진·영상 — 상업적 사용 가능', url: 'https://www.pexels.com/', badge: '무료·상업' },
    { name: 'Pixabay', desc: '무료 사진·일러스트·영상·아이콘', url: 'https://pixabay.com/', badge: '무료·상업' },
    { name: 'unDraw', desc: '오픈소스 일러스트 — 출처 표기 없이 상업 사용 가능', url: 'https://undraw.co/illustrations', badge: '무료·상업' },
    { name: 'Freepik', desc: '벡터·일러스트·사진 (무료/프리미엄)', url: 'https://www.freepik.com/', badge: '라이선스 확인' },
    { name: 'Flaticon', desc: '아이콘 100만+ (무료/프리미엄)', url: 'https://www.flaticon.com/', badge: '라이선스 확인' },
    { name: 'Icons8', desc: '아이콘·일러스트·사진·AI 생성 도구', url: 'https://icons8.com/', badge: '라이선스 확인' },
    { name: 'Adobe Firefly', desc: '상업적 사용 안전한 AI 이미지 생성(라이선스 명확)', url: 'https://firefly.adobe.com/', featured: true, accent: '#ff3366', badge: 'AI 생성·상업' },
    { name: 'Microsoft Designer', desc: '무료 AI 이미지 생성(DALL·E 기반) + 디자인 도구', url: 'https://designer.microsoft.com/', badge: 'AI 생성' },
    { name: 'Ideogram', desc: '텍스트(글자) 표현이 강한 AI 이미지 생성', url: 'https://ideogram.ai/', badge: 'AI 생성' },
    { name: 'Leonardo.AI', desc: '게임·앱용 고품질 AI 이미지 생성', url: 'https://leonardo.ai/', badge: 'AI 생성' },
    { name: 'Canva', desc: '디자인 도구 + AI 이미지(Magic Media) — 발표자료에도 유용', url: 'https://www.canva.com/', badge: '라이선스 확인' },
  ] },
];
