import { useEffect, useState } from 'react'
import { ApiError, fetchPlatformSettings, updatePlatformSettings } from '../../../../shared/models/apiService'
import type { DefaultPlan, PaymentMethod, PlatformSettings } from '../../../../shared/models/types'

export const ALL_PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'GCash', 'Maya', 'Bank Transfer']

export type NumericSetting =
  | 'graceDays'
  | 'reminderDays'
  | 'checkInCooldownHours'
  | 'crowdWindowHours'
  | 'sessionTimeoutMinutes'
  | 'maxFailedLogins'

export const usePlatformSettingsViewModel = () => {
  const [draft, setDraft] = useState<PlatformSettings | null>(null)
  const [saved, setSaved] = useState<PlatformSettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editing, setEditing] = useState(false) // read-only until Edit; Save sends everything in one request

  useEffect(() => {
    fetchPlatformSettings()
      .then((s) => {
        setDraft(s)
        setSaved(s)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load settings.'))
  }, [])

  const edit = (next: PlatformSettings) => {
    setDraft(next)
    setNotice(null)
    setError(null)
  }

  const setNumber = (key: NumericSetting, value: string) => draft && edit({ ...draft, [key]: value === '' ? NaN : Number(value) })

  const toggleMethod = (m: PaymentMethod) =>
    draft &&
    edit({
      ...draft,
      paymentMethods: draft.paymentMethods.includes(m)
        ? draft.paymentMethods.filter((x) => x !== m)
        : ALL_PAYMENT_METHODS.filter((x) => x === m || draft.paymentMethods.includes(x)),
    })

  const setPlan = (index: number, patch: Partial<DefaultPlan>) =>
    draft && edit({ ...draft, defaultPlans: draft.defaultPlans.map((p, i) => (i === index ? { ...p, ...patch } : p)) })
  const addPlan = () =>
    draft && edit({ ...draft, defaultPlans: [...draft.defaultPlans, { name: '', price: 0, durationValue: 1, durationUnit: 'months' }] })
  const removePlan = (index: number) => draft && edit({ ...draft, defaultPlans: draft.defaultPlans.filter((_, i) => i !== index) })

  const isDirty = !!draft && JSON.stringify(draft) !== JSON.stringify(saved)

  const startEditing = () => {
    if (saved) setDraft(saved)
    setNotice(null)
    setError(null)
    setEditing(true)
  }

  const save = async () => {
    if (!draft) return
    if (!isDirty) {
      setEditing(false)
      return
    }
    try {
      setIsSaving(true)
      const next = await updatePlatformSettings(draft)
      setDraft(next)
      setSaved(next)
      setNotice('Settings saved. New values apply to every gym right away.')
      setEditing(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  /** Cancel: throw the changes away (no request) and go back to read-only. */
  const discard = () => {
    if (saved) setDraft(saved)
    setError(null)
    setEditing(false)
  }

  return { draft, error, notice, isSaving, isDirty, editing, startEditing, setNumber, toggleMethod, setPlan, addPlan, removePlan, save, discard }
}

export type PlatformSettingsVM = ReturnType<typeof usePlatformSettingsViewModel>
