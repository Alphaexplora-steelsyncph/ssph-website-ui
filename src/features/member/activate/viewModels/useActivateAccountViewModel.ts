import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { homePathFor, loginPathFor, useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, activateAccount, fetchInvite } from '../../../../shared/models/apiService'
import type { InviteDetails } from '../../../../shared/models/types'
import { MIN_PASSWORD_LENGTH } from '../../../../shared/utils/validators'

export const useActivateAccountViewModel = () => {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { setSession } = useAuth()

  const [invite, setInvite] = useState<InviteDetails | null>(null)
  const [isLoading, setIsLoading] = useState(!!token)
  const [loadError, setLoadError] = useState<string | null>(
    token ? null : 'This invite link is incomplete. Ask the front desk for a new one.',
  )

  const [password, setPasswordState] = useState('')
  const [confirm, setConfirmState] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    fetchInvite(token)
      .then(setInvite)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Could not open this invite.'))
      .finally(() => setIsLoading(false))
  }, [token])

  const setPassword = (v: string) => { setPasswordState(v); setFieldErrors((e) => ({ ...e, password: undefined })); setError(null) }
  const setConfirm = (v: string) => { setConfirmState(v); setFieldErrors((e) => ({ ...e, confirm: undefined })); setError(null) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errors: { password?: string; confirm?: string } = {}
    if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    if (confirm !== password) errors.confirm = 'Passwords do not match.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    try {
      setIsSubmitting(true)
      const session = await activateAccount({ token, password })
      setSession(session)
      navigate(homePathFor(session.user.role), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not activate your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReset = invite?.kind === 'reset'
  const loginPath = loginPathFor(invite?.role)

  return { invite, isReset, loginPath, isLoading, loadError, password, setPassword, confirm, setConfirm, fieldErrors, error, isSubmitting, submit }
}
