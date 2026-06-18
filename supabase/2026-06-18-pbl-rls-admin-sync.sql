-- ============================================
-- PBL RLS 관리자 목록 동기화 (3명 → 7명)
--   문제: rest_pbl_submissions 의 SELECT/UPDATE/DELETE 정책이 관리자 3명만 허용해
--         보조 관리자(백진주·조두수·주윤미)가 /admin/pbl-scores 에서 전체 점수표를 못 봄.
--   조치: src/config/admin.ts 의 관리자 7명과 동일하게 정책을 재생성.
--   (insert 정책은 본인만 작성 = 관리자 무관이라 그대로 둠)
--
--   Supabase SQL Editor 에서 실행. 멱등(여러 번 실행해도 안전).
-- ============================================

-- SELECT: 본인 행 + 관리자 7명 전체 조회
DROP POLICY IF EXISTS "rest_pbl_select" ON rest_pbl_submissions;
CREATE POLICY "rest_pbl_select" ON rest_pbl_submissions FOR SELECT
  USING (auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN (
      'aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr',
      'a01094819953@gmail.com','jotu117@gmail.com','jooym6016@kidico.or.kr','tlskaksmf@naver.com'
    ));

-- UPDATE: 본인 행 + 관리자 7명(강사 점수·피드백 입력)
DROP POLICY IF EXISTS "rest_pbl_update" ON rest_pbl_submissions;
CREATE POLICY "rest_pbl_update" ON rest_pbl_submissions FOR UPDATE
  USING (auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN (
      'aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr',
      'a01094819953@gmail.com','jotu117@gmail.com','jooym6016@kidico.or.kr','tlskaksmf@naver.com'
    ));

-- DELETE: 관리자 7명만
DROP POLICY IF EXISTS "rest_pbl_delete" ON rest_pbl_submissions;
CREATE POLICY "rest_pbl_delete" ON rest_pbl_submissions FOR DELETE
  USING ((auth.jwt() ->> 'email') IN (
    'aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr',
    'a01094819953@gmail.com','jotu117@gmail.com','jooym6016@kidico.or.kr','tlskaksmf@naver.com'
  ));

-- 검증: 적용된 정책 확인 (qual 에 7개 이메일이 모두 들어갔는지)
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'rest_pbl_submissions'
ORDER BY policyname;
