import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, checkIn } from '../../../../shared/models/apiService'
import type { CheckInResult } from '../../../../shared/models/types'

export type CheckInPhase = 'checking' | 'result' | 'invalid' | 'wrong-account' | 'blocked'

export const useCheckInViewModel = () => {
  const [params] = useSearchParams()
  const gymSlug = params.get('gym') ?? ''
  const token = params.get('t') ?? ''
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, hasPermission } = useAuth()
  const canCheckIn = hasPermission(PERMISSIONS.CHECK_IN)

  const hasLink = !!gymSlug && !!token
  // Outcomes known before calling the server are derived, not set in an effect.
  const [phase, setPhase] = useState<CheckInPhase>(() =>
    !hasLink ? 'invalid' : isAuthenticated && !canCheckIn ? 'wrong-account' : 'checking',
  )
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState<string | null>(
    hasLink ? null : 'This QR link is incomplete. Scan the poster at the gym entrance again.',
  )
  const started = useRef(false) // one scan = one check-in, even when React re-runs effects

  useEffect(() => {
    if (started.current || !hasLink) return
    if (!isAuthenticated) {
      // Come back here right after logging in.
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
      return
    }
    if (!canCheckIn) return
    started.current = true
    checkIn({ gymSlug, token })
      .then((r) => {
        setResult(r)
        setPhase('result')
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Check-in failed. Please try again.')
        // FORBIDDEN = the account cannot be used right now (e.g. disabled); otherwise the QR is bad.
        setPhase(err instanceof ApiError && (err.code === 'FORBIDDEN' || err.code === 'UNAUTHORIZED') ? 'blocked' : 'invalid')
      })
  }, [hasLink, gymSlug, token, isAuthenticated, canCheckIn, location.pathname, location.search, navigate])

  return { phase, result, error }
}
