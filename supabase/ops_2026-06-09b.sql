-- ============================================================
-- 2026-06-09 (b) '나이대별 한국사 학습·시험 앱'(프리셋 p3, 이유민) 라이브 데이터 삭제
--  · Supabase SQL Editor에서 실행 (postgres 권한 → RLS 우회)
--  · 정적 코드(보드/갤러리/명단/가이드)에서는 이미 제거됨. 여기선 DB 잔여 데이터 정리.
--  · 보드 번호 3번은 비워 둠(다른 팀 번호·패들렛/배포 번호 유지).
-- ============================================================

-- 1) 프리셋 주제 'p3'에 대한 투표 삭제 (프리셋은 topic_key='p3'로 저장됨)
DELETE FROM rest_topic_votes WHERE topic_key = 'p3';

-- 2) 혹시 '나이대별 한국사…'로 결성된 팀이 있으면 삭제
--    (rest_team_checklist / rest_team_submission / rest_team_posts 는 FK ON DELETE CASCADE로 함께 삭제)
DELETE FROM rest_teams WHERE project_topic LIKE '나이대별 한국사%';

-- 확인
-- SELECT count(*) AS votes_p3 FROM rest_topic_votes WHERE topic_key = 'p3';                 -- 0 정상
-- SELECT count(*) AS teams_left FROM rest_teams WHERE project_topic LIKE '나이대별 한국사%'; -- 0 정상
