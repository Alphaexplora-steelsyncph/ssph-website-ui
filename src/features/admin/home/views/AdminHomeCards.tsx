import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminHomeViewModel } from '../viewModels/useAdminHomeViewModel'
import { GymCrowdNowCard } from './GymCrowdNowCard'

export const AdminHomeCards = () => {
  const { cards } = useAdminHomeViewModel()
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <GymCrowdNowCard />
      {cards.map(({ key, icon: Icon, label, note, to, locked }) => {
        const body = (
          <>
            <div className="flex items-center justify-between">
              <Icon className={locked ? 'text-steel' : 'text-ember'} />
              {locked && (
                <span className="inline-flex items-center gap-1 rounded-full border border-ember/50 px-2 py-0.5 text-xs font-semibold text-ember">
                  <Lock size={12} aria-hidden="true" /> Add-on
                </span>
              )}
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase">{label}</h2>
            <p className="mt-1 text-sm text-steel">{note}</p>
            {!to && <span className="mt-3 inline-block rounded bg-coal-600 px-2 py-0.5 text-xs text-steel">Not available yet</span>}
          </>
        )
        return to ? (
          <Link
            key={key}
            to={to}
            className={`rounded-xl border bg-coal-800 p-5 transition hover:border-ember ${locked ? 'border-dashed border-coal-500' : 'border-coal-500'}`}
          >
            {body}
          </Link>
        ) : (
          <div key={key} className="rounded-xl border border-dashed border-coal-500 bg-coal-800 p-5">
            {body}
          </div>
        )
      })}
    </div>
  )
}
