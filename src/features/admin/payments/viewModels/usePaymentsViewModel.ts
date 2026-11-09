import { useEffect, useState } from 'react'
import { useListFilters } from '../../../../shared/hooks/useListFilters'
import { ApiError, fetchPayments } from '../../../../shared/models/apiService'
import type { PaymentMethod, PaymentsPage } from '../../../../shared/models/types'
import { downloadCsv } from '../../../../shared/utils/csv'
import { todayISO } from '../../../../shared/utils/dates'

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'GCash', 'Maya', 'Bank Transfer']
const EXPORT_LIMIT = 5000

/** Every member payment of the gym with filters, totals and CSV export. */
export const usePaymentsViewModel = () => {
  const filters = useListFilters('month')
  const [method, setMethodState] = useState<PaymentMethod | ''>('')
  const [result, setResult] = useState<PaymentsPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const query = { ...filters.query, method: method || undefined }
  const key = JSON.stringify([query, filters.page])

  useEffect(() => {
    let cancelled = false
    const [q, page] = JSON.parse(key) as [typeof query, number]
    fetchPayments(q, filters.pageSize, page * filters.pageSize)
      .then((r) => {
        if (cancelled) return
        setResult(r)
        setError(null)
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load payments.'))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [key, filters.pageSize])

  const exportCsv = async () => {
    try {
      setIsExporting(true)
      const all = await fetchPayments(query, EXPORT_LIMIT, 0)
      downloadCsv(
        `payments-${filters.from || 'all'}-to-${filters.to || todayISO()}.csv`,
        ['Date', 'Time', 'Member', 'Email', 'Amount', 'Method', 'Reference no.', 'Recorded by'],
        all.payments.map((p) => {
          const d = new Date(p.recordedAt)
          return [
            d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }),
            d.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' }),
            p.member.fullName,
            p.member.email,
            p.amount.toFixed(2),
            p.method,
            p.referenceNo ?? '',
            p.recordedBy,
          ]
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not export.')
    } finally {
      setIsExporting(false)
    }
  }

  const total = result?.total ?? 0
  return {
    filters,
    methods: PAYMENT_METHODS,
    method,
    setMethod: (m: PaymentMethod | '') => {
      setMethodState(m)
      filters.setPage(0)
    },
    payments: result?.payments ?? [],
    summary: result?.summary ?? null,
    total,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
    isLoading,
    error,
    isExporting,
    exportCsv,
  }
}

export type PaymentsVM = ReturnType<typeof usePaymentsViewModel>
