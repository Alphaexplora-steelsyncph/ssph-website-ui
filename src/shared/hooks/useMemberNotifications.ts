import { useCallback, useEffect, useState } from 'react'
import { clearMyNotifications, fetchMyNotifications, markMyNotificationsRead } from '../models/apiService'
import type { MemberNotification } from '../models/types'

const REFRESH_MS = 60_000

/** Member notification bell (Coach App): list, unread count, mark read when opened, clear all. Quietly ignores errors. */
export const useMemberNotifications = (enabled: boolean) => {
  const [items, setItems] = useState<MemberNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  const load = useCallback(() => {
    fetchMyNotifications()
      .then((res) => {
        setItems(res.notifications)
        setUnread(res.unread)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!enabled) return
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [enabled, load])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      setUnread(0)
      markMyNotificationsRead().catch(() => undefined)
    }
    // Shown as unread while the panel is open; read after it closes.
    if (!next) setItems((list) => list.map((n) => ({ ...n, read: true })))
  }

  const clear = async () => {
    setItems([])
    setUnread(0)
    await clearMyNotifications().catch(() => undefined)
  }

  return { items, unread, open, toggle, close: () => open && toggle(), clear }
}
