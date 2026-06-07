# 2026-06-07 — 선수과정 5번째 박스(부록) 추가: 파이썬 & 데모앱

## 배경
선수과정 학습노트 박스 1~4(Day 1~4) 외에 부록 박스 하나를 추가하고,
페이지별로 ① 파이썬 A to Z ② 그라이디오 Tip! ③ 스트림릿 Tip! 내용을 정리해 달라는 요청.

## 변경 — `src/data/learningData.ts` (prerequisiteTopics)
- pre-4 뒤, 배열 끝에 새 토픽 `pre-5` 추가 (title: '🐍 파이썬 & 데모앱 (Gradio·Streamlit)').
- 박스 개요 content: 3페이지 안내 표 + tip/info callout.
- subSections 3페이지(페이지별 = 3차 메뉴):
  - `pre-5-python` 파이썬 A to Z: 변수·자료구조 4종(표)·제어문·함수·pip·파일/예외·클래스·AI 라이브러리(표) + 코드 예제 다수.
  - `pre-5-gradio` 그라이디오 Tip!: 설치·최소예제·Interface vs Blocks(표)·컴포넌트·ChatInterface·팁·share 주의.
  - `pre-5-streamlit` 스트림릿 Tip!: 설치·실행(streamlit run)·위젯(표)·레이아웃·캐싱/세션·무료 배포.
- 기존 선수과정 박스엔 subSections가 없었으나, Learning 렌더러는 subSections를 지원하므로 새 박스만 아코디언으로 펼쳐짐.

## 검증
- `npm run build` 통과. pre-5 + 3개 subSection id 확인.

## 배포 메모
- 정적 데이터만 변경. main push → GitHub Actions 자동배포.
