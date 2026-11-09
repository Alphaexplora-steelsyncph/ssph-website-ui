import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import {
  ApiError,
  fetchMember,
  fetchMemberVisits,
  removeMemberPhoto,
  setMemberBlocked,
  setMemberPhoto,
  updateMember,
} from '../../../../shared/models/apiService'
import type { MemberDetail, MemberRecord, Visit } from '../../../../shared/models/types'
import { resizeToSquareJpeg } from '../../../../shared/utils/resizeImage'
import { isEmail } from '../../../../shared/utils/validators'

type Field = 'fullName' | 'phone' | 'email' | 'city'
export type MemberDetailErrors = Partial<Record<Field, string>>

const PH_MOBILE = /^(09|\+639)\d{9}$/
const VISITS_SHOWN = 10

/** One member for the admin: contact details (editable), membership summary and recent visits. */
export const useMemberDetailViewModel = (memberId: string) => {
  const { hasPermission } = useAuth()
  const canEdit = hasPermission(PERMISSIONS.ENROLL_MEMBERS)

  const [detail, setDetail] = useState<MemberDetail | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [totalVisits, setTotalVisits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [visitsError, setVisitsError] = useState<string | null>(null)

  const [fullName, setFullNameState] = useState('')
  const [phone, setPhoneState] = useState('')
  const [city, setCityState] = useState('') // city / municipality only
  const [email, setEmailState] = useState('')
  const [fieldErrors, setFieldErrors] = useState<MemberDetailErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | undefined>()
  const [confirmingEmail, setConfirmingEmail] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [isSavingPhoto, setIsSavingPhoto] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [blockError, setBlockError] = useState<string | null>(null)
  const [confirmingPhotoRemoval, setConfirmingPhotoRemoval] = useState(false)
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const fill = useCallback((next: MemberDetail) => {
    setDetail(next)
    setFullNameState(next.member.fullName)
    setPhoneState(next.member.phone ?? '')
    setCityState(next.member.city ?? '')
    setEmailState(next.member.email)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchMember(memberId)
      .then((next) => !cancelled && fill(next))
      .catch((err) => !cancelled && setLoadError(err instanceof ApiError ? err.message : 'Could not load this member.'))
      .finally(() => !cancelled && setIsLoading(false))
    // Visits load on their own so a slow list never blocks the form.
    if (hasPermission(PERMISSIONS.VIEW_VISITS)) {
      fetchMemberVisits(memberId, VISITS_SHOWN)
        .then((res) => {
          if (cancelled) return
          setVisits(res.visits)
          setTotalVisits(res.total)
        })
        .catch((err) => !cancelled && setVisitsError(err instanceof ApiError ? err.message : 'Could not load visits.'))
    }
    return () => {
      cancelled = true
    }
  }, [memberId, fill, hasPermission])

  const member = detail?.member ?? null
  const hasLogin = detail?.hasLogin ?? false
  const dirty =
    !!member &&
    (fullName.trim() !== member.fullName ||
      phone.replace(/[\s-]/g, '') !== (member.phone ?? '') ||
      city !== (member.city ?? '') ||
      email.trim().toLowerCase() !== member.email)

  /** Changing the email of a member who has a login also changes how they sign in, so it is confirmed first. */
  const emailChanged = !!member && email.trim().toLowerCase() !== member.email
  const needsEmailConfirm = hasLogin && emailChanged

  const edited =
    <T>(field: Field, set: (value: T) => void) =>
    (value: T) => {
      set(value)
      setConfirmingEmail(false)
      setSaved(false)
      setError(null)
      setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    }

  const validate = (): MemberDetailErrors => {
    const errors: MemberDetailErrors = {}
    if (fullName.trim().length < 2) errors.fullName = "Enter the member's full name."
    const cleanPhone = phone.replace(/[\s-]/g, '')
    if (cleanPhone && !PH_MOBILE.test(cleanPhone)) errors.phone = 'Use a PH mobile number, e.g. 0917 123 4567.'
    if (member?.email && !email.trim()) errors.email = 'The email cannot be removed once it is set.'
    else if (email.trim() && !isEmail(email)) errors.email = 'Enter a valid email address.'
    return errors
  }

  const save = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!canEdit || !member) return
    const errors = validate()
    setFieldErrors(errors)
    setError(null)
    if (Object.keys(errors).length) {
      setError('Please fix the highlighted fields.')
      return
    }
    if (needsEmailConfirm && !confirmingEmail) {
      setConfirmingEmail(true)
      return
    }
    try {
      setIsSaving(true)
      const next = await updateMember(memberId, {
        fullName,
        phone: phone.replace(/[\s-]/g, ''),
        city,
        email: email.trim(),
      })
      setConfirmingEmail(false)
      fill(next)
      setInviteToken(next.inviteToken)
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  /** Replaces the member record but keeps the photo link (endpoints that change the plan do not send it). */
  const keepPhoto = (updated: MemberRecord) =>
    setDetail((prev) => (prev ? { ...prev, member: { ...updated, photoUrl: updated.photoUrl ?? prev.member.photoUrl } } : prev))

  /** After an upgrade the new plan and expiry replace the old ones; the photo link and any form edits stay. */
  const onUpgraded = (updated: MemberRecord) => {
    keepPhoto(updated)
    setUpgradeOpen(false)
  }

  const photoUrl = member?.photoUrl

  /** Front desk takes / picks the photo; it is cropped and shrunk in the browser first. */
  const savePhoto = async (file: File) => {
    if (!canEdit) return
    try {
      setIsSavingPhoto(true)
      setPhotoError(null)
      const updated = await setMemberPhoto(memberId, await resizeToSquareJpeg(file))
      setDetail((prev) => (prev ? { ...prev, member: { ...prev.member, photoUrl: updated.photoUrl } } : prev))
      setCapturing(false)
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Could not save the photo.')
      setCapturing(false)
    } finally {
      setIsSavingPhoto(false)
    }
  }

  /** Block needs a reason (shown in the audit log); unblock does not. */
  const setBlocked = async (blocked: boolean, reason?: string) => {
    if (!canEdit) return false
    try {
      setIsBlocking(true)
      setBlockError(null)
      keepPhoto(await setMemberBlocked(memberId, blocked, reason))
      setBlockOpen(false)
      return true
    } catch (err) {
      setBlockError(err instanceof ApiError ? err.message : 'Could not change check-in.')
      return false
    } finally {
      setIsBlocking(false)
    }
  }

  /** Two steps (ask, then confirm) so one stray click does not delete a photo. */
  const removePhoto = async () => {
    if (!canEdit) return
    if (!confirmingPhotoRemoval) {
      setConfirmingPhotoRemoval(true)
      return
    }
    try {
      setIsRemovingPhoto(true)
      setPhotoError(null)
      await removeMemberPhoto(memberId)
      setDetail((prev) => (prev ? { ...prev, member: { ...prev.member, photoUrl: undefined } } : prev))
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Could not remove the photo.')
    } finally {
      setIsRemovingPhoto(false)
      setConfirmingPhotoRemoval(false)
    }
  }

  const reset = () => {
    if (!detail) return
    fill(detail)
    setConfirmingEmail(false)
    setFieldErrors({})
    setError(null)
    setSaved(false)
  }

  return {
    member,
    hasLogin,
    isLoading,
    loadError,
    visits,
    totalVisits,
    visitsShown: VISITS_SHOWN,
    visitsError,
    canEdit,
    dirty,
    needsEmailConfirm,
    confirmingEmail,
    cancelEmailConfirm: () => setConfirmingEmail(false),
    fullName,
    setFullName: edited('fullName', setFullNameState),
    phone,
    setPhone: edited('phone', setPhoneState),
    city,
    setCity: edited('city', setCityState),
    email,
    setEmail: edited('email', setEmailState),
    fieldErrors,
    error,
    isSaving,
    saved,
    inviteToken,
    save,
    reset,
    upgradeOpen,
    openUpgrade: () => setUpgradeOpen(true),
    closeUpgrade: () => setUpgradeOpen(false),
    onUpgraded,
    capturing,
    openCapture: () => setCapturing(true),
    closeCapture: () => setCapturing(false),
    savePhoto,
    isSavingPhoto,
    blockOpen,
    openBlock: () => {
      setBlockError(null)
      setBlockOpen(true)
    },
    closeBlock: () => setBlockOpen(false),
    setBlocked,
    isBlocking,
    blockError,
    photoUrl,
    removePhoto,
    confirmingPhotoRemoval,
    cancelPhotoRemoval: () => setConfirmingPhotoRemoval(false),
    isRemovingPhoto,
    photoError,
  }
}

export type MemberDetailVM = ReturnType<typeof useMemberDetailViewModel>
