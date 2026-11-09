import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchGymSite, fetchGyms, registerMember } from '../../../../shared/models/apiService'
import type { Gym, GymSite } from '../../../../shared/models/types'
import { currentGymSlug } from '../../../../shared/tenant/tenant'
import { isEmail, MIN_PASSWORD_LENGTH } from '../../../../shared/utils/validators'

type Errors = Partial<Record<'fullName' | 'email' | 'gymId' | 'password' | 'confirm', string>>

export const useMemberRegisterViewModel = () => {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [gyms, setGyms] = useState<Gym[]>([])
  /** On a gym's own address the gym is fixed: no picker. */
  const [lockedGym, setLockedGym] = useState<GymSite | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [gymId, setGymId] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Errors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const slug = currentGymSlug()
    if (slug) {
      fetchGymSite(slug)
        .then((site) => {
          setLockedGym(site)
          setGymId(site.id)
        })
        .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your gym. Please refresh.'))
      return
    }
    fetchGyms().then(setGyms).catch(() => setError('Could not load gyms. Please refresh.'))
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errors: Errors = {}
    if (fullName.trim().length < 2) errors.fullName = 'Enter your full name.'
    if (!isEmail(email)) errors.email = 'Enter a valid email address.'
    if (!gymId) errors.gymId = 'Choose your gym.'
    if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    if (confirm !== password) errors.confirm = 'Passwords do not match.'
    setFieldErrors(errors)
    setError(null)
    if (Object.keys(errors).length) return

    try {
      setIsSubmitting(true)
      setSession(await registerMember({ fullName, email, gymId, password }))
      navigate('/member', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    gyms, lockedGym, fullName, setFullName, email, setEmail, gymId, setGymId,
    password, setPassword, confirm, setConfirm, fieldErrors, error, isSubmitting, submit,
  }
}
