import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchMyMembership } from '../../../../shared/models/apiService'
import type { MyMembership } from '../../../../shared/models/types'

export const useMemberProfileViewModel = () => {
  const { user, loginPath, logout } = useAuth()
  const navigate = useNavigate()
  const [membership, setMembership] = useState<MyMembership | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyMembership()
      .then(setMembership)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your profile.'))
      .finally(() => setIsLoading(false))
  }, [])

  const signOut = () => {
    const destination = loginPath
    logout()
    navigate(destination, { replace: true })
  }

  return { user, membership, isLoading, error, signOut }
}
