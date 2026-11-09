import { Activity } from 'lucide-react'
import { formatTime } from '../../../../shared/utils/format'
import { useGymCrowdNowViewModel } from '../viewModels/useGymCrowdNowViewModel'

/** Live count of members in the gym, with a 1h / 2h / 3h window. */
export const GymCrowdNowCard = () => {
  const vm = useGymCrowdNowViewModel()
  if (!vm.enabled) return null
  return (
    <div className="rounded-xl border border-coal-500 bg-coal-800 p-5">
      <div className="flex items-start justify-between gap-3">
        <Activity className="text-ember" />
        <div role="radiogroup" aria-label="Checked in within" className="flex gap-1 rounded-lg bg-coal-900 p-1">
          {vm.windows.map((h) => (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={vm.hours === h}
              onClick={() => vm.setHours(h)}
              className={`rounded px-2.5 py-1 text-xs font-semibold ${vm.hours === h ? 'bg-ember text-charcoal' : 'text-steel hover:text-zinc-100'}`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>
      <h2 className="mt-3 font-display text-2xl font-bold uppercase">In the gym now</h2>
      <p data-testid="crowd-count" className="mt-1 font-display text-5xl font-extrabold">
        {vm.count ?? '—'}
      </p>
      <p className="mt-1 text-sm text-steel">
        {vm.error ?? `Checked in within the last ${vm.hours} hour${vm.hours === 1 ? '' : 's'}${vm.asOf ? ` · updated ${formatTime(vm.asOf)}` : ''}`}
      </p>
    </div>
  )
}
