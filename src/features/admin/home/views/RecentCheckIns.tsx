import { Link } from 'react-router-dom'
import { Avatar } from '../../../../shared/components/Avatar'
import { StatusBadge } from '../../../../shared/components/StatusBadge'
import { formatAgo, formatPeso } from '../../../../shared/utils/format'
import { useRecentCheckInsViewModel } from '../viewModels/useRecentCheckInsViewModel'

/** Live feed for the front desk: compare the photo with the person at the door. */
export const RecentCheckIns = () => {
  const { enabled, isLoading, error, latest, earlier, isEmpty, now, live } = useRecentCheckInsViewModel()
  if (!enabled) return null

  return (
    <section aria-labelledby="latest-checkins" className="mt-8 rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="latest-checkins" className="font-display text-2xl font-bold uppercase">Latest check-ins</h2>
        <span className="flex items-center gap-2 text-xs text-steel">
          <span className={`size-2 rounded-full ${live ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'}`} aria-hidden="true" />
          {live ? 'Live · updates the moment a member scans' : 'Updates every minute'}
        </span>
      </div>

      {isLoading && <div className="mt-4 h-28 animate-pulse rounded-lg bg-coal-700" />}
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      {isEmpty && <p className="mt-4 text-sm text-steel">No check-ins yet. They show up here the moment a member scans the gym QR.</p>}

      {latest && (
        <div data-testid="latest-checkin" className="mt-4 flex flex-wrap items-center gap-5 rounded-lg border border-ember/40 bg-coal-900/40 p-4">
          <Avatar name={latest.member.fullName} photoUrl={latest.member.photoUrl} size="xl" />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-steel">Just scanned · {formatAgo(latest.checkedInAt, now)}</p>
            <Link to={`/admin/members/${latest.member.id}`} className="mt-1 block font-display text-3xl font-extrabold uppercase hover:text-ember">
              {latest.member.fullName}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-steel">
              <StatusBadge status={latest.member.status} />
              <span>{latest.member.plan}</span>
              {latest.member.balanceDue > 0 && !latest.member.balanceUpcoming && <span className="text-amber-400">· owes {formatPeso(latest.member.balanceDue)}</span>}
            </div>
            {!latest.member.photoUrl && <p className="mt-2 text-xs text-amber-400">No photo on file yet. Ask the member to add one in their profile.</p>}
          </div>
        </div>
      )}

      {earlier.length > 0 && (
        <ul className="mt-3 divide-y divide-coal-600">
          {earlier.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-2.5">
              <Avatar name={c.member.fullName} photoUrl={c.member.photoUrl} size="md" />
              <div className="min-w-0 flex-1">
                <Link to={`/admin/members/${c.member.id}`} className="block truncate font-medium hover:text-ember">{c.member.fullName}</Link>
                <p className="text-xs text-steel">{c.member.plan}</p>
              </div>
              <StatusBadge status={c.member.status} />
              <span className="w-20 shrink-0 text-right text-xs text-steel">{formatAgo(c.checkedInAt, now)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
