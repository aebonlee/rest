# 2026-06-07 — 선수과정 사이드바: 부록 박스 그룹 구분선

## 배경
선수과정 메뉴에서 부록 3박스(파이썬·Gradio·Streamlit)가 Day 1~4와 한 덩어리로 보임.
"부록만 구분선" 방식으로 Day 1~4 아래, 부록 박스 앞에 구분선 하나를 넣어 그룹을 구분.

## 변경
- `src/data/learningData.ts`
  - `Topic`에 `dividerBefore?: boolean` 추가.
  - `pre-5-python`(파이썬 A to Z)에 `dividerBefore: true` 설정.
- `src/pages/Learning.tsx`
  - 사이드바 map에서 `tp.dividerBefore`면 항목 앞에 가로 구분선 + 가운데 '부록' 라벨 렌더.

## 검증
- `npm run build` 통과.

## 배포 메모
- UI + 정적 데이터 변경. main push → GitHub Actions 자동배포.
