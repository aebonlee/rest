# 2026-06-13 — 이모지 → Font Awesome 전환 · 네비 폰트 체계 통일

## 배경
사이트 전반의 장식 이모지를 **Font Awesome 아이콘**으로 통일해 달라는 요청. 다만 콘텐츠
데이터(`learningData.ts` 등)에는 이모지가 문자열로 1,800줄+ 박혀 있고, 그중 **화살표(→ ← 1,400회+)·
체크박스(☐ 446회)** 등은 다이어그램/체크리스트의 구조 문자라 변환하면 깨진다. 그래서 1,811줄을
직접 고치는 대신 **중앙 매핑 + 렌더 시점 자동 치환** 구조를 채택했다.

## 도입 방식 — React 컴포넌트 패키지
- `@fortawesome/{fontawesome-svg-core, free-solid-svg-icons, free-brands-svg-icons, react-fontawesome}` 설치.
- `main.tsx`에서 코어 CSS를 직접 import + `config.autoAddCss = false`로 아이콘 FOUC(거대 깜빡임) 방지.

## 핵심 — `src/utils/emojiIcon.tsx` (신규)
- **이모지 → FA 매핑 테이블**(약 90종): 📚→book, 🎯→bullseye, 🚀→rocket, 🔧→wrench, 🎓→graduation-cap,
  ⚠→triangle-exclamation, ✅→square-check, 💡→lightbulb, 🛡→shield-halved, 👩‍🏫→chalkboard-user … 등.
- **미매핑 문자는 원본 그대로 렌더**(→ ☐ ★ 한글·flag 등 안전 보존). "진단 없는 변환은 없다" 원칙.
- 제공 API:
  - `<EmojiIcon char="📚" />` — 단일 이모지(없으면 원문 문자열 반환).
  - `withIcons("📚 학습목표")` — 문자열 속 장식 이모지만 FA로 치환한 ReactNode.
- 정규식은 **키 길이 내림차순 정렬**로 ZWJ 조합(👩‍🏫)을 단일 이모지(👩)보다 먼저 매칭 → 부분매칭 방지.
- 변형 선택자(U+FE0F)는 매칭 시 함께 흡수.

## 렌더 사이트 연결(데이터는 그대로, 표현만 치환)
- **Learning.tsx**: 콘텐츠 렌더러의 subtitle·text·items·표 헤더/셀·callout 텍스트를 `withIcons()`로,
  토픽/하위섹션 아이콘·제목을 `EmojiIcon`/`withIcons`로. (코드블록은 제외 — 원문 유지)
- **Home.tsx**: 히어로 정보 아이콘(📅⏱💻🏆)·과정 카드 아이콘(`phase.icon`).
- **Competition.tsx**: 카드 제목(📋🎁🤖)·LLM 카드(☀💬✨🧠).
- **AdminSidebar·ProjectSidebar·MyPage·Instructor**: 메뉴/링크 아이콘 필드 및 인라인 이모지.
- `styles/site.css`: `.svg-inline--fa` 정렬·`.fa-inline` 간격(색은 currentColor 상속 → 주변 텍스트와 일관).

## 네비게이션 폰트 체계 통일 (`styles/navbar.css`)
- 기존: 상단 `.nav-link` 15px/600 vs 하위 `.dropdown-menu li a` **16px**(두께 미지정) → 하위가 더 커서 위계 역전.
- 변경: 하위 드롭다운을 **14.5px / 500 / line-height 1.5**로 — 상단에 종속되는 한 단계 작고 가벼운 통일 체계.
  데스크톱·모바일(반응형) 동일 적용.

## 검증
- `npx tsc --noEmit` 통과, `npm run build` 성공.
- SSR 렌더 테스트로 동작 확인:
  - `📚 → 다음 ☐ 박스 ⚠️ 완료` → `[FA:book] → 다음 ☐ 박스 [FA:triangle-exclamation] …`
    (장식 이모지만 변환, **화살표·체크박스 원본 보존** 확인).
  - `🔧 → [FA:wrench]`, `👩‍🏫 → [FA:chalkboard-user]`, 미매핑 `🍜 → 🍜`(원본 유지).

## 후속 — 메인 히어로 아이콘 정돈
- 히어로 정보 카드 아이콘(📅⏱💻🏆 → FA)이 흰 글리프로 밋밋해, **42px 원형 배지**(반투명 배경·테두리) 안에
  18px 아이콘으로 담아 정돈. 카드 hover 시 배지 배경도 함께 진해지도록 연동. 모바일은 36px/16px.

## 영향 범위
- 신규: `src/utils/emojiIcon.tsx`. 수정: `main.tsx`, `pages/{Learning,Home,Competition,MyPage,Instructor}.tsx`,
  `components/{AdminSidebar,ProjectSidebar}.tsx`, `styles/{site,navbar}.css`, `package.json`(FA 의존성).
- 데이터 파일(learningData 등)은 **무수정** — 렌더 시점 치환이라 콘텐츠는 그대로.
