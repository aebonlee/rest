-- ============================================================
-- 확정 명단으로 14팀 일괄 편성 — 2026-06-04
-- Supabase SQL Editor 에서 실행 (서비스롤 → RLS 우회, 기존 팀 교체)
-- 멤버는 실제 이메일로 user_profiles 와 조인 → id 정확 매칭
-- 중복계정: 임종권=ssujklim, 최재영=istp0109318 / 닉네임: 이유민=yoominggg2164
-- 팀장은 미지정(모두 '팀원') — 학생이 팀구성 화면에서 '팀장 신청' 선착순
-- ============================================================

WITH roster(no, email, nm) AS (
  VALUES
    (1,'sm990650@gmail.com','이소민'),(1,'martiniblues@naver.com','신슬'),(1,'dbdydwn14@gmail.com','유용주'),(1,'wkjd05@naver.com','구자성'),
    (2,'ssujklim@gmail.com','임종권'),(2,'ykchoi1020@gmail.com','최윤경'),(2,'ark230015@gmail.com','박수아'),(2,'kwonqbeen@gmail.com','권규빈'),
    (3,'rjsgml13486@gmail.com','김건희'),(3,'healmeanliv@gmail.com','이초월'),(3,'seowoo92@gmail.com','김서우'),(3,'avabrownbb@gmail.com','최윤정'),
    (4,'dbal1107@gmail.com','전유미'),(4,'stecy73@naver.com','오지원'),(4,'jkl459@naver.com','윤혜수'),
    (5,'lsm5735@gmail.com','이시민'),(5,'yunseo.ys.cho@gmail.com','조윤서'),
    (6,'lbaikal1742@gmail.com','박정우'),(6,'hsu235@gmail.com','한승우'),(6,'ghn02047@naver.com','이수현'),
    (7,'dlfspgnt@gmail.com','박남영'),
    (8,'yoominggg2164@gmail.com','이유민'),
    (9,'tmxoflr@gmail.com','장호준'),
    (10,'istp0109318@gmail.com','최재영'),(10,'na900815@kakao.com','김권우'),
    (11,'alicelimti@gmail.com','임윤서'),
    (12,'jhl8397@naver.com','조하령'),
    (13,'jmig0831@gmail.com','정미경'),
    (14,'plzncii@gmail.com','하소희')
),
topics(no, topic) AS (
  VALUES
    (1,'한국형 AI 동화책 제작 앱'),(2,'청년지원정책 안내 챗봇'),(3,'회복탄력성 루틴 코치'),
    (4,'회복탄력성 루틴 코치 (2팀)'),(5,'AI 창업 아이템 코치'),(6,'청년지원정책 안내 챗봇 (2팀)'),
    (7,'문화재 AI 해설 앱'),(8,'나이대별 한국사 학습·시험 앱'),(9,'자격증 취약점 분석 학습 앱'),
    (10,'AI 자기소개서·면접 코치'),(11,'밀려도 괜찮은, AI 생성 학습 플래너'),(12,'내 아이 근시 관리용 플랫폼'),
    (13,'JD 기반 채용 진단 서비스'),(14,'외국인 관광객 맞춤형 실시간 맛집 동선 가이드 앱')
),
mapped AS (
  SELECT r.no,
         jsonb_build_object('id', p.id::text, 'name', r.nm, 'email', r.email, 'role', '팀원') AS m
  FROM roster r
  JOIN user_profiles p ON lower(p.email) = lower(r.email)
),
agg AS (
  SELECT t.no, t.topic, COALESCE(jsonb_agg(m.m), '[]'::jsonb) AS members
  FROM topics t LEFT JOIN mapped m ON m.no = t.no
  GROUP BY t.no, t.topic
)
-- 기존 팀 제거 후 재편성
, del AS ( DELETE FROM rest_teams RETURNING 1 )
INSERT INTO rest_teams (name, project_topic, description, members)
SELECT (no || '팀'), topic, '', members FROM agg ORDER BY no;

-- ===== 편성 결과 확인 =====
SELECT name, project_topic,
       jsonb_array_length(members) AS 인원,
       (SELECT string_agg(x->>'name', ', ') FROM jsonb_array_elements(members) x) AS 팀원
FROM rest_teams
ORDER BY (regexp_replace(name, '[^0-9]', '', 'g'))::int;
