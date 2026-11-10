import { ArrowUpCircle, CalendarClock, RefreshCw, Repeat, Wallet } from 'lucide-react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import type { MemberRecord } from '../../../../shared/models/types'
import { formatDate, formatPeso } from '../../../../shared/utils/format'

const Item = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
  <div>
    <dt className="text-xs uppercase tracking-wider text-steel">{label}</dt>
    <dd className={`mt-1 font-semibold ${tone ?? ''}`}>{value}</dd>
  </div>
)

/** Payments the front desk settles from the member's profile. */
export type SettleAction = 'pay' | 'switch' | 'collect' | 'renew' | 'reinstate'

const primary = 'inline-flex items-center gap-1.5 rounded bg-ember px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-ember-600'
const outline = 'inline-flex items-center gap-1.5 rounded border border-coal-500 px-3 py-1.5 text-xs font-semibold text-steel hover:border-steel hover:text-zinc-100'

/**
 * The member's plan and how they pay (full payment or installment), with the payment actions that apply right now:
 * pay the next months, switch to installment, collect a balance, renew, reinstate or upgrade.
 */
export const MembershipSummary = ({ member, onUpgrade, onAction }: { member: MemberRecord; onUpgrade?: () => void; onAction?: (a: SettleAction) => void }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-bold uppercase">Membership &amp; payment</h2>
      <div className="flex flex-wrap gap-2">
        {onAction && member.canPayInstallment && (
          <button type="button" onClick={() => onAction('pay')} className={primary}>
            <CalendarClock size={14} aria-hidden="true" /> Pay for next payment due
          </button>
        )}
        {onAction && member.status === 'Expired' && (
          <button type="button" onClick={() => onAction('renew')} className={primary}>
            <RefreshCw size={14} aria-hidden="true" /> Renew
          </button>
        )}
        {onAction && member.status !== 'Terminated' && member.balanceDue > 0 && (
          <button type="button" onClick={() => onAction('collect')} className={primary}>
            <Wallet size={14} aria-hidden="true" /> {member.balanceUpcoming ? 'Collect payment' : 'Collect balance'}
          </button>
        )}
        {onAction && member.paymentOption !== 'monthly' && member.status === 'Active' && member.balanceDue === 0 && (
          <button type="button" onClick={() => onAction('switch')} className={outline}>
            <Repeat size={14} aria-hidden="true" /> Switch to installment
          </button>
        )}
        {onAction && member.status === 'Terminated' && (
          <RoleGuard requiredPermission={PERMISSIONS.TERMINATE_MEMBERS}>
            <button type="button" onClick={() => onAction('reinstate')} className={primary}>
              Reinstate account
            </button>
          </RoleGuard>
        )}
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
    </div>
    <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
      <Item label="Plan" value={member.plan} />
      <Item label="Member since" value={formatDate(member.memberSince)} />
      <Item
        label={member.status === 'Expired' ? 'Expired on' : 'Valid until'}
        value={formatDate(member.expiresAt)}
        tone={member.status === 'Expired' ? 'text-amber-400' : undefined}
      />
      {member.paymentOption !== 'monthly' && <Item label="Payment" value="Full payment" />}
      {member.paymentOption === 'monthly' && (
        <>
          <Item label="Payment" value={`Installment · ${formatPeso(member.installmentAmount ?? 0)}`} />
          <Item label="Months paid" value={`${member.installmentsPaid ?? 0} of ${member.installmentsTotal ?? 0}`} />
          <Item
            label="Paid until"
            value={member.paidUntil ? formatDate(member.paidUntil) : '—'}
            tone={member.status === 'Paused' ? 'text-orange-400' : undefined}
          />
        </>
      )}
    </dl>
    {member.status === 'Paused' && (
      <p role="status" className="mt-5 rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-300">
        Paused · monthly payment due ({member.monthsBehind ?? 1} month{(member.monthsBehind ?? 1) === 1 ? '' : 's'} behind)
        <span className="font-normal text-steel"> · the member cannot check in until it is paid.</span>
      </p>
    )}
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
