-- ============================================================
-- 2026-06-09 (j) '부모복지' 변형 중복 팀 → 표준(보드 3번)으로 통일 + 병합
--  · Supabase SQL Editor에서 실행 (postgres 권한 → RLS 우회)
--  · 두 팀(제목만 다름, 같은 프로젝트)이 둘 다 보드 미매칭 → 24번으로 중복되던 문제 해소.
--  · 표준 제목으로 통일 → 보드 3번. 멤버는 합치고(이름 기준 중복 제거) 한 팀만 남긴다.
-- ============================================================

-- ① 부모복지 변형 주제를 표준(boardOrder #3)으로 통일
UPDATE rest_teams
SET project_topic = '부모님의 복지 데이터를 실시간 분석하여 자녀에게 맞춤형 혜택과 리포트를 제공하는 자녀 전용 대리 케어 솔루션'
WHERE project_topic LIKE '부모님의 복지 데이터%';

-- ② 동일 주제 중복 팀 병합(멤버 합치고 한 팀만 유지)
DO $$
DECLARE
  v_topic   text := '부모님의 복지 데이터를 실시간 분석하여 자녀에게 맞춤형 혜택과 리포트를 제공하는 자녀 전용 대리 케어 솔루션';
  v_keeper  uuid;
  v_members jsonb;
BEGIN
  -- keeper: 완료 항목 많은 팀 우선 → 멤버 많은 → 먼저 만든 (진행률 보존)
  SELECT t.id INTO v_keeper
  FROM rest_teams t
  WHERE t.project_topic = v_topic
  ORDER BY (SELECT count(*) FROM rest_team_checklist c, jsonb_each(c.items) e
            WHERE c.team_id = t.id AND e.value = 'true'::jsonb) DESC,
           jsonb_array_length(coalesce(t.members, '[]'::jsonb)) DESC,
           t.created_at ASC
  LIMIT 1;

  -- 모든 팀의 멤버를 이름 기준 중복 제거하여 합치기('팀장' 역할 우선 보존)
  SELECT jsonb_agg(m) INTO v_members FROM (
    SELECT DISTINCT ON (m->>'name') m
    FROM rest_teams t, jsonb_array_elements(t.members) m
    WHERE t.project_topic = v_topic
    ORDER BY m->>'name', (m->>'role' = '팀장') DESC
  ) s;

  UPDATE rest_teams SET members = coalesce(v_members, '[]'::jsonb) WHERE id = v_keeper;
  DELETE FROM rest_teams WHERE project_topic = v_topic AND id <> v_keeper;
END $$;

-- 확인 (1건 + 3팀이어야 정상)
-- SELECT name, project_topic, jsonb_path_query_array(members,'$[*].name') AS members
--   FROM rest_teams WHERE project_topic LIKE '부모님의 복지 데이터%';
