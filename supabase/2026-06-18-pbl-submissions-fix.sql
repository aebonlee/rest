-- ============================================
-- [FIX] 개인별 PBL활동 제출이 저장 후 사라지는 문제 진단/복구
--   원인 후보 1: rest_pbl_submissions 테이블이 프로덕션에 아직 생성되지 않음
--   원인 후보 2: 같은 이름의 테이블이 예전 구조(user_id에 UNIQUE/PK 없음)로 이미 존재 →
--               CREATE TABLE IF NOT EXISTS 가 no-op 가 되어 upsert(onConflict:user_id)가 깨짐
--   원인 후보 3: RLS는 켜졌지만 본인 SELECT 정책이 없어 저장은 되는데 다시 못 읽음
-- 이 파일은 어떤 상태에서 실행해도 안전(멱등)하며, 위 3가지를 모두 바로잡는다.
-- 공유 단일 프로젝트(hcmgdztsgjvzcyxyayaj) SQL Editor에서 1회 실행.
-- ============================================

-- 0) 진단: 현재 상태 확인용 (실행하면 결과 탭에서 확인)
--   - 테이블 존재 여부 / 행 수 / user_id 유니크 제약 여부 / RLS 정책 목록
-- SELECT to_regclass('public.rest_pbl_submissions') AS table_exists;
-- SELECT count(*) AS rows FROM rest_pbl_submissions;
-- SELECT conname, contype FROM pg_constraint WHERE conrelid = 'rest_pbl_submissions'::regclass;
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'rest_pbl_submissions';

-- 1) 테이블이 없으면 생성 (user_id 를 PK 로 — upsert onConflict 의 전제)
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

-- 2) 누락 컬럼 보강 (예전 구조로 이미 존재했던 경우 대비, additive)
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS auto JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS scores JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS feedback JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS student_name TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS project_topic TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE rest_pbl_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3) user_id 에 UNIQUE/PK 제약이 없으면 추가 (upsert onConflict:'user_id' 의 핵심 전제)
--    제약이 없으면 upsert 가 "no unique or exclusion constraint matching the ON CONFLICT" 로 실패한다.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conrelid = 'rest_pbl_submissions'::regclass
      AND c.contype IN ('p', 'u')
      AND c.conkey = ARRAY[(
        SELECT a.attnum FROM pg_attribute a
        WHERE a.attrelid = 'rest_pbl_submissions'::regclass AND a.attname = 'user_id'
      )]
  ) THEN
    -- 혹시 user_id 중복 행이 있으면 최신 1건만 남기고 제거(유니크 추가 가능하도록)
    DELETE FROM rest_pbl_submissions a
    USING rest_pbl_submissions b
    WHERE a.ctid < b.ctid AND a.user_id = b.user_id;

    ALTER TABLE rest_pbl_submissions
      ADD CONSTRAINT rest_pbl_submissions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 4) RLS 활성화 + 정책 재설정 (본인=자기 행 / 관리자=전체)
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
    OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr'))
  WITH CHECK (auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr'));

DROP POLICY IF EXISTS "rest_pbl_delete" ON rest_pbl_submissions;
CREATE POLICY "rest_pbl_delete" ON rest_pbl_submissions FOR DELETE
  USING ((auth.jwt() ->> 'email') IN ('aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr'));

-- 5) 검증: 실행 후 아래가 모두 충족되어야 정상
--   - table_exists 가 NULL 이 아님
--   - user_id 에 contype 'p' 또는 'u' 제약 존재
--   - 정책 4개(select/insert/update/delete) 존재
SELECT to_regclass('public.rest_pbl_submissions') AS table_exists;
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'rest_pbl_submissions'::regclass AND contype IN ('p','u');
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'rest_pbl_submissions' ORDER BY cmd;
