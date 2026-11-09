import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, addCoachClient, fetchAvailableMembers } from '../../../../shared/models/apiService'
import type { AvailableMember } from '../../../../shared/models/types'

/** "Add client" dialog: search the gym's active members who have no coach yet and take one. */
export const useAddClientViewModel = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AvailableMember[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const timer = setTimeout(() => {
      fetchAvailableMembers(query.trim())
        .then((list) => !cancelled && (setResults(list), setError(null)))
        .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not search members.'))
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [open, query])

  const add = async (member: AvailableMember) => {
    try {
      setAddingId(member.id)
      setError(null)
      await addCoachClient(member.id)
      navigate(`/coach/clients/${member.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add this client.')
      // Someone else may have taken the member: refresh the list.
      setResults(await fetchAvailableMembers(query.trim()).catch(() => results))
    } finally {
      setAddingId(null)
    }
  }

  return {
    open,
    openDialog: () => {
      setQuery('')
      setResults(null)
      setError(null)
      setOpen(true)
    },
    close: () => setOpen(false),
    query,
    setQuery,
    results,
    isSearching: open && results === null && !error,
    error,
    addingId,
    add,
  }
}

export type AddClientVM = ReturnType<typeof useAddClientViewModel>
