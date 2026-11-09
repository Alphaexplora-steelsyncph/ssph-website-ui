import { useEffect, useState } from 'react'
import { presetRange, RANGE_PRESETS, type RangePreset } from '../utils/dateRanges'
import { PAGE_SIZE } from './usePagedList'

const PAGE = PAGE_SIZE

/** Search (debounced), date range with quick presets, and paging, shared by the Payments and Visits lists. */
export const useListFilters = (initial: RangePreset = 'month') => {
  const start = presetRange(initial)
  const [q, setQState] = useState('')
  const [search, setSearch] = useState('') // debounced q sent to the server
  const [from, setFromState] = useState(start.from)
  const [to, setToState] = useState(start.to)
  const [preset, setPreset] = useState<RangePreset | null>(initial)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(q.trim())
      setPage(0)
    }, 300)
    return () => window.clearTimeout(t)
  }, [q])

  const applyPreset = (key: string) => {
    const r = presetRange(key as RangePreset)
    setFromState(r.from)
    setToState(r.to)
    setPreset(key as RangePreset)
    setPage(0)
  }

  return {
    q, setQ: setQState,
    from, setFrom: (v: string) => { setFromState(v); setPreset(null); setPage(0) },
    to, setTo: (v: string) => { setToState(v); setPreset(null); setPage(0) },
    presets: RANGE_PRESETS, preset, applyPreset,
    page, setPage, pageSize: PAGE,
    /** What goes to the API (undefined = no limit). */
    query: { q: search || undefined, from: from || undefined, to: to || undefined },
  }
}

export type ListFiltersVM = ReturnType<typeof useListFilters>
