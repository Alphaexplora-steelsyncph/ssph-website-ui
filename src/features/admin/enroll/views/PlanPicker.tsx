import { TextField } from '../../../../shared/components/TextField'
import { formatPeso } from '../../../../shared/utils/format'
import { offersMonthly, planTermLabel } from '../../../../shared/utils/planBilling'
import type { EnrollMemberVM } from '../viewModels/useEnrollMemberViewModel'
import { FormCard } from '../../../../shared/components/FormCard'
import { PaymentOptionFields } from '../../../../shared/components/PaymentOptionFields'

export const PlanPicker = ({ vm }: { vm: EnrollMemberVM }) => (
  <FormCard step={2} title="Plan">
    <div role="radiogroup" aria-label="Membership plan" className="grid gap-3 sm:grid-cols-2">
      {vm.isLoadingPlans && <p className="text-sm text-steel">Loading plans…</p>}
      {!vm.isLoadingPlans && vm.plans.length === 0 && (
        <p className="text-sm text-steel sm:col-span-2">
          Your gym has no plans on offer yet. Add one under Settings → Membership plans.
        </p>
      )}
      {vm.plans.map((p) => {
        const selected = vm.planId === p.id
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => vm.selectPlan(p.id)}
            className={`rounded-lg border p-4 text-left transition ${
              selected ? 'border-ember bg-ember/10' : 'border-coal-500 bg-coal-900 hover:border-steel'
            }`}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-display text-2xl font-bold uppercase">{p.name}</span>
              <span className={`font-semibold ${selected ? 'text-ember' : 'text-zinc-100'}`}>{formatPeso(p.price)}</span>
            </span>
            <span className="mt-1 block text-sm text-steel">{planTermLabel(p)}</span>
            {offersMonthly(p) && (
              <span className="mt-2 inline-block rounded-full bg-coal-700 px-2.5 py-0.5 text-xs font-semibold text-zinc-100">
                or {formatPeso(p.monthlyPrice!)}/month installment
              </span>
            )}
          </button>
        )
      })}
    </div>
    {vm.fieldErrors.plan && <p className="mt-2 text-sm text-red-400">{vm.fieldErrors.plan}</p>}

    <div className="mt-5">
      <PaymentOptionFields
        plan={vm.selectedPlan}
        option={vm.paymentOption}
        onOption={vm.setPaymentOption}
        months={vm.monthsNow}
        onMonths={vm.setMonthsNow}
        paidUntil={vm.paidUntil}
      />
    </div>

    <TextField
      label="Start date"
      type="date"
      value={vm.startDate}
      onChange={(e) => vm.setStartDate(e.target.value)}
      error={vm.fieldErrors.startDate}
      className="mt-5 sm:max-w-xs"
    />
  </FormCard>
)
