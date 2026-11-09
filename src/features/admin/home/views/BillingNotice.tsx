import { AlertTriangle, CalendarClock } from 'lucide-react'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { useBillingNoticeViewModel } from '../viewModels/useBillingNoticeViewModel'

export const BillingNotice = () => {
  const { notice } = useBillingNoticeViewModel()
  if (!notice) return null
  const overdue = notice.state === 'overdue'
  const Icon = overdue ? AlertTriangle : CalendarClock

  return (
    <div
      role="status"
      className={`mb-6 flex gap-3 rounded-xl border px-4 py-3 text-sm ${
        overdue ? 'border-red-500/50 bg-red-500/10 text-red-200' : 'border-amber-500/50 bg-amber-500/10 text-amber-200'
      }`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p>
        {overdue ? (
          <>
            Your SteelSync subscription for <b>{notice.periodLabel}</b> ({formatPeso(notice.amountDue)}) was due on{' '}
            {formatDate(notice.dueDate)}. Please settle it before <b>{formatDate(notice.suspendsOn)}</b> to avoid suspension of your
            gym's account.
          </>
        ) : (
          <>
            Your SteelSync subscription for <b>{notice.periodLabel}</b> ({formatPeso(notice.amountDue)}) is due{' '}
            {notice.daysUntilDue === 0 ? 'today' : `on ${formatDate(notice.dueDate)}`}.
          </>
        )}
      </p>
    </div>
  )
}
