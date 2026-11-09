import { BellRing } from 'lucide-react'
import { formatDate } from '../../../../shared/utils/format'

/** Shown in the last 2 weeks of a plan: tells the member to renew or upgrade at the front desk. */
export const ExpiringNotice = ({ daysLeft, expiresAt }: { daysLeft: number; expiresAt: string }) => (
  <div role="status" className="mt-4 flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
    <BellRing size={20} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
    <div>
      <p className="font-semibold text-amber-300">
        {daysLeft === 0 ? 'Your plan ends today' : `Your plan ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`} ({formatDate(expiresAt)})
      </p>
      <p className="mt-0.5 text-steel">
        Renew or upgrade at the front desk to keep checking in. An upgrade starts after your current plan, so you don't lose any days.
      </p>
    </div>
  </div>
)
