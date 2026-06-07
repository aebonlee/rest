# 2026-06-07 — Day4 학습 노트에 인터랙티브 색상환·컬러 팔레트 추가

## 배경
앞서 추가한 "업무형 프롬프트 7요소" 참고자료 아래에, **색상환·컬러 팔레트** 참고 섹션 요청.
요구: 색상 칩을 **클릭하면 HEX 코드가 복사**되는 인터랙티브 형태.

## 변경

### 타입 — `src/data/learningData.ts`
- `ContentSection`에 `colorPalette?: boolean` 필드 추가(인터랙티브 팔레트 렌더 플래그).
- Day4(`reg-check-1`) content 맨 아래에 `🎨 색상환 · 컬러 팔레트` subtitle + 안내 text + `{ colorPalette: true }` 블록 추가.

### 렌더러 — `src/pages/Learning.tsx`
- `ColorChip`(클릭→`navigator.clipboard` 복사, execCommand 폴백, 휘도 기반 가독 텍스트색 `readableText`).
- `ColorPalette` 컴포넌트:
  - 12색상환 카테고리(난색/한색/중성) 컬러 박스.
  - 기본 12색 팔레트(Red~Pink).
  - 톤 9단계(50~900) — Blue/Green/Red/Gray (Tailwind 값).
  - 배색 방법 카드(보색/유사색/삼각/단색).
  - 시멘틱 컬러(Success/Info/Warning/Error).
  - 색 도구 링크 7종 + 팁 callout.
- `renderSection`에 `{section.colorPalette && <ColorPalette />}` 분기 추가.

## 검증
- `npm run build` 통과.

## 배포 메모
- 정적 데이터/컴포넌트만 변경. main push → GitHub Actions 자동배포.
