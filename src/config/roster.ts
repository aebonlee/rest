/**
 * roster.ts — AI Reboot Academy 1기 공식 수강생 명단 (Source of Truth)
 *
 * [왜 필요한가]
 *   기존 출결/성적 집계는 user_profiles 를 signup_domain 으로 조회한 뒤 전화번호·이름으로
 *   "동일인 통합"했다. 그런데 ① 서로 다른 학생이 같은 전화번호를 입력하면 한 명으로 잘못
 *   합쳐지거나 ② signup_domain 이 어긋난 계정이 누락되어 인원이 실제와 달라지는 문제가 있었다.
 *   → 이 파일의 "공식 명단(이름+이메일)"을 기준(source of truth)으로 삼아, 계정을 이메일로
 *     매칭하면 인원이 항상 명단과 정확히 일치한다.
 *
 * [상태(status)]
 *   - active        : 정상 수강(출결·성적 집계 대상)
 *   - not_registered: 명단엔 있으나 계정 미가입 (집계 제외)
 *   - withdrawn     : 중도포기 (집계 제외)
 *
 * [emails]
 *   한 사람이 계정을 2개 이상 만든 경우 모두 나열한다(이메일로 계정을 매칭하므로 정확).
 */
export type RosterStatus = 'active' | 'not_registered' | 'withdrawn';

export interface RosterStudent {
  no: number;
  name: string;
  gender?: '남' | '여';
  major?: string;   // 전공
  track?: string;   // 계열
  level?: string;   // 수준(입문/기초/경험자 등)
  status: RosterStatus;
  emails: string[]; // 알려진 계정 이메일(소문자) — 0개면 미가입
}

export const STUDENT_ROSTER: RosterStudent[] = [
  { no: 1,  name: '구자성', gender: '남', major: '소방안전관리과',     track: '공학계열', level: '입문',   status: 'active', emails: ['wkjd05@naver.com', 'wkjd05@gmail.com'] },
  { no: 2,  name: '권규빈', gender: '여', major: '문화콘텐츠문화경영학', track: '인문계열', level: '입문',   status: 'active', emails: ['kwonqbeen@gmail.com'] },
  { no: 3,  name: '김건희', gender: '남', major: '항공교통물류',       track: '사회계열', level: '기초',   status: 'active', emails: ['rjsgml13486@gmail.com'] },
  { no: 4,  name: '김권우', gender: '남', major: '인문계 고졸',        track: '인문계열', level: '경험자', status: 'active', emails: ['na900815@kakao.com'] },
  { no: 5,  name: '김서우', gender: '여', major: '항공서비스',         track: '사회계열', level: '입문',   status: 'active', emails: ['seowoo92@gmail.com'] },
  { no: 6,  name: '박남영', gender: '여', major: '시각정보디자인',     track: '예체능계열', level: '기초', status: 'active', emails: ['dlfspgnt@gmail.com'] },
  { no: 7,  name: '박수아', gender: '여', major: '신문방송학과',       track: '사회계열', level: '경험자', status: 'active', emails: ['ark230015@gmail.com'] },
  { no: 8,  name: '박정우', gender: '여', major: '비서학과',           track: '사회계열', level: '기초',   status: 'active', emails: ['lbaikal1742@gmail.com'] },
  { no: 9,  name: '신대영', gender: '남', major: '행정학과',           track: '사회계열', level: '기초',   status: 'not_registered', emails: [] },
  { no: 10, name: '신슬',   gender: '여', major: '아동학',             track: '교육계열', level: '입문',   status: 'active', emails: ['martiniblues@naver.com'] },
  { no: 11, name: '오지원', gender: '여', major: '화공생명공학',       track: '공학계열', level: '입문',   status: 'active', emails: ['stecy73@naver.com'] },
  { no: 12, name: '유용주', gender: '남', major: '데이터사이언스학부', track: '자연계열', level: '경험자', status: 'active', emails: ['dbdydwn14@gmail.com'] },
  { no: 13, name: '이소민', gender: '여', major: '도예학과',           track: '예체능계열', level: '기초', status: 'active', emails: ['sm990650@gmail.com'] },
  { no: 14, name: '이수현', gender: '여', major: '의무행정과',         track: '인문계열', level: '입문',   status: 'active', emails: ['ghn02047@naver.com'] },
  { no: 15, name: '이시민', gender: '여', major: '의류학',             track: '예체능계열', level: '기초', status: 'active', emails: ['lsm5735@gmail.com'] },
  { no: 16, name: '이유민', gender: '여', major: '사학과',             track: '인문계열', level: '입문',   status: 'active', emails: ['yoominggg2164@gmail.com'] },
  { no: 17, name: '이초월', gender: '여', major: '디지털미디어디자인', track: '예체능계열', level: '기초', status: 'active', emails: ['healmeanliv@gmail.com'] },
  { no: 18, name: '임윤서', gender: '여', major: '경제학부',           track: '사회계열', level: '입문',   status: 'active', emails: ['alicelimti@gmail.com'] },
  { no: 19, name: '임종권', gender: '남', major: '전기공학부',         track: '공학계열', level: '기초',   status: 'active', emails: ['ssujklim@gmail.com', 'deathbed0104@gmail.com'] },
  { no: 20, name: '임지윤', gender: '여', major: '경제학과',           track: '사회계열', level: '입문',   status: 'withdrawn', emails: [] },
  { no: 21, name: '장호준', gender: '남', major: '스포츠 매니지먼트',  track: '인문계열', level: '입문',   status: 'active', emails: ['tmxoflr@gmail.com'] },
  { no: 22, name: '전유미', gender: '여', major: '환경공학과',         track: '공학계열', level: '경험자', status: 'active', emails: ['dbal1107@gmail.com'] },
  { no: 23, name: '정미경', gender: '여', major: '융합학과',           track: '예체능계열', level: '기초', status: 'active', emails: ['jmig0831@gmail.com'] },
  { no: 24, name: '조윤서', gender: '여', major: '사진학과',           track: '예체능계열', level: '경험자', status: 'active', emails: ['yunseo.ys.cho@gmail.com'] },
  { no: 25, name: '조하령', gender: '여', major: '의공학부',           track: '공학계열', level: '기초',   status: 'active', emails: ['jhl8397@naver.com'] },
  { no: 26, name: '최윤경', gender: '여', major: '전산학',             track: '공학계열', level: '경험자', status: 'active', emails: ['ykchoi1020@gmail.com'] },
  { no: 27, name: '최윤정', gender: '여', major: '영어영문학과',       track: '인문계열', level: '기초',   status: 'active', emails: ['avabrownbb@gmail.com'] },
  { no: 28, name: '최재영', gender: '남', major: '컴퓨터공학및영어',   track: '공학계열', level: '경험자', status: 'active', emails: ['istp0109318@gmail.com', 'fghjkkzxvvbn@naver.com'] },
  { no: 29, name: '하소희', gender: '여', major: '컴퓨터과학',         track: '공학계열', level: '경험자', status: 'active', emails: ['plzncii@gmail.com'] },
  { no: 30, name: '한승우', gender: '남', major: '정보통신공학과',     track: '공학계열', level: '경험자', status: 'active', emails: ['hsu235@gmail.com'] },
  { no: 31, name: '윤혜수', gender: '여', major: '바이오',             track: '자연계열', level: '입문',   status: 'active', emails: ['jkl459@naver.com'] },
];

/** 출결·성적 집계 대상(정상 수강) — 미가입·중도포기 제외 */
export const ACTIVE_ROSTER: RosterStudent[] = STUDENT_ROSTER.filter((s) => s.status === 'active');

/** 활성 수강생의 모든 계정 이메일(소문자) — user_profiles 조회용 */
export const ROSTER_EMAILS: string[] = ACTIVE_ROSTER.flatMap((s) => s.emails.map((e) => e.toLowerCase()));
