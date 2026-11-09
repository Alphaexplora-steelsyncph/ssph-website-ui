import { useEffect } from 'react'

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const

/** Calls onIdle after `minutes` without user activity. Used for the super admin session. */
export const useIdleLogout = (minutes: number | undefined, onIdle: () => void) => {
  useEffect(() => {
    if (!minutes) return
    let timer = window.setTimeout(onIdle, minutes * 60_000)
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(onIdle, minutes * 60_000)
    }
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      window.clearTimeout(timer)
      EVENTS.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [minutes, onIdle])
}
