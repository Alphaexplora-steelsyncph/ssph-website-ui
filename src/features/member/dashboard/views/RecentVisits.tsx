import { Link } from 'react-router-dom'
import { formatDate, formatTime } from '../../../../shared/utils/format'
import { useRecentVisitsViewModel } from '../viewModels/useRecentVisitsViewModel'

export const RecentVisits = () => {
  const { recent, totalCount, isLoading, error } = useRecentVisitsViewModel()
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold uppercase">Recent visits</h2>
        {totalCount > 0 && (
          <Link to="/member/visits" className="text-sm font-semibold text-ember hover:underline">
            See all {totalCount}
          </Link>
        )}
      </div>
      {isLoading && <p className="mt-4 text-sm text-steel">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {!isLoading && !error && recent.length === 0 && (
        <p className="mt-4 text-sm text-steel">No visits yet. Scan the gym QR on your next workout.</p>
      )}
      <ul className="mt-3 divide-y divide-coal-600">
        {recent.map((v) => (
          <li key={v.id} className="flex justify-between py-3 text-sm">
            <span>{formatDate(v.checkedInAt)}</span>
            <span className="text-steel">{formatTime(v.checkedInAt)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
