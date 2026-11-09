import type { DurationUnit } from '../models/types'

/**
 * Every gym is in the Philippines, so "today" and every time shown in the app is Philippine time (Asia/Manila),
 * whatever time zone the phone or laptop is set to. Timestamps from the API are UTC (ISO with Z).
 */
export const PH_TIME_ZONE = 'Asia/Manila'

const phDay = new Intl.DateTimeFormat('en-CA', { timeZone: PH_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })

/** The Philippine calendar date (YYYY-MM-DD) of a moment: 2026-11-08T17:30:00Z -> "2026-11-09". */
export const toPhDate = (moment: Date | string) => phDay.format(typeof moment === 'string' ? new Date(moment) : moment)

/** Calendar date of a Date built from y/m/d parts, as YYYY-MM-DD (no time zone involved). */
export const toISODate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parses YYYY-MM-DD as a local date. */
export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Today in the Philippines. */
export const todayISO = () => toPhDate(new Date())

export const addDays = (iso: string, days: number) => {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

const addMonths = (iso: string, months: number) => {
  const start = parseISODate(iso)
  const target = new Date(start.getFullYear(), start.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(start.getDate(), lastDay)) // Jan 31 + 1 month -> Feb 28/29
  return toISODate(target)
}

/**
 * Last day the membership is valid.
 * Day-based plans count the start day (a 1-day pass is valid on its start date only).
 * Month-based plans end on the same calendar day N months later.
 */
export const computeExpiry = (
  startISO: string,
  duration: { durationValue: number; durationUnit: DurationUnit },
) =>
  duration.durationUnit === 'days'
    ? addDays(startISO, Math.max(duration.durationValue, 1) - 1)
    : addMonths(startISO, duration.durationValue)

/** "2026-11" */
export const toPeriod = (iso: string) => iso.slice(0, 7)

export const currentPeriod = () => toPeriod(todayISO())

export const addMonthsToPeriod = (period: string, months: number) => {
  const [y, m] = period.split('-').map(Number)
  const d = new Date(y, m - 1 + months, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Due date of a billing period: that month's billing day (1–28). */
export const periodDueDate = (period: string, billingDay: number) =>
  `${period}-${String(Math.min(Math.max(billingDay, 1), 28)).padStart(2, '0')}`

export const periodLabel = (period: string) => {
  const [y, m] = period.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
}

/** Whole days from today to the date (negative when the date has passed). */
export const daysFromToday = (iso: string) =>
  Math.round((parseISODate(iso).getTime() - parseISODate(todayISO()).getTime()) / 86_400_000)
