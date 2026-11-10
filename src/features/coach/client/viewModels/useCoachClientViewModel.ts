import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchCoachClient, removeCoachClient, saveTrainingProfile } from '../../../../shared/models/apiService'
import type { CoachClientDetail } from '../../../../shared/models/types'
import { useProgramExport } from '../../../../shared/training/useProgramExport'

interface ProfileDraft {
  remarks: string
}

const toDraft = (d: CoachClientDetail): ProfileDraft => ({ remarks: d.profile.remarks })

/** Coach's page for one client: who they are, your notes, the current program, download, remove. */
export const useCoachClientViewModel = () => {
  const { memberId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [detail, setDetail] = useState<CoachClientDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [justSaved] = useState(() => !!(location.state as { justSaved?: boolean } | null)?.justSaved)
  const [unchanged] = useState(() => !!(location.state as { unchanged?: boolean } | null)?.unchanged)

  const [draft, setDraft] = useState<ProfileDraft>({ remarks: '' })
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileErrors, setProfileErrors] = useState<{ form?: string }>({})
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
    try {
      setIsSavingProfile(true)
      const profile = await saveTrainingProfile(memberId, { remarks: draft.remarks.trim() })
      setDetail((d) => (d ? { ...d, profile } : d))
      setEditingProfile(false)
    } catch (err) {
      setProfileErrors({ form: err instanceof ApiError ? err.message : 'Could not save the notes.' })
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
