import { CalendarClock } from 'lucide-react'
import { FormCard } from '../../../../shared/components/FormCard'
import { TextField } from '../../../../shared/components/TextField'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { ordinal } from '../../../../shared/utils/memberDues'
import type { EnrollMemberVM } from '../viewModels/useEnrollMemberViewModel'

/**
 * Only for gyms with a fixed member payment day and a plan longer than one month:
 * how much the member pays for the days until that day. The plan itself starts on it.
 */
export const PaymentDayFields = ({ vm }: { vm: EnrollMemberVM }) => {
  if (!vm.aligned || !vm.paymentDayStart || !vm.coveredUntil || !vm.selectedPlan || !vm.memberDueDay) return null
  return (
    <FormCard step={3} title="Until the payment day">
      <div className="flex gap-3 rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-sm">
        <CalendarClock size={20} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
        <p className="text-steel">
          Members of your gym pay every <span className="font-semibold text-zinc-100">{ordinal(vm.memberDueDay)}</span>. The{' '}
          {vm.selectedPlan.name} plan starts on <span className="font-semibold text-zinc-100">{formatDate(vm.paymentDayStart)}</span>, and its{' '}
          {formatPeso(vm.selectedPlan.price)} is due that day. Today the member only pays for{' '}
          <span className="font-semibold text-zinc-100">
            {formatDate(vm.startDate)} – {formatDate(vm.coveredUntil)}
          </span>
          .
        </p>
      </div>
      <TextField
        label={`Amount for ${formatDate(vm.startDate)} – ${formatDate(vm.coveredUntil)} (₱)`}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={vm.periodAmount}
        onChange={(e) => vm.setPeriodAmount(e.target.value)}
        error={vm.fieldErrors.periodAmount}
        className="mt-5 sm:max-w-xs"
      />
    </FormCard>
  )
}
