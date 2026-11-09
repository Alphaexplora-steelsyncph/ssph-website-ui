import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ApiError,
  fetchPaymentMethods,
  fetchPlans,
  reinstateMember,
  renewMember,
  upgradeMember,
  uploadReceipt,
} from '../../../../shared/models/apiService'
import type { MemberRecord, PaymentMethod, PlanOption } from '../../../../shared/models/types'
import { addDays, computeExpiry, todayISO } from '../../../../shared/utils/dates'

/** Shortest plan first (a month is counted as 30 days only for ordering). */
const lengthInDays = (p: PlanOption) => p.durationValue * (p.durationUnit === 'months' ? 30 : 1)

type Field = 'plan' | 'amount' | 'referenceNo' | 'dueOn'
export type ReinstateErrors = Partial<Record<Field, string>>

/**
 * Also used to renew an expired member (mode 'renew') and to upgrade an active one (mode 'upgrade'):
 * same form, different endpoint. An upgrade is added after the days the member still has.
 * Reinstating a terminated member: pick the plan they continue on and record the payment.
 * The new period starts today; the original member-since date stays.
 */
export type PlanDialogMode = 'reinstate' | 'renew' | 'upgrade'

export const useReinstateMemberViewModel = (
  member: MemberRecord,
  onReinstated: (updated: MemberRecord) => void,
  mode: PlanDialogMode = 'reinstate',
) => {
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(['Cash'])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)

  const [planId, setPlanId] = useState('')
  const [amount, setAmountState] = useState('')
  const [amountEdited, setAmountEdited] = useState(false)
  const [method, setMethodState] = useState<PaymentMethod>('Cash')
  const [referenceNo, setReferenceNoState] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [keepBalance, setKeepBalanceState] = useState(true)
  const [dueOn, setDueOnState] = useState('')

  const [fieldErrors, setFieldErrors] = useState<ReinstateErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchPlans()
      .then((offered) => {
        if (cancelled) return
        const data = [...offered].sort((a, b) => lengthInDays(a) - lengthInDays(b) || a.price - b.price)
        setPlans(data)
        // Start on the plan the member had, when it is still offered.
        // (An upgrade starts empty: the point is to pick a different plan.)
        const previous = mode === 'upgrade' ? undefined : data.find((p) => p.name === member.plan)
        if (previous) {
          setPlanId(previous.id)
          setAmountState(String(previous.price))
        }
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load plans.'))
      .finally(() => !cancelled && setIsLoadingPlans(false))
    fetchPaymentMethods()
      .then((methods) => {
        if (cancelled) return
        setPaymentMethods(methods)
        setMethodState((current) => (methods.includes(current) ? current : methods[0]))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [member.plan, mode])

  const selectedPlan = useMemo(() => plans.find((p) => p.id === planId) ?? null, [plans, planId])
  /** When the new period begins: today, or the day after the current period for an upgrade. */
  const startDate = mode === 'upgrade' ? addDays(member.expiresAt, 1) : todayISO()
  const expiryDate = selectedPlan ? computeExpiry(startDate, selectedPlan) : null
  const needsReference = method !== 'Cash'
  /** Unpaid part of the plan price (0 when paid in full or more). */
  const balanceLeft = selectedPlan && Number(amount) > 0 ? Math.max(0, Math.round((selectedPlan.price - Number(amount)) * 100) / 100) : 0

  const clear = (field: Field) => {
    setError(null)
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  /** Picking a plan pre-fills the amount with its price unless the admin typed an amount. */
  const selectPlan = (nextId: string) => {
    setPlanId(nextId)
    clear('plan')
    const price = plans.find((p) => p.id === nextId)?.price
    if (!amountEdited && price !== undefined) setAmountState(String(price))
  }
  const setAmount = (value: string) => {
    setAmountEdited(true)
    setAmountState(value)
    clear('amount')
  }
  const setKeepBalance = (value: boolean) => {
    setKeepBalanceState(value)
    clear('dueOn')
  }
  const setDueOn = (value: string) => {
    setDueOnState(value)
    clear('dueOn')
  }
  const setMethod = (value: PaymentMethod) => {
    setMethodState(value)
    clear('referenceNo')
  }
  const setReferenceNo = (value: string) => {
    setReferenceNoState(value)
    clear('referenceNo')
  }

  const validate = (): ReinstateErrors => {
    const errors: ReinstateErrors = {}
    if (!selectedPlan) errors.plan = 'Choose the plan to continue on.'
    const parsed = Number(amount)
    if (!amount || !Number.isFinite(parsed) || parsed <= 0) errors.amount = 'Enter the amount paid.'
    if (needsReference && !referenceNo.trim()) errors.referenceNo = `Enter the ${method} reference number.`
    if (balanceLeft > 0 && keepBalance && dueOn && dueOn < todayISO()) errors.dueOn = 'The due date cannot be in the past.'
    return errors
  }

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    setError(null)
    if (Object.keys(errors).length || !selectedPlan) {
      setError('Please fix the highlighted fields.')
      return
    }
    try {
      setIsSubmitting(true)
      // The receipt goes to private storage first; the reinstatement then records its path.
      const receipt = needsReference && receiptFile ? await uploadReceipt(receiptFile) : null
      const save = mode === 'renew' ? renewMember : mode === 'upgrade' ? upgradeMember : reinstateMember
      const result = await save(member.id, {
        planId: selectedPlan.id,
        payment: {
          amount: Number(amount),
          method,
          referenceNo: needsReference ? referenceNo : undefined,
          receiptPath: receipt?.path,
          receiptFileName: receipt?.fileName,
        },
        balance: balanceLeft > 0 && keepBalance ? { dueOn: dueOn || undefined } : undefined,
      })
      onReinstated(result.member)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : mode === 'renew'
            ? 'Could not renew this membership. Please try again.'
            : mode === 'upgrade'
              ? 'Could not upgrade this plan. Please try again.'
              : 'Could not reinstate this account. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    plans,
    isLoadingPlans,
    paymentMethods,
    planId,
    selectPlan,
    selectedPlan,
    startDate,
    expiryDate,
    amount,
    setAmount,
    method,
    setMethod,
    needsReference,
    referenceNo,
    setReferenceNo,
    receiptFile,
    setReceiptFile,
    balanceLeft,
    keepBalance,
    setKeepBalance,
    dueOn,
    setDueOn,
    fieldErrors,
    error,
    isSubmitting,
    submit,
  }
}
