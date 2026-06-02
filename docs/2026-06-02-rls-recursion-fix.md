# 2026-06-02 — user_profiles RLS 무한재귀 수정 + 사이트별 관리자 분리

## 증상
- 관리자 로그인은 되는데 **명단/성적이 텅 빔**, 본인 이름이 "이?"처럼 반쪽만 표시.
- 재로그인·세션 초기화로도 복구 안 됨. (가입 28명·선수평가 26건 데이터는 멀쩡)

## 근본 원인
`user_profiles`에 SELECT 정책이 2개 살아있었고, 그중 `user_profiles_select_own`이
**자기 자신(user_profiles)을 다시 조회하는 서브쿼리**를 포함 → PostgreSQL **무한재귀(42P17)**
→ SELECT 쿼리 자체가 통째로 실패. 폴백 A(`authed`)가 옆에 있어도 같이 평가되며 전체가 깨짐.
- 본인 프로필 조회 실패 → getProfile null → 이름 "이?"
- 명단 조회 실패 → 0건
- 어제까지 됐던 이유: 그 전엔 테이블이 전면 개방(anon 조회)이라 세션 없이도 읽혔음.
  PII 보호를 위해 조회를 잠근 뒤, 남아있던 재귀 정책이 표면화된 것.

## 해결 (Supabase SQL — 데이터 기반 관리자 설계)
- `platform_admins(email)` / `site_admins(email, signup_domain)` 테이블 신설 — 관리자를
  하드코딩이 아닌 **데이터로 관리**(추가/삭제 = INSERT/DELETE).
- `is_platform_admin()`, `is_site_admin(domain)` — **SECURITY DEFINER**로 RLS 우회 → 재귀 없음.
- `user_profiles` SELECT 정책을 **단일 `user_profiles_select_final`** 로 통일:
  `auth.uid()=id OR is_platform_admin() OR is_site_admin(signup_domain)`
- 운영자(platform_admins): aebon@kakao.com, radical8566@gmail.com, aebon@kyonggi.ac.kr, aebonlee@gmail.com
- rest 한정 관리자(site_admins, signup_domain=rest.dreamitbiz.com):
  백진주(a01094819953@gmail.com), 조두수 수석(jotu117@gmail.com),
  주윤미 책임(jooym6016@kidico.or.kr, tlskaksmf@naver.com)

## 코드 변경
- `src/config/admin.ts` — ADMIN_EMAILS에 조두수·주윤미(2메일) 추가 → 대시보드 접근 권한.
  (RLS 데이터 조회 권한은 위 site_admins로 별도 부여)

## 비고
- 주윤미 책임은 아직 미가입 — 해당 이메일로 rest 회원가입하면 관리자 권한 자동 적용.
- 향후 관리자 추가: `site_admins`에 (이메일, 'rest.dreamitbiz.com') 한 줄 INSERT로 끝.
- 롤백 필요 시: `user_profiles_select_final` DROP 후 `USING (auth.uid() IS NOT NULL)` 정책으로 복귀.
