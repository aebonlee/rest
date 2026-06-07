# 2026-06-07 — Day4 1차 기초점검일 학습 노트에 "업무형 프롬프트 7요소" 참고자료 추가

## 배경
halla 참고자료의 "업무형 프롬프트의 기본 구조"(④ 수행 지시 → ⑤ 출력 형식 → ⑥ 제약 조건 → ⑦ 담당자 검수 항목)를
rest의 **Day 4 · 1차 기초점검일** 정규과정 학습 노트 하단에 참고 내용으로 컬러와 함께 정리해 달라는 요청.

## 변경

### 데이터 — `src/data/learningData.ts` (topic `reg-check-1`)
- Day4 기존 점검 내용(HTML/CSS/JS + 팀 회의 callout) **뒤에** 참고자료 섹션 추가.
- 추가 블록 구성(기존 `ContentSection` 타입만 사용 — `subtitle`/`text`/`items`/`table`/`code`/`callout`):
  - 도입 `callout(info)` — 업무형 프롬프트 7요소 개요.
  - **④ 수행 지시**: 본문 + `callout(warn)` 나쁜 지시 / `callout(tip)` 좋은 지시 + 6원칙 items + 업무별 예시 표 + [코드 2-8] 프롬프트.
  - **⑤ 출력 형식**: 6원칙 items + 산출물 유형별 출력 형식 표(7종) + [코드 2-9].
  - **⑥ 제약 조건**: 본문 + `callout(warn)` 위험 예 + 공통 제약 items + 업무별 제약 표 + [코드 2-10].
  - **⑦ 담당자 검수**: 검수 5범주 표 + `callout(tip)` + [코드 2-11].
  - **종합**: 7요소 통합 구조 code 블록 + `callout(tip)` 핵심 정리.

### "컬러셋" = callout 3색 (렌더러 `src/pages/Learning.tsx`의 `calloutColors`)
- `tip` 💡 초록(#10b981) / `warn` ⚠️ 빨강(#ef4444) / `info` ℹ️ 파랑(#3b82f6).

## 검증
- `npm run build` 통과. Learning 청크 683 kB(기존 대비 콘텐츠 증가분 반영).

## 배포 메모
- 정적 데이터 변경만 있어 DB/RLS 작업 불필요.
- 프론트 배포는 `npm run deploy`(gh-pages).
