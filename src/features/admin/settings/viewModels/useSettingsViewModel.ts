import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchGymSettings, saveGymSettings } from '../../../../shared/models/apiService'
import type { DurationUnit, GymSettingsBundle, GymSettingsSave, PlanInput, PlanOption } from '../../../../shared/models/types'
import { checkInLink } from '../../../../shared/utils/links'
import { canHaveMonthlyPrice } from '../../../../shared/utils/planBilling'

/** A plan in the edit session: saved plans keep their id; new ones get a temporary key until Done. */
export interface DraftPlan extends PlanInput {
  key: string
  id?: string
}

/** Plan form values are strings while the admin types. */
export interface PlanDraft {
  name: string
  price: string
  durationValue: string
  durationUnit: DurationUnit
  monthlyPrice: string // '' = full payment only
  isActive: boolean
}
export type PlanDraftErrors = Partial<Record<'name' | 'price' | 'durationValue' | 'monthlyPrice', string>>

const EMPTY_PLAN: PlanDraft = { name: '', price: '', durationValue: '1', durationUnit: 'months', monthlyPrice: '', isActive: true }
const DAYS = Array.from({ length: 28 }, (_, i) => i + 1)

const toDraftPlan = (p: PlanOption): DraftPlan => ({ ...p, key: p.id })
const planFields = (p: PlanInput) => ({
  name: p.name,
  price: p.price,
  durationValue: p.durationValue,
  durationUnit: p.durationUnit,
  monthlyPrice: p.monthlyPrice,
  isActive: p.isActive,
})
const samePlan = (a: PlanInput, b: PlanInput) => JSON.stringify(planFields(a)) === JSON.stringify(planFields(b))
const cleanGymName = (v: string) => v.trim().replace(/\s+/g, ' ')

/**
 * The whole Settings page. It loads once (one request) and is read-only until the admin presses Edit.
 * While editing, every change (gym name, payment day, new QR, plans) stays on this page; nothing is sent until
 * Done, which saves only what changed in ONE request. Cancel throws the changes away without any request.
 */
export const useSettingsViewModel = () => {
  const { token, setSession } = useAuth()
  const [saved, setSaved] = useState<GymSettingsBundle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [name, setNameState] = useState('')
  const [dueDay, setDueDayState] = useState('')
  const [replaceQr, setReplaceQr] = useState(false)
  const [plans, setPlans] = useState<DraftPlan[]>([])
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  // Plan editor (inside the edit session)
  const [planEditing, setPlanEditing] = useState<null | 'new' | string>(null) // key of the plan being edited
  const [planDraft, setPlanDraft] = useState<PlanDraft>(EMPTY_PLAN)
  const [planErrors, setPlanErrors] = useState<PlanDraftErrors>({})

  const startFrom = (bundle: GymSettingsBundle) => {
    setSaved(bundle)
    setNameState(bundle.gym.name)
    setDueDayState(bundle.gym.memberDueDay ? String(bundle.gym.memberDueDay) : '')
    setReplaceQr(false)
    setPlans(bundle.plans.map(toDraftPlan))
    setPlanEditing(null)
    setPlanErrors({})
    setNameError(null)
    setError(null)
  }

  useEffect(() => {
    fetchGymSettings()
      .then(startFrom)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Could not load your settings.'))
      .finally(() => setIsLoading(false))
  }, [])

  /** What Done would send. Empty = nothing changed. */
  const changes = useMemo((): GymSettingsSave => {
    if (!saved) return {}
    const out: GymSettingsSave = {}
    const nextName = cleanGymName(name)
    if (nextName !== saved.gym.name) out.name = nextName
    if (saved.gym.memberDuesEnabled && dueDay && Number(dueDay) !== saved.gym.memberDueDay) out.memberDueDay = Number(dueDay)
    if (replaceQr) out.regenerateQr = true
    const byId = new Map(saved.plans.map((p) => [p.id, p]))
    const kept = new Set(plans.filter((p) => p.id).map((p) => p.id))
    const create = plans.filter((p) => !p.id).map(planFields)
    const update = plans.filter((p) => p.id && !samePlan(p, byId.get(p.id)!)).map((p) => ({ id: p.id!, ...planFields(p) }))
    const remove = saved.plans.filter((p) => !kept.has(p.id)).map((p) => p.id)
    if (create.length || update.length || remove.length) out.plans = { create, update, delete: remove }
    return out
  }, [saved, name, dueDay, replaceQr, plans])
  const isDirty = Object.keys(changes).length > 0

  const startEditing = () => {
    if (saved) startFrom(saved)
    setJustSaved(false)
    setEditing(true)
  }

  /** Throw away every change of this edit session (no request). */
  const cancel = () => {
    if (saved) startFrom(saved)
    setEditing(false)
  }

  /** Save everything that changed in one request; with no changes, just leave edit mode. */
  const done = async () => {
    if (planEditing) {
      setError('Save or cancel the plan you are editing first.')
      return
    }
    const nextName = cleanGymName(name)
    if (nextName.length < 2 || nextName.length > 60) {
      setNameError('Gym name must be 2 to 60 characters.')
      setError('Please fix the highlighted fields.')
      return
    }
    if (!isDirty) {
      setEditing(false)
      return
    }
    try {
      setIsSaving(true)
      setError(null)
      const result = await saveGymSettings(changes)
      const { user, ...bundle } = result
      startFrom(bundle)
      if (token && (changes.name || changes.memberDueDay)) setSession({ user, token }) // header name, Enroll's payment day
      setEditing(false)
      setJustSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const setName = (v: string) => {
    setNameState(v)
    setNameError(null)
    setError(null)
  }
  const setDueDay = (v: string) => {
    setDueDayState(v)
    setError(null)
  }

  /* ----- plans (all local until Done) ----- */
  const startAddPlan = () => {
    setPlanEditing('new')
    setPlanDraft(EMPTY_PLAN)
    setPlanErrors({})
    setError(null)
  }
  const startEditPlan = (plan: DraftPlan) => {
    setPlanEditing(plan.key)
    setPlanDraft({
      name: plan.name,
      price: String(plan.price),
      durationValue: String(plan.durationValue),
      durationUnit: plan.durationUnit,
      monthlyPrice: plan.monthlyPrice == null ? '' : String(plan.monthlyPrice),
      isActive: plan.isActive,
    })
    setPlanErrors({})
    setError(null)
  }
  const cancelPlanEdit = () => {
    setPlanEditing(null)
    setPlanErrors({})
  }
  const updatePlanDraft = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) => {
    setPlanDraft((d) => ({ ...d, [key]: value }))
    setPlanErrors((e) => ({ ...e, [key]: undefined }))
    setError(null)
  }

  const validatePlan = (): PlanInput | null => {
    const errors: PlanDraftErrors = {}
    const planName = planDraft.name.trim().replace(/\s+/g, ' ')
    const price = Number(planDraft.price)
    const durationValue = Number(planDraft.durationValue)
    const max = planDraft.durationUnit === 'days' ? 365 : 60
    if (planName.length < 2 || planName.length > 40) errors.name = 'Use 2 to 40 characters.'
    else if (plans.some((p) => p.key !== planEditing && p.name.toLowerCase() === planName.toLowerCase())) errors.name = 'You already have a plan with this name.'
    if (planDraft.price === '' || !Number.isFinite(price) || price < 0) errors.price = 'Enter a price (0 or more).'
    if (!Number.isInteger(durationValue) || durationValue < 1 || durationValue > max) errors.durationValue = `Whole number from 1 to ${max}.`
    const monthlyText = canHaveMonthlyPrice(durationValue, planDraft.durationUnit) ? planDraft.monthlyPrice.trim() : ''
    const monthlyPrice = monthlyText === '' ? null : Number(monthlyText)
    if (monthlyPrice !== null && (!Number.isFinite(monthlyPrice) || monthlyPrice <= 0)) errors.monthlyPrice = 'Enter the price per month, or leave it empty.'
    setPlanErrors(errors)
    if (Object.keys(errors).length) return null
    return { name: planName, price, durationValue, durationUnit: planDraft.durationUnit, monthlyPrice, isActive: planDraft.isActive }
  }

  /** Keeps the plan in this edit session (sent on Done). */
  const keepPlan = () => {
    const input = validatePlan()
    if (!input || !planEditing) return
    if (planEditing === 'new') setPlans((prev) => [...prev, { ...input, key: `new-${Date.now()}` }])
    else setPlans((prev) => prev.map((p) => (p.key === planEditing ? { ...p, ...input } : p)))
    setPlanEditing(null)
  }
  const toggleOffered = (plan: DraftPlan) => setPlans((prev) => prev.map((p) => (p.key === plan.key ? { ...p, isActive: !p.isActive } : p)))
  const removePlan = (plan: DraftPlan) => {
    setPlans((prev) => prev.filter((p) => p.key !== plan.key))
    if (planEditing === plan.key) setPlanEditing(null)
  }

  const savedPlan = (plan: DraftPlan) => (plan.id ? saved?.plans.find((p) => p.id === plan.id) : undefined)
  /** 'new' | 'changed' | null, to mark rows that will be saved on Done. */
  const planState = (plan: DraftPlan): 'new' | 'changed' | null => {
    if (!plan.id) return 'new'
    const before = savedPlan(plan)
    return before && !samePlan(plan, before) ? 'changed' : null
  }

  const gym = saved?.gym ?? null
  const qr = saved?.qr ?? null
  const trimmedName = cleanGymName(name)

  return {
    isLoading, loadError, gym, qr,
    link: qr ? checkInLink(qr.gymSlug, qr.token) : '',
    print: () => window.print(),
    editing, startEditing, cancel, done, isDirty, isSaving, error, justSaved,
    name, setName, nameError, accountNamePreview: `${trimmedName || 'Your Gym'} Admin`,
    dueDayEnabled: !!gym?.memberDuesEnabled, days: DAYS, dueDay, setDueDay, savedDueDay: gym?.memberDueDay ?? null,
    replaceQr, setReplaceQr,
    plans, offeredCount: plans.filter((p) => p.isActive).length, removedCount: changes.plans?.delete.length ?? 0, planState,
    planEditing, planDraft, planErrors, startAddPlan, startEditPlan, cancelPlanEdit, updatePlanDraft, keepPlan, toggleOffered, removePlan,
  }
}

export type SettingsVM = ReturnType<typeof useSettingsViewModel>
