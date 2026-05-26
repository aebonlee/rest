# rest.dreamitbiz.com — 학습평가 메뉴 추가 및 메뉴 구조 개편 (2026-05-27)

## 1. 작업 개요
- **사이트**: rest.dreamitbiz.com (쉬었음청년 AI교육 / AI Reboot Academy)
- **로컬**: D:\dreamit-web\rest
- **GitHub**: https://github.com/aebonlee/rest
- **베이스 커밋**: cec758b (feat: add About page with site-specific content)
- **작업 목적**:
  1. 상단 네비게이션의 중복된 "회사소개 / About" 메뉴를 단일 About 드롭다운으로 통합
  2. 기술코칭 옆에 신규 "학습평가" 드롭다운 추가 (선수학습평가 · 진단평가 · 총괄평가)
  3. 정규과정(Day 1~13) 기준 객관식 15 + 단답식 5 문항 × 3세트(총 60문항) 출제

## 2. 변경 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/config/site.ts` | menuItems 재구성 — About 통합, 학습평가 추가 |
| `src/utils/translations.ts` | `site.nav.assessment / assessmentPre / assessmentDiag / assessmentSum` 한·영 추가 |
| `src/data/assessmentData.ts` | **신규** — 3개 평가 세트, 총 60문항 |
| `src/pages/Assessment.tsx` | **신규** — URL `/assessment/:type`로 평가지 렌더링 |
| `src/layouts/PublicLayout.tsx` | Assessment lazy 임포트 + 라우트 등록 |

## 3. 메뉴 구조 변경 (Before → After)

### Before
```
[회사소개] [About▾ (커리큘럼/일정표/강사소개)] [선수과정] [정규과정] [기술코칭] [경진대회] ...
```
- `nav.about` (회사소개) 단독 링크 + `site.nav.about` (About) 드롭다운이 따로 노출되어 중복 인상

### After
```
[About▾ (회사소개/커리큘럼/일정표/강사소개)] [선수과정] [정규과정] [기술코칭] [학습평가▾] [경진대회] ...
```
- About 단일 드롭다운으로 통합 — 첫 항목이 `/about` (기존 회사소개 페이지)
- 기술코칭 직후에 학습평가 신규 드롭다운

### site.ts 핵심 diff
```ts
menuItems: [
  {
    labelKey: 'site.nav.about',
    path: '/about',
    activePath: '/about',
    dropdown: [
      { path: '/about', labelKey: 'nav.about' },          // 회사소개
      { path: '/curriculum', labelKey: 'site.nav.curriculum' },
      { path: '/schedule', labelKey: 'site.nav.schedule' },
      { path: '/instructor', labelKey: 'site.nav.instructor' },
    ]
  },
  { path: '/learning/prerequisite', labelKey: 'site.nav.prerequisite' },
  { path: '/learning/regular',      labelKey: 'site.nav.regular' },
  { path: '/learning/coaching',     labelKey: 'site.nav.coaching' },
  {
    labelKey: 'site.nav.assessment',
    path: '/assessment/prerequisite',
    activePath: '/assessment',
    dropdown: [
      { path: '/assessment/prerequisite', labelKey: 'site.nav.assessmentPre' },
      { path: '/assessment/diagnostic',   labelKey: 'site.nav.assessmentDiag' },
      { path: '/assessment/summative',    labelKey: 'site.nav.assessmentSum' },
    ]
  },
  { path: '/competition', labelKey: 'site.nav.competition' },
  ...
]
```

## 4. 학습평가 신규 페이지 사양

### 라우트
- `/assessment` → `prerequisite`로 리다이렉트
- `/assessment/prerequisite` — 선수학습평가
- `/assessment/diagnostic` — 진단평가
- `/assessment/summative` — 총괄평가

### Assessment.tsx 주요 기능
- 3개 평가 사이를 이동할 수 있는 탭 (정규과정 진입 단계별 시각화)
- 평가 메타 정보 박스: 평가 범위 / 제한 시간 / 합격 기준 / 문항 수
- **"정답 보기" 토글 버튼** — 객관식은 정답 보기 시 보기 강조, 단답식은 정답 표시
- 객관식 15문항 / 단답식 5문항을 카드 UI로 분리 렌더링
- 다크모드 / 5색 컬러 테마 변수(`var(--primary-blue, ...)`) 반영

### assessmentData.ts 자료 구조
```ts
export type AssessmentType = 'prerequisite' | 'diagnostic' | 'summative';

export interface AssessmentSet {
  type: AssessmentType;
  title: string;
  subtitle: string;
  description: string;
  duration: string;        // '40분' / '50분' / '60분'
  passingScore: number;    // 60 / 70 / 80
  mcq: MCQuestion[];       // 15
  short: ShortQuestion[];  // 5
}
```

## 5. 평가 문항 출제 범위 (정규과정 Day 1~13)

| 평가 | 범위 | 시간 | 합격 |
|------|------|------|------|
| 선수학습평가 | Day 1~4 (바이브코딩 개론·HTML/CSS·JS·React 기초) | 40분 | 60점 |
| 진단평가 | Day 5~9 (React 심화·Supabase·AI 서비스 설계·LLM API·프론트엔드) | 50분 | 70점 |
| 총괄평가 | Day 1~13 종합 (배포·발표·평가 기준 포함) | 60분 | 80점 |

### 문항 유형 분포 (각 세트별 동일)
- 객관식 4지선다 × 15
- 단답식 × 5
- 총 60문항 (3세트 × 20)

### 핵심 출제 영역 (총괄평가 기준)
- AI 코딩 에이전트 한계와 협업 패턴
- Supabase 환경변수·RLS·CRUD 패턴
- PRD / MVP 정의
- LLM 할루시네이션·스트리밍·temperature/max_tokens
- Chrome DevTools / React DevTools / Lighthouse
- GitHub Pages 배포 (`gh-pages`, `CNAME`)
- AI 리부트 경진대회 평가 기준 (문제 해결력 30% / 국내 LLM 활용도 25% 등)

## 6. 빌드 & 배포

### 빌드 결과
```
✓ built in 3.54s
dist/assets/Assessment-CV2y4EBm.js  17.74 kB │ gzip:  7.05 kB
dist/assets/index-PEdig-IT.js      476.67 kB │ gzip: 142.12 kB
```
- TypeScript 0 error
- `npm run build` 성공
- `npx gh-pages -d dist`로 GitHub Pages 배포 완료

### 배포 URL
- https://rest.dreamitbiz.com/assessment/prerequisite
- https://rest.dreamitbiz.com/assessment/diagnostic
- https://rest.dreamitbiz.com/assessment/summative

## 7. 검증 체크리스트
- [x] TypeScript `tsc -b --noEmit` 통과
- [x] Vite 프로덕션 빌드 통과
- [x] About 드롭다운에 4개 하위 항목 표시 (회사소개/커리큘럼/일정표/강사소개)
- [x] 학습평가 드롭다운에 3개 하위 항목 표시
- [x] `/assessment` → `/assessment/prerequisite` 리다이렉트
- [x] 정답 보기 토글이 객관식/단답식 모두 동작
- [x] 한·영 번역 키 모두 추가

## 8. 향후 작업 (선택)
- 평가 결과를 Supabase `rest_assessments` 테이블에 저장 (현재는 클라이언트 표시만)
- 객관식 채점·점수 계산 기능 (현재는 학습 보조용 정답 토글)
- 문항 무작위 셔플 옵션
- 시험 시간 카운트다운 타이머

---

**작성자**: Ph.D Aebon Lee (aebon@kyonggi.ac.kr)
**작업일**: 2026-05-27
**관련 사이트**: rest.dreamitbiz.com (AI Reboot Academy)
