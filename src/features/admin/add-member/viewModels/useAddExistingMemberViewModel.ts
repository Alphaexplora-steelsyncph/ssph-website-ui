import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError, addExistingMember, fetchPlans } from '../../../../shared/models/apiService'
import type { AddExistingMemberResult, PaymentOption, PlanOption } from '../../../../shared/models/types'
import { addMonths, computeExpiry, todayISO } from '../../../../shared/utils/dates'
import { offersMonthly } from '../../../../shared/utils/planBilling'
import { isEmail } from '../../../../shared/utils/validators'

type Field = 'fullName' | 'email' | 'phone' | 'plan' | 'memberSince' | 'expiresAt' | 'balance' | 'dueOn' | 'privacyConsent'
type Errors = Partial<Record<Field, string>>

const PH_MOBILE = /^(09|\+639)\d{9}$/

export const useAddExistingMemberViewModel = () => {
  const [fullName, setFullNameState] = useState('')
  const [email, setEmailState] = useState('')
  const [phone, setPhoneState] = useState('')
  const [city, setCity] = useState('') // city / municipality only
  const [privacyConsent, setPrivacyConsentState] = useState(false) // the front desk confirms the member agreed
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [planId, setPlanId] = useState('')
  const [memberSince, setMemberSinceState] = useState('')
  const [expiresAt, setExpiresAtState] = useState('')
  const [expiryEdited, setExpiryEdited] = useState(false)
  const [balanceAmount, setBalanceAmountState] = useState('')
  const [balanceDueOn, setBalanceDueOnState] = useState('')
  // Full payment or installment; for installment, how many of the plan's months they already paid
  const [paymentOption, setPaymentOptionState] = useState<PaymentOption>('full')
  const [monthsPaid, setMonthsPaid] = useState<number | null>(null) // null = suggest "paid up to today"

  const [fieldErrors, setFieldErrors] = useState<Errors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<AddExistingMemberResult | null>(null)

  const today = todayISO()

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load plans.'))
      .finally(() => setIsLoadingPlans(false))
  }, [])

  const selectedPlan = useMemo(() => plans.find((p) => p.id === planId) ?? null, [plans, planId])

  const clearError = (...fields: Field[]) => {
    setError(null)
    setFieldErrors((prev) => {
      const next = { ...prev }
      fields.forEach((f) => delete next[f])
      return next
    })
  }

  /** Until the admin types an expiry, keep it in sync with plan + member-since. */
  const suggestExpiry = (nextPlan: PlanOption | null, since: string) => {
    if (!expiryEdited && nextPlan && since) setExpiresAtState(computeExpiry(since, nextPlan))
  }

  const setFullName = (v: string) => { setFullNameState(v); clearError('fullName') }
  const setEmail = (v: string) => { setEmailState(v); clearError('email') }
  const setPhone = (v: string) => { setPhoneState(v); clearError('phone') }
  const setPlan = (id: string) => {
    setPlanId(id)
    setPaymentOptionState('full')
    setMonthsPaid(null)
    suggestExpiry(plans.find((p) => p.id === id) ?? null, memberSince)
    clearError('plan', 'expiresAt')
  }
  const setMemberSince = (v: string) => { setMemberSinceState(v); suggestExpiry(selectedPlan, v); clearError('memberSince', 'expiresAt') }
  const setExpiresAt = (v: string) => { setExpiryEdited(true); setExpiresAtState(v); clearError('expiresAt') }

  const installment = paymentOption === 'monthly' && offersMonthly(selectedPlan)
  /** Installment: the plan's months counted back from its end date. */
  const termStart = installment && selectedPlan && expiresAt ? addMonths(expiresAt, -selectedPlan.durationValue) : null
  /** Suggested: just enough months so the member is covered today. */
  const suggestedMonths = (() => {
    if (!termStart || !selectedPlan) return 0
    let n = 0
    while (n < selectedPlan.durationValue && addMonths(termStart, n) < today) n += 1
    return n
  })()
  const monthsAlreadyPaid = Math.min(monthsPaid ?? suggestedMonths, selectedPlan?.durationValue ?? 0)
  const paidUntil = termStart ? addMonths(termStart, monthsAlreadyPaid) : null
  const setPaymentOption = (v: PaymentOption) => { setPaymentOptionState(v); setMonthsPaid(null); clearError('balance') }

  const setBalanceAmount = (v: string) => { setBalanceAmountState(v); clearError('balance') }
  const setBalanceDueOn = (v: string) => { setBalanceDueOnState(v); clearError('dueOn') }
  const owed = !installment && Number(balanceAmount) > 0 ? Number(balanceAmount) : 0

  const status: 'Active' | 'Paused' | 'Expired' | null = expiresAt
    ? expiresAt < today ? 'Expired' : paidUntil && paidUntil < today ? 'Paused' : 'Active'
    : null

  const validate = (): Errors => {
    const errors: Errors = {}
    if (fullName.trim().length < 2) errors.fullName = "Enter the member's full name."
    if (!email.trim()) errors.email = 'Email is required so the member can log in.'
    else if (!isEmail(email)) errors.email = 'Enter a valid email address.'
    const cleanPhone = phone.replace(/[\s-]/g, '')
    if (cleanPhone && !PH_MOBILE.test(cleanPhone)) errors.phone = 'Use a PH mobile number, e.g. 0917 123 4567.'
    if (!privacyConsent) errors.privacyConsent = 'Confirm that the member has read the privacy notice and agrees.'
    if (!selectedPlan) errors.plan = 'Choose their current plan.'
    if (!memberSince) errors.memberSince = 'Enter when they first joined.'
    else if (memberSince > today) errors.memberSince = 'This date cannot be in the future.'
    if (!expiresAt) errors.expiresAt = 'Enter when their current plan ends.'
    else if (memberSince && expiresAt < memberSince) errors.expiresAt = 'Must be on or after the member-since date.'
    if (balanceAmount && (!Number.isFinite(Number(balanceAmount)) || Number(balanceAmount) < 0)) errors.balance = 'Enter the amount they still owe.'
    if (owed > 0 && balanceDueOn && balanceDueOn < today) errors.dueOn = 'The due date cannot be in the past.'
    return errors
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    setError(null)
    if (Object.keys(errors).length || !selectedPlan) {
      setError('Please fix the highlighted fields.')
      return
    }
    try {
      setIsSubmitting(true)
      setResult(
        await addExistingMember({
          fullName,
          email,
          phone: phone.replace(/[\s-]/g, '') || undefined,
          city: city || undefined,
          privacyConsent: true,
          planId: selectedPlan.id,
          memberSince,
          expiresAt,
          balanceAmount: owed > 0 ? owed : undefined,
          balanceDueOn: owed > 0 && balanceDueOn ? balanceDueOn : undefined,
          paymentOption: installment ? 'monthly' : 'full',
          monthsAlreadyPaid: installment ? monthsAlreadyPaid : undefined,
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add this member. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setFullNameState('')
    setEmailState('')
    setPhoneState('')
    setCity('')
    setPrivacyConsentState(false)
    setPlanId('')
    setMemberSinceState('')
    setExpiresAtState('')
    setExpiryEdited(false)
    setBalanceAmountState('')
    setBalanceDueOnState('')
    setPaymentOptionState('full')
    setMonthsPaid(null)
    setFieldErrors({})
    setError(null)
    setResult(null)
  }

  return {
    today,
    fullName, setFullName, email, setEmail, phone, setPhone, city, setCity,
    privacyConsent, setPrivacyConsent: (v: boolean) => { setPrivacyConsentState(v); clearError('privacyConsent') },
    plans, isLoadingPlans, planId, setPlan, selectedPlan,
    paymentOption, setPaymentOption, installment, monthsAlreadyPaid, setMonthsAlreadyPaid: setMonthsPaid, termStart, paidUntil, memberSince, setMemberSince, expiresAt, setExpiresAt, status,
    balanceAmount, setBalanceAmount, balanceDueOn, setBalanceDueOn, owed,
    fieldErrors, error, isSubmitting, submit, result, reset,
  }
}

export type AddExistingMemberVM = ReturnType<typeof useAddExistingMemberViewModel>
