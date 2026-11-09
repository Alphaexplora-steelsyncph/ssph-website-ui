import { ArrowRight } from 'lucide-react'
import { formatDate } from '../../../../shared/utils/format'

interface Props {
  currentEnd: string
  /** Null until a plan is picked. */
  newStart: string | null
  newEnd: string | null
}

/** Upgrade dialog: the current plan runs out first, then the new one starts. No days are lost. */
export const UpgradeTimeline = ({ currentEnd, newStart, newEnd }: Props) => (
  <div className="mt-3 rounded-lg border border-coal-500 px-4 py-3">
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-steel">Current plan</p>
        <p className="mt-1 font-semibold text-zinc-100">until {formatDate(currentEnd)}</p>
      </div>
      <ArrowRight size={18} className="text-ember" aria-hidden="true" />
      <div>
        <p className="text-xs uppercase tracking-wider text-steel">New plan</p>
        <p data-testid="upgrade-new-period" className="mt-1 font-semibold text-zinc-100">
          {newStart && newEnd ? `${formatDate(newStart)} – ${formatDate(newEnd)}` : <span className="font-normal text-steel">Pick a plan</span>}
        </p>
      </div>
    </div>
    <p className="mt-2 text-xs text-steel">The new plan starts the day after the current one ends, so no days are lost.</p>
  </div>
)
