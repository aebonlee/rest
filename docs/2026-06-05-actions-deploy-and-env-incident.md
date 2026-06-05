# 2026-06-05 — GitHub Actions 자동배포 전환 + .env 누락 배포 사고 복구

## 사고 요약 (postmortem)
- rest는 빌드 시 `.env`의 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`를 번들에 주입한다(`src/utils/supabase.ts`의 `import.meta.env`).
- 프로젝트 15~17 등록 배포를 **`.env` 없는 임시 클론에서 로컬 빌드 → `npm run deploy`(gh-pages)** 로 수행하는 바람에,
  `getSupabase()`가 `null`이 된 번들이 gh-pages에 올라가 **로그인/LMS DB가 비활성화**됨.
- 복구: 직전 정상 번들에서 공개 anon 설정값 확인 → `.env` 작성 → 재빌드 → gh-pages 재배포로 즉시 정상화.

## 재발 방지 — Actions 자동배포로 전환
- `.github/workflows/deploy.yml` 신설(project01~17과 동일 패턴): `main` push 시 빌드→Pages 배포.
- 빌드 단계에서 **repo Actions Secrets** 주입 → 로컬 `.env` 없이도 인증 설정이 항상 번들에 포함됨.
  - 등록 시크릿: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Settings → Secrets and variables → Actions).
- Pages 소스: `legacy`(gh-pages 브랜치) → **`workflow`(GitHub Actions)** 전환.
- 커스텀 도메인: `public/CNAME`(rest.dreamitbiz.com)가 빌드 산출물 `dist/CNAME`로 복사되어 유지됨.

## 운영 메모
- 이제부터 **main에 push만 하면 자동 빌드·배포**된다. 로컬 `npm run deploy`로 직접 올릴 필요 없음(올릴 경우 반드시 `.env` 필요).
- Supabase anon key는 프론트엔드에 공개 임베드되는 값이라 시크릿 노출 위험 항목이 아님(보호 대상은 service_role 키).
