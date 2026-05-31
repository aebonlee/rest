-- ============================================
-- AI Reboot Academy (rest) — Supabase 테이블 생성 SQL
-- 접두사: rest_
-- ============================================

-- 공지사항
CREATE TABLE IF NOT EXISTS rest_announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_pinned BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 학습자료
CREATE TABLE IF NOT EXISTS rest_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'ai_basic',
    file_url TEXT DEFAULT '',
    file_type TEXT DEFAULT 'pdf',
    file_size INTEGER DEFAULT 0,
    day_number INTEGER DEFAULT 1,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 과제
CREATE TABLE IF NOT EXISTS rest_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    day_number INTEGER DEFAULT 1,
    due_date TIMESTAMPTZ NOT NULL,
    max_score INTEGER DEFAULT 100,
    is_team BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 과제 제출
CREATE TABLE IF NOT EXISTS rest_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES rest_assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id),
    student_name TEXT DEFAULT '',
    team_id UUID,
    content TEXT DEFAULT '',
    file_url TEXT DEFAULT '',
    score INTEGER,
    feedback TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ DEFAULT now(),
    graded_at TIMESTAMPTZ
);

-- 출석
CREATE TABLE IF NOT EXISTS rest_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    check_in_time TIMESTAMPTZ DEFAULT now(),
    note TEXT DEFAULT '',
    UNIQUE(student_id, date)
);

-- 팀
CREATE TABLE IF NOT EXISTS rest_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    project_topic TEXT DEFAULT '',
    members JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 프로젝트
CREATE TABLE IF NOT EXISTS rest_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES rest_teams(id),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'real' CHECK (category IN ('mini-personal', 'mini-team', 'real')),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'testing', 'completed')),
    repo_url TEXT DEFAULT '',
    demo_url TEXT DEFAULT '',
    presentation_url TEXT DEFAULT '',
    llm_used JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Q&A
CREATE TABLE IF NOT EXISTS rest_qna (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    is_resolved BOOLEAN DEFAULT false,
    reply_content TEXT DEFAULT '',
    reply_author TEXT DEFAULT '',
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 리소스 링크
CREATE TABLE IF NOT EXISTS rest_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    url TEXT DEFAULT '',
    category TEXT DEFAULT 'tool' CHECK (category IN ('tool', 'llm', 'reference', 'tutorial')),
    icon TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
);

-- ============================================
-- RLS 정책
-- ============================================

-- 공지사항: 누구나 읽기, 관리자만 쓰기
ALTER TABLE rest_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_announcements_select" ON rest_announcements FOR SELECT USING (true);
CREATE POLICY "rest_announcements_insert" ON rest_announcements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rest_announcements_update" ON rest_announcements FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "rest_announcements_delete" ON rest_announcements FOR DELETE USING (auth.uid() = author_id);

-- 학습자료: 로그인 사용자 읽기, 관리자만 쓰기
ALTER TABLE rest_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_materials_select" ON rest_materials FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_materials_insert" ON rest_materials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rest_materials_update" ON rest_materials FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "rest_materials_delete" ON rest_materials FOR DELETE USING (auth.uid() = author_id);

-- 과제: 로그인 사용자 읽기, 관리자만 쓰기
ALTER TABLE rest_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_assignments_select" ON rest_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_assignments_insert" ON rest_assignments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rest_assignments_update" ON rest_assignments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_assignments_delete" ON rest_assignments FOR DELETE USING (auth.uid() IS NOT NULL);

-- 제출: 본인 것만 읽기/쓰기, 관리자는 전체
ALTER TABLE rest_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_submissions_select" ON rest_submissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_submissions_insert" ON rest_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "rest_submissions_update" ON rest_submissions FOR UPDATE USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

-- 출석
ALTER TABLE rest_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_attendance_select" ON rest_attendance FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_attendance_insert" ON rest_attendance FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rest_attendance_update" ON rest_attendance FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 팀
ALTER TABLE rest_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_teams_select" ON rest_teams FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_teams_insert" ON rest_teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rest_teams_update" ON rest_teams FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 프로젝트
ALTER TABLE rest_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_projects_select" ON rest_projects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_projects_insert" ON rest_projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rest_projects_update" ON rest_projects FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Q&A
ALTER TABLE rest_qna ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_qna_select" ON rest_qna FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_qna_insert" ON rest_qna FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "rest_qna_update" ON rest_qna FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 리소스: 누구나 읽기
ALTER TABLE rest_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_resources_select" ON rest_resources FOR SELECT USING (true);
CREATE POLICY "rest_resources_insert" ON rest_resources FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 인덱스
-- ============================================
CREATE INDEX IF NOT EXISTS idx_rest_attendance_student_date ON rest_attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_rest_submissions_assignment ON rest_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_rest_submissions_student ON rest_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_rest_materials_day ON rest_materials(day_number);
CREATE INDEX IF NOT EXISTS idx_rest_qna_author ON rest_qna(author_id);
CREATE INDEX IF NOT EXISTS idx_rest_projects_team ON rest_projects(team_id);

-- ============================================
-- 학습평가 성적 (선수평가 / 사후평가)
--  · 채점형 평가만 저장 (진단평가는 자습용이라 저장하지 않음)
--  · 학생 1명 + 평가종류당 1행 (재응시 시 업서트로 갱신)
-- ============================================
CREATE TABLE IF NOT EXISTS rest_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id),
    student_name TEXT DEFAULT '',
    student_email TEXT DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('prerequisite', 'summative')),
    score INTEGER NOT NULL DEFAULT 0,      -- 100점 만점 환산 점수
    correct INTEGER NOT NULL DEFAULT 0,    -- 정답 문항 수
    total INTEGER NOT NULL DEFAULT 0,      -- 전체 문항 수
    passed BOOLEAN DEFAULT false,
    answers JSONB DEFAULT '{}',            -- { 문항번호: 선택지index }
    submitted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, type)
);

ALTER TABLE rest_assessments ENABLE ROW LEVEL SECURITY;
-- 본인 성적은 본인이, 전체 성적은 관리자(ADMIN_EMAILS)만 조회
CREATE POLICY "rest_assessments_select" ON rest_assessments FOR SELECT
    USING (
        auth.uid() = student_id
        OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr')
    );
CREATE POLICY "rest_assessments_insert" ON rest_assessments FOR INSERT
    WITH CHECK (auth.uid() = student_id);
CREATE POLICY "rest_assessments_update" ON rest_assessments FOR UPDATE
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

CREATE INDEX IF NOT EXISTS idx_rest_assessments_student ON rest_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_rest_assessments_type ON rest_assessments(type);

-- ============================================
-- 프로젝트 팀별 게시판 (팀별 비공개)
--  · 해당 팀의 members JSONB에 포함된 사용자 + 관리자만 조회 가능
-- ============================================
CREATE TABLE IF NOT EXISTS rest_team_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES rest_teams(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT DEFAULT '',
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rest_team_posts ENABLE ROW LEVEL SECURITY;

-- 조회: 글이 속한 팀의 members에 내 uid가 들어있거나, 관리자
CREATE POLICY "rest_team_posts_select" ON rest_team_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rest_teams t
            WHERE t.id = rest_team_posts.team_id
              AND t.members @> jsonb_build_array(jsonb_build_object('id', (auth.uid())::text))
        )
        OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr')
    );

-- 작성: 본인 글 + 자기가 속한 팀에만
CREATE POLICY "rest_team_posts_insert" ON rest_team_posts FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM rest_teams t
            WHERE t.id = rest_team_posts.team_id
              AND t.members @> jsonb_build_array(jsonb_build_object('id', (auth.uid())::text))
        )
    );

-- 삭제: 작성자 본인 또는 관리자
CREATE POLICY "rest_team_posts_delete" ON rest_team_posts FOR DELETE
    USING (
        auth.uid() = author_id
        OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr')
    );

CREATE INDEX IF NOT EXISTS idx_rest_team_posts_team ON rest_team_posts(team_id);

-- ============================================
-- 프로젝트 주제 투표
--  · rest_project_topics: 학생이 제안한 추가 주제 (프리셋 7종은 코드 상수)
--  · rest_topic_votes: 1인 1표 (UNIQUE(user_id), 재투표 시 변경)
--    topic_key = 프리셋 'p1'~'p7' 또는 추가 주제 행 id
-- ============================================
CREATE TABLE IF NOT EXISTS rest_project_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_by UUID REFERENCES auth.users(id),
    created_by_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rest_project_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_project_topics_select" ON rest_project_topics FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_project_topics_insert" ON rest_project_topics FOR INSERT
    WITH CHECK (auth.uid() = created_by);
CREATE POLICY "rest_project_topics_delete" ON rest_project_topics FOR DELETE
    USING (
        auth.uid() = created_by
        OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr')
    );

CREATE TABLE IF NOT EXISTS rest_topic_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_key TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE rest_topic_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_topic_votes_select" ON rest_topic_votes FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "rest_topic_votes_insert" ON rest_topic_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rest_topic_votes_update" ON rest_topic_votes FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rest_topic_votes_delete" ON rest_topic_votes FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rest_topic_votes_key ON rest_topic_votes(topic_key);

-- ============================================
-- 수강 다짐 (마이페이지) — 1인 1개
-- ============================================
CREATE TABLE IF NOT EXISTS rest_pledges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    user_name TEXT DEFAULT '',
    content TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rest_pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rest_pledges_select" ON rest_pledges FOR SELECT
    USING (
        auth.uid() = user_id
        OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr')
    );
CREATE POLICY "rest_pledges_insert" ON rest_pledges FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rest_pledges_update" ON rest_pledges FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
