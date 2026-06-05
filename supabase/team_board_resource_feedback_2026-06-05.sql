-- ============================================================
-- 프로젝트 관리(팀 게시판) 2차 고도화 — 2026-06-05
-- Supabase SQL Editor 에서 1회 실행
--  · 자료 링크 첨부: rest_team_posts.link_url
--  · 강사 피드백 댓글: rest_team_comments.is_staff + 관리자 댓글 작성 허용(RLS)
-- ============================================================

-- 1) 글: 자료 링크(URL) 컬럼
ALTER TABLE rest_team_posts ADD COLUMN IF NOT EXISTS link_url TEXT DEFAULT '';

-- 2) 댓글: 강사(관리자) 작성 표시용 플래그
ALTER TABLE rest_team_comments ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT false;

-- 3) 댓글 작성 RLS 교체 — 팀원 + 관리자(강사) 모두 작성 가능
--    (기존 정책은 '본인 + 자기 팀원'만 허용해 강사가 피드백 댓글을 달 수 없었음)
DROP POLICY IF EXISTS "rest_team_comments_insert" ON rest_team_comments;
CREATE POLICY "rest_team_comments_insert" ON rest_team_comments FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND (
            EXISTS (
                SELECT 1 FROM rest_teams t
                WHERE t.id = rest_team_comments.team_id
                  AND t.members @> jsonb_build_array(jsonb_build_object('id', (auth.uid())::text))
            )
            OR (auth.jwt() ->> 'email') IN (
                'aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr',
                'a01094819953@gmail.com', 'jotu117@gmail.com',
                'jooym6016@kidico.or.kr', 'tlskaksmf@naver.com'
            )
        )
    );

-- 참고: 댓글 조회(select) 정책은 팀원 + 관리자 3인(주 강사 계정)으로 이미 열려 있어
--       강사 피드백 흐름(작성·열람)에는 충분합니다. 보조 관리자까지 전체 팀 게시판
--       열람이 필요하면 rest_team_posts_select / rest_team_comments_select 의
--       이메일 목록도 위와 동일하게 확장하세요.
