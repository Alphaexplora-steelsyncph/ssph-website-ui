import { useEffect, useMemo, useState } from 'react'
import { ApiError, fetchCoachClients } from '../../../../shared/models/apiService'
import type { CoachClient } from '../../../../shared/models/types'

export type ClientFilter = 'All' | 'No program' | 'Hidden'

/** Coach dashboard: the coach's clients with a quick search and filter. */
export const useCoachClientsViewModel = () => {
  const [clients, setClients] = useState<CoachClient[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ClientFilter>('All')

  useEffect(() => {
    fetchCoachClients()
      .then(setClients)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your clients.'))
  }, [])

  const counts = useMemo(() => {
    const list = clients ?? []
    return {
      All: list.length,
      'No program': list.filter((c) => !c.programTitle && !c.programUpdatedAt).length,
      Hidden: list.filter((c) => !c.programVisible).length,
    } satisfies Record<ClientFilter, number>
  }, [clients])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (clients ?? []).filter((c) => {
      if (filter === 'No program' && (c.programTitle || c.programUpdatedAt)) return false
      if (filter === 'Hidden' && c.programVisible) return false
      return !q || c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    })
  }, [clients, search, filter])

  return {
    isLoading: clients === null && !error,
    error,
    hasClients: (clients?.length ?? 0) > 0,
    clients: visible,
    counts,
    filters: ['All', 'No program', 'Hidden'] as ClientFilter[],
    filter,
    setFilter,
    search,
    setSearch,
  }
}

export type CoachClientsVM = ReturnType<typeof useCoachClientsViewModel>
