import { useEffect, useMemo, useState } from 'react'
import { usePagedList } from '../../../../shared/hooks/usePagedList'
import { ApiError, fetchPlatformGyms } from '../../../../shared/models/apiService'
import type { GymStatus, GymSummary } from '../../../../shared/models/types'
import { currentPeriod, periodLabel } from '../../../../shared/utils/dates'

export type GymFilter = 'All' | GymStatus | 'Unpaid'

export const usePlatformGymsViewModel = () => {
  const [gyms, setGyms] = useState<GymSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<GymFilter>('All')

  const period = currentPeriod()

  useEffect(() => {
    fetchPlatformGyms()
      .then(setGyms)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load gyms.'))
      .finally(() => setIsLoading(false))
  }, [])

  /** "Paid for this month" means the current period, which may differ from the oldest unpaid one. */
  const isPaidThisMonth = (g: GymSummary) => g.billing.period === period && g.billing.paid

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return gyms.filter((g) => {
      const matches = !q || g.name.toLowerCase().includes(q) || g.slug.includes(q)
      const inFilter =
        filter === 'All' ||
        (filter === 'Unpaid' ? g.status !== 'Archived' && !(g.billing.period === period && g.billing.paid) : g.status === filter)
      return matches && inFilter
    })
  }, [gyms, search, filter, period])

  const paging = usePagedList(visible, `${filter}|${search.trim().toLowerCase()}`)

  return {
    gyms: paging.pageItems,
    paging,
    total: gyms.length,
    isLoading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    periodLabel: periodLabel(period),
    isPaidThisMonth,
    period,
  }
}
