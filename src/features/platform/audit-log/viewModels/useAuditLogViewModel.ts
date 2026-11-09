import { useEffect, useState } from 'react'
import { PAGE_SIZE } from '../../../../shared/hooks/usePagedList'
import { ApiError, fetchAuditLog, fetchPlatformGyms } from '../../../../shared/models/apiService'
import type { AuditEntry, GymSummary } from '../../../../shared/models/types'

/** Audit log, 10 entries per page from the server (newest first). New filters go back to page 1. */
export const useAuditLogViewModel = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [gyms, setGyms] = useState<GymSummary[]>([])
  const [gymId, setGymIdState] = useState('')
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlatformGyms().then(setGyms).catch(() => setGyms([]))
  }, [])

  // Debounce the text search a little so typing does not refetch on every key.
  useEffect(() => {
    const id = setTimeout(() => {
      setAppliedQuery(query)
      setPage(0)
    }, 300)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    let cancelled = false
    fetchAuditLog({ gymId: gymId || undefined, query: appliedQuery || undefined }, PAGE_SIZE, page * PAGE_SIZE)
      .then((res) => {
        if (cancelled) return
        setEntries(res.entries)
        setTotal(res.total)
        setError(null)
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load the audit log.'))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [gymId, appliedQuery, page])

  return {
    entries,
    gyms,
    gymId,
    setGymId: (v: string) => {
      setGymIdState(v)
      setPage(0)
    },
    query,
    setQuery,
    isLoading,
    error,
    paging: { page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)), total, pageSize: PAGE_SIZE, setPage },
  }
}
