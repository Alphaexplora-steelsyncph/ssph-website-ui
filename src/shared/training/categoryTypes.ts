import type { CategoryTypeId } from '../models/types'

/**
 * Column layout for each kind of program category (from the coach's own spreadsheets).
 * Picking the type when adding a category decides its table's columns, so a coach never builds a table by hand.
 * - fixed columns do not change week to week
 * - progression columns repeat once per program week (Workout tracks Set and Rep per week)
 * Keep the ids in sync with CATEGORY_TYPES in ssph-backend/src/shared/domain/trainingProgram.js.
 */
export interface CategoryColumn {
  key: string
  label: string
  /** A dropdown of these choices plus a free-text "Other…", instead of plain text. */
  options?: string[]
}

export interface CategoryTypeDef {
  id: CategoryTypeId
  label: string
  /** Replaces the generic "EXERCISE" column (e.g. "TYPE OF RUN", "STATION"); still stored in the row's `name`. */
  exerciseColumn?: CategoryColumn
  fixedColumnsBefore: CategoryColumn[]
  /** Repeated once per program week. Empty = no week-by-week columns. */
  progressionColumns: CategoryColumn[]
  fixedColumnsAfter: CategoryColumn[]
}

export const CATEGORY_TYPES: CategoryTypeDef[] = [
  {
    id: 'workout',
    label: 'Workout',
    fixedColumnsBefore: [
      { key: 'tempo', label: 'TEMPO' },
      { key: 'rest', label: 'REST' },
    ],
    progressionColumns: [
      { key: 'set', label: 'SET' },
      { key: 'rep', label: 'REP' },
    ],
    fixedColumnsAfter: [],
  },
  {
    id: 'running',
    label: 'Running',
    exerciseColumn: { key: 'typeOfRun', label: 'TYPE OF RUN', options: ['Intervals', 'Easy Run', 'LSD', 'Progressive', 'Fartlek'] },
    fixedColumnsBefore: [
      { key: 'distance', label: 'DISTANCE' },
      { key: 'pace', label: 'PACE' },
      { key: 'heartRate', label: 'HEART RATE' },
      { key: 'time', label: 'TIME' },
    ],
    progressionColumns: [],
    fixedColumnsAfter: [{ key: 'rest', label: 'REST' }],
  },
  {
    id: 'hyrox',
    label: 'HYROX',
    exerciseColumn: {
      key: 'station',
      label: 'STATION',
      options: ['SkiErg', 'Sled Push', 'Sled Pull', 'Burpee Broad Jumps', 'Rowing', "Farmer's Carry", 'Sandbag Lunges', 'Wall Balls'],
    },
    fixedColumnsBefore: [
      { key: 'distance', label: 'DISTANCE' },
      { key: 'weight', label: 'WEIGHT' },
    ],
    progressionColumns: [],
    fixedColumnsAfter: [],
  },
]

export const getCategoryType = (id: CategoryTypeId): CategoryTypeDef => CATEGORY_TYPES.find((t) => t.id === id) ?? CATEGORY_TYPES[0]

/** How many WEEK N column groups a category's table shows (0 when the type has no week-by-week columns). */
export const progressionWeekCount = (type: CategoryTypeDef, weekCount: number) =>
  type.progressionColumns.length === 0 ? 0 : Math.max(weekCount, 1)

/** All value columns of a row in display order (fixed before, then fixed after). Progression is separate. */
export const fixedColumns = (type: CategoryTypeDef) => [...type.fixedColumnsBefore, ...type.fixedColumnsAfter]
