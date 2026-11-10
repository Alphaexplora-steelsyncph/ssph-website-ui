import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, fetchPaymentMethods, payInstallment, uploadReceipt } from '../../../../shared/models/apiService'
import type { MemberRecord, PaymentMethod } from '../../../../shared/models/types'
import { addMonths } from '../../../../shared/utils/dates'

type Field = 'amount' | 'referenceNo'
export type PayInstallmentErrors = Partial<Record<Field, string>>

const money = (n: number) => String(Math.round(n * 100) / 100)

/**
 * Monthly payments of a member: one payment can cover several months. Missed months are covered first
 * (a paused member starts on the months they are behind), then the rest is paid in advance.
 */
export const usePayInstallmentViewModel = (member: MemberRecord, onUpdated: (updated: MemberRecord) => void) => {
  const paid = member.installmentsPaid ?? 0
  const total = member.installmentsTotal ?? 0
  const left = Math.max(total - paid, 0)
  const perMonth = member.installmentAmount ?? 0
  const behind = member.monthsBehind ?? 0

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(['Cash'])
  const [months, setMonthsState] = useState(Math.min(Math.max(behind, 1), Math.max(left, 1)))
  const [amount, setAmountState] = useState(() => money(perMonth * Math.min(Math.max(behind, 1), Math.max(left, 1))))
  const [method, setMethodState] = useState<PaymentMethod>('Cash')
  const [referenceNo, setReferenceNoState] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<PayInstallmentErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  /** Last day covered after this payment (months are counted from the start of the term, so dates never drift). */
  const newPaidUntil = member.installmentStart ? addMonths(member.installmentStart, paid + months) : null
  /** Still paused after this payment: fewer months than the member is behind. */
  const stillPaused = behind > months

  const clear = (field: Field) => {
    setError(null)
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }
  /** Changing the months re-fills the amount with the monthly price × months. */
  const setMonths = (value: number) => {
    setMonthsState(value)
    setAmountState(money(perMonth * value))
    clear('amount')
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

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    const parsed = Number(amount)
    const errors: PayInstallmentErrors = {}
    if (!amount || !Number.isFinite(parsed) || parsed <= 0) errors.amount = 'Enter the amount paid.'
    if (needsReference && !referenceNo.trim()) errors.referenceNo = `Enter the ${method} reference number.`
    setFieldErrors(errors)
    setError(null)
    if (Object.values(errors).some(Boolean)) {
      setError('Please fix the highlighted fields.')
      return
    }
    try {
      setIsSubmitting(true)
      const receipt = needsReference && receiptFile ? await uploadReceipt(receiptFile) : null
      const result = await payInstallment(member.id, {
        months,
        payment: {
          amount: parsed,
          method,
          referenceNo: needsReference ? referenceNo : undefined,
          receiptPath: receipt?.path,
          receiptFileName: receipt?.fileName,
        },
      })
      onUpdated(result.member)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record this payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    paymentMethods, amount, setAmount, method, setMethod, needsReference, referenceNo, setReferenceNo,
    receiptFile, setReceiptFile, paid, total, left, perMonth, behind, months, setMonths, newPaidUntil, stillPaused,
    fieldErrors, error, isSubmitting, submit,
  }
}
