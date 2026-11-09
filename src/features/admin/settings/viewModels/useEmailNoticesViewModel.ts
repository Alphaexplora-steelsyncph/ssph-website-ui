import { useEffect, useState } from 'react'
import { usePagedList } from '../../../../shared/hooks/usePagedList'
import { ApiError, fetchEmailNotices } from '../../../../shared/models/apiService'
import type { EmailNotice } from '../../../../shared/models/types'

const EMPTY: EmailNotice[] = []

/** Notice emails prepared for members. Logged only until an email provider is set up. */
export const useEmailNoticesViewModel = () => {
  const [notices, setNotices] = useState<EmailNotice[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    fetchEmailNotices()
      .then(setNotices)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load email notices.'))
  }, [])

  const paging = usePagedList(notices ?? EMPTY) // 10 per page

  return {
    notices: notices ? paging.pageItems : null,
    paging,
    error,
    openId,
    toggle: (id: string) => setOpenId((cur) => (cur === id ? null : id)),
  }
}
