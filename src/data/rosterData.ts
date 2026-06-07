/**
 * 수강생 명단 (2026 AI Reboot Academy) — 기본 정보 30명
 * 명단에는 이메일/전화가 없어 회원가입 대조는 이름 기준으로 수행합니다.
 *
 * ── 파일 역할 / 책임 ──────────────────────────────────────────
 * 이 모듈은 AI Reboot Academy 1기 수강생 명단을 정적 데이터로 보관하는 단일 소스(SSOT)입니다.
 * - 외부 API/DB가 아닌 코드에 하드코딩된 명단을 제공 → 통계, 미가입자 집계, 명단 렌더링 등에서 import해 사용.
 * - 원본 RAW 데이터에는 학습 수준(level)이 없으므로, experience 문자열을 분석해 level을 파생시켜 ROSTER로 가공.
 *
 * ── 주요 export ───────────────────────────────────────────────
 * - ExpLevel       : 학습 수준 리터럴 유니온 타입 ('입문' | '기초' | '경험자')
 * - RosterStudent  : 가공된 수강생 1명의 전체 형태(타입)
 * - ROSTER         : level이 채워진 최종 수강생 배열(컴포넌트에서 실제로 사용)
 * - ROSTER_COUNT   : 명단 총 인원 수(파생 상수)
 */

// 수강생의 학습 수준을 표현하는 리터럴 유니온 타입.
// experience 원문을 toLevel()로 분류한 결과가 이 셋 중 하나로 매핑됨.
export type ExpLevel = '입문' | '기초' | '경험자';

// 가공 완료된 수강생 1명의 데이터 구조.
// RAW(원본)에는 level이 없고, ROSTER 생성 단계에서 level을 추가해 이 형태를 완성함.
export interface RosterStudent {
  no: number;
  name: string;
  gender?: '남' | '여';   // 미정(가입 시 접수) 가능
  major: string;
  majorCategory: string;
  experience: string;
  /** 중도포기 — 명단 취소선 표시, 통계·미가입 집계에서 제외 */
  dropped?: boolean;
  level: ExpLevel;
}

/** 관련 경험 원문 → 학습 수준 분류 */
// experience 자유 서술 문자열을 키워드 포함 여부로 검사해 ExpLevel로 변환.
// 우선순위: 경험자 > 기초 > 입문 (위에서부터 먼저 매칭되는 분기가 채택됨).
const toLevel = (exp: string): ExpLevel => {
  // '전공/부트캠프/공모전/이수' 등 실무·교육 이력 키워드가 있으면 경험자.
  if (exp.includes('전공') || exp.includes('부트캠프') || exp.includes('공모전') || exp.includes('이수')) return '경험자';
  // 위 키워드는 없지만 '기초' 또는 '지식'이 언급되면 기초 수준.
  if (exp.includes('기초') || exp.includes('지식')) return '기초';
  // 어떤 키워드에도 해당하지 않으면(처음/공란 등) 입문으로 분류. (윤혜수처럼 빈 문자열도 여기로 떨어짐)
  return '입문';
};

// 원본 명단 데이터. level만 빠진 형태(Omit<RosterStudent, 'level'>)로 직접 작성하고,
// level은 아래 ROSTER 생성 시 toLevel()로 일괄 계산함 → 사람이 수준을 수기로 적는 실수를 방지.
const RAW: Omit<RosterStudent, 'level'>[] = [
  { no: 1, name: '구자성', gender: '남', major: '소방안전관리과', majorCategory: '공학계열', experience: '이번이 아예 처음임' },
  { no: 2, name: '권규빈', gender: '여', major: '문화콘텐츠문화경영학', majorCategory: '인문계열', experience: '이번이 처음' },
  { no: 3, name: '김건희', gender: '남', major: '항공교통물류', majorCategory: '사회계열', experience: '(IT/AI) 기초적인 지식은 있음' },
  { no: 4, name: '김권우', gender: '남', major: '인문계 고졸', majorCategory: '인문계열', experience: '전공/부트캠프/공모전 경험' },
  { no: 5, name: '김서우', gender: '여', major: '항공서비스', majorCategory: '사회계열', experience: '이번이 처음' },
  { no: 6, name: '박남영', gender: '여', major: '시각정보디자인', majorCategory: '예체능계열', experience: 'IT/AI 기초 보유' },
  { no: 7, name: '박수아', gender: '여', major: '신문방송학과', majorCategory: '사회계열', experience: '전공자 혹은 부트캠프/공모전/관련 교육 이수 경험 있음' },
  { no: 8, name: '박정우', gender: '여', major: '비서학과', majorCategory: '사회계열', experience: '(IT/AI) 기초적인 지식은 있음' },
  { no: 9, name: '신대영', gender: '남', major: '행정학과', majorCategory: '사회계열', experience: '(IT/AI) 기초적인 지식은 있음' },
  { no: 10, name: '신슬', gender: '여', major: '아동학', majorCategory: '교육계열', experience: '이번이 처음' },
  { no: 11, name: '오지원', gender: '여', major: '화공생명공학', majorCategory: '공학계열', experience: '이번이 처음' },
  { no: 12, name: '유용주', gender: '남', major: '데이터사이언스학부', majorCategory: '자연계열', experience: '전공/부트캠프/공모전 경험' },
  { no: 13, name: '이소민', gender: '여', major: '도예학과', majorCategory: '예체능계열', experience: 'IT/AI 기초 보유' },
  { no: 14, name: '이수현', gender: '여', major: '의무행정과', majorCategory: '인문계열', experience: '이번이 처음' },
  { no: 15, name: '이시민', gender: '여', major: '의류학', majorCategory: '예체능계열', experience: 'IT/AI 기초 보유' },
  { no: 16, name: '이유민', gender: '여', major: '사학과', majorCategory: '인문계열', experience: '이번이 아예 처음임' },
  { no: 17, name: '이초월', gender: '여', major: '디지털미디어디자인', majorCategory: '예체능계열', experience: 'IT/AI 기초 보유' },
  { no: 18, name: '임윤서', gender: '여', major: '경제학부', majorCategory: '사회계열', experience: '이번이 처음' },
  { no: 19, name: '임종권', gender: '남', major: '전기공학부', majorCategory: '공학계열', experience: 'IT/AI 기초 보유' },
  // dropped: true → 중도포기 처리. 명단에서 취소선으로 표시되고 통계·미가입 집계에서 제외됨(인덱스/no는 그대로 유지).
  { no: 20, name: '임지윤', gender: '여', major: '경제학과', majorCategory: '사회계열', experience: '이번이 처음', dropped: true },
  { no: 21, name: '장호준', gender: '남', major: '스포츠 매니지먼트', majorCategory: '인문계열', experience: '이번이 처음' },
  { no: 22, name: '전유미', gender: '여', major: '환경공학과', majorCategory: '공학계열', experience: '전공/부트캠프/공모전 경험' },
  { no: 23, name: '정미경', gender: '여', major: '융합학과', majorCategory: '예체능계열', experience: 'IT/AI 기초 보유' },
  { no: 24, name: '조윤서', gender: '여', major: '사진학과', majorCategory: '예체능계열', experience: '전공자 혹은 부트캠프/공모전/관련 교육 이수 경험 있음' },
  { no: 25, name: '조하령', gender: '여', major: '의공학부', majorCategory: '공학계열', experience: 'IT/AI 기초 보유' },
  { no: 26, name: '최윤경', gender: '여', major: '전산학', majorCategory: '공학계열', experience: '전공/부트캠프/공모전 경험' },
  { no: 27, name: '최윤정', gender: '여', major: '영어영문학과', majorCategory: '인문계열', experience: 'IT/AI 기초 보유' },
  { no: 28, name: '최재영', gender: '남', major: '컴퓨터공학및영어', majorCategory: '공학계열', experience: '전공/부트캠프/공모전 경험' },
  { no: 29, name: '하소희', gender: '여', major: '컴퓨터과학', majorCategory: '공학계열', experience: '전공/부트캠프/공모전 경험' },
  { no: 30, name: '한승우', gender: '남', major: '정보통신공학과', majorCategory: '공학계열', experience: '전공/부트캠프/공모전 경험' },
  // 엣지케이스: experience가 빈 문자열('') → toLevel()에서 모든 키워드 미스 → '입문'으로 분류됨.
  // 경험 정보는 추후 가입 시점에 접수 예정이라 현재 비워둠(주석에 식별용 이메일·성별 메모 보존).
  { no: 31, name: '윤혜수', gender: '여', major: '바이오', majorCategory: '자연계열', experience: '' }, // jkl459@naver.com — 성별 여 (경험은 가입 시 접수)
];

// 최종 수강생 명단. RAW 각 항목에 toLevel()로 계산한 level을 합쳐(스프레드) 완성된 RosterStudent[] 생성.
// 컴포넌트/통계 로직은 RAW가 아니라 이 ROSTER를 import해서 사용해야 함.
export const ROSTER: RosterStudent[] = RAW.map((s) => ({ ...s, level: toLevel(s.experience) }));

// 명단 총 인원 수(중도포기 포함 전체 길이). 화면의 "총 N명" 표기 등에 사용.
export const ROSTER_COUNT = ROSTER.length;
