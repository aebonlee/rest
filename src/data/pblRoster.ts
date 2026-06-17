/**
 * 수강생 명단 — 서울대학교 (공유)빅데이터 캡스톤 디자인 / 혁신공유학부 개설.
 * 수강신청 기반 명단(소속·전공)으로, 개인 이름/연락처는 포함하지 않습니다.
 * 총 26명 · 대학(원)별: 인문4·사회4·공과4·경영3·농생대3·자유전공3·생활2·미술1·음악1·혁신공유1.
 */

export const COURSE_TITLE = '(공유)빅데이터 캡스톤 디자인';
export const HOST_COLLEGE = '혁신공유학부';
export const HOST_DEPARTMENT = '혁신공유학부';

export interface RosterStudent {
  no: number;
  /** 대학(원) */
  college: string;
  /** 학과(부) */
  department: string;
  /** 전공 */
  major: string;
  /** 수강신청상태 */
  status: string;
  /** 교과구분 (일선 / 학사 / 전선 …) */
  courseType: string;
  /** 전공구분 (주전공 등, 없으면 빈 문자열) */
  majorType: string;
}

export const ROSTER: RosterStudent[] = [
  { no: 1,  college: '인문대학',         department: '중어중문학과',     major: '중어중문학전공',   status: '유효', courseType: '일선', majorType: '' },
  { no: 2,  college: '인문대학',         department: '서어서문학과',     major: '서어서문학전공',   status: '유효', courseType: '일선', majorType: '' },
  { no: 3,  college: '인문대학',         department: '서양사학과',       major: '서양사학전공',     status: '유효', courseType: '일선', majorType: '' },
  { no: 4,  college: '인문대학',         department: '역사학부',         major: '동양사학전공',     status: '유효', courseType: '일선', majorType: '' },
  { no: 5,  college: '사회과학대학',     department: '인류학과',         major: '인류학전공',       status: '유효', courseType: '일선', majorType: '' },
  { no: 6,  college: '사회과학대학',     department: '사회복지학과',     major: '사회복지학전공',   status: '유효', courseType: '일선', majorType: '' },
  { no: 7,  college: '사회과학대학',     department: '정치외교학부',     major: '',                 status: '유효', courseType: '일선', majorType: '' },
  { no: 8,  college: '사회과학대학',     department: '정치외교학부',     major: '정치학전공',       status: '유효', courseType: '일선', majorType: '' },
  { no: 9,  college: '경영대학',         department: '경영학과',         major: '경영학전공',       status: '유효', courseType: '일선', majorType: '' },
  { no: 10, college: '경영대학',         department: '경영학과',         major: '경영학전공',       status: '유효', courseType: '학사', majorType: '' },
  { no: 11, college: '경영대학',         department: '경영학과',         major: '경영학전공',       status: '유효', courseType: '일선', majorType: '' },
  { no: 12, college: '생활과학대학',     department: '의류학과',         major: '의류학전공',       status: '유효', courseType: '일선', majorType: '' },
  { no: 13, college: '생활과학대학',     department: '소비자아동학부',   major: '소비자학전공',     status: '유효', courseType: '일선', majorType: '' },
  { no: 14, college: '공과대학',         department: '산업공학과',       major: '산업공학전공',     status: '유효', courseType: '일선', majorType: '' },
  { no: 15, college: '공과대학',         department: '산업공학과',       major: '산업공학전공',     status: '유효', courseType: '일선', majorType: '' },
  { no: 16, college: '공과대학',         department: '컴퓨터공학부',     major: '컴퓨터공학전공',   status: '유효', courseType: '일선', majorType: '' },
  { no: 17, college: '공과대학',         department: '화학생물공학부',   major: '화학생물공학전공', status: '유효', courseType: '일선', majorType: '' },
  { no: 18, college: '농업생명과학대학', department: '응용생물화학부',   major: '응용생물학전공',   status: '유효', courseType: '일선', majorType: '' },
  { no: 19, college: '농업생명과학대학', department: '농경제사회학부',   major: '지역정보학전공',   status: '유효', courseType: '일선', majorType: '' },
  { no: 20, college: '농업생명과학대학', department: '산림과학부',       major: '환경재료과학전공', status: '유효', courseType: '일선', majorType: '' },
  { no: 21, college: '미술대학',         department: '동양화과',         major: '동양화전공',       status: '유효', courseType: '일선', majorType: '' },
  { no: 22, college: '음악대학',         department: '국악과',           major: '국악전공',         status: '유효', courseType: '일선', majorType: '' },
  { no: 23, college: '자유전공학부',     department: '자유전공학부',     major: '',                 status: '유효', courseType: '일선', majorType: '' },
  { no: 24, college: '자유전공학부',     department: '자유전공학부',     major: '',                 status: '유효', courseType: '일선', majorType: '' },
  { no: 25, college: '자유전공학부',     department: '자유전공학부',     major: '',                 status: '유효', courseType: '일선', majorType: '' },
  { no: 26, college: '혁신공유학부',     department: '혁신공유학부',     major: '',                 status: '유효', courseType: '전선', majorType: '주전공' },
];

export const ROSTER_COUNT = ROSTER.length;

/** 대학(원)별 수강 인원 분포 (인원 많은 순) */
export const collegeDistribution = (): { college: string; count: number }[] => {
  const m = new Map<string, number>();
  ROSTER.forEach((s) => m.set(s.college, (m.get(s.college) ?? 0) + 1));
  return Array.from(m, ([college, count]) => ({ college, count }))
    .sort((a, b) => b.count - a.count || a.college.localeCompare(b.college));
};

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

/** 명단 기준 선택 옵션 (기본정보 입력·명단 대조용) */
export const COLLEGES = uniq(ROSTER.map((s) => s.college));
export const COURSE_TYPES = uniq(ROSTER.map((s) => s.courseType));
export const MAJOR_TYPES = uniq(ROSTER.map((s) => s.majorType)); // '' 포함될 수 있음

export const departmentsOf = (college: string): string[] =>
  uniq(ROSTER.filter((s) => s.college === college).map((s) => s.department));

export const majorsOf = (college: string, department: string): string[] =>
  uniq(ROSTER.filter((s) => s.college === college && s.department === department).map((s) => s.major));

/** 명단 대조 — 대학·학과(필수) + 전공(있으면) 일치 행이 있는지 */
export const matchRoster = (college: string, department: string, major?: string): boolean => {
  if (!college || !department) return false;
  return ROSTER.some(
    (s) => s.college === college && s.department === department && (!major || !s.major || s.major === major),
  );
};
