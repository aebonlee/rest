-- ============================================================
-- 2026-06-08 운영 데이터 정리 (Supabase SQL Editor에서 실행)
--  · SQL Editor는 postgres 권한이라 RLS를 우회합니다.
--  · 라이브 보드(rest.dreamitbiz.com 팀구성·주제투표)의 DB 데이터를 직접 수정합니다.
--    (리포 코드 수정으로는 이미 DB에 들어간 데이터가 바뀌지 않으므로 아래 SQL이 필요)
-- ============================================================

-- 1) 회복탄력성 루틴 코치(3팀) 팀원에서 '김건희' 제외
--    패들렛에서 김건희님이 빠지기로 하여 rest_teams.members(JSONB 배열)에서 제거.
--    members 배열을 통째로 다시 만들어( name='김건희' 제외 ) 덮어쓴다.
UPDATE rest_teams
SET members = COALESCE(
  (SELECT jsonb_agg(m)
     FROM jsonb_array_elements(members) AS m
    WHERE m->>'name' <> '김건희'),
  '[]'::jsonb
)
WHERE project_topic LIKE '회복탄력성 루틴 코치%'
  AND members @> '[{"name":"김건희"}]';

-- 확인
-- SELECT name, project_topic,
--        jsonb_path_query_array(members, '$[*].name') AS member_names
--   FROM rest_teams WHERE project_topic LIKE '회복탄력성 루틴 코치%';


-- 2) "나이대별 한국사 학습·시험 앱" 학생 추가 주제(패들렛) 삭제
--    학생 제안(rest_project_topics)으로 추가된 주제를 제거한다.
--    연결된 투표(rest_topic_votes)는 topic_key가 이 주제의 id(UUID)이므로 함께 정리.
--    ※ 프리셋 주제(p1~p7)는 rest_project_topics에 없으므로 영향 없음.
DELETE FROM rest_topic_votes
WHERE topic_key IN (
  SELECT id::text FROM rest_project_topics WHERE title LIKE '나이대별 한국사%'
);

DELETE FROM rest_project_topics
WHERE title LIKE '나이대별 한국사%';

-- 확인
-- SELECT id, title FROM rest_project_topics WHERE title LIKE '나이대별 한국사%';  -- 0건이어야 정상
