import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import { PaymentDetailsFields } from '../../../../shared/components/PaymentDetailsFields'
import { TextField } from '../../../../shared/components/TextField'
import type { MemberRecord } from '../../../../shared/models/types'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { monthsLabel } from '../../../../shared/utils/planBilling'
import { usePayInstallmentViewModel } from '../viewModels/usePayInstallmentViewModel'

interface Props {
  member: MemberRecord
  onClose: () => void
  onUpdated: (updated: MemberRecord) => void
}

/** Render it only while a member is selected, so the form starts fresh each time. */
export const PayInstallmentDialog = ({ member, onClose, onUpdated }: Props) => {
  const vm = usePayInstallmentViewModel(member, onUpdated)

  return (
    <Modal
      open
      size="lg"
      title="Record monthly payment"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={vm.isSubmitting}>Cancel</Button>
          <Button onClick={() => vm.submit()} disabled={vm.isSubmitting}>{vm.isSubmitting ? 'Saving…' : 'Record payment'}</Button>
        </>
      }
    >
      <form onSubmit={vm.submit} noValidate className="space-y-6">
        <div className="rounded-lg border border-coal-500 bg-coal-900 px-4 py-3">
          <p className="font-semibold text-zinc-100">{member.fullName}</p>
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <dt className="text-steel">Current plan</dt>
            <dd className="text-zinc-100">{member.plan} · {formatPeso(vm.perMonth)}/month</dd>
            <dt className="text-steel">Monthly payments</dt>
            <dd className="text-zinc-100">{vm.paid} of {vm.total} paid · {monthsLabel(vm.left)} left</dd>
            <dt className="text-steel">Paid until</dt>
            <dd className={member.status === 'Paused' ? 'font-semibold text-amber-400' : 'text-zinc-100'}>
              {member.paidUntil ? formatDate(member.paidUntil) : '—'}
              {member.status === 'Paused' && ` · paused, ${monthsLabel(vm.behind)} behind`}
            </dd>
            <dt className="text-steel">Plan ends</dt>
            <dd className="text-zinc-100">{formatDate(member.expiresAt)}</dd>
          </dl>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-steel">Months to pay</span>
            <select
              aria-label="Months to pay"
              value={vm.months}
              onChange={(e) => vm.setMonths(Number(e.target.value))}
              className="w-44 rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-zinc-100 focus:border-ember focus:outline-none"
            >
              {Array.from({ length: vm.left }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {monthsLabel(n)}
                </option>
              ))}
            </select>
          </label>
          <p className="pb-3 text-sm">
            {vm.newPaidUntil && (
              <>
                <span className="text-steel">Covered until </span>
                <span className={`font-semibold ${vm.stillPaused ? 'text-amber-400' : 'text-emerald-400'}`}>{formatDate(vm.newPaidUntil)}</span>
              </>
            )}
            {vm.stillPaused && <span className="block text-xs text-amber-400">Still paused: pay {monthsLabel(vm.behind)} to unpause.</span>}
          </p>
        </div>

        {vm.error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Amount paid (₱)"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={vm.amount}
            onChange={(e) => vm.setAmount(e.target.value)}
            error={vm.fieldErrors.amount}
          />
          <PaymentDetailsFields
            paymentMethods={vm.paymentMethods}
            method={vm.method}
            onMethodChange={vm.setMethod}
            needsReference={vm.needsReference}
            referenceNo={vm.referenceNo}
            onReferenceNoChange={vm.setReferenceNo}
            referenceError={vm.fieldErrors.referenceNo}
            receiptFile={vm.receiptFile}
            onReceiptFileChange={vm.setReceiptFile}
          />
        </div>
      </form>
    </Modal>
  )
}
