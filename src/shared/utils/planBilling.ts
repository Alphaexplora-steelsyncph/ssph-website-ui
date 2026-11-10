import type { DurationUnit, PaymentOption } from '../models/types'
import { formatDuration, formatPeso } from './format'

type BillingPlan = { price: number; durationValue: number; durationUnit: DurationUnit; monthlyPrice?: number | null }

/** The plan can also be paid month by month (it has a monthly price). */
export const offersMonthly = (plan: Pick<BillingPlan, 'monthlyPrice'> | null | undefined) => plan?.monthlyPrice != null

/** Monthly price is allowed on plans of 2 or more months. Mirrors the backend. */
export const canHaveMonthlyPrice = (durationValue: number, durationUnit: DurationUnit) => durationUnit === 'months' && durationValue >= 2

/** What the whole plan costs when paid by installment. */
export const installmentTotal = (plan: BillingPlan) => (offersMonthly(plan) ? Math.round(plan.monthlyPrice! * plan.durationValue * 100) / 100 : plan.price)

/** "₱9,000" or "₱9,000 or ₱900/month". */
export const planPriceLabel = (plan: BillingPlan) =>
  offersMonthly(plan) ? `${formatPeso(plan.price)} or ${formatPeso(plan.monthlyPrice!)}/month` : formatPeso(plan.price)

/** "12 months access". */
export const planTermLabel = (plan: BillingPlan) => `${formatDuration(plan.durationValue, plan.durationUnit)} access`

/** What to charge now: the full price, or the monthly price × the months paid now. */
export const amountFor = (plan: BillingPlan, option: PaymentOption, months: number) =>
  option === 'monthly' && offersMonthly(plan) ? Math.round(plan.monthlyPrice! * months * 100) / 100 : plan.price

export const monthsLabel = (n: number) => `${n} month${n === 1 ? '' : 's'}`
