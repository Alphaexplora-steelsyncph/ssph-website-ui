import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError, enrollMember, fetchPaymentMethods, fetchPlans, setMemberPhoto, uploadReceipt } from '../../../../shared/models/apiService'
import type { EnrollmentResult, PaymentMethod, PlanOption } from '../../../../shared/models/types'
import { useAuth } from '../../../../shared/auth/useAuth'
import { computeExpiry, todayISO } from '../../../../shared/utils/dates'
import { dayBefore, isLongPlan, nextMemberDueDate } from '../../../../shared/utils/memberDues'
import { resizeToSquareJpeg } from '../../../../shared/utils/resizeImage'
import { isEmail } from '../../../../shared/utils/validators'


type Field = 'fullName' | 'email' | 'phone' | 'plan' | 'startDate' | 'amount' | 'referenceNo' | 'dueOn' | 'periodAmount'
export type EnrollErrors = Partial<Record<Field, string>>

const PH_MOBILE = /^(09|\+639)\d{9}$/

export const useEnrollMemberViewModel = () => {
  const { user } = useAuth()
  const memberDueDay = user?.memberDueDay ?? null
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(['Cash'])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)

  // Member details
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('') // city / municipality only
  // Member photo taken at the desk (optional). Saved right after the enrollment.
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)

  // Plan
  const [planId, setPlanId] = useState('')
  const [startDate, setStartDate] = useState(todayISO)

  // Payment
  const [amount, setAmountState] = useState('')
  const [amountEdited, setAmountEdited] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [referenceNo, setReferenceNo] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [logFirstVisit, setLogFirstVisit] = useState(true)
  const [keepBalance, setKeepBalance] = useState(true)
  const [dueOn, setDueOnState] = useState('')
  // Gym with a fixed payment day: what the member pays for the days before that day
  const [periodAmount, setPeriodAmountState] = useState('')

  const [fieldErrors, setFieldErrors] = useState<EnrollErrors>({})

  /** Wraps a setter so editing a field clears that field's error. */
  const clearing = <T,>(field: Field, set: (value: T) => void) => (value: T) => {
    set(value)
    setError(null)
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<EnrollmentResult | null>(null)

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load plans.'))
      .finally(() => setIsLoadingPlans(false))
    fetchPaymentMethods()
      .then((methods) => {
        setPaymentMethods(methods)
        setMethod((current) => (methods.includes(current) ? current : methods[0]))
      })
      .catch(() => undefined)
  }, [])

  const selectedPlan = useMemo(() => plans.find((p) => p.id === planId) ?? null, [plans, planId])
  /**
   * Gym with a fixed member payment day + a plan longer than one month: the plan starts on the next payment day,
   * the member pays now only for the days before it, and the plan price is due on that day.
   */
  const paymentDayStart =
    memberDueDay && selectedPlan && startDate && isLongPlan(selectedPlan) ? nextMemberDueDate(startDate, memberDueDay) : null
  const aligned = !!paymentDayStart
  const coveredUntil = paymentDayStart ? dayBefore(paymentDayStart) : null
  const planStart = paymentDayStart ?? startDate
  const expiryDate = selectedPlan && planStart ? computeExpiry(planStart, selectedPlan) : null
  const needsReference = method !== 'Cash'
  /** Day-based passes (walk-ins) can be enrolled without an email. */
  const emailRequired = selectedPlan?.durationUnit !== 'days'
  const startsToday = startDate === todayISO()
  /** Unpaid part of the plan price (0 when paid in full or more). */
  const balanceLeft =
    !aligned && selectedPlan && Number(amount) > 0 ? Math.max(0, Math.round((selectedPlan.price - Number(amount)) * 100) / 100) : 0
  /** What is recorded as paid today. */
  const amountToPay = aligned ? periodAmount : amount

  /** Picking a plan pre-fills the amount with its price unless the admin typed an amount. */
  const selectPlan = (nextId: string) => {
    setPlanId(nextId)
    setError(null)
    setFieldErrors((prev) => ({ ...prev, plan: undefined, amount: amountEdited ? prev.amount : undefined, email: undefined }))
    const price = plans.find((p) => p.id === nextId)?.price
    if (!amountEdited && price !== undefined) setAmountState(String(price))
  }

  const setAmount = clearing<string>('amount', (value) => {
    setAmountEdited(true)
    setAmountState(value)
  })

  const validate = (): EnrollErrors => {
    const errors: EnrollErrors = {}
    if (fullName.trim().length < 2) errors.fullName = "Enter the member's full name."
    if (emailRequired && !email.trim()) errors.email = 'Email is required for monthly plans.'
    else if (email.trim() && !isEmail(email)) errors.email = 'Enter a valid email address.'
    const cleanPhone = phone.replace(/[\s-]/g, '')
    if (cleanPhone && !PH_MOBILE.test(cleanPhone)) errors.phone = 'Use a PH mobile number, e.g. 0917 123 4567.'
    if (!selectedPlan) errors.plan = 'Choose a plan.'
    if (!startDate) errors.startDate = 'Choose a start date.'
    if (aligned) {
      const parsed = Number(periodAmount)
      if (!periodAmount || !Number.isFinite(parsed) || parsed <= 0) errors.periodAmount = 'Enter how much the member pays until the payment day.'
    } else {
      const parsedAmount = Number(amount)
      if (!amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) errors.amount = 'Enter the amount paid.'
    }
    if (needsReference && !referenceNo.trim()) errors.referenceNo = `Enter the ${method} reference number.`
    if (balanceLeft > 0 && keepBalance && dueOn && dueOn < todayISO()) errors.dueOn = 'The due date cannot be in the past.'
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
      // The receipt goes to private storage first; the enrollment then records its path.
      const receipt = needsReference && receiptFile ? await uploadReceipt(receiptFile) : null
      const enrolled = await enrollMember({
        fullName,
        email: email.trim() || undefined,
        phone: phone.replace(/[\s-]/g, '') || undefined,
        city: city || undefined,
        planId: selectedPlan.id,
        startDate,
        payment: {
          amount: Number(amountToPay),
          method,
          referenceNo: needsReference ? referenceNo : undefined,
          receiptPath: receipt?.path,
          receiptFileName: receipt?.fileName,
        },
        balance: balanceLeft > 0 && keepBalance ? { dueOn: dueOn || undefined } : undefined,
        alignToDueDate: aligned,
        logFirstVisit: logFirstVisit && startsToday,
      })
      if (photo) {
        // The member is enrolled either way; a failed photo is retaken from the member's page.
        const saved = await resizeToSquareJpeg(photo)
          .then((blob) => setMemberPhoto(enrolled.member.id, blob))
          .catch(() => null)
        setPhotoFailed(!saved)
      }
      setResult(enrolled)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enrollment failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const acceptPhoto = (file: File) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setCapturing(false)
  }
  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhoto(null)
    setPhotoPreview(null)
  }

  const reset = () => {
    clearPhoto()
    setPhotoFailed(false)
    setFullName('')
    setEmail('')
    setPhone('')
    setCity('')
    setPlanId('')
    setStartDate(todayISO())
    setAmountState('')
    setAmountEdited(false)
    setMethod(paymentMethods[0] ?? 'Cash')
    setReferenceNo('')
    setReceiptFile(null)
    setLogFirstVisit(true)
    setKeepBalance(true)
    setDueOnState('')
    setPeriodAmountState('')
    setFieldErrors({})
    setError(null)
    setResult(null)
  }

  return {
    plans, isLoadingPlans, paymentMethods,
    fullName, setFullName: clearing('fullName', setFullName),
    email, setEmail: clearing('email', setEmail),
    phone, setPhone: clearing('phone', setPhone),
    city, setCity,
    emailRequired,
    photoPreview, capturing, openCapture: () => setCapturing(true), closeCapture: () => setCapturing(false), acceptPhoto, clearPhoto, photoFailed,
    planId, selectPlan, selectedPlan,
    startDate, setStartDate: clearing('startDate', setStartDate),
    expiryDate, startsToday,
    memberDueDay, aligned, paymentDayStart, coveredUntil, planStart,
    periodAmount, setPeriodAmount: clearing('periodAmount', setPeriodAmountState), amountToPay,
    amount, setAmount,
    method, setMethod: clearing('referenceNo', setMethod),
    needsReference,
    referenceNo, setReferenceNo: clearing('referenceNo', setReferenceNo),
    receiptFile, setReceiptFile, logFirstVisit, setLogFirstVisit,
    balanceLeft, keepBalance, setKeepBalance, dueOn, setDueOn: clearing('dueOn', setDueOnState),
    fieldErrors, error, isSubmitting, submit, result, reset,
  }
}

export type EnrollMemberVM = ReturnType<typeof useEnrollMemberViewModel>
