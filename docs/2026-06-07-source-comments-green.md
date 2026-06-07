# 2026-06-07 — 전체 소스 상세 주석 + 주석 녹색 표시

## 요청
개발폴더 전체 소스코드에 ① 주석을 녹색으로 ② 상세 주석 추가.

## ① 주석 녹색 — `.vscode/settings.json`
- editor.tokenColorCustomizations(comments + textMateRules)와 semanticTokenColorCustomizations로
  주석을 #22c55e(녹색)로 강제. 이 폴더를 VS Code로 열면 테마 무관 녹색 주석.

## ② 상세 주석 — 코드 파일 79개(데이터 대형 3개 제외)
- 파일 상단 블록 주석(역할·책임·주요 export) + 함수/컴포넌트/훅 설명 + 비자명 로직 인라인 주석.
- 코드는 변경하지 않고 주석만 추가(한국어).
- 진행: 다중 에이전트 workflow로 67개 처리(백그라운드 Write 권한 간헐 거부로 3회 분할),
  나머지 12개는 메인 세션에서 직접 작성.

## 검증
- 변경 파일 79개 = 대상 전체, 누락 0.
- 라인 손실 0(모든 파일 라인 증가/유지).
- git diff 삭제 코드줄 382개 전부 추가줄에 동일 재등장(주석만 부착, 코드 변경 0).
- `npm run build`(tsc 포함) 통과.

## 비고
- `.claude/settings.local.json`(workflow Write 허용용)은 .gitignore로 커밋 제외.

## 배포
- 주석은 빌드 시 제거되어 산출물 동일. main push → GitHub Actions 자동배포.
