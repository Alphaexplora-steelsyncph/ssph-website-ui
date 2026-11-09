import { ChevronDown, Download, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { ProgramExport } from './useProgramExport'

/** "Download" button with a PNG / PDF choice. */
export const ExportMenu = ({ exporter }: { exporter: ProgramExport }) => {
  const [open, setOpen] = useState(false)
  const pick = (fn: () => void) => {
    setOpen(false)
    fn()
  }
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        disabled={!!exporter.busy}
        className="inline-flex items-center gap-2 rounded-lg border border-coal-500 px-4 py-2.5 text-sm font-semibold hover:border-ember hover:text-ember disabled:opacity-60"
      >
        {exporter.busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {exporter.busy ? 'Preparing…' : 'Download'} <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-lg border border-coal-500 bg-coal-800 shadow-xl">
            <button type="button" onClick={() => pick(exporter.downloadPdf)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-coal-700">
              <FileText size={16} /> PDF (Folio)
            </button>
            <button type="button" onClick={() => pick(exporter.downloadPng)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-coal-700">
              <ImageIcon size={16} /> PNG image
            </button>
          </div>
        </>
      )}
      {exporter.error && <p className="absolute right-0 mt-1 w-56 text-right text-xs text-red-400">{exporter.error}</p>}
    </div>
  )
}
