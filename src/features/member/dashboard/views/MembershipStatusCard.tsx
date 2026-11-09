import { StatusBadge } from '../../../../shared/components/StatusBadge'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { CancelMembershipNotice } from './CancelMembershipNotice'
import { ExpiringNotice } from './ExpiringNotice'
import type { MemberDashboardVM } from '../viewModels/useMemberDashboardViewModel'

const STATUS_NOTE = {
  Pending: 'Your account is ready, but there is no membership on file yet. Please see the front desk to pay and activate it.',
  Expired: 'Your membership has expired. Renew at the front desk to keep checking in.',
  Terminated: 'This account has been terminated. Please see the front desk.',
} as const

export const MembershipStatusCard = ({ vm }: { vm: MemberDashboardVM }) => {
  if (vm.isLoading) return <div className="mt-6 h-40 animate-pulse rounded-xl bg-coal-800" />
  if (vm.error || !vm.membership) {
    return <p role="alert" className="mt-6 text-sm text-red-300">{vm.error ?? 'Could not load your membership.'}</p>
  }

  const { status, member } = vm.membership
  return (
    <section className="mt-6 rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold uppercase">My membership</h2>
        <StatusBadge status={status} />
      </div>

      {member && (
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-steel">Plan</dt>
            <dd className="mt-1 font-semibold">{member.plan}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-steel">Member since</dt>
            <dd className="mt-1 font-semibold">{formatDate(member.memberSince)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-steel">{status === 'Expired' ? 'Expired on' : 'Valid until'}</dt>
            <dd className={`mt-1 font-semibold ${status === 'Expired' ? 'text-amber-400' : ''}`}>{formatDate(member.expiresAt)}</dd>
          </div>
        </dl>
      )}

      {vm.daysLeft !== null && !vm.expiringSoon && (
        <p className="mt-4 text-sm text-steel">{`${vm.daysLeft} day${vm.daysLeft === 1 ? '' : 's'} left.`}</p>
      )}
      {vm.expiringSoon && member && vm.daysLeft !== null && <ExpiringNotice daysLeft={vm.daysLeft} expiresAt={member.expiresAt} />}
      {status !== 'Active' && <p className="mt-4 text-sm text-steel">{STATUS_NOTE[status]}</p>}
      {member && status !== 'Terminated' && member.balanceUpcoming && (
        <div role="status" className="mt-4 rounded-lg border border-coal-500 px-4 py-3 text-sm">
          <p className="font-semibold text-zinc-100">Next payment: {formatPeso(member.balanceDue)}</p>
          <p className="mt-0.5 text-steel">
            {member.balanceDueOn ? `On ${formatDate(member.balanceDueOn)}, ` : ''}your gym's payment day. Pay at the front desk.
          </p>
        </div>
      )}
      {member && status !== 'Terminated' && member.balanceDue > 0 && !member.balanceUpcoming && (
        <div
          role="status"
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            member.balanceOverdue ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
          }`}
        >
          <p className="font-semibold">
            {member.balanceOverdue ? 'Overdue balance' : 'Balance to pay'}: {formatPeso(member.balanceDue)}
          </p>
          <p className="mt-0.5 text-steel">
            {member.balanceDueOn ? `Due ${formatDate(member.balanceDueOn)}. ` : ''}Please settle it at the front desk.
          </p>
        </div>
      )}

      {member && status !== 'Terminated' && (
        <div className="mt-5 border-t border-coal-600 pt-4">
          <CancelMembershipNotice gymName={vm.gymName} />
        </div>
      )}
    </section>
  )
}
