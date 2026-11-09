import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import { PaymentDetailsFields } from '../../../../shared/components/PaymentDetailsFields'
import { TextField } from '../../../../shared/components/TextField'
import type { MemberRecord } from '../../../../shared/models/types'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { useCollectBalanceViewModel } from '../viewModels/useCollectBalanceViewModel'

interface Props {
  member: MemberRecord
  onClose: () => void
  onUpdated: (updated: MemberRecord) => void
}

/** Render it only while a member is selected, so the form starts fresh each time. */
export const CollectBalanceDialog = ({ member, onClose, onUpdated }: Props) => {
  const vm = useCollectBalanceViewModel(member, onUpdated)

  return (
    <Modal
      open
      size="lg"
      title="Collect balance"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={vm.isSubmitting}>Cancel</Button>
          <Button onClick={() => vm.submit()} disabled={vm.isSubmitting}>{vm.isSubmitting ? 'Saving…' : 'Record payment'}</Button>
        </>
      }
    >
      <form onSubmit={vm.submit} noValidate className="space-y-6">
        <div
          className={`rounded-lg border px-4 py-3 ${
            member.balanceUpcoming
              ? 'border-coal-500 bg-coal-900'
              : member.balanceOverdue
                ? 'border-red-500/40 bg-red-500/10'
                : 'border-amber-500/40 bg-amber-500/10'
          }`}
        >
          <p className="font-semibold text-zinc-100">{member.fullName}</p>
          <p className="mt-0.5 text-steel">
            {member.balanceUpcoming ? 'Plan payment' : 'Owes'} <span className="font-semibold text-zinc-100">{formatPeso(member.balanceDue)}</span>
            {member.balanceDueOn ? (
              <>
                {' '}· due {formatDate(member.balanceDueOn)}
                {member.balanceOverdue && <span className="ml-2 font-semibold text-red-400">Overdue</span>}
              </>
            ) : (
              ' · no due date set'
            )}
          </p>
        </div>

        {vm.error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Amount paid now (₱)"
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

        <div className="rounded-lg border border-coal-500 px-4 py-3">
          <p className="text-sm text-steel">
            {vm.remaining > 0 ? (
              <>After this payment <span className="font-semibold text-zinc-100">{formatPeso(vm.remaining)}</span> is still owed.</>
            ) : (
              <span className="font-semibold text-emerald-400">This clears the balance.</span>
            )}
          </p>
          {vm.remaining > 0 && (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <TextField
                className="sm:max-w-xs sm:flex-1"
                label="Payment due on"
                type="date"
                value={vm.dueOn}
                onChange={(e) => vm.setDueOn(e.target.value)}
                error={vm.fieldErrors.dueOn}
              />
              {vm.dueChanged && (
                <Button type="button" variant="outline" onClick={vm.saveDueDate} disabled={vm.isSavingDate || vm.isSubmitting}>
                  {vm.isSavingDate ? 'Saving…' : 'Save date only'}
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}
