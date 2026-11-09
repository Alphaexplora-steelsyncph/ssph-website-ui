/**
 * A Philippine address picked top to bottom (country → region → province → city → barangay → street),
 * written the way it is searched on a map: "street, barangay, city, province, Philippines".
 */
export const COUNTRY = 'Philippines'

export interface PhAddress {
  regionCode: string
  region: string
  provinceCode: string
  province: string
  /** The province is a city PSA lists on its own (Quezon City, City of Cebu ...): not repeated in the address. */
  provinceIsCity: boolean
  cityCode: string
  city: string
  barangay: string
  street: string
}

export const emptyAddress = (): PhAddress => ({
  regionCode: '',
  region: '',
  provinceCode: '',
  province: '',
  provinceIsCity: false,
  cityCode: '',
  city: '',
  barangay: '',
  street: '',
})

const NCR = '13'

/** "Barangay 12" stays as is; "San Isidro" becomes "Brgy. San Isidro". */
export const barangayLabel = (name: string) => (!name ? '' : /^(barangay|brgy\.?)\s/i.test(name) ? name : `Brgy. ${name}`)

export const formatAddress = (a: PhAddress): string => {
  const parts = [a.street.trim(), barangayLabel(a.barangay), a.city]
  // A district of Manila ("Sampaloc") needs its city; a plain HUC ("Quezon City") is already the city.
  if (a.province && (!a.provinceIsCity || a.province !== a.city)) parts.push(a.province)
  if (a.regionCode === NCR) parts.push('Metro Manila')
  parts.push(COUNTRY)
  return parts.filter(Boolean).join(', ')
}

export const mapsSearchUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
