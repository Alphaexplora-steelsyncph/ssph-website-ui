import { useEffect, useState } from 'react'
import { ApiError, fetchPlans, switchToInstallment } from '../../../../shared/models/apiService'
import type { MemberRecord, PlanOption } from '../../../../shared/models/types'
import { addMonths, todayISO } from '../../../../shared/utils/dates'
import { offersMonthly } from '../../../../shared/utils/planBilling'

/**
 * A member who paid in full switches to installment for the rest of the current plan. The plan's months are counted
 * back from its end date; the desk says how many of them the earlier payment already covers. No payment is recorded here.
 */
export const useSwitchToInstallmentViewModel = (member: MemberRecord, onUpdated: (updated: MemberRecord) => void) => {
  const [plan, setPlan] = useState<PlanOption | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [months, setMonths] = useState<number | null>(null) // null = suggest "covered up to today"
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchPlans()
      .then((plans) => !cancelled && setPlan(plans.find((p) => p.name === member.plan) ?? null))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load plans.'))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [member.plan])

  const today = todayISO()
  const available = offersMonthly(plan) && plan?.durationUnit === 'months'
  const termStart = available && plan ? addMonths(member.expiresAt, -plan.durationValue) : null
  const suggested = (() => {
    if (!termStart || !plan) return 0
    let n = 0
    while (n < plan.durationValue && addMonths(termStart, n) < today) n += 1
    return n
  })()
  const monthsAlreadyPaid = Math.min(months ?? suggested, plan?.durationValue ?? 0)
  const paidUntil = termStart ? addMonths(termStart, monthsAlreadyPaid) : null
  const pausedAfter = !!paidUntil && paidUntil < today

  const submit = async () => {
    if (!available) return
    try {
      setIsSubmitting(true)
      setError(null)
      onUpdated(await switchToInstallment(member.id, { paymentOption: 'monthly', monthsAlreadyPaid }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not switch to installment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { plan, isLoading, available, termStart, monthsAlreadyPaid, setMonths, paidUntil, pausedAfter, error, isSubmitting, submit }
}
