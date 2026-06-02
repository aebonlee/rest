/**
 * 정규과정 Day별 수업 날짜 (주말·공강 제외).
 * regularTopics[i] ↔ REGULAR_DATES[i] (인덱스 1:1 매핑, Day i+1).
 *
 * ⚠️ 실제 운영 일정에 맞춰 확인·수정 필요.
 *    현재 값은 "주말 제외 + 6/3(수) 공강 + Day1=6/1" 규칙의 임시 일정입니다.
 */
export const REGULAR_DATES: string[] = [
  '2026-06-01', // Day 1  (월)
  '2026-06-02', // Day 2  (화)  ← 오늘
  '2026-06-04', // Day 3  (목)   6/3(수) 공강
  '2026-06-05', // Day 4  (금)
  '2026-06-08', // Day 5  (월)
  '2026-06-09', // Day 6  (화)
  '2026-06-10', // Day 7  (수)
  '2026-06-11', // Day 8  (목)
  '2026-06-12', // Day 9  (금)
  '2026-06-15', // Day 10 (월)
  '2026-06-16', // Day 11 (화)
  '2026-06-17', // Day 12 (수)
  '2026-06-18', // Day 13 (목)
];

const WD = ['일', '월', '화', '수', '목', '금', '토'];

/** 'YYYY-MM-DD' → 'M/D(요일)' */
export const fmtKDate = (iso: string): string => {
  const [, m, d] = iso.split('-').map(Number);
  const wd = WD[new Date(`${iso}T00:00:00`).getDay()];
  return `${m}/${d}(${wd})`;
};

/** 오늘 날짜를 'YYYY-MM-DD'(로컬)로 */
export const todayISO = (): string => {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
};
