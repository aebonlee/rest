-- ============================================================
-- 2026-06-09 (h) 문화재(2번) 삭제 + 취업자격증도우미(옛 24번)를 2팀으로 이동
--  · Supabase SQL Editor에서 실행 (postgres 권한 → RLS 우회)
--  · 코드(boardOrder/TEAM_PROJECTS)에서 2번 자리를 취업자격증도우미로 교체함 →
--    이 SQL은 라이브 팀 데이터(이름·잔여 문화재 팀)를 맞춘다. 패들렛은 2번=project02로 자동.
-- ============================================================

-- ① 문화재 팀이 남아 있으면 삭제 (게시글·체크리스트·제출은 FK CASCADE)
DELETE FROM rest_teams WHERE project_topic = '문화재 AI 해설 앱';

-- ② '취업자격증도우미' 팀 이름을 2팀으로 (번호는 코드에서 2로 매칭됨)
UPDATE rest_teams
SET name = '2팀'
WHERE regexp_replace(project_topic, '\s', '', 'g') = regexp_replace('✏️취업자격증도우미✏️', '\s', '', 'g')
  AND name <> '2팀';

-- 확인
-- SELECT name, project_topic FROM rest_teams WHERE project_topic LIKE '%취업자격증도우미%' OR project_topic = '문화재 AI 해설 앱';
