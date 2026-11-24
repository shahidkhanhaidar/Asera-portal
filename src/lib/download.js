const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function save(blob, name) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 500);
}
/** Download rows (array of arrays) locally as .csv or an Excel-readable .xls. */
export function downloadSheet(rows, baseName, kind = 'csv') {
  if (kind === 'xls') {
    const html = `<html><head><meta charset="utf-8"></head><body><table>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
    save(new Blob([html], { type: 'application/vnd.ms-excel' }), `${baseName}.xls`);
  } else {
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    save(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), `${baseName}.csv`);
  }
}
