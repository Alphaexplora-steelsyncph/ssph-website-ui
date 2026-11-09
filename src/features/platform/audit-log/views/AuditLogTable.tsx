import { Pager } from '../../../../shared/components/Pager'
import { formatDate, formatTime } from '../../../../shared/utils/format'
import { useAuditLogViewModel } from '../viewModels/useAuditLogViewModel'

const ROLE_STYLE: Record<string, string> = {
  SuperAdmin: 'text-ember',
  Admin: 'text-sky-400',
  Member: 'text-emerald-400',
  System: 'text-steel',
}

export const AuditLogTable = () => {
  const vm = useAuditLogViewModel()
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select aria-label="Filter by gym" value={vm.gymId} onChange={(e) => vm.setGymId(e.target.value)}
          className="rounded-lg border border-coal-500 bg-coal-800 px-4 py-2.5 text-sm focus:border-ember focus:outline-none">
          <option value="">All gyms and platform</option>
          {vm.gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input type="search" value={vm.query} onChange={(e) => vm.setQuery(e.target.value)} placeholder="Search action, person or details"
          aria-label="Search audit log"
          className="w-full rounded-lg border border-coal-500 bg-coal-800 px-4 py-2.5 text-sm placeholder:text-coal-500 focus:border-ember focus:outline-none sm:max-w-sm" />
      </div>
      {vm.error && <div role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}
      <div className="overflow-x-auto rounded-xl border border-coal-600">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-coal-800 text-xs uppercase tracking-wider text-steel">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Who</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Gym</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coal-600">
            {vm.isLoading && <tr><td colSpan={5} className="px-4 py-10 text-center text-steel">Loading…</td></tr>}
            {!vm.isLoading && vm.entries.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-steel">No entries.</td></tr>}
            {vm.entries.map((e) => (
              <tr key={e.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-steel">{formatDate(e.at)}<br />{formatTime(e.at)}</td>
                <td className="px-4 py-3">
                  {e.actorName}
                  <span className={`block text-xs ${ROLE_STYLE[e.actorRole] ?? 'text-steel'}`}>{e.actorRole}</span>
                </td>
                <td className="px-4 py-3 font-semibold">{e.action}</td>
                <td className="px-4 py-3 text-steel">{e.gymName ?? '—'}</td>
                <td className="px-4 py-3 text-steel">{e.details ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={vm.paging.page} pageCount={vm.paging.pageCount} total={vm.paging.total} pageSize={vm.paging.pageSize} onPage={vm.paging.setPage} noun="entries" />
    </div>
  )
}
