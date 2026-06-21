# 관리자 프로젝트 관리 — 팀별 평가자 점수 나열

날짜: 2026-06-21

## 배경
관리자 대시보드 "프로젝트 관리"(`/admin/projects`)는 등록된 포트폴리오 프로젝트 목록만
보여 줬다. 발표/심사 현장에서 **누가 어느 팀에 몇 점을 줬는지**를 한눈에 확인할 수단이 없어,
사전평가·결과평가의 평가자별 원점수를 팀 단위로 나열하는 표를 추가한다.

## 변경 사항 (최종: 메뉴 2개로 분리)
관리자 사이드바 "프로젝트" 단일 메뉴를 **두 개 메뉴**로 분리하고, 각 페이지에서 팀을 탭으로 선택한다.

- `src/pages/admin/AdminProjectEval.tsx` (신규) — `mode` prop을 받는 공용 집계표 컴포넌트.
  - `mode="pre"`    → **프로젝트 사전평가 집계표** (`/admin/projects/pre-eval`, 5항목/만점 100)
  - `mode="result"` → **프로젝트 결과평가 집계표** (`/admin/projects/result-eval`, 10항목/만점 100)
  - 상단 `1팀~23팀` 버튼 탭으로 팀 선택(평가 없는 팀은 흐리게). 선택 팀의 평가자별 점수 표 표시.
  - 표: 행=평가자, 열=항목별 점수+총점, 총점 내림차순 + 맨 아래 **평균 행**.
  - `MODE_META`에 제목·경로·항목·총점계산기·강조색을 모아 단일 렌더 경로로 처리.
- `src/components/AdminSidebar.tsx` — `프로젝트` 메뉴를 `사전평가 집계표`🗳️ / `결과평가 집계표`🏆 2개로 교체.
- `src/layouts/PublicLayout.tsx` — 라우트 2개 추가, 구 경로 `/admin/projects`는 사전평가로 호환 유지.
- `src/pages/admin/AdminDashboard.tsx` — 바로가기 카드도 사전/결과 2개로 분리.
- `src/pages/admin/AdminProjects.tsx` — 삭제(공용 컴포넌트로 대체).

## 데이터 출처
| 구분 | 테이블 | DAO | 항목 수 |
|------|--------|-----|---------|
| 사전평가 | `rest_project_evals` | `utils/projectEval` | 5 |
| 결과평가 | `rest_project_result_evals` | `utils/projectResultEval` | 10 |

- 평가 입력 화면과 동일한 DAO·상수(`EVAL_CRITERIA`/`RESULT_CRITERIA`, `totalOf`/`totalOfResult`)를
  재사용하므로 테이블명·항목 라벨·총점 계산이 항상 일치한다.
- 팀 메타(번호·제목·팀원)는 정적 `TEAM_PROJECTS`(팀 번호의 단일 진실 공급원).

## 검증
- `npx tsc --noEmit` 통과.
- `npm run build` 통과.
- 결과평가는 발표(2026-06-22) 평가가 입력되면 자동으로 채워진다.
