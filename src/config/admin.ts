// 이 목록은 rest(쉬었음) 사이트 배포 전용 — 여기 등록된 이메일만 rest 관리자 권한(대시보드 등)을 가집니다.
// 다른 DreamIT 사이트는 각자의 ADMIN_EMAILS를 쓰므로, 여기 추가해도 권한은 rest 사이트에만 한정됩니다.
export const ADMIN_EMAILS: string[] = [
  'aebon@kakao.com',
  'radical8566@gmail.com',
  'aebon@kyonggi.ac.kr',
  'a01094819953@gmail.com', // 백진주 — 쉬었음(rest) 사이트 한정 관리자(대시보드 접속)
  'jotu117@gmail.com', // 조두수 수석 — rest 사이트 한정 관리자(대시보드 접속)
  'jooym6016@kidico.or.kr', // 주윤미 책임 — rest 사이트 한정 관리자(대시보드 접속)
  'tlskaksmf@naver.com', // 주윤미 책임 보조 이메일 — rest 사이트 한정 관리자
];

// 동일인이지만 계정(이메일)을 2개 이상 만든 사람 — 화면에서 한 명으로 묶어 표시.
// groupByPerson 이 전화/이름으로 못 묶는 경우(전화·이름이 다른 계정)를 명시적으로 통합한다.
// name 을 주면 묶인 사람의 표시 이름으로 사용한다.
export interface SamePersonGroup {
  name?: string;
  emails: string[];
}

export const SAME_PERSON_EMAIL_GROUPS: SamePersonGroup[] = [
  { name: '주윤미', emails: ['jooym6016@kidico.or.kr', 'tlskaksmf@naver.com'] },
  // 이유민: 프로필 실명이 비어 자동 닉네임('행복한흰이마기러기')으로 저장됨 → 실명 표시 고정
  { name: '이유민', emails: ['yoominggg2164@gmail.com'] },
  // 임종권: 계정 2개로 응시 — 본 계정 ssujklim 으로 통합(성적은 최고점 채택)
  { name: '임종권', emails: ['ssujklim@gmail.com', 'deathbed0104@gmail.com'] },
  // 최재영: 계정 2개 통합 (istp0109318 + fghjkkzxvvbn)
  { name: '최재영', emails: ['istp0109318@gmail.com', 'fghjkkzxvvbn@naver.com'] },
];
