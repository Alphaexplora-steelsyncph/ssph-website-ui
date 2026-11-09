import { useEffect, useState } from 'react'
import { ApiError, fetchPlatformOverview } from '../../../../shared/models/apiService'
import type { PlatformOverview } from '../../../../shared/models/types'

export const usePlatformHomeViewModel = () => {
  const [overview, setOverview] = useState<PlatformOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetchPlatformOverview()
      .then(setOverview)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the overview.'))
  }, [])
  return { overview, error, isLoading: !overview && !error }
}

export type PlatformHomeVM = ReturnType<typeof usePlatformHomeViewModel>
