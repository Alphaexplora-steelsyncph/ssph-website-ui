import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import type { DurationUnit } from '../../../../shared/models/types'
import { canHaveMonthlyPrice } from '../../../../shared/utils/planBilling'
import type { SettingsVM } from '../viewModels/useSettingsViewModel'

/** Add / edit form for one plan. Not a <form> element because it can sit inside a list. */
export const PlanForm = ({ vm, title }: { vm: SettingsVM; title: string }) => (
  <div className="rounded-lg border border-ember/40 bg-coal-900 p-4 sm:p-5">
    <h3 className="mb-4 font-display text-xl font-bold uppercase">{title}</h3>
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        label="Plan name"
        placeholder="e.g. Student Monthly"
        value={vm.planDraft.name}
        onChange={(e) => vm.updatePlanDraft('name', e.target.value)}
        error={vm.planErrors.name}
      />
      <TextField
        label="Full payment price (₱)"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={vm.planDraft.price}
        onChange={(e) => vm.updatePlanDraft('price', e.target.value)}
        error={vm.planErrors.price}
      />
      <div>
        <span className="mb-1.5 block text-sm font-medium text-steel">Duration</span>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            inputMode="numeric"
            aria-label="Duration amount"
            value={vm.planDraft.durationValue}
            onChange={(e) => vm.updatePlanDraft('durationValue', e.target.value)}
            className={`w-24 rounded-lg border bg-coal-800 px-4 py-3 text-base focus:border-ember focus:outline-none ${
              vm.planErrors.durationValue ? 'border-red-500' : 'border-coal-500'
            }`}
          />
          <select
            aria-label="Duration unit"
            value={vm.planDraft.durationUnit}
            onChange={(e) => vm.updatePlanDraft('durationUnit', e.target.value as DurationUnit)}
            className="flex-1 rounded-lg border border-coal-500 bg-coal-800 px-4 py-3 text-base focus:border-ember focus:outline-none"
          >
            <option value="days">Day(s)</option>
            <option value="months">Month(s)</option>
          </select>
        </div>
        {vm.planErrors.durationValue && <p className="mt-1.5 text-sm text-red-400">{vm.planErrors.durationValue}</p>}
      </div>
      <label className="flex items-center gap-3 self-end pb-3 text-sm">
        <input
          type="checkbox"
          checked={vm.planDraft.isActive}
          onChange={(e) => vm.updatePlanDraft('isActive', e.target.checked)}
          className="h-4 w-4 accent-[#f3efe6]"
        />
        Offer this plan
      </label>
      {canHaveMonthlyPrice(Number(vm.planDraft.durationValue), vm.planDraft.durationUnit) && (
        <div className="sm:col-span-2">
          <TextField
            label="Installment price per month (₱, optional)"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Leave empty for full payment only"
            value={vm.planDraft.monthlyPrice}
            onChange={(e) => vm.updatePlanDraft('monthlyPrice', e.target.value)}
            error={vm.planErrors.monthlyPrice}
            className="max-w-xs"
          />
          <p className="mt-1.5 text-xs text-steel">
            {Number(vm.planDraft.monthlyPrice) > 0
              ? `Installment: ₱${(Number(vm.planDraft.monthlyPrice) * Number(vm.planDraft.durationValue)).toLocaleString('en-PH')} in total over ${vm.planDraft.durationValue} months. `
              : ''}
            With an installment price, the member chooses full payment or installment when enrolled. A member who misses a month is paused until
            they pay.
          </p>
        </div>
      )}
    </div>
    <p className="mt-3 text-xs text-steel">Day plans count the start day: a 1-day pass is valid on that day only.</p>
    <div className="mt-5 flex gap-3">
      <Button type="button" onClick={vm.keepPlan}>
        Keep plan
      </Button>
      <Button type="button" variant="outline" onClick={vm.cancelPlanEdit}>
        Cancel
      </Button>
    </div>
  </div>
)
