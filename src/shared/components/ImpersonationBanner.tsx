import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { useEndImpersonation } from '../hooks/useEndImpersonation'
import { formatTime } from '../utils/format'

/** Shown across the admin shell while a super admin is viewing a gym (read only). */
export const ImpersonationBanner = () => {
  const { user, isImpersonating } = useAuth()
  const { exit, isEnding } = useEndImpersonation()
  const [now, setNow] = useState(() => Date.now()) // UI-local clock for the countdown

  useEffect(() => {
    if (!isImpersonating) return
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [isImpersonating])

  const expiresAt = user?.impersonation ? Date.parse(user.impersonation.expiresAt) : 0
  useEffect(() => {
    if (isImpersonating && expiresAt && now >= expiresAt && !isEnding) void exit()
  }, [isImpersonating, expiresAt, now, isEnding, exit])

  if (!isImpersonating || !user?.impersonation) return null
  const minutesLeft = Math.max(0, Math.ceil((expiresAt - now) / 60_000))

  return (
    <div role="status" className="flex flex-col gap-2 bg-sky-600 px-5 py-2.5 text-sm text-white sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2">
        <Eye size={16} className="shrink-0" />
        <span>
          Viewing <span className="font-semibold">{user.gymName}</span> as Alphaexplora support · read only · ends{' '}
          {formatTime(user.impersonation.expiresAt)} ({minutesLeft} min left)
        </span>
      </p>
      <button
        type="button"
        onClick={exit}
        disabled={isEnding}
        className="w-fit rounded bg-white/20 px-3 py-1 font-semibold hover:bg-white/30 disabled:opacity-60"
      >
        {isEnding ? 'Leaving…' : 'Exit view'}
      </button>
    </div>
  )
}
