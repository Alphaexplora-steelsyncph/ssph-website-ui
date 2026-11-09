import { useEffect, useState } from 'react'
import { ApiError, fetchMyVisits } from '../../../../shared/models/apiService'
import type { Visit } from '../../../../shared/models/types'

const RECENT_COUNT = 5

export const useRecentVisitsViewModel = () => {
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyVisits()
      .then(setVisits)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your visits.'))
      .finally(() => setIsLoading(false))
  }, [])

  return { recent: visits.slice(0, RECENT_COUNT), totalCount: visits.length, isLoading, error }
}
