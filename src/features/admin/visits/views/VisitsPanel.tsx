import { Link } from 'react-router-dom'
import { ListFilters } from '../../../../shared/components/ListFilters'
import { Pager } from '../../../../shared/components/Pager'
import { formatDate, formatTime, formatWeekday } from '../../../../shared/utils/format'
import { useVisitsViewModel } from '../viewModels/useVisitsViewModel'

/** Section that owns the Visits ViewModel: filters, the list and paging. */
export const VisitsPanel = () => {
  const vm = useVisitsViewModel()
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
      />
      <p data-testid="visits-total" className="mb-3 text-sm text-steel">
        <span className="font-display text-3xl font-extrabold text-zinc-100">{vm.total.toLocaleString('en-PH')}</span> check-ins
      </p>
      {vm.error && <div role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}
      <div className="overflow-x-auto rounded-xl border border-coal-600">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-coal-800 text-xs uppercase tracking-wider text-steel">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coal-600">
            {vm.isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-steel">Loading…</td>
              </tr>
            )}
            {!vm.isLoading && vm.visits.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-steel">No check-ins for these filters.</td>
              </tr>
            )}
            {vm.visits.map((v) => (
              <tr key={v.id} className="hover:bg-coal-800/60">
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDate(v.checkedInAt)} <span className="text-steel">{formatWeekday(v.checkedInAt)}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{formatTime(v.checkedInAt)}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/members/${v.member.id}`} className="font-medium hover:text-ember hover:underline">
                    {v.member.fullName}
                  </Link>
                  <span className="block text-xs text-steel">{v.member.email || 'Walk-in'}</span>
                </td>
                <td className="px-4 py-3 text-steel">{v.member.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={f.page} pageCount={vm.pageCount} total={vm.total} pageSize={f.pageSize} onPage={f.setPage} noun="check-ins" />
    </div>
  )
}
