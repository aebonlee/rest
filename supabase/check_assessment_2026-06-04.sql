-- ============================================================
-- 사전평가(선수평가) 기록 확인 — 한승우 / 이유민
-- 2026-06-04  /  Supabase SQL Editor 에서 실행 (RLS 우회)
-- ============================================================

-- [1] 두 사람의 가입 프로필 (계정·도메인·전화 확인)
--     signup_domain 이 rest.dreamitbiz.com 이 아니면 관리자 성적표에 안 보임.
--     이메일이 2개(중복가입)면 student_id 도 2개 → 기록이 다른 계정에 있을 수 있음.
SELECT id, email, name, display_name, phone, role, signup_domain, created_at
FROM   user_profiles
WHERE  name IN ('한승우', '이유민')
   OR  display_name IN ('한승우', '이유민')
ORDER  BY name, created_at;

-- [2] 두 사람의 실제 평가 기록 (저장된 것만 — diagnostic 은 저장 안 됨)
--     기록이 0건이면 → ① 게스트(비로그인) 상태로 제출했거나
--                      ② 진단평가(50문항)를 사전평가로 착각했거나
--                      ③ 다른 도메인 계정으로 응시.
SELECT a.student_name, a.student_email, a.type, a.score,
       a.correct, a.total, a.passed, a.submitted_at, a.student_id
FROM   rest_assessments a
WHERE  a.student_name IN ('한승우', '이유민')
ORDER  BY a.student_name, a.type;

-- [3] 프로필 id ↔ 평가기록 student_id 조인 (이름 불일치/계정 분리 추적)
--     기록의 student_id 가 프로필 id 와 매칭되는지, 어느 계정에 붙었는지 확인.
SELECT p.name        AS profile_name,
       p.email       AS profile_email,
       p.signup_domain,
       a.type, a.score, a.passed, a.submitted_at
FROM   user_profiles p
LEFT  JOIN rest_assessments a ON a.student_id = p.id
WHERE  p.name IN ('한승우', '이유민')
   OR  p.display_name IN ('한승우', '이유민')
ORDER  BY p.name, a.type;

-- [4] (참고) 사전평가 전체 응시 현황 — 누가 봤고 점수는 몇 점인지 한눈에
SELECT student_name, student_email, score, passed, submitted_at
FROM   rest_assessments
WHERE  type = 'prerequisite'
ORDER  BY submitted_at DESC;
