import type { PaymentDate } from '../models/types'
import { formatDate } from '../utils/format'

interface Props {
  dates: PaymentDate[]
  isLoading: boolean
  error: string | null
  /** e.g. "3 of 12 monthly payments made" (only for members on a monthly plan). */
  summary?: string
}

/** When a member paid: dates only, newest first. Used by the front desk (member page) and by the member. */
export const PaymentDatesCard = ({ dates, isLoading, error, summary }: Props) => (
  <section className="h-fit rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="font-display text-2xl font-bold uppercase">Payments</h2>
    {summary && <p className="mt-1 text-sm text-steel">{summary}</p>}
    {isLoading && <p className="mt-4 text-sm text-steel">Loading…</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    {!isLoading && !error && dates.length === 0 && <p className="mt-4 text-sm text-steel">No payments on record yet.</p>}
    <ul className="mt-3 divide-y divide-coal-600">
      {dates.map((d) => (
        <li key={d.id} className="py-3 text-sm">
          Paid on {formatDate(d.paidAt)}
        </li>
      ))}
    </ul>
  </section>
)
