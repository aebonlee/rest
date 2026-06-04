-- ============================================================
-- 프로젝트 관리(팀 게시판) 고도화 — 2026-06-04
-- Supabase SQL Editor 에서 1회 실행
--  · 글에 카테고리(회의록/아이디어/자료) + 소스코드 첨부
--  · 댓글 기능(rest_team_comments)
-- ============================================================

-- 1) 글: 카테고리 + 소스코드 컬럼
ALTER TABLE rest_team_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'note';
ALTER TABLE rest_team_posts ADD COLUMN IF NOT EXISTS code TEXT DEFAULT '';

-- 2) 댓글 테이블 (팀별 비공개 — 팀원 + 관리자만)
CREATE TABLE IF NOT EXISTS rest_team_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES rest_team_posts(id) ON DELETE CASCADE,
    team_id UUID REFERENCES rest_teams(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT DEFAULT '',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rest_team_comments ENABLE ROW LEVEL SECURITY;

-- 조회: 댓글이 속한 팀의 members에 내 uid 포함 또는 관리자
DROP POLICY IF EXISTS "rest_team_comments_select" ON rest_team_comments;
CREATE POLICY "rest_team_comments_select" ON rest_team_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rest_teams t
            WHERE t.id = rest_team_comments.team_id
              AND t.members @> jsonb_build_array(jsonb_build_object('id', (auth.uid())::text))
        )
        OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr')
    );

-- 작성: 본인 + 자기 팀에만
DROP POLICY IF EXISTS "rest_team_comments_insert" ON rest_team_comments;
CREATE POLICY "rest_team_comments_insert" ON rest_team_comments FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM rest_teams t
            WHERE t.id = rest_team_comments.team_id
              AND t.members @> jsonb_build_array(jsonb_build_object('id', (auth.uid())::text))
        )
    );

-- 삭제: 작성자 본인 또는 관리자
DROP POLICY IF EXISTS "rest_team_comments_delete" ON rest_team_comments;
CREATE POLICY "rest_team_comments_delete" ON rest_team_comments FOR DELETE
    USING (
        auth.uid() = author_id
        OR (auth.jwt() ->> 'email') IN ('aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr')
    );

CREATE INDEX IF NOT EXISTS idx_rest_team_comments_post ON rest_team_comments(post_id);
