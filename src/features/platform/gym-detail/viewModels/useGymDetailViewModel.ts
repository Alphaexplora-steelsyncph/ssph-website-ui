import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../../shared/auth/useAuth'
import {
  ApiError,
  fetchPackages,
  fetchPlatformGym,
  setGymArchived,
  setGymSuspended,
  saveGymChanges,
  startImpersonation,
} from '../../../../shared/models/apiService'
import type { GymChanges, GymDetail, GymFeatureState, GymProfileInput, PackageOption, RecordGymPaymentPayload } from '../../../../shared/models/types'

type NewPayment = Omit<RecordGymPaymentPayload, 'proofPath' | 'proofFileName'>

const profileOf = (g: GymDetail): GymProfileInput => ({
  name: g.name,
  slug: g.slug,
  address: g.address,
  contactName: g.contactName,
  contactEmail: g.contactEmail,
  contactPhone: g.contactPhone,
  packageId: g.packageId,
  billingDay: g.billingDay,
})
const EMPTY_ADMINS = { invite: [] as string[], disable: [] as string[], enable: [] as string[], resetPassword: [] as string[] }

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
  const [issuedLinks, setIssuedLinks] = useState<IssuedLink[]>([])
  const [profileVersion, setProfileVersion] = useState(0) // bumps to reset the profile form

  /* ---------- edit mode: everything below is kept on the page until Save (one request) ---------- */
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<GymProfileInput | null>(null)
  const [memberDues, setMemberDuesDraft] = useState<boolean | null>(null)
  const [features, setFeatures] = useState<Record<string, boolean | null>>({}) // staged overrides by feature key
  const [admins, setAdmins] = useState(EMPTY_ADMINS)
  const [voids, setVoids] = useState<{ period: string; reason: string }[]>([])
  // "Record a payment" works on its own (no Edit needed); opened right away from a ?pay= link.
  const [paymentOpen, setPaymentOpen] = useState(!!payFor)

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

  const resetDrafts = (detail: GymDetail | null) => {
    setProfile(detail ? profileOf(detail) : null)
    setMemberDuesDraft(null)
    setFeatures({})
    setAdmins(EMPTY_ADMINS)
    setVoids([])
  }

  const startEditing = () => {
    resetDrafts(gym)
    setNotice(null)
    setError(null)
    setEditing(true)
  }
  const cancelEditing = () => {
    resetDrafts(gym)
    setError(null)
    setEditing(false)
  }

  const setProfileField = <K extends keyof GymProfileInput>(key: K, value: GymProfileInput[K]) =>
    setProfile((p) => (p ? { ...p, [key]: value } : p))

  /** Features as they will be after Save. */
  const featureView = (f: GymFeatureState): GymFeatureState & { staged: boolean } => {
    if (!(f.key in features)) return { ...f, staged: false }
    const override = features[f.key]
    return { ...f, override, enabled: override === null ? f.includedInPackage : override, staged: true }
  }
  const setFeature = (key: string, value: boolean | null) => {
    const current = gym?.features.find((f) => f.key === key)
    setFeatures((prev) => {
      const next = { ...prev }
      if (current && current.override === value) delete next[key]
      else next[key] = value
      return next
    })
  }

  const memberDuesView = memberDues ?? gym?.memberDuesEnabled ?? false
  const setMemberDues = (enabled: boolean) => setMemberDuesDraft(enabled === gym?.memberDuesEnabled ? null : enabled)

  const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  /** Disable an active admin / enable a disabled one (toggling again undoes it). */
  const toggleAdmin = (userId: string, disable: boolean) =>
    setAdmins((a) => (disable ? { ...a, disable: toggleIn(a.disable, userId) } : { ...a, enable: toggleIn(a.enable, userId) }))
  const resetPassword = (userId: string) => setAdmins((a) => ({ ...a, resetPassword: toggleIn(a.resetPassword, userId) }))
  const inviteAdmin = (email: string) => {
    const clean = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Enter a valid email address to invite.')
      return false
    }
    if (admins.invite.includes(clean) || gym?.admins.some((x) => x.email === clean)) {
      setError(`${clean} is already on the list.`)
      return false
    }
    setError(null)
    setAdmins((a) => ({ ...a, invite: [...a.invite, clean] }))
    return true
  }
  const removeInvite = (email: string) => setAdmins((a) => ({ ...a, invite: a.invite.filter((e) => e !== email) }))

  const voidPayment = (period: string, reason: string) => {
    setVoids((v) => [...v.filter((x) => x.period !== period), { period, reason }])
    return true
  }
  const undoVoid = (period: string) => setVoids((v) => v.filter((x) => x.period !== period))
  /** "Record a payment": saved right away in one request (the proof goes with it), without Edit. */
  const recordPayment = async (record: NewPayment, proof: File | null) => {
    const result = await run('pay', () => saveGymChanges(gymId, { billing: { record, void: [] } }, proof), 'Payment recorded.')
    if (!result) return false
    setGym(result.detail)
    setPaymentOpen(false)
    return true
  }

  /** What Save would send. */
  const changes = useMemo((): GymChanges => {
    if (!gym) return {}
    const out: GymChanges = {}
    if (profile && JSON.stringify(profile) !== JSON.stringify(profileOf(gym))) out.profile = profile
    if (memberDues !== null) out.memberDuesEnabled = memberDues
    const feats = Object.entries(features).map(([key, value]) => ({ key: key as GymFeatureState['key'], value }))
    if (feats.length) out.features = feats
    if (admins.invite.length || admins.disable.length || admins.enable.length || admins.resetPassword.length) out.admins = admins
    if (voids.length) out.billing = { void: voids }
    return out
  }, [gym, profile, memberDues, features, admins, voids])
  const isDirty = Object.keys(changes).length > 0

  /** Save: every change in one request (the proof of payment goes with it). No changes = just leave edit mode. */
  const save = async () => {
    if (!isDirty) {
      setEditing(false)
      return
    }
    const result = await run('save', () => saveGymChanges(gymId, changes, null), 'Changes saved.')
    if (!result) return
    setGym(result.detail)
    resetDrafts(result.detail)
    setProfileVersion((v) => v + 1)
    setEditing(false)
    const links = result.issuedLinks.map((l) => ({
      title: l.kind === 'invite' ? 'Gym admin invite' : 'Password reset link',
      token: l.token,
      email: l.email,
      description:
        l.kind === 'invite'
          ? `Send this link to ${l.email} so they can set a password. The backend will email it automatically.`
          : `Send this one-time link to ${l.email} so they can set a new password.`,
    }))
    setIssuedLinks(links)
  }

  const suspend = (note: string) => run('suspend', () => setGymSuspended(gymId, true, note), 'Gym suspended.').then(apply)
  const liftSuspension = () => run('suspend', () => setGymSuspended(gymId, false), 'Manual suspension lifted.').then(apply)
  const archive = () => run('archive', () => setGymArchived(gymId, true), 'Gym archived.').then(apply)
  const restore = () => run('archive', () => setGymArchived(gymId, false), 'Gym restored.').then(apply)

  const viewAsGym = async () => {
    const session = await run('impersonate', () => startImpersonation(gymId))
    if (session) {
      beginImpersonation(session)
      // Full reload: switching roles mid-render would let the platform route guard redirect first.
      window.location.replace('/admin')
    }
  }

  return {
    gym, payFor, packages, isLoading, error, notice, busy, issuedLinks, profileVersion,
    clearIssuedLink: (token: string) => setIssuedLinks((l) => l.filter((x) => x.token !== token)),
    suspend, liftSuspension, archive, restore, viewAsGym,
    editing, startEditing, cancelEditing, save, isDirty, isSaving: busy === 'save',
    profile, setProfileField,
    featureView, setFeature, memberDuesView, memberDuesStaged: memberDues !== null, setMemberDues,
    stagedAdmins: admins, inviteAdmin, removeInvite, toggleAdmin, resetPassword,
    stagedVoids: voids, voidPayment, undoVoid,
    paymentOpen, openPayment: () => { setError(null); setPaymentOpen(true) }, closePayment: () => setPaymentOpen(false), recordPayment, isRecording: busy === 'pay',
  }
}

export type GymDetailVM = ReturnType<typeof useGymDetailViewModel>
