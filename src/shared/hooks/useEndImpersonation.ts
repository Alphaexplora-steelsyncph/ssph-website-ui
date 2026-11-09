import { useCallback, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { endImpersonation as endImpersonationOnServer } from '../models/apiService'

/** Leaves "View as gym" and returns to the gym's page in the platform dashboard. */
export const useEndImpersonation = () => {
  const { user, endImpersonation } = useAuth()
  const [isEnding, setIsEnding] = useState(false)

  const exit = useCallback(async () => {
    const gymId = user?.gymId
    setIsEnding(true)
    try {
      await endImpersonationOnServer() // logs the end; fails harmlessly if the session already expired
    } catch {
      /* expired: nothing to log on the server */
    }
    endImpersonation()
    // Full reload so the admin route guard does not redirect before the platform session is back.
    window.location.replace(gymId ? `/platform/gyms/${gymId}` : '/platform')
  }, [user?.gymId, endImpersonation])

  return { exit, isEnding }
}
