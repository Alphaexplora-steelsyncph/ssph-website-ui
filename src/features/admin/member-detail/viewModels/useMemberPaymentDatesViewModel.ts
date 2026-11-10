import { useEffect, useState } from 'react'
import { ApiError, fetchMemberPaymentDates } from '../../../../shared/models/apiService'
import type { MemberRecord, PaymentDate } from '../../../../shared/models/types'

/** The dates a member paid on, for the front desk. Reloads when the member's payments change (installments paid, expiry). */
export const useMemberPaymentDatesViewModel = (member: MemberRecord) => {
  const [dates, setDates] = useState<PaymentDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchMemberPaymentDates(member.id)
      .then((rows) => !cancelled && setDates(rows))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load the payments.'))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [member.id, member.expiresAt, member.installmentsPaid])

  const summary =
    member.installmentsTotal != null ? `${member.installmentsPaid ?? 0} of ${member.installmentsTotal} monthly payments made` : undefined
  return { dates, isLoading, error, summary }
}
