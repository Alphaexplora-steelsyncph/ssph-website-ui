import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { EquipmentStatusBadge } from '../../../../shared/components/EquipmentStatusBadge'
import { Pager } from '../../../../shared/components/Pager'
import { formatDate } from '../../../../shared/utils/format'
import { useEquipmentViewModel } from '../viewModels/useEquipmentViewModel'
import { EquipmentDialog } from './EquipmentDialog'

const SHORT: Record<string, string> = { Available: 'Available', 'Under maintenance': 'Maintenance', Broken: 'Broken' }

/** Section that owns the Equipment ViewModel: counts, filters, the list and the add / edit dialog. */
export const EquipmentPanel = () => {
  const vm = useEquipmentViewModel()
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {vm.filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => vm.setFilter(f)}
              aria-pressed={vm.filter === f}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                vm.filter === f ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:text-zinc-100'
              }`}
            >
              {f} <span className="ml-1 opacity-70">{vm.counts[f]}</span>
            </button>
          ))}
        </div>
        <label className="relative ml-auto min-w-52">
          <span className="sr-only">Search equipment</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel" aria-hidden="true" />
          <input
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            placeholder="Search name or area"
            className="w-full rounded-lg border border-coal-500 bg-coal-800 py-2.5 pl-9 pr-3 text-sm focus:border-ember focus:outline-none"
          />
        </label>
        {vm.canEdit && (
          <Button type="button" onClick={vm.openAdd} className="!px-4 !py-2.5 !text-base">
            <Plus size={18} /> Add equipment
          </Button>
        )}
      </div>

      {vm.error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {vm.error}
        </div>
      )}
      {vm.isLoading && <div className="h-40 animate-pulse rounded-xl bg-coal-800" />}
      {vm.isEmpty && (
        <div className="rounded-xl border border-dashed border-coal-500 p-8 text-center text-steel">
          No equipment yet. Add your machines (e.g. "Treadmill 1", "Squat Rack") so members can see which ones are working.
        </div>
      )}

      {!vm.isLoading && !vm.isEmpty && (
        <div className="overflow-x-auto rounded-xl border border-coal-600">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-coal-800 text-xs uppercase tracking-wider text-steel">
              <tr>
                <th className="px-4 py-3 font-medium">Equipment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Note for members</th>
                {vm.canEdit && <th className="px-4 py-3 text-right font-medium">Change status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-coal-600">
              {vm.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-steel">
                    Nothing matches.
                  </td>
                </tr>
              )}
              {vm.items.map((item) => (
                <tr key={item.id} className="hover:bg-coal-800/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-steel">{item.area ?? 'No area'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <EquipmentStatusBadge status={item.status} />
                    <p className="mt-1 text-xs text-steel">
                      since {formatDate(item.statusChangedAt)}
                      {item.updatedBy && ` · ${item.updatedBy}`}
                    </p>
                  </td>
                  <td className="max-w-[240px] px-4 py-3 text-steel">{item.note ?? '—'}</td>
                  {vm.canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <div role="group" aria-label={`Status of ${item.name}`} className="flex gap-1 rounded-lg bg-coal-900 p-1">
                          {vm.statuses.map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={vm.busyId === item.id}
                              aria-pressed={item.status === s}
                              onClick={() => vm.setStatus(item, s)}
                              className={`rounded px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
                                item.status === s ? 'bg-coal-600 text-zinc-100' : 'text-steel hover:text-zinc-100'
                              }`}
                            >
                              {SHORT[s]}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => vm.openEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="rounded p-1.5 text-steel hover:text-zinc-100"
                        >
                          <Pencil size={16} />
                        </button>
                        {vm.confirmDeleteId === item.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => vm.remove(item)}
                              className="rounded border border-red-500/50 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                            >
                              Remove
                            </button>
                            <button type="button" onClick={vm.cancelDelete} className="px-1 text-xs text-steel hover:text-zinc-100">
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => vm.remove(item)}
                            aria-label={`Remove ${item.name}`}
                            className="rounded p-1.5 text-steel hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={vm.paging.page} pageCount={vm.paging.pageCount} total={vm.paging.total} pageSize={vm.paging.pageSize} onPage={vm.paging.setPage} noun="machines" />
      {vm.draft && <EquipmentDialog vm={vm} />}
    </div>
  )
}
