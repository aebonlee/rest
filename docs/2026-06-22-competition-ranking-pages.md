# 경진대회 — 사전/결과평가 등수표 페이지 추가

날짜: 2026-06-22

## 배경
기존 집계표(`/competition/eval-summary`, `/competition/result-summary`)는 상단에 **TOP 10**과
선택 팀 상세(레이더·막대·피드백)만 보여 줘, 전체 팀의 순위를 한 화면에서 비교하기 어려웠다.
요청에 따라 **전체 팀 등수표(순위 테이블)** 전용 페이지를 사전·결과평가 각각 신설한다.

## 추가 페이지
| 경로 | 화면 | 대상 |
|------|------|------|
| `/competition/eval-ranking` | 프로젝트 사전평가 등수표 | 평가 1건 이상 모든 팀 |
| `/competition/result-ranking` | 프로젝트 결과평가 등수표 | 사전평가 상위 10팀 중 결과평가 보유 팀 |

표 컬럼: **순위 · 팀 · 프로젝트 · (항목별 평균…) · 총점평균 · 평가건수**
- 순위 = **총점 평균 기준 표준 경쟁 순위**(동점은 같은 순위, 다음은 건너뜀: 1,2,2,4…).
- 1·2·3위는 메달색 배지. 행 클릭 시 해당 집계표 상세로 이동.
- 항목 수가 많은 결과평가(10항목)는 표를 가로 스크롤 처리.

## 변경 사항
- `src/components/RankingTable.tsx` (신규)
  - 사전(5항목)·결과(10항목) 공용 순위 테이블. 데이터 모양을 일반화한 props(`rows`/`criteria`/`maxPerCriterion`/`maxTotal`)로 받아 중복 제거.
  - 표준 경쟁 순위 계산(`rankFor`) 내장.
- `src/pages/CompetitionEvalRanking.tsx` (신규)
  - `aggregateEvals` 재사용 → 총점 평균 내림차순 정렬 → `RankingTable` 렌더.
- `src/pages/CompetitionResultRanking.tsx` (신규)
  - 대상 10팀 = 사전평가 상위 10팀(집계표와 동일 기준), `aggregateResultEvals`로 집계.
- `src/layouts/PublicLayout.tsx`
  - 두 페이지 lazy import + `AuthGuard` 라우트 등록.
- `src/config/site.ts`
  - 경진대회 드롭다운에 사전/결과 그룹별 등수표 메뉴 추가.
- `src/utils/translations.ts`
  - `competitionEvalRanking` / `competitionResultRanking` 라벨(ko·en) 추가.
- `src/pages/CompetitionEvalSummary.tsx`, `CompetitionResultSummary.tsx`
  - TOP 10 카드 헤더에 "전체 등수표 보기 →" 링크 추가(집계표 ↔ 등수표 상호 연결).

## 검증
- `npm run build` (tsc -b + vite build) 통과.
- 신규 청크 생성 확인: `RankingTable`, `CompetitionEvalRanking`, `CompetitionResultRanking`.

## 메모
- 점수 로직은 기존 `utils/projectEval` · `utils/projectResultEval`를 그대로 재사용 → 입력/집계표/등수표 3곳의 순위 기준이 항상 일치.
