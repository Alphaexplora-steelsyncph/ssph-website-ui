import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../models/apiService'
import type { AuthSession, LoginPayload } from '../models/types'
import { isEmail } from '../utils/validators'

/** Shared form + submit logic for the admin and member login ViewModels. */
export const useLoginFlow = (
  loginFn: (payload: LoginPayload) => Promise<AuthSession>,
  redirectTo: string,
) => {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errors: { email?: string; password?: string } = {}
    if (!isEmail(email)) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Enter your password.'
    setFieldErrors(errors)
    setError(null)
    if (Object.keys(errors).length) return

    try {
      setIsSubmitting(true)
      setSession(await loginFn({ email, password }))
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { email, setEmail, password, setPassword, fieldErrors, error, isSubmitting, submit }
}
