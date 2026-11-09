import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { PlanOption } from '../../../../shared/models/types'
import { formatDuration, formatPeso } from '../../../../shared/utils/format'
import type { PlansVM } from '../viewModels/usePlansViewModel'

export const PlanRow = ({ plan, vm }: { plan: PlanOption; vm: PlansVM }) => {
  const [confirmDelete, setConfirmDelete] = useState(false) // UI-local
  const busy = vm.busyId === plan.id

  return (
    <li className="flex flex-col gap-3 bg-coal-900/40 px-4 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className={`font-display text-xl font-bold uppercase ${plan.isActive ? '' : 'text-steel'}`}>{plan.name}</p>
        <p className="text-sm text-steel">
          {formatPeso(plan.price)} · {formatDuration(plan.durationValue, plan.durationUnit)}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <button
          type="button"
          role="switch"
          aria-checked={plan.isActive}
          aria-label={`Offer ${plan.name}`}
          disabled={busy}
          onClick={() => vm.toggleOffered(plan)}
          className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${plan.isActive ? 'bg-ember' : 'bg-coal-500'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${plan.isActive ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
        <span className={plan.isActive ? 'text-zinc-100' : 'text-steel'}>{plan.isActive ? 'Offered' : 'Hidden'}</span>
      </label>

      <div className="flex items-center gap-2 sm:ml-4">
        {confirmDelete ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => vm.removePlan(plan.id)}
              className="rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {busy ? 'Deleting…' : 'Delete plan'}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-steel hover:text-zinc-100">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => vm.startEdit(plan)}
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
    </li>
  )
}
