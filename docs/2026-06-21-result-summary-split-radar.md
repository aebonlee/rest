# 결과평가 집계표 — 레이더 차트 2계열 분할

날짜: 2026-06-21

## 배경
프로젝트 결과평가 집계표(`/competition/result-summary`)의 선택 팀 패널은 10개 평가 항목을
하나의 10각형(decagon) 레이더 차트로 표시했다. 축이 10개라 라벨이 촘촘하고 항목 간 강·약을
한눈에 비교하기 어려웠다. 10개 항목을 **2개 계열(각 5축)** 의 오각형 레이더로 분할해
가독성과 계열별 비교를 개선한다.

## 계열 분할 (5 + 5)
| 계열 | 항목 |
|------|------|
| **기획·비즈니스** | 주제 · 아이디어 · 팀역량 · 사업화 가능성 · 발표·시연 |
| **구현·기술** | 디자인 · 프로그래밍 · AI 기능개발 · Solar 활용 · 완성도 |

두 계열 keys의 합집합 = `RESULT_CRITERIA` 전체 10항목.

## 변경 사항
- `src/utils/projectResultEval.ts`
  - `RESULT_CRITERIA_GROUPS` 추가 — 계열 분할의 단일 진실 공급원(title + keys).
- `src/pages/CompetitionResultSummary.tsx`
  - 재사용 `RadarChart` 컴포넌트 추출(항목 부분집합을 받아 n각형 렌더). 기존 단일 인라인 SVG 로직을 이관.
  - 선택 팀 패널: 10축 레이더 1개 → 계열별 오각형 레이더 2개(반응형 2열 그리드).
  - 항목별 평균 막대도 계열 순서(`RESULT_CRITERIA_GROUPS` 순)에 맞춰 2열 그리드로 정렬.

## 검증
- `npm run build` (tsc -b + vite build) 통과.
- 항목 라벨/순서는 `RESULT_CRITERIA_GROUPS` 한 곳에서 관리되므로 향후 항목 조정 시 이 상수만 수정.
