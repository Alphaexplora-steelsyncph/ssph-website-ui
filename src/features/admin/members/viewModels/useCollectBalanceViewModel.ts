import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, collectBalance, fetchPaymentMethods, setBalanceDueDate, uploadReceipt } from '../../../../shared/models/apiService'
import type { MemberRecord, PaymentMethod } from '../../../../shared/models/types'
import { todayISO } from '../../../../shared/utils/dates'

type Field = 'amount' | 'referenceNo' | 'dueOn'
export type CollectBalanceErrors = Partial<Record<Field, string>>

const round2 = (n: number) => Math.round(n * 100) / 100

/** Record a payment against a member's balance, or just move the due date. */
export const useCollectBalanceViewModel = (member: MemberRecord, onUpdated: (updated: MemberRecord) => void) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(['Cash'])
  const [amount, setAmountState] = useState(String(member.balanceDue))
  const [method, setMethodState] = useState<PaymentMethod>('Cash')
  const [referenceNo, setReferenceNoState] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [dueOn, setDueOnState] = useState(member.balanceDueOn ?? '')

  const [fieldErrors, setFieldErrors] = useState<CollectBalanceErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDate, setIsSavingDate] = useState(false)

  useEffect(() => {
    let cancelled = false
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
  }, [])

  const needsReference = method !== 'Cash'
  const parsed = Number(amount)
  /** What the member will still owe after this payment. */
  const remaining = Number.isFinite(parsed) && parsed > 0 ? Math.max(0, round2(member.balanceDue - parsed)) : member.balanceDue
  const dueChanged = dueOn !== (member.balanceDueOn ?? '')

  const clear = (field: Field) => {
    setError(null)
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }
  const setAmount = (value: string) => {
    setAmountState(value)
    clear('amount')
  }
  const setMethod = (value: PaymentMethod) => {
    setMethodState(value)
    clear('referenceNo')
  }
  const setReferenceNo = (value: string) => {
    setReferenceNoState(value)
    clear('referenceNo')
  }
  const setDueOn = (value: string) => {
    setDueOnState(value)
    clear('dueOn')
  }

  /** A changed date must not be in the past. An unchanged (possibly overdue) date is left alone. */
  const dueError = (): string | undefined => (dueOn && dueChanged && dueOn < todayISO() ? 'The due date cannot be in the past.' : undefined)

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    const errors: CollectBalanceErrors = {}
    if (!amount || !Number.isFinite(parsed) || parsed <= 0) errors.amount = 'Enter the amount paid.'
    else if (parsed > member.balanceDue) errors.amount = `That is more than the balance of ${member.balanceDue}.`
    if (needsReference && !referenceNo.trim()) errors.referenceNo = `Enter the ${method} reference number.`
    if (remaining > 0) errors.dueOn = dueError()
    setFieldErrors(errors)
    setError(null)
    if (Object.values(errors).some(Boolean)) {
      setError('Please fix the highlighted fields.')
      return
    }
    try {
      setIsSubmitting(true)
      const receipt = needsReference && receiptFile ? await uploadReceipt(receiptFile) : null
      const result = await collectBalance(member.id, {
        payment: {
          amount: parsed,
          method,
          referenceNo: needsReference ? referenceNo : undefined,
          receiptPath: receipt?.path,
          receiptFileName: receipt?.fileName,
        },
        dueOn: remaining > 0 && dueChanged && dueOn ? dueOn : undefined,
      })
      onUpdated(result.member)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record this payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /** Change the due date only (no payment). An empty date removes it. */
  const saveDueDate = async () => {
    const problem = dueError()
    setFieldErrors({ dueOn: problem })
    if (problem) return
    try {
      setIsSavingDate(true)
      setError(null)
      onUpdated(await setBalanceDueDate(member.id, dueOn || null))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change the due date.')
    } finally {
      setIsSavingDate(false)
    }
  }

  return {
    paymentMethods, amount, setAmount, method, setMethod, needsReference, referenceNo, setReferenceNo,
    receiptFile, setReceiptFile, dueOn, setDueOn, dueChanged, remaining,
    fieldErrors, error, isSubmitting, isSavingDate, submit, saveDueDate,
  }
}
