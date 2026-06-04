-- ============================================================
-- 닉네임 → 실명 원본 교정 (2026-06-04) / Supabase SQL Editor 1회 실행
-- 이유민: 자동 닉네임 '행복한흰이마기러기' 로 저장된 프로필·성적 이름을 실명으로 고정.
-- (코드 동일인 별칭으로 화면에는 이미 '이유민' 표기되지만, DB 원본까지 통일)
-- ============================================================

-- 1) 프로필 이름 교정
UPDATE user_profiles
SET name = '이유민', display_name = '이유민'
WHERE email = 'yoominggg2164@gmail.com';

-- 2) 평가 기록의 저장 이름 교정
UPDATE rest_assessments
SET student_name = '이유민'
WHERE student_email = 'yoominggg2164@gmail.com';

-- 3) 윤혜수: jkl459@naver.com 계정으로 응시했으나 평가기록에 이름이 이메일로 저장됨 → 실명 교정
--    (프로필 이름은 이미 '윤혜수' 이므로 평가기록만 보정)
UPDATE rest_assessments
SET student_name = '윤혜수'
WHERE student_email = 'jkl459@naver.com';
