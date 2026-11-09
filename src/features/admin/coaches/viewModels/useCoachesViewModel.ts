import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import {
  ApiError,
  cancelCoachInvite,
  fetchCoaches,
  inviteCoach,
  releaseCoachClient,
  resendCoachInvite,
  resetCoachPassword,
  setCoachDisabled,
} from '../../../../shared/models/apiService'
import type { CoachesOverview, GymCoach } from '../../../../shared/models/types'
import { isEmail } from '../../../../shared/utils/validators'

/** A link to show the admin after an action: coach invite or password reset. */
export interface ShownLink {
  kind: 'invite' | 'reset'
  token: string
  email: string
  fullName: string
}

type Confirm =
  | { kind: 'disable'; coach: GymCoach }
  | { kind: 'release'; coach: GymCoach; memberId: string; memberName: string }
  | { kind: 'cancel-invite'; inviteId: string; name: string }

/** Admin "Coaches" page (Coach App add-on): invite coaches, turn them off/on, reset passwords, unassign clients. */
export const useCoachesViewModel = () => {
  const { hasPermission } = useAuth()
  const canManage = hasPermission(PERMISSIONS.MANAGE_COACHES)
  const [data, setData] = useState<CoachesOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [link, setLink] = useState<ShownLink | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [inviteErrors, setInviteErrors] = useState<{ fullName?: string; email?: string; form?: string }>({})
  const [isInviting, setIsInviting] = useState(false)

  const load = useCallback(() => {
    fetchCoaches()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the coaches.'))
  }, [])
  useEffect(load, [load])

  const run = async (key: string, fn: () => Promise<void>) => {
    try {
      setBusy(key)
      setError(null)
      setNotice(null)
      await fn()
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(null)
      setConfirm(null)
    }
  }

  const submitInvite = async (e: FormEvent) => {
    e.preventDefault()
    const errors: typeof inviteErrors = {}
    if (fullName.trim().length < 2) errors.fullName = "Enter the coach's full name."
    if (!isEmail(email)) errors.email = 'Enter a valid email.'
    setInviteErrors(errors)
    if (Object.keys(errors).length) return
    try {
      setIsInviting(true)
      const res = await inviteCoach({ fullName: fullName.trim(), email: email.trim() })
      setInviteOpen(false)
      setLink({ kind: 'invite', token: res.inviteToken, email: res.email, fullName: res.fullName })
      load()
    } catch (err) {
      setInviteErrors({ form: err instanceof ApiError ? err.message : 'Could not create the invite.' })
    } finally {
      setIsInviting(false)
    }
  }

  const confirmAction = () => {
    if (!confirm) return
    if (confirm.kind === 'disable') {
      const { coach } = confirm
      void run(`toggle-${coach.id}`, async () => {
        const res = await setCoachDisabled(coach.id, true)
        setNotice(`${coach.fullName} can no longer log in.${res.freedClients ? ` ${res.freedClients} client(s) can now be taken by another coach.` : ''}`)
      })
    } else if (confirm.kind === 'release') {
      const { memberId, memberName, coach } = confirm
      void run(`release-${memberId}`, async () => {
        await releaseCoachClient(memberId)
        setNotice(`${memberName} is no longer a client of ${coach.fullName}.`)
      })
    } else {
      const { inviteId } = confirm
      void run(`cancel-${inviteId}`, async () => {
        await cancelCoachInvite(inviteId)
      })
    }
  }

  return {
    canManage,
    isLoading: !data && !error,
    error,
    notice,
    coaches: data?.coaches ?? [],
    pendingInvites: data?.pendingInvites ?? [],
    busy,
    link,
    closeLink: () => setLink(null),
    // invite
    inviteOpen,
    openInvite: () => {
      setFullName('')
      setEmail('')
      setInviteErrors({})
      setInviteOpen(true)
    },
    closeInvite: () => setInviteOpen(false),
    fullName,
    setFullName: (v: string) => (setFullName(v), setInviteErrors({})),
    email,
    setEmail: (v: string) => (setEmail(v), setInviteErrors({})),
    inviteErrors,
    isInviting,
    submitInvite,
    // actions
    enable: (coach: GymCoach) =>
      run(`toggle-${coach.id}`, async () => {
        await setCoachDisabled(coach.id, false)
        setNotice(`${coach.fullName} can log in again.`)
      }),
    askDisable: (coach: GymCoach) => setConfirm({ kind: 'disable', coach }),
    askRelease: (coach: GymCoach, memberId: string, memberName: string) => setConfirm({ kind: 'release', coach, memberId, memberName }),
    askCancelInvite: (inviteId: string, name: string) => setConfirm({ kind: 'cancel-invite', inviteId, name }),
    resetPassword: (coach: GymCoach) =>
      run(`reset-${coach.id}`, async () => {
        const res = await resetCoachPassword(coach.id)
        setLink({ kind: 'reset', token: res.resetToken, email: res.email, fullName: coach.fullName })
      }),
    resendInvite: (inviteId: string) =>
      run(`resend-${inviteId}`, async () => {
        const res = await resendCoachInvite(inviteId)
        setLink({ kind: 'invite', token: res.inviteToken, email: res.email, fullName: res.fullName })
      }),
    confirm,
    closeConfirm: () => setConfirm(null),
    confirmAction,
  }
}

export type CoachesVM = ReturnType<typeof useCoachesViewModel>
