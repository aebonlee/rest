# 2026-06-13 — 기술코칭 "Supabase 실전 패턴"에 비용 사고 대응 교안 신설

## 배경
기술코칭 부록의 **🛡️ Supabase 실전 패턴**(coach-supabase)은 그동안 로그인·RLS·Edge Function 키보호 등 "백엔드 없이 백엔드" 구축 패턴을 다뤘다. 여기에 실제 운영 중 발생한 **Supabase 한도 초과(Storage 212%) 사고를 경고 메일 수신부터 종결까지 복기한 사례 교안**을 3차 메뉴(`subSections`)로 추가했다. 비용·인프라 운영 감각은 학생 프로젝트가 경진대회·런칭으로 이어질 때 반드시 필요한 실전 역량이다.

## 변경

### 기술코칭 · Supabase 실전 패턴 하위 교안 신설 (`learningData.ts`)
- 기존 `coach-supabase`는 **개요**로 유지하고, 그 아래 `subSections` 배열을 신설하여 첫 하위 교안 추가.
- **💸 비용 사고 대응 — 한도 초과 경고에서 종결까지**(`coach-supabase-cost`): 난이도 중급 / 강의 40분 + 실습 30분.
  1. **학습 목표** — 유예 기간·UTC 마감 해석, 초과 항목 식별, 버킷별 SQL 추적, 처치 선택, 재발 방지 설계.
  2. **사건 개요(실화)** — grace period 마감 당일 경고 수신, 다중 사이트·런칭 임박 상황.
  3. **1단계 증상 읽기** — Usage 대시보드 5항목 수치표(Storage 212% 단일 초과) + 초과 항목별 대응 매트릭스. "진단 없는 처방은 없다".
  4. **2단계 흔한 혼동** — 로컬 디스크(`df -h`) ≠ 클라우드 Storage. 확인 위치 비교표.
  5. **3단계 원인 특정** — `storage.objects` 버킷별 용량 추적 SQL → 죽은 외주 프로젝트의 지면 PDF 버킷(441개/2025MB)이 범인.
  6. **4단계 처치 결정** — 결정 트리(살아있는 자산 vs 죽은 유산) + 안전 삭제 패턴(dry-run→청크 삭제→버킷 제거) + 삭제 원칙 3가지(service_role 키 보안 연계).
  7. **5단계 마감 계산** — 청구는 UTC 기준(KST +9h 여유), 유예 1회 소진 후 즉시 제한 규칙.
  8. **재발 방지 패턴 5종** — 스토리지 역할 분담 / 프로젝트 수명주기 / 비용 귀속 분리(org 분리) / 수익·실험 인프라 분리(Spend Cap) / 주기적 헬스체크.
  9. **사고 대응 체크리스트 9단계 + 실습 과제 3종(기초·응용·심화)** + 핵심 한 줄.
- 표 7개·코드블록 5개(bash/sql/text 트리/javascript/text 체크리스트)·콜아웃 6개로 구성. service_role 키 주의는 기존 "AI API Key 안전 수칙"과 상호 참조.

## 검증
- `npx tsc --noEmit` 통과(오류 0).
- `npm run build` 성공(Learning 청크 정상 빌드).
- `subSections` 렌더링은 기존 정규과정 일자별 상세와 동일 경로(Learning.tsx `hasSubSections`) 재사용 — 코칭 탭에서 3차 드롭다운으로 노출.

## 후속 — 푸터·메인페이지 갱신 (사이트 전체 맥락 유지)

### 푸터 바로가기 갱신 (`config/site.ts`)
- 기존 바로가기는 정보성 페이지(커리큘럼·일정·강사·자료)만 노출 → 학습 핵심 동선과 불일치.
- `footerLinks`에 학습 3개 과정(**선수과정·정규과정·기술코칭**)을 상단에 추가하고, 강사소개는 제외하여 6개로 정리. 모두 기존 라벨 키(`site.nav.prerequisite/regular/coaching`) 재사용 — Footer 컴포넌트 코드 변경 없음.

### 메인페이지 과정 카드 문구 갱신 (`config/curriculum.ts`)
- `coursePhases` 기술코칭 단계 description을 신설된 부록 교안 맥락에 맞게 갱신: "1:1/팀별 코칭 + 실전 부록 교안(Supabase 실전·키 보안·비용 사고 대응 등)". 영문 description도 동일 취지로 수정.
- Home 화면 구조·디자인은 그대로 두고 데이터 문구만 변경(데이터-화면 분리 원칙 유지).

## 후속 2 — 메인페이지 디자인 고도화 · 띄어쓰기 재검토

### 히어로 타이틀 크기 축소 (`styles/hero.css`)
- `.hero-title` 60px → **46px**(line-height 1.15→1.2, letter-spacing -0.03em→-0.02em, margin 24→20). 너무 크다는 피드백 반영.
- 반응형 동반 축소: 1024px 44→38 / 768px 36→32 / 480px 28→26.

### 경진대회 카드 재디자인 (`styles/site.css`, `Home.tsx`)
- 리스트 항목이 "딱 붙어 보기 안 좋다" → `.competition-card ul`을 **flex column + gap 12px**, 각 `li`를 **연한 회색 배경·좌측 파란 보더·라운드·체크와 텍스트 사이 gap 12px**의 카드형 행으로 변경 + hover(살짝 우측 이동·그림자).
- 카드 자체 폴리시: 상단 **accent-gradient 5px 바**(`::before`), 패딩·라운드 확대, h3 800 weight·자간 정리, 본문 p 줄간격/최대폭 정돈.
- 문구 정리: "국내 LLM 활용 가산점" → "국내 LLM 활용 시 가산점 부여".

### 히어로 정보 카드 hover 추가 (`styles/site.css`)
- `.hero-info-card`에 transition + hover(위로 3px·배경 약간 진하게)로 인터랙션 보강. 기존 글래스모피즘 톤 유지.

### 띄어쓰기 재검토 (`Home.tsx`, `Competition.tsx`)
- "6월 한달" → **"6월 한 달"**(Home 2곳·Competition 2곳 전부).
- "1개월 제공(...)" → "1개월 제공 (...)" 괄호 앞 공백 통일.
- "총 교육시간" → "총 교육 시간", "선수20H+정규52H+코칭8H" → "선수 20H + 정규 52H + 코칭 8H"(교육 기간/방식 등 다른 카드와 띄어쓰기 일관).
- Competition 하이픈 `-` → 전각 `—`(문장 부호 정돈).

## 영향 범위
- `src/data/learningData.ts`(콘텐츠 신설), `src/config/site.ts`(푸터 링크), `src/config/curriculum.ts`(메인 카드 문구), `src/pages/Home.tsx`·`src/pages/Competition.tsx`(문구·띄어쓰기), `src/styles/hero.css`·`src/styles/site.css`(히어로 크기·경진대회 카드·정보 카드 호버). 콘텐츠·문구·스타일 레이어 변경으로 컴포넌트 로직 변경 없음.
