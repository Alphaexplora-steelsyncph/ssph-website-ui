import { Pager } from '../../../../shared/components/Pager'
import { Link } from 'react-router-dom'
import { GymStatusBadge } from '../../../../shared/components/PlatformBadges'
import { RecordPaymentLink } from '../../../../shared/components/RecordPaymentLink'
import { todayISO } from '../../../../shared/utils/dates'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { usePlatformBillingViewModel } from '../viewModels/usePlatformBillingViewModel'

export const BillingTable = () => {
  const vm = usePlatformBillingViewModel()
  const o = vm.overview
  const label = vm.periods.find((p) => p.value === vm.period)?.label ?? ''
  const today = todayISO()

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-steel">Month</span>
          <select value={vm.period} onChange={(e) => vm.setPeriod(e.target.value)}
            className="rounded-lg border border-coal-500 bg-coal-800 px-4 py-2.5 focus:border-ember focus:outline-none">
            {vm.periods.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
        {o && (
          <div className="flex gap-6 text-sm">
            <p><span className="block text-xs uppercase tracking-wider text-steel">Collected</span><span className="font-display text-3xl font-extrabold text-emerald-400">{formatPeso(o.collected)}</span></p>
            <p><span className="block text-xs uppercase tracking-wider text-steel">Expected</span><span className="font-display text-3xl font-extrabold">{formatPeso(o.expected)}</span></p>
          </div>
        )}
      </div>

      {vm.error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}

      <div className="overflow-x-auto rounded-xl border border-coal-600">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-coal-800 text-xs uppercase tracking-wider text-steel">
            <tr>
              <th className="px-4 py-3 font-medium">Gym</th>
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Paid for {label}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coal-600">
            {!o && <tr><td colSpan={6} className="px-4 py-10 text-center text-steel">Loading…</td></tr>}
            {o?.rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-steel">No gyms were billed this month.</td></tr>}
            {vm.rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3"><Link to={`/platform/gyms/${r.id}`} className="font-semibold hover:text-ember">{r.name}</Link></td>
                <td className="px-4 py-3">{r.packageName}</td>
                <td className="px-4 py-3">{formatPeso(r.periodAmount)}</td>
                <td className={`px-4 py-3 ${!r.periodPaid && r.periodDueDate < today ? 'text-red-400' : 'text-steel'}`}>{formatDate(r.periodDueDate)}</td>
                <td className="px-4 py-3"><GymStatusBadge status={r.status} reason={r.suspendReason} /></td>
                <td className="px-4 py-3">
                  <RecordPaymentLink gymId={r.id} period={vm.period} paid={r.periodPaid} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={vm.paging.page} pageCount={vm.paging.pageCount} total={vm.paging.total} pageSize={vm.paging.pageSize} onPage={vm.paging.setPage} noun="gyms" />
    </div>
  )
}
