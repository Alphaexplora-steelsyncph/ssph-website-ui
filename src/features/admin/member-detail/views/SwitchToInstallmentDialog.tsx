import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import type { MemberRecord } from '../../../../shared/models/types'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { installmentTotal, monthsLabel } from '../../../../shared/utils/planBilling'
import { useSwitchToInstallmentViewModel } from '../viewModels/useSwitchToInstallmentViewModel'

interface Props {
  member: MemberRecord
  onClose: () => void
  onUpdated: (updated: MemberRecord) => void
}

export const SwitchToInstallmentDialog = ({ member, onClose, onUpdated }: Props) => {
  const vm = useSwitchToInstallmentViewModel(member, onUpdated)
  return (
    <Modal
      open
      size="lg"
      title="Switch to installment"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={vm.isSubmitting}>Cancel</Button>
          <Button onClick={vm.submit} disabled={!vm.available || vm.isSubmitting}>{vm.isSubmitting ? 'Saving…' : 'Switch to installment'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        {vm.isLoading && <p className="text-sm text-steel">Loading the plan…</p>}
        {!vm.isLoading && !vm.available && (
          <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {member.plan} has no installment price. Add one under Settings → Membership plans, or renew/upgrade the member onto a plan that has one.
          </p>
        )}
        {vm.available && vm.plan && (
          <>
            <div className="rounded-lg border border-coal-500 bg-coal-900 px-4 py-3">
              <p className="font-semibold text-zinc-100">{member.fullName}</p>
              <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <dt className="text-steel">Plan</dt>
                <dd className="text-zinc-100">{member.plan}</dd>
                <dt className="text-steel">Full payment</dt>
                <dd className="text-zinc-100">{formatPeso(vm.plan.price)}</dd>
                <dt className="text-steel">Installment</dt>
                <dd className="text-zinc-100">
                  {formatPeso(vm.plan.monthlyPrice!)}/month × {vm.plan.durationValue} = {formatPeso(installmentTotal(vm.plan))}
                </dd>
                <dt className="text-steel">Plan runs</dt>
                <dd className="text-zinc-100">{vm.termStart && formatDate(vm.termStart)} – {formatDate(member.expiresAt)}</dd>
              </dl>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-steel">Months already paid</span>
                <select
                  aria-label="Months already paid"
                  value={vm.monthsAlreadyPaid}
                  onChange={(e) => vm.setMonths(Number(e.target.value))}
                  className="w-44 rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-zinc-100 focus:border-ember focus:outline-none"
                >
                  {Array.from({ length: vm.plan.durationValue + 1 }, (_, n) => (
                    <option key={n} value={n}>{n === 0 ? 'None yet' : monthsLabel(n)}</option>
                  ))}
                </select>
              </label>
              {vm.paidUntil && (
                <p className="pb-3 text-sm">
                  <span className="text-steel">Covered until </span>
                  <span className={`font-semibold ${vm.pausedAfter ? 'text-orange-400' : 'text-emerald-400'}`}>{formatDate(vm.paidUntil)}</span>
                  {vm.pausedAfter && <span className="block text-xs text-orange-400">The member will be paused until the missed months are paid.</span>}
                </p>
              )}
            </div>
            <p className="text-xs text-steel">No payment is recorded here. Record the next months with “Pay for next payment due”.</p>
          </>
        )}
        {vm.error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}
      </div>
    </Modal>
  )
}
