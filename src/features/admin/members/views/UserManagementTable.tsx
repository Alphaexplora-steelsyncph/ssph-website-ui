import { ArrowUpCircle, CalendarClock } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../../../shared/components/Avatar'
import { Pager } from '../../../../shared/components/Pager'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import type { MemberRecord, MembershipStatus } from '../../../../shared/models/types'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { useUserManagementViewModel } from '../viewModels/useUserManagementViewModel'
import { CollectBalanceDialog } from './CollectBalanceDialog'
import type { PlanDialogMode } from '../viewModels/useReinstateMemberViewModel'
import { PayInstallmentDialog } from './PayInstallmentDialog'
import { ReinstateMemberDialog } from './ReinstateMemberDialog'

const statusStyles: Record<MembershipStatus, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400',
  Paused: 'bg-orange-500/15 text-orange-400',
  Expired: 'bg-amber-500/15 text-amber-400',
  Terminated: 'bg-red-500/15 text-red-400',
}

export const UserManagementTable = () => {
  const {
    members, matchCount, totalCount, paging, isLoading, error, search, setSearch, statusFilter, setStatusFilter, statusOptions,
    isFiltering, canTerminateMembers, pendingId, terminateMember, replaceMember,
  } = useUserManagementViewModel()
  // UI-local state: which row is awaiting inline confirmation
  const [confirmId, setConfirmId] = useState<string | null>(null)
  // UI-local state: the member being reinstated (terminated), renewed (expired) or upgraded (active). The dialog is open while this is set.
  const [planDialog, setPlanDialog] = useState<{ member: MemberRecord; mode: PlanDialogMode } | null>(null)
  // UI-local state: the member whose balance is being collected
  const [collecting, setCollecting] = useState<MemberRecord | null>(null)
  // UI-local state: the member whose next monthly payment is being recorded
  const [payingNext, setPayingNext] = useState<MemberRecord | null>(null)

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          aria-label="Search members"
          className="w-full rounded-lg border border-coal-500 bg-coal-800 px-4 py-2.5 text-sm placeholder:text-coal-500 focus:border-ember focus:outline-none sm:max-w-xs"
        />
        <p className="text-sm text-steel">{matchCount} of {totalCount} members</p>
      </div>

      <div role="group" aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        {statusOptions.map(({ value, count }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            aria-pressed={statusFilter === value}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === value
                ? 'border-ember bg-ember/15 text-ember'
                : 'border-coal-500 text-steel hover:border-steel hover:text-zinc-100'
            }`}
          >
            {value} <span className="ml-1 opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-coal-600">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-coal-800 text-xs uppercase tracking-wider text-steel">
            <tr>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Member since</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coal-600">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-steel">Loading members…</td></tr>
            )}
            {!isLoading && members.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-steel">
                {isFiltering ? 'No members match your search or filter.' : 'No members found.'}
              </td></tr>
            )}
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-coal-800/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.fullName} photoUrl={m.photoUrl} size="sm" />
                    <div className="min-w-0">
                      <Link to={`/admin/members/${m.id}`} className="font-medium hover:text-ember hover:underline">
                        {m.fullName}
                      </Link>
                      <p className="text-xs text-steel">{m.email || 'Walk-in · no email'}</p>
                      {m.city && <p className="text-xs text-steel">{m.city}</p>}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {m.plan}
                  {m.installmentsTotal != null && (
                    <p className="text-xs text-steel">
                      Installment · {m.installmentsPaid ?? 0} of {m.installmentsTotal} paid
                      {m.paidUntil && <span className="block">Paid until {formatDate(m.paidUntil)}</span>}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-steel">{formatDate(m.memberSince)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-steel">{formatDate(m.expiresAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[m.status]}`}>{m.status}</span>
                  {m.checkInBlocked && <p className="mt-1.5 text-xs font-semibold text-red-400">Check-in blocked</p>}
                  {m.status === 'Paused' && (
                    <p className="mt-1.5 text-xs font-semibold text-orange-400">
                      Monthly payment due · {m.monthsBehind ?? 1} month{(m.monthsBehind ?? 1) === 1 ? '' : 's'} behind
                    </p>
                  )}
                  {m.expiringSoon && m.daysLeft !== null && (
                    <p className="mt-1.5 text-xs font-semibold text-amber-400">{m.daysLeft === 0 ? 'Ends today' : `Ends in ${m.daysLeft} day${m.daysLeft === 1 ? '' : 's'}`}</p>
                  )}
                  {m.status !== 'Terminated' && m.balanceUpcoming && (
                    <p className="mt-1.5 text-xs text-steel">
                      Next payment {formatPeso(m.balanceDue)}
                      {m.balanceDueOn && <span className="block">on {formatDate(m.balanceDueOn)}</span>}
                    </p>
                  )}
                  {m.status !== 'Terminated' && m.balanceDue > 0 && !m.balanceUpcoming && (
                    <p className={`mt-1.5 text-xs font-semibold ${m.balanceOverdue ? 'text-red-400' : 'text-amber-400'}`}>
                      {m.balanceOverdue ? 'Overdue' : 'Balance'} {formatPeso(m.balanceDue)}
                      {m.balanceDueOn && <span className="block font-normal text-steel">due {formatDate(m.balanceDueOn)}</span>}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                  {m.expiringSoon && (
                    <RoleGuard requiredPermission={PERMISSIONS.ENROLL_MEMBERS}>
                      <button
                        type="button"
                        onClick={() => setPlanDialog({ member: m, mode: 'upgrade' })}
                        className="inline-flex items-center gap-1.5 rounded bg-ember px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-ember-600"
                      >
                        <ArrowUpCircle size={14} aria-hidden="true" /> Upgrade plan
                      </button>
                    </RoleGuard>
                  )}
                  {m.canPayInstallment && (
                    <RoleGuard requiredPermission={PERMISSIONS.ENROLL_MEMBERS}>
                      <button
                        type="button"
                        onClick={() => setPayingNext(m)}
                        className="inline-flex items-center gap-1.5 rounded bg-ember px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-ember-600"
                      >
                        <CalendarClock size={14} aria-hidden="true" /> Pay for next payment due
                      </button>
                    </RoleGuard>
                  )}
                  {m.status === 'Expired' && (
                    <RoleGuard requiredPermission={PERMISSIONS.ENROLL_MEMBERS}>
                      <button
                        onClick={() => setPlanDialog({ member: m, mode: 'renew' })}
                        className="rounded bg-ember px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-ember-600"
                      >
                        Renew
                      </button>
                    </RoleGuard>
                  )}
                  {m.status !== 'Terminated' && m.balanceDue > 0 && (
                    <RoleGuard requiredPermission={PERMISSIONS.ENROLL_MEMBERS}>
                      <button
                        onClick={() => setCollecting(m)}
                        className={`rounded border px-3 py-1.5 text-xs font-semibold ${
                          m.balanceUpcoming
                            ? 'border-coal-500 text-steel hover:border-steel hover:text-zinc-100'
                            : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                        }`}
                      >
                        {m.balanceUpcoming ? 'Collect payment' : 'Collect balance'}
                      </button>
                    </RoleGuard>
                  )}
                  <RoleGuard requiredPermission={PERMISSIONS.TERMINATE_MEMBERS}>
                    {m.status === 'Terminated' ? (
                      <button
                        disabled={!canTerminateMembers}
                        onClick={() => setPlanDialog({ member: m, mode: 'reinstate' })}
                        className="rounded border border-emerald-500/50 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                      >
                        Reinstate account
                      </button>
                    ) : confirmId === m.id ? (
                      <span className="inline-flex items-center gap-2">
                        <button
                          disabled={!canTerminateMembers || pendingId === m.id}
                          onClick={async () => {
                            await terminateMember(m.id)
                            setConfirmId(null)
                          }}
                          className="rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          {pendingId === m.id ? 'Terminating…' : 'Confirm'}
                        </button>
                        <button onClick={() => setConfirmId(null)} className="text-xs text-steel hover:text-zinc-100">Cancel</button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(m.id)}
                        className="rounded border border-red-500/50 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                      >
                        Terminate account
                      </button>
                    )}
                  </RoleGuard>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={paging.page} pageCount={paging.pageCount} total={paging.total} pageSize={paging.pageSize} onPage={paging.setPage} noun="members" />

      {collecting && (
        <CollectBalanceDialog
          key={collecting.id}
          member={collecting}
          onClose={() => setCollecting(null)}
          onUpdated={(updated) => {
            replaceMember(updated)
            setCollecting(null)
          }}
        />
      )}

      {payingNext && (
        <PayInstallmentDialog
          key={payingNext.id}
          member={payingNext}
          onClose={() => setPayingNext(null)}
          onUpdated={(updated) => {
            replaceMember(updated)
            setPayingNext(null)
          }}
        />
      )}

      {planDialog && (
        <ReinstateMemberDialog
          key={`${planDialog.mode}-${planDialog.member.id}`}
          member={planDialog.member}
          mode={planDialog.mode}
          onClose={() => setPlanDialog(null)}
          onReinstated={(updated) => {
            replaceMember(updated)
            setPlanDialog(null)
          }}
        />
      )}
    </div>
  )
}
