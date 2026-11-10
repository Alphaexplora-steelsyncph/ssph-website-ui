import { CalendarClock, Wallet } from 'lucide-react'
import type { PaymentOption, PlanOption } from '../models/types'
import { formatDate, formatPeso } from '../utils/format'
import { installmentTotal, monthsLabel, offersMonthly } from '../utils/planBilling'

interface Props {
  plan: PlanOption | null
  option: PaymentOption
  onOption: (option: PaymentOption) => void
  months: number
  onMonths: (months: number) => void
  /** Last day the months paid cover (installment only), for the hint. */
  paidUntil?: string | null
  /**
   * 'now' = months paid with this payment (1 or more, advance allowed: Enroll, Renew).
   * 'already' = months paid before SteelSync (0 or more: Add existing member).
   */
  monthsMode?: 'now' | 'already'
}

/**
 * Full payment or installment, for a plan that has an installment price. Shows both deals side by side so the desk can
 * walk the member through them. Renders nothing for plans that can only be paid in full.
 */
export const PaymentOptionFields = ({ plan, option, onOption, months, onMonths, paidUntil, monthsMode = 'now' }: Props) => {
  if (!plan || !offersMonthly(plan)) return null
  const total = installmentTotal(plan)
  const extra = Math.round((total - plan.price) * 100) / 100
  const choices: { value: PaymentOption; title: string; price: string; detail: string; icon: typeof Wallet }[] = [
    { value: 'full', title: 'Full payment', price: formatPeso(plan.price), detail: `One payment for all ${monthsLabel(plan.durationValue)}`, icon: Wallet },
    {
      value: 'monthly',
      title: 'Installment',
      price: `${formatPeso(plan.monthlyPrice!)}/month`,
      detail: `${plan.durationValue} payments · ${formatPeso(total)} in total${extra > 0 ? ` (${formatPeso(extra)} more)` : ''}`,
      icon: CalendarClock,
    },
  ]
  const first = monthsMode === 'already' ? 0 : 1
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-steel">How the member pays</span>
      <div role="radiogroup" aria-label="How the member pays" className="grid gap-2 sm:grid-cols-2">
        {choices.map((c) => {
          const on = option === c.value
          const Icon = c.icon
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onOption(c.value)}
              className={`rounded-lg border px-4 py-3 text-left transition ${on ? 'border-ember bg-ember/10' : 'border-coal-500 bg-coal-900 hover:border-steel'}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`flex items-center gap-2 font-semibold ${on ? 'text-ember' : 'text-zinc-100'}`}>
                  <Icon size={16} aria-hidden="true" /> {c.title}
                </span>
                <span className={`font-display text-xl font-bold ${on ? 'text-ember' : 'text-zinc-100'}`}>{c.price}</span>
              </span>
              <span className="mt-1 block text-sm text-steel">{c.detail}</span>
            </button>
          )
        })}
      </div>
      {option === 'monthly' && (
        <div className="mt-3 rounded-lg border border-coal-500 bg-coal-900 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-steel">{monthsMode === 'already' ? 'Months already paid' : 'Months to pay now'}</span>
              <select
                aria-label={monthsMode === 'already' ? 'Months already paid' : 'Months to pay now'}
                value={months}
                onChange={(e) => onMonths(Number(e.target.value))}
                className="w-44 rounded-lg border border-coal-500 bg-coal-800 px-4 py-3 text-zinc-100 focus:border-ember focus:outline-none"
              >
                {Array.from({ length: plan.durationValue - first + 1 }, (_, i) => i + first).map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? 'None yet' : monthsLabel(n)}
                  </option>
                ))}
              </select>
            </label>
            <p className="pb-3 text-sm">
              {monthsMode === 'now' && <span className="font-semibold text-zinc-100">{formatPeso(plan.monthlyPrice! * months)} now</span>}
              {paidUntil && (
                <span className="text-steel">
                  {monthsMode === 'now' ? ' · ' : ''}covered until <span className="font-semibold text-zinc-100">{formatDate(paidUntil)}</span>
                </span>
              )}
            </p>
          </div>
          <p className="mt-2 text-xs text-steel">
            The member pays every month of the plan and can pay ahead. If a month is not paid, the account is paused (no check-in) until they pay.
          </p>
        </div>
      )}
    </div>
  )
}
