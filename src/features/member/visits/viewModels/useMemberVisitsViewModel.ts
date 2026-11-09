import { useEffect, useMemo, useState } from 'react'
import { ApiError, fetchMyVisits } from '../../../../shared/models/apiService'
import type { Visit } from '../../../../shared/models/types'
import { periodLabel, todayISO, toPhDate } from '../../../../shared/utils/dates'

export interface VisitMonth {
  key: string // YYYY-MM
  label: string // "November 2026"
  visits: Visit[]
}

export const useMemberVisitsViewModel = () => {
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyVisits()
      .then(setVisits)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your visits.'))
      .finally(() => setIsLoading(false))
  }, [])

  /** Newest month first; visits inside each month are already newest first. */
  const months = useMemo<VisitMonth[]>(() => {
    const groups = new Map<string, VisitMonth>()
    for (const v of visits) {
      const key = toPhDate(v.checkedInAt).slice(0, 7) // the Philippine month of the visit
      if (!groups.has(key)) {
        groups.set(key, { key, label: periodLabel(key), visits: [] })
      }
      groups.get(key)!.visits.push(v)
    }
    return [...groups.values()]
  }, [visits])

  const thisMonthKey = todayISO().slice(0, 7)
  const thisMonthCount = months.find((m) => m.key === thisMonthKey)?.visits.length ?? 0

  return { months, totalCount: visits.length, thisMonthCount, isLoading, error }
}
