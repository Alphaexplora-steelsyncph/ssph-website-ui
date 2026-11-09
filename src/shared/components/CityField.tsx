import { useCityOptions } from '../hooks/useCityOptions'
import { TypeaheadField } from './TypeaheadField'

interface Props {
  value: string
  onChange: (city: string) => void
  error?: string
  label?: string
  className?: string
}

/** Member's city or municipality, picked from the PSA list. City level only: no street or barangay is asked for. */
export const CityField = ({ value, onChange, error, label = 'City / municipality (optional)', className }: Props) => {
  const { options, loading, failed } = useCityOptions(value)
  return (
    <TypeaheadField
      label={label}
      placeholder="Type to search, e.g. Calamba"
      options={options}
      value={value}
      onSelect={(o) => onChange(o?.value ?? '')}
      loading={loading}
      error={error ?? (failed ? 'Could not load the list of cities. Reload the page to try again.' : undefined)}
      help="Only the city, for the gym's records. No home address."
      className={className}
    />
  )
}
