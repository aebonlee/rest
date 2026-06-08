-- ============================================================
-- 2026-06-08 (b) 운영 데이터 — 이초월을 "위로·격려 챗 앱" 팀의 팀장으로 지정
--  · Supabase SQL Editor에서 실행 (postgres 권한 → RLS 우회)
--  · 학생 제안 주제(rest_project_topics)에 대해, 팀이 없으면 생성하며 이초월을 팀장으로,
--    이미 팀이 있으면 이초월을 팀장으로 승격(기존 팀장/후보는 팀원으로 강등)한다.
--  · 주제 제목은 rest_project_topics에서 직접 읽어와 팀의 project_topic과 1:1로 맞춘다
--    (앱은 project_topic == 주제 제목으로 팀을 매칭하므로 정확히 일치해야 함).
-- ============================================================

DO $$
DECLARE
  v_topic_pat text := '%위로·격려 챗%';   -- 이 학생 제안 주제를 식별하는 고유 패턴
  v_email     text := 'healmeanliv@gmail.com';  -- 이초월
  v_name      text := '이초월';
  v_title     text;
  v_uid       text;
  v_uemail    text;
  v_team_id   uuid;
  v_members   jsonb;
BEGIN
  -- (1) 학생 제안 주제의 정확한 제목 확보
  SELECT title INTO v_title
    FROM rest_project_topics
   WHERE title LIKE v_topic_pat
   ORDER BY created_at
   LIMIT 1;
  IF v_title IS NULL THEN
    RAISE EXCEPTION '해당 학생 제안 주제를 찾을 수 없습니다 (pattern: %)', v_topic_pat;
  END IF;

  -- (2) 이초월 프로필(user_id) 확보
  SELECT id::text, email INTO v_uid, v_uemail
    FROM user_profiles
   WHERE lower(email) = lower(v_email)
   LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '이초월 프로필을 찾을 수 없습니다 (email: %)', v_email;
  END IF;

  -- (3) 이 주제로 만들어진 팀이 있는지 확인
  SELECT id, members INTO v_team_id, v_members
    FROM rest_teams
   WHERE project_topic = v_title
   LIMIT 1;

  IF v_team_id IS NULL THEN
    -- (3-a) 팀 없음 → 이초월을 팀장으로 새 팀 생성
    INSERT INTO rest_teams (name, project_topic, description, members)
    VALUES (
      v_title, v_title, '',
      jsonb_build_array(jsonb_build_object('id', v_uid, 'name', v_name, 'email', v_uemail, 'role', '팀장'))
    );
    RAISE NOTICE '새 팀 생성: % (팀장 이초월)', v_title;
  ELSE
    -- (3-b) 팀 있음 → 기존 팀장/후보는 팀원으로 강등하고 이초월을 팀장으로
    SELECT jsonb_agg(
      CASE
        WHEN m->>'id' = v_uid THEN jsonb_set(m, '{role}', '"팀장"')
        WHEN m->>'role' IN ('팀장','팀장후보') THEN jsonb_set(m, '{role}', '"팀원"')
        ELSE m
      END
    ) INTO v_members
    FROM jsonb_array_elements(COALESCE(v_members, '[]'::jsonb)) m;

    -- 이초월이 아직 멤버가 아니면 팀장으로 추가
    IF v_members IS NULL OR NOT (v_members @> jsonb_build_array(jsonb_build_object('id', v_uid))) THEN
      v_members := COALESCE(v_members, '[]'::jsonb)
        || jsonb_build_array(jsonb_build_object('id', v_uid, 'name', v_name, 'email', v_uemail, 'role', '팀장'));
    END IF;

    UPDATE rest_teams SET members = v_members WHERE id = v_team_id;
    RAISE NOTICE '기존 팀 갱신: % (팀장 이초월)', v_title;
  END IF;
END $$;

-- 확인
-- SELECT name, project_topic,
--        jsonb_path_query_array(members, '$[*] ? (@.role == "팀장").name') AS leaders,
--        jsonb_path_query_array(members, '$[*].name') AS member_names
--   FROM rest_teams WHERE project_topic LIKE '%위로·격려 챗%';
