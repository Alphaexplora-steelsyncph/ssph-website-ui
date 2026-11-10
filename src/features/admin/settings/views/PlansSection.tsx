import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import type { SettingsVM } from '../viewModels/useSettingsViewModel'
import { PlanForm } from './PlanForm'
import { PlanRow } from './PlanRow'

/** Plans: read-only outside edit mode; while editing, every change is kept locally until Done. */
export const PlansSection = ({ vm }: { vm: SettingsVM }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">Membership plans</h2>
        <p className="mt-1 text-sm text-steel">
          {vm.editing ? 'Turn plans on or off, change prices, or add your own. ' : ''}Only offered plans appear in Enroll.
        </p>
      </div>
      {vm.editing && vm.planEditing !== 'new' && (
        <Button type="button" variant="outline" onClick={vm.startAddPlan} className="shrink-0">
          <Plus size={18} /> Add plan
        </Button>
      )}
    </div>

    {vm.editing && vm.planEditing === 'new' && (
      <div className="mt-5">
        <PlanForm vm={vm} title="New plan" />
      </div>
    )}

    <ul className="mt-5 divide-y divide-coal-600 overflow-hidden rounded-lg border border-coal-600">
      {vm.plans.length === 0 && <li className="px-4 py-6 text-center text-sm text-steel">No plans yet. Add your first plan.</li>}
      {vm.plans.map((plan) =>
        vm.editing && vm.planEditing === plan.key ? (
          <li key={plan.key} className="p-4">
            <PlanForm vm={vm} title={`Edit ${plan.name}`} />
          </li>
        ) : (
          <PlanRow key={plan.key} plan={plan} vm={vm} />
        ),
      )}
    </ul>

    {vm.editing && vm.removedCount > 0 && (
      <p className="mt-3 text-sm text-red-400">
        {vm.removedCount} plan{vm.removedCount === 1 ? '' : 's'} will be deleted when you press Done.
      </p>
    )}
    {vm.offeredCount === 0 && vm.plans.length > 0 && (
      <p className="mt-3 text-sm text-amber-400">No plan is offered right now, so Enroll has nothing to choose from.</p>
    )}
  </section>
)
