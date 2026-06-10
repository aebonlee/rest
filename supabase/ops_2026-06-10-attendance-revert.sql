-- ============================================================
-- 2026-06-10 출결 '지각→출석' 임의 변경 되돌리기
--  · 학생 자가 체크인은 14:10(KST) 이후면 자동 'late'로 판정되고, check_in_time은 보존된다.
--  · 따라서 status='present' 인데 실제 체크인(KST)이 14:10 이후인 행 = 원래 '지각'이었으나 바뀐 것.
--  · ① 먼저 진단으로 목록을 검토한 뒤 → ② 복원 UPDATE 실행.
-- ============================================================

-- ① 진단(읽기 전용): 원래 지각이었는데 '출석'으로 바뀐 것으로 추정되는 기록
SELECT p.name, p.email, a.date,
       to_char(a.check_in_time AT TIME ZONE 'Asia/Seoul', 'HH24:MI') AS 체크인_KST
FROM rest_attendance a
JOIN user_profiles p ON p.id = a.student_id
WHERE a.status = 'present'
  AND (a.check_in_time AT TIME ZONE 'Asia/Seoul')::time > time '14:10'
ORDER BY a.date, 체크인_KST;

-- ② 복원: 위 목록이 맞으면 실행 (present → late)
-- UPDATE rest_attendance
-- SET status = 'late'
-- WHERE status = 'present'
--   AND (check_in_time AT TIME ZONE 'Asia/Seoul')::time > time '14:10';

-- ③ 복원 확인
-- SELECT p.name, a.date, a.status, to_char(a.check_in_time AT TIME ZONE 'Asia/Seoul','HH24:MI') AS kst
-- FROM rest_attendance a JOIN user_profiles p ON p.id=a.student_id
-- WHERE a.status='late' ORDER BY a.date;
