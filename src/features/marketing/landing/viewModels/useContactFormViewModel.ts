import { useEffect, useMemo, useState } from 'react'
import { ApiError, sendInquiry } from '../../../../shared/models/apiService'
import type { InquiryResult } from '../../../../shared/models/types'
import type { TypeaheadOption } from '../../../../shared/components/TypeaheadField'
import { COUNTRY, emptyAddress, formatAddress, mapsSearchUrl, type PhAddress } from '../../../../shared/location/phAddress'
import { loadBarangays, loadPlaces, type PhPlaces } from '../../../../shared/location/phLocations'

/**
 * "Contact us" form on the landing page, in three steps:
 *   1. the person (first / last name, email, phone)
 *   2. the gym (name, address picked top to bottom: Philippines → region → province → city → barangay → street, landmark)
 *   3. review and send (emailed to the team and a copy to the person; nothing is stored)
 * Address data is only downloaded when step 2 opens. Each step is checked before moving on.
 */
export const CONTACT_STEPS = ['You', 'Your gym', 'Review'] as const
export type ContactStep = 0 | 1 | 2

export interface ContactPerson {
  firstName: string
  lastName: string
  email: string
  phone: string
}

type Field = keyof ContactPerson | 'gymName' | 'region' | 'province' | 'city' | 'barangay' | 'street' | 'landmark'
type Errors = Partial<Record<Field, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** Same rule as the backend: 0917 123 4567, +63 917 123 4567, (02) 8123 4567. */
const PH_PHONE = /^(\+?63|0)\d{9,10}$/
const digitsOf = (phone: string) => phone.replace(/[\s().-]/g, '')

const emptyPerson = (): ContactPerson => ({ firstName: '', lastName: '', email: '', phone: '' })

const checkPerson = (p: ContactPerson): Errors => {
  const e: Errors = {}
  if (!p.firstName.trim()) e.firstName = 'Enter your first name.'
  if (!p.lastName.trim()) e.lastName = 'Enter your last name.'
  if (!EMAIL.test(p.email.trim())) e.email = 'Enter a valid email, like juan@gmail.com.'
  if (!PH_PHONE.test(digitsOf(p.phone))) e.phone = 'Enter a Philippine number, like 0917 123 4567.'
  return e
}

export const useContactFormViewModel = () => {
  const [step, setStep] = useState<ContactStep>(0)
  const [person, setPerson] = useState<ContactPerson>(emptyPerson)
  const [gymName, setGymName] = useState('')
  const [address, setAddress] = useState<PhAddress>(emptyAddress)
  const [landmark, setLandmark] = useState('')
  const [website, setWebsite] = useState('') // honeypot: hidden from people
  const [errors, setErrors] = useState<Errors>({})

  const [places, setPlaces] = useState<PhPlaces | null>(null)
  const [placesError, setPlacesError] = useState(false)
  const [placesTry, setPlacesTry] = useState(0)
  const [barangays, setBarangays] = useState<{ cityCode: string; list: string[] } | null>(null)
  const [barangayError, setBarangayError] = useState<string | null>(null) // cityCode that failed

  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [result, setResult] = useState<InquiryResult | null>(null)

  // Address data: fetched once step 2 opens (regions, provinces and cities in one small file).
  const needsPlaces = step >= 1
  useEffect(() => {
    if (!needsPlaces || places) return
    let cancelled = false
    loadPlaces()
      .then((p) => {
        if (!cancelled) setPlaces(p)
      })
      .catch(() => {
        if (!cancelled) setPlacesError(true)
      })
    return () => {
      cancelled = true
    }
  }, [needsPlaces, places, placesTry])

  // Barangays of the chosen city (one file per region, cached).
  const { regionCode, cityCode } = address
  useEffect(() => {
    if (!cityCode) return
    let cancelled = false
    loadBarangays(regionCode, cityCode)
      .then((list) => {
        if (!cancelled) setBarangays({ cityCode, list })
      })
      .catch(() => {
        if (!cancelled) setBarangayError(cityCode)
      })
    return () => {
      cancelled = true
    }
  }, [regionCode, cityCode])

  const barangayList = useMemo(() => (barangays?.cityCode === cityCode ? barangays.list : []), [barangays, cityCode])
  const barangayFailed = !!cityCode && barangayError === cityCode
  const barangaysLoading = !!cityCode && barangays?.cityCode !== cityCode && !barangayFailed

  const options = useMemo(() => {
    const toOpt = (code: string, name: string, hint?: string): TypeaheadOption => ({ value: code, label: name, hint })
    return {
      regions: places?.regions.map((r) => toOpt(r.code, r.name)) ?? [],
      provinces: places && regionCode ? places.provincesOf(regionCode).map((p) => toOpt(p.code, p.name, p.isCity ? 'City' : undefined)) : [],
      cities: places && address.provinceCode ? places.citiesOf(address.provinceCode).map((c) => toOpt(c.code, c.name)) : [],
      barangays: barangayList.map((b) => toOpt(b, b)),
    }
  }, [places, regionCode, address.provinceCode, barangayList])

  const clearError = (...fields: Field[]) =>
    setErrors((e) => {
      if (!fields.some((f) => e[f])) return e
      const next = { ...e }
      fields.forEach((f) => delete next[f])
      return next
    })

  const setPersonField = (field: keyof ContactPerson, value: string) => {
    setPerson((p) => ({ ...p, [field]: value }))
    clearError(field)
  }

  /* ----- address, top to bottom: choosing a level clears everything below it ----- */

  const selectRegion = (o: TypeaheadOption | null) => {
    setAddress((a) => ({ ...emptyAddress(), street: a.street, regionCode: o?.value ?? '', region: o?.label ?? '' }))
    clearError('region', 'province', 'city', 'barangay')
  }

  const selectProvince = (o: TypeaheadOption | null) => {
    const province = o && places?.provincesOf(regionCode).find((p) => p.code === o.value)
    // A city listed on its own with a single entry (Quezon City, City of Cebu ...) fills the city too.
    const only = province ? places!.citiesOf(province.code) : []
    const city = only.length === 1 ? only[0] : null
    setAddress((a) => ({
      ...a,
      provinceCode: province?.code ?? '',
      province: province?.name ?? '',
      provinceIsCity: province?.isCity ?? false,
      cityCode: city?.code ?? '',
      city: city?.name ?? '',
      barangay: '',
    }))
    clearError('province', 'city', 'barangay')
  }

  const selectCity = (o: TypeaheadOption | null) => {
    setAddress((a) => ({ ...a, cityCode: o?.value ?? '', city: o?.label ?? '', barangay: '' }))
    clearError('city', 'barangay')
  }

  const selectBarangay = (o: TypeaheadOption | null) => {
    setAddress((a) => ({ ...a, barangay: o?.label ?? '' }))
    clearError('barangay')
  }

  const setStreet = (v: string) => {
    setAddress((a) => ({ ...a, street: v }))
    clearError('street')
  }

  const checkGym = (): Errors => {
    const e: Errors = {}
    if (!gymName.trim()) e.gymName = 'Enter the name of your gym.'
    if (!address.regionCode) e.region = 'Choose a region.'
    else if (!address.provinceCode) e.province = 'Choose a province or city.'
    else if (!address.cityCode) e.city = 'Choose a city or municipality.'
    else if (barangayList.length && !address.barangay) e.barangay = 'Choose a barangay.'
    if (address.street.length > 200) e.street = 'Keep it under 200 characters.'
    if (landmark.length > 200) e.landmark = 'Keep it under 200 characters.'
    return e
  }

  const goTo = (s: ContactStep) => {
    setSendError(null)
    setStep(s)
    document.getElementById('contact-form')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const next = () => {
    const e = step === 0 ? checkPerson(person) : checkGym()
    setErrors(e)
    if (Object.keys(e).length) return
    goTo((step + 1) as ContactStep)
  }

  const back = () => step > 0 && goTo((step - 1) as ContactStep)

  const fullAddress = formatAddress(address)

  const send = async () => {
    const personErrors = checkPerson(person)
    const e = { ...personErrors, ...checkGym() }
    if (Object.keys(e).length) {
      setErrors(e)
      goTo(Object.keys(personErrors).length ? 0 : 1)
      return
    }
    try {
      setIsSending(true)
      setSendError(null)
      const res = await sendInquiry({
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        email: person.email.trim(),
        phone: digitsOf(person.phone),
        gymName: gymName.trim(),
        location: {
          regionCode: address.regionCode,
          region: address.region,
          province: address.province,
          provinceIsCity: address.provinceIsCity,
          city: address.city,
          barangay: address.barangay,
          street: address.street.trim(),
        },
        landmark: landmark.trim(),
        website,
      })
      setResult(res)
      document.getElementById('contact-form')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'Could not send your inquiry. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const reset = () => {
    setPerson(emptyPerson())
    setGymName('')
    setAddress(emptyAddress())
    setLandmark('')
    setErrors({})
    setResult(null)
    setStep(0)
  }

  return {
    steps: CONTACT_STEPS,
    step,
    person,
    setPersonField,
    gymName,
    setGymName: (v: string) => {
      setGymName(v)
      clearError('gymName')
    },
    country: COUNTRY,
    address,
    options,
    places: {
      loading: needsPlaces && !places && !placesError,
      failed: placesError,
      retry: () => {
        setPlacesError(false)
        setPlacesTry((n) => n + 1)
      },
    },
    barangaysLoading,
    barangayFailed,
    /** The city has no barangays in the data (rare): the field is hidden. */
    hasBarangays: !!cityCode && (barangaysLoading || barangayList.length > 0),
    /** Manila is split into districts (Tondo, Sampaloc ...) instead of cities. */
    cityLabel: address.provinceIsCity && options.cities.length > 1 ? 'District' : 'City / municipality',
    selectRegion,
    selectProvince,
    selectCity,
    selectBarangay,
    setStreet,
    landmark,
    setLandmark: (v: string) => {
      setLandmark(v)
      clearError('landmark')
    },
    website,
    setWebsite,
    errors,
    fullAddress,
    mapsUrl: mapsSearchUrl(`${gymName.trim() ? `${gymName.trim()}, ` : ''}${fullAddress}`),
    next,
    back,
    goTo,
    send,
    isSending,
    sendError,
    result,
    reset,
  }
}

export type ContactFormVM = ReturnType<typeof useContactFormViewModel>
