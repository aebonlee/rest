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


-- 3) 백진주(a01094819953@gmail.com) — 학습평가 성적(/admin/grades) 조회 권한 부여
--    프론트엔드 ADMIN_EMAILS에는 이미 추가됨(대시보드 접속 가능). 성적 페이지는 RLS 보호
--    테이블 rest_assessments(성적) + user_profiles(명단)를 읽으므로 둘 다 권한 필요:
--      · rest_assessments → 아래 §3 실행 (rest 수강생 성적만 들어있어 사이트 한정과 일치)
--      · user_profiles    → RLS 미적용(현재 열림) 상태면 자동 OK / §4 적용 시엔 §4의
--                           'a01094819953 AND signup_domain=rest' 분기로 rest 명단 조회 가능
BEGIN;

-- 기존 SELECT 정책 제거 (이름이 달라도 동적으로)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='rest_assessments' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.rest_assessments', pol.policyname);
  END LOOP;
END $$;

-- 본인 + 운영자 + 백진주(rest 한정 관리자) 조회 가능
CREATE POLICY "rest_assessments_select" ON public.rest_assessments FOR SELECT
  USING (
    auth.uid() = student_id
    OR (auth.jwt() ->> 'email') IN (
      'aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr',
      'a01094819953@gmail.com'
    )
  );

COMMIT;

-- 검증: SELECT 정책이 1개로 정리됐는지
-- SELECT policyname, qual FROM pg_policies
--   WHERE schemaname='public' AND tablename='rest_assessments' AND cmd='SELECT';


-- ============================================================
-- 4) user_profiles SELECT RLS 축소 — PII(이름·이메일·전화) 노출 차단
-- ============================================================
-- 배경: 현재 user_profiles SELECT가 전면 개방되어 공개 번들의 anon 키로
--       전체 가입자(600+명) PII를 누구나 조회 가능. 이를 "본인 + 운영자"로 제한.
--
-- ⚠️ user_profiles는 rest·joongang·openclaw·coding·DevLab 공유 테이블.
--    각 사이트 로컬 코드 점검 결과: 일반 사용자는 본인 프로필만 조회(.eq('id', 본인)),
--    타인 프로필 조회는 관리자 페이지(운영자 aebon 계정)에서만 발생 → 본 정책으로 안전.
--    (혹시 모를 회귀 대비 맨 아래 롤백 SQL 포함)

-- (4-0) 먼저 현재 정책 확인 — 실행 후 결과를 보고 진행 권장
-- SELECT policyname, cmd, qual FROM pg_policies
--   WHERE schemaname='public' AND tablename='user_profiles' ORDER BY cmd;

BEGIN;

-- (4-1) 관리자 판별 함수 (SECURITY DEFINER → RLS 우회로 재귀 방지)
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'superadmin')
  );
$$;

-- (4-2) 기존 SELECT 정책 전부 제거 (이름을 몰라도 동적으로 드롭)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='user_profiles' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.user_profiles', pol.policyname);
  END LOOP;
END $$;

-- (4-3) 본인 + 운영자(전체) + 사이트한정 관리자(해당 사이트 가입자만) 조회 가능
CREATE POLICY "user_profiles_select_self_or_admin" ON public.user_profiles
  FOR SELECT
  USING (
    -- 본인 프로필
    auth.uid() = id
    -- 전체 운영자: role admin/superadmin 또는 글로벌 운영자 이메일 → 모든 사이트 조회
    OR public.is_platform_admin()
    OR (auth.jwt() ->> 'email') IN (
      'aebon@kakao.com', 'radical8566@gmail.com',
      'aebon@kyonggi.ac.kr', 'aebonlee@gmail.com'
    )
    -- 사이트 한정 관리자: 자기 사이트 가입자(signup_domain)만. (백진주 = rest 전용)
    OR (
      (auth.jwt() ->> 'email') = 'a01094819953@gmail.com'
      AND signup_domain = 'rest.dreamitbiz.com'
    )
  );

COMMIT;

-- (4-4) 검증: anon(비로그인)으로 조회 시 0건이어야 정상
--   (Supabase SQL Editor는 service_role이라 RLS 우회 → 아래는 PostgREST anon 키로 확인)
--   curl '.../rest/v1/user_profiles?select=id&limit=1' -H "apikey: <anon>"  ==> []

-- ── 폴백 A (권장): 점검 못한 사이트가 깨지면 "로그인 사용자만"으로 완화 ──
--    (공개 anon 노출은 계속 차단되면서, 로그인 사용자 간 조회는 허용)
-- BEGIN;
-- DROP POLICY IF EXISTS "user_profiles_select_self_or_admin" ON public.user_profiles;
-- CREATE POLICY "user_profiles_select_authed" ON public.user_profiles
--   FOR SELECT USING (auth.uid() IS NOT NULL);
-- COMMIT;

-- ── 폴백 B (최후): 완전 원복(전면 개방, PII 노출 상태로 복귀) ──
-- BEGIN;
-- DROP POLICY IF EXISTS "user_profiles_select_self_or_admin" ON public.user_profiles;
-- DROP POLICY IF EXISTS "user_profiles_select_authed" ON public.user_profiles;
-- CREATE POLICY "user_profiles_select_all" ON public.user_profiles FOR SELECT USING (true);
-- COMMIT;
