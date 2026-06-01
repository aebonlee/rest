-- ============================================================
-- 2026-06-01 운영 데이터 정리 (Supabase SQL Editor에서 실행)
--  · SQL Editor는 postgres 권한이라 RLS를 우회합니다.
-- ============================================================

-- 1) 전유미(dbal1107@gmail.com) 선수평가 성적 반영 — 55점(11/20), 합격(기준 40점)
--    시험 중 세션 끊김으로 저장되지 못한 응시 결과를 수동 반영.
INSERT INTO rest_assessments
  (student_id, student_name, student_email, type, score, correct, total, passed, answers, submitted_at)
VALUES
  ('aa0f1bff-8505-48a3-a60f-b90001c5d4a5', '전유미', 'dbal1107@gmail.com',
   'prerequisite', 55, 11, 20, true, '{}'::jsonb, now())
ON CONFLICT (student_id, type) DO UPDATE
  SET score = EXCLUDED.score,
      correct = EXCLUDED.correct,
      total = EXCLUDED.total,
      passed = EXCLUDED.passed,
      student_name = EXCLUDED.student_name,
      student_email = EXCLUDED.student_email,
      submitted_at = now();

-- 확인
-- SELECT student_name, type, score, passed, submitted_at FROM rest_assessments
--   WHERE student_email = 'dbal1107@gmail.com';


-- 2) 팀에 잘못 포함된 강사(이애본) 계정 제거 + 빈 팀 삭제
--    "팀 게시판 만들기"를 강사가 눌러 팀장으로 들어간 데이터를 정리.
--    (관리자 이메일을 가진 멤버를 모든 팀에서 제거)
UPDATE rest_teams
SET members = (
  SELECT COALESCE(jsonb_agg(m), '[]'::jsonb)
  FROM jsonb_array_elements(members) AS m
  WHERE m->>'email' NOT IN (
    'aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr'
  )
)
WHERE members @> '[{}]'::jsonb;  -- 멤버가 있는 팀만 대상

-- 멤버가 모두 빠진 팀 삭제 (팀 게시글은 ON DELETE CASCADE)
DELETE FROM rest_teams
WHERE members IS NULL OR members = '[]'::jsonb;

-- 확인
-- SELECT name, project_topic, members FROM rest_teams ORDER BY created_at;


-- 3) (선택) 백진주(a01094819953@gmail.com) — 관리자 페이지에서 RLS 보호 데이터까지 보이게 하려면
--    아래처럼 관리자 RLS 정책에 이메일을 추가하세요. 대시보드(카운트/명단)만 필요하면 생략 가능.
--    프론트엔드(ADMIN_EMAILS)에는 이미 추가되어 대시보드 접속은 가능합니다.
--
-- 예: 학습평가 성적 조회 권한 부여
-- DROP POLICY IF EXISTS "rest_assessments_select" ON rest_assessments;
-- CREATE POLICY "rest_assessments_select" ON rest_assessments FOR SELECT
--   USING (
--     auth.uid() = student_id
--     OR (auth.jwt() ->> 'email') IN (
--       'aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr',
--       'a01094819953@gmail.com'
--     )
--   );
