import { ApiError, readGymLiveStream } from './apiService'

/**
 * One live connection per browser tab, shared by every dashboard panel that listens (latest check-ins, crowd).
 * Reconnects by itself after a drop (2 s, then up to 30 s apart). Listeners hear:
 *   'connected'   the stream is (re)open: refresh once, something may have happened while it was down
 *   'check-in'    a member of this gym just checked in
 *   'unavailable' no live updates (old backend, signed out, too many failures): refresh on a slow timer instead
 */
export type LiveSignal = 'connected' | 'check-in' | 'unavailable'
type Listener = (signal: LiveSignal) => void

const listeners = new Set<Listener>()
let controller: AbortController | null = null
let retryTimer: number | undefined
let failures = 0
let unavailable = false

const emit = (signal: LiveSignal) => listeners.forEach((l) => l(signal))

const connect = () => {
  controller = new AbortController()
  const { signal } = controller
  readGymLiveStream((name) => {
    if (name === 'ready') {
      failures = 0
      unavailable = false
      emit('connected')
    } else emit('check-in')
  }, signal)
    .then(() => !signal.aborted && scheduleRetry(false)) // server closed it (token age): reopen
    .catch((err) => {
      if (signal.aborted) return
      const permanent = err instanceof ApiError && (err.code === 'RESOURCE_NOT_FOUND' || err.code === 'UNAUTHORIZED' || err.code === 'FORBIDDEN')
      scheduleRetry(permanent)
    })
}

const scheduleRetry = (permanent: boolean) => {
  failures += 1
  if (permanent || failures >= 3) {
    if (!unavailable) emit('unavailable')
    unavailable = true
  }
  if (permanent && failures > 1) return // signed out / no stream: stay on the timer until the page reloads
  const wait = Math.min(30_000, 2_000 * 2 ** Math.min(failures - 1, 4))
  retryTimer = window.setTimeout(() => listeners.size && connect(), wait)
}

/** Starts listening; the returned function stops. The connection closes when the last listener leaves. */
export const subscribeGymEvents = (listener: Listener) => {
  listeners.add(listener)
  if (listeners.size === 1) {
    failures = 0
    unavailable = false
    connect()
  } else if (unavailable) listener('unavailable')
  return () => {
    listeners.delete(listener)
    if (listeners.size) return
    window.clearTimeout(retryTimer)
    controller?.abort()
    controller = null
  }
}
