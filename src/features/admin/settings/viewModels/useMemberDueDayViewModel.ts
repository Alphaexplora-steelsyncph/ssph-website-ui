import { useEffect, useState } from 'react'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchMyGym, setMemberDueDay } from '../../../../shared/models/apiService'

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1)

/** Gym admin picks the day members pay on. Only shown when Alphaexplora switched the feature on. */
export const useMemberDueDayViewModel = () => {
  const { token, setSession } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [savedDay, setSavedDay] = useState<number | null>(null)
  const [day, setDayState] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchMyGym()
      .then((gym) => {
        setEnabled(!!gym.memberDuesEnabled)
        setSavedDay(gym.memberDueDay ?? null)
        setDayState(gym.memberDueDay ? String(gym.memberDueDay) : '')
      })
      .catch(() => undefined) // the Gym profile card already reports a load error
      .finally(() => setIsLoading(false))
  }, [])

  const setDay = (value: string) => {
    setDayState(value)
    setError(null)
    setSaved(false)
  }

  const save = async () => {
    const next = Number(day)
    if (!Number.isInteger(next) || next < 1 || next > 28) {
      setError('Choose a payment day from 1 to 28.')
      return
    }
    try {
      setIsSaving(true)
      const { gym, user } = await setMemberDueDay(next)
      setSavedDay(gym.memberDueDay ?? null)
      if (token) setSession({ user, token }) // Enroll reads the day from the signed-in user
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return { enabled, isLoading, days: DAYS, day, setDay, savedDay, isDirty: day !== '' && Number(day) !== savedDay, isSaving, error, saved, save }
}
