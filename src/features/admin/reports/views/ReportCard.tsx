import { Download } from 'lucide-react'
import type { ReactNode } from 'react'

/** Titled card with an optional CSV export button. */
export const ReportCard = ({ title, note, onExport, children }: { title: string; note?: string; onExport?: () => void; children: ReactNode }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">{title}</h2>
        {note && <p className="mt-0.5 text-sm text-steel">{note}</p>}
      </div>
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-coal-500 px-3 py-1.5 text-xs font-semibold text-steel hover:border-ember hover:text-ember"
        >
          <Download size={14} /> CSV
        </button>
      )}
    </div>
    {children}
  </section>
)

export const Stat = ({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: string }) => (
  <div className="rounded-xl border border-coal-600 bg-coal-800 p-4">
    <p className="text-xs uppercase tracking-wider text-steel">{label}</p>
    <p className={`mt-1 font-display text-4xl font-extrabold ${tone ?? ''}`}>{value}</p>
    {note && <p className="text-xs text-steel">{note}</p>}
  </div>
)
