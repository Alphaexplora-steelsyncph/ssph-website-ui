import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import { usePagedList } from '../../../../shared/hooks/usePagedList'
import {
  ApiError,
  createEquipment,
  fetchEquipment,
  removeEquipmentPhoto,
  saveEquipmentChanges,
  setEquipmentPhoto,
} from '../../../../shared/models/apiService'
import type { Equipment, EquipmentInput, EquipmentStatus } from '../../../../shared/models/types'
import { resizeToSquareJpeg } from '../../../../shared/utils/resizeImage'

export const EQUIPMENT_STATUSES: EquipmentStatus[] = ['Available', 'Under maintenance', 'Broken']
export type EquipmentFilter = 'All' | EquipmentStatus

interface Draft {
  id: string | null // null = adding
  name: string
  area: string
  status: EquipmentStatus
  note: string
  photoUrl?: string // the saved photo, if any
  photoFile: File | null // a new photo picked in the dialog
  photoPreview: string | null // local preview of photoFile
  removePhoto: boolean // the saved photo should be deleted
}

/** A photo change queued for Done: a new file (with its local preview) or removing the saved photo. */
type PhotoOp = { file: File; preview: string } | { remove: true }

/** A row as the admin sees it while editing: the saved machine with the queued changes applied. */
export interface EquipmentRow extends Equipment {
  isChanged: boolean
  isRemoving: boolean
}

const empty: Draft = { id: null, name: '', area: '', status: 'Available', note: '', photoFile: null, photoPreview: null, removePhoto: false }

const message = (err: unknown, fallback: string) => (err instanceof ApiError || err instanceof Error ? err.message : fallback)

/** Keeps only the fields that differ from the saved machine, so a change undone by hand is not sent. */
const diff = (saved: Equipment, change: EquipmentInput): EquipmentInput => {
  const out: EquipmentInput = {}
  if (change.name !== undefined && change.name !== saved.name) out.name = change.name
  if (change.area !== undefined && change.area !== (saved.area ?? '')) out.area = change.area
  if (change.status !== undefined && change.status !== saved.status) out.status = change.status
  if (change.note !== undefined && change.note !== (saved.note ?? '')) out.note = change.note
  return out
}

/**
 * The gym's machine list (Equipment Status add-on).
 * Status taps, edits and removals made in "Edit equipment status" are only queued on this screen. Nothing reaches
 * the server, or the members, until the admin presses Done, which saves everything in one request (photos, being
 * files, follow one upload each). Cancel throws the queued changes away. Adding a machine still saves right away.
 */
export const useEquipmentViewModel = () => {
  const { hasPermission } = useAuth()
  const canEdit = hasPermission(PERMISSIONS.ENROLL_MEMBERS)
  const [items, setItems] = useState<Equipment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<EquipmentFilter>('All')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null) // dialog open while set
  const [draftError, setDraftError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [pending, setPending] = useState<Record<string, EquipmentInput>>({})
  const [removing, setRemoving] = useState<Set<string>>(new Set())
  const [photoOps, setPhotoOps] = useState<Record<string, PhotoOp>>({})

  const load = () =>
    fetchEquipment()
      .then(setItems)
      .catch((err) => setError(message(err, 'Could not load the equipment list.')))

  useEffect(() => {
    fetchEquipment()
      .then(setItems)
      .catch((err) => setError(message(err, 'Could not load the equipment list.')))
  }, [])

  // Free the dialog's local preview when it is replaced or the dialog closes.
  const preview = draft?.photoPreview
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const changedIds = useMemo(
    () => new Set([...Object.keys(pending), ...removing, ...Object.keys(photoOps)]),
    [pending, removing, photoOps],
  )
  const changeCount = changedIds.size

  // Leaving the page with queued changes would lose them: let the browser ask first.
  useEffect(() => {
    if (!changeCount) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [changeCount])

  /** Saved machines with the queued changes applied, for the table, counts and filters. */
  const rows = useMemo<EquipmentRow[]>(
    () =>
      (items ?? []).map((saved) => {
        const change = pending[saved.id] ?? {}
        const op = photoOps[saved.id]
        const status = change.status ?? saved.status
        // Same rule as the server: back to Available clears the old note unless a new one was typed.
        const clearsNote = change.status === 'Available' && change.note === undefined
        return {
          ...saved,
          name: change.name ?? saved.name,
          area: change.area !== undefined ? change.area || undefined : saved.area,
          status,
          note: change.note !== undefined ? change.note || undefined : clearsNote ? undefined : saved.note,
          photoUrl: op ? ('file' in op ? op.preview : undefined) : saved.photoUrl,
          isChanged: changedIds.has(saved.id),
          isRemoving: removing.has(saved.id),
        }
      }),
    [items, pending, photoOps, removing, changedIds],
  )

  const counts = useMemo(() => {
    const c: Record<EquipmentFilter, number> = { All: 0, Available: 0, 'Under maintenance': 0, Broken: 0 }
    for (const i of rows) {
      if (i.isRemoving) continue
      c.All += 1
      c[i.status] += 1
    }
    return c
  }, [rows])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows
      .filter(
        (i) =>
          (filter === 'All' || i.status === filter) && (!q || i.name.toLowerCase().includes(q) || (i.area ?? '').toLowerCase().includes(q)),
      )
      .sort((a, b) => (a.area ?? '~').localeCompare(b.area ?? '~') || a.name.localeCompare(b.name))
  }, [rows, filter, search])

  const paging = usePagedList(visible, `${filter}|${search.trim().toLowerCase()}`)

  const areas = useMemo(() => [...new Set(rows.map((i) => i.area).filter(Boolean) as string[])].sort(), [rows])

  const savedById = (id: string) => items?.find((i) => i.id === id)

  /** Queue field changes for one machine (merged with what is already queued). */
  const queue = (id: string, change: EquipmentInput) => {
    const saved = savedById(id)
    if (!saved) return
    setPending((prev) => {
      const next = { ...prev }
      const merged = diff(saved, { ...prev[id], ...change })
      if (Object.keys(merged).length) next[id] = merged
      else delete next[id]
      return next
    })
  }

  const setPhotoOp = (id: string, op: PhotoOp | null) =>
    setPhotoOps((prev) => {
      const old = prev[id]
      if (old && 'file' in old && old !== op) URL.revokeObjectURL(old.preview)
      const next = { ...prev }
      if (op) next[id] = op
      else delete next[id]
      return next
    })

  const discardQueued = () => {
    for (const op of Object.values(photoOps)) if ('file' in op) URL.revokeObjectURL(op.preview)
    setPending({})
    setRemoving(new Set())
    setPhotoOps({})
  }

  /** One tap in the list: queued, not saved. */
  const setStatus = (item: Equipment, status: EquipmentStatus) => {
    if (!canEdit || !isEditing || isCommitting) return
    queue(item.id, { status })
  }

  /** Remove is queued too, and can be undone until Done. */
  const toggleRemove = (item: Equipment) => {
    if (!canEdit || !isEditing || isCommitting) return
    setRemoving((prev) => {
      const next = new Set(prev)
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      return next
    })
  }

  const startEditing = () => {
    setError(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    discardQueued()
    setError(null)
    setIsEditing(false)
  }

  /** Done: one request for all field changes and removals, then one upload per changed photo. */
  const finishEditing = async () => {
    if (!changeCount) {
      setIsEditing(false)
      return
    }
    setIsCommitting(true)
    setError(null)
    try {
      const updates = Object.entries(pending)
        .filter(([id]) => !removing.has(id))
        .map(([id, change]) => ({ id, ...change }))
      const removeIds = [...removing]
      if (updates.length || removeIds.length) {
        setItems(await saveEquipmentChanges({ updates, removeIds }))
        setPending({})
        setRemoving(new Set())
      }
      for (const [id, op] of Object.entries(photoOps)) {
        if (removing.has(id)) {
          setPhotoOp(id, null)
          continue
        }
        // Same treatment as member photos: a square of about 512 px, under 200 KB, so storage stays small.
        const saved = 'file' in op ? await setEquipmentPhoto(id, await resizeToSquareJpeg(op.file)) : await removeEquipmentPhoto(id)
        setItems((prev) => prev?.map((i) => (i.id === id ? saved : i)) ?? prev)
        setPhotoOp(id, null)
      }
      setIsEditing(false)
    } catch (err) {
      // Whatever was not saved stays queued, so Done can simply be pressed again.
      setError(`Not everything was saved. ${message(err, 'Please try again.')}`)
      void load()
    } finally {
      setIsCommitting(false)
    }
  }

  const openAdd = () => {
    setDraftError(null)
    setDraft({ ...empty })
  }

  /** Edit opens with the queued values, so the dialog shows what Done would save. */
  const openEdit = (row: Equipment) => {
    const saved = savedById(row.id)
    const op = photoOps[row.id]
    setDraftError(null)
    setDraft({
      ...empty,
      id: row.id,
      name: row.name,
      area: row.area ?? '',
      status: row.status,
      note: row.note ?? '',
      photoUrl: saved?.photoUrl,
      photoFile: op && 'file' in op ? op.file : null,
      photoPreview: op && 'file' in op ? URL.createObjectURL(op.file) : null,
      removePhoto: Boolean(op && 'remove' in op),
    })
  }

  const editDraft = (patch: Partial<Draft>) => {
    setDraftError(null)
    setDraft((d) => (d ? { ...d, ...patch } : d))
  }

  /** A photo picked in the dialog: previewed now, shrunk and uploaded later. */
  const pickPhoto = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setDraftError('Choose a photo (JPG, PNG or WebP).')
      return
    }
    editDraft({ photoFile: file, photoPreview: URL.createObjectURL(file), removePhoto: false })
  }
  const clearPhoto = () => editDraft({ photoFile: null, photoPreview: null, removePhoto: Boolean(draft?.photoUrl) })

  /**
   * Editing an existing machine (only possible in Edit equipment status): the changes are queued for Done.
   * Adding a new machine: saved right away, with its photo, because there is nothing to compare it with.
   */
  const saveDraft = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!draft) return
    if (draft.name.trim().length < 2) {
      setDraftError('Enter the equipment name (2 to 80 characters).')
      return
    }
    const input = { name: draft.name.trim(), area: draft.area.trim(), status: draft.status, note: draft.note.trim() }

    if (draft.id) {
      queue(draft.id, input)
      if (draft.photoFile) setPhotoOp(draft.id, { file: draft.photoFile, preview: URL.createObjectURL(draft.photoFile) })
      else if (draft.removePhoto && draft.photoUrl) setPhotoOp(draft.id, { remove: true })
      else setPhotoOp(draft.id, null)
      setDraft(null)
      return
    }

    try {
      setIsSaving(true)
      let saved = await createEquipment(input)
      setItems((prev) => [...(prev ?? []), saved])
      if (draft.photoFile) {
        try {
          saved = await setEquipmentPhoto(saved.id, await resizeToSquareJpeg(draft.photoFile))
          setItems((prev) => prev?.map((i) => (i.id === saved.id ? saved : i)) ?? prev)
        } catch (err) {
          setDraftError(`Added, but the photo was not uploaded. ${message(err, 'Please try again.')} You can add it later with Edit.`)
          setDraft((d) => (d ? { ...d, photoFile: null, photoPreview: null } : d))
          return
        }
      }
      setDraft(null)
    } catch (err) {
      setDraftError(message(err, 'Could not save.'))
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
    toggleRemove,
    isEditing,
    isCommitting,
    changeCount,
    startEditing,
    cancelEditing,
    finishEditing,
    draft,
    draftError,
    isSaving,
    areas,
    openAdd,
    openEdit,
    editDraft,
    pickPhoto,
    clearPhoto,
    saveDraft,
    closeDraft: () => setDraft(null),
  }
}

export type EquipmentVM = ReturnType<typeof useEquipmentViewModel>
