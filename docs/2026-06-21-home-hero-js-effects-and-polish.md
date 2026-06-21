# 메인 히어로 JS 효과 + 홈 디자인 보강

날짜: 2026-06-21

## 배경
메인 홈 히어로는 정적 CSS 파티클(랜덤 위치 20개)만 있고 JS 인터랙션이 없었다.
히어로에 마우스 반응형 효과를 더하고, 홈 전체에 등장 애니메이션·호버 등 디자인 요소를 보강해 완성형으로 마감한다.

## 추가/변경
### 1) 히어로 인터랙티브 JS 효과 — `src/components/HeroParticles.tsx` (신규)
- `<canvas>` 파티클 네트워크(별자리): 입자 표류 + 가까운 입자끼리 선 연결.
- 마우스 인터랙션: 커서가 입자를 부드럽게 밀어내고(repel), 커서와 가까운 입자에 선이 이어짐.
- 커서 스포트라이트: 커서를 따라다니는 radial 빛 번짐(`.hero-spotlight`, JS가 `--mx/--my` 갱신).
- 성능/접근성/정리: devicePixelRatio 상한 2, 면적 비례 입자 수(상한 90), `prefers-reduced-motion`이면 정지 1프레임,
  언마운트 시 rAF 취소 + 리스너 해제. 포인터 이벤트는 부모 `.hero`에서 수신(배경 레이어는 pointer-events:none).

### 2) 스크롤 등장 애니메이션 — `src/hooks/useScrollReveal.ts` (신규)
- IntersectionObserver로 `.reveal` 요소가 뷰포트 진입 시 `.is-visible` 부여(1회). reduce-motion이면 즉시 노출.
- `Home.tsx`에서 호출하고 섹션 헤더/카드에 `reveal` + `--reveal-delay`(스태거) 부여.

### 3) 디자인 폴리시 — `src/styles/home-polish.css` (신규), `src/styles/hero.css` (보강)
- `.reveal` 페이드+상승 트랜지션.
- 섹션 제목 그라데이션 언더라인, 과정/예시/혜택 카드 호버 상승·강조선, 타임라인 마커 글로우/펄스,
  히어로 정보카드 글래스(blur), 대회 카드 호버.
- 히어로 타이틀 `.highlight` 그라데이션 흐름 애니메이션(`highlight-shine`), 히어로 콘텐츠 진입 애니메이션(`hero-rise`).
- `src/index.css`에 `home-polish.css` import 추가.

### 4) `Home.tsx`
- 정적 CSS 파티클 div 20개 → `<HeroParticles />`로 교체.
- `useScrollReveal()` 호출, 섹션 헤더·카드에 `reveal`/스태거 적용.

## 검증
- `npx tsc --noEmit` 통과 / `npm run build` 통과.
- 모든 효과는 `prefers-reduced-motion`에서 비활성화(정지)되도록 처리.
