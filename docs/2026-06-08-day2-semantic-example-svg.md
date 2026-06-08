# 2026-06-08 — 정규과정 Day 2(HTML/CSS 기초) 시맨틱 HTML 예시에 구조 SVG 추가

## 배경
정규과정 **Day 2 · HTML/CSS 기초**의 "**시맨틱 HTML 예시**" 코드(header·nav·main·article·footer로 구성한 예시) 아래 형식에 대한 시각 자료 요청.
학습자가 **코드의 중첩 구조 → 페이지 영역 배치**를 한눈에 매핑할 수 있도록 SVG 다이어그램 포함.

## 변경

### `src/data/learningData.ts` — `reg-day2`(Day 2 · HTML/CSS 기초)
- "시맨틱 HTML 예시" 코드 블록(`<!doctype html> … </html>`) **바로 아래**에 `{ svg: … }` 블록 추가.
- 추가한 SVG는 위 예시 코드와 1:1 대응:
  - `<body>` 외곽 컨테이너
  - `<header>`(파랑) 안에 `<h1> AI Reboot Academy` + `<nav>`(인디고, 링크 칩: 소개 / 커리큘럼)
  - `<main>`(초록) 안에 `<article>` → `<h2> 국내 LLM 활용 가이드` + `<p> Solar API…`
  - `<footer>`(보라) — `<p> © 2026 DreamIT Biz`
- 색상 팔레트는 기존 deep-dive "시맨틱 레이아웃 한눈에 보기" SVG와 동일 계열로 통일.
- 하단에 `tip` callout 추가(중첩 구조 설명).

## 렌더링
- `Learning.tsx`의 기존 `section.svg` → `dangerouslySetInnerHTML` 분기로 렌더(신규 코드 없음).

## 검증
- `npm run typecheck` 통과.
- `npm run build` 통과(기존 chunk size 경고만, 무관).
