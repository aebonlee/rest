# 2026-06-08 — 팀별 수행 점검·할 일 + "프로젝트" 메뉴 재편

## 배경
"프로젝트" 상단 메뉴를 팀 활동 흐름으로 재편하고, **팀별 진행 체크리스트**(수행 점검·할 일)를 신설.
- 메뉴 구성: 라이프사이클 순서 + "팀 활동" 구분선
- 기능 범위: B안 — 팀별 진행 체크리스트(진행률 %, 강사 모니터링), Supabase 저장

## 메뉴 재편 (프로젝트 ▾)
```
프로젝트 안내            /project-guide
── 팀 활동 ──(구분선)
프로젝트 팀구성          /project-vote
수행 점검 · 할 일 ★신설  /project-checklist
프로젝트 관리(게시판)    /project-board
프로젝트 구현 예시(갤러리) /projects/apps
```

## 변경/신규

### 신규
- `src/data/projectChecklist.ts` — 표준 마일스톤 10개(기획·개발·배포공유·발표 4단계), 진행률 계산.
- `src/utils/projectChecklist.ts` — DAO(`rest_team_checklist`): `listChecklists`, `setChecklistItem`(upsert).
- `src/pages/ProjectChecklist.tsx` — 학생=내 팀 체크/진행률, 강사=전체 팀 진행 모니터링(진행률순).
- `supabase/2026-06-08-team-checklist.sql` — 테이블+트리거+RLS(조회 전체, 쓰기 팀원만).

### 수정
- `src/types/index.ts` — `SubMenuItem`에 `divider?`, `path?` 선택화(구분선 지원).
- `src/components/layout/Navbar.tsx` — 드롭다운에서 divider를 클릭 불가 섹션 라벨로 렌더.
- `src/config/site.ts` — 프로젝트 드롭다운에 '팀 활동' 구분선 + `/project-checklist` 추가(라이프사이클 순서).
- `src/utils/translations.ts` — `teamActivities`, `projectChecklist` (ko/en).
- `src/layouts/PublicLayout.tsx` — `/project-checklist` 라우트(AuthGuard) + lazy import.

## 데이터 모델
`rest_team_checklist(team_id PK→rest_teams, items jsonb, updated_at)` — 팀당 한 행, items = { itemKey: true }.
RLS: SELECT=로그인 전체(강사 모니터링), INSERT/UPDATE=해당 팀원만(members JSONB에 본인 id).

## 적용 필요
⚠️ **Supabase SQL Editor에서 `supabase/2026-06-08-team-checklist.sql` 실행** 후 동작(테이블 없으면 빈 상태로 graceful).

## 검증
- `npm run build`(tsc + vite) 통과.
