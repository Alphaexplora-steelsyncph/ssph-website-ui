import type { DurationUnit } from '../models/types'
import { addDays } from './dates'

/**
 * Gyms with a fixed member payment day (set by ALPHAEXPLORA). Mirrors the backend's shared/domain/memberDues.js;
 * the server re-checks everything.
 */
export const isLongPlan = (plan: { durationValue: number; durationUnit: DurationUnit }) =>
  plan.durationUnit === 'months' ? plan.durationValue > 1 : plan.durationValue > 31

/** First payment day after `startISO`; null when the member starts ON the payment day. */
export const nextMemberDueDate = (startISO: string, dueDay: number): string | null => {
  const [y, m, d] = startISO.split('-').map(Number)
  if (!y || !m || !d || d === dueDay) return null
  const date = new Date(Date.UTC(y, (d < dueDay ? m : m + 1) - 1, dueDay))
  return date.toISOString().slice(0, 10)
}

export const dayBefore = (iso: string) => addDays(iso, -1)

/** "5th", "21st", "22nd", "23rd" */
export const ordinal = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'
  return `${n}${s}`
}
