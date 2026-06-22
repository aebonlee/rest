# 등수표 — 관리자 화면 임베드 + 주제 줄바꿈 + 팀원 표기

날짜: 2026-06-22

## 요청
1. 등수표를 **관리자 대시보드 안에서도**(사이드바 유지) 볼 수 있게.
2. **주제(프로젝트명)** 가 잘리지 않고 **줄바꿈으로 전부** 보이게.
3. 관리자 화면에서는 등수와 함께 **팀 주제 + 팀원**을 같이 기재.

## 변경 사항
- `src/pages/CompetitionEvalRanking.tsx`, `CompetitionResultRanking.tsx`
  - `admin?: boolean` prop 추가. `admin`이면 공개 레이아웃(page-header/section) 대신
    관리자 레이아웃(`admin-layout` + `<AdminSidebar />` + `admin-content`)으로 렌더.
  - 본문(요약줄·표·안내)을 `body`로 추출해 공개/관리자 분기에서 공용 사용.
  - 링크 경로를 모드별로 분기(관리자 → `/admin/projects/...`, 공개 → `/competition/...`).
  - 행 데이터(`project`)에 `members` 포함, 관리자일 때 `showMembers` 전달.
- `src/components/RankingTable.tsx`
  - 주제(프로젝트명) 셀: `whiteSpace: normal` + `wordBreak: keep-all`로 **줄바꿈 전체 표시**(말줄임 제거). 모든 셀 상단 정렬.
  - `showMembers` prop: 관리자 화면에서 **팀원** 컬럼 추가(헤더 라벨도 '프로젝트' → '주제').
  - `RankingRow.project.members?: string[]` 추가, 표 최소폭 계산을 컬럼 구성에 맞게 조정.
- `src/layouts/PublicLayout.tsx`
  - 관리자 라우트 추가: `/admin/projects/pre-ranking`(EvalRanking admin), `/admin/projects/result-ranking`(ResultRanking admin) — 모두 `AdminGuard`.
- `src/components/AdminSidebar.tsx`
  - 등수표 메뉴 경로를 공개 경로 → 관리자 경로(`/admin/projects/...-ranking`)로 변경 → 클릭해도 사이드바 유지.

## 결과
- 관리자: 좌측 메뉴 '사전/결과평가 등수표' 클릭 시 사이드바 유지된 채 순위표 + **주제·팀원** 표시.
- 공개 경진대회 페이지(`/competition/...-ranking`)는 그대로 유지(팀원 미표시, 주제는 줄바꿈 표시).

## 검증
- `npm run build` (tsc -b + vite build) 통과.
