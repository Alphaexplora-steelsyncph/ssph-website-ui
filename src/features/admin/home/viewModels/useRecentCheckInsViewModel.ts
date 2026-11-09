import { useCallback, useEffect, useRef, useState } from 'react'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import { useGymLiveEvents } from '../../../../shared/hooks/useGymLiveEvents'
import { ApiError, fetchRecentCheckIns } from '../../../../shared/models/apiService'
import type { RecentCheckIn } from '../../../../shared/models/types'

const SHOWN = 8
/** Only when live updates are unavailable. */
const FALLBACK_REFRESH_MS = 60_000
/** Re-renders "2 min ago" labels. Local clock only: no request. */
const CLOCK_MS = 30_000

/**
 * Live "Latest check-ins". The list is fetched once, then again only when the server says a member checked in
 * (live stream), so a quiet dashboard sends no requests. A hidden tab catches up when it becomes visible.
 */
export const useRecentCheckInsViewModel = () => {
  const { hasPermission } = useAuth()
  const enabled = hasPermission(PERMISSIONS.VIEW_VISITS)
  const [items, setItems] = useState<RecentCheckIn[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [live, setLive] = useState(true)
  const stale = useRef(false) // something happened while the tab was hidden
  const debounce = useRef<number | undefined>(undefined)

  const load = useCallback(() => {
    if (document.hidden) {
      stale.current = true
      return
    }
    stale.current = false
    fetchRecentCheckIns(SHOWN)
      .then((rows) => {
        setItems(rows)
        setError(null)
        setNow(Date.now())
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the latest check-ins.'))
  }, [])

  useEffect(() => {
    if (!enabled) return
    load()
    const onVisible = () => !document.hidden && stale.current && load()
    document.addEventListener('visibilitychange', onVisible)
    const clock = window.setInterval(() => setNow(Date.now()), CLOCK_MS)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(clock)
      window.clearTimeout(debounce.current)
    }
  }, [enabled, load])

  useGymLiveEvents(enabled, (signal) => {
    if (signal === 'unavailable') return setLive(false)
    setLive(true)
    // A burst of scans (or a reconnect) becomes one request.
    window.clearTimeout(debounce.current)
    debounce.current = window.setTimeout(load, 400)
  })

  // Fallback only: no live stream, so refresh on a slow timer.
  useEffect(() => {
    if (!enabled || live) return
    const timer = window.setInterval(load, FALLBACK_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [enabled, live, load])

  const [latest, ...earlier] = items ?? []
  return { enabled, isLoading: items === null && !error, error, latest, earlier, isEmpty: items?.length === 0, now, live }
}

export type RecentCheckInsVM = ReturnType<typeof useRecentCheckInsViewModel>
