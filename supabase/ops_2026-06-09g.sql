-- ============================================================
-- 2026-06-09 (g) 이유민을 '문화재 AI 해설 앱'(2번) 팀에서 제외
--  · Supabase SQL Editor에서 실행 (postgres 권한 → RLS 우회)
--  · 다른 팀·번호는 영향 없음.
-- ============================================================

-- ① 이유민이 유일한 팀원이면(1명) 팀 자체 삭제 (게시글·체크리스트·제출은 FK CASCADE)
DELETE FROM rest_teams
WHERE project_topic = '문화재 AI 해설 앱'
  AND members @> '[{"name":"이유민"}]'
  AND jsonb_array_length(members) = 1;

-- ② 다른 팀원이 더 있으면 이유민만 제외
UPDATE rest_teams
SET members = (SELECT jsonb_agg(m) FROM jsonb_array_elements(members) m WHERE m->>'name' <> '이유민')
WHERE project_topic = '문화재 AI 해설 앱'
  AND members @> '[{"name":"이유민"}]';

-- 확인
-- SELECT name, project_topic, jsonb_path_query_array(members,'$[*].name') AS members
--   FROM rest_teams WHERE project_topic = '문화재 AI 해설 앱';
