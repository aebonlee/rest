# 결과평가 대상 보정 — 차순위(6팀) 추가

날짜: 2026-06-22

## 배경
결과평가 대상은 '사전평가 상위 10팀'을 라이브 점수로 자동 산정한다. 그런데 한 학생(최윤정)이
사전평가 **9·10·11위를 모두 차지**해, 한 사람이 결과발표 슬롯을 다수 점유하는 상황이 됐다.
기존 상위 10팀을 **빼지 않고**(사전평가 등수 표시도 그대로), 차순위 팀을 결과발표 대상에
**추가**해서 운영하기로 했다.

- 차순위 = 사전평가 **12위 = 6팀(AI 자기소개서·면접 코치)**.

## 구현 — 대상 선정 로직 일원화 + 보정 설정
중복돼 있던 '상위 10팀' 산정 로직을 한 곳으로 모으고, 팀 번호 기반 보정값을 추가했다.

- `src/utils/projectResultEval.ts`
  - `RESULT_TARGET_OVERRIDE = { include: [6], exclude: [] }` 신설.
    - `include`: 상위 10 밖이라도 대상에 **추가**(기존 팀 밀어내지 않음).
    - `exclude`: 대상에서 제거(현재 미사용).
  - `selectResultTargets(preAgg, projects, size=10)` 신설:
    상위 size팀 **∪** include − exclude, 사전평가 순위 순서로 반환. (size+추가 수만큼 반환 가능)
- 대상 산정을 쓰던 3개 화면을 모두 이 함수로 교체(동일 기준 보장):
  - `src/pages/CompetitionResultEval.tsx` (결과평가 입력 — 누가 평가 대상인지)
  - `src/pages/CompetitionResultSummary.tsx` (결과평가 집계표)
  - `src/pages/CompetitionResultRanking.tsx` (결과평가 등수표)

## 효과
- 결과평가 대상 = 사전평가 상위 10팀 + **6팀** (총 11팀). 최윤정 팀(9·10·11위)은 유지.
- 사전평가 등수표/집계표의 순위 표시는 변동 없음.
- 운영 중 추가/변경은 `RESULT_TARGET_OVERRIDE` 한 곳만 수정하면 세 화면에 동시 반영.

## 검증
- `npm run build` (tsc -b + vite build) 통과.

## 메모
- 라이브 사전평가 점수(`rest_project_evals`)는 RLS가 `select to authenticated`라 익명 조회 불가 →
  순위 확인은 로그인 후 등수표 화면에서. 팀 번호(6팀=12위)는 운영자 확인값.
