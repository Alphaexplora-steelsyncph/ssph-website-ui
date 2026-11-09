import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import type { DurationUnit } from '../../../../shared/models/types'
import type { PlansVM } from '../viewModels/usePlansViewModel'

/** Add / edit form for one plan. Not a <form> element because it can sit inside a list. */
export const PlanForm = ({ vm, title }: { vm: PlansVM; title: string }) => (
  <div className="rounded-lg border border-ember/40 bg-coal-900 p-4 sm:p-5">
    <h3 className="mb-4 font-display text-xl font-bold uppercase">{title}</h3>
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        label="Plan name"
        placeholder="e.g. Student Monthly"
        value={vm.draft.name}
        onChange={(e) => vm.updateDraft('name', e.target.value)}
        error={vm.draftErrors.name}
      />
      <TextField
        label="Price (₱)"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={vm.draft.price}
        onChange={(e) => vm.updateDraft('price', e.target.value)}
        error={vm.draftErrors.price}
      />
      <div>
        <span className="mb-1.5 block text-sm font-medium text-steel">Duration</span>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            inputMode="numeric"
            aria-label="Duration amount"
            value={vm.draft.durationValue}
            onChange={(e) => vm.updateDraft('durationValue', e.target.value)}
            className={`w-24 rounded-lg border bg-coal-800 px-4 py-3 text-base focus:border-ember focus:outline-none ${
              vm.draftErrors.durationValue ? 'border-red-500' : 'border-coal-500'
            }`}
          />
          <select
            aria-label="Duration unit"
            value={vm.draft.durationUnit}
            onChange={(e) => vm.updateDraft('durationUnit', e.target.value as DurationUnit)}
            className="flex-1 rounded-lg border border-coal-500 bg-coal-800 px-4 py-3 text-base focus:border-ember focus:outline-none"
          >
            <option value="days">Day(s)</option>
            <option value="months">Month(s)</option>
          </select>
        </div>
        {vm.draftErrors.durationValue && <p className="mt-1.5 text-sm text-red-400">{vm.draftErrors.durationValue}</p>}
      </div>
      <label className="flex items-center gap-3 self-end pb-3 text-sm">
        <input
          type="checkbox"
          checked={vm.draft.isActive}
          onChange={(e) => vm.updateDraft('isActive', e.target.checked)}
          className="h-4 w-4 accent-[#f3efe6]"
        />
        Offer this plan
      </label>
    </div>
    <p className="mt-3 text-xs text-steel">Day plans count the start day: a 1-day pass is valid on that day only.</p>
    <div className="mt-5 flex gap-3">
      <Button type="button" onClick={vm.saveDraft} disabled={vm.isSaving}>
        {vm.isSaving ? 'Saving…' : 'Save plan'}
      </Button>
      <Button type="button" variant="outline" onClick={vm.cancelEdit}>
        Cancel
      </Button>
    </div>
  </div>
)
