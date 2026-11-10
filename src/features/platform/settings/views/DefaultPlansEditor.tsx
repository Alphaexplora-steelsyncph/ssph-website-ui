import { Plus, Trash2 } from 'lucide-react'
import type { DurationUnit } from '../../../../shared/models/types'
import type { PlatformSettingsVM } from '../viewModels/usePlatformSettingsViewModel'

const input = 'w-full rounded-lg border border-coal-500 bg-coal-900 px-3 py-2 text-sm focus:border-ember focus:outline-none'

export const DefaultPlansEditor = ({ vm }: { vm: PlatformSettingsVM }) => (
  <div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-steel">
          <tr>
            <th className="pb-2 pr-3 font-medium">Plan name</th>
            <th className="pb-2 pr-3 font-medium">Price (₱)</th>
            <th className="pb-2 pr-3 font-medium">Duration</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {vm.draft!.defaultPlans.map((p, i) => (
            <tr key={i}>
              <td className="py-1.5 pr-3">
                <input aria-label="Plan name" className={input} value={p.name} onChange={(e) => vm.setPlan(i, { name: e.target.value })} />
              </td>
              <td className="py-1.5 pr-3">
                <input aria-label="Price" type="number" min="0" className={input} value={Number.isNaN(p.price) ? '' : p.price}
                  onChange={(e) => vm.setPlan(i, { price: e.target.value === '' ? NaN : Number(e.target.value) })} />
              </td>
              <td className="py-1.5 pr-3">
                <div className="flex gap-2">
                  <input aria-label="Duration amount" type="number" min="1" className={`${input} w-20`} value={Number.isNaN(p.durationValue) ? '' : p.durationValue}
                    onChange={(e) => vm.setPlan(i, { durationValue: e.target.value === '' ? NaN : Number(e.target.value) })} />
                  <select aria-label="Duration unit" className={input} value={p.durationUnit}
                    onChange={(e) => vm.setPlan(i, { durationUnit: e.target.value as DurationUnit })}>
                    <option value="days">Day(s)</option>
                    <option value="months">Month(s)</option>
                  </select>
                </div>
              </td>
              <td className="py-1.5 text-right">
                {vm.editing && (
                  <button type="button" onClick={() => vm.removePlan(i)} aria-label={`Remove ${p.name || 'plan'}`}
                    className="rounded border border-red-500/40 p-2 text-red-400 hover:bg-red-500/10">
                    <Trash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {vm.editing && (
      <button type="button" onClick={vm.addPlan} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ember hover:underline">
        <Plus size={16} /> Add plan
      </button>
    )}
  </div>
)
