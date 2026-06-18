-- ============================================
-- 개인별 PBL활동 제출 (rest_pbl_submissions) — user당 1행
-- snu_pbl_submissions 구조를 rest_ 접두사로 이식.
--   content  jsonb: { [stageKey]: { [fieldId]: string } }  (학생 작성)
--   auto     jsonb: { [stageKey]: number(0~100) }           (자동 평가 점수, 학생 본인)
--   scores   jsonb: { [stageKey]: number }                  (강사 평가)
--   feedback jsonb: { [stageKey]: string }                  (강사 피드백)
-- RLS: 본인은 자기 행만, 관리자(아래 이메일)는 전체 조회·수정 가능.
-- ============================================
CREATE TABLE IF NOT EXISTS rest_pbl_submissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT DEFAULT '',
    student_name TEXT DEFAULT '',
    project_topic TEXT DEFAULT '',
    team_name TEXT DEFAULT '',
    region TEXT DEFAULT '',
    topic_key TEXT DEFAULT '',
    track TEXT DEFAULT '',
    student_no TEXT DEFAULT '',
    major TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    course_type TEXT DEFAULT '',
    major_type TEXT DEFAULT '',
    roster_matched BOOLEAN DEFAULT false,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    auto JSONB NOT NULL DEFAULT '{}'::jsonb,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE rest_pbl_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rest_pbl_select" ON rest_pbl_submissions;
CREATE POLICY "rest_pbl_select" ON rest_pbl_submissions FOR SELECT
  USING (auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr'));

DROP POLICY IF EXISTS "rest_pbl_insert" ON rest_pbl_submissions;
CREATE POLICY "rest_pbl_insert" ON rest_pbl_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rest_pbl_update" ON rest_pbl_submissions;
CREATE POLICY "rest_pbl_update" ON rest_pbl_submissions FOR UPDATE
  USING (auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr'));

DROP POLICY IF EXISTS "rest_pbl_delete" ON rest_pbl_submissions;
CREATE POLICY "rest_pbl_delete" ON rest_pbl_submissions FOR DELETE
  USING ((auth.jwt() ->> 'email') IN ('aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr'));

-- ============================================
-- 추가 컬럼 동기화 (기존 DB 대비 멱등) — 이미 테이블이 있던 경우 보강
-- ============================================
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS auto JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS project_topic TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS student_no TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS major TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS college TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS department TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS major_type TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS roster_matched BOOLEAN DEFAULT false;

-- 공유 회원 테이블(user_profiles)에 학번·전공 컬럼 (additive, 다른 사이트 무영향)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS student_no TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS major TEXT;
