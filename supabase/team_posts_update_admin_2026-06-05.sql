-- ============================================================
-- 프로젝트 관리(팀 게시판) — 글 CRUD 완성 + 관리자 작성 허용 — 2026-06-05
-- Supabase SQL Editor 에서 1회 실행
--  · 글 수정(UPDATE) RLS 신설: 작성자 본인 + 관리자
--  · 글 작성(INSERT) RLS 교체: 팀원 + 관리자(강사)  ← 기존엔 팀원만 가능했음
-- ============================================================

-- 1) 글 수정 RLS — 작성자 본인 또는 관리자
DROP POLICY IF EXISTS "rest_team_posts_update" ON rest_team_posts;
CREATE POLICY "rest_team_posts_update" ON rest_team_posts FOR UPDATE
    USING (
        auth.uid() = author_id
        OR (auth.jwt() ->> 'email') IN (
            'aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr',
            'a01094819953@gmail.com', 'jotu117@gmail.com',
            'jooym6016@kidico.or.kr', 'tlskaksmf@naver.com'
        )
    )
    WITH CHECK (
        auth.uid() = author_id
        OR (auth.jwt() ->> 'email') IN (
            'aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr',
            'a01094819953@gmail.com', 'jotu117@gmail.com',
            'jooym6016@kidico.or.kr', 'tlskaksmf@naver.com'
        )
    );

-- 2) 글 작성 RLS 교체 — 팀원 + 관리자(강사) 모두 작성 가능
DROP POLICY IF EXISTS "rest_team_posts_insert" ON rest_team_posts;
CREATE POLICY "rest_team_posts_insert" ON rest_team_posts FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND (
            EXISTS (
                SELECT 1 FROM rest_teams t
                WHERE t.id = rest_team_posts.team_id
                  AND t.members @> jsonb_build_array(jsonb_build_object('id', (auth.uid())::text))
            )
            OR (auth.jwt() ->> 'email') IN (
                'aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr',
                'a01094819953@gmail.com', 'jotu117@gmail.com',
                'jooym6016@kidico.or.kr', 'tlskaksmf@naver.com'
            )
        )
    );
