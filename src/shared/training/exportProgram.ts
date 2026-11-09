
/**
 * PNG / PDF download of a program sheet. The node is the off-screen export copy of ProgramSheet
 * (full width, nothing scrolled away). PDF pages are Folio (8.5 x 13 in) with half-inch margins,
 * always filling the page width and cut between table rows, never through one.
 */
const PAGE_W = 8.5
const PAGE_H = 13
const MARGIN = 0.5

interface Snapshot {
  dataUrl: string
  width: number
  height: number
}

const capture = async (node: HTMLElement): Promise<Snapshot> => {
  // Line every table up to the widest one so the page does not look ragged; restored right after.
  const tables = Array.from(node.querySelectorAll('table'))
  const widest = Math.max(0, ...tables.map((t) => t.getBoundingClientRect().width))
  const previous = tables.map((t) => t.style.width)
  if (widest > 0) tables.forEach((t) => (t.style.width = `${widest}px`))
  const width = node.offsetWidth
  const height = node.offsetHeight
  try {
    // Loaded only when someone downloads (keeps ~350 KB out of every page that shows a program).
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(node, { cacheBust: true, width, height, backgroundColor: '#f3efe6', pixelRatio: 2 })
    return { dataUrl, width, height }
  } finally {
    tables.forEach((t, i) => (t.style.width = previous[i]))
  }
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const download = (href: string, filename: string) => {
  const a = document.createElement('a')
  a.download = filename
  a.href = href
  a.click()
}

export const exportPng = async (node: HTMLElement, filename: string) => {
  const shot = await capture(node)
  download(shot.dataUrl, `${filename}.png`)
}

export const exportPdf = async (node: HTMLElement, filename: string) => {
  const shot = await capture(node)
  const rootTop = node.getBoundingClientRect().top
  // Allowed page breaks: the top of every table row.
  const breaks = [...new Set(Array.from(node.querySelectorAll('tr')).map((r) => r.getBoundingClientRect().top - rootTop))].sort((a, b) => a - b)
  const printableW = PAGE_W - MARGIN * 2
  const printableH = PAGE_H - MARGIN * 2
  const inchPerPx = printableW / shot.width
  const pagePx = printableH / inchPerPx
  const img = await loadImage(shot.dataUrl)
  const scale = img.naturalWidth / shot.width

  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: [PAGE_W, PAGE_H] })
  let cursor = 0
  let first = true
  while (cursor < shot.height - 0.5) {
    const target = cursor + pagePx
    let cut = shot.height
    if (target < shot.height) {
      const fitting = breaks.filter((b) => b > cursor + 1 && b <= target)
      cut = fitting.length ? fitting[fitting.length - 1] : target
    }
    const slice = Math.max(1, Math.round(cut - cursor))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(shot.width * scale)
    canvas.height = Math.round(slice * scale)
    canvas.getContext('2d')?.drawImage(img, 0, Math.round(cursor * scale), canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
    if (!first) pdf.addPage()
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MARGIN, MARGIN, printableW, slice * inchPerPx)
    first = false
    cursor = cut
  }
  pdf.save(`${filename}.pdf`)
}

/** "HYROX Block 1" + "Juan Dela Cruz" -> "juan-dela-cruz-hyrox-block-1" */
export const programFileName = (title: string, memberName?: string) =>
  [memberName, title || 'program']
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'program'
