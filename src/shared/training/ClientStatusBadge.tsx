import type { CoachClient } from '../models/types'

const clientStatusLabel = (c: CoachClient) =>
  c.status !== 'Active' ? c.status : c.checkInBlocked ? 'On hold' : 'Active'

const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400',
  Expired: 'bg-amber-500/15 text-amber-400',
  Terminated: 'bg-red-500/15 text-red-400',
  'On hold': 'bg-red-500/15 text-red-400',
}

/** Plan status of a coach's client; "On hold" when the front desk blocked check-in. */
export const ClientStatusBadge = ({ client }: { client: CoachClient }) => {
  const label = clientStatusLabel(client)
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[label]}`}>{label}</span>
}
