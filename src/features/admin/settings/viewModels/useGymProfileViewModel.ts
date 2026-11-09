import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchMyGym, updateGymSettings } from '../../../../shared/models/apiService'

export const useGymProfileViewModel = () => {
  const { token, setSession } = useAuth()
  const [savedName, setSavedName] = useState('')
  const [name, setNameState] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchMyGym()
      .then((gym) => {
        setSavedName(gym.name)
        setNameState(gym.name)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your gym.'))
      .finally(() => setIsLoading(false))
  }, [])

  const trimmed = name.trim().replace(/\s+/g, ' ')
  const isDirty = trimmed !== savedName
  const accountNamePreview = `${trimmed || 'Your Gym'} Admin`

  const setName = (value: string) => {
    setNameState(value)
    setError(null)
    setSaved(false)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (trimmed.length < 2 || trimmed.length > 60) {
      setError('Gym name must be 2 to 60 characters.')
      return
    }
    try {
      setIsSaving(true)
      const { gym, user } = await updateGymSettings({ name: trimmed })
      setSavedName(gym.name)
      setNameState(gym.name)
      if (token) setSession({ user, token }) // header now shows "<Gym Name> Admin"
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return { name, setName, isLoading, isSaving, isDirty, error, saved, accountNamePreview, save }
}
