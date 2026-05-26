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

## 11. 후속 작업: 학습평가 구조 변경 — 객관식 20문항으로 통일 (2026-05-27 동일자)

### 11-1. 변경 배경
사용자 요청: "학습평가 - 3가지 평가 방식에 단답식은 삭제하고 객관식 문항으로 20개로 변경해줘"

기존 구조(객관식 15 + 단답식 5 = 20)에서 단답식을 제거하고 **객관식 20문항으로 통일**. 자동 채점·표준화·OMR 친화성을 높이고 평가지 3종 간 동질성을 확보.

### 11-2. 수정 내용 (커밋 `22ab445`)

#### `src/data/assessmentData.ts`
- `ShortQuestion` 인터페이스 제거
- `AssessmentSet.short` 필드 제거
- 각 평가지에 신규 객관식 5문항 추가 (15 → 20)

#### `src/pages/Assessment.tsx`
- 단답식 섹션 전체 렌더링 제거
- 헤더 카운트: "객관식 N + 단답식 M개" → "객관식 N문항"

### 11-3. 신규 추가 문항 (각 평가지별 5문항)

#### 선수학습평가 (Day 1~4 대비)
| No | 영역 | 문제 핵심 |
|----|------|-----------|
| 16 | CSS Grid | `repeat(3, 1fr)`로 3열 그리드 작성 |
| 17 | JS falsy | `[]`는 truthy임을 식별 |
| 18 | React list | 배열 렌더링 시 `key` prop 필수 |
| 19 | Vite | 개발 서버 실행: `npm run dev` |
| 20 | 프롬프트 | 출력 스키마 명시(JSON + 키 지정) |

#### 진단평가 (Day 5~9)
| No | 영역 | 문제 핵심 |
|----|------|-----------|
| 16 | 라우팅 보호 | `AuthGuard` + `Navigate` 리다이렉트 패턴 |
| 17 | Supabase | 클라이언트 초기화 인자(URL, anon key) |
| 18 | LLM 응답 | `choices[0].message.content` JSON 경로 |
| 19 | 시스템 프롬프트 | "반드시 한국어로만 답하라" 등 명시적 제약 |
| 20 | 명명 규칙 | 이벤트 핸들러는 `onClick`처럼 `on*` |

#### 총괄평가 (Day 1~13 종합)
| No | 영역 | 문제 핵심 |
|----|------|-----------|
| 16 | Code Splitting | `Suspense` fallback UI |
| 17 | PRD | 문제·사용자·기능·LLM·MVP 범위 필수 |
| 18 | 배포 | `"deploy": "gh-pages -d dist"` 표준 |
| 19 | 보안 | `anon key` + RLS의 안전성 원리 |
| 20 | 발표 | 첫 슬라이드 = 서비스명 + 가치 제안 + 팀명 |

### 11-4. 빌드 & 배포
- `tsc -b --noEmit` 0 error
- `npm run deploy` Published ✓

---

## 12. 후속 작업: 출석관리 — 본 사이트 학생 + 유관기관 관리자 필터 (2026-05-27 동일자)

### 12-1. 문제 발견
사용자 보고: "대시보드의 출석관리도 현재 사이트 가입으로 학생들과 유관기관의 관리자로 한정해서 관리가되어야 해."

`AdminStudents`에서 발견한 것과 동일한 버그가 `AdminAttendance`에도 존재 — `from('user_profiles').select('*').order('name')` 전체 조회.

### 12-2. 요구 사항 해석
출석 대상 = **두 그룹 합집합**
1. **본 사이트 가입 학생**: `signup_domain = 'rest.dreamitbiz.com'`
2. **유관기관 관리자**: `role IN ('admin', 'superadmin')` — 사이트와 무관하게 운영진/강사진 포함

→ "유관기관"은 한신대학교 등 본 과정에 참여하는 외부 기관 인원과 운영사 임직원을 포괄. 가입처와 무관하게 admin/superadmin 권한 보유자를 모두 포함하는 방식이 가장 안전.

### 12-3. 수정 내용 (커밋 `a4eb6d1`)

#### 쿼리 변경
```ts
// Before — 전체 회원 노출
const [attRes, studRes] = await Promise.all([
  client.from(TABLES.attendance).select('*').eq('date', selectedDate),
  client.from('user_profiles').select('*').order('name'),
]);
if (studRes.data) setStudents(studRes.data as UserProfile[]);

// After — 본 사이트 학생 + 유관기관 관리자
const REST_HOSTNAME = new URL(site.url).hostname;
const STAFF_ROLES = ['admin', 'superadmin'];

const [attRes, signupRes, staffRes] = await Promise.all([
  client.from(TABLES.attendance).select('*').eq('date', selectedDate),
  client.from('user_profiles').select('*').eq('signup_domain', REST_HOSTNAME),
  client.from('user_profiles').select('*').in('role', STAFF_ROLES),
]);

// 중복 제거 + 정렬 (관리자 먼저, 그 다음 학생 — 이름순)
const merged = new Map<string, UserProfile>();
[...(signupRes.data || []), ...(staffRes.data || [])].forEach((u) => {
  merged.set(u.id, u);
});
const list = Array.from(merged.values()).sort((a, b) => {
  const aStaff = STAFF_ROLES.includes(a.role) ? 0 : 1;
  const bStaff = STAFF_ROLES.includes(b.role) ? 0 : 1;
  if (aStaff !== bStaff) return aStaff - bStaff;
  return (a.display_name || a.name || a.email || '').localeCompare(b.display_name || b.name || b.email || '');
});
```

#### UI 변경
- "구분" 컬럼 추가 — 총괄 관리자(주황 배지) / 관리자(주황 배지) / 학생(파랑 배지)
- 헤더에 안내 문구: "rest.dreamitbiz.com 가입 학생과 유관기관 관리자만 표시됩니다"
- 총 N명 카운터
- 빈 상태 메시지

### 12-4. 빌드 & 배포
- `tsc -b --noEmit` 0 error
- `npm run build` 성공 (3.73s)
- `npx gh-pages -d dist` Published ✓

### 12-5. 검증 체크리스트
- [x] 본 사이트에서 가입한 학생이 출석 대상에 포함
- [x] admin/superadmin 권한자는 가입처 무관하게 출석 대상에 포함
- [x] 중복 제거 (관리자가 본 사이트에서 가입한 경우 단 1행)
- [x] 관리자가 먼저 표시되고 학생이 그 아래에 이름순 정렬
- [x] 구분 배지로 학생/관리자 시각적 분리

### 12-6. 잠재적 후속 작업
- 강사진 페이지에 등록된 이메일과의 매칭(현재는 role 기반)
- 출석률 통계 화면 (강사·학생 별도)
- CSV 출석부 내보내기

### 12-7. 커밋 이력 (2026-05-27 추가분)
```
22ab445  feat(assessment): 단답식 제거 + 객관식 20문항으로 전환
a4eb6d1  fix(admin): 출석관리에 본 사이트 학생 + 유관기관 관리자 한정 필터 적용
```

---

## 13. 후속 작업: 학습노트 콘텐츠 전면 고도화 (2026-05-27 동일자)

### 13-1. 배경
사용자 요청: "선수과정, 정규과정의 각각의 콘텐츠 내용도 더 고도화시켜줘. 전문적으로 기술적으로 내용을 보강해서 학습자들의 학습노트로 제대로 활용할 수 있도록 해줘."

기존 `learningData.ts`는 일자별로 4~5줄짜리 학습 목표·키워드·실습 항목만 있어 강의 슬라이드 부속물 수준. 학습자가 **실제 학습노트(study note)**로 사용하기엔 코드 예시·비교 표·실전 패턴이 절대 부족.

### 13-2. 사전 작업 (이전 세션에서 완료)
| 파일 | 변경 |
|------|------|
| `src/data/learningData.ts` | `ContentSection`에 `code`·`table`·`callout` 필드 추가 |
| `src/pages/Learning.tsx` | 새 필드 렌더링 — 다크 테마 코드 블록 / 비교 표 / tip·warn·info 콜아웃 |

이 작업은 `5d154a6`/`d7a82bd` 커밋에 포함되어 있었으나 데이터 보강은 미완 상태로 종료. 본 작업에서 데이터를 채워 마무리.

### 13-3. 콘텐츠 보강 규모 (커밋 `588243b`)

| 항목 | Before | After |
|------|--------|-------|
| `learningData.ts` 라인 | ~280 | **2,130 (+1,938/-89)** |
| 코드 예시 블록 | 0 | **50+** (bash/TS/SQL/CSS/HTML/JSON) |
| 비교·요약 표 | 0 | **30+** |
| tip/warn/info 콜아웃 | 0 | **~25** |
| Learning 청크 크기 | 20.26 kB | **85.46 kB** (gzip 32.96 kB) |

### 13-4. 선수과정 (4일) 일자별 보강 내역

| Day | 주제 | 보강 핵심 |
|-----|------|-----------|
| 1 | AI/LLM 이해 | AI⊃ML⊃DL⊃LLM 위계 표 / Transformer 핵심 / 토큰화 메커니즘 / 6대 모델 비교(GPT-5/Claude/Gemini/Solar/HyperCLOVA X/EXAONE) / 4대 한계 |
| 2 | 프롬프트 엔지니어링 | R-C-I-F 4요소 표 + 실전 템플릿 / Zero·Few·CoT·Self-consistency 4패턴 / Few-shot 예시 / 한국어 작성 5원칙 / 안티패턴 표 |
| 3 | 국내 LLM 탐색 | 국내 4종 비교표 / Solar API 첫 호출(bash + TS 예제 2개) / 한국어 토큰 효율 실측표 / 경진대회 모델 선정 가이드 |
| 4 | 개발환경 세팅 | 도구 6종 체크리스트 / VS Code 추천 확장 8개 / Cursor·Claude Code·Copilot 비교 / Node 설치 검증 / Git 10개 명령 / PAT 발급 / .gitignore 표준 |

### 13-5. 정규과정 (13일) 일자별 보강 내역

| Day | 주제 | 보강 핵심 |
|-----|------|-----------|
| 1 | 바이브코딩 개론 | 전통 vs 바이브코딩 비교 / 도구 5종 선정 가이드 / 효과적 협업 5원칙 / 실패 패턴 5종 |
| 2 | HTML/CSS 기초 | 시맨틱 태그 7종 표 + HTML 예제 / 박스 모델 / Flexbox·Grid 코드 / Flexbox vs Grid 선정표 / 미디어 쿼리 표준 |
| 3 | JavaScript 기초 | var/let/const 비교표 / 함수 4가지 / ES6+ 3종 (Destructuring/Spread/Template) / 배열 메서드 5개 / 콜백→Promise→async-await 진화 / 병렬 vs 순차 |
| 4 | React 기초 | Component·Props·State 3대 개념표 / JSX 6대 규칙 / useState/useEffect 코드 / 의존성 배열 4케이스 / 리스트 key / 안티패턴 5종 |
| 5 | React 심화·라우팅 | React Router v6 API / Context API 코드 / AuthGuard 패턴 / React.lazy + Suspense / Context 사용 주의 |
| 6 | Supabase 백엔드 | Supabase vs Firebase 비교표 / 셋업 → Auth → CRUD → RLS(SQL) → Storage 풀세트 코드 |
| 7 | AI 서비스 설계 | PRD 8섹션 표 / 사용자 스토리 INVEST 원칙 + 예시 / MoSCoW 표 / AI 통합 아키텍처 ASCII 다이어그램 / Edge Function 보안 |
| 8 | LLM API 연동 | REST 기본 / Solar API 표준 호출 / messages 배열 패턴 / 핵심 파라미터 5종 표 / 스트리밍 응답 처리 / 재시도(지수 백오프) / 비용 계산식 |
| 9 | 프론트엔드 개발 | 디자인 토큰 CSS 변수 / Atomic Design 5단계 표 / 4가지 상태 UI(로딩/에러/빈/성공) / 모바일 퍼스트 / 터치 타깃 44px |
| 10 | 백엔드 연동 | React CRUD 코드 / Realtime 구독 / 파일 업로드 + 미리보기 / 폼 검증 분리표 / .env 환경별 분리 |
| 11 | 테스트·디버깅 | DevTools 4탭 표 / Network 활용 패턴 / React DevTools / Lighthouse 4지표 표 + 실행 / React 에러 5종 표 / AI 리뷰 프롬프트 |
| 12 | 배포·발표 준비 | Vite 빌드 흐름 / package.json 자동화 / CNAME 설정 / Vite base path / 배포 후 체크리스트 / 8슬라이드 발표 구성 표 |
| 13 | 최종 발표·평가 | 발표 시간 배분표(5분/10분) / 데모 시나리오 작성 예시 / 안정성 사전 점검 / 예상 질문 5종 + 답안 / 피어 리뷰 양식 / 출품 체크리스트 |

### 13-6. ContentSection 신규 필드 활용 예시

**코드 블록 (다크 테마)**:
```ts
code: { lang: 'typescript', content: '/* ... 50+ 코드 예시 ... */' }
```

**비교 표**:
```ts
table: {
  headers: ['모델', '제공사', '강점', '컨텍스트', '활용 포지션'],
  rows: [
    ['GPT-5', 'OpenAI', '범용 성능, 도구 사용', '~200K', '범용 챗·코드'],
    ['Claude Opus 4.7', 'Anthropic', '추론·코딩·긴 문맥', '1M', '에이전트·코딩'],
    /* ... */
  ],
}
```

**콜아웃 박스**:
```ts
callout: { type: 'warn', text: 'API 키를 절대 코드·커밋·프론트엔드에 직접 하드코딩하지 마세요...' }
```

### 13-7. 미변경 영역
기술코칭 4회차(`coachingTopics`)는 1:1 라이브 코칭 성격이라 학습노트로 사용될 가능성이 낮아 기존 구조 그대로 유지.

### 13-8. 빌드 & 배포
- `tsc -b --noEmit` 0 error
- `npm run build` 성공 (3.32s)
- Learning 청크 20kB → **85kB** (gzip 33kB) — 콘텐츠가 실제로 4배 이상 보강된 증거
- `npx gh-pages -d dist` Published ✓

### 13-9. 검증 체크리스트
- [x] 코드 블록이 다크 테마 + 가로 스크롤 + 언어 라벨로 정상 표시
- [x] 비교 표가 헤더·행 구분선·반응형으로 정상 표시
- [x] tip/warn/info 콜아웃이 색상 구분되어 강조
- [x] 사이드바에서 일자 클릭 시 즉시 전환 (기존 동작 유지)
- [x] 다크모드에서 코드/표/콜아웃 가독성 유지

### 13-10. 향후 개선 후보
- 일자별 학습 진도 체크 (Supabase rest_progress 테이블)
- 코드 블록 복사 버튼
- 표 정렬·필터링 (모델 비교 등)
- 학습노트 PDF 출력 기능
- 영문 번역본 (현재는 한국어만)

### 13-11. 커밋 이력 (2026-05-27 추가분)
```
588243b  feat(learning): 선수과정·정규과정 학습노트 콘텐츠 전면 고도화
```

---

**작성자**: Ph.D Aebon Lee (aebon@kyonggi.ac.kr)
**작업일**: 2026-05-27
**관련 사이트**: rest.dreamitbiz.com (AI Reboot Academy)
