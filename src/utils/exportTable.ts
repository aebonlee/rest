/**
 * 표 데이터 내보내기 — Excel(.xlsx) / PDF(인쇄) / Word(.doc)
 *  · 한글 안전: Excel은 xlsx 셀 문자열, PDF는 브라우저 폰트, Word는 UTF-8 BOM HTML
 *  · Excel은 관리자 전용이라 메인 번들 부담을 줄이려 동적 import 사용
 */

export type Cell = string | number;

const esc = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** 실제 .xlsx 파일 생성 (SheetJS 동적 로드) */
export async function exportTableExcel(
  filename: string,
  sheetName: string,
  columns: string[],
  rows: Cell[][],
): Promise<void> {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  // 열 너비 자동(대략) — 헤더/내용 중 최대 길이 기준
  ws['!cols'] = columns.map((c, i) => {
    const maxLen = Math.max(c.length, ...rows.map((r) => String(r[i] ?? '').length));
    return { wch: Math.min(40, Math.max(8, maxLen + 2)) };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // 시트명 31자 제한
  XLSX.writeFile(wb, filename);
}

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
  const win = window.open('', '_blank');
  if (!win) {
    alert('팝업이 차단되어 있습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도하세요.');
    return;
  }
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
  win.document.close();
}

/** Word(.doc) 다운로드 — HTML 기반(.doc로 열림, 한글 정상) */
export function exportTableWord(
  filename: string,
  title: string,
  columns: string[],
  rows: Cell[][],
  subtitle?: string,
): void {
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
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  downloadBlob(blob, filename.endsWith('.doc') ? filename : `${filename}.doc`);
}
