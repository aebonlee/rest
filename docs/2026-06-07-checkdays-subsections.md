# 2026-06-07 — 점검일(Day4·Day9) 하위 메뉴(subSections)화

## 요청
1차 기초점검일·2차 학습점검일도 다른 날처럼 하위 목록으로 정리 + ▶ 펼침(아코디언) 적용.

## 변경 — `src/data/learningData.ts`
점검일은 평면 content만 있어 ▶ 화살표/3차 메뉴가 없었음. content를 "개요"로 축약하고 나머지를 subSections로 분리.
(subSections가 생기면 Learning 사이드바가 ▶ + 아코디언을 자동 렌더 — 추가 코드 불필요.)

### Day 4 (reg-check-1) — 하위 5개
- checklist 기초 점검 체크리스트 / selfcheck 자가진단·복습·퀴즈 / meeting 1차 팀별 회의
  / prompt 참고자료·업무형 프롬프트 7요소 / color 색상환·컬러 팔레트
- 작업 중 자가진단 블록이 한 번 중복됐던 것을 제거(검증: 영역 내 자가진단표 1개).

### Day 9 (reg-check-2) — 하위 4개
- checklist 학습 점검 체크리스트 / selfcheck 자가진단·복습·퀴즈(자주 막히는 연동 포함)
  / meeting 2차 팀별 회의 / prep 본개발 준비 체크리스트

## 검증
- `npm run build`(tsc) 통과. 하위메뉴 id 9개 확인, 중복 0.

## 배포
- 정적 데이터만 변경. main push → Actions 자동배포.
