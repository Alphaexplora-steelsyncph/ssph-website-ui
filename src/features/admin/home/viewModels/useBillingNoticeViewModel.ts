import { useEffect, useState } from 'react'
import { fetchMyBillingNotice } from '../../../../shared/models/apiService'
import type { MyGymBillingNotice } from '../../../../shared/models/types'

/** SteelSync subscription reminder for the gym admin (due soon / overdue). */
export const useBillingNoticeViewModel = () => {
  const [notice, setNotice] = useState<MyGymBillingNotice | null>(null)
  useEffect(() => {
    fetchMyBillingNotice()
      .then(setNotice)
      .catch(() => setNotice(null)) // a reminder is optional; never block the dashboard
  }, [])
  return { notice }
}
