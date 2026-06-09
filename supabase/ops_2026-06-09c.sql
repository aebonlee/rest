-- ============================================================
-- 2026-06-09 (c) 전유미 팀번호 고정 + 조윤서 출석명단 누락 점검/수정
--  · Supabase SQL Editor에서 실행 (postgres 권한 → RLS 우회)
--  · ①②는 먼저 '진단' SELECT로 현재값 확인 → 필요 시 UPDATE 실행.
-- ============================================================

-- ── ① 전유미 팀번호 고정 ───────────────────────────────
-- (진단) 전유미가 속한 팀의 현재 주제 확인
SELECT name, project_topic, jsonb_path_query_array(members,'$[*].name') AS members
FROM rest_teams WHERE members @> '[{"name":"전유미"}]';

-- (수정) 주제가 표준과 다르면 → '회복탄력성 루틴 코치 (2팀)'로 고정(보드 11번에 정확히 매칭).
--   ※ 위 진단에서 project_topic이 이미 정확히 '회복탄력성 루틴 코치 (2팀)'이면 실행 불필요.
UPDATE rest_teams
SET project_topic = '회복탄력성 루틴 코치 (2팀)'
WHERE members @> '[{"name":"전유미"}]'
  AND project_topic LIKE '%회복탄력%'
  AND project_topic <> '회복탄력성 루틴 코치 (2팀)';

-- ── ② 조윤서 출석명단 누락 ─────────────────────────────
-- 출석 관리는 user_profiles.signup_domain = 'rest.dreamitbiz.com' 인 사람만 명단에 넣는다.
-- (진단) 조윤서 프로필 상태 확인 (email: yunseo.ys.cho@gmail.com)
SELECT id, name, display_name, email, signup_domain, visited_sites
FROM user_profiles
WHERE lower(email) = 'yunseo.ys.cho@gmail.com' OR name = '조윤서' OR display_name = '조윤서';

-- (수정) 프로필은 있는데 signup_domain이 다르면 → rest로 고정(출석명단에 노출).
UPDATE user_profiles
SET signup_domain = 'rest.dreamitbiz.com'
WHERE lower(email) = 'yunseo.ys.cho@gmail.com'
  AND coalesce(signup_domain,'') <> 'rest.dreamitbiz.com';
--   ※ 위 진단에서 '조윤서' 프로필 자체가 0건이면 → 아직 미가입(로그인 이력 없음)이라
--     SQL로 출석명단에 넣을 수 없습니다. 본인이 rest 사이트로 1회 로그인(가입)해야 합니다.

-- 확인
-- SELECT name, email, signup_domain FROM user_profiles WHERE lower(email)='yunseo.ys.cho@gmail.com';
