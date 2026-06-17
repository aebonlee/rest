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

---

## 2차 수정 (2026-06-18) — 개발 맥락으로 정렬 + 기본정보 간소화

### 배경
- snu(서울대 캡스톤·ESG)용 소속/지역/주제/트랙 입력이 rest(AI·바이브코딩 교육)에 불필요.
- koreatech의 "프로젝트활동"이 쓰는 **컴퓨팅 사고(CT) 7단계 개발 프로젝트**에 맞춰 단계 재정의.

### 변경
- `config/pblActivity.ts` — PBL_STAGES를 snu 6단계(ESG/캡스톤) → **CT 7단계 개발 프로젝트**로 교체.
  문제인식(15)·문제정의(10)·문제분해(10)·추상화(20)·알고리즘 설계(20)·구현(15)·결과 시연/발표(10) = 100.
  단계 key·배점이 `PblRubric.tsx`(이미 CT 7단계)와 정확히 일치하게 됨. `TRACKS` export 제거.
- `utils/promptEval.ts` — `PBL_STAGE_KEYWORDS`를 7단계 개발 키워드로 교체(구현 단계에 python/react/github 등).
- `pages/pbl/PblInfo.tsx` — **소속(대학·학과·전공)·트랙·관심 지역·관심 주제·수강명단 대조 섹션 전부 제거.**
  기본정보는 이름·학번·연락처·이메일만 입력.
- `pages/pbl/PblEval.tsx` — 강사 화면 학생 헤더에서 소속·트랙·명단·주제 표기 제거 → 학번·연락처·이메일만.
- `utils/pblStore.ts` — `PblInfo` 인터페이스에서 college/department/major/region/topic_key/track/roster_matched를 optional로.
- `data/pblTopics.ts`, `data/pblRoster.ts` — **삭제**(더 이상 참조 없음). DB 테이블의 해당 컬럼은 남겨두되 미사용.

---

## 3차 수정 (2026-06-18) — koreatech 프로젝트활동 콘텐츠 그대로 이식

### 배경
- 요구: koreatech `/assessment/project-recognition` 등 **프로젝트활동 워크시트의 실제 내용**을
  그대로 복제. 디자인 타입은 snu(사이드바+점수) 유지, 내용은 koreatech.
- 목적: 쉬었음 청년이 **각 단계에서 처리한 내역(작성 내용)**을 단계별로 확인.

### 변경
- `config/pblActivity.ts` — koreatech 7개 프로젝트 페이지(ProjectRecognition/Definition/Decomposition/
  Abstraction/Algorithm/Implementation/Presentation)의 워크시트 콘텐츠를 그대로 이식.
  - `PblField`에 koreatech `WorksheetStep`의 풍부한 안내 필드 추가: `no/icon/color/desc/guide[]/example`.
  - `PblStage`에 `intro{lead,points[]}`, `exampleProject` 추가.
  - 각 단계 = koreatech의 sub-step들(관찰·수집·선정·기술 등)을 fields로. 예시 프로젝트 “도서관 빈 좌석 도우미” 공통.
  - 단계 key·배점·색은 CT 7단계(루브릭)와 일치.
- `pages/pbl/PblStage.tsx` — koreatech식 **STEP 카드**(STEP n + 아이콘 + 제목 + 설명 + “✍️ 이렇게 작성하세요”
  가이드 + “💡 예시” 박스 + 작성란)로 렌더링. 단, snu 디자인 골격(좌측 PblSidebar + 단계 개요 + 루브릭 +
  자동평가 + 단계 저장 + 이전/다음 이동)은 유지. 상단에 작성 진행(n/총 단계) 표시 추가.
- `utils/promptEval.ts` — `PBL_STAGE_KEYWORDS`를 koreatech `STEP_KEYWORDS`(sub-step별)를 단계 단위로 병합해 교체.
- DB/저장 구조 변화 없음: `content[stageKey][fieldId]`에 각 sub-step 작성 내용이 그대로 저장되어
  강사 평가(`/pbl/eval`)에서 단계별·항목별 작성 내역을 모두 확인 가능.

> 참고: koreatech 발표 단계의 전공별 Padlet 보드는 koreatech 전용이라 제외하고,
> 발표 스크립트·시연/링크·회고 3개 작성 항목으로 재구성.
