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

## 9. 후속 작업: About(회사소개) 페이지 전면 재구성 (2026-05-27 동일자)

### 9-1. 문제 인식
- 기존 About 페이지가 단 1개 박스(제작의도) + 4개 Font Awesome 아이콘 카드 + 1개 푸터로 구성되어 정보량 부족
- **Font Awesome CSS가 `index.html`에 로드되어 있지 않아** `<i className="fa-solid fa-rocket">` 등 4개 아이콘이 모두 빈 박스로 표시됨
- 회사소개의 운영 주체·역할 맥락이 불명확 — "강사의 회사가 직접 운영하는 사이트"라는 핵심 정체성이 누락됨

### 9-2. 1차 수정 (커밋 `ac5b1a3`)
- Font Awesome 의존 제거 → Unicode 이모지로 전환 (🚀 💻 🏆 🤝 / 📧 📞 💬 🌐 / 📘 ⚡ 🎯 / 🔗)
- 콘텐츠 7배 보강: 미션 박스 / 주요특징 4종 / 교육 프로그램 3종(80H) / 4단계 제작 방식 / 운영사 카드 / 연락처 카드 / 패밀리 사이트 / 저작권
- `site.company`(사업자번호·통신판매번호·주소·카카오 등) 자동 표시

### 9-3. 2차 수정 (커밋 `4e3b046`) — 운영 주체 명확화
사용자 피드백: "회사소개는 강사의 소속회사이고, 이 과정을 운영하는데 있어 회사 대표로 강사로 참여하기 때문에 사이트를 만든 것"

→ 일반 회사 마케팅 톤 → **"강사(이애본 박사)가 대표인 회사가 본 과정 운영을 위해 직접 만든 사이트"** 프레임으로 전면 재구성

#### 새 페이지 구성
| # | 섹션 | 핵심 메시지 |
|---|------|-------------|
| 1 | ABOUT THIS SITE | 본 사이트는 강사의 회사가 직접 운영합니다 |
| 2 | 총괄 책임교수 / 운영사 대표 | 이애본 박사 프로필 카드 (한신대 겸임 + DreamIT Biz 대표), 강사진 페이지로 링크 |
| 3 | 왜 강사가 직접 사이트를 만들었나 | 3대 이유 (🧑‍🏫 직접 운영 / 📚 살아있는 교재 / 🤝 종료 후 지속) |
| 4 | 강사의 소속 회사 | DreamIT Biz 소개 + 사업 영역 4종 (🎓 대학·기관 / 🏢 기업 / 🌐 플랫폼 / 📝 콘텐츠) |
| 5 | 회사 정보 / 문의 | "대표자(본 과정 책임교수 겸직)", "이메일(강사 직통)" 등 라벨 조정 |
| 6 | 회사가 운영하는 다른 교육 사이트 | 운영 신뢰성 근거 (패밀리 사이트) |
| 7 | 저작권 푸터 | "본 사이트는 {대표} 대표(총괄 책임교수)가 직접 설계·운영합니다" |

### 9-4. 변경 파일
| 파일 | 변경 |
|------|------|
| `src/pages/About.tsx` | 1차 +332/-44, 2차 +173/-154 — 두 차례 전면 재작성 |

### 9-5. 빌드 & 배포
- `tsc -b --noEmit` 0 error
- `npm run build` 성공 (3.42s)
- `npx gh-pages -d dist` Published ✓

### 9-6. 검증 체크리스트
- [x] 4개 아이콘이 실제 이모지로 정상 표시 (Font Awesome 의존 제거)
- [x] 운영 주체 = 강사 회사라는 점이 페이지 상단·하단에 명시
- [x] 강사 프로필이 별도 카드로 강조되고 강사진 페이지로 연결
- [x] 회사 정보 자동 연동 (`site.config.ts` 변경 시 페이지 자동 반영)
- [x] 모든 텍스트가 다크모드 변수(`var(--text-primary/secondary/muted)`)와 호환

### 9-7. 커밋 이력 (2026-05-27)
```
fe57431  feat: 학습평가 메뉴 추가 + About 드롭다운 통합
ac5b1a3  feat(about): 회사소개 페이지 콘텐츠 보강 + 아이콘 이모지 전환
4e3b046  refactor(about): 강사 소속 회사 + 직접 운영 맥락으로 재구성
```

---

## 10. 후속 작업: 관리자 수강생 관리 필터링 버그 수정 (2026-05-27 동일자)

### 10-1. 문제 발견
사용자 보고: "관리자모드에 수강생관리는 rest 사이트에서 가입한 회원만 관리가 되어야지 전체 회원을 보여주면 어떻게"

### 10-2. 원인 분석
| 위치 | 코드 | 문제 |
|------|------|------|
| `src/pages/admin/AdminStudents.tsx:15` | `client.from('user_profiles').select('*').order(...)` | 사이트 필터 없이 전체 회원 조회 |
| Supabase 스키마 | `user_profiles`는 91개 사이트가 공유하는 **글로벌 테이블** | 필터 없으면 모든 사이트 가입자 노출 |
| 대조군: `AdminDashboard.tsx:24` | `.like('visited_sites', '%rest.dreamitbiz.com%')` | 통계는 이미 필터링하고 있었음 — Students 페이지만 누락 |

`user_profiles`에는 두 가지 사이트 식별 컬럼이 존재:
- `signup_domain` (text): 최초 가입한 사이트 hostname
- `visited_sites` (text[]): 접속 이력이 있는 사이트 hostname 배열

`AuthContext.tsx:54`에서 가입 시 `window.location.hostname`을 `signup_domain`에 저장 → **"가입자"는 `signup_domain` 기준, "방문자"는 `visited_sites` 기준**으로 명확하게 구분 가능.

### 10-3. 수정 내용 (커밋 `5d154a6`)

#### `src/pages/admin/AdminStudents.tsx`
- `site.url`에서 hostname 동적 추출 (`new URL(site.url).hostname` → `'rest.dreamitbiz.com'`)
- 기본 필터: `signup_domain = 'rest.dreamitbiz.com'` (사용자 요구사항)
- 토글 추가: "본 사이트 가입자" / "본 사이트 방문자(visited_sites contains)"
- 키워드 검색 (이름·이메일·전화) 추가
- 가입처 컬럼 추가, 카운터(N명/전체 X명) 표시, 빈 상태 메시지 추가

#### 쿼리 변경 비교
```ts
// Before — 전체 회원 노출
const { data } = await client
  .from('user_profiles')
  .select('*')
  .order('last_sign_in_at', { ascending: false });

// After — 본 사이트 가입자만 (기본)
const REST_HOSTNAME = new URL(site.url).hostname;
const query = client
  .from('user_profiles')
  .select('*')
  .order('last_sign_in_at', { ascending: false });

if (scope === 'signup') {
  query.eq('signup_domain', REST_HOSTNAME);
} else {
  query.contains('visited_sites', [REST_HOSTNAME]);
}
const { data } = await query;
```

### 10-4. 부수 작업
`src/data/learningData.ts` — `ContentSection` 타입에 `code`/`table`/`callout` 필드 추가
- 이전 작업에서 Learning 렌더러는 새 필드 지원으로 업데이트했지만 타입 정의는 누락된 상태였음
- 빌드 통과를 위해 타입 확장 — 기존 콘텐츠 렌더링에는 영향 없음 (모두 optional)
- 추후 "학습노트 콘텐츠 고도화" 작업의 사전 준비

### 10-5. 변경 파일
| 파일 | 변경 |
|------|------|
| `src/pages/admin/AdminStudents.tsx` | 전면 재작성 (+138/-22) |
| `src/data/learningData.ts` | ContentSection 타입 확장 (+3 lines) |
| `src/pages/Learning.tsx` | (선행 작업) 새 섹션 타입 렌더링 추가 |

### 10-6. 빌드 & 배포
- `tsc -b --noEmit` 0 error
- `npm run build` 성공 (3.22s)
- `npx gh-pages -d dist` Published ✓

### 10-7. 검증 체크리스트
- [x] 기본 진입 시 본 사이트 가입자만 표시 (signup_domain 필터)
- [x] "본 사이트 방문자" 토글로 visited_sites 포함 조회 가능
- [x] 키워드 검색 정상 동작
- [x] 가입처 컬럼이 signup_domain 값을 표시
- [x] 검색 결과 0건 / 가입자 0명 시 명확한 빈 상태 메시지
- [x] AdminDashboard 통계와의 차이(가입자 vs 방문자) 사용자에게 안내함

### 10-8. 잠재적 후속 작업 (선택)
- `AdminDashboard.tsx`의 수강생 카운트도 `signup_domain` 기준으로 통일 (현재는 `visited_sites` like 사용)
- 회원 상세 보기 모달 / 회원 차단·승급 액션 (`role` 변경)
- CSV 내보내기 (수강생 명단 다운로드)

### 10-9. 커밋 이력 (2026-05-27 추가분)
```
5d154a6  fix(admin): 수강생 관리에 본 사이트 가입자 필터 적용
```

---

**작성자**: Ph.D Aebon Lee (aebon@kyonggi.ac.kr)
**작업일**: 2026-05-27
**관련 사이트**: rest.dreamitbiz.com (AI Reboot Academy)
