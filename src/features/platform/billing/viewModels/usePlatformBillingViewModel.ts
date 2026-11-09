import { useCallback, useEffect, useState } from 'react'
import { usePagedList } from '../../../../shared/hooks/usePagedList'
import { ApiError, fetchBillingOverview } from '../../../../shared/models/apiService'
import type { BillingOverview } from '../../../../shared/models/types'
import { addMonthsToPeriod, currentPeriod, periodLabel } from '../../../../shared/utils/dates'

const MONTHS_BACK = 6

export type BillingRow = BillingOverview['rows'][number]
const EMPTY: BillingRow[] = []

export const usePlatformBillingViewModel = () => {
  const periods = Array.from({ length: MONTHS_BACK }, (_, i) => addMonthsToPeriod(currentPeriod(), -i)).map((p) => ({
    value: p,
    label: periodLabel(p),
  }))
  const [period, setPeriod] = useState(periods[0].value)
  const [overview, setOverview] = useState<BillingOverview | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    (p: string) =>
      fetchBillingOverview(p)
        .then(setOverview)
        .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load billing.')),
    [],
  )

  useEffect(() => {
    void load(period)
  }, [period, load])

  const paging = usePagedList(overview?.rows ?? EMPTY, period)

  return {
    periods, period, setPeriod, overview, error,
    /** The gyms of this page (10 per page); totals in `overview` still cover every gym. */
    rows: paging.pageItems,
    paging,
  }
}
