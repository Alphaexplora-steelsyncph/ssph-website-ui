import { CheckCircle2, Clock, ShieldX, TimerOff, XCircle, type LucideIcon } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { Logo } from '../../../../shared/components/Logo'
import type { CheckInOutcome } from '../../../../shared/models/types'
import { formatDate, formatTime } from '../../../../shared/utils/format'
import { useCheckInViewModel } from '../viewModels/useCheckInViewModel'

const OUTCOME: Record<CheckInOutcome, { title: string; icon: LucideIcon; tone: string }> = {
  success: { title: 'Success', icon: CheckCircle2, tone: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
  already: { title: 'Already checked in', icon: Clock, tone: 'border-sky-500/50 bg-sky-500/10 text-sky-400' },
  expired: { title: 'Membership expired', icon: TimerOff, tone: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
  denied: { title: 'Access denied', icon: ShieldX, tone: 'border-red-500/50 bg-red-500/10 text-red-400' },
}

export const CheckInStatus = () => {
  const { phase, result, error } = useCheckInViewModel()

  if (phase === 'checking') {
    return (
      <div className="text-center" role="status">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-coal-500 border-t-ember" />
        <p className="mt-4 text-steel">Checking you in…</p>
      </div>
    )
  }

  const view =
    phase === 'result' && result
      ? { ...OUTCOME[result.outcome], message: result.message }
      : phase === 'wrong-account'
        ? { ...OUTCOME.denied, message: 'You are signed in with an admin account. Log in as a member to check in.' }
        : phase === 'blocked'
          ? { ...OUTCOME.denied, message: error ?? 'Your account cannot check in right now.' }
        : { title: 'Invalid QR code', icon: XCircle, tone: OUTCOME.denied.tone, message: error ?? 'This QR code is not valid.' }
  const Icon = view.icon

  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <div role="status" className={`rounded-2xl border p-8 ${view.tone}`}>
        <Icon size={72} strokeWidth={1.75} className="mx-auto" />
        <h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-none">{view.title}</h1>
        <p className="mt-3 text-zinc-100">{view.message}</p>
        {result?.gymName && <p className="mt-4 text-sm text-steel">{result.gymName}</p>}
        {result?.memberName && <p className="text-sm text-steel">{result.memberName}</p>}
        {result?.checkedInAt && (
          <p className="mt-4 font-display text-3xl font-bold text-zinc-100">
            {result.outcome === 'already' ? 'Since ' : ''}
            {formatTime(result.checkedInAt)}
          </p>
        )}
        {result?.expiresAt && (
          <p className="mt-1 text-sm text-steel">
            {result.outcome === 'expired' ? 'Expired on' : 'Valid until'} {formatDate(result.expiresAt)}
          </p>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {phase === 'wrong-account' ? (
          <Button to="/login">Member login</Button>
        ) : (
          <Button to="/member">Go to my dashboard</Button>
        )}
      </div>
    </div>
  )
}
