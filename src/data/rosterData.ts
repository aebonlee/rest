/**
 * 수강생 명단 (2026 AI Reboot Academy) — 기본 정보 30명
 * 명단에는 이메일/전화가 없어 회원가입 대조는 이름 기준으로 수행합니다.
 *
 * ── 파일 역할 / 책임 ──────────────────────────────────────────
 * 이 모듈은 AI Reboot Academy 1기 수강생 명단을 정적 데이터로 보관하는 단일 소스(SSOT)입니다.
 *   ※ SSOT(Single Source of Truth, 단일 진실 공급원): "이 정보가 필요하면 무조건 여기 한 곳만 본다"는 원칙.
 *     같은 명단을 여러 파일에 복사해 두면 한 곳만 고치고 나머지를 빠뜨려 데이터가 어긋나기 쉽습니다.
 *     그래서 명단은 이 파일에만 두고, 다른 파일은 여기서 import(가져오기)해 씁니다.
 * - 외부 API/DB가 아닌 코드에 하드코딩된 명단을 제공 → 통계, 미가입자 집계, 명단 렌더링 등에서 import해 사용.
 *     ※ 하드코딩(hardcoding): 값을 서버에서 받아오지 않고 소스 코드 안에 직접 적어두는 방식.
 *       인원이 30명 정도로 고정되어 있고 자주 바뀌지 않으므로 DB 없이 코드에 적는 편이 단순합니다.
 * - 원본 RAW 데이터에는 학습 수준(level)이 없으므로, experience 문자열을 분석해 level을 파생시켜 ROSTER로 가공.
 *     ※ "파생(derive)": 이미 가진 값(experience 글)을 가공해 새 값(level)을 자동으로 만들어내는 것.
 *       사람이 수준을 일일이 손으로 적지 않아도 되니 입력 실수가 줄어듭니다.
 *
 * ── 초보자를 위한 배경 용어 ──────────────────────────────────
 * - .ts 확장자: TypeScript 파일. JavaScript에 "타입(자료형) 검사"를 더한 언어로,
 *   값의 모양이 틀리면 실행 전에 에디터/빌드 단계에서 미리 오류를 잡아줍니다.
 * - export: 이 파일 밖(다른 파일)에서 쓸 수 있도록 공개한다는 표시. export가 없으면 이 파일 안에서만 사용 가능.
 * - type / interface: "값의 모양(형태)"을 미리 약속해 두는 설계도. 실행 결과물(JS)에는 남지 않고,
 *   개발 중 "이 자리에 어떤 값이 와야 하는지"를 검사하는 용도로만 쓰입니다.
 *
 * ── 주요 export ───────────────────────────────────────────────
 * - ExpLevel       : 학습 수준 리터럴 유니온 타입 ('입문' | '기초' | '경험자')
 * - RosterStudent  : 가공된 수강생 1명의 전체 형태(타입)
 * - ROSTER         : level이 채워진 최종 수강생 배열(컴포넌트에서 실제로 사용)
 * - ROSTER_COUNT   : 명단 총 인원 수(파생 상수)
 */

// 수강생의 학습 수준을 표현하는 리터럴 유니온 타입.
// experience 원문을 toLevel()로 분류한 결과가 이 셋 중 하나로 매핑됨.
//
// ※ 리터럴 유니온 타입: 들어올 수 있는 값을 "정해진 문자열 몇 개"로만 한정하는 타입.
//   파이프(|)는 "또는"이라는 뜻 → 이 타입의 값은 반드시 '입문', '기초', '경험자' 중 하나여야 함.
//   장점: 예를 들어 '초보' 같은 오타를 적으면 TypeScript가 즉시 오류로 잡아줌(허용 목록 밖이라서).
export type ExpLevel = '입문' | '기초' | '경험자';

// 가공 완료된 수강생 1명의 데이터 구조.
// RAW(원본)에는 level이 없고, ROSTER 생성 단계에서 level을 추가해 이 형태를 완성함.
//
// ※ interface: 객체(여러 속성을 묶은 값)의 모양을 정의하는 설계도.
//   아래 한 칸 한 칸이 "수강생 객체가 가져야 할 속성 이름과 그 자료형"을 나타냄.
//   속성 이름 뒤의 물음표(?)는 "있어도 되고 없어도 되는 선택 속성"이라는 뜻.
export interface RosterStudent {
  no: number;             // 명단 순번(1부터). 화면 정렬·식별용. 중도포기자도 번호는 유지됨.
  name: string;           // 이름. 명단에 연락처가 없어 회원가입 대조의 "유일한 기준 키"가 됨.
  gender?: '남' | '여';   // 미정(가입 시 접수) 가능 → 그래서 ?(선택 속성)이고 값도 '남'/'여' 둘 중 하나로 한정.
  major: string;          // 세부 전공명(예: '소방안전관리과').
  majorCategory: string;  // 전공을 묶은 큰 분류(예: '공학계열'). 계열별 통계에 사용.
  experience: string;     // 사전 설문에서 받은 자유 서술형 경험. 이 글을 분석해 아래 level을 만듦.
  /** 중도포기 — 명단 취소선 표시, 통계·미가입 집계에서 제외 */
  // ※ 선택 속성(?): 보통 학생 객체엔 이 키가 아예 없고, 포기한 사람에게만 dropped: true를 적음.
  //   값이 없을 때 dropped는 undefined가 되며, 화면 코드에서 보통 "if (s.dropped)"로 분기함.
  dropped?: boolean;
  level: ExpLevel;        // 위 ExpLevel 타입의 값(3종 중 하나). RAW에는 없고 가공 단계에서 채워짐(아래 ROSTER 참고).
}

/** 관련 경험 원문 → 학습 수준 분류 */
// experience 자유 서술 문자열을 키워드 포함 여부로 검사해 ExpLevel로 변환.
// 우선순위: 경험자 > 기초 > 입문 (위에서부터 먼저 매칭되는 분기가 채택됨).
//
// ※ 화살표 함수: (exp: string): ExpLevel => { ... } 는 함수를 정의하는 문법.
//   - (exp: string)  : 매개변수 exp는 문자열 한 개를 받음.
//   - : ExpLevel     : 이 함수가 돌려주는(반환하는) 값은 ExpLevel 타입(3종 중 하나)임을 약속.
//   - 부수효과 없음   : 입력만 보고 결과를 계산해 돌려줄 뿐, 바깥 변수를 바꾸지 않는 "순수 함수".
//
// ※ 왜 if를 위→아래 순서로 두었나(우선순위가 생기는 이유):
//   if 안에서 return을 만나는 순간 함수가 즉시 끝나며 아래 if들은 검사되지 않음.
//   그래서 더 강한 단계(경험자)를 맨 위에 두어야, '전공 + 기초' 같이 키워드가 겹쳐도 '경험자'로 먼저 확정됨.
const toLevel = (exp: string): ExpLevel => {
  // '전공/부트캠프/공모전/이수' 등 실무·교육 이력 키워드가 있으면 경험자.
  // ※ exp.includes('전공'): 문자열 exp 안에 '전공'이라는 글자가 들어있으면 true.
  //   ||(또는)로 연결했으므로 네 키워드 중 "하나라도" 들어 있으면 경험자로 판정.
  if (exp.includes('전공') || exp.includes('부트캠프') || exp.includes('공모전') || exp.includes('이수')) return '경험자';
  // 위 키워드는 없지만 '기초' 또는 '지식'이 언급되면 기초 수준.
  // (여기까지 내려왔다는 건 위의 경험자 키워드가 하나도 없었다는 뜻 — return으로 이미 끝났을 테니까.)
  if (exp.includes('기초') || exp.includes('지식')) return '기초';
  // 어떤 키워드에도 해당하지 않으면(처음/공란 등) 입문으로 분류. (윤혜수처럼 빈 문자열도 여기로 떨어짐)
  // ※ 주의: 단순 키워드 포함 검사라서 표현이 다르면 오분류될 수 있음.
  //   예) "기초도 없음"이라고 적어도 '기초'라는 글자가 들어있어 '기초'로 잡힘. 분류는 어디까지나 근사치임.
  return '입문';
};

// 원본 명단 데이터. level만 빠진 형태(Omit<RosterStudent, 'level'>)로 직접 작성하고,
// level은 아래 ROSTER 생성 시 toLevel()로 일괄 계산함 → 사람이 수준을 수기로 적는 실수를 방지.
//
// ※ Omit<RosterStudent, 'level'>: RosterStudent 타입에서 'level' 속성만 빼낸(제외한) 타입.
//   "RAW 단계에서는 level을 아직 적지 않는다"는 사실을 타입으로 못 박아, 실수로 level을 적거나 빠뜨리는 걸 방지.
// ※ [] (배열): 같은 모양의 객체 여러 개를 순서대로 담는 자료구조. 아래 { ... }, 하나가 학생 1명.
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
  // ※ 주의: dropped를 적은 사람은 이 한 명(no:20)뿐이고, 나머지 객체엔 dropped 키 자체가 없음(= undefined = "포기 아님").
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
  // ※ 엣지케이스(edge case): "흔치 않지만 처리해야 하는 예외적 입력". 여기선 '경험 미입력' 상태가 그것.
  //   빈 문자열 ''도 어떤 키워드도 포함하지 않으므로 toLevel()의 마지막 줄(return '입문')로 자연스럽게 떨어짐 → 별도 처리 불필요.
  { no: 31, name: '윤혜수', gender: '여', major: '바이오', majorCategory: '자연계열', experience: '' }, // jkl459@naver.com — 성별 여 (경험은 가입 시 접수)
];

// 최종 수강생 명단. RAW 각 항목에 toLevel()로 계산한 level을 합쳐(스프레드) 완성된 RosterStudent[] 생성.
// 컴포넌트/통계 로직은 RAW가 아니라 이 ROSTER를 import해서 사용해야 함.
//
// ※ .map((s) => ...): 배열의 모든 원소를 하나씩 변환해 "같은 길이의 새 배열"을 만드는 메서드.
//   여기서 s는 RAW의 학생 한 명(level 없는 객체). 각 s마다 아래 새 객체를 만들어 ROSTER에 담음.
// ※ { ...s, level: toLevel(s.experience) } 풀이:
//   - ...s            : 스프레드(펼치기) 문법. s가 가진 속성(no, name, gender, ...)을 그대로 새 객체에 복사.
//   - level: ...      : 그 위에 level 속성을 새로 추가. 값은 s.experience를 toLevel()에 넣어 계산한 결과.
//   결과적으로 "원본 속성 전부 + 계산된 level"을 갖춘 RosterStudent 객체가 완성됨.
// ※ 불변성(immutability): map과 스프레드는 RAW를 직접 수정하지 않고 "새 배열/새 객체"를 만들어 냄.
//   원본을 건드리지 않는 이 방식이 안전하며, React 상태 관리에서도 같은 원칙이 널리 쓰임.
export const ROSTER: RosterStudent[] = RAW.map((s) => ({ ...s, level: toLevel(s.experience) }));

// 명단 총 인원 수(중도포기 포함 전체 길이). 화면의 "총 N명" 표기 등에 사용.
// ※ .length: 배열에 든 원소(학생) 개수. ROSTER가 RAW와 같은 길이이므로 명단 전체 인원이 됨.
// ※ 주의: 이 값은 중도포기자(dropped: true)까지 포함한 "전체" 수임.
//   "활동 중인 인원"만 세려면 화면 코드에서 ROSTER.filter((s) => !s.dropped).length 처럼 따로 걸러야 함.
export const ROSTER_COUNT = ROSTER.length;
