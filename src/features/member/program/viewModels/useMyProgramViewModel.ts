import { useEffect, useState } from 'react'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, fetchMyProgram } from '../../../../shared/models/apiService'
import type { MyProgram } from '../../../../shared/models/types'
import { useProgramExport } from '../../../../shared/training/useProgramExport'

/** Member: their coach's program, read only. Finished weeks are hidden unless the member shows them. */
export const useMyProgramViewModel = () => {
  const { user } = useAuth()
  const [data, setData] = useState<MyProgram | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFinished, setShowFinished] = useState(false)

  useEffect(() => {
    fetchMyProgram()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your program.'))
  }, [])

  const exporter = useProgramExport(data?.program?.title ?? '', user?.fullName)
  const profile = data?.profile
  const hasProfile = !!profile && !!profile.remarks

  return {
    isLoading: !data && !error,
    error,
    hidden: data ? !data.visible : false,
    hiddenReason: data?.hiddenReason,
    coachName: data?.coachName,
    program: data?.program ?? null,
    profile: hasProfile ? profile : undefined,
    memberName: user?.fullName,
    gymName: user?.gymName,
    showFinished,
    toggleFinished: () => setShowFinished((s) => !s),
    exporter,
  }
}
