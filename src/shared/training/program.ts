import type { CategoryTypeId, ExerciseRow, ProgramCategory, ProgramWeek, TrainingProgram } from '../models/types'
import { getCategoryType, progressionWeekCount } from './categoryTypes'
import { todayISO } from '../utils/dates'

/** Pure helpers for training programs: display, change detection and every edit the editor makes. */

export const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const
export const MAX_WEEKS = 26
export const MAX_CATEGORIES = 20
export const MAX_EXERCISES = 40

export const UNTITLED_PROGRAM = 'Untitled program'
export const displayProgramTitle = (title: string) => title.trim() || UNTITLED_PROGRAM

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 36)

const blankWeek = (id: number): ProgramWeek => ({ id, am: Array(7).fill(''), pm: Array(7).fill(''), showPm: false })

export const blankProgram = (): TrainingProgram => ({ title: '', startDate: '', endDate: '', weeks: [blankWeek(1)], categories: [] })

export const cloneProgram = (p: TrainingProgram): TrainingProgram => JSON.parse(JSON.stringify(p))

export const programsEqual = (a: TrainingProgram, b: TrainingProgram) => JSON.stringify(a) === JSON.stringify(b)

/** "yyyy-mm-dd" -> "Nov 2, 2026" (read as a local date so it never shifts a day). */
export const formatProgramDate = (iso: string) => {
  const [y, m, d] = (iso ?? '').split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Which program week (1-based) today falls in, counting 7-day blocks from the start date. null without a start date. */
export const currentProgramWeek = (startDate: string, today = todayISO()): number | null => {
  const [y, m, d] = (startDate ?? '').split('-').map(Number)
  if (!y || !m || !d) return null
  const [ty, tm, td] = today.split('-').map(Number) // today in the Philippines
  const diff = Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(y, m - 1, d)) / 86_400_000)
  return diff < 0 ? 1 : Math.floor(diff / 7) + 1
}

/** Weeks still to come (the current week included). Finished weeks are hidden from the member's calendar. */
export const upcomingWeeks = (program: TrainingProgram, hideCompleted: boolean) => {
  const current = hideCompleted ? currentProgramWeek(program.startDate) : null
  return current === null ? program.weeks : program.weeks.filter((w) => w.id >= current)
}

/** Body mass index from kg and cm, one decimal (null when either is missing). */
export const bmi = (weightKg: number | null, heightCm: number | null) => {
  if (!weightKg || !heightCm) return null
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

export const bmiLabel = (value: number) =>
  value < 18.5 ? 'Underweight' : value < 25 ? 'Normal' : value < 30 ? 'Overweight' : 'Obese'

/* ---------- Edits (each returns a new program; nothing is mutated) ---------- */

const emptyBag = (typeId: CategoryTypeId) => Object.fromEntries(getCategoryType(typeId).progressionColumns.map((c) => [c.key, '']))

const tracksWeeks = (cat: ProgramCategory) => getCategoryType(cat.categoryType).progressionColumns.length > 0

const renumber = (weeks: ProgramWeek[]) => weeks.map((w, i) => ({ ...w, id: i + 1 }))

/** Applies `edit` to every exercise's progression list of categories that track weeks (keeps tables aligned with weeks). */
const mapProgressions = (cats: ProgramCategory[], edit: (progression: Record<string, string>[], cat: ProgramCategory) => Record<string, string>[]) =>
  cats.map((cat) => (tracksWeeks(cat) ? { ...cat, exercises: cat.exercises.map((ex) => ({ ...ex, progression: edit(ex.progression, cat) })) } : cat))

export const addWeek = (p: TrainingProgram): TrainingProgram =>
  p.weeks.length >= MAX_WEEKS
    ? p
    : {
        ...p,
        weeks: [...p.weeks, blankWeek(p.weeks.length + 1)],
        categories: mapProgressions(p.categories, (pr, cat) => [...pr, emptyBag(cat.categoryType)]),
      }

export const insertWeekAfter = (p: TrainingProgram, index: number): TrainingProgram => {
  if (p.weeks.length >= MAX_WEEKS) return p
  const weeks = [...p.weeks]
  weeks.splice(index + 1, 0, blankWeek(0))
  return {
    ...p,
    weeks: renumber(weeks),
    categories: mapProgressions(p.categories, (pr, cat) => {
      const next = [...pr]
      next.splice(index + 1, 0, emptyBag(cat.categoryType))
      return next
    }),
  }
}

export const duplicateWeek = (p: TrainingProgram, index: number): TrainingProgram => {
  if (p.weeks.length >= MAX_WEEKS) return p
  const original = p.weeks[index]
  const weeks = [...p.weeks]
  weeks.splice(index + 1, 0, { ...original, am: [...original.am], pm: [...original.pm] })
  return {
    ...p,
    weeks: renumber(weeks),
    categories: mapProgressions(p.categories, (pr, cat) => {
      const next = [...pr]
      next.splice(index + 1, 0, { ...(pr[index] ?? emptyBag(cat.categoryType)) })
      return next
    }),
  }
}

/** A program always keeps at least one week. */
export const deleteWeek = (p: TrainingProgram, index: number): TrainingProgram =>
  p.weeks.length <= 1
    ? p
    : {
        ...p,
        weeks: renumber(p.weeks.filter((_, i) => i !== index)),
        categories: mapProgressions(p.categories, (pr) => pr.filter((_, i) => i !== index)),
      }

/** Turning PM off only hides the row; anything typed stays and comes back when it is turned on again. */
export const toggleWeekPm = (p: TrainingProgram, index: number): TrainingProgram => ({
  ...p,
  weeks: p.weeks.map((w, i) => (i === index ? { ...w, showPm: !w.showPm } : w)),
})

export const setDay = (p: TrainingProgram, weekIndex: number, period: 'am' | 'pm', day: number, value: string): TrainingProgram => ({
  ...p,
  weeks: p.weeks.map((w, i) => (i === weekIndex ? { ...w, [period]: w[period].map((v, d) => (d === day ? value : v)) } : w)),
})

const blankRow = (typeId: CategoryTypeId, weekCount: number): ExerciseRow => ({
  id: newId(),
  name: '',
  fixed: {},
  progression: Array.from({ length: progressionWeekCount(getCategoryType(typeId), weekCount) }, () => emptyBag(typeId)),
})

/** New category of a type, with one blank row so it is ready to type in. */
export const addCategory = (p: TrainingProgram, typeId: CategoryTypeId): TrainingProgram =>
  p.categories.length >= MAX_CATEGORIES
    ? p
    : {
        ...p,
        categories: [
          ...p.categories,
          { id: newId(), name: getCategoryType(typeId).label.toUpperCase(), categoryType: typeId, subtitle: '', exercises: [blankRow(typeId, p.weeks.length)] },
        ],
      }

const editCategory = (p: TrainingProgram, catIndex: number, edit: (c: ProgramCategory) => ProgramCategory): TrainingProgram => ({
  ...p,
  categories: p.categories.map((c, i) => (i === catIndex ? edit(c) : c)),
})

export const setCategoryText = (p: TrainingProgram, catIndex: number, field: 'name' | 'subtitle', value: string) =>
  editCategory(p, catIndex, (c) => ({ ...c, [field]: value }))

export const deleteCategory = (p: TrainingProgram, catIndex: number): TrainingProgram => ({
  ...p,
  categories: p.categories.filter((_, i) => i !== catIndex),
})

export const moveCategory = (p: TrainingProgram, catIndex: number, by: -1 | 1): TrainingProgram => {
  const to = catIndex + by
  if (to < 0 || to >= p.categories.length) return p
  const categories = [...p.categories]
  ;[categories[catIndex], categories[to]] = [categories[to], categories[catIndex]]
  return { ...p, categories }
}

/** Adds a blank row at the end, or right below `afterIndex`. */
export const addExercise = (p: TrainingProgram, catIndex: number, afterIndex?: number) =>
  editCategory(p, catIndex, (c) => {
    if (c.exercises.length >= MAX_EXERCISES) return c
    const exercises = [...c.exercises]
    exercises.splice(afterIndex === undefined ? exercises.length : afterIndex + 1, 0, blankRow(c.categoryType, p.weeks.length))
    return { ...c, exercises }
  })

/** A copy right below the original (e.g. left/right variants) with its own id and values. */
export const duplicateExercise = (p: TrainingProgram, catIndex: number, exIndex: number) =>
  editCategory(p, catIndex, (c) => {
    if (c.exercises.length >= MAX_EXERCISES) return c
    const original = c.exercises[exIndex]
    const exercises = [...c.exercises]
    exercises.splice(exIndex + 1, 0, { ...original, id: newId(), fixed: { ...original.fixed }, progression: original.progression.map((b) => ({ ...b })) })
    return { ...c, exercises }
  })

export const deleteExercise = (p: TrainingProgram, catIndex: number, exIndex: number) =>
  editCategory(p, catIndex, (c) => ({ ...c, exercises: c.exercises.filter((_, i) => i !== exIndex) }))

export const setExerciseName = (p: TrainingProgram, catIndex: number, exIndex: number, value: string) =>
  editCategory(p, catIndex, (c) => ({ ...c, exercises: c.exercises.map((e, i) => (i === exIndex ? { ...e, name: value } : e)) }))

export const setExerciseFixed = (p: TrainingProgram, catIndex: number, exIndex: number, key: string, value: string) =>
  editCategory(p, catIndex, (c) => ({
    ...c,
    exercises: c.exercises.map((e, i) => (i === exIndex ? { ...e, fixed: { ...e.fixed, [key]: value } } : e)),
  }))

export const setExerciseWeek = (p: TrainingProgram, catIndex: number, exIndex: number, week: number, key: string, value: string) =>
  editCategory(p, catIndex, (c) => ({
    ...c,
    exercises: c.exercises.map((e, i) => {
      if (i !== exIndex) return e
      const progression = Array.from({ length: Math.max(e.progression.length, week + 1) }, (_, w) => e.progression[w] ?? emptyBag(c.categoryType))
      progression[week] = { ...progression[week], [key]: value }
      return { ...e, progression }
    }),
  }))

/* ---------- What changed (becomes the member's notification) ---------- */

type ChangeKind = 'added' | 'removed' | 'edited' | null

const verdict = (added: boolean, removed: boolean, edited: boolean): ChangeKind =>
  edited || (added && removed) ? 'edited' : added ? 'added' : removed ? 'removed' : null

const scheduleChange = (before: TrainingProgram, after: TrainingProgram): ChangeKind => {
  let added = false
  let removed = false
  let edited = false
  const count = Math.max(before.weeks.length, after.weeks.length)
  for (let w = 0; w < count; w++) {
    const a = before.weeks[w]
    const b = after.weeks[w]
    if (!a && b) added = true
    else if (a && !b) removed = true
    else if (a && b) {
      for (const period of ['am', 'pm'] as const) {
        for (let d = 0; d < 7; d++) {
          const x = a[period][d] ?? ''
          const y = b[period][d] ?? ''
          if (x === y) continue
          if (!x) added = true
          else if (!y) removed = true
          else edited = true
        }
      }
    }
  }
  return verdict(added, removed, edited)
}

const workoutChange = (before: TrainingProgram, after: TrainingProgram): ChangeKind => {
  let added = false
  let removed = false
  let edited = false
  const beforeIds = new Set(before.categories.map((c) => c.id))
  const afterIds = new Set(after.categories.map((c) => c.id))
  after.categories.forEach((c) => !beforeIds.has(c.id) && (added = true))
  before.categories.forEach((c) => !afterIds.has(c.id) && (removed = true))
  for (const cat of after.categories) {
    const old = before.categories.find((c) => c.id === cat.id)
    if (!old) continue
    if (old.name !== cat.name || old.subtitle !== cat.subtitle) edited = true
    const oldRows = new Set(old.exercises.map((e) => e.id))
    const newRows = new Set(cat.exercises.map((e) => e.id))
    cat.exercises.forEach((e) => !oldRows.has(e.id) && (added = true))
    old.exercises.forEach((e) => !newRows.has(e.id) && (removed = true))
    for (const row of cat.exercises) {
      const was = old.exercises.find((e) => e.id === row.id)
      if (was && JSON.stringify(was) !== JSON.stringify(row)) edited = true
    }
  }
  return verdict(added, removed, edited)
}

/**
 * Short note saved with the version and shown to the member ("Coach Ana updated your program: Schedule added").
 * 'Saved' when only the title or dates changed.
 */
export const describeChange = (before: TrainingProgram | null, after: TrainingProgram) => {
  if (!before) return 'New program'
  const schedule = scheduleChange(before, after)
  const workout = workoutChange(before, after)
  if (schedule && workout) return `Schedule ${schedule} & workout ${workout}`
  if (schedule) return `Schedule ${schedule}`
  if (workout) return `Workout ${workout}`
  return 'Saved'
}

/** Problems that block saving (shown above the Save button). */
export const programProblems = (p: TrainingProgram) => {
  const problems: string[] = []
  if (!p.startDate || !p.endDate) problems.push('Set the program start and end dates.')
  else if (p.endDate < p.startDate) problems.push('The end date must be on or after the start date.')
  return problems
}
