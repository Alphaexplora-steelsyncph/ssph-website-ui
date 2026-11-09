import { useEffect, useState } from 'react'
import { useListFilters } from '../../../../shared/hooks/useListFilters'
import { ApiError, fetchVisits } from '../../../../shared/models/apiService'
import type { VisitsPage } from '../../../../shared/models/types'
import { downloadCsv } from '../../../../shared/utils/csv'
import { todayISO } from '../../../../shared/utils/dates'

const EXPORT_LIMIT = 5000

/** Every check-in of the gym with filters and CSV export. */
export const useVisitsViewModel = () => {
  const filters = useListFilters('today')
  const [result, setResult] = useState<VisitsPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const { query, page: currentPage, pageSize } = filters
  const key = JSON.stringify([query, currentPage])

  useEffect(() => {
    let cancelled = false
    const [q, page] = JSON.parse(key) as [typeof query, number]
    fetchVisits(q, pageSize, page * pageSize)
      .then((r) => {
        if (cancelled) return
        setResult(r)
        setError(null)
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load visits.'))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [key, pageSize])

  const exportCsv = async () => {
    try {
      setIsExporting(true)
      const all = await fetchVisits(filters.query, EXPORT_LIMIT, 0)
      downloadCsv(
        `visits-${filters.from || 'all'}-to-${filters.to || todayISO()}.csv`,
        ['Date', 'Time', 'Member', 'Email', 'Plan'],
        all.visits.map((v) => {
          const d = new Date(v.checkedInAt)
          return [
            d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }),
            d.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' }),
            v.member.fullName,
            v.member.email,
            v.member.plan,
          ]
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not export.')
    } finally {
      setIsExporting(false)
    }
  }

  const total = result?.total ?? 0
  return {
    filters,
    visits: result?.visits ?? [],
    total,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
    isLoading,
    error,
    isExporting,
    exportCsv,
  }
}
