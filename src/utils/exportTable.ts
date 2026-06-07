/**
 * ============================================================================
 * 파일 개요: 표(table) 데이터 내보내기 유틸리티
 * ============================================================================
 *
 * [이 파일이 하는 일 — 쉬운 말로]
 *  화면에 보이는 "표"(엑셀처럼 행과 열로 된 데이터)를 사용자가
 *  파일로 저장하거나 인쇄할 수 있게 변환해 주는 도구 모음입니다.
 *  지원 형식은 3가지입니다.
 *   · Excel(.xlsx) : 진짜 엑셀 파일을 만들어 다운로드
 *   · PDF(인쇄)    : 새 창을 열고 인쇄 대화상자에서 "PDF로 저장"을 유도
 *   · Word(.doc)   : HTML로 만든 워드 문서를 다운로드
 *
 * [왜 이런 파일이 필요한가?]
 *  웹사이트에서 본 표를 사용자가 보고서나 자료로 쓰려면 파일로 가져갈 수
 *  있어야 합니다. 이 작업을 매번 화면마다 새로 짜면 중복이 생기므로,
 *  공통 함수로 모아두고 어디서든 호출해서 재사용합니다.
 *
 * [초보자가 알아두면 좋은 배경 용어]
 *  - 브라우저 단독 동작: 서버에 요청을 보내지 않고, 사용자의 브라우저
 *    안에서만 파일을 만들어 냅니다. (백엔드/네트워크 필요 없음)
 *  - Blob(Binary Large Object): 파일 같은 "데이터 덩어리"를 메모리에
 *    담아두는 자바스크립트 객체입니다. 이걸 다운로드 링크에 연결합니다.
 *  - 동적 import(await import(...)): 코드를 "필요할 때 그 순간에만"
 *    불러오는 방법. 무거운 라이브러리를 처음부터 전부 로드하지 않고,
 *    실제로 그 기능을 쓸 때만 내려받아 첫 화면 로딩을 빠르게 합니다.
 *  - HTML 이스케이프: <, >, & 같은 특수문자를 그대로 넣으면 화면이
 *    깨지거나(또는 악성 코드 삽입) 위험할 수 있어, 안전한 표현으로
 *    바꿔주는 처리입니다. (예: < → &lt;)
 *
 * [한글이 안 깨지게 하는 전략 — 형식마다 다름]
 *  - Excel: SheetJS 라이브러리가 셀 문자열을 안전하게 처리해 줍니다.
 *  - PDF  : 새 창 HTML에 한글 폰트를 지정하고 브라우저 인쇄 기능을 씁니다.
 *  - Word : 파일 맨 앞에 UTF-8 BOM을 붙여 워드가 인코딩을 올바로 인식하게 합니다.
 *
 * [TypeScript 개념 한 줄 설명]
 *  TypeScript는 "값의 종류(타입)"를 미리 정해두는 자바스크립트 확장판입니다.
 *  예) string(문자열), number(숫자), void(반환값 없음),
 *      Promise<void>(비동기로 끝나는, 결과값 없는 작업).
 *
 * [이 파일이 외부에 제공(export)하는 것]
 *  - type Cell            : 셀(한 칸)에 들어갈 수 있는 값의 타입
 *  - exportTableExcel()   : 실제 .xlsx 파일 생성(SheetJS 동적 로드)
 *  - exportTablePdf()     : 인쇄 창을 띄워 "PDF로 저장" 유도
 *  - exportTableWord()    : HTML 기반 .doc 파일 다운로드
 */

// [타입 정의] 표의 한 칸(셀)에는 "문자열" 또는 "숫자"만 들어갈 수 있게 제한합니다.
//  · '|'는 "또는(union)"을 뜻합니다. 즉 Cell = string 이거나 number.
//  · 이렇게 타입을 좁혀두면 실수로 객체/배열 같은 엉뚱한 값을 넣을 때
//    편집기가 미리 경고해 줍니다.
export type Cell = string | number;

// [헬퍼 함수 esc] HTML에 값을 안전하게 끼워 넣기 위한 "이스케이프" 처리기.
//  무엇을: 특수문자(& < > ")를 HTML 엔티티로 바꿔서 화면 깨짐과
//          코드 삽입(XSS) 위험을 막습니다.
//  왜:    사용자 데이터에 '<script>' 같은 글자가 있으면 그대로 HTML에
//          들어갈 때 위험하므로, 문자 그대로 "보이게만" 바꿔줍니다.
//  매개변수 s: 무엇이든(unknown) 받을 수 있게 해두고 내부에서 문자열로 변환.
//  반환값: 안전하게 변환된 문자열.
const esc = (s: unknown): string =>
  // String(s ?? '') : 값이 null 또는 undefined면 '' (빈 문자열)로 대체한 뒤 문자열화.
  //  · '??'는 "널 병합 연산자". 왼쪽이 null/undefined일 때만 오른쪽 값 사용.
  //    (주의: 0이나 '' 같은 값은 그대로 둡니다. '||'와 다른 점!)
  String(s ?? '')
    // 주의: '&'를 "반드시 가장 먼저" 바꿔야 합니다.
    //  만약 < 를 &lt; 로 바꾼 뒤에 &를 처리하면, 방금 만든 &lt;의 &까지
    //  다시 &amp;lt; 로 이중 변환되어 망가집니다. 그래서 & → < → > → " 순서.
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // 정규식 /"/g 설명: 따옴표(")를 찾되, 끝의 'g'(global)는 "모든 곳을 다" 바꾸라는 뜻.
    //  (g가 없으면 첫 번째 하나만 바뀝니다.)
    .replace(/"/g, '&quot;');

// [헬퍼 함수 downloadBlob] 메모리에 만든 데이터 덩어리(Blob)를 실제 파일로 저장시키기.
//  무엇을: 화면에 보이지 않는 임시 <a>(링크) 태그를 만들어 클릭을 흉내내,
//          브라우저가 다운로드를 시작하게 합니다.
//  왜:    브라우저에는 "이 데이터를 파일로 저장해" 라는 직접 명령이 없어서,
//          링크 클릭이라는 우회 방법을 표준처럼 사용합니다.
//  매개변수: blob(저장할 데이터), filename(저장될 파일 이름)
//  반환값: 없음(void). 부수효과로 "다운로드"가 일어납니다.
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob); // 메모리상의 Blob을 가리키는 임시 URL(blob:...) 생성
  const a = document.createElement('a'); // <a> 태그를 코드로 새로 만든다(화면엔 아직 없음)
  a.href = url; // 그 임시 URL을 링크 주소로 지정
  // download 속성: "이 링크를 누르면 페이지 이동 말고 '다운로드' 해" 라는 표시.
  //  주의: 이 속성이 없으면 브라우저가 새 탭으로 열어버려 다운로드가 안 됩니다.
  a.download = filename;
  document.body.appendChild(a); // 일부 브라우저는 문서에 붙어 있어야 click()이 동작하므로 추가
  a.click();   // 사용자가 클릭한 것처럼 동작시켜 다운로드 시작
  a.remove();  // 역할이 끝난 임시 링크를 화면(DOM)에서 제거
  // 주의(엣지케이스): 임시 URL을 너무 "즉시" 해제하면 일부 브라우저에서
  //  다운로드가 시작되기 전에 끊겨 실패합니다. 그래서 1초 뒤에 해제하여
  //  쓰던 메모리를 정리합니다(메모리 누수 방지).
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * [함수 exportTableExcel] 진짜 엑셀(.xlsx) 파일을 만들어 다운로드한다.
 *
 *  무엇을: 헤더(열 제목)와 행 데이터를 받아 SheetJS 라이브러리로
 *          엑셀 시트를 만들고, 그대로 파일로 저장합니다.
 *  왜 async(비동기)인가:
 *          엑셀 라이브러리('xlsx')를 "동적 import"로 그 순간에 내려받기
 *          때문입니다. 다운로드가 끝날 때까지 기다려야(await) 해서
 *          함수 전체를 async로 선언합니다.
 *          (async 함수는 항상 Promise를 반환합니다 → 반환 타입 Promise<void>)
 *  매개변수:
 *    - filename : 저장될 파일 이름 (예: "명단.xlsx")
 *    - sheetName: 엑셀 안의 시트(탭) 이름
 *    - columns  : 열 제목들의 배열 (표의 첫 줄)
 *    - rows     : 각 행을 셀 배열로 담은 2차원 배열 (Cell[][])
 *  반환값: Promise<void> — 끝나면 그냥 완료될 뿐, 돌려주는 값은 없음.
 *  부수효과: 파일 다운로드.
 */
export async function exportTableExcel(
  filename: string,
  sheetName: string,
  columns: string[],
  rows: Cell[][],
): Promise<void> {
  // 동적 import: 'xlsx'(SheetJS)를 "지금 이 순간에만" 불러옵니다.
  //  · await = "이 작업이 끝날 때까지 잠시 기다린 뒤 다음 줄로" 라는 뜻.
  //  · 엑셀 기능은 (이 앱에선) 관리자만 쓰는 무거운 기능이라, 모든 사용자에게
  //    처음부터 로드시키지 않고 필요할 때만 받게 해 첫 로딩 속도를 지킵니다.
  const XLSX = await import('xlsx');
  // aoa_to_sheet = "Array Of Arrays(2차원 배열) → 워크시트" 변환.
  //  [columns, ...rows] : 첫 줄에 헤더(columns)를 놓고, 그 뒤에 rows를 펼쳐 이어붙임.
  //  · '...rows'의 '...'는 "전개(spread)" — 배열 안의 항목들을 낱개로 펼쳐 넣습니다.
  //    결과적으로 [헤더줄, 1행, 2행, ...] 형태의 한 덩어리 배열이 됩니다.
  const ws = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  // 열 너비를 내용 길이에 맞춰 대략 자동 조절합니다. (안 하면 글자가 잘려 보일 수 있음)
  //  · map: 각 열(c)과 그 위치(i)를 돌면서 새 설정 객체로 바꿔 새 배열을 만듭니다.
  ws['!cols'] = columns.map((c, i) => {
    // 이 열에서 "가장 긴 글자 수"를 찾습니다: 헤더 길이 vs 모든 행의 i번째 셀 길이.
    //  · String(r[i] ?? '') : 비어 있는 칸(null/undefined)은 ''로 처리해 length 계산 오류 방지.
    //  · '...rows.map(...)' : 각 행에서 구한 길이들을 펼쳐서 Math.max에 한꺼번에 전달.
    const maxLen = Math.max(c.length, ...rows.map((r) => String(r[i] ?? '').length));
    // wch = 너비 단위(글자 수 기준). 너무 좁지 않게 최소 8, 너무 넓지 않게 최대 40으로
    //  "클램프(범위 안으로 가두기)"하고, 보기 좋게 여유 +2를 더합니다.
    //  · Math.max(8, ...)로 하한, Math.min(40, ...)로 상한을 동시에 둡니다.
    return { wch: Math.min(40, Math.max(8, maxLen + 2)) };
  });
  const wb = XLSX.utils.book_new(); // 비어 있는 새 워크북(엑셀 파일 한 권) 생성
  // 워크북에 방금 만든 시트를 추가. sheetName.slice(0, 31)로 31자까지만 사용.
  //  · 주의: 엑셀 규칙상 시트 이름은 최대 31자라서 잘라줍니다(안 자르면 오류 가능).
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  // writeFile: 워크북을 실제 파일로 만들고 다운로드까지 SheetJS가 한 번에 처리.
  XLSX.writeFile(wb, filename);
}

// [헬퍼 함수 tableHtml] 열/행 데이터를 <table> HTML 문자열로 변환(PDF·Word가 함께 사용).
//  무엇을: columns로 표 머리(thead), rows로 표 본문(tbody)을 만들어 하나의
//          <table> 문자열로 합칩니다.
//  왜:    PDF용 인쇄 창과 Word 문서 둘 다 "표 HTML"이 필요하므로, 같은 코드를
//          두 번 쓰지 않도록 함수로 빼서 재사용합니다.
//  주의:  모든 셀 값은 반드시 esc()로 감싸 안전하게(이스케이프) 넣습니다.
const tableHtml = (columns: string[], rows: Cell[][]): string => {
  // 헤더 한 줄: 각 열 제목 c를 <th>로 감싸고 join('')으로 사이 구분자 없이 이어 붙임.
  const thead = `<tr>${columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>`;
  // 본문: 각 행 r마다 <tr>을 만들고, 그 안에서 각 셀 c를 <td>로 감싸 한 줄로 합침.
  //  · 바깥 map은 "행" 단위, 안쪽 map은 "셀" 단위 — 2차원 배열을 두 번 도는 구조.
  const tbody = rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
    .join('');
  // 머리와 본문을 하나의 완성된 <table> 문자열로 묶어 반환.
  return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
};

/**
 * [함수 exportTablePdf] 새 창을 열어 인쇄 대화상자를 띄우고, 사용자가 "PDF로 저장"하게 한다.
 *
 *  무엇을: 표를 담은 완전한 HTML 페이지를 새 창에 그린 뒤, 자동으로 인쇄
 *          대화상자를 띄웁니다. 사용자가 거기서 "PDF로 저장"을 고르면 됩니다.
 *  왜 이 방식인가:
 *          브라우저의 인쇄 기능은 시스템 한글 폰트를 그대로 쓰므로 한글이
 *          전혀 깨지지 않습니다. (별도 PDF 라이브러리보다 안전하고 가벼움)
 *  매개변수:
 *    - title    : 문서 제목(맨 위 큰 글씨)
 *    - columns  : 열 제목 배열
 *    - rows     : 행 데이터(2차원 배열)
 *    - subtitle : (선택) 부제목. '?'가 붙으면 "없어도 되는" 선택 매개변수라는 뜻.
 *  반환값: void(없음). 부수효과: 새 창을 열고 인쇄 대화상자를 띄움.
 */
export function exportTablePdf(
  title: string,
  columns: string[],
  rows: Cell[][],
  subtitle?: string,
): void {
  // 새 빈 창(탭)을 엽니다. 첫 인자 ''는 "아직 주소 없음", '_blank'는 "새 창에".
  //  · 주의: 브라우저가 팝업을 차단하면 win은 null이 됩니다(창이 안 열림).
  const win = window.open('', '_blank');
  if (!win) {
    // 엣지케이스 처리: 팝업이 막혀 창이 없으면, 안내 메시지를 띄우고 함수를 끝냅니다.
    //  · 여기서 return 하지 않으면 아래에서 null인 win을 다루다 에러가 납니다.
    alert('팝업이 차단되어 있습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도하세요.');
    return;
  }
  // 새 창의 문서에 "완전한 HTML 페이지" 전체를 한 번에 써넣습니다.
  //  핵심 포인트:
  //   · lang="ko" + 한글 폰트(맑은 고딕) 지정 → 한글이 제대로 표시됩니다.
  //   · 모든 동적 값(title, subtitle 등)은 esc()로 감싸 안전하게 삽입.
  //   · 맨 아래 <script>는 페이지 로드 후 잠깐(250ms) 뒤 window.print()를 자동 호출.
  //  주의(아주 중요): 문자열 안에서 '</script>'를 그대로 쓰면 HTML 파서가
  //   "여기서 스크립트 끝!"으로 오해해 버립니다. 그래서 '<\/script>'처럼
  //   슬래시를 이스케이프해 파서가 조기 종료하지 않게 합니다.
  //  (아래는 하나의 긴 백틱 문자열입니다 — 출력이 바뀌므로 내부에 주석을 넣지 않습니다.)
  win.document.write(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title>
    <style>
      *{font-family:'Malgun Gothic','맑은 고딕',sans-serif;}
      body{margin:32px;color:#111;}
      h1{font-size:20px;margin:0 0 4px;}
      .sub{color:#555;font-size:13px;margin:0 0 16px;}
      table{border-collapse:collapse;width:100%;font-size:13px;}
      th,td{border:1px solid #999;padding:6px 10px;text-align:left;}
      th{background:#f0f0f0;}
      @media print{body{margin:12mm;} .noprint{display:none;}}
    </style></head><body>
    <h1>${esc(title)}</h1>${subtitle ? `<p class="sub">${esc(subtitle)}</p>` : ''}
    ${tableHtml(columns, rows)}
    <p class="noprint" style="margin-top:16px;color:#888;font-size:12px;">
      인쇄 대화상자에서 <b>대상: PDF로 저장</b>을 선택하면 PDF로 받을 수 있습니다.</p>
    <script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
    </body></html>`,
  );
  // document.close(): "문서 작성 끝!" 신호. 이걸 호출해야 onload가 동작해
  //  위 스크립트의 window.print()(인쇄 대화상자)가 실행됩니다.
  win.document.close();
}

/**
 * [함수 exportTableWord] HTML로 만든 워드 문서(.doc)를 다운로드한다.
 *
 *  무엇을: 표를 담은 HTML을 만들되, 마이크로소프트 오피스가 인식하는
 *          특수 표시를 넣어 워드가 .doc 파일로 열도록 합니다.
 *  왜 이 방식인가:
 *          진짜 .docx(복잡한 바이너리)를 만드는 대신, 워드가 "HTML도 문서로
 *          열어주는" 점을 이용합니다. 구현이 단순하고 한글도 정상 표시됩니다.
 *  매개변수:
 *    - filename : 저장될 파일 이름
 *    - title    : 문서 제목
 *    - columns  : 열 제목 배열
 *    - rows     : 행 데이터(2차원 배열)
 *    - subtitle : (선택) 부제목
 *  반환값: void(없음). 부수효과: .doc 파일 다운로드.
 */
export function exportTableWord(
  filename: string,
  title: string,
  columns: string[],
  rows: Cell[][],
  subtitle?: string,
): void {
  // 워드 문서로 인식시키기 위한 HTML을 조립합니다.
  //  · 맨 앞의 xmlns:o / xmlns:w (오피스 네임스페이스)가 있으면 워드가
  //    "이건 워드 문서구나" 하고 .doc로 열어 줍니다.
  //  · '+'로 여러 문자열 조각을 이어 붙여 하나의 긴 HTML 문자열을 만듭니다.
  //  (아래 백틱 문자열 내부에는 주석을 넣지 않습니다 — 넣으면 출력에 섞입니다.)
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><title>${esc(title)}</title>
    <style>
      body{font-family:'Malgun Gothic',sans-serif;}
      h1{font-size:18px;} .sub{color:#555;font-size:12px;}
      table{border-collapse:collapse;width:100%;}
      th,td{border:1px solid #888;padding:5px 9px;text-align:left;font-size:12px;}
      th{background:#eee;}
    </style></head><body>
    <h1>${esc(title)}</h1>${subtitle ? `<p class="sub">${esc(subtitle)}</p>` : ''}
    ${tableHtml(columns, rows)}
    </body></html>`;
  // Blob(데이터 덩어리)을 만듭니다. 배열의 첫 요소 '﻿'는 눈에 안 보이는 UTF-8 BOM 문자입니다.
  //  · BOM(Byte Order Mark): 파일 맨 앞에 붙는 "이 파일은 UTF-8 인코딩이에요" 표시.
  //  · 이게 없으면 워드가 한글을 다른 인코딩으로 잘못 읽어 글자가 깨질 수 있습니다.
  //  · type 'application/msword'는 "이 데이터는 워드 문서"라는 MIME 형식 표시.
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  // 파일 이름이 이미 '.doc'로 끝나면 그대로, 아니면 '.doc'를 붙여서 다운로드합니다.
  //  · 삼항 연산자(조건 ? A : B): 조건이 참이면 A, 거짓이면 B 값을 사용.
  downloadBlob(blob, filename.endsWith('.doc') ? filename : `${filename}.doc`);
}
