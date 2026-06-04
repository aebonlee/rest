-- ============================================================
-- rest_teams: 관리자 DELETE 정책 추가
-- 2026-06-04 / Supabase SQL Editor 에서 1회 실행
-- 사유: 기존 SELECT/INSERT/UPDATE 정책만 있어 DELETE 가 차단됨.
--       관리자(팀 편성 관리 '확정 명단으로 팀 생성')가 기존 팀을 교체하려면 필요.
-- ============================================================

DROP POLICY IF EXISTS "rest_teams_delete" ON rest_teams;
CREATE POLICY "rest_teams_delete" ON rest_teams FOR DELETE
    USING (
        (auth.jwt() ->> 'email') IN (
            'aebon@kakao.com', 'radical8566@gmail.com', 'aebon@kyonggi.ac.kr'
        )
    );

-- (참고) 마지막 팀원이 나가면 팀이 삭제되도록 학생 본인 DELETE 도 허용하려면 아래처럼 확장 가능:
-- 본 정책은 관리자 일괄 정리 용도에 한정한다.
