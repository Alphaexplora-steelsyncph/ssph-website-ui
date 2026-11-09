import { Link } from 'react-router-dom'
import type { AuditEntry } from '../../../../shared/models/types'
import { formatDate, formatTime } from '../../../../shared/utils/format'

export const RecentActivity = ({ entries }: { entries: AuditEntry[] }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <div className="flex items-baseline justify-between">
      <h2 className="font-display text-2xl font-bold uppercase">Recent activity</h2>
      <Link to="/platform/audit" className="text-sm font-semibold text-ember hover:underline">Audit log</Link>
    </div>
    {entries.length === 0 && <p className="mt-3 text-sm text-steel">No activity yet.</p>}
    <ul className="mt-3 divide-y divide-coal-600">
      {entries.map((e) => (
        <li key={e.id} className="py-3 text-sm">
          <p>
            <span className="font-semibold">{e.action}</span>
            {e.gymName && <span className="text-steel"> · {e.gymName}</span>}
          </p>
          <p className="text-xs text-steel">
            {e.actorName} · {formatDate(e.at)} {formatTime(e.at)}
          </p>
        </li>
      ))}
    </ul>
  </section>
)
