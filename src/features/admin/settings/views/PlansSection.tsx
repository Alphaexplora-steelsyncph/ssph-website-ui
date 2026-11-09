import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { usePlansViewModel } from '../viewModels/usePlansViewModel'
import { PlanForm } from './PlanForm'
import { PlanRow } from './PlanRow'

/** Section that owns the plans ViewModel; rows and the form are presentational. */
export const PlansSection = () => {
  const vm = usePlansViewModel()

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase">Membership plans</h2>
          <p className="mt-1 text-sm text-steel">
            Turn plans on or off, change prices, or add your own. Only offered plans appear in Enroll.
          </p>
        </div>
        {vm.editing !== 'new' && (
          <Button type="button" variant="outline" onClick={vm.startAdd} className="shrink-0">
            <Plus size={18} /> Add plan
          </Button>
        )}
      </div>

      {vm.error && (
        <div role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {vm.error}
        </div>
      )}

      {vm.editing === 'new' && (
        <div className="mt-5">
          <PlanForm vm={vm} title="New plan" />
        </div>
      )}

      <ul className="mt-5 divide-y divide-coal-600 overflow-hidden rounded-lg border border-coal-600">
        {vm.isLoading && <li className="px-4 py-6 text-center text-sm text-steel">Loading plans…</li>}
        {!vm.isLoading && vm.plans.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-steel">No plans yet. Add your first plan.</li>
        )}
        {vm.plans.map((plan) =>
          vm.editing === plan.id ? (
            <li key={plan.id} className="p-4">
              <PlanForm vm={vm} title={`Edit ${plan.name}`} />
            </li>
          ) : (
            <PlanRow key={plan.id} plan={plan} vm={vm} />
          ),
        )}
      </ul>

      {!vm.isLoading && vm.offeredCount === 0 && vm.plans.length > 0 && (
        <p className="mt-3 text-sm text-amber-400">No plan is offered right now, so Enroll has nothing to choose from.</p>
      )}
    </section>
  )
}
