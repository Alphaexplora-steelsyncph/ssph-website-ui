import { useEffect, useState } from 'react'
import { ApiError, fetchGymQr, regenerateGymQr } from '../../../../shared/models/apiService'
import type { GymQr } from '../../../../shared/models/types'
import { checkInLink } from '../../../../shared/utils/links'

export const useGymQrViewModel = () => {
  const [qr, setQr] = useState<GymQr | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGymQr()
      .then(setQr)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the gym QR.'))
      .finally(() => setIsLoading(false))
  }, [])

  const regenerate = async () => {
    try {
      setIsRegenerating(true)
      setError(null)
      setQr(await regenerateGymQr())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not make a new QR.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const print = () => window.print()

  return {
    qr,
    link: qr ? checkInLink(qr.gymSlug, qr.token) : '',
    isLoading,
    isRegenerating,
    error,
    regenerate,
    print,
  }
}
