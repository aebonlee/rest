# 2026-06-05 — 팀 신청 중복 허용 + 학생 제안 프로젝트 3종(15·16·17) 등록·배포

## 배경
1. 팀 구성 단계에서 한 사람이 **하나의 팀에만** 속할 수 있어, 관심 주제가 여러 개거나
   학생이 직접 제안한 새 주제에 추가로 참여하려 해도 막혀 있었다 → **중복신청 허용** 요청.
2. 학생들이 직접 제안한 신규 주제 3종을 **「프로젝트 구현 예시」(팀 프로젝트 앱)**에 추가하고,
   각각 GitHub 저장소(project15~17)로 만들어 자동 배포 + 담당자 배정.

## 변경

### 1) 중복신청 허용 — `src/pages/ProjectVote.tsx`, `src/utils/projectTeams.ts`
- `handleCreateTeam`의 `if (myTeam) … return` 가드 제거 → 여러 주제로 팀 생성 가능.
- "이 주제로 팀 만들기" / "이 팀에 합류" 버튼의 `!myTeam` 조건 제거 → 이미 다른 팀에 속해도 신청 가능.
- 단일 `myTeam`(findMyTeam) → **`myTeams` 배열**로 교체, 상단 "내 팀"에 소속 팀을 모두 표시.
- 안내 문구: "투표는 1인 1표 · 팀 신청은 중복 허용".
- ※ `joinTeam`은 기존대로 동일 팀 중복 가입은 무시(멤버 1회), 정원(6명) 제한 유지.

### 2) 프로젝트 레지스트리 등록 — `src/data/teamProjects.ts`
`TEAM_PROJECTS`에 학생 제안 3종 추가(`note: '학생 제안'`):

| ID | 제목 | 담당(배정) | 비고 |
|----|------|-----------|------|
| 15 | 육묘(猫)일기 — 고양이 생애주기 앱 | 이유민 | 병원/모래/접종 주기 알람 + 체중·수치(BUN·CREA) 기록 |
| 16 | 마음 한 스푼 — 위로·격려 챗 앱 | 이초월 | 기분 선택 → 클릭 한 번 위로·격려, 문장 저장 |
| 17 | 청년 AI 리터러시 격차 진단·정책 수요 예측 | 최윤경 | 5영역 자가진단 → 집단 기준선 격차 → 정책 수요 예측 |

- 이유민·이초월은 기존 팀(8·3)에 더해 **중복 배정**(이번 허용 정책에 부합), 최윤경은 신규 합류.
- `AppGallery` 카피: "14개 팀" → "팀", 저장소 안내 "project01~14" → "project01~17".

### 3) 신규 저장소 생성·배포 (project15~17)
- 템플릿: 기존 project01 골격(Vite + React 18 + TS, 공통 `ui.tsx`/`lib/ai.ts`, Actions `deploy.yml`).
- 각 앱 `src/App.tsx`는 도메인에 맞는 실동작 기능으로 신규 구현(localStorage 저장, OpenAI 키는 선택).
- GitHub 저장소 생성 → main 푸시 → **Pages build_type=workflow** 전환 → Actions 빌드 성공 확인.
- 라이브:
  - https://aebonlee.github.io/project15/ (200)
  - https://aebonlee.github.io/project16/ (200)
  - https://aebonlee.github.io/project17/ (200)

## 검증
- `npm run build`(rest) 통과 — 타입체크 OK(미사용 `findMyTeam`/`myTeam` 정리).
- project15~17 각각 `tsc -b` + `vite build` 통과, 배포 후 HTTP 200.

## 배포
- rest: main 커밋·푸시 + `npm run deploy`(gh-pages).
