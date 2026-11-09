import { useEffect, useMemo, useState } from 'react'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import { usePagedList } from '../../../../shared/hooks/usePagedList'
import { ApiError, fetchMembers, terminateMember as terminateMemberRecord } from '../../../../shared/models/apiService'
import type { MemberRecord, MembershipStatus } from '../../../../shared/models/types'

export type StatusFilter = 'All' | MembershipStatus | 'Balance due'
const STATUS_FILTERS: StatusFilter[] = ['All', 'Active', 'Expired', 'Terminated', 'Balance due']

/** Members who still owe the gym money (terminated accounts are not chased). */
/** Unpaid now. A plan payment scheduled for the gym's payment day does not count until that day. */
const owesMoney = (m: MemberRecord) => m.status !== 'Terminated' && m.balanceDue > 0 && !m.balanceUpcoming

export const useUserManagementViewModel = () => {
  const { hasPermission } = useAuth()
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [pendingId, setPendingId] = useState<string | null>(null)

  // Fine-grained access is computed here, never in the View.
  const canTerminateMembers = hasPermission(PERMISSIONS.TERMINATE_MEMBERS)

  useEffect(() => {
    let cancelled = false
    fetchMembers()
      .then((data) => !cancelled && setMembers(data))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Failed to load members.'))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // Counts for the filter chips always cover the whole list, so they stay put while searching.
  const statusOptions = useMemo(
    () =>
      STATUS_FILTERS.map((value) => ({
        value,
        count:
          value === 'All' ? members.length : value === 'Balance due' ? members.filter(owesMoney).length : members.filter((m) => m.status === value).length,
      })),
    [members],
  )

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter(
      (m) =>
        (statusFilter === 'All' || (statusFilter === 'Balance due' ? owesMoney(m) : m.status === statusFilter)) &&
        (!q || m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)),
    )
  }, [members, search, statusFilter])

  // 10 rows per page; new search / filter goes back to page 1.
  const paging = usePagedList(filteredMembers, `${statusFilter}|${search.trim().toLowerCase()}`)

  /** Called when a member is reinstated: swap the updated record into the list. */
  const replaceMember = (updated: MemberRecord) => setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))

  const terminateMember = async (memberId: string) => {
    if (!canTerminateMembers) return // fail-safe; the server enforces this too
    try {
      setPendingId(memberId)
      setError(null)
      const updated = await terminateMemberRecord(memberId)
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not terminate this account.')
    } finally {
      setPendingId(null)
    }
  }

  return {
    members: paging.pageItems,
    matchCount: filteredMembers.length,
    totalCount: members.length,
    paging,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    statusOptions,
    isFiltering: statusFilter !== 'All' || search.trim() !== '',
    canTerminateMembers,
    pendingId,
    terminateMember,
    replaceMember,
  }
}
