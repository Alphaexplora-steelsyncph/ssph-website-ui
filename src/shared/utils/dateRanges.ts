import { addDays, todayISO } from './dates'

export type RangePreset = 'today' | '7d' | '30d' | 'month' | 'lastMonth' | 'all'

export const RANGE_PRESETS: { key: RangePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'month', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'all', label: 'All time' },
]

/** From / to (YYYY-MM-DD, Manila) for a quick range. Empty strings = no limit. */
export const presetRange = (key: RangePreset): { from: string; to: string } => {
  const today = todayISO()
  const monthStart = `${today.slice(0, 8)}01`
  switch (key) {
    case 'today':
      return { from: today, to: today }
    case '7d':
      return { from: addDays(today, -6), to: today }
    case '30d':
      return { from: addDays(today, -29), to: today }
    case 'month':
      return { from: monthStart, to: today }
    case 'lastMonth': {
      const end = addDays(monthStart, -1)
      return { from: `${end.slice(0, 8)}01`, to: end }
    }
    default:
      return { from: '', to: '' }
  }
}
