/**
 * 커리큘럼 데이터 — 쉬었음청년 AI교육
 *
 * [이 파일이 무엇인가? — 초보자용 설명]
 *   이 파일은 "교육 과정에 어떤 내용이 며칠 동안 들어가는가"를 적어둔 데이터 모음입니다.
 *   화면에 보여줄 글자/숫자/색깔 같은 정보를 코드 안에 미리 적어둔 것으로 생각하면 됩니다.
 *   (예: 데이터베이스에서 불러오는 게 아니라, 코드에 직접 박아둔 '고정 데이터'입니다.)
 *
 *   확장자 .ts 는 TypeScript(타입스크립트) 파일이라는 뜻입니다.
 *   - TypeScript = JavaScript에 "이 데이터는 어떤 모양이어야 한다"는 규칙(타입)을 더한 언어입니다.
 *   - 타입을 정해두면, 오타나 잘못된 값을 넣었을 때 코드 작성 단계에서 미리 잡아줄 수 있어 안전합니다.
 *
 * [파일 역할]
 *   AI Reboot Academy LMS(rest.dreamitbiz.com)의 교육 커리큘럼 정적 데이터를 정의하는 설정 파일.
 *   화면(커리큘럼 페이지/일정표/단계 카드 등)에서 import 하여 렌더링에 사용하는 단일 데이터 소스(Single Source of Truth)다.
 *   (Single Source of Truth = '진실의 단일 원천'. 같은 정보를 여기저기 흩어 놓지 않고 한 곳에서만 관리한다는 원칙.
 *    이렇게 하면 내용을 고칠 때 이 파일 한 곳만 바꾸면 되므로 실수가 줄어듭니다.)
 *
 * [핵심 책임]
 *   - 과정 단계(선수과정/정규과정 DT/기술코칭)별 메타정보와 일자별 학습 내용을 구조화한다.
 *     (메타정보 = '데이터에 대한 정보'. 예: 단계 이름, 색상, 총 시간 같은 설명용 정보.)
 *   - 일자(day) 단위로 날짜·제목·세부 토픽·교육시간·유형·프로젝트 마일스톤을 보관한다.
 *     (마일스톤 = 프로젝트 진행 중 중요한 '이정표' 시점. 예: 시작, 발표, 제출.)
 *   - 수강생에게 보여줄 프로젝트 예시 목록을 제공한다.
 *
 * [주요 export]
 *   (export = '내보내기'. 이 키워드가 붙은 것만 다른 파일에서 import(가져오기)해서 쓸 수 있습니다.)
 *   - CurriculumDay : 하루 단위 커리큘럼 항목의 타입
 *   - CoursePhase   : 과정 단계(여러 day를 묶는 단위)의 타입
 *   - coursePhases  : 전체 과정 단계 데이터 배열 (선수/정규/코칭)
 *   - projectExamples : 수강생용 프로젝트 예시 목록
 *
 *   주의: 이 파일은 순수 데이터/타입 정의만 포함하며 부수효과(side effect)가 없는 상수 모듈이다.
 *   (부수효과 = 파일을 불러오는 것만으로 화면 변경·네트워크 요청·파일 쓰기 같은 '바깥 세상에 미치는 영향'이 생기는 것.
 *    여기엔 그런 동작이 전혀 없고, 그냥 값을 정의만 하므로 안심하고 import 해도 됩니다.)
 */

// 하루(1일) 단위 커리큘럼 항목을 표현하는 타입.
// interface(인터페이스) = '이 객체는 이런 속성들을 가져야 한다'고 정의하는 TypeScript의 설계도(틀)입니다.
// 아래 틀을 만들어 두면, 각 날짜 데이터를 만들 때 빠뜨린 속성이나 잘못된 타입을 자동으로 잡아줍니다.
export interface CurriculumDay {
  day: number;        // 해당 단계 내에서의 일자 순번(1부터 시작). number = 숫자 타입.
  date: string;       // 표시용 날짜 문자열(예: '6/1(월)' 또는 '사전학습' 같은 라벨). string = 문자열(글자) 타입.
  title: string;      // 그날의 학습 주제 제목
  topics: string[];   // 세부 학습 토픽 목록. string[] = '문자열들의 배열'(글자 목록)이라는 뜻.
  hours: number;      // 해당 일자의 교육 시간(시간 단위)
  // 아래는 '유니온 타입(union type)'입니다. type 값은 세 문자열 중 '오직 하나'만 들어갈 수 있습니다.
  // 즉 'prerequisite' / 'regular' / 'coaching' 외의 값을 쓰면 타입 오류가 납니다. → 오타 방지에 유용.
  type: 'prerequisite' | 'regular' | 'coaching'; // 일자 유형(선수/정규/코칭) — UI 색상·필터링에 사용
  // 속성 이름 뒤의 물음표(?)는 '선택 속성(optional)'이라는 표시입니다. 있어도 되고 없어도 됩니다.
  // 주의: 선택 속성이므로 화면에서 이 값을 쓸 때는 '값이 없을 수도 있음'을 항상 고려해야 합니다.
  project?: string;   // (선택) 그날과 연결된 프로젝트 마일스톤(시작/발표/제출 등). 없으면 표시 생략
}

// 하나의 과정 단계(여러 CurriculumDay를 묶는 상위 단위)를 표현하는 타입.
// 한 '단계' 안에 여러 '날(day)'이 들어가는 포함 관계입니다. (단계 > 날들의 배열)
export interface CoursePhase {
  id: string;             // 단계 식별자(예: 'prerequisite') — key/필터링용 고유값
                          // (key = React에서 목록을 그릴 때 각 항목을 구분하는 고유 표시. 겹치지 않게 관리해야 함.)
  name: string;           // 단계 한글 이름
  nameEn: string;         // 단계 영문 이름
  hours: number;          // 단계 전체 교육 시간(소속 day들의 합과 일치하도록 관리)
                          // 주의: 이 값은 아래 days의 hours 합과 손으로 맞춰야 합니다. 자동 계산이 아니므로 수정 시 둘 다 확인!
  description: string;    // 단계 한글 설명
  descriptionEn: string;  // 단계 영문 설명
  color: string;          // UI 강조 색상(HEX) — 단계별 테마 컬러. HEX = '#10B981'처럼 #으로 시작하는 색상 코드.
  icon: string;           // 단계 대표 이모지 아이콘
  days: CurriculumDay[];  // 단계에 속한 일자별 커리큘럼 항목 배열. CurriculumDay[] = 위에서 정의한 타입의 '배열'.
}

/**
 * coursePhases
 *   전체 교육 과정을 단계별로 정의한 상수 데이터 배열.
 *   - 구성: 선수과정(prerequisite) → 정규과정 DT(regular) → 기술코칭(coaching)
 *   - 매개변수: 없음(상수)
 *   - 반환값: CoursePhase[] (불변 데이터로 취급, 화면 렌더링의 데이터 소스)
 *   - 부수효과: 없음
 *
 *   (const = '상수'. 한 번 정한 값을 다른 값으로 다시 대입하지 못하게 막는 키워드.)
 *   (': CoursePhase[]' 부분은 '이 변수는 CoursePhase 타입 객체들의 배열'이라고 타입을 명시한 것입니다.
 *    이렇게 적어두면 배열 안의 각 객체가 위 설계도와 다르면 즉시 오류로 알려줍니다.)
 *   주의: const 라도 '배열 안의 내용'은 기술적으로 수정 가능합니다. 하지만 여기서는 '읽기 전용 데이터'로만 다루세요.
 *        (불변 데이터로 취급 = 화면에서 이 배열을 직접 고치지 말고, 필요하면 복사해서 쓰라는 의미.)
 */
export const coursePhases: CoursePhase[] = [
  {
    // [단계 1] 선수과정 — 본 과정 전 AI·바이브코딩 기초 역량을 쌓는 사전 학습(총 20시간)
    id: 'prerequisite',
    name: '선수과정',
    nameEn: 'Prerequisite',
    hours: 20,
    description: 'AI·바이브코딩 기초 역량을 갖추기 위한 사전 학습',
    descriptionEn: 'Pre-learning for AI and vibe coding fundamentals',
    color: '#10B981', // 초록 계열 — 선수과정 테마 컬러
    icon: '📚',
    days: [
      // 사전학습은 고정 날짜 없이 'date'를 라벨('사전학습')로 사용하며, 각 5시간씩 4일 구성
      // 즉 date 필드는 '실제 달력 날짜'일 수도, '사전학습' 같은 설명 라벨일 수도 있습니다(둘 다 그냥 문자열).
      { day: 1, date: '사전학습', title: 'AI 개론 및 프롬프트 기초', topics: ['AI 개념 이해', '생성AI 도구 소개', '프롬프트 기본 구조'], hours: 5, type: 'prerequisite' },
      { day: 2, date: '사전학습', title: 'ChatGPT / Gemini 실습', topics: ['ChatGPT 활용법', 'Gemini 비교 실습', '프롬프트 패턴'], hours: 5, type: 'prerequisite' },
      { day: 3, date: '사전학습', title: '국내 LLM(Solar 등) 탐색', topics: ['Solar API 소개', 'Solar vs ChatGPT 비교', '국내 LLM 생태계'], hours: 5, type: 'prerequisite' },
      { day: 4, date: '사전학습', title: '웹 기초 & 개발환경 세팅', topics: ['HTML/CSS 기초', 'VS Code 설치', 'Git/GitHub 기본'], hours: 5, type: 'prerequisite' },
      // 위 4개 항목 모두 project 속성이 없습니다. → project가 선택 속성(?)이라 생략 가능하기 때문입니다.
    ]
  },
  {
    // [단계 2] 정규과정 DT — 디지털 전환 핵심 역량 + 바이브코딩 프로젝트 실습(총 60시간, 15일 × 4시간)
    id: 'regular',
    name: '정규과정 DT',
    nameEn: 'Regular DT Course',
    hours: 60,
    description: '디지털 전환(DT) 핵심 역량 + AI 바이브코딩 프로젝트 실습',
    descriptionEn: 'Digital Transformation core competencies + AI vibe coding project practice',
    color: '#0D2B5E', // 진한 남색 — 정규과정 테마 컬러(브랜드 메인 컬러)
    icon: '🎓',
    days: [
      // 정규과정은 실제 운영 날짜(6월)를 'date'에 표기. project 필드로 미니/팀/실전 프로젝트 마일스톤을 표시
      // 아래에서 project가 있는 날만 화면에 '시작/발표/제출' 같은 표시가 추가로 나오게 됩니다.
      { day: 1, date: '6/1(월)', title: 'AI 기반 자동화 입문', topics: ['AI 자동화 개념', 'No-Code/Low-Code 도구', 'Make/Zapier 실습'], hours: 4, type: 'regular', project: '개인 미니프로젝트 시작' },
      { day: 2, date: '6/2(화)', title: '프롬프트 엔지니어링 심화', topics: ['고급 프롬프트 기법', 'Chain-of-Thought', 'Few-shot Learning'], hours: 4, type: 'regular' },
      { day: 3, date: '6/4(목)', title: '바이브코딩 기획 & 설계', topics: ['프로젝트 기획서 작성', 'UI/UX 설계', 'AI 기반 와이어프레임'], hours: 4, type: 'regular', project: '개인 미니프로젝트 발표' },
      // 일부 day의 date에는 '· 1차 기초점검'처럼 점검 일정이 함께 표기됨(별도 필드 아님, 라벨로 통합)
      // 주의: 점검 일정을 별도 속성으로 두지 않고 date 문자열 안에 합쳐 넣었습니다. 화면에서 분리해 쓰고 싶다면 문자열을 가공해야 합니다.
      { day: 4, date: '6/5(금) · 1차 기초점검', title: '웹·React 기초 점검 & 바이브코딩 구현 I', topics: ['1차 기초점검', 'React 기초', 'Cursor/Copilot 활용'], hours: 4, type: 'regular', project: '팀 미니프로젝트 시작' },
      { day: 5, date: '6/8(월)', title: '바이브코딩 구현 II', topics: ['Supabase 연동', 'CRUD 구현', 'API 설계'], hours: 4, type: 'regular', project: '팀 미니프로젝트 발표' },
      { day: 6, date: '6/9(화)', title: '데이터 수집 & 전처리', topics: ['데이터 수집 기법', '전처리 파이프라인', 'Solar API 연동'], hours: 4, type: 'regular' },
      { day: 7, date: '6/10(수)', title: 'AI 모델 활용 & Fine-tuning', topics: ['모델 선택 전략', 'Fine-tuning 기초', '프롬프트 최적화'], hours: 4, type: 'regular' },
      { day: 8, date: '6/11(목)', title: '실전 프로젝트 기획', topics: ['대회 주제 분석', '국내 LLM 활용 전략', '아이디어 도출'], hours: 4, type: 'regular', project: '실전 프로젝트 시작' },
      { day: 9, date: '6/12(금) · 2차 학습점검', title: '중간 점검 & 프론트엔드 구현', topics: ['2차 학습점검', 'UI 컴포넌트 개발', '반응형 디자인'], hours: 4, type: 'regular' },
      { day: 10, date: '6/15(월)', title: '백엔드 & API 연동', topics: ['Supabase 심화', '인증/권한 관리', 'REST API'], hours: 4, type: 'regular' },
      { day: 11, date: '6/16(화)', title: '배포 & 운영', topics: ['배포 자동화', 'CI/CD 기초', '도메인 연결'], hours: 4, type: 'regular' },
      { day: 12, date: '6/17(수)', title: '테스트 & 디버깅', topics: ['QA 전략', 'AI 디버깅 기법', '성능 최적화'], hours: 4, type: 'regular' },
      { day: 13, date: '6/18(목)', title: '발표 자료 제작', topics: ['프레젠테이션 구성', '데모 준비', '스토리텔링'], hours: 4, type: 'regular' },
      { day: 14, date: '6/19(금)', title: '발표 리허설 & 피드백', topics: ['발표 리허설', '상호 피드백', '최종 보완'], hours: 4, type: 'regular', project: '실전 프로젝트 제출' },
      // 마지막 날: '· 마지막날' 라벨로 종료 일자 강조, 최종 발표/수료식 진행
      { day: 15, date: '6/22(월) · 마지막날', title: '최종 발표 & 수료식', topics: ['프로젝트 최종 발표', '상호 평가', '수료식'], hours: 4, type: 'regular', project: '실전 프로젝트 최종 발표' },
    ]
  },
  {
    // [단계 3] 기술코칭 — 프로젝트 진행 중 진행되는 1:1/팀별 코칭 세션(총 8시간, 4회 × 2시간)
    id: 'coaching',
    name: '기술코칭',
    nameEn: 'Tech Coaching',
    hours: 8,
    description: '1:1/팀별 코칭 + 실전 부록 교안(Supabase 실전·키 보안·비용 사고 대응 등)',
    descriptionEn: 'Team coaching + practical appendices (Supabase patterns, key security, cost-incident response)',
    color: '#F59E0B', // 주황 계열 — 기술코칭 테마 컬러
    icon: '🔧',
    days: [
      // 코칭 회차는 정규과정 일정 사이에 끼워 진행되므로 date(6/12~6/20)가 정규과정과 겹칠 수 있음
      // 주의: 같은 날짜가 정규과정과 코칭 양쪽에 나타날 수 있습니다. 날짜만으로 항목을 합치려 하면 헷갈릴 수 있으니
      //       단계(type/id)까지 함께 보고 구분하세요. 여기서 day는 '코칭 회차 순번'(1~4회차)을 뜻합니다.
      { day: 1, date: '6/12(목)', title: '기술코칭 1회차', topics: ['프로젝트 진행 점검', '기술 이슈 해결', '아키텍처 리뷰'], hours: 2, type: 'coaching' },
      { day: 2, date: '6/13(금)', title: '기술코칭 2회차', topics: ['코드 리뷰', 'UI/UX 개선', '성능 최적화'], hours: 2, type: 'coaching' },
      { day: 3, date: '6/19(목)', title: '기술코칭 3회차', topics: ['배포 지원', 'Solar API 최적화', '발표 준비'], hours: 2, type: 'coaching' },
      { day: 4, date: '6/20(금)', title: '기술코칭 4회차', topics: ['최종 점검', '발표 리허설', '제출 준비'], hours: 2, type: 'coaching' },
    ]
  }
];

/**
 * projectExamples
 *   수강생에게 영감을 주기 위한 실전 프로젝트 예시 목록.
 *   - 각 항목: 프로젝트 제목(title), 설명(description), 추천 활용 LLM(llm)
 *   - 매개변수: 없음(상수)
 *   - 반환값: 프로젝트 예시 객체 배열
 *   - 부수효과: 없음
 *
 *   (LLM = Large Language Model, 대규모 언어 모델. ChatGPT·Gemini·Solar 같은 'AI 글 생성 모델'을 가리킵니다.)
 *   참고: 이 상수에는 별도 interface 타입을 지정하지 않았습니다. 이런 경우 TypeScript가 배열 내용을 보고
 *        '{ title: string; description: string; llm: string }[]' 타입을 자동으로 추론(추측해서 결정)합니다.
 *        → 그래서 새 항목을 추가할 때도 같은 세 속성을 맞춰 넣는 것이 안전합니다.
 */
export const projectExamples = [
  { title: 'AI 취업 코칭 챗봇', description: '구직자 맞춤형 이력서/면접 코칭 AI', llm: 'Solar + ChatGPT' },
  { title: '지역 문화 추천 서비스', description: '위치 기반 문화행사·맛집 추천 AI', llm: 'Solar' },
  { title: 'AI 학습 도우미', description: '개인 맞춤형 학습 경로 추천 시스템', llm: 'Solar + Gemini' },
  { title: '건강 관리 어시스턴트', description: 'AI 기반 운동/식단 추천 서비스', llm: 'ChatGPT' },
  { title: '환경 데이터 분석 대시보드', description: '공공데이터 기반 환경 모니터링', llm: 'Solar' },
];
