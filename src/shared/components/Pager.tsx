interface Props {
  page: number // 0-based
  pageCount: number
  total: number
  pageSize: number
  onPage: (page: number) => void
  noun: string // "payments", "visits"
}

/** "1–10 of 312 payments · Page 1 of 32" with previous / next. Hidden when everything fits on one page. */
export const Pager = ({ page, pageCount, total, pageSize, onPage, noun }: Props) => {
  if (total <= pageSize) return null
  const first = page * pageSize + 1
  const last = Math.min(total, first + pageSize - 1)
  const btn = 'rounded-lg border border-coal-500 px-3 py-1.5 font-semibold text-steel hover:text-zinc-100 disabled:opacity-40'
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-steel">
      <span>
        {first.toLocaleString('en-PH')}–{last.toLocaleString('en-PH')} of {total.toLocaleString('en-PH')} {noun}
        <span className="hidden sm:inline"> · Page {page + 1} of {pageCount}</span>
      </span>
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={page === 0} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <button type="button" className={btn} disabled={page + 1 >= pageCount} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
