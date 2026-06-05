import{_ as h}from"./index-DX0fl9VW.js";const l=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),b=(e,a)=>{const n=URL.createObjectURL(e),t=document.createElement("a");t.href=n,t.download=a,document.body.appendChild(t),t.click(),t.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)};async function u(e,a,n,t){const o=await h(()=>import("./xlsx-CNerDvZX.js"),[]),s=o.utils.aoa_to_sheet([n,...t]);s["!cols"]=n.map((r,d)=>{const p=Math.max(r.length,...t.map(m=>String(m[d]??"").length));return{wch:Math.min(40,Math.max(8,p+2))}});const i=o.utils.book_new();o.utils.book_append_sheet(i,s,a.slice(0,31)),o.writeFile(i,e)}const c=(e,a)=>{const n=`<tr>${e.map(o=>`<th>${l(o)}</th>`).join("")}</tr>`,t=a.map(o=>`<tr>${o.map(s=>`<td>${l(s)}</td>`).join("")}</tr>`).join("");return`<table><thead>${n}</thead><tbody>${t}</tbody></table>`};function x(e,a,n,t){const o=window.open("","_blank");if(!o){alert("팝업이 차단되어 있습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도하세요.");return}o.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${l(e)}</title>
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
    <h1>${l(e)}</h1>${t?`<p class="sub">${l(t)}</p>`:""}
    ${c(a,n)}
    <p class="noprint" style="margin-top:16px;color:#888;font-size:12px;">
      인쇄 대화상자에서 <b>대상: PDF로 저장</b>을 선택하면 PDF로 받을 수 있습니다.</p>
    <script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
    </body></html>`),o.document.close()}function w(e,a,n,t,o){const s=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${l(a)}</title>
    <style>
      body{font-family:'Malgun Gothic',sans-serif;}
      h1{font-size:18px;} .sub{color:#555;font-size:12px;}
      table{border-collapse:collapse;width:100%;}
      th,td{border:1px solid #888;padding:5px 9px;text-align:left;font-size:12px;}
      th{background:#eee;}
    </style></head><body>
    <h1>${l(a)}</h1>${o?`<p class="sub">${l(o)}</p>`:""}
    ${c(n,t)}
    </body></html>`,i=new Blob(["\uFEFF",s],{type:"application/msword"});b(i,e.endsWith(".doc")?e:`${e}.doc`)}export{x as a,u as b,w as e};
