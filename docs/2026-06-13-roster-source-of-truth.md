# 2026-06-13 — 출결·성적 집계를 공식 명단(Source of Truth) 기준으로 전환

## 배경 — 인원이 29명이어야 하는데 27명

출석/성적 명단은 `user_profiles`를 `signup_domain`으로 조회한 뒤 **전화번호→이름**으로 동일인 통합했다.
이 방식의 결함:
1. **전화번호 과병합** — 서로 다른 학생이 같은 전화번호를 입력하면 한 명으로 잘못 합쳐짐.
2. **signup_domain 누락** — 도메인이 어긋난 계정이 조회에서 빠짐.

그 결과 활성 수강생 29명(전체 31 − 신대영 미가입 − 임지윤 중도포기)이 **27명으로 집계**되는 문제 발생.

## 해결 — 명단을 기준(Source of Truth)으로

가입 계정을 추론(도메인/전화)하는 대신, **공식 명단의 이메일로 계정을 직접 매칭**한다.

### 1. `src/config/roster.ts` (신규)
- `STUDENT_ROSTER`: 31명 전체(이름·성별·전공·계열·수준·상태·이메일). 한 사람이 계정 2개면 모두 나열.
- `status`: `active`(집계 대상) / `not_registered`(신대영) / `withdrawn`(임지윤).
- `ACTIVE_ROSTER`(29명), `ROSTER_EMAILS`(활성 수강생 계정 이메일 전체).

### 2. `src/utils/people.ts` — `groupByRoster(roster, profiles)` 추가
- 명단 순서대로, 학생마다 `emails`로 `user_profiles`를 매칭해 `PersonGroup` 생성.
- 전화번호/이름 자동 통합과 달리 **"다른 학생이 같은 전화번호"여도 절대 섞이지 않음**.
- 계정을 못 찾은(미가입 의심) 학생도 빈 `ids`로 포함 → 화면에서 즉시 드러남(합성 primary 사용).
- 기존 `groupByPerson`은 유지(다른 호출부 호환).

### 3. AdminAttendance / AdminGrades 전환
- 조회를 `.in('email', ROSTER_EMAILS)`로(도메인·전화 변수 무관).
- `people = groupByRoster(ACTIVE_ROSTER, students)` → **항상 정확히 29명**.
- 조교(iryn0325)·관리자 등 명단에 없는 계정은 자동 제외(별도 필터 불필요 → `EXCLUDED_EMAILS` 정리).
- 카운트 표기: "계정 N개(동일인 통합)" → **"계정 미확인 N명"**(매칭 실패 학생이 있을 때만 경고색 표기).
- 방어: 계정 미확인 학생은 출석 기록 시 합성 id가 쓰이지 않도록 가드(안내 토스트 후 중단).

## 효과
- 출결·성적 인원이 **공식 명단(29명)과 항상 일치**. 전화번호 오입력·도메인 누락에 영향받지 않음.
- 미가입/중도포기(신대영·임지윤)는 명단 상태로 명시 제외, 조교도 자동 제외.

## 검증
- `tsc --noEmit` 통과, `npm run build` 성공.

## 후속(선택)
- `AdminRoster(명단 대조)`도 `CONFIRMED_TEAMS`(27, 팀배정) 대신 `STUDENT_ROSTER`(31/활성29) 기준으로
  정비하면 가입/미가입 현황이 전체 명단과 일치하게 됨.
