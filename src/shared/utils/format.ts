import type { DurationUnit } from '../models/types'
import { PH_TIME_ZONE, toPhDate } from './dates'

/*
 * All dates and times are shown in Philippine time (Asia/Manila), even on a phone or laptop set to another
 * time zone, so a 9:15 AM check-in never shows up as PM. A plain date (YYYY-MM-DD) is a calendar day and is
 * never shifted; a timestamp is converted to its Philippine day and time.
 */
const dayFmt = new Intl.DateTimeFormat('en-PH', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' })
const weekdayFmt = new Intl.DateTimeFormat('en-PH', { timeZone: 'UTC', weekday: 'long' })
const timeFmt = new Intl.DateTimeFormat('en-PH', { timeZone: PH_TIME_ZONE, hour: 'numeric', minute: '2-digit', hour12: true })

/** "YYYY-MM-DD" or a timestamp -> the Philippine calendar day as a UTC-midnight Date (formatting it in UTC never shifts it). */
const phDay = (iso: string) => {
  const [y, m, d] = (iso.length === 10 ? iso : toPhDate(iso)).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/** "Nov 9, 2026". A YYYY-MM-DD date as is; a timestamp as its Philippine date. */
export const formatDate = (iso: string) => dayFmt.format(phDay(iso))

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
export const formatPeso = (amount: number) => peso.format(amount)

/** "1 day", "7 days", "1 month", "12 months" */
export const formatDuration = (value: number, unit: DurationUnit) =>
  `${value} ${unit === 'days' ? (value === 1 ? 'day' : 'days') : value === 1 ? 'month' : 'months'}`

/** "9:15 AM", Philippine time. */
export const formatTime = (iso: string) => timeFmt.format(new Date(iso)).replace(/\s?([ap])\.?m\.?$/i, (_m, x: string) => ` ${x.toUpperCase()}M`)

/** "Monday", the Philippine day of the week. */
export const formatWeekday = (iso: string) => weekdayFmt.format(phDay(iso))

/** "Nov 9, 2026, 9:15 AM", Philippine time. */
export const formatDateTime = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)}`

/** "just now", "5 min ago", "2 h ago", otherwise the time of day. `now` is passed in so views stay pure. */
export const formatAgo = (iso: string, now: number) => {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  if (mins < 360) return `${Math.floor(mins / 60)} h ago`
  return formatTime(iso)
}
