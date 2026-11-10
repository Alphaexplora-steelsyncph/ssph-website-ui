import { FormCard } from '../../../../shared/components/FormCard'
import { PaymentOptionFields } from '../../../../shared/components/PaymentOptionFields'
import { formatDate } from '../../../../shared/utils/format'
import { TextField } from '../../../../shared/components/TextField'
import type { AddExistingMemberVM } from '../viewModels/useAddExistingMemberViewModel'

export const ExistingMembershipFields = ({ vm }: { vm: AddExistingMemberVM }) => (
  <FormCard step={2} title="Current membership">
    <span className="mb-1.5 block text-sm font-medium text-steel">Current plan</span>
    <div role="radiogroup" aria-label="Current plan" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {vm.isLoadingPlans && <p className="text-sm text-steel">Loading plans…</p>}
      {vm.plans.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={vm.planId === p.id}
          onClick={() => vm.setPlan(p.id)}
          className={`rounded-lg border px-3 py-3 font-display text-lg font-bold uppercase transition ${
            vm.planId === p.id ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:border-steel hover:text-zinc-100'
          }`}
        >
          {p.name}
        </button>
      ))}
    </div>
    {vm.fieldErrors.plan && <p className="mt-1.5 text-sm text-red-400">{vm.fieldErrors.plan}</p>}

    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      <TextField label="Member since" type="date" max={vm.today} value={vm.memberSince}
        onChange={(e) => vm.setMemberSince(e.target.value)} error={vm.fieldErrors.memberSince} />
      <TextField label="Current plan ends on" type="date" min={vm.memberSince || undefined} value={vm.expiresAt}
        onChange={(e) => vm.setExpiresAt(e.target.value)} error={vm.fieldErrors.expiresAt} />
    </div>
    <div className="mt-5">
      <PaymentOptionFields
        plan={vm.selectedPlan}
        option={vm.paymentOption}
        onOption={vm.setPaymentOption}
        months={vm.monthsAlreadyPaid}
        onMonths={vm.setMonthsAlreadyPaid}
        paidUntil={vm.paidUntil}
        monthsMode="already"
      />
      {vm.installment && vm.termStart && (
        <p className="mt-2 text-xs text-steel">The installment plan is counted from {formatDate(vm.termStart)} to the end date above.</p>
      )}
    </div>
    {!vm.installment && (
    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      <TextField label="Still owes the gym (₱, optional)" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
        value={vm.balanceAmount} onChange={(e) => vm.setBalanceAmount(e.target.value)} error={vm.fieldErrors.balance} />
      {vm.owed > 0 && (
        <TextField label="Payment due on (optional)" type="date" min={vm.today} value={vm.balanceDueOn}
          onChange={(e) => vm.setBalanceDueOn(e.target.value)} error={vm.fieldErrors.dueOn} />
      )}
    </div>
    )}
    <p className="mt-4 text-sm text-steel">
      The end date is suggested from the plan and member-since date. Change it to match your records.
      {vm.status && (
        <>
          {' '}This member will show as{' '}
          <span className={vm.status === 'Active' ? 'font-semibold text-emerald-400' : vm.status === 'Paused' ? 'font-semibold text-orange-400' : 'font-semibold text-amber-400'}>{vm.status}</span>
          {vm.status === 'Paused' ? ' until the missed months are paid' : ''}.
        </>
      )}
    </p>
  </FormCard>
)
