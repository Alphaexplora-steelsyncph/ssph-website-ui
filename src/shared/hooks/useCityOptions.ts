import { useEffect, useMemo, useState } from 'react'
import type { TypeaheadOption } from '../components/TypeaheadField'
import { cityLabels } from '../location/phLocations'

/**
 * Options for a "City" type-ahead (all Philippine cities and municipalities, PSA list). Loaded once, on first use.
 * A saved value that is not in the list (typed before the list existed) is kept as an option so it still shows.
 */
export const useCityOptions = (current = '') => {
  const [labels, setLabels] = useState<string[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    cityLabels()
      .then((l) => {
        if (!cancelled) setLabels(l)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo<TypeaheadOption[]>(() => {
    const list = labels ?? []
    const all = current && !list.includes(current) ? [current, ...list] : list
    return all.map((l) => ({ value: l, label: l }))
  }, [labels, current])

  return { options, loading: !labels && !failed, failed }
}
