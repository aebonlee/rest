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

## 실측 결과 (고아 점수 3건 확인)
관리자 화면 경고 패널에 3건 노출 → 모두 **선수평가 정상 응시·합격**, 단지 매칭만 실패:

| 이름(저장값) | 이메일 | 점수 | 비고 |
|---|---|---|---|
| 한승우 | hsu235@gmail.com | 50점 합격 | 실명 저장됨 |
| 조윤서 | yunseo.ys.cho@gmail.com | 65점 합격 | 추가 발견 |
| 행복한흰이마기러기 | yoominggg2164@gmail.com | 70점 합격 | = **이유민** (프로필 실명 없어 자동 닉네임으로 저장) |

원인 확정: 세 계정 모두 **다른 dreamitbiz 사이트로 가입(signup_domain ≠ rest)** → 기존 AdminGrades가
rest 도메인 가입자만 불러 목록에서 제외 → 점수가 매칭 안 됨.

## 근본 수정 (2차)
- `AdminGrades.tsx` 로딩 로직을 AdminRoster 방식으로 교체:
  1. `signup_domain = rest **OR** visited_sites 에 rest 포함` 으로 조회(타 도메인 가입자 포함)
  2. 그래도 빠지는 계정은 평가기록 `student_id` 로 직접 보강(`.in('id', missingIds)`)
  → 한승우·조윤서·이유민이 본 표·Excel·PDF 에 정상 집계됨.
- `config/admin.ts` `SAME_PERSON_EMAIL_GROUPS` 에 `이유민(yoominggg2164@gmail.com)` 추가
  → 자동 닉네임 대신 **실명 '이유민'** 으로 표시.
- 고아 경고 패널은 유지 → 프로필 자체가 없는 계정이 응시할 경우 계속 안전망 역할.

## 검증
- `tsc -b --force` → 통과(에러 0).
