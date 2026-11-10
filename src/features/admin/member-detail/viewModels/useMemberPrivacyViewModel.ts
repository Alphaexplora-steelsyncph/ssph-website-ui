import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import { ApiError, eraseMember, exportMemberData } from '../../../../shared/models/apiService'
import { todayISO } from '../../../../shared/utils/dates'

/**
 * A member's privacy requests (Data Privacy Act): a copy of their data, or erasing it.
 * Only for admins who may terminate members; erasing cannot be undone, so it asks to be confirmed.
 */
export const useMemberPrivacyViewModel = (memberId: string, memberName: string) => {
  const { hasPermission } = useAuth()
  const navigate = useNavigate()
  const canManage = hasPermission(PERMISSIONS.TERMINATE_MEMBERS)
  const [isExporting, setIsExporting] = useState(false)
  const [confirmingErase, setConfirmingErase] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [isErasing, setIsErasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Saves the member's data as a JSON file in the browser; nothing is stored anywhere else. */
  const exportData = async () => {
    try {
      setIsExporting(true)
      setError(null)
      const data = await exportMemberData(memberId)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `member-data-${todayISO()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not export the data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  /** The admin types the member's name so a stray click cannot erase anyone. */
  const nameMatches = typedName.trim().toLowerCase() === memberName.trim().toLowerCase()

  const erase = async () => {
    if (!nameMatches) return
    try {
      setIsErasing(true)
      setError(null)
      await eraseMember(memberId)
      navigate('/admin/members', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not erase this member. Please try again.')
      setIsErasing(false)
    }
  }

  return {
    canManage,
    isExporting,
    exportData,
    confirmingErase,
    openErase: () => {
      setError(null)
      setTypedName('')
      setConfirmingErase(true)
    },
    closeErase: () => setConfirmingErase(false),
    typedName,
    setTypedName,
    nameMatches,
    isErasing,
    erase,
    error,
  }
}

export type MemberPrivacyVM = ReturnType<typeof useMemberPrivacyViewModel>
