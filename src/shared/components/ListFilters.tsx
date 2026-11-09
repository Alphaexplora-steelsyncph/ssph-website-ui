import { Download, Search } from 'lucide-react'
import type { ReactNode } from 'react'

const field = 'rounded-lg border border-coal-500 bg-coal-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-ember focus:outline-none'

interface Props {
  q: string
  onQ: (v: string) => void
  from: string
  onFrom: (v: string) => void
  to: string
  onTo: (v: string) => void
  /** Quick ranges: today, last 7 days, this month… */
  presets: { key: string; label: string }[]
  onPreset: (key: string) => void
  activePreset: string | null
  children?: ReactNode // extra filters (e.g. payment method)
  onExport: () => void
  isExporting: boolean
  exportDisabled?: boolean
}

/** One row of filters above a list: search, date range with quick presets, extra filters, CSV export. */
export const ListFilters = (p: Props) => (
  <div className="mb-5 space-y-3">
    <div className="flex flex-wrap items-end gap-3">
      <label className="relative min-w-56 flex-1">
        <span className="sr-only">Search member</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel" aria-hidden="true" />
        <input value={p.q} onChange={(e) => p.onQ(e.target.value)} placeholder="Search member name or email" className={`${field} w-full pl-9`} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-steel">From</span>
        <input type="date" value={p.from} max={p.to || undefined} onChange={(e) => p.onFrom(e.target.value)} className={field} aria-label="From date" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-steel">To</span>
        <input type="date" value={p.to} min={p.from || undefined} onChange={(e) => p.onTo(e.target.value)} className={field} aria-label="To date" />
      </label>
      {p.children}
      <button
        type="button"
        onClick={p.onExport}
        disabled={p.isExporting || p.exportDisabled}
        className="inline-flex items-center gap-2 rounded-lg border border-coal-500 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:border-ember hover:text-ember disabled:opacity-50"
      >
        <Download size={16} /> {p.isExporting ? 'Exporting…' : 'Export CSV'}
      </button>
    </div>
    <div className="flex flex-wrap gap-2">
      {p.presets.map((pr) => (
        <button
          key={pr.key}
          type="button"
          onClick={() => p.onPreset(pr.key)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            p.activePreset === pr.key ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:text-zinc-100'
          }`}
        >
          {pr.label}
        </button>
      ))}
    </div>
  </div>
)
