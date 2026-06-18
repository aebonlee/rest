# 기술코칭 부록 추가 — Google·Kakao 개발자 콘솔 (2026-06-18)

## 요청
Google/Kakao 개발자 콘솔에서 필수 기능 추가·로그인 기능·지도 추가 등의
설정 내역을 학습 메뉴(부록)로 하나 더 정리.

## 구현
- `src/data/learningData.ts` `coachingTopics`에 부록 Topic `coach-console` 추가
  (`dividerBefore: true`) → `/learning/coaching` 메뉴에 자동 노출

## 자료 구성 (coach-console)
0. 큰 그림 — 콘솔 키 발급 → Supabase → 우리 코드(로그인은 Supabase Auth 경유)
1. 공통 개념(Client ID/Secret, Redirect URI, 플랫폼/도메인, API 활성화, 스코프)
2. 우리 사이트 실제 로그인 코드(auth.ts signInWithOAuth, redirectTo, kakao scopes)
3. Google 로그인 설정(Cloud Console: 동의화면·OAuth 클라이언트·승인 원본/리디렉션→Supabase 콜백)
4. Kakao 로그인 설정(앱 키 종류 표, 플랫폼 도메인, Redirect URI, 비즈앱 이메일 동의)
5. 지도 — Kakao Map JS SDK(코드)
6. 지도 — Google Maps JavaScript API(Enable·키 제한·Billing, 코드)
7. 그 밖에 자주 붙이는 외부 기능 표(결제/주소검색/이메일/푸시/분석)
8. 환경변수 관리(VITE_ 공개키 vs 서버 시크릿)
9. 자주 겪는 문제→원인→처방 표(redirect_uri_mismatch 등)
10. 제출 전 셀프 체크
11. 실습 과제(기초/응용/심화)

## 사실 근거 (현재 코드)
- Supabase Auth + Google/Kakao OAuth (`src/utils/auth.ts`)
- redirectTo = origin + pathname, kakao scopes = profile_nickname profile_image account_email

## 검증
- `npm run typecheck` ✓
- `npm run build` ✓
