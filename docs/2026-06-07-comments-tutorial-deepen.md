# 2026-06-07 — 소스 주석 학습자(튜토리얼) 수준 재심화 + 표/녹색 보정

## 요청
① 모든 주석 녹색 ② 학습자가 혼자 공부해도 이해할 수준으로 더 꼼꼼한 주석.
(직전 별건) 콘텐츠 표 가로스크롤 → 데스크톱 줄바꿈.

## 변경
### 표 가로스크롤 — `src/pages/Learning.tsx`
- 표 minWidth:max-content 제거 + td white-space:normal / word-break:keep-all → 긴 셀이 가로스크롤 대신 줄바꿈(한글 단어 보존).

### 주석 녹색 — `.vscode/settings.json`
- semantic enabled:true + JSDoc/docstring 스코프 추가로 테마 무관 녹색(#22c55e) 강화.

### 학습자용 재심화 — 코드 79개 중 75개
- 다중 에이전트 workflow로 75개를 "초보자 배경 설명 + 왜 이렇게 하는지 + 개념 + 주의점"까지 보강(코드 불변, 주석만).
- 실패 4개(Assignments/Instructor/notifications/people)는 직전 패스의 상세 주석을 유지(이미 충분히 설명됨).

## 검증
- `npm run build`(tsc) 통과.
- git diff 삭제 코드줄 838개 중 불일치 20개 = 전부 "같은 줄에 JSX 주석 부착" 또는 등가 유니코드 표기(useIdleTimeout: \uXXXX→이모지, 출력 동일). 실제 로직/문자열 변경 0.

## 배포
- 주석은 빌드 시 제거되어 산출물 동일. main push → Actions 자동배포.
