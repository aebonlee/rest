-- ============================================
-- PBL 강사 점수(scores)를 자동 점수(auto) 환산값으로 채우기
--   목적: 관리자 화면(/admin/pbl-scores)의 "강사 합계"를 "자동 합계"와 동일하게 맞춘다.
--   배경: scores 가 비어 강사 합계가 0 으로 표시되던 것을, 자동평가 환산점수로 일괄 채움.
--
--   변환식: scores[stage] = round(auto[stage] / 100 * max)
--     - auto  jsonb: { [stageKey]: 0~100 }
--     - scores jsonb: { [stageKey]: 배점점수 }
--     - 단계 배점(max): recognition 15, definition 10, decomposition 10,
--                       abstraction 20, algorithm 20, implementation 15, presentation 10  (합 100)
--   (src/config/pblActivity.ts 의 autoStagePoints = Math.round(auto/100*max) 와 동일)
--
--   ※ auto 데이터가 없는 행(미제출·미가입·중도포기: 신대영, 임지윤 등)은 건드리지 않음.
--   Supabase SQL Editor 에서 실행.
-- ============================================

-- 1) 실행 전 미리보기 — 바뀔 행과 환산 결과 확인
SELECT
  student_name,
  auto,
  (
    SELECT jsonb_object_agg(a.k, round((a.v)::numeric / 100 * m.max)::int)
    FROM jsonb_each_text(s.auto) AS a(k, v)
    JOIN (VALUES
      ('recognition', 15), ('definition', 10), ('decomposition', 10),
      ('abstraction', 20), ('algorithm', 20), ('implementation', 15), ('presentation', 10)
    ) AS m(key, max) ON m.key = a.k
  ) AS scores_preview
FROM rest_pbl_submissions s
WHERE s.auto IS NOT NULL AND s.auto <> '{}'::jsonb
ORDER BY student_name;

-- 2) 실제 반영 — scores 를 auto 환산값으로 덮어쓰기
UPDATE rest_pbl_submissions s
SET
  scores = COALESCE((
    SELECT jsonb_object_agg(a.k, round((a.v)::numeric / 100 * m.max)::int)
    FROM jsonb_each_text(s.auto) AS a(k, v)
    JOIN (VALUES
      ('recognition', 15), ('definition', 10), ('decomposition', 10),
      ('abstraction', 20), ('algorithm', 20), ('implementation', 15), ('presentation', 10)
    ) AS m(key, max) ON m.key = a.k
  ), '{}'::jsonb),
  updated_at = now()
WHERE s.auto IS NOT NULL AND s.auto <> '{}'::jsonb;

-- 3) 실행 후 검증 — 강사 합계( Σ scores ) 와 자동 합계( Σ auto환산 ) 가 일치하는지
SELECT
  student_name,
  (SELECT COALESCE(SUM((v)::int), 0) FROM jsonb_each_text(scores) AS x(k, v)) AS instructor_total,
  (
    SELECT COALESCE(SUM(round((a.v)::numeric / 100 * m.max)::int), 0)
    FROM jsonb_each_text(auto) AS a(k, v)
    JOIN (VALUES
      ('recognition', 15), ('definition', 10), ('decomposition', 10),
      ('abstraction', 20), ('algorithm', 20), ('implementation', 15), ('presentation', 10)
    ) AS m(key, max) ON m.key = a.k
  ) AS auto_total
FROM rest_pbl_submissions
WHERE auto IS NOT NULL AND auto <> '{}'::jsonb
ORDER BY instructor_total DESC, student_name;
