-- ============================================================
-- 2026-06-08 (c) 운영 데이터 — 6팀 주제 변경 + 투표 삭제
--  · Supabase SQL Editor에서 실행 (postgres 권한 → RLS 우회)
--  · 6팀 '청년지원정책 안내 챗봇 (2팀)' → 'AI 동화책 제작 앱 개발'로 주제/설명 변경.
--  · 구성원(박정우·한승우·이수현 팀장)은 그대로 유지(members 미변경).
--  · 이 주제에 대한 투표(박정우·한승우)는 삭제.
--  · 팀 번호 6은 정적 코드(TEAM_PROJECTS id6) 제목 변경으로 그대로 유지됨.
-- ============================================================

DO $$
DECLARE
  v_old_pat   text := '%청년지원정책 안내 챗봇 (2팀)%';  -- 변경 전 주제 식별 패턴
  v_new_title text := 'AI 동화책 제작 앱 개발';
  v_new_desc  text := '한국형 창작 그림 동화책을 AI로 생성하는 웹/앱 개발';
BEGIN
  -- (1) 이 주제(학생 제안)에 달린 투표 삭제
  --     커스텀 주제의 투표는 topic_key = rest_project_topics.id(UUID)로 연결된다.
  DELETE FROM rest_topic_votes
   WHERE topic_key IN (
     SELECT id::text FROM rest_project_topics WHERE title LIKE v_old_pat
   );

  -- (2) 학생 제안 주제(rest_project_topics) 제목/설명 변경
  UPDATE rest_project_topics
     SET title = v_new_title, description = v_new_desc
   WHERE title LIKE v_old_pat;

  -- (3) 매칭된 팀(rest_teams) 주제/설명 변경 — name('6팀')·members는 유지
  UPDATE rest_teams
     SET project_topic = v_new_title, description = v_new_desc
   WHERE project_topic LIKE v_old_pat;
END $$;

-- 확인
-- SELECT name, project_topic,
--        jsonb_path_query_array(members, '$[*].name') AS member_names
--   FROM rest_teams WHERE project_topic LIKE '%AI 동화책 제작 앱 개발%';
-- SELECT title, description FROM rest_project_topics WHERE title LIKE '%AI 동화책 제작 앱 개발%';
-- SELECT count(*) AS votes_left FROM rest_topic_votes
--   WHERE topic_key IN (SELECT id::text FROM rest_project_topics WHERE title LIKE '%AI 동화책 제작 앱 개발%');  -- 0이어야 정상
