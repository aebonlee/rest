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
