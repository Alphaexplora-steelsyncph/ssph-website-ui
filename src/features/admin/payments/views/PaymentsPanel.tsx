import { FileImage } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ListFilters } from '../../../../shared/components/ListFilters'
import { Pager } from '../../../../shared/components/Pager'
import { formatDate, formatPeso, formatTime } from '../../../../shared/utils/format'
import { usePaymentsViewModel } from '../viewModels/usePaymentsViewModel'

/** Section that owns the Payments ViewModel: filters, totals, the list and paging. */
export const PaymentsPanel = () => {
  const vm = usePaymentsViewModel()
  const f = vm.filters
  return (
    <div>
      <ListFilters
        q={f.q}
        onQ={f.setQ}
        from={f.from}
        onFrom={f.setFrom}
        to={f.to}
        onTo={f.setTo}
        presets={f.presets}
        onPreset={f.applyPreset}
        activePreset={f.preset}
        onExport={vm.exportCsv}
        isExporting={vm.isExporting}
        exportDisabled={vm.total === 0}
      >
        <label className="block">
          <span className="mb-1 block text-xs text-steel">Mode</span>
          <select
            aria-label="Payment mode"
            value={vm.method}
            onChange={(e) => vm.setMethod(e.target.value as typeof vm.method)}
            className="rounded-lg border border-coal-500 bg-coal-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-ember focus:outline-none"
          >
            <option value="">All modes</option>
            {vm.methods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </ListFilters>

      {vm.summary && (
        <div data-testid="payments-summary" className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 rounded-xl border border-coal-600 bg-coal-800 p-4 sm:col-span-3 lg:col-span-2">
            <p className="text-xs uppercase tracking-wider text-steel">Total collected</p>
            <p className="mt-1 font-display text-4xl font-extrabold">{formatPeso(vm.summary.amount)}</p>
            <p className="text-xs text-steel">{vm.summary.count.toLocaleString('en-PH')} payments</p>
          </div>
          {vm.methods.map((m) => (
            <div key={m} className="rounded-xl border border-coal-600 bg-coal-800 p-4">
              <p className="text-xs uppercase tracking-wider text-steel">{m}</p>
              <p className="mt-1 text-lg font-semibold">{formatPeso(vm.summary?.byMethod[m] ?? 0)}</p>
            </div>
          ))}
        </div>
      )}

      {vm.error && <div role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}

      <div className="overflow-x-auto rounded-xl border border-coal-600">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-coal-800 text-xs uppercase tracking-wider text-steel">
            <tr>
              <th className="px-4 py-3 font-medium">Date · time</th>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Mode · ref</th>
              <th className="px-4 py-3 font-medium">Receipt</th>
              <th className="px-4 py-3 font-medium">Recorded by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coal-600">
            {vm.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-steel">Loading…</td>
              </tr>
            )}
            {!vm.isLoading && vm.payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-steel">No payments for these filters.</td>
              </tr>
            )}
            {vm.payments.map((p) => (
              <tr key={p.id} className="hover:bg-coal-800/60">
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDate(p.recordedAt)}
                  <span className="block text-xs text-steel">{formatTime(p.recordedAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/admin/members/${p.member.id}`} className="font-medium hover:text-ember hover:underline">
                    {p.member.fullName}
                  </Link>
                  <span className="block text-xs text-steel">{p.member.email || 'Walk-in'}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatPeso(p.amount)}</td>
                <td className="px-4 py-3">
                  {p.method}
                  {p.referenceNo && <span className="block whitespace-nowrap text-xs text-steel">ref {p.referenceNo}</span>}
                </td>
                <td className="px-4 py-3">
                  {p.receiptUrl ? (
                    <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline">
                      <FileImage size={12} aria-hidden="true" /> View
                    </a>
                  ) : (
                    <span className="text-steel">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-steel">{p.recordedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={f.page} pageCount={vm.pageCount} total={vm.total} pageSize={f.pageSize} onPage={f.setPage} noun="payments" />
    </div>
  )
}
