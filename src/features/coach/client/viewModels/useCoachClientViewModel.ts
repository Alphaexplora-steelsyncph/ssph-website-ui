import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchCoachClient, removeCoachClient, saveTrainingProfile } from '../../../../shared/models/apiService'
import type { CoachClientDetail } from '../../../../shared/models/types'
import { useProgramExport } from '../../../../shared/training/useProgramExport'

interface ProfileDraft {
  weightKg: string
  heightCm: string
  remarks: string
}

const toDraft = (d: CoachClientDetail): ProfileDraft => ({
  weightKg: d.profile.weightKg?.toString() ?? '',
  heightCm: d.profile.heightCm?.toString() ?? '',
  remarks: d.profile.remarks,
})

const parseMeasure = (value: string, label: string, min: number, max: number): [number | null, string | undefined] => {
  if (!value.trim()) return [null, undefined]
  const n = Number(value)
  if (!Number.isFinite(n) || n < min || n > max) return [null, `${label} must be between ${min} and ${max}.`]
  return [Math.round(n * 10) / 10, undefined]
}

/** Coach's page for one client: who they are, body details, the current program, download, remove. */
export const useCoachClientViewModel = () => {
  const { memberId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [detail, setDetail] = useState<CoachClientDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [justSaved] = useState(() => !!(location.state as { justSaved?: boolean } | null)?.justSaved)
  const [unchanged] = useState(() => !!(location.state as { unchanged?: boolean } | null)?.unchanged)

  const [draft, setDraft] = useState<ProfileDraft>({ weightKg: '', heightCm: '', remarks: '' })
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileErrors, setProfileErrors] = useState<{ weightKg?: string; heightCm?: string; form?: string }>({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [confirmRemove, setConfirmRemove] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const load = useCallback(() => {
    fetchCoachClient(memberId)
      .then((d) => {
        setDetail(d)
        setDraft(toDraft(d))
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load this client.'))
  }, [memberId])

  useEffect(load, [load])

  const exporter = useProgramExport(detail?.program?.title ?? '', detail?.client.fullName)

  const editProfile = (patch: Partial<ProfileDraft>) => {
    setProfileErrors({})
    setDraft((d) => ({ ...d, ...patch }))
  }

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    const [weightKg, weightErr] = parseMeasure(draft.weightKg, 'Weight (kg)', 20, 400)
    const [heightCm, heightErr] = parseMeasure(draft.heightCm, 'Height (cm)', 80, 260)
    if (weightErr || heightErr) {
      setProfileErrors({ weightKg: weightErr, heightCm: heightErr })
      return
    }
    try {
      setIsSavingProfile(true)
      const profile = await saveTrainingProfile(memberId, { weightKg, heightCm, remarks: draft.remarks.trim() })
      setDetail((d) => (d ? { ...d, profile } : d))
      setEditingProfile(false)
    } catch (err) {
      setProfileErrors({ form: err instanceof ApiError ? err.message : 'Could not save the details.' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const remove = async () => {
    try {
      setIsRemoving(true)
      await removeCoachClient(memberId)
      navigate('/coach', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove this client.')
      setConfirmRemove(false)
    } finally {
      setIsRemoving(false)
    }
  }

  return {
    memberId,
    coachName: user?.fullName,
    gymName: user?.gymName,
    isLoading: !detail && !error,
    error,
    justSaved,
    unchanged,
    detail,
    client: detail?.client,
    program: detail?.program ?? null,
    profile: detail?.profile,
    exporter,
    reload: load,
    draft,
    editProfile,
    editingProfile,
    startEditProfile: () => {
      if (detail) setDraft(toDraft(detail))
      setProfileErrors({})
      setEditingProfile(true)
    },
    cancelEditProfile: () => setEditingProfile(false),
    profileErrors,
    isSavingProfile,
    saveProfile,
    confirmRemove,
    askRemove: () => setConfirmRemove(true),
    cancelRemove: () => setConfirmRemove(false),
    isRemoving,
    remove,
    onProgramRestored: (program: CoachClientDetail['program']) => setDetail((d) => (d ? { ...d, program } : d)),
  }
}

export type CoachClientVM = ReturnType<typeof useCoachClientViewModel>
