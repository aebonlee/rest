# 2026-06-02 — 팀장: 학생 지원 + 강사 최종 확정 흐름

## 변경 요약
기존: 팀구성(`/project-vote`)에서 **클릭한 학생이 즉시 팀장**.
변경: **학생은 팀장 "지원"(후보)만, 최종 확정은 강사**가 수행. 강사는 모든 팀을 관리.

## 역할 모델 (TeamMember.role)
- `팀장` — 강사가 확정한 최종 팀장(팀당 1명).
- `팀장후보` — 팀장에 지원한 학생(여러 명 가능).
- `팀원` — 일반 팀원.

## 구현
- **`src/utils/projectTeams.ts`** 함수 추가:
  - `volunteerLeader(team, userId, on)` — 본인 역할 `팀장후보` ↔ `팀원` 토글(확정 팀장은 변경 불가).
  - `confirmLeader(team, memberId)` — 강사: 지정 멤버를 `팀장`, 나머지 팀장/후보는 `팀원`.
  - `resetLeaders(team)` — 강사: 팀 내 팀장/후보를 모두 `팀원`으로 초기화.
- **`src/pages/ProjectVote.tsx`**:
  - 팀 생성 시 생성자 역할을 `팀장` → **`팀장후보`** 로 변경.
  - 팀원 본인: **'팀장 지원하기 / 지원 취소'** 토글.
  - 강사(isAdmin): 각 멤버 옆 **'팀장 확정'**, 팀별 **'팀장 초기화'** 버튼.
  - 역할 배지: ★ 팀장(확정) / 팀장 지원(후보).
  - 안내 문구를 "팀장 지원은 학생, 최종 확정은 강사" 로 갱신.

## 접근 권한
- `rest_teams` RLS: `rest_teams_update USING (auth.uid() IS NOT NULL)` — **강사(로그인)는 모든 팀을 수정 가능**(추가 RLS 불필요). SELECT도 전체 허용이라 강사가 모든 팀 조회·관리 가능.
- 강사는 팀 결성·합류에는 참여하지 않음(기존 정책 유지).

## 운영 — 기존 팀장 전체 초기화 (1회, Supabase SQL Editor)
```sql
UPDATE rest_teams
SET members = (
  SELECT COALESCE(jsonb_agg(
    CASE WHEN m->>'role' IN ('팀장','팀장후보')
         THEN jsonb_set(m, '{role}', '"팀원"')
         ELSE m END), '[]'::jsonb)
  FROM jsonb_array_elements(members) AS m
)
WHERE members IS NOT NULL AND members <> '[]'::jsonb;
```
이후 강사가 각 팀에서 '팀장 확정'으로 최종 선출.
