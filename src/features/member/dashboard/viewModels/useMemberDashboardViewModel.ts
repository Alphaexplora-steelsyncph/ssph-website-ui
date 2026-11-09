import { useEffect, useState } from 'react'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchMyMembership } from '../../../../shared/models/apiService'
import type { MyMembership } from '../../../../shared/models/types'

export const useMemberDashboardViewModel = () => {
  const { user } = useAuth()
  const [membership, setMembership] = useState<MyMembership | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyMembership()
      .then(setMembership)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your membership.'))
      .finally(() => setIsLoading(false))
  }, [])

  // Worked out by the server (Manila date), so the member and the front desk see the same thing.
  const daysLeft = membership?.member?.daysLeft ?? null

  return {
    firstName: user?.fullName.split(' ')[0] ?? '',
    gymName: membership?.gymName ?? user?.gymName ?? '',
    membership,
    daysLeft,
    expiringSoon: membership?.member?.expiringSoon ?? false,
    isLoading,
    error,
  }
}

export type MemberDashboardVM = ReturnType<typeof useMemberDashboardViewModel>
