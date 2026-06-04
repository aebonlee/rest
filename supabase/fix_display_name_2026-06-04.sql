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

-- (선택) 최재영 2번째 계정(jkl459)도 실명으로 통일하려면:
-- UPDATE user_profiles SET name='최재영', display_name='최재영' WHERE email='jkl459@naver.com';
-- UPDATE rest_assessments SET student_name='최재영' WHERE student_email='jkl459@naver.com';
