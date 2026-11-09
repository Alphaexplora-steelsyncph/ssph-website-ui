import { ArrowUpCircle } from 'lucide-react'
import type { MemberRecord } from '../../../../shared/models/types'
import { formatDate, formatPeso } from '../../../../shared/utils/format'

const Item = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
  <div>
    <dt className="text-xs uppercase tracking-wider text-steel">{label}</dt>
    <dd className={`mt-1 font-semibold ${tone ?? ''}`}>{value}</dd>
  </div>
)

/** Read-only, plus Upgrade plan in the last 2 weeks of a plan. Renewals and balances are handled from the Members list. */
export const MembershipSummary = ({ member, onUpgrade }: { member: MemberRecord; onUpgrade?: () => void }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-bold uppercase">Membership</h2>
      {onUpgrade && member.expiringSoon && (
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-1.5 rounded bg-ember px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-ember-600"
        >
          <ArrowUpCircle size={14} aria-hidden="true" /> Upgrade plan
        </button>
      )}
    </div>
    <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
      <Item label="Plan" value={member.plan} />
      <Item label="Member since" value={formatDate(member.memberSince)} />
      <Item
        label={member.status === 'Expired' ? 'Expired on' : 'Valid until'}
        value={formatDate(member.expiresAt)}
        tone={member.status === 'Expired' ? 'text-amber-400' : undefined}
      />
    </dl>
    {member.expiringSoon && member.daysLeft !== null && (
      <p role="status" className="mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300">
        {member.daysLeft === 0 ? 'Plan ends today' : `Plan ends in ${member.daysLeft} day${member.daysLeft === 1 ? '' : 's'}`}
        <span className="font-normal text-steel"> · the member has been notified. Renew or upgrade it here.</span>
      </p>
    )}
    {member.status !== 'Terminated' && member.balanceUpcoming && (
      <p role="status" className="mt-5 rounded-lg border border-coal-500 px-4 py-3 text-sm font-semibold text-zinc-100">
        Next payment {formatPeso(member.balanceDue)}
        {member.balanceDueOn && <span className="font-normal text-steel"> · on {formatDate(member.balanceDueOn)} (the gym's payment day)</span>}
      </p>
    )}
    {member.status !== 'Terminated' && member.balanceDue > 0 && !member.balanceUpcoming && (
      <p
        role="status"
        className={`mt-5 rounded-lg border px-4 py-3 text-sm font-semibold ${
          member.balanceOverdue ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        }`}
      >
        {member.balanceOverdue ? 'Overdue balance' : 'Balance'} {formatPeso(member.balanceDue)}
        {member.balanceDueOn && <span className="font-normal text-steel"> · due {formatDate(member.balanceDueOn)}</span>}
      </p>
    )}
  </section>
)
