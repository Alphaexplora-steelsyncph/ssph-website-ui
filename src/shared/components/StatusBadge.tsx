import type { MyMembershipStatus } from '../models/types'

const STYLES: Record<MyMembershipStatus, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400',
  Paused: 'bg-orange-500/15 text-orange-400',
  Expired: 'bg-amber-500/15 text-amber-400',
  Terminated: 'bg-red-500/15 text-red-400',
  Pending: 'bg-sky-500/15 text-sky-400',
}

export const StatusBadge = ({ status }: { status: MyMembershipStatus }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}>{status}</span>
)
