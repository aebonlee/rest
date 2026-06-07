/**
 * 표 데이터 내보내기 — Excel(.xlsx) / PDF(인쇄) / Word(.doc)
 *  · 한글 안전: Excel은 xlsx 셀 문자열, PDF는 브라우저 폰트, Word는 UTF-8 BOM HTML
 *  · Excel은 관리자 전용이라 메인 번들 부담을 줄이려 동적 import 사용
 *
 * [역할/책임]
 *  - 화면의 표 형태 데이터(열 헤더 + 행 배열)를 사용자가 다운로드/인쇄할 수 있는
 *    파일 포맷으로 변환한다. (브라우저 단독, 서버 의존 없음)
 *  - 각 포맷별로 한글 깨짐을 막기 위한 별도 전략을 사용한다.
 *
 * [주요 export]
 *  - type Cell            : 셀 값 타입(문자열 또는 숫자)
 *  - exportTableExcel()   : 실제 .xlsx 파일 생성(SheetJS 동적 로드)
 *  - exportTablePdf()     : 인쇄 창을 띄워 "PDF로 저장" 유도
 *  - exportTableWord()    : HTML 기반 .doc 파일 다운로드
 */

// 셀에 들어갈 수 있는 값 타입 — 문자열 또는 숫자만 허용
export type Cell = string | number;

// HTML 인젝션/깨짐 방지용 이스케이프 헬퍼
//  · null/undefined는 빈 문자열로 치환(?? '') 후 문자열화
//  · &는 반드시 가장 먼저 치환해야 다른 엔티티의 &가 이중 인코딩되지 않음
const esc = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Blob을 파일로 다운로드시키는 공통 헬퍼
//  · 임시 <a> 엘리먼트를 만들어 click()으로 다운로드 트리거 후 즉시 제거
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob); // 메모리상의 Blob을 가리키는 임시 URL 생성
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // download 속성이 있어야 새 탭 이동이 아닌 다운로드로 동작
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 다운로드가 시작될 시간을 준 뒤 임시 URL 해제(메모리 누수 방지) — 즉시 해제하면 일부 브라우저에서 실패
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** 실제 .xlsx 파일 생성 (SheetJS 동적 로드) */
export async function exportTableExcel(
  filename: string,
  sheetName: string,
  columns: string[],
  rows: Cell[][],
): Promise<void> {
  // 'xlsx'(SheetJS)를 동적 import — 관리자만 쓰는 무거운 의존성이므로 메인 번들에서 분리
  const XLSX = await import('xlsx');
  // 헤더 행 + 데이터 행들을 2차원 배열(AOA) 형태로 시트로 변환
  const ws = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  // 열 너비 자동(대략) — 헤더/내용 중 최대 길이 기준
  ws['!cols'] = columns.map((c, i) => {
    // 해당 열의 헤더 길이와 모든 행 셀 길이 중 최댓값 계산(빈 셀은 ''로 처리)
    const maxLen = Math.max(c.length, ...rows.map((r) => String(r[i] ?? '').length));
    // 너무 좁거나(8) 너무 넓지(40) 않도록 클램프, 여유분 +2
    return { wch: Math.min(40, Math.max(8, maxLen + 2)) };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // 시트명 31자 제한
  XLSX.writeFile(wb, filename); // 파일 생성 + 다운로드까지 SheetJS가 처리
}

// 열/행 데이터를 <table> HTML 문자열로 변환(PDF·Word 공용)
//  · 모든 셀 값은 esc()로 이스케이프하여 안전하게 삽입
const tableHtml = (columns: string[], rows: Cell[][]): string => {
  const thead = `<tr>${columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>`;
  const tbody = rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
};

/** 인쇄 창을 열어 "PDF로 저장" 가능하게 (한글 완벽) */
export function exportTablePdf(
  title: string,
  columns: string[],
  rows: Cell[][],
  subtitle?: string,
): void {
  // 새 창 열기 — 팝업 차단되면 win이 null
  const win = window.open('', '_blank');
  if (!win) {
    // 엣지케이스: 팝업 차단 시 사용자에게 안내 후 중단
    alert('팝업이 차단되어 있습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도하세요.');
    return;
  }
  // 새 창에 완전한 HTML 문서를 작성 — lang="ko"와 한글 폰트 지정으로 한글 표시 보장
  //  · 마지막 <script>는 onload 시 약간의 지연 후 window.print() 자동 호출
  //  · </script>를 문자열 내부에서 닫으면 파서가 조기 종료하므로 <\/script>로 이스케이프
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
  win.document.close(); // 문서 작성 종료 → onload 트리거되어 인쇄 대화상자 표시
}

/** Word(.doc) 다운로드 — HTML 기반(.doc로 열림, 한글 정상) */
export function exportTableWord(
  filename: string,
  title: string,
  columns: string[],
  rows: Cell[][],
  subtitle?: string,
): void {
  // MS Office 네임스페이스를 포함한 HTML — Word가 .doc로 인식해 열도록 구성
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
  // 첫 요소 '﻿'는 UTF-8 BOM — Word가 인코딩을 UTF-8로 인식해 한글이 깨지지 않게 함
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  // 파일명에 .doc 확장자가 없으면 붙여서 다운로드
  downloadBlob(blob, filename.endsWith('.doc') ? filename : `${filename}.doc`);
}
