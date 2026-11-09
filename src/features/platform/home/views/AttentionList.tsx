import { Link } from 'react-router-dom'
import { BillingStateText, GymStatusBadge } from '../../../../shared/components/PlatformBadges'
import type { GymSummary } from '../../../../shared/models/types'
import { formatDate } from '../../../../shared/utils/format'

export const AttentionList = ({ gyms }: { gyms: GymSummary[] }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="font-display text-2xl font-bold uppercase">Needs attention</h2>
    {gyms.length === 0 && <p className="mt-3 text-sm text-steel">All gyms are paid and active.</p>}
    <ul className="mt-3 divide-y divide-coal-600">
      {gyms.map((g) => (
        <li key={g.id}>
          <Link to={`/platform/gyms/${g.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-ember">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{g.name}</span>
              <span className="text-xs text-steel">
                {g.billing.periodLabel} · due {formatDate(g.billing.dueDate)}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <GymStatusBadge status={g.status} reason={g.suspendReason} />
              <BillingStateText state={g.billing.state} daysUntilDue={g.billing.daysUntilDue} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </section>
)
