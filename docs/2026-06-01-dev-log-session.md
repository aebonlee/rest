# 개발일지 — 강의 1일차 운영 점검 세션 (2026-06-01)

- **사이트**: rest.dreamitbiz.com (AI Reboot Academy / 쉬었음청년 AI교육 LMS)
- **GitHub**: https://github.com/aebonlee/rest
- **스택**: React 19 + Vite 7 + TypeScript 5.8 + Supabase(`rest_` prefix) + GitHub Pages(gh-pages)
- **배포 방식**: GitHub Actions 없음 → `npm run deploy`(빌드 + gh-pages 발행) 수동 실행 필요

교육 첫날(6/1) 현장 회원가입이 시작된 시점에서 가입·출결·팀구성 플로우 운영 점검 + 문구 수정/배포를 진행한 세션 기록.

---

## 1. 회원가입 플로우 점검 — 정상 작동 확인
- 오늘 **rest 과정 가입자 25명**, 전원 이름 + 전화번호 입력 완료
  → `ProfileCompleteModal`(이름+전화 필수화) 정상 작동, 미완성 프로필 0명
- 가입 시각이 14:15 KST 전후로 분포 → 강의 시작(14:00)에 맞춰 현장 가입 진행됨
- `user_profiles`는 DreamIT Biz 사이트 공유 사용자 풀(총 608명), `signup_domain`으로 사이트별 구분

## 2. 인프라 점검 — 모두 정상
- `rest_attendance` / `rest_teams` / `rest_topic_votes` / `rest_project_topics` / `rest_assessments` / `rest_pledges` 등 테이블 전부 존재
- `check_user_status` RPC(계정 정지 체크) 정상
- 출석 자가체크 로직 확인: **14:10 이후 체크인 시 자동 '지각'**, 1인 1일 upsert(중복 방지)
- `rest_attendance`/`rest_teams`는 RLS상 **로그인 사용자만** 읽기/쓰기 → anon 키로는 실데이터 조회 불가(보안상 정상). 출결·팀 현황은 관리자 로그인으로 확인 필요

## 3. ⚠️ 발견한 보안 이슈 (미해결 — 후속 조치 필요)
- `user_profiles` SELECT RLS가 anon에 전면 개방 → **anon 키로 608명 전원의 이름·이메일·전화번호 조회 가능**
- anon 키는 배포 번들에 포함되어 공개되므로 개인정보 노출 상태
- **권장 조치**: `user_profiles` SELECT 정책을 본인 + 관리자만으로 좁히기 (단, Claude Master·DevLab 등 공유 테이블이라 영향 범위 사전 확인 필요)

## 4. 조하령 학생 팀장 강등 (SQL 준비 — 실행 대기)
- 요청: 팀장 → 팀원 강등(팀은 유지)
- 조하령 id: `29b02009-8884-4e3a-b2e5-fa30b1874774`
- `rest_teams`는 anon 수정 불가 + 관리자 페이지(`/admin/teams`)는 읽기 전용 → **Supabase SQL Editor(service role)에서 실행 필요**
- 준비한 SQL: `members @> '[{"id":"29b0..."}]'`로 해당 팀 1개만 타겟팅, 그 멤버의 `role`만 `jsonb_set`으로 `'팀원'` 변경
- **상태: 미실행** — SQL Editor 실행 후 결과 검증 필요. 강등 후 팀장 공석 시 새 팀장 지정 여부 결정 필요

## 5. 학습자료 문구 수정 + 배포 (`068faa8`)
- "내가 만든" → **"DreamIT 사에서 만든"** 4곳 일괄 변경
  - `translations.ts`(subtitle) / `Resources.tsx`(헤더 안내문, 사이드바 섹션 라벨) / `resourceSites.ts`(주석)
- typecheck 통과 → `main` 푸시 → `npm run deploy`로 gh-pages 발행 완료(`Published`)

---

## 후속 과제 (TODO)
1. `user_profiles` RLS 개인정보 노출 차단 (공유 테이블 영향 범위 확인 후)
2. 조하령 팀장 강등 SQL 실행 + 결과 검증
3. 관리자 페이지(`/admin/teams`)에 팀원/팀장 편집 기능 부재 — 운영 편의상 추가 검토
