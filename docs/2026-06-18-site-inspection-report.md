# REST 사이트 전체 점검 보고서 (2026-06-18)

대상: AI Reboot Academy LMS · rest.dreamitbiz.com (React 19 + Vite + TS, Supabase, GitHub Pages)

## 종합 결론
전반적으로 **건강한 상태**. 빌드·타입체크 통과, 라이브 200 응답, 라우팅·가드·RLS 구조 모두 견고.
다만 **관리자 권한 불일치(기능 버그)** 1건과 끊긴 링크 1건, SEO·의존성 보완점이 있음.

## 자동 검증 (PASS)
| 항목 | 결과 |
|---|---|
| `tsc -b` 타입체크 | ✅ 통과 (에러 0) |
| `vite build` | ✅ 통과 |
| 라이브 HTTP | ✅ 200 (rest.dreamitbiz.com) |
| vite `base` / CNAME | ✅ `'/'` + 커스텀 도메인 일치 |
| 배포 시크릿 주입 | ✅ Actions가 SUPABASE URL/ANON/KAKAO 주입 |
| 디버그 잔여물 | ✅ 없음 (console.log/debugger는 전부 learningData.ts 강의 콘텐츠 문자열) |

---

## 발견 사항 (우선순위순)

### ✅ HIGH — 관리자 이메일 목록 불일치 (기능 버그) — **해결됨 (2026-06-18)**
> PBL RLS(select/update/delete)를 관리자 7명으로 동기화 완료. `pg_policies` 검증 통과.
> 적용 SQL: `supabase/2026-06-18-pbl-rls-admin-sync.sql` (+ 원본 2개 파일 정합).
> 보조 관리자(백진주·조두수·주윤미) `/admin/pbl-scores` 전체 점수표 정상 조회 확인.

- **위치**: `src/config/admin.ts:46-53` (7명) vs `supabase/2026-06-18-pbl-submissions.sql:39,48,52` (3명)
- **내용**: 클라이언트 관리자 7명(대표 + 백진주·조두수·주윤미 등 rest 한정 관리자) 중,
  PBL RLS 정책에는 **3명만**(`aebon@kakao.com`, `radical8566@gmail.com`, `aebon@kyonggi.ac.kr`) 등록됨.
- **영향**: 백진주·조두수·주윤미 계정은 `/admin/pbl-scores` 화면은 **열리지만**, `getAllSubmissions()`의
  RLS가 본인 행만 반환 → **PBL 점수표가 비어 보임**(전체 조회 불가). 다른 admin 테이블도 동일 패턴인지 점검 필요.
- **권장**: PBL(및 기타) RLS 정책의 이메일 IN 목록을 admin.ts 7명과 동기화. 근본 해결은 `admin_roles` 테이블로 중앙화.

### 🟠 MEDIUM — SEO 기본 파일 누락
- **위치**: `public/` 에 `robots.txt`, `sitemap.xml` 없음
- **영향**: 크롤러 가이드/색인 효율 저하. (404.html SPA 리다이렉트, og 태그, canonical, lang=ko 는 정상)
- **권장**: `public/robots.txt` + 주요 공개 경로 `sitemap.xml` 추가.

### 🟠 MEDIUM — 의존성 취약점 (npm audit: high 4건)
- `react-router 7.x`: DoS/CSRF (대부분 SSR/framework 모드 대상 — 정적 SPA 영향 낮음). `npm audit fix` 가능.
- `ws 8.x`: 메모리 관련(전이 의존성, 브라우저 번들 미사용). 영향 낮음.
- `xlsx (SheetJS)`: Prototype Pollution/ReDoS, **fix 없음**. Excel 내보내기에서 사용(관리자·자체데이터) → 실위험 낮으나
  공식 SheetJS 배포본으로 교체 검토 권장.

### 🟡 LOW — 끊긴 링크 `/contact`
- **위치**: `src/pages/NotFound.tsx:94` — `<Link to="/contact">문의하기</Link>` 인데 `/contact` 라우트 없음 → 클릭 시 다시 404.
- **권장**: 문의 페이지 추가하거나, 링크를 `/about`(또는 홈)로 변경/제거.

### 🟡 LOW — 접근성(A11y) 보완
- 아이콘 전용 버튼/소셜 로그인 SVG에 `aria-label`/`aria-hidden` 일부 누락 (`Login.tsx:225,235,242`, `Learning.tsx` 복사 버튼).
- `AdminAttendance.tsx:508` 클릭 가능한 `<div>` — `role="button"`+키보드 핸들러 또는 `<button>` 권장.
- 일부 입력에 `<label htmlFor>` 연결 누락 (`ProjectBoard.tsx`, `ProjectSubmit.tsx`).

### 🟡 LOW — 반응형 보완
- `AdminPblScores.tsx` 표 `tableLayout:'fixed'` + 고정폭 → 좁은 화면에서 텍스트 잘릴 수 있음(가로 스크롤로 완화됨).
- 모달 `maxWidth:'560px'` 고정 → `min(560px, 90vw)` 권장.

---

## 보안 점검 (양호)
- ✅ service_role 키·JWT 시크릿 번들 미포함. anon 키 노출은 설계상 정상(보안은 RLS가 담당).
- ✅ RLS 정책 잘 설계됨(본인 행 + 관리자, 팀 게시물은 팀원+관리자, 1인1표 UNIQUE).
- ✅ OAuth PKCE 사용. (개선: redirect를 현재 경로 대신 고정 `/auth/callback`로 권장 — auth.ts:74,96,213)
- ⚠️ 관리자 가드는 클라이언트(UI)만 — 실제 경계는 RLS. 민감 작업은 Edge Function 역할검증 추가가 방어심화에 좋음.
- ⚠️ 관리자 이메일이 admin.ts·SQL·PaymentNudgePopup 3곳에 분산·불일치(위 HIGH 참조).

## 라우팅 (양호)
- ✅ 페이지 49개 중 48개 라우팅, 1개(PblSidebar)는 컴포넌트(정상). 미라우팅 페이지 없음.
- ✅ AuthGuard 24개 / AdminGuard 11개 경로, catch-all(NotFound) 정상, lazy 로딩 적용.
- ✅ 리다이렉트(`/pbl→/pbl/info`, `/project-teams→/project-vote`) 동작.
- 검토: `/pbl/rubric` 무가드(공개 의도 여부 확인).

---

## 권장 조치 순서
1. **(HIGH)** PBL/관리자 RLS 이메일 목록을 admin.ts 7명과 동기화 → 보조 관리자 점수표 정상화. (SQL Editor 실행)
2. **(MED)** `public/robots.txt` + `sitemap.xml` 추가.
3. **(MED)** `npm audit fix`로 react-router/ws 패치, xlsx는 SheetJS 공식본 교체 검토.
4. **(LOW)** `/contact` 링크 정리, A11y/반응형 소소한 보완.
