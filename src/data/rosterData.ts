/**
 * 수강생 명단 (2026 AI Reboot Academy) — 기본 정보 30명
 * 명단에는 이메일/전화가 없어 회원가입 대조는 이름 기준으로 수행합니다.
 */

export type ExpLevel = '입문' | '기초' | '경험자';

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
const toLevel = (exp: string): ExpLevel => {
  if (exp.includes('전공') || exp.includes('부트캠프') || exp.includes('공모전') || exp.includes('이수')) return '경험자';
  if (exp.includes('기초') || exp.includes('지식')) return '기초';
  return '입문';
};

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
  { no: 31, name: '윤혜수', gender: '여', major: '바이오', majorCategory: '자연계열', experience: '' }, // jkl459@naver.com — 성별 여 (경험은 가입 시 접수)
];

export const ROSTER: RosterStudent[] = RAW.map((s) => ({ ...s, level: toLevel(s.experience) }));

export const ROSTER_COUNT = ROSTER.length;
