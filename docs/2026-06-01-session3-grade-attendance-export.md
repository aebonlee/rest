# 개발일지 — 성적표·출결일지 다운로드 + 관리자 명단 제외 (2026-06-01, 3차)

- **사이트**: rest.dreamitbiz.com (AI Reboot Academy / 쉬었음)
- **배포**: `npm run deploy`(gh-pages)

관리자(총괄관리자·백진주)를 학습평가/출석 명단에서 제외하고, 성적표·출결일지를 파일로 내려받는 기능 추가.

---

## 1. 공용 내보내기 유틸 `src/utils/exportTable.ts`
- `exportTableExcel(filename, sheet, columns, rows)` — 실제 `.xlsx`. SheetJS(`xlsx@0.18.5`)를 **동적 import** → 관리자가 버튼 누를 때만 로드(별도 청크 429KB, 메인 번들 무영향). 한글 셀 정상, 열너비 자동.
- `exportTablePdf(title, columns, rows, subtitle)` — 새 창에 인쇄용 HTML 후 `window.print()` → "PDF로 저장". 한글 폰트 임베드 불필요(브라우저 폰트), 의존성 0.
- `exportTableWord(filename, title, columns, rows, subtitle)` — `application/msword` + UTF-8 BOM HTML Blob → `.doc` 다운로드. Word에서 한글 정상.

## 2. AdminGrades — 관리자 제외 + 성적표 다운로드
- **제외**: 기존 역할 필터(`admin`/`superadmin`)에 더해 **`ADMIN_EMAILS` 이메일도 제외** → 백진주·운영자 계정이 성적 명단에서 빠짐(순수 수강생만)
- **다운로드**: `선수평가 성적표`·`사후평가 성적표` 각각 **[Excel]·[PDF]** 버튼
  - 컬럼: 이름 / 이메일 / 점수 / 합격여부 / 정답수 / 총문항 / 응시일시 (동일인 통합·최고점 반영)
  - 미응시자는 "미응시"로 표기, 부제에 합격기준·인원·발행일

## 3. AdminAttendance — 관리자 제외 + 일자별 출결일지 다운로드
- **제외**: 기존엔 총괄관리자(superadmin)를 출결표에 합쳐 표시했으나, 요청에 따라 **총괄관리자 + 백진주(ADMIN_EMAILS) 모두 제외** → 수강생만
- **다운로드**: 날짜 선택 옆에 **[Word]·[PDF]** 버튼 — 선택한 날짜의 출결일지
  - 컬럼: 이름 / 이메일 / 체크인 / 출결상태 (동일인 통합)
  - 파일명 `출결일지_YYYY-MM-DD`, 부제에 대상 인원·발행일

## 4. 의존성
- `xlsx@0.18.5` 추가(dependencies). 동적 import라 admin 외 페이지엔 영향 없음.

---

## 비고
- PDF는 팝업 차단 시 안내 alert 후 중단 → 브라우저 팝업 허용 필요.
- Word(.doc)는 HTML 기반이라 Word에서 열면 표로 정상 표시(진짜 .docx 바이너리는 아님 — 편집·인쇄 무방).
