import { useCallback, useEffect, useRef, useState } from 'react'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import { useGymLiveEvents } from '../../../../shared/hooks/useGymLiveEvents'
import { ApiError, fetchGymCrowdNow } from '../../../../shared/models/apiService'
import type { GymCrowd } from '../../../../shared/models/types'

export type CrowdWindow = 1 | 2 | 3
const WINDOWS: CrowdWindow[] = [1, 2, 3]
/**
 * The count goes UP on a check-in (live event) and DOWN only as time passes (people leave the 1–3 hour window),
 * so a slow timer is enough for the drop.
 */
const TIME_REFRESH_MS = 5 * 60_000

/** "In the gym now": members who checked in within the chosen window. */
export const useGymCrowdNowViewModel = () => {
  const { hasPermission } = useAuth()
  const enabled = hasPermission(PERMISSIONS.VIEW_VISITS)
  const [hours, setHours] = useState<CrowdWindow>(2)
  const [crowd, setCrowd] = useState<GymCrowd | null>(null)
  const [error, setError] = useState<string | null>(null)
  const stale = useRef(false)
  const debounce = useRef<number | undefined>(undefined)

  const load = useCallback(() => {
    if (document.hidden) {
      stale.current = true
      return
    }
    stale.current = false
    fetchGymCrowdNow(hours)
      .then((next) => {
        setCrowd(next)
        setError(null)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the count.'))
  }, [hours])

  useEffect(() => {
    if (!enabled) return
    load()
    const timer = window.setInterval(load, TIME_REFRESH_MS)
    const onVisible = () => !document.hidden && stale.current && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.clearTimeout(debounce.current)
    }
  }, [enabled, load])

  useGymLiveEvents(enabled, (signal) => {
    if (signal === 'unavailable') return
    window.clearTimeout(debounce.current)
    debounce.current = window.setTimeout(load, 400)
  })

  // A count for another window is stale while the new one loads.
  const current = crowd && crowd.windowHours === hours ? crowd : null
  return { enabled, windows: WINDOWS, hours, setHours, count: current?.count ?? null, asOf: current?.asOf ?? null, error }
}
