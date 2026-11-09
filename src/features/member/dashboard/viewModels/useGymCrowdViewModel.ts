import { useCallback, useEffect, useState } from 'react'
import { ApiError, fetchGymCrowd } from '../../../../shared/models/apiService'
import type { GymCrowd } from '../../../../shared/models/types'

const REFRESH_MS = 60_000

export type CrowdLevel = 'Quiet' | 'Moderate' | 'Busy'

export const useGymCrowdViewModel = () => {
  const [crowd, setCrowd] = useState<GymCrowd | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      setCrowd(await fetchGymCrowd())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the gym count.')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchGymCrowd()
      .then(setCrowd)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the gym count.'))
    const id = setInterval(() => void refresh(), REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  const level: CrowdLevel | null = !crowd ? null : crowd.count <= 5 ? 'Quiet' : crowd.count <= 15 ? 'Moderate' : 'Busy'

  return { crowd, level, isRefreshing, error, refresh }
}
