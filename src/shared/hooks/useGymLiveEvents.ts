import { useEffect, useRef } from 'react'
import { subscribeGymEvents, type LiveSignal } from '../models/liveGymEvents'

/**
 * Calls `onSignal` for the gym's live events while `enabled` (see liveGymEvents.ts). The latest callback is
 * always used, so callers can pass an inline function.
 */
export const useGymLiveEvents = (enabled: boolean, onSignal: (signal: LiveSignal) => void) => {
  const handler = useRef(onSignal)
  useEffect(() => {
    handler.current = onSignal
  })
  useEffect(() => {
    if (!enabled) return
    return subscribeGymEvents((signal) => handler.current(signal))
  }, [enabled])
}
