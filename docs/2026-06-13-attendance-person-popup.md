# 2026-06-13 — 개인별 출석부 팝업(이름/행 클릭) + 날짜별 시각 병기·수정

## 요구
"6월 전체 출석 현황"에서 **이름 또는 이름 줄(행)을 클릭**하면, 그 사람의 이름과 **날짜별 상태 + 체크인 시각**이
함께 보이는 팝업을 띄우고, 거기서 **날짜별 출결을 직접 수정**할 수 있게.

## 구현 (`AdminAttendance.tsx`)
- 월별 매트릭스의 `<tr>` 전체를 클릭 가능하게(`cursor:pointer`, `onClick` → `setDetailPerson(g)`), 이름은
  파란 밑줄로 클릭 가능 표시. (일별 표의 이름도 동일 팝업으로 연결)
- **개인별 출석부 모달**: 헤더(이름·상태별 누계·이메일) + 정규 수업일별 행
  - 각 행: `6/D(요일)` · **체크인 시각**(`fmtTime`) · 현재 상태 약어(미기록 결석 포함) · 수정 버튼.
  - 수정 버튼: **출/지/사/결 + 해제**. 클릭 시 `setStatusFor(person, date, status|null)`.
- `setStatusFor`: 선택일과 무관하게 **임의 날짜** 대상으로 insert/update/delete 후 재로드.
  - 이를 위해 월별 쿼리에 `id, check_in_time` 추가 조회(기존 `student_id, date, status`에서 확장).
  - 계정 미확인(합성) 학생은 기록 불가 가드.
- 날짜 요일/시각 헬퍼 추가: `weekdayOf`, `fmtTime`.

## 검증
- `tsc --noEmit` 통과, `npm run build` 성공.
