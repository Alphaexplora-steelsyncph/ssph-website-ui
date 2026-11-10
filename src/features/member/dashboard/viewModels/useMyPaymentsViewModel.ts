import { useEffect, useState } from 'react'
import { ApiError, fetchMyMembership, fetchMyPaymentDates } from '../../../../shared/models/apiService'
import type { MemberRecord, PaymentDate } from '../../../../shared/models/types'

/** When the signed-in member paid (dates only), plus how many monthly payments are done on a monthly plan. */
export const useMyPaymentsViewModel = () => {
  const [dates, setDates] = useState<PaymentDate[]>([])
  const [member, setMember] = useState<MemberRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchMyPaymentDates(), fetchMyMembership()])
      .then(([rows, membership]) => {
        if (cancelled) return
        setDates(rows)
        setMember(membership.member)
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load your payments.'))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const summary =
    member?.installmentsTotal != null ? `${member.installmentsPaid ?? 0} of ${member.installmentsTotal} monthly payments made` : undefined
  return { dates, isLoading, error, summary }
}
