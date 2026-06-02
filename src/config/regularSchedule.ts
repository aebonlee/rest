/**
 * 정규과정 Day별 수업 날짜 (주말·공강 제외). 총 15일(6/1~6/22).
 * regularTopics[i] ↔ REGULAR_DATES[i] 인덱스 1:1 매핑 (점검일 포함 15개, 순서 일치 필수).
 *
 * 일정 변경·공강 추가 시 이 배열만 수정하면 사이드바·"오늘" 표시가 자동 반영됩니다.
 */
export const REGULAR_DATES: string[] = [
  '2026-06-01', // Day 1   (월)
  '2026-06-02', // Day 2   (화)  ← 오늘
  '2026-06-04', // Day 3   (목)   6/3(수) 공강
  '2026-06-05', // Day 4   (금) · 1차 기초점검일
  '2026-06-08', // Day 5   (월)
  '2026-06-09', // Day 6   (화)
  '2026-06-10', // Day 7   (수)
  '2026-06-11', // Day 8   (목)
  '2026-06-12', // Day 9   (금) · 2차 학습점검일
  '2026-06-15', // Day 10  (월)
  '2026-06-16', // Day 11  (화)
  '2026-06-17', // Day 12  (수)
  '2026-06-18', // Day 13  (목)
  '2026-06-19', // Day 14  (금)
  '2026-06-22', // Day 15  (월)  ← 마지막날, 총 15일
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
