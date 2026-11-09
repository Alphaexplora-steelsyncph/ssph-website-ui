import { Link } from 'react-router-dom'

/**
 * Gyms list / Billing page: "Paid" when the month is paid, otherwise a link to the payment form on the gym page
 * with that month preselected. Payments are only recorded there, so every one has its details and log entry.
 */
export const RecordPaymentLink = ({ gymId, period, paid }: { gymId: string; period: string; paid: boolean }) =>
  paid ? (
    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">Paid</span>
  ) : (
    <Link
      to={`/platform/gyms/${gymId}?pay=${period}#record-payment`}
      className="inline-block rounded border border-ember/60 px-3 py-1.5 text-xs font-semibold text-ember hover:bg-ember/10"
    >
      Record payment
    </Link>
  )
