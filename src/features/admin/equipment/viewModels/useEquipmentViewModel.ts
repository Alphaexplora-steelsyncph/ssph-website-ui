import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import { usePagedList } from '../../../../shared/hooks/usePagedList'
import { ApiError, createEquipment, deleteEquipment, fetchEquipment, updateEquipment } from '../../../../shared/models/apiService'
import type { Equipment, EquipmentStatus } from '../../../../shared/models/types'

export const EQUIPMENT_STATUSES: EquipmentStatus[] = ['Available', 'Under maintenance', 'Broken']
export type EquipmentFilter = 'All' | EquipmentStatus

interface Draft {
  id: string | null // null = adding
  name: string
  area: string
  status: EquipmentStatus
  note: string
}

const empty: Draft = { id: null, name: '', area: '', status: 'Available', note: '' }

/** The gym's machine list (Equipment Status add-on): add, edit, change status, remove. */
export const useEquipmentViewModel = () => {
  const { hasPermission } = useAuth()
  const canEdit = hasPermission(PERMISSIONS.ENROLL_MEMBERS)
  const [items, setItems] = useState<Equipment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<EquipmentFilter>('All')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null) // dialog open while set
  const [draftError, setDraftError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchEquipment()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the equipment list.'))
  }, [])

  const replace = (next: Equipment) =>
    setItems((prev) =>
      prev ? (prev.some((i) => i.id === next.id) ? prev.map((i) => (i.id === next.id ? next : i)) : [...prev, next]) : [next],
    )

  const counts = useMemo(() => {
    const c: Record<EquipmentFilter, number> = { All: 0, Available: 0, 'Under maintenance': 0, Broken: 0 }
    for (const i of items ?? []) {
      c.All += 1
      c[i.status] += 1
    }
    return c
  }, [items])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (items ?? [])
      .filter(
        (i) =>
          (filter === 'All' || i.status === filter) && (!q || i.name.toLowerCase().includes(q) || (i.area ?? '').toLowerCase().includes(q)),
      )
      .sort((a, b) => (a.area ?? '~').localeCompare(b.area ?? '~') || a.name.localeCompare(b.name))
  }, [items, filter, search])

  const paging = usePagedList(visible, `${filter}|${search.trim().toLowerCase()}`)

  const areas = useMemo(() => [...new Set((items ?? []).map((i) => i.area).filter(Boolean) as string[])].sort(), [items])

  /** One-tap status change from the list. Going back to Available clears the member note (server side). */
  const setStatus = async (item: Equipment, status: EquipmentStatus) => {
    if (!canEdit || item.status === status) return
    try {
      setBusyId(item.id)
      setError(null)
      replace(await updateEquipment(item.id, { status }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change the status.')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (item: Equipment) => {
    if (confirmDeleteId !== item.id) {
      setConfirmDeleteId(item.id)
      return
    }
    try {
      setBusyId(item.id)
      await deleteEquipment(item.id)
      setItems((prev) => prev?.filter((i) => i.id !== item.id) ?? null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove it.')
    } finally {
      setBusyId(null)
      setConfirmDeleteId(null)
    }
  }

  const openAdd = () => {
    setDraftError(null)
    setDraft({ ...empty })
  }
  const openEdit = (item: Equipment) => {
    setDraftError(null)
    setDraft({ id: item.id, name: item.name, area: item.area ?? '', status: item.status, note: item.note ?? '' })
  }
  const editDraft = (patch: Partial<Draft>) => {
    setDraftError(null)
    setDraft((d) => (d ? { ...d, ...patch } : d))
  }

  const saveDraft = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!draft) return
    if (draft.name.trim().length < 2) {
      setDraftError('Enter the equipment name (2 to 80 characters).')
      return
    }
    try {
      setIsSaving(true)
      const input = { name: draft.name.trim(), area: draft.area.trim(), status: draft.status, note: draft.note.trim() }
      replace(draft.id ? await updateEquipment(draft.id, input) : await createEquipment(input))
      setDraft(null)
    } catch (err) {
      setDraftError(err instanceof ApiError ? err.message : 'Could not save.')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    canEdit,
    isLoading: items === null && !error,
    error,
    isEmpty: items?.length === 0,
    items: paging.pageItems,
    paging,
    counts,
    filters: ['All', ...EQUIPMENT_STATUSES] as EquipmentFilter[],
    filter,
    setFilter,
    search,
    setSearch,
    statuses: EQUIPMENT_STATUSES,
    setStatus,
    busyId,
    remove,
    confirmDeleteId,
    cancelDelete: () => setConfirmDeleteId(null),
    draft,
    draftError,
    isSaving,
    areas,
    openAdd,
    openEdit,
    editDraft,
    saveDraft,
    closeDraft: () => setDraft(null),
  }
}

export type EquipmentVM = ReturnType<typeof useEquipmentViewModel>
