import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError, addExistingMember, fetchPlans } from '../../../../shared/models/apiService'
import type { AddExistingMemberResult, PlanOption } from '../../../../shared/models/types'
import { computeExpiry, todayISO } from '../../../../shared/utils/dates'
import { isEmail } from '../../../../shared/utils/validators'

type Field = 'fullName' | 'email' | 'phone' | 'plan' | 'memberSince' | 'expiresAt' | 'balance' | 'dueOn'
type Errors = Partial<Record<Field, string>>

const PH_MOBILE = /^(09|\+639)\d{9}$/

export const useAddExistingMemberViewModel = () => {
  const [fullName, setFullNameState] = useState('')
  const [email, setEmailState] = useState('')
  const [phone, setPhoneState] = useState('')
  const [city, setCity] = useState('') // city / municipality only
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [planId, setPlanId] = useState('')
  const [memberSince, setMemberSinceState] = useState('')
  const [expiresAt, setExpiresAtState] = useState('')
  const [expiryEdited, setExpiryEdited] = useState(false)
  const [balanceAmount, setBalanceAmountState] = useState('')
  const [balanceDueOn, setBalanceDueOnState] = useState('')

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
    suggestExpiry(plans.find((p) => p.id === id) ?? null, memberSince)
    clearError('plan', 'expiresAt')
  }
  const setMemberSince = (v: string) => { setMemberSinceState(v); suggestExpiry(selectedPlan, v); clearError('memberSince', 'expiresAt') }
  const setExpiresAt = (v: string) => { setExpiryEdited(true); setExpiresAtState(v); clearError('expiresAt') }

  const setBalanceAmount = (v: string) => { setBalanceAmountState(v); clearError('balance') }
  const setBalanceDueOn = (v: string) => { setBalanceDueOnState(v); clearError('dueOn') }
  const owed = Number(balanceAmount) > 0 ? Number(balanceAmount) : 0

  const status: 'Active' | 'Expired' | null = expiresAt ? (expiresAt < today ? 'Expired' : 'Active') : null

  const validate = (): Errors => {
    const errors: Errors = {}
    if (fullName.trim().length < 2) errors.fullName = "Enter the member's full name."
    if (!email.trim()) errors.email = 'Email is required so the member can log in.'
    else if (!isEmail(email)) errors.email = 'Enter a valid email address.'
    const cleanPhone = phone.replace(/[\s-]/g, '')
    if (cleanPhone && !PH_MOBILE.test(cleanPhone)) errors.phone = 'Use a PH mobile number, e.g. 0917 123 4567.'
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
          planId: selectedPlan.id,
          memberSince,
          expiresAt,
          balanceAmount: owed > 0 ? owed : undefined,
          balanceDueOn: owed > 0 && balanceDueOn ? balanceDueOn : undefined,
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
    setPlanId('')
    setMemberSinceState('')
    setExpiresAtState('')
    setExpiryEdited(false)
    setBalanceAmountState('')
    setBalanceDueOnState('')
    setFieldErrors({})
    setError(null)
    setResult(null)
  }

  return {
    today,
    fullName, setFullName, email, setEmail, phone, setPhone, city, setCity,
    plans, isLoadingPlans, planId, setPlan, memberSince, setMemberSince, expiresAt, setExpiresAt, status,
    balanceAmount, setBalanceAmount, balanceDueOn, setBalanceDueOn, owed,
    fieldErrors, error, isSubmitting, submit, result, reset,
  }
}

export type AddExistingMemberVM = ReturnType<typeof useAddExistingMemberViewModel>
