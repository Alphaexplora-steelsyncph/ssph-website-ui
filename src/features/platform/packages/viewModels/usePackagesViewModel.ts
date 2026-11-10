import { useEffect, useMemo, useState } from 'react'
import { ApiError, fetchPackages, savePackageChanges } from '../../../../shared/models/apiService'
import { FEATURE_CATALOG, type FeatureKey } from '../../../../shared/features/featureCatalog'
import type { PackageChanges, PackageInput, PackageOption } from '../../../../shared/models/types'

export interface PackageDraft {
  name: string
  price: string
  memberLimit: string // empty = unlimited
  features: FeatureKey[]
}

/** A package in the edit session: saved ones keep their id; new ones get a temporary key until Save. */
export interface DraftPackage extends PackageInput {
  key: string
  id?: string
  gymCount: number
}

const EMPTY: PackageDraft = { name: '', price: '', memberLimit: '', features: [] }
const fields = (p: PackageInput): PackageInput => ({ name: p.name, price: p.price, memberLimit: p.memberLimit, features: [...p.features].sort() })
const same = (a: PackageInput, b: PackageInput) => JSON.stringify(fields(a)) === JSON.stringify(fields(b))
const toDraft = (p: PackageOption): DraftPackage => ({ ...fields(p), key: p.id, id: p.id, gymCount: p.gymCount })

/** Add-ons a package can include ("core" is always included). */
export const ADD_ON_FEATURES = FEATURE_CATALOG.filter((f) => !f.alwaysOn)

/**
 * Packages page. Read-only until Edit; while editing, adds, changes and deletes stay on the page.
 * Save sends them all in one request; Cancel discards them without any request.
 */
export const usePackagesViewModel = () => {
  const [saved, setSaved] = useState<PackageOption[]>([])
  const [packages, setPackages] = useState<DraftPackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [editing, setEditing] = useState<null | 'new' | string>(null) // key of the package form that is open
  const [draft, setDraft] = useState<PackageDraft>(EMPTY)
  const [isSaving, setIsSaving] = useState(false)

  const startFrom = (list: PackageOption[]) => {
    setSaved(list)
    setPackages(list.map(toDraft))
    setEditing(null)
  }

  useEffect(() => {
    fetchPackages()
      .then(startFrom)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load packages.'))
      .finally(() => setIsLoading(false))
  }, [])

  const changes = useMemo((): PackageChanges => {
    const byId = new Map(saved.map((p) => [p.id, p]))
    const kept = new Set(packages.filter((p) => p.id).map((p) => p.id))
    return {
      create: packages.filter((p) => !p.id).map(fields),
      update: packages.filter((p) => p.id && !same(p, byId.get(p.id)!)).map((p) => ({ id: p.id!, ...fields(p) })),
      delete: saved.filter((p) => !kept.has(p.id)).map((p) => p.id),
    }
  }, [saved, packages])
  const isDirty = changes.create.length + changes.update.length + changes.delete.length > 0

  const startEditing = () => {
    startFrom(saved)
    setError(null)
    setNotice(null)
    setMode('edit')
  }
  const cancelEditing = () => {
    startFrom(saved)
    setError(null)
    setMode('view')
  }
  const saveAll = async () => {
    if (editing) return setError('Keep or cancel the package you are editing first.')
    if (!isDirty) return setMode('view')
    try {
      setIsSaving(true)
      setError(null)
      startFrom(await savePackageChanges(changes))
      setMode('view')
      setNotice('Packages saved.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the packages.')
    } finally {
      setIsSaving(false)
    }
  }

  const startAdd = () => { setEditing('new'); setDraft(EMPTY); setError(null) }
  const startEdit = (p: DraftPackage) => {
    setEditing(p.key)
    setDraft({ name: p.name, price: String(p.price), memberLimit: p.memberLimit === null ? '' : String(p.memberLimit), features: p.features })
    setError(null)
  }
  const cancel = () => { setEditing(null); setError(null) }
  const update = <K extends keyof PackageDraft>(key: K, value: PackageDraft[K]) => { setDraft((d) => ({ ...d, [key]: value })); setError(null) }
  const toggleFeature = (key: FeatureKey) =>
    update('features', draft.features.includes(key) ? draft.features.filter((f) => f !== key) : [...draft.features, key])

  /** Keeps the package in the edit session (sent on Save). */
  const save = () => {
    const name = draft.name.trim().replace(/\s+/g, ' ')
    const price = Number(draft.price)
    const limit = draft.memberLimit.trim() === '' ? null : Number(draft.memberLimit)
    if (name.length < 2 || name.length > 30) return setError('Package name must be 2 to 30 characters.')
    if (packages.some((p) => p.key !== editing && p.name.toLowerCase() === name.toLowerCase())) return setError('You already have a package with this name.')
    if (draft.price === '' || !Number.isFinite(price) || price < 0) return setError('Enter a monthly price.')
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) return setError('Member limit must be a whole number, or leave it empty for unlimited.')
    const input: PackageInput = { name, price, memberLimit: limit, features: draft.features }
    if (editing === 'new') setPackages((prev) => [...prev, { ...input, key: `new-${Date.now()}`, gymCount: 0 }])
    else if (editing) setPackages((prev) => prev.map((p) => (p.key === editing ? { ...p, ...input } : p)))
    setEditing(null)
  }

  const remove = (key: string) => {
    const pkg = packages.find((p) => p.key === key)
    if (pkg && pkg.gymCount > 0) return setError(`Move the gyms on ${pkg.name} to another package first.`)
    setPackages((prev) => prev.filter((p) => p.key !== key))
    if (editing === key) setEditing(null)
  }

  const stateOf = (p: DraftPackage): 'new' | 'changed' | null => {
    if (!p.id) return 'new'
    const before = saved.find((s) => s.id === p.id)
    return before && !same(p, before) ? 'changed' : null
  }

  return {
    packages, isLoading, error, notice, inEditMode: mode === 'edit', startEditing, cancelEditing, saveAll, isDirty, isSaving,
    removedCount: changes.delete.length, stateOf,
    editing, draft, startAdd, startEdit, cancel, update, toggleFeature, save, remove,
  }
}

export type PackagesVM = ReturnType<typeof usePackagesViewModel>
