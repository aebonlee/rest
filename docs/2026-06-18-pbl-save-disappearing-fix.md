# PBL 활동 저장이 자꾸 사라지는 문제 — 원인 분석 및 복구 (2026-06-18)

## 증상
학생이 개인별 PBL활동(`/pbl/:stage`)에서 작성 → 저장하면 토스트는 뜨는데,
다시 들어오면 작성 내용이 사라진다.

## 진단 결과
프론트엔드 코드는 정상이었다.
- `src/pages/pbl/PblStage.tsx` — load/save 로직 정상
- `src/utils/pblStore.ts` — `rest_pbl_submissions` 에 user당 1행 upsert 정상
- `src/utils/supabase.ts` — `persistSession: true` 등 세션 유지 정상

문제는 **DB(Supabase) 쪽**이었다. 저장은 `rest_pbl_submissions` 테이블 +
`user_id` 고유 제약 + 본인 RLS 정책이 프로덕션에 존재해야 동작하는데,
이 테이블 생성 SQL(`supabase/2026-06-18-pbl-submissions.sql`)은 **SQL Editor에서 수동 1회 실행**이
필요한 단계였고(원래 구현 문서의 "다음 단계 1번"), 이게 누락/부분적용된 것이 원인.

원인 후보:
1. `rest_pbl_submissions` 테이블이 프로덕션에 아직 없음 → upsert가 에러
2. 같은 이름 테이블이 예전 구조(`user_id`에 PK/UNIQUE 없음)로 존재 →
   `CREATE TABLE IF NOT EXISTS`가 no-op, `upsert(onConflict:'user_id')`가 깨짐
3. RLS는 켜졌지만 본인 SELECT 정책이 없어 저장은 되는데 다시 못 읽음

## 조치

### 1) DB 복구 SQL (관리자가 SQL Editor에서 1회 실행 — 필수)
`supabase/2026-06-18-pbl-submissions-fix.sql`
- 어떤 상태에서 실행해도 안전한 멱등 스크립트
- 테이블 생성 / 누락 컬럼 보강 / `user_id` UNIQUE 제약 보강(중복행 정리 포함) /
  RLS 정책 4종(select·insert·update·delete) 재설정
- 마지막 SELECT 3개로 적용 결과 검증 (테이블 존재 / user_id 제약 / 정책 4개)

### 2) 프론트 안전장치 (조용히 사라지지 않게)
`src/utils/pblStore.ts` `saveStageContent`
- upsert에 `.select('user_id').maybeSingle()` 추가 → 저장이 실제 반영됐는지 확인,
  반영된 행이 없으면(=RLS/제약 문제) 명시적 에러를 던져 "저장됐다고 떴는데 사라짐"을 차단
- `enrichSaveError`로 테이블 없음(42P01)/onConflict 제약 누락 오류를 사람이 읽을 메시지로 변환

## 검증
- `npm run typecheck` ✓
- `npm run build` ✓

## 남은 할 일 (사용자)
1. **Supabase SQL Editor에서 `supabase/2026-06-18-pbl-submissions-fix.sql` 실행** (가장 중요)
2. 실행 결과의 검증 SELECT에서 테이블·제약·정책 4개가 모두 보이는지 확인
3. 학생 계정으로 작성→저장→새로고침→유지 확인
