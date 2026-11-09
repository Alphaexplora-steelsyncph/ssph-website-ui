import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../../shared/auth/useAuth'
import {
  ApiError,
  fetchPackages,
  fetchPlatformGym,
  inviteGymAdmin,
  resetGymAdminPassword,
  setGymAdminDisabled,
  setGymArchived,
  setGymFeatureOverride,
  setGymMemberDues,
  setGymSuspended,
  recordGymPayment,
  uploadBillingProof,
  voidGymPayment,
  startImpersonation,
  updateGymProfile,
} from '../../../../shared/models/apiService'
import type { FeatureKey } from '../../../../shared/features/featureCatalog'
import type { GymDetail, GymProfileInput, PackageOption, RecordGymPaymentPayload } from '../../../../shared/models/types'

export interface IssuedLink {
  title: string
  token: string
  email: string
  description: string
}

export const useGymDetailViewModel = () => {
  const { gymId = '' } = useParams()
  // ?pay=YYYY-MM from the Gyms list / Billing page: preselects that month in the payment form
  const [searchParams] = useSearchParams()
  const payFor = searchParams.get('pay')
  const { beginImpersonation } = useAuth()

  const [gym, setGym] = useState<GymDetail | null>(null)
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null) // which action is running
  const [issuedLink, setIssuedLink] = useState<IssuedLink | null>(null)
  const [profileVersion, setProfileVersion] = useState(0) // bumps to reset the profile form

  useEffect(() => {
    Promise.all([fetchPlatformGym(gymId), fetchPackages()])
      .then(([detail, pkgs]) => {
        setGym(detail)
        setPackages(pkgs)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load this gym.'))
      .finally(() => setIsLoading(false))
  }, [gymId])

  /** Runs one action, shows its error or success message, and stores the refreshed gym. */
  const run = useCallback(async <T,>(key: string, action: () => Promise<T>, success?: string): Promise<T | undefined> => {
    try {
      setBusy(key)
      setError(null)
      setNotice(null)
      const result = await action()
      if (success) setNotice(success)
      return result
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      return undefined
    } finally {
      setBusy(null)
    }
  }, [])

  const apply = (detail: GymDetail | undefined) => detail && setGym(detail)

  const saveProfile = async (input: GymProfileInput) => {
    const detail = await run('profile', () => updateGymProfile(gymId, input), 'Gym profile saved.')
    if (detail) {
      setGym(detail)
      setProfileVersion((v) => v + 1)
    }
    return !!detail
  }

  const suspend = (note: string) => run('suspend', () => setGymSuspended(gymId, true, note), 'Gym suspended.').then(apply)
  const liftSuspension = () => run('suspend', () => setGymSuspended(gymId, false), 'Manual suspension lifted.').then(apply)
  const archive = () => run('archive', () => setGymArchived(gymId, true), 'Gym archived.').then(apply)
  const restore = () => run('archive', () => setGymArchived(gymId, false), 'Gym restored.').then(apply)

  /** Proof first (private storage), then the payment that points to it. Resolves true when saved. */
  const recordPayment = async (payload: Omit<RecordGymPaymentPayload, 'proofPath' | 'proofFileName'>, proof: File | null) => {
    const detail = await run(
      'pay',
      async () => {
        const uploaded = proof ? await uploadBillingProof(gymId, proof) : null
        return recordGymPayment(gymId, { ...payload, proofPath: uploaded?.path, proofFileName: uploaded?.fileName })
      },
      'Payment recorded.',
    )
    apply(detail)
    return !!detail
  }

  const voidPayment = async (period: string, reason: string) => {
    const detail = await run(`void:${period}`, () => voidGymPayment(gymId, period, reason), 'Payment voided. The month is unpaid again.')
    apply(detail)
    return !!detail
  }

  const setMemberDues = (enabled: boolean) =>
    run('memberDues', () => setGymMemberDues(gymId, enabled), enabled ? 'Member payment day turned on. The gym admin picks the day in Settings.' : 'Member payment day turned off.').then(apply)

  const setFeature = (key: FeatureKey, value: boolean | null) =>
    run(`feature:${key}`, () => setGymFeatureOverride(gymId, key, value)).then(apply)

  const inviteAdmin = async (email: string) => {
    const result = await run('invite', () => inviteGymAdmin(gymId, email), 'Admin invited.')
    if (!result) return false
    setGym(result.detail)
    setIssuedLink({
      title: 'Gym admin invite',
      token: result.inviteToken,
      email: email.trim().toLowerCase(),
      description: `Send this link to ${email.trim()} so they can set a password. The backend will email it automatically.`,
    })
    return true
  }

  const toggleAdmin = (userId: string, disabled: boolean) =>
    run(`admin:${userId}`, () => setGymAdminDisabled(gymId, userId, disabled), disabled ? 'Admin disabled.' : 'Admin enabled.').then(apply)

  const resetPassword = async (userId: string) => {
    const result = await run(`admin:${userId}`, () => resetGymAdminPassword(gymId, userId), 'Password reset link created.')
    if (result) {
      setIssuedLink({
        title: 'Password reset link',
        token: result.resetToken,
        email: result.email,
        description: `Send this one-time link to ${result.email} so they can set a new password.`,
      })
    }
  }

  const viewAsGym = async () => {
    const session = await run('impersonate', () => startImpersonation(gymId))
    if (session) {
      beginImpersonation(session)
      // Full reload: switching roles mid-render would let the platform route guard redirect first.
      window.location.replace('/admin')
    }
  }

  return {
    gym, payFor, packages, isLoading, error, notice, busy, issuedLink, profileVersion,
    clearIssuedLink: () => setIssuedLink(null),
    saveProfile, suspend, liftSuspension, archive, restore, recordPayment, voidPayment, setFeature, setMemberDues,
    inviteAdmin, toggleAdmin, resetPassword, viewAsGym,
  }
}

export type GymDetailVM = ReturnType<typeof useGymDetailViewModel>
