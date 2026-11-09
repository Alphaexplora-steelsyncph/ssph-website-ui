import { Pager } from '../../../../shared/components/Pager'
import { Link } from 'react-router-dom'
import { gymSiteLabel } from '../../../../shared/tenant/tenant'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { BillingStateText, GymStatusBadge } from '../../../../shared/components/PlatformBadges'
import { RecordPaymentLink } from '../../../../shared/components/RecordPaymentLink'
import { formatDate } from '../../../../shared/utils/format'
import { usePlatformGymsViewModel, type GymFilter } from '../viewModels/usePlatformGymsViewModel'

const FILTERS: GymFilter[] = ['All', 'Active', 'Suspended', 'Unpaid', 'Archived']

export const GymsTable = () => {
  const vm = usePlatformGymsViewModel()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={vm.search}
          onChange={(e) => vm.setSearch(e.target.value)}
          placeholder="Search gym name or link"
          aria-label="Search gyms"
          className="w-full rounded-lg border border-coal-500 bg-coal-800 px-4 py-2.5 text-sm placeholder:text-coal-500 focus:border-ember focus:outline-none lg:max-w-xs"
        />
        <div role="group" aria-label="Filter gyms" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={vm.filter === f}
              onClick={() => vm.setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${vm.filter === f ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:text-zinc-100'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {vm.error && <div role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}

      <div className="overflow-x-auto rounded-xl border border-coal-600">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-coal-800 text-xs uppercase tracking-wider text-steel">
            <tr>
              <th className="px-4 py-3 font-medium">Gym</th>
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">Members</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Billing</th>
              <th className="px-4 py-3 font-medium">Paid for {vm.periodLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coal-600">
            {vm.isLoading && <tr><td colSpan={6} className="px-4 py-10 text-center text-steel">Loading gyms…</td></tr>}
            {!vm.isLoading && vm.gyms.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-steel">No gyms match.</td></tr>}
            {vm.gyms.map((g) => {
              const paid = vm.isPaidThisMonth(g)
              return (
                <tr key={g.id} className="hover:bg-coal-800/60">
                  <td className="px-4 py-3">
                    <Link to={`/platform/gyms/${g.id}`} className="font-semibold hover:text-ember">{g.name}</Link>
                    <p className="font-mono text-xs text-steel">{gymSiteLabel(g.slug)}</p>
                  </td>
                  <td className="px-4 py-3">{g.packageName}</td>
                  <td className="px-4 py-3 text-steel">
                    {g.activeMembers} active{g.memberLimit !== null && <span> · limit {g.memberLimit}</span>}
                  </td>
                  <td className="px-4 py-3"><GymStatusBadge status={g.status} reason={g.suspendReason} /></td>
                  <td className="px-4 py-3">
                    <BillingStateText state={g.billing.state} daysUntilDue={g.billing.daysUntilDue} />
                    <p className="text-xs text-steel">{g.billing.periodLabel} · due {formatDate(g.billing.dueDate)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {g.status === 'Archived' ? (
                      <span className="text-xs text-steel">—</span>
                    ) : (
                      <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_BILLING} fallback={<span>{paid ? 'Yes' : 'No'}</span>}>
                        <RecordPaymentLink gymId={g.id} period={vm.period} paid={paid} />
                      </RoleGuard>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pager page={vm.paging.page} pageCount={vm.paging.pageCount} total={vm.paging.total} pageSize={vm.paging.pageSize} onPage={vm.paging.setPage} noun="gyms" />
    </div>
  )
}
