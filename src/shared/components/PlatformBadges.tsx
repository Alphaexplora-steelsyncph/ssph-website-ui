import type { BillingState, GymStatus, SuspendReason } from '../models/types'

const STATUS_STYLE: Record<GymStatus, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400',
  Suspended: 'bg-red-500/15 text-red-400',
  Archived: 'bg-coal-600 text-steel',
}

export const GymStatusBadge = ({ status, reason }: { status: GymStatus; reason?: SuspendReason }) => (
  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>
    {status}
    {reason === 'overdue' ? ' · unpaid' : reason === 'manual' ? ' · manual' : ''}
  </span>
)

const BILLING_STYLE: Record<BillingState, { label: string; style: string }> = {
  paid: { label: 'Paid', style: 'text-emerald-400' },
  upcoming: { label: 'Upcoming', style: 'text-steel' },
  due_soon: { label: 'Due soon', style: 'text-amber-400' },
  overdue: { label: 'Overdue', style: 'text-red-400' },
  suspended: { label: 'Past grace period', style: 'text-red-400' },
}

export const BillingStateText = ({ state, daysUntilDue }: { state: BillingState; daysUntilDue: number }) => {
  const { label, style } = BILLING_STYLE[state]
  const extra =
    state === 'due_soon'
      ? daysUntilDue === 0
        ? ' · today'
        : ` · ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
      : state === 'overdue' || state === 'suspended'
        ? ` · ${-daysUntilDue} day${daysUntilDue === -1 ? '' : 's'} late`
        : ''
  return (
    <span className={`whitespace-nowrap text-sm font-semibold ${style}`}>
      {label}
      {extra}
    </span>
  )
}
