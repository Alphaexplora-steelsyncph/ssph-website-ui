import { useMemo, useState } from 'react'

/** Every table in the app shows at most this many rows per page. */
export const PAGE_SIZE = 10

/**
 * Pages a list that is already in memory (e.g. after search / filter chips). Only PAGE_SIZE rows are rendered.
 * `resetKey` is anything that describes the current filters: when it changes, paging goes back to page 1.
 */
export const usePagedList = <T>(items: T[], resetKey = '') => {
  const [state, setState] = useState({ key: resetKey, page: 0 })
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  // New filters -> first page; a shorter list (e.g. after removing a row) -> stay on the last page that exists.
  const page = state.key === resetKey ? Math.min(state.page, pageCount - 1) : 0
  const pageItems = useMemo(() => items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [items, page])
  return {
    pageItems,
    page,
    pageCount,
    total: items.length,
    pageSize: PAGE_SIZE,
    setPage: (p: number) => setState({ key: resetKey, page: p }),
  }
}

export type PagedList<T> = ReturnType<typeof usePagedList<T>>
