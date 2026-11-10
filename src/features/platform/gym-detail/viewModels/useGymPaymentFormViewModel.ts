import { useState, type FormEvent } from 'react'
import type { GymDetail, PaymentMethod } from '../../../../shared/models/types'
import { addMonthsToPeriod, currentPeriod, periodLabel, todayISO } from '../../../../shared/utils/dates'
import type { GymDetailVM } from './useGymDetailViewModel'

const METHODS: PaymentMethod[] = ['Cash', 'GCash', 'Maya', 'Bank Transfer']
type Field = 'period' | 'amount' | 'paidOn' | 'referenceNo'
export type GymPaymentErrors = Partial<Record<Field, string>>

/** Months a payment can be recorded for: unpaid months on record (oldest first), then next month. */
const openPeriods = (gym: GymDetail) => {
  const unpaid = gym.billingHistory.filter((r) => !r.paid).map((r) => ({ value: r.period, label: r.periodLabel, amount: r.amount }))
  const next = addMonthsToPeriod(currentPeriod(), 1)
  const hasNext = gym.billingHistory.some((r) => r.period === next)
  const nextAmount = gym.billingHistory[0]?.amount ?? 0
  return [...unpaid.reverse(), ...(hasNext ? [] : [{ value: next, label: `${periodLabel(next)} (advance)`, amount: nextAmount }])]
}

/** "Record a payment" form on the gym page. `initialPeriod` comes from ?pay=YYYY-MM (Gyms list / Billing page). */
export const useGymPaymentFormViewModel = (vm: GymDetailVM, initialPeriod: string | null) => {
  const gym = vm.gym!
  const periods = openPeriods(gym)
  const start = periods.find((p) => p.value === initialPeriod) ?? periods[0]

  const [period, setPeriodState] = useState(start?.value ?? '')
  const [amount, setAmountState] = useState(start ? String(start.amount) : '')
  const [method, setMethodState] = useState<PaymentMethod>('Cash')
  const [referenceNo, setReferenceNoState] = useState('')
  const [paidOn, setPaidOnState] = useState(todayISO)
  const [proof, setProof] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<GymPaymentErrors>({})

  const clear = (field: Field) => setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))

  /** Picking a month pre-fills its bill amount. */
  const setPeriod = (value: string) => {
    setPeriodState(value)
    const bill = periods.find((p) => p.value === value)
    if (bill) setAmountState(String(bill.amount))
    clear('period')
  }

  const validate = (): GymPaymentErrors => {
    const e: GymPaymentErrors = {}
    if (!periods.some((p) => p.value === period)) e.period = 'Choose the month this payment is for.'
    const n = Number(amount)
    if (!amount || !Number.isFinite(n) || n <= 0) e.amount = 'Enter the amount paid.'
    if (!paidOn) e.paidOn = 'Enter the date the gym paid.'
    else if (paidOn > todayISO()) e.paidOn = 'The date paid cannot be in the future.'
    if (method !== 'Cash' && !referenceNo.trim()) e.referenceNo = `Enter the ${method} reference number.`
    return e
  }

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) return
    // Saved right away in one request (with the proof); the dialog closes when it succeeds.
    await vm.recordPayment(
      { period, amount: Number(amount), method, referenceNo: referenceNo.trim() || undefined, paidOn, notes: notes.trim() || undefined },
      proof,
    )
  }

  return {
    periods,
    methods: METHODS,
    isSaving: vm.isRecording,
    disabled: gym.status === 'Archived',
    period,
    setPeriod,
    amount,
    setAmount: (v: string) => {
      setAmountState(v)
      clear('amount')
    },
    method,
    setMethod: (m: PaymentMethod) => {
      setMethodState(m)
      clear('referenceNo')
    },
    referenceNo,
    setReferenceNo: (v: string) => {
      setReferenceNoState(v)
      clear('referenceNo')
    },
    paidOn,
    setPaidOn: (v: string) => {
      setPaidOnState(v)
      clear('paidOn')
    },
    proof,
    setProof,
    notes,
    setNotes,
    errors,
    submit,
  }
}

export type GymPaymentFormVM = ReturnType<typeof useGymPaymentFormViewModel>
