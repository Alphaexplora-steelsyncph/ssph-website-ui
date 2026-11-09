import { useEffect, useState } from 'react'
import { ApiError, createPlan, deletePlan, fetchAllPlans, updatePlan } from '../../../../shared/models/apiService'
import type { DurationUnit, PlanInput, PlanOption } from '../../../../shared/models/types'

/** Form values are strings while the admin types. */
export interface PlanDraft {
  name: string
  price: string
  durationValue: string
  durationUnit: DurationUnit
  isActive: boolean
}

export type PlanDraftErrors = Partial<Record<'name' | 'price' | 'durationValue', string>>

const EMPTY_DRAFT: PlanDraft = { name: '', price: '', durationValue: '1', durationUnit: 'months', isActive: true }

const toDraft = (p: PlanOption): PlanDraft => ({
  name: p.name,
  price: String(p.price),
  durationValue: String(p.durationValue),
  durationUnit: p.durationUnit,
  isActive: p.isActive,
})

/** null = no editor open, 'new' = adding, otherwise the id of the plan being edited. */
type EditorTarget = null | 'new' | string

export const usePlansViewModel = () => {
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<EditorTarget>(null)
  const [draft, setDraft] = useState<PlanDraft>(EMPTY_DRAFT)
  const [draftErrors, setDraftErrors] = useState<PlanDraftErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    fetchAllPlans()
      .then(setPlans)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load plans.'))
      .finally(() => setIsLoading(false))
  }, [])

  const offeredCount = plans.filter((p) => p.isActive).length

  const startAdd = () => {
    setEditing('new')
    setDraft(EMPTY_DRAFT)
    setDraftErrors({})
    setError(null)
  }

  const startEdit = (plan: PlanOption) => {
    setEditing(plan.id)
    setDraft(toDraft(plan))
    setDraftErrors({})
    setError(null)
  }

  const cancelEdit = () => {
    setEditing(null)
    setDraftErrors({})
    setError(null)
  }

  const updateDraft = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setDraftErrors((e) => ({ ...e, [key]: undefined }))
    setError(null)
  }

  const validate = (): PlanInput | null => {
    const errors: PlanDraftErrors = {}
    const name = draft.name.trim()
    const price = Number(draft.price)
    const durationValue = Number(draft.durationValue)
    const max = draft.durationUnit === 'days' ? 365 : 60
    if (name.length < 2 || name.length > 40) errors.name = 'Use 2 to 40 characters.'
    if (draft.price === '' || !Number.isFinite(price) || price < 0) errors.price = 'Enter a price (0 or more).'
    if (!Number.isInteger(durationValue) || durationValue < 1 || durationValue > max) {
      errors.durationValue = `Whole number from 1 to ${max}.`
    }
    setDraftErrors(errors)
    if (Object.keys(errors).length) return null
    return { name, price, durationValue, durationUnit: draft.durationUnit, isActive: draft.isActive }
  }

  const saveDraft = async () => {
    const input = validate()
    if (!input || !editing) return
    try {
      setIsSaving(true)
      setError(null)
      if (editing === 'new') {
        const created = await createPlan(input)
        setPlans((prev) => [...prev, created])
      } else {
        const updated = await updatePlan(editing, input)
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      }
      setEditing(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the plan.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleOffered = async (plan: PlanOption) => {
    try {
      setBusyId(plan.id)
      setError(null)
      const { id: _id, ...input } = plan
      void _id
      const updated = await updatePlan(plan.id, { ...input, isActive: !plan.isActive })
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the plan.')
    } finally {
      setBusyId(null)
    }
  }

  const removePlan = async (planId: string) => {
    try {
      setBusyId(planId)
      setError(null)
      await deletePlan(planId)
      setPlans((prev) => prev.filter((p) => p.id !== planId))
      if (editing === planId) setEditing(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the plan.')
    } finally {
      setBusyId(null)
    }
  }

  return {
    plans, isLoading, error, offeredCount,
    editing, draft, draftErrors, isSaving, busyId,
    startAdd, startEdit, cancelEdit, updateDraft, saveDraft, toggleOffered, removePlan,
  }
}

export type PlansVM = ReturnType<typeof usePlansViewModel>
