import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, createGym, fetchPackages } from '../../../../shared/models/apiService'
import type { CreateGymPayload, CreateGymResult, PackageOption } from '../../../../shared/models/types'
import { todayISO } from '../../../../shared/utils/dates'
import { isEmail } from '../../../../shared/utils/validators'

const toSlug = (name: string) =>
  name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 40)

const EMPTY: CreateGymPayload = {
  name: '',
  slug: '',
  address: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  packageId: '',
  billingDay: Math.min(Number(todayISO().slice(8, 10)), 28),
  adminEmail: '',
}

type Errors = Partial<Record<keyof CreateGymPayload, string>>

export const useAddGymViewModel = () => {
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [form, setForm] = useState<CreateGymPayload>(EMPTY)
  const [slugEdited, setSlugEdited] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Errors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<CreateGymResult | null>(null)

  useEffect(() => {
    fetchPackages()
      .then((pkgs) => {
        setPackages(pkgs)
        setForm((f) => ({ ...f, packageId: f.packageId || pkgs[0]?.id || '' }))
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load packages.'))
  }, [])

  const set = <K extends keyof CreateGymPayload>(key: K, value: CreateGymPayload[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (key === 'name' && !slugEdited) next.slug = toSlug(String(value))
      return next
    })
    if (key === 'slug') setSlugEdited(true)
    setFieldErrors((e) => ({ ...e, [key]: undefined }))
    setError(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errors: Errors = {}
    if (form.name.trim().length < 2) errors.name = 'Enter the gym name.'
    if (toSlug(form.slug).length < 3) errors.slug = 'At least 3 letters or numbers.'
    if (!isEmail(form.adminEmail)) errors.adminEmail = 'Enter the email of the gym owner or manager.'
    if (form.contactEmail && !isEmail(form.contactEmail)) errors.contactEmail = 'Enter a valid email.'
    if (!form.packageId) errors.packageId = 'Choose a package.'
    if (!Number.isInteger(form.billingDay) || form.billingDay < 1 || form.billingDay > 28) errors.billingDay = 'From 1 to 28.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    try {
      setIsSubmitting(true)
      setResult(await createGym({ ...form, slug: toSlug(form.slug) }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the gym.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setForm({ ...EMPTY, packageId: packages[0]?.id ?? '' })
    setSlugEdited(false)
    setFieldErrors({})
    setError(null)
    setResult(null)
  }

  return { packages, form, set, fieldErrors, error, isSubmitting, submit, result, reset }
}
