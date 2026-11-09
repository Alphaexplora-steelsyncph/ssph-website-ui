import { RefreshCw, Users } from 'lucide-react'
import { formatTime } from '../../../../shared/utils/format'
import { useGymCrowdViewModel } from '../viewModels/useGymCrowdViewModel'

const LEVEL_STYLE = { Quiet: 'text-emerald-400', Moderate: 'text-amber-400', Busy: 'text-red-400' } as const

export const GymCrowdCard = () => {
  const { crowd, level, isRefreshing, error, refresh } = useGymCrowdViewModel()
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6" aria-live="polite">
      <div className="flex items-start justify-between">
        <Users size={32} className="text-ember" />
        <button
          type="button"
          onClick={refresh}
          disabled={isRefreshing}
          aria-label="Refresh gym count"
          className="rounded p-1.5 text-steel hover:bg-coal-700 hover:text-zinc-100 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      <h2 className="mt-3 font-display text-2xl font-bold uppercase">In the gym now</h2>
      {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
      {crowd && (
        <>
          <p className="mt-1">
            <span className="font-display text-5xl font-extrabold">{crowd.count}</span>{' '}
            <span className="text-steel">{crowd.count === 1 ? 'person' : 'people'}</span>
            {level && <span className={`ml-2 text-sm font-semibold ${LEVEL_STYLE[level]}`}>{level}</span>}
          </p>
          <p className="mt-1 text-xs text-steel">
            Checked in within the last {crowd.windowHours} hours · updated {formatTime(crowd.asOf)}
          </p>
        </>
      )}
    </section>
  )
}
