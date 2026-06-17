# 개인별 PBL활동 이식 (snu → rest)

날짜: 2026-06-18

## 목적
snu 프로젝트의 "개인별PBL활동" 기능을 rest에 그대로 복제하고, 상단 메뉴에 **PBL활동** 메뉴를 추가한다.
개인별 작성 내용은 자동 채점되어 Supabase에 저장되며, 관리자는 개인별 점수·피드백을 조회/입력할 수 있다.

## 추가/변경 파일

### 새로 이식한 PBL 기능 파일 (snu에서 복제)
- `src/config/pblActivity.ts` — PBL 6단계 정의(배점 합 100점) + `TRACKS`(기술/인문) 추가
- `src/utils/pblStore.ts` — Supabase 저장/조회 (`${site.dbPrefix}pbl_submissions` → `rest_pbl_submissions`)
- `src/utils/promptEval.ts` — 휴리스틱 자동 채점(분량·구체성·구조화·키워드 → 0~100)
- `src/data/pblTopics.ts` — snu `projectTopics.ts` 복제(REGIONS/topicsByRegion/getTopic). rest 기존 `projectTopics.ts`와 충돌 방지 위해 별도 파일로 둠.
- `src/data/pblRoster.ts` — snu `rosterData.ts` 복제(COLLEGES/departmentsOf/majorsOf/matchRoster/COURSE_TITLE). 동일 이유로 별도 파일.
- `src/pages/pbl/PblInfo.tsx` — 기본정보 입력 + 내 점수 요약(개인별)
- `src/pages/pbl/PblStage.tsx` — 단계별 워크시트 작성 + 실시간 자동 채점·저장
- `src/pages/pbl/PblEval.tsx` — 강사(관리자) 평가: 개인별 단계 점수·피드백 입력
- `src/pages/pbl/PblRubric.tsx` — 평가 루브릭(컴퓨팅 사고 7단계)
- `src/pages/pbl/PblSidebar.tsx` — PBL 좌측 사이드바

> rest의 데이터 파일(projectTopics/rosterData)은 snu와 export가 완전히 달라서, PBL 전용 데이터는
> `pblTopics.ts`/`pblRoster.ts`로 분리해 기존 rest 페이지에 영향이 없게 했다. PBL 페이지의 import만 이쪽을 가리킨다.

### 라우팅 (`src/layouts/PublicLayout.tsx`)
- `PblInfo/PblStage/PblEval/PblRubric` lazy import 추가
- 라우트 추가 (구체적 경로 먼저, 단계 와일드카드 마지막):
  - `/pbl` → `/pbl/info` 리다이렉트
  - `/pbl/info` (AuthGuard)
  - `/pbl/rubric` (공개)
  - `/pbl/eval` (AdminGuard)
  - `/pbl/:stage` (AuthGuard)

### 상단 메뉴 "PBL활동"
- `src/types/index.ts` — `MenuItem`에 `className?` 추가(특정 메뉴만 별도 스타일링용)
- `src/components/layout/Navbar.tsx` — 단일 링크에 `item.className` 적용
- `src/config/site.ts` — `{ path: '/pbl', activePath: '/pbl', labelKey: 'site.nav.pbl', className: 'nav-link-pbl' }`
- `src/utils/translations.ts` — `site.nav.pbl` = `'PBL활동'` (ko) / `'PBL Activity'` (en)
- `src/styles/site.css` — `.nav-link-pbl` 자간(letter-spacing 0.04em) + 마진(0 2px)·패딩(8px 12px)·라운드/호버 조정, 그리고 snu에서 누락됐던 `.pbl-score-row/.pbl-score-label/.pbl-score-bar` 점수 막대 스타일 이식

### DB (Supabase)
- `supabase/2026-06-18-pbl-submissions.sql` — `rest_pbl_submissions` 테이블 + RLS
  - 본인은 자기 행만, 관리자(aebon@kakao.com / radical8566@gmail.com / aebon@kyonggi.ac.kr)는 전체 조회·수정
  - **이 SQL은 Supabase SQL Editor에서 1회 실행해야 한다.** (공유 단일 프로젝트 hcmgdztsgjvzcyxyayaj)

## 데이터 구조 (개인별 점수)
`rest_pbl_submissions` (user당 1행):
- `content` jsonb: `{ [stageKey]: { [fieldId]: string } }` — 학생 작성
- `auto` jsonb: `{ [stageKey]: 0~100 }` — 자동 채점(본인)
- `scores` jsonb: `{ [stageKey]: number }` — 강사 평가
- `feedback` jsonb: `{ [stageKey]: string }` — 강사 피드백

## 검증
- `npm run typecheck` ✓ (tsc -b, 에러 없음)
- `npm run build` ✓ (PblInfo/PblStage/PblEval/PblRubric/PblSidebar/pblStore/pblTopics 청크 생성 확인)

## 남은 작업(운영)
1. Supabase SQL Editor에서 `supabase/2026-06-18-pbl-submissions.sql` 실행
2. PBL 기본정보의 소속/지역/주제 선택지는 snu(서울대 캡스톤) 데이터를 그대로 가져온 상태 →
   rest(AI Reboot Academy) 운영 맥락에 맞게 `pblRoster.ts`/`pblTopics.ts` 내용 교체 검토
