# 2026-06-07 — 선수과정 부록: 드롭다운→독립 3박스 전환 + 학습내용 3~5배 심화

## 배경
1) 직전에 만든 'pre-5(파이썬 & 데모앱)' 1박스+드롭다운(subSections)을 Day1~4처럼 **독립 박스 3개**로.
2) 각 박스 학습내용을 현재 정리본에 **추가로, 전문가 수준이되 초보자 학습용으로 3~5배** 보강.

## 변경 — `src/data/learningData.ts` (prerequisiteTopics)

### 구조: pre-5 박스(드롭다운) → 독립 top-level 박스 3개
- `pre-5-python` 파이썬 A to Z
- `pre-5-gradio` 그라이디오 Tip!
- `pre-5-streamlit` 스트림릿 Tip!
- 각 subSection의 `summary` → Topic 타입에 맞게 `description`으로 변경. 박스 개요(wrapper) 제거.

### 내용 3~5배 심화(전문가→초보 학습자용)
- 파이썬(~280줄): 연산자표·문자열 슬라이싱/메서드·컴프리헨션·반복제어·가변인자/람다·표준라이브러리·예외(else/finally/raise)·클래스 상속/특수메서드·venv/requirements·자주하는 실수표·디버깅/타입힌트·미니실습·리소스.
- Gradio(~165줄): 실행환경 3종·Interface 다중입출력/examples·Blocks 이벤트(.click)·컴포넌트 카탈로그·LLM 챗봇(키 보안)·HF Spaces 배포·오류표·미니실습.
- Streamlit(~195줄): 실행모델(rerun) 이해·위젯 카탈로그·탭/expander/columns·dataframe/차트·파일업로드+pandas·캐싱(data vs resource)·session_state 콜백·secrets·배포·오류표·Gradio vs Streamlit 선택표·미니실습.

## 검증
- `npm run build` 통과. 박스 3개 + 심화 섹션 3 + 미니실습 3 확인.

## 배포 메모
- 정적 데이터만 변경. main push → GitHub Actions 자동배포.
