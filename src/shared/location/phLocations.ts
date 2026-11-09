/**
 * Philippine places for address type-aheads (PSA PSGC data, built by `npm run psgc:build` into public/psgc/).
 * Files are fetched from our own site only when a form needs them, and cached for the session.
 * The release is part of the path, so the browser and CDN can keep the files forever.
 */
export const PSGC_RELEASE = '20252q'
const BASE = `/psgc/${PSGC_RELEASE}`

export interface Place {
  code: string
  name: string
}
export type Region = Place
export interface Province extends Place {
  regionCode: string
  /** A highly urbanized / independent city that PSA lists on its own (e.g. Quezon City, City of Cebu). */
  isCity: boolean
}
export interface City extends Place {
  provinceCode: string
  barangayCount: number
}

interface PlacesFile {
  release: string
  regions: [string, string][]
  provinces: [string, string, string, 0 | 1][]
  cities: [string, string, string, number][]
}

export interface PhPlaces {
  regions: Region[]
  provincesOf: (regionCode: string) => Province[]
  citiesOf: (provinceCode: string) => City[]
}

const getJson = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${BASE}/${path}`)
  if (!res.ok) throw new Error(`Could not load ${path}`)
  return (await res.json()) as T
}

let placesPromise: Promise<PhPlaces> | null = null

/** Regions, provinces and cities/municipalities (about 19 KB gzipped). */
export const loadPlaces = (): Promise<PhPlaces> => {
  placesPromise ??= getJson<PlacesFile>('places.json')
    .then((f) => {
      const regions = f.regions.map(([code, name]) => ({ code, name }))
      const provinces = f.provinces.map(([code, regionCode, name, isCity]) => ({ code, regionCode, name, isCity: isCity === 1 }))
      const cities = f.cities.map(([code, provinceCode, name, barangayCount]) => ({ code, provinceCode, name, barangayCount }))
      return {
        regions,
        provincesOf: (regionCode: string) => provinces.filter((p) => p.regionCode === regionCode),
        citiesOf: (provinceCode: string) => {
          const list = cities.filter((c) => c.provinceCode === provinceCode)
          // The City of Manila itself has no barangays: they belong to its districts (Tondo, Sampaloc, ...).
          const withBarangays = list.filter((c) => c.barangayCount > 0)
          return withBarangays.length ? withBarangays : list
        },
      }
    })
    .catch((err) => {
      placesPromise = null // let the next attempt retry
      throw err
    })
  return placesPromise
}

const barangayFiles = new Map<string, Promise<Record<string, string[]>>>()

/** Barangays of one city/municipality. Downloads the barangays of its whole region once (12–17 KB gzipped). */
export const loadBarangays = async (regionCode: string, cityCode: string): Promise<string[]> => {
  let file = barangayFiles.get(regionCode)
  if (!file) {
    file = getJson<Record<string, string[]>>(`brgy-${regionCode}.json`)
    file.catch(() => barangayFiles.delete(regionCode))
    barangayFiles.set(regionCode, file)
  }
  return (await file)[cityCode] ?? []
}

const cityName = (name: string) => name.replace(/^City of (.+)$/i, '$1 City') // PSA "City of Calamba" -> "Calamba City"

/**
 * Every city / municipality as one label, for a "City" field (city level only, no barangay or street):
 * "Calamba City, Laguna", "Quezon City", "Manila City" (its districts are not listed separately).
 */
export const cityLabels = async (): Promise<string[]> => {
  const places = await loadPlaces()
  const labels = new Set<string>()
  for (const region of places.regions) {
    for (const province of places.provincesOf(region.code)) {
      if (province.isCity) labels.add(cityName(province.name))
      else for (const city of places.citiesOf(province.code)) labels.add(`${cityName(city.name)}, ${province.name}`)
    }
  }
  return [...labels].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}
