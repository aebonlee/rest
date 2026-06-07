# 2026-06-07 — Day5(React 기초)·Day6(React 심화) 보강

## 배경
Day 5·6이 React 기초/심화로 나뉘어 있으나,
- Day 5: "React를 이해"하고 "바이브코딩으로 셋업을 시작"하는 핵심 정리 요청
- Day 6: 실무에서 사용하는 예시 보강 요청

## 변경 — `src/data/learningData.ts`

### Day 5 (reg-4) — 학습 목표 뒤, '3대 개념' 앞에 추가
- 🧠 React를 한눈에 이해하기: "UI = f(state)" 멘탈 모델 + 명령형 vs 선언형 비교표 + 3줄 요약.
- 🚀 바이브코딩으로 셋업: Vite 생성 bash + AI 셋업 프롬프트 예시(text) + 동작 확인 warn callout.
- 프로젝트 폴더 구조 표 + 셋업 검증 체크리스트.

### Day 6 (reg-5) — '현장 노트' 앞에 "🏢 실무에서 바로 쓰는 React 패턴" 추가
- ① 데이터 패칭 커스텀 훅(useFetch, 로딩·데이터·에러 + cleanup)
- ② 4가지 상태 UI 렌더 패턴 + tip
- ③ 중첩 라우트 + 공통 레이아웃(Outlet)
- ④ 역할 기반 접근 제어(RoleGuard)
- ⑤ 환경변수로 키 다루기(import.meta.env) + 노출 주의 warn

## 검증
- `npm run build` 통과.

## 배포 메모
- 정적 데이터만 변경. main push → GitHub Actions 자동배포.
