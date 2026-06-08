# 2026-06-09 — "프로젝트" 메뉴 확장(참고·예시 / 팀 활동 8단계)

## 최종 메뉴 (프로젝트 ▾)
```
프로젝트 아이디어 예시        /project-guide
프로젝트 구현 예시            /projects/apps
──  팀 활동  ──(구분선)
프로젝트 팀구성              /project-vote
프로젝트 일정 · 마일스톤      /project-schedule   ★신설
수행 점검 · 할 일            /project-checklist
평가 기준 · 루브릭           /project-rubric     ★신설
프로젝트 관리(게시판)         /project-board
팀별 패들렛                  /project-padlets    ★신설
산출물 제출                  /project-submit     ★신설
프로젝트 결과               /project-results    ★신설
```

## 신설 페이지
- **팀별 패들렛**: TEAM_PROJECTS 21팀 패들렛(project01~21) 링크 모음(정적).
- **일정·마일스톤**: `data/projectSchedule.ts` 주차별 4단계 마일스톤(정적).
- **평가 루브릭**: `data/projectRubric.ts` 5항목 100점(정적).
- **산출물 제출**: 팀원이 데모/발표자료/소스/요약 입력·저장. `rest_team_submission`.
- **프로젝트 결과(허브)**: 팀별 배포앱+패들렛+진행률(체크리스트)+제출물 종합 표시.

## DB
- `rest_team_submission(team_id PK, data jsonb{summary,demo_url,slides_url,repo_url}, updated_at)` — RLS: 조회 전체, 쓰기 팀원만.
- 결과 허브는 `rest_team_checklist`(진행률) + `rest_team_submission`(링크) + TEAM_PROJECTS(번호→앱/패들렛) 조합.

## 적용 필요
⚠️ Supabase SQL Editor에서 **`supabase/2026-06-09-team-submission.sql`** 실행(산출물 테이블).
(체크리스트 테이블 `2026-06-08-team-checklist.sql`은 이미 실행 완료)

## 검증
- `npm run build`(tsc + vite) 통과.
- 2단계 커밋: 정적 3종(31875c7) + DB 2종(이번).
