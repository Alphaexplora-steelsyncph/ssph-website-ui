import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { formatDate, formatTime, formatWeekday } from '../../../../shared/utils/format'
import { useMemberVisitsViewModel } from '../viewModels/useMemberVisitsViewModel'

export const VisitHistory = () => {
  const { months, totalCount, thisMonthCount, isLoading, error } = useMemberVisitsViewModel()
  // UI-local: which month sections are expanded (all collapsed at first)
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set())
  const toggle = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  if (isLoading) return <div className="h-40 animate-pulse rounded-xl bg-coal-800" />
  if (error) return <p role="alert" className="text-sm text-red-300">{error}</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-coal-600 bg-coal-800 p-4">
          <p className="text-xs uppercase tracking-wider text-steel">This month</p>
          <p className="mt-1 font-display text-4xl font-extrabold">{thisMonthCount}</p>
        </div>
        <div className="rounded-xl border border-coal-600 bg-coal-800 p-4">
          <p className="text-xs uppercase tracking-wider text-steel">All time</p>
          <p className="mt-1 font-display text-4xl font-extrabold">{totalCount}</p>
        </div>
      </div>

      {totalCount === 0 && <p className="text-sm text-steel">No visits yet. Scan the gym QR on your next workout.</p>}

      {months.length > 0 && (
      <div className="divide-y divide-coal-600 overflow-hidden rounded-xl border border-coal-600 bg-coal-800">
        {months.map((month) => {
          const isOpen = openKeys.has(month.key)
          const panelId = `visits-${month.key}`
          return (
            <section key={month.key}>
              <h2>
                <button
                  type="button"
                  onClick={() => toggle(month.key)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-coal-700"
                >
                  <span className="font-display text-xl font-bold uppercase">{month.label}</span>
                  <span className="flex items-center gap-3 text-sm text-steel">
                    {month.visits.length} visit{month.visits.length === 1 ? '' : 's'}
                    <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180 text-ember' : ''}`} />
                  </span>
                </button>
              </h2>
              {isOpen && (
                <ul id={panelId} className="divide-y divide-coal-600 border-t border-coal-600 bg-coal-900/40">
                  {month.visits.map((v) => (
                    <li key={v.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span>
                        <span className="font-medium">{formatDate(v.checkedInAt)}</span>
                        <span className="ml-2 text-steel">{formatWeekday(v.checkedInAt)}</span>
                      </span>
                      <span className="text-steel">{formatTime(v.checkedInAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
      )}
    </div>
  )
}
