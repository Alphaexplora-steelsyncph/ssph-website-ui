/** Builds a CSV (Excel opens it) and downloads it in the browser. */
const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  // Quote everything; neutralise leading = + - @ so a spreadsheet never runs it as a formula.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

export const toCsv = (headers: string[], rows: unknown[][]) => [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')

export const downloadCsv = (fileName: string, headers: string[], rows: unknown[][]) => {
  // BOM so Excel reads ₱ and ñ correctly.
  const blob = new Blob(['﻿', toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
