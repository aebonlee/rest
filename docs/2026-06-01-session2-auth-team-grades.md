# 개발일지 — 세션 타임아웃·평가저장·팀구성·권한 보완 (2026-06-01, 2차)

- **사이트**: rest.dreamitbiz.com (AI Reboot Academy / 쉬었음 청년 AI교육 LMS)
- **GitHub**: https://github.com/aebonlee/rest
- **스택**: React 19 + Vite 7 + TypeScript 5.8 + Supabase(`rest_` prefix) + GitHub Pages(gh-pages)
- **배포 방식**: `npm run deploy`(빌드 + gh-pages 발행) 수동 실행

강의 1일차 운영 중 들어온 현장 요청(로그인 튕김, 응시내역 미반영, 팀장 오설정, 관리자 승급)을 일괄 보완한 세션.

---

## 1. 로그인 튕김 → 자동 로그아웃 60분으로 완화 (`useIdleTimeout.ts`, `AuthContext.tsx`)
- **원인**: 무동작 자동 로그아웃이 **10분**으로 설정 → 시험(40분대)·강의 중 마우스 안 움직이면 로그아웃됨
- 조치:
  - 기본 타임아웃 **10분 → 60분**, 경고 시점 1분 전 → 2분 전
  - 경고/로그아웃 안내 문구를 타임아웃 값에 맞춰 동적 표시
  - `AuthContext`에서 타임아웃 시 `signOut()`(로컬 상태까지 정리)로 변경 → 로그인 표시가 남는 상태 불일치 방지

## 2. 응시했는데 성적 미반영 → 채점결과 자동 재저장 (`Assessment.tsx`)
- **원인**: 시험 중 세션이 끊기면 제출 시 `!user`로 판정되어 '게스트' 처리 → DB 저장 안 됨 (전유미 사례)
- 조치: 제출 완료(`submitted`) 상태인데 미저장이고 로그인되어 있으면, 평가 페이지 재진입 시 `persistResult` 자동 호출
  - 답안은 localStorage에 보존되므로, 끊겼던 학생이 **다시 로그인 후 평가 페이지만 열면 자동 반영**

## 3. 전유미 선수평가 성적 수동 반영 (SQL — 실행 대기)
- dbal1107@gmail.com / 전유미 / id `aa0f1bff-8505-48a3-a60f-b90001c5d4a5`
- **선수평가 55점(11/20), 합격**(기준 40점) — 세션 끊김으로 미저장된 응시 결과
- anon 키는 RLS상 `rest_assessments` 입력 불가 → **Supabase SQL Editor에서 실행 필요**
- 준비 SQL: `supabase/ops_2026-06-01.sql` §1 (upsert, `ON CONFLICT(student_id,type)`)
- **상태: 미실행**

## 4. 팀구성 — 강사(이애본) 팀 참여 차단 (`ProjectVote.tsx`)
- **요청 정리**: 팀 결성은 수강생이 클릭, **클릭한 학생이 팀장**(이 동작은 유지). 단, 강사가 클릭해 팀장이 되는 것만 막기
- 조치:
  - `handleCreateTeam`/`handleJoin`에 `isAdmin` 가드 추가
  - 강사에게는 "팀 만들기/합류" 버튼 숨김 + 안내 문구 노출 (이미 속한 팀의 "팀 나가기"는 유지 → 잘못 들어간 팀 직접 탈퇴 가능)
- **기존 데이터 정리(SQL — 실행 대기)**: `ops_2026-06-01.sql` §2
  - 모든 팀 members에서 관리자 이메일 멤버 제거 → 빈 팀 자동 삭제
  - 또는 이애본 로그인 후 해당 팀 "팀 나가기" 클릭 시 단독 멤버라 팀 자동 삭제(`leaveTeam`)

## 5. 백진주 — 쉬었음(rest) 사이트 한정 관리자 승급 (`config/admin.ts`)
- a01094819953@gmail.com / 백진주
- `ADMIN_EMAILS`에 추가 → 이 레포는 **rest에만 배포**되므로 권한이 rest 사이트로 한정됨(다른 DreamIT 사이트는 각자 목록 사용)
- 대시보드/명단(anon·로그인 읽기 가능 데이터)은 즉시 접근 가능
- RLS 보호 데이터(성적·다짐 등)까지 보이게 하려면 `ops_2026-06-01.sql` §3(선택)으로 RLS 정책에 이메일 추가

## 6. user_profiles RLS 축소 — PII 노출 차단 (SQL — 실행 대기)
- **이슈**: `user_profiles` SELECT가 전면 개방 → 공개 번들 anon 키로 가입자 600+명 PII(이름·이메일·전화) 조회 가능 (1차 세션 미해결 건)
- **공유 테이블 영향 점검**: 같은 Supabase(`hcmgdztsgjvzcyxyayaj`)를 rest·joongang·openclaw·coding·DevLab이 공유. 로컬 전수 조사 결과 **일반 사용자는 본인 프로필만**(`.eq('id', 본인)`), 타인 조회는 **관리자 페이지(운영자 aebon)** 한정 → `본인+관리자` 정책 안전
- **잔여 리스크**: autowork·ai-prompt·chatgpt·vibe 등 로컬에 없는 사이트는 미점검 → 폴백 SQL(로그인사용자만 / 전면개방) 동봉
- **정책 결정**: `본인 + 관리자`로 확정 (운영자 선택)
  - 본인(`auth.uid()=id`) + 글로벌 운영자(role admin/superadmin via `is_platform_admin()` SECURITY DEFINER 함수, 또는 aebon 이메일 4종) + **rest 한정 관리자 백진주는 `signup_domain='rest.dreamitbiz.com'` 가입자만**
  - RLS 재귀 방지 위해 role 판별은 SECURITY DEFINER 함수로 분리
- SQL: `supabase/ops_2026-06-01.sql` §4 (트랜잭션 + 검증 + 폴백 A/B 포함). **상태: 미실행**

---

## 후속 필요 (운영자 액션)
1. Supabase SQL Editor에서 `supabase/ops_2026-06-01.sql` 실행
   - §1 전유미 선수평가 55점 / §2 팀 강사멤버 정리 (필수)
   - §4 user_profiles RLS 축소 (실행 전 §4-0으로 현재 정책 먼저 확인 권장) — 실행 후 anon 조회 0건 검증
   - §3 백진주 성적 RLS (선택)
2. ✅ 프론트 변경분(타임아웃·평가저장·팀가드·관리자 승급)은 본 세션에서 `npm run deploy` 발행 완료
3. (점검 권장) RLS 작업 시 user_profiles의 **UPDATE/INSERT 정책**도 과개방 아닌지 함께 확인 (§4-0 쿼리로 전체 정책 조회)
