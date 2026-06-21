# 개발 일지 — 2026-06-21 세션 마무리

작업자: DreamIT Biz / 운영자
대상: AI Reboot Academy LMS (`rest`, https://rest.dreamitbiz.com)
배포: main push → GitHub Actions 자동 배포 (전 작업 success)
맥락: 6월 1기 운영 중, 2026-06-22 프로젝트 발표·평가를 앞둔 사전 정비 세션.

## 오늘 작업 요약
관리자 평가 도구 개편 → 발표 준비용 팀 정보 수정 → 메인페이지 완성도 보강 순으로 진행했다.

### 1. 관리자 — 프로젝트 평가 점수 뷰어 신설 및 메뉴 분리
- 관리자 "프로젝트 관리"에 **팀별 평가자 점수 표**를 신설(사전·결과평가).
- 이후 단일 페이지(2탭) → **사이드바 메뉴 2개로 분리**:
  - 🗳️ 프로젝트 사전평가 집계표 (`/admin/projects/pre-eval`, 5항목/만점 100)
  - 🏆 프로젝트 결과평가 집계표 (`/admin/projects/result-eval`, 10항목/만점 100)
- 각 페이지: 상단 **1팀~23팀 선택 탭** → 선택 팀의 평가자별 점수 표(총점 내림차순 + 평균 행).
- 공용 컴포넌트 `AdminProjectEval`(`mode` prop), 입력 화면과 동일 DAO·상수 재사용.
- 관련 문서: `docs/2026-06-21-admin-projects-eval-by-evaluator.md`
- 커밋: `53996b2`, `0dcff3d`, `58487ae`

### 2. 팀 주제명·팀원 수정 (발표 전 각 팀 요청)
- **1팀(유용주)**: 설명 변경(아이 몰입·부모 육아고민 ai 그림동화).
- **7팀(김서우)**: 팀원 1인(김서우), 제목 "회복탄력성 루틴코치 - '오늘만큼'", 설명 보완.
- **11팀(전유미)**: 제목 "Lumiverse 목표 관리 코칭 앱", 설명 보완.
- 표시 SoT `TEAM_PROJECTS` 갱신 → 사전/결과평가·경진대회 페이지 반영.
- 관련 문서: `docs/2026-06-21-team-topic-updates.md`
- 커밋: `1a79834`
- 미반영(의도): 앱 갤러리/투표보드 카드 제목·팀원은 라이브 DB `project_topic` 기반 → 필요 시 SQL로 후속.

### 3. 메인 히어로 JS 효과 + 홈 디자인 완성형
- `HeroParticles`: canvas 파티클 네트워크 + 커서 스포트라이트(마우스 반응),
  dpr 상한·면적비례 입자수·`prefers-reduced-motion` 정지·언마운트 cleanup.
- `useScrollReveal`: IntersectionObserver 스크롤 등장 애니메이션(스태거).
- `home-polish.css`/`hero.css`: 카드 호버 상승·강조선, 섹션 제목 언더라인, 타이틀 그라데이션 흐름 등.
- 프로젝트 예시: `auto-fill` → **flex 4열**(마지막 줄 중앙 정렬), 예시 3개 추가해 **4×2(8개)** 완성.
- 관련 문서: `docs/2026-06-21-home-hero-js-effects-and-polish.md`
- 커밋: `0931f0c`, `9ebb542`, `3cad888`

## 검증
- 전 작업 `npx tsc --noEmit` + `npm run build` 통과.
- 각 push별 GitHub Actions 배포 success, 사이트 HTTP 200 확인.

## 발표(6/22) 전 운영 메모
- 결과평가 점수는 빈 상태 → 발표 평가 입력 시 결과평가 집계표에 자동 반영.
- 결과평가 초기화가 필요하면 Supabase SQL Editor에서 `delete from rest_project_result_evals;` 실행(되돌릴 수 없음).
- 갤러리/투표보드까지 새 팀명 반영을 원하면 DB `project_topic` 업데이트 후속 작업 필요.

— 세션 종료.
