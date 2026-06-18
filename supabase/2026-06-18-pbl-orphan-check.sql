-- 전체 제출 수
select count(*) as total_submissions from rest_pbl_submissions;

-- 명단 외 제출 확인: 활성 명단 이메일에 없는 제출 행
select user_id, student_name, email, project_topic, updated_at
from rest_pbl_submissions
where lower(coalesce(email,'')) not in (
    'wkjd05@naver.com',
    'wkjd05@gmail.com',
    'kwonqbeen@gmail.com',
    'rjsgml13486@gmail.com',
    'na900815@kakao.com',
    'seowoo92@gmail.com',
    'dlfspgnt@gmail.com',
    'ark230015@gmail.com',
    'lbaikal1742@gmail.com',
    'martiniblues@naver.com',
    'stecy73@naver.com',
    'dbdydwn14@gmail.com',
    'sm990650@gmail.com',
    'ghn02047@naver.com',
    'lsm5735@gmail.com',
    'yoominggg2164@gmail.com',
    'healmeanliv@gmail.com',
    'alicelimti@gmail.com',
    'ssujklim@gmail.com',
    'deathbed0104@gmail.com',
    'tmxoflr@gmail.com',
    'dbal1107@gmail.com',
    'jmig0831@gmail.com',
    'yunseo.ys.cho@gmail.com',
    'jhl8397@naver.com',
    'ykchoi1020@gmail.com',
    'avabrownbb@gmail.com',
    'istp0109318@gmail.com',
    'fghjkkzxvvbn@naver.com',
    'plzncii@gmail.com',
    'hsu235@gmail.com',
    'jkl459@naver.com'
)
order by updated_at desc nulls last;

-- 참고: 전체 제출 목록(이메일·이름)
select student_name, email, updated_at from rest_pbl_submissions order by student_name;
