# 2026-06-11 — 기술코칭 부록 확충 · 선수과정 실습예제 · 학습 UI 개선

## 배경
정규과정 Day 14 강의흐름 재편을 시작으로, **기술코칭 영역에 실전 부록 자료**를 대거 신설하고 1~4회차 학습노트를 고도화했다.
이어 **선수과정의 파이썬·Gradio·Streamlit** 토픽에 복붙 실행 가능한 실습예제를 추가하고, 코드 가독성을 위한 **렌더링 개선(주석 녹색·자동 줄바꿈)** 과 **학습 네비게이션 개선(점검일 책갈피·정규과정 전/후반 탭)** 을 함께 진행했다.

## 변경

### 1. 정규과정 Day 14 강의흐름 재편 (`learningData.ts`, `690d2be`)
- 강의흐름 시간표 4교시 → 정리: 1교시 빌드·배포 / 2교시 마무리 / **3교시 NotebookLM 실습** / **4교시 팀·개인 프로젝트 총정리**.
- "다음 시간 예고" 앞에 NotebookLM 실습 + 프로젝트 총정리 콘텐츠 섹션 삽입.

### 2. 기술코칭 부록 신설 + 1~4회차 고도화 (`learningData.ts`)
- **🔑 AI API Key 안전 수칙**(coach-key): 키 본질·운영방식·금지3·.env/.gitignore·Edge Function 구조·저장위치 등급표·사고 행동수칙·Claude Code 지시문·셀프체크 (9절). 부록 그룹 구분선(`dividerBefore`).
- **🛠️ Claude Code 활용 설계서**(coach-claude): 스킬·훅·리뷰명령/모델전략·플러그인·서브에이전트·Remote Control·로드맵. (ahp-basic 언급은 일반화, 개인기기 폴드6 → 보편 표현)
- **☀️ Claude Code와 일하는 하루**(coach-daily): 7습관 + 한 장 요약.
- **🚀 배포·버그 119**(coach-deploy): HTTP 상태코드 기초(2xx~5xx 표) + 자주 막히는 10가지(증상→원인→해결) + 디버깅 3원칙.
- **🏆 경진대회 출품 가이드**(coach-contest): 제출물·8슬라이드·3분 데모·예상 Q&A·루브릭 자가채점표.
- **🇰🇷 국산 LLM 선택 가이드**(coach-llm): Solar·HyperCLOVA X·EXAONE 비교·가점 전략.
- **🛡️ Supabase 실전 패턴**(coach-supabase): 소셜 로그인·RLS·Edge Function 키보호·함정.
- **1~4회차 학습노트 고도화**: 아키텍처 5기준·레이어 점검표 / 상태별 화면 4개·마이크로카피 / 프롬프트 4요소·JSON 강제 코드 / D-1 점검·발표 직전 5분.
- 문구 수정: 키수칙 1·7·마무리 문장, 마무리 메시지 정비.

### 3. Day 7 보강 (`learningData.ts`)
- MoSCoW에 영어 원문 표기(Must·Should·Could·Won't have).
- MVP Scope 날짜 5월 22일 → **6월 22일** 정정.
- "AI 통합 아키텍처" ASCII 다이어그램 → **SVG 벡터 도식**으로 교체(React→Edge Function→Solar 흐름, 색상 구분).

### 4. 선수과정 실습예제 추가 (`learningData.ts`)
- **파이썬 A to Z·그라이디오 Tip!·스트림릿 Tip!** 각 토픽에 `subSections`로 실습예제 **5개씩(총 15개)** 신설.
- 모두 복붙해 **Colab/VS Code 실행 가능**, 단계별 한글 주석 포함, API 예제는 키 안전수칙 연계.
- 1차(간단) → 피드백 반영 **상세화·주석 보강**(2차).

### 5. 학습 UI/렌더링 개선 (`Learning.tsx`)
- **코드 주석 녹색 강조**: `renderCode`/`commentStart` 추가 — 언어별 주석기호(`#`/`--`/`//`) 인식, 문자열 내부 제외.
- **기술코칭 코드블록 자동 줄바꿈 + 줄간격 확대**: `CodeBlock`에 `wrap` 옵션(phase=coaching에만 `pre-wrap`·lineHeight 2.1).
- **정규과정 점검일(1·2차) 스크롤+책갈피**: reg-check-* 토픽을 별도 하위페이지 → 한 페이지 스택, 사이드바 하위메뉴는 앵커 스무스 스크롤(책갈피).
- **정규과정 좌측 메뉴 전/후반 탭**: 일자>10일 때 상단에 전반부/후반부 2탭, 절반씩 표시(실제 Day 범위 라벨, 오늘 속한 절반으로 초기화).

## 렌더링
- 신규 콘텐츠는 기존 `renderSection` 블록(subtitle/text/items/code/table/callout/svg) 재사용.
- 주석 녹색·줄바꿈·책갈피·전후반 탭은 `Learning.tsx` 내 처리(신규 의존성 없음).

## 검증
- 각 단계 `npm run build`(tsc + vite) 통과 — 타입 에러 0.
- 기술코칭 11개 토픽(4회차 + 부록 7종) 정합, callout 타입 전부 유효(info/tip/warn).
- 커밋 범위: `690d2be` … `8fd5b1f` (main push, GitHub Actions 자동배포).

## 비고 (후속 검토 가능)
- Day 14 "다음 시간 예고" 본문에 "Day 13 — 마지막 날" 잔존 문구(일자 표기 불일치 가능) — 필요 시 정정.
