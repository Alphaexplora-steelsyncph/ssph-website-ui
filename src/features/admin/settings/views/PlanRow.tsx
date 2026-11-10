import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatDuration } from '../../../../shared/utils/format'
import { planPriceLabel } from '../../../../shared/utils/planBilling'
import type { DraftPlan, SettingsVM } from '../viewModels/useSettingsViewModel'

export const PlanRow = ({ plan, vm }: { plan: DraftPlan; vm: SettingsVM }) => {
  const editing = vm.editing
  const state = vm.planState(plan)
  const [confirmDelete, setConfirmDelete] = useState(false) // UI-local

  return (
    <li className="flex flex-col gap-3 bg-coal-900/40 px-4 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className={`font-display text-xl font-bold uppercase ${plan.isActive ? '' : 'text-steel'}`}>
          {plan.name}
          {editing && state && (
            <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 align-middle font-sans text-xs font-semibold normal-case text-amber-400">
              {state === 'new' ? 'New · not saved yet' : 'Changed · not saved yet'}
            </span>
          )}
        </p>
        <p className="text-sm text-steel">
          {formatDuration(plan.durationValue, plan.durationUnit)} · {planPriceLabel(plan)}
        </p>
      </div>

      {editing ? (
      <label className="flex items-center gap-2 text-sm">
        <button
          type="button"
          role="switch"
          aria-checked={plan.isActive}
          aria-label={`Offer ${plan.name}`}
          onClick={() => vm.toggleOffered(plan)}
          className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${plan.isActive ? 'bg-ember' : 'bg-coal-500'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${plan.isActive ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
        <span className={plan.isActive ? 'text-zinc-100' : 'text-steel'}>{plan.isActive ? 'Offered' : 'Hidden'}</span>
      </label>
      ) : (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${plan.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-coal-600 text-steel'}`}>{plan.isActive ? 'Offered' : 'Hidden'}</span>
      )}

      {editing && (
      <div className="flex items-center gap-2 sm:ml-4">
        {confirmDelete ? (
          <>
            <button
              type="button"
              onClick={() => vm.removePlan(plan)}
              className="rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              Delete plan
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-steel hover:text-zinc-100">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => vm.startEditPlan(plan)}
              className="flex items-center gap-1.5 rounded border border-coal-500 px-3 py-1.5 text-xs font-semibold text-steel hover:border-steel hover:text-zinc-100"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete ${plan.name}`}
              className="rounded border border-red-500/40 p-1.5 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
      )}
    </li>
  )
}
