# 2026-06-04 — 사전평가 점수 누락 진단 + 고아 점수 경고 패널

## 배경
관리자 보고: 수강생 **한승우(#30)**, **이유민(#16)** 두 명이 **사전평가(선수평가, prerequisite)**를
응시했는데 관리자 성적표(`/admin/grades`)에 점수가 잡히지 않음.

## 원인 분석 (코드 기준)
평가 저장/조회 구조:
- 테이블 `rest_assessments` — `type CHECK (prerequisite | summative)`. **진단평가(diagnostic)는 저장 불가**(자습용).
- 저장 키: `UNIQUE(student_id, type)`, upsert `onConflict: student_id,type`.
- 관리자 성적표는 `user_profiles`(signup_domain = rest.dreamitbiz.com) + `rest_assessments`를
  **`student_id`로 매칭**해서 표시.

### 핵심 약점
`AdminGrades.tsx`의 `gradeMap`은 **표시된 수강생 목록(`people`)의 계정 id에 매칭되는 점수만** 가져왔다.
→ 평가기록의 `student_id`가 학생 목록과 매칭되지 않으면(아래 경우) **점수가 화면에서 조용히 사라짐**:
1. 게스트(비로그인) 제출 → 애초에 저장 안 됨 (`Assessment.tsx`의 `!user` 분기)
2. `signup_domain`이 rest.dreamitbiz.com이 아닌 계정으로 가입/응시 → 학생 목록에서 필터됨
3. 프로필 누락 / 중복계정으로 `student_id` 분리

## 변경
`src/pages/admin/AdminGrades.tsx`
- `orphanGrades` 계산 추가: 표시 학생 계정 id 집합에 없는 평가기록을 추출.
- 상단에 **「⚠ 매칭 안 된 평가기록 N건」 경고 패널** 렌더 — 이름·이메일·평가·점수·응시일시·student_id 표시.
  → DB엔 있으나 매칭 실패한 점수를 관리자가 즉시 확인하고 가입 상태를 추적 가능.

## 실제 데이터 확인용
`supabase/check_assessment_2026-06-04.sql` — Supabase SQL 에디터에서 실행(RLS 우회):
- [1] 두 사람 프로필(도메인·중복계정) [2] 실제 평가기록 [3] 프로필↔기록 조인 [4] 사전평가 전체 현황.

## 검증
- `tsc -b --force` → 통과(에러 0).
