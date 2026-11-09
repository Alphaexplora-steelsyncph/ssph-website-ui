import { Dumbbell, Footprints, Zap, type LucideIcon } from 'lucide-react'
import type { CategoryTypeId } from '../models/types'

/**
 * A color + icon per category type so categories read apart at a glance.
 * `sheet*` classes are for the light printable program sheet (screen + PNG/PDF),
 * `dark*` classes for the dark in-app cards on phones.
 */
export interface CategoryVisual {
  Icon: LucideIcon
  sheetHeader: string // light header bar + left border
  sheetIcon: string
  sheetHead: string // table head background
  darkHeader: string
  darkIcon: string
}

const VISUALS: Record<CategoryTypeId, CategoryVisual> = {
  workout: {
    Icon: Dumbbell,
    sheetHeader: 'bg-stone-100 border-[#0e0e0f]',
    sheetIcon: 'bg-stone-200 text-[#0e0e0f]',
    sheetHead: 'bg-stone-100',
    darkHeader: 'border-ember bg-ember/10',
    darkIcon: 'bg-ember/20 text-ember',
  },
  running: {
    Icon: Footprints,
    sheetHeader: 'bg-sky-50 border-sky-500',
    sheetIcon: 'bg-sky-100 text-sky-700',
    sheetHead: 'bg-sky-50',
    darkHeader: 'border-sky-500 bg-sky-500/10',
    darkIcon: 'bg-sky-500/20 text-sky-300',
  },
  hyrox: {
    Icon: Zap,
    sheetHeader: 'bg-amber-50 border-amber-500',
    sheetIcon: 'bg-amber-100 text-amber-700',
    sheetHead: 'bg-amber-50',
    darkHeader: 'border-amber-400 bg-amber-400/10',
    darkIcon: 'bg-amber-400/20 text-amber-300',
  },
}

export const getCategoryVisual = (id: CategoryTypeId) => VISUALS[id] ?? VISUALS.workout
