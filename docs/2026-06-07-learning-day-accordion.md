# 2026-06-07 — 학습 일자(Day1~15) 드롭다운 아코디언화

## 배경
정규과정 사이드바에서 Day별 드롭다운(3차 메뉴)이 날짜별로 열리는 점은 좋으나,
같은 일자를 다시 눌러도 닫히지 않았음. "하나 열고, 다른 걸 누르면 이전 게 닫히는" 아코디언 요청.

## 변경 — `src/pages/Learning.tsx`
- 펼침 상태를 `selectedIndex`에서 분리해 별도 `openIndex` 상태로 관리(단일 값 → 한 번에 하나만 열림).
- 초기값 계산을 `computeInitialIndex(phase)` 헬퍼로 추출해 `selectedIndex`/`openIndex` 양쪽 초기화에 재사용(로드 시 오늘 일자 펼침 유지).
- `handleDayClick`을 아코디언 토글로 변경:
  - 다른 일자 클릭 → 그 일자 펼침(서브 있을 때), 나머지는 단일 상태라 자동 닫힘 + 개요 콘텐츠로 전환.
  - 같은 일자 다시 클릭 → 펼침 토글(열려 있으면 닫힘).
  - 서브섹션 없는 점검일(Day4·9) → 펼침 없이 이전 드롭다운만 닫힘.
- 메뉴 렌더의 `expanded` 기준을 `isActive` → `openIndex === i`로 변경.

## 검증
- `npm run build` 통과.

## 배포 메모
- UI 로직만 변경. main push → GitHub Actions 자동배포.
