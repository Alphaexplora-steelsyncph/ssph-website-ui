import { useState } from 'react'
import { ApiError, fetchProgramHistory, restoreProgramVersion } from '../../../../shared/models/apiService'
import type { ProgramVersion, TrainingProgram } from '../../../../shared/models/types'

/** History dialog: every saved version, preview one, put it back as the current program. */
export const useProgramHistoryViewModel = (memberId: string, onRestored: (program: TrainingProgram) => void) => {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<ProgramVersion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [selected, setSelected] = useState<ProgramVersion | null>(null)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const openDialog = async () => {
    setOpen(true)
    setSelected(null)
    setConfirmRestore(false)
    setError(null)
    setInfo(null)
    setVersions(null)
    try {
      setVersions(await fetchProgramHistory(memberId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the history.')
    }
  }

  const restore = async () => {
    if (!selected) return
    try {
      setIsRestoring(true)
      const result = await restoreProgramVersion(memberId, selected.id)
      if (result.unchanged) {
        setInfo('This version is already the same as the current program, so nothing changed.')
        return
      }
      onRestored(result.program)
      setOpen(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not restore this version.')
    } finally {
      setIsRestoring(false)
      setConfirmRestore(false)
    }
  }

  return {
    open,
    openDialog,
    close: () => setOpen(false),
    versions,
    isLoading: open && versions === null && !error,
    error,
    selected,
    info,
    select: (v: ProgramVersion | null) => {
      setInfo(null)
      setSelected(v)
      setConfirmRestore(false)
    },
    /** The newest version is what the member already has. */
    isCurrent: (v: ProgramVersion) => versions?.[0]?.id === v.id,
    /** An older version with exactly the current program in it: restoring it would change nothing. */
    isSameAsCurrent: (v: ProgramVersion) =>
      !!versions?.[0] && versions[0].id !== v.id && JSON.stringify(versions[0].program) === JSON.stringify(v.program),
    confirmRestore,
    askRestore: () => setConfirmRestore(true),
    cancelRestore: () => setConfirmRestore(false),
    isRestoring,
    restore,
  }
}

export type ProgramHistoryVM = ReturnType<typeof useProgramHistoryViewModel>
