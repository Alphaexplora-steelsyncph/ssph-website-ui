import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, fetchCoachClient, saveTrainingProgram } from '../../../../shared/models/apiService'
import type { CategoryTypeId, TrainingProgram } from '../../../../shared/models/types'
import * as ops from '../../../../shared/training/program'

export type EditorMode = 'edit' | 'new'

/**
 * Program editor. "edit" starts from the client's current program, "new" from a blank one (the current one
 * stays in the history). Every edit goes through the pure helpers in shared/training/program.ts.
 * Saving stores a new version and notifies the member with a short note of what changed.
 */
export const useProgramEditorViewModel = (mode: EditorMode) => {
  const { memberId = '' } = useParams()
  const navigate = useNavigate()
  const [clientName, setClientName] = useState('')
  const [hasCurrent, setHasCurrent] = useState(false)
  const [initial, setInitial] = useState<TrainingProgram | null>(null)
  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showProblems, setShowProblems] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchCoachClient(memberId)
      .then((d) => {
        if (cancelled) return
        setClientName(d.client.fullName)
        setHasCurrent(!!d.program)
        // Editing with nothing saved yet behaves like a new program.
        const start = mode === 'edit' && d.program ? ops.cloneProgram(d.program) : ops.blankProgram()
        setInitial(start)
        setProgram(ops.cloneProgram(start))
      })
      .catch((err) => !cancelled && setLoadError(err instanceof ApiError ? err.message : 'Could not load this client.'))
    return () => {
      cancelled = true
    }
  }, [memberId, mode])

  const isDirty = !!program && !!initial && !ops.programsEqual(program, initial)
  const problems = useMemo(() => (program ? ops.programProblems(program) : []), [program])
  const isNew = mode === 'new' || !hasCurrent

  // Closing the tab or reloading with unsaved changes asks first.
  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const backPath = `/coach/clients/${memberId}`

  /** Wraps a pure edit so views call e.g. vm.edit(ops.addWeek). */
  const apply = (fn: (p: TrainingProgram) => TrainingProgram) => {
    setSaveError(null)
    setProgram((p) => (p ? fn(p) : p))
  }

  const actions = {
    setTitle: (v: string) => apply((p) => ({ ...p, title: v })),
    setStartDate: (v: string) => apply((p) => ({ ...p, startDate: v })),
    setEndDate: (v: string) => apply((p) => ({ ...p, endDate: v })),
    addWeek: () => apply(ops.addWeek),
    insertWeekAfter: (i: number) => apply((p) => ops.insertWeekAfter(p, i)),
    duplicateWeek: (i: number) => apply((p) => ops.duplicateWeek(p, i)),
    deleteWeek: (i: number) => apply((p) => ops.deleteWeek(p, i)),
    toggleWeekPm: (i: number) => apply((p) => ops.toggleWeekPm(p, i)),
    setDay: (w: number, period: 'am' | 'pm', d: number, v: string) => apply((p) => ops.setDay(p, w, period, d, v)),
    addCategory: (type: CategoryTypeId) => apply((p) => ops.addCategory(p, type)),
    setCategoryName: (c: number, v: string) => apply((p) => ops.setCategoryText(p, c, 'name', v)),
    setCategorySubtitle: (c: number, v: string) => apply((p) => ops.setCategoryText(p, c, 'subtitle', v)),
    deleteCategory: (c: number) => apply((p) => ops.deleteCategory(p, c)),
    moveCategory: (c: number, by: -1 | 1) => apply((p) => ops.moveCategory(p, c, by)),
    addExercise: (c: number, after?: number) => apply((p) => ops.addExercise(p, c, after)),
    duplicateExercise: (c: number, e: number) => apply((p) => ops.duplicateExercise(p, c, e)),
    deleteExercise: (c: number, e: number) => apply((p) => ops.deleteExercise(p, c, e)),
    setExerciseName: (c: number, e: number, v: string) => apply((p) => ops.setExerciseName(p, c, e, v)),
    setExerciseFixed: (c: number, e: number, key: string, v: string) => apply((p) => ops.setExerciseFixed(p, c, e, key, v)),
    setExerciseWeek: (c: number, e: number, w: number, key: string, v: string) => apply((p) => ops.setExerciseWeek(p, c, e, w, key, v)),
  }

  const save = async () => {
    if (!program || !initial) return
    setConfirmLeave(false)
    if (problems.length) {
      setShowProblems(true)
      return
    }
    if (!isDirty && !isNew) {
      navigate(backPath)
      return
    }
    try {
      setIsSaving(true)
      setSaveError(null)
      const res = await saveTrainingProgram(memberId, program, ops.describeChange(isNew ? null : initial, program))
      setInitial(program) // nothing unsaved any more: leaving does not ask
      // Same as the current program: nothing was saved and the member was not notified.
      navigate(backPath, { state: res.unchanged ? { unchanged: true } : { justSaved: true } })
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save the program. Your changes are still here; try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    memberId,
    mode,
    isNew,
    replacesCurrent: mode === 'new' && hasCurrent,
    clientName,
    isLoading: !program && !loadError,
    loadError,
    program,
    isDirty,
    problems: showProblems ? problems : [],
    hasDateProblem: showProblems && problems.length > 0,
    saveError,
    isSaving,
    save,
    ...actions,
    limits: { weeks: ops.MAX_WEEKS, categories: ops.MAX_CATEGORIES, exercises: ops.MAX_EXERCISES },
    back: () => (isDirty ? setConfirmLeave(true) : navigate(backPath)),
    confirmLeave,
    stay: () => setConfirmLeave(false),
    discard: () => {
      setConfirmLeave(false)
      setInitial(program)
      navigate(backPath)
    },
  }
}

export type ProgramEditorVM = ReturnType<typeof useProgramEditorViewModel>
