import { useId, useState } from 'react'

export interface BarDatum {
  key: string
  label: string // axis label (short)
  value: number
  tooltip?: string // extra line(s) in the hover tooltip
}

interface Props {
  data: BarDatum[]
  /** Accessible name; the visible title is the card heading. */
  title: string
  formatValue?: (n: number) => string
  /** Show every Nth axis label (long series). */
  labelEvery?: number
  height?: number
}

/** Clean axis maximum: 1, 2, 2.5 or 5 × 10^n at or above the largest value. */
const niceMax = (max: number) => {
  if (max <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(max))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= max) return m * p
  return 10 * p
}

const compact = (n: number) =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${+(n / 1000).toFixed(1)}K` : n.toLocaleString('en-PH')

/**
 * Single-series column chart: thin columns (max 24px) in the brand color, 4px rounded tops, a recessive grid,
 * and a hover/focus tooltip on each column. The same numbers are always available as a table on the page.
 */
export const BarChart = ({ data, title, formatValue = (n) => n.toLocaleString('en-PH'), labelEvery = 1, height = 180 }: Props) => {
  const [active, setActive] = useState<number | null>(null)
  const id = useId()
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)))
  const ticks = [0, max / 2, max]
  const hovered = active !== null ? data[active] : null

  return (
    <figure aria-labelledby={`${id}-t`} className="relative">
      <figcaption id={`${id}-t`} className="sr-only">
        {title}
      </figcaption>
      <div className="flex gap-2">
        {/* y axis */}
        <div className="relative w-10 shrink-0 text-right text-[11px] text-steel" style={{ height }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - t / max) * 100}%` }}>
              {compact(t)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height }} onMouseLeave={() => setActive(null)}>
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 h-px bg-coal-600" style={{ top: `${(1 - t / max) * 100}%` }} aria-hidden="true" />
            ))}
            <div className="absolute inset-0 flex items-end gap-0.5">
              {data.map((d, i) => (
                <button
                  key={d.key}
                  type="button"
                  className="group flex h-full min-w-0 flex-1 items-end justify-center focus:outline-none"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  aria-label={`${d.label}: ${formatValue(d.value)}`}
                >
                  <span
                    className={`block w-full max-w-6 rounded-t transition-opacity ${active === null || active === i ? 'opacity-100' : 'opacity-50'} bg-ember group-focus-visible:ring-2 group-focus-visible:ring-zinc-100`}
                    style={{ height: `${d.value > 0 ? Math.max((d.value / max) * 100, 1.5) : 0}%` }}
                  />
                </button>
              ))}
            </div>
            {hovered && active !== null && (
              <div
                role="status"
                className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-coal-500 bg-coal-900 px-3 py-2 text-xs shadow-lg"
                style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
              >
                <p className="text-steel">{hovered.label}</p>
                <p className="text-sm font-semibold text-zinc-100">{formatValue(hovered.value)}</p>
                {hovered.tooltip && <p className="mt-0.5 whitespace-pre text-steel">{hovered.tooltip}</p>}
              </div>
            )}
          </div>
          {/* x axis */}
          <div className="mt-1.5 flex gap-0.5 text-[11px] text-steel" aria-hidden="true">
            {data.map((d, i) => (
              <span key={d.key} className={`relative min-w-0 flex-1 text-center ${labelEvery === 1 ? 'truncate' : 'h-4'}`}>
                {labelEvery === 1 ? (
                  d.label
                ) : i % labelEvery === 0 ? (
                  // Sparse labels may be wider than their slot: centre them on the column without clipping.
                  <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{d.label}</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  )
}
