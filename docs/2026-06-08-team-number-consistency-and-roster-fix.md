# 2026-06-08 — 팀 번호 일관화(패들렛=팀번호 고정) + 3팀 명단 정리

## 배경
운영 중 라이브 보드(팀구성·주제 투표)에서 두 가지 요청:
1. **김건희** 님이 패들렛(3팀, 회복탄력성 루틴 코치)에서 빠지기로 하여 팀원에서 제외.
2. **나이대별 한국사 학습·시험 앱** 학생 제안 주제(패들렛) 삭제.
3. 카드에 표시되는 **"N팀" 번호와 패들렛 번호가 득표 순위(idx+1)** 로 매겨져 투표수에 따라
   계속 바뀌는 문제 → **주제별 고정 팀 번호**로 일관되게 관리되도록 변경.

## 근본 원인
번호 체계가 3중으로 혼재:
- 화면 "N팀" + 패들렛 = `idx+1` (득표순, 가변) ← 문제
- `PRESET_TOPICS` = `p1`~`p7`
- `TEAM_PROJECTS`(id 1~14 정식팀 + 15~17 학생제안) = DB 팀명 'N팀' · 패들렛 project01~17과 1:1

→ `TEAM_PROJECTS.id`를 **팀 번호의 단일 진실 공급원**으로 채택.

## 변경 (리포 코드)

### `src/data/teamProjects.ts`
- 3팀(`id:3` 회복탄력성 루틴 코치) `members`에서 `'김건희'` 제거 → `['이초월', '김서우']`.
- `getTeamNoByTitle(title)` 추가 — 제목(정규화 비교) → 고정 팀 번호(id) 조회.
- `MAX_TEAM_NO` 추가 — 등록된 최대 번호(현재 17). 미등록 새 주제 번호 시작 기준점.

### `src/config/teamRoster.ts`
- `CONFIRMED_TEAMS` 3팀 `members`에서 `'김건희'` 제거(향후 재편성/시드 일관성).

### `src/pages/ProjectVote.tsx`
- `getTeamNoByTitle`/`MAX_TEAM_NO` import.
- `rowExtraNo`(useMemo): 미등록 학생 주제에 생성 순서 기반 안정 번호(18+) 부여.
- `teamNoForRow(r)`: 고정 번호 → (없으면) 임시 번호 순으로 결정.
- 카드 번호 배지와 패들렛 링크/타이틀을 `idx+1` → `teamNoForRow(r)`로 교체.
- 정렬은 기존대로 **득표순 유지**(번호만 고정). 예) 3팀 → project03, 8팀 → project08.

## 변경 (라이브 DB — 수동 실행 필요)
`supabase/ops_2026-06-08.sql` (Supabase SQL Editor, postgres 권한 → RLS 우회):
- `rest_teams` 회복탄력성(3팀) `members` JSONB에서 `김건희` 제거.
- `rest_project_topics` "나이대별 한국사…" 주제 삭제 + 연결된 `rest_topic_votes` 정리.
> 리포 코드 수정만으로는 이미 DB에 들어간 라이브 데이터가 바뀌지 않으므로 위 SQL을 직접 실행해야 함.

## 검증
- `npm run build`(tsc + vite) 통과(기존 청크 크기 경고만).
