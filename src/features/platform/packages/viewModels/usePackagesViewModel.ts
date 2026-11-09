import { useEffect, useState } from 'react'
import { ApiError, createPackage, deletePackage, fetchPackages, updatePackage } from '../../../../shared/models/apiService'
import { FEATURE_CATALOG, type FeatureKey } from '../../../../shared/features/featureCatalog'
import type { PackageInput, PackageOption } from '../../../../shared/models/types'

export interface PackageDraft {
  name: string
  price: string
  memberLimit: string // empty = unlimited
  features: FeatureKey[]
}

const EMPTY: PackageDraft = { name: '', price: '', memberLimit: '', features: [] }

/** Add-ons a package can include ("core" is always included). */
export const ADD_ON_FEATURES = FEATURE_CATALOG.filter((f) => !f.alwaysOn)

export const usePackagesViewModel = () => {
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<null | 'new' | string>(null)
  const [draft, setDraft] = useState<PackageDraft>(EMPTY)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPackages()
      .then(setPackages)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load packages.'))
      .finally(() => setIsLoading(false))
  }, [])

  const startAdd = () => { setEditing('new'); setDraft(EMPTY); setError(null) }
  const startEdit = (p: PackageOption) => {
    setEditing(p.id)
    setDraft({ name: p.name, price: String(p.price), memberLimit: p.memberLimit === null ? '' : String(p.memberLimit), features: p.features })
    setError(null)
  }
  const cancel = () => { setEditing(null); setError(null) }
  const update = <K extends keyof PackageDraft>(key: K, value: PackageDraft[K]) => { setDraft((d) => ({ ...d, [key]: value })); setError(null) }
  const toggleFeature = (key: FeatureKey) =>
    update('features', draft.features.includes(key) ? draft.features.filter((f) => f !== key) : [...draft.features, key])

  const save = async () => {
    const price = Number(draft.price)
    const limit = draft.memberLimit.trim() === '' ? null : Number(draft.memberLimit)
    if (draft.name.trim().length < 2) return setError('Give the package a name.')
    if (draft.price === '' || !Number.isFinite(price) || price < 0) return setError('Enter a monthly price.')
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) return setError('Member limit must be a whole number, or leave it empty for unlimited.')
    const input: PackageInput = { name: draft.name, price, memberLimit: limit, features: draft.features }
    try {
      setIsSaving(true)
      if (editing === 'new') {
        const created = await createPackage(input)
        setPackages((prev) => [...prev, created])
      } else if (editing) {
        const updated = await updatePackage(editing, input)
        setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      }
      setEditing(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the package.')
    } finally {
      setIsSaving(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setError(null)
      await deletePackage(id)
      setPackages((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the package.')
    }
  }

  return { packages, isLoading, error, editing, draft, isSaving, startAdd, startEdit, cancel, update, toggleFeature, save, remove }
}

export type PackagesVM = ReturnType<typeof usePackagesViewModel>
