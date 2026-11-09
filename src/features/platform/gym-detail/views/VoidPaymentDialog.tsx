import { useState } from 'react'
import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import type { BillingPeriodRow } from '../../../../shared/models/types'
import { formatPeso } from '../../../../shared/utils/format'

interface Props {
  row: BillingPeriodRow
  gymName: string
  isSaving: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

/** Voiding needs a reason; the month becomes unpaid and both entries stay in the payment log. */
export const VoidPaymentDialog = ({ row, gymName, isSaving, onConfirm, onClose }: Props) => {
  const [reason, setReason] = useState('')
  const valid = reason.trim().length >= 3
  return (
    <Modal
      open
      title={`Void ${row.periodLabel} payment`}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={() => onConfirm(reason.trim())} disabled={!valid || isSaving}>
            {isSaving ? 'Voiding…' : 'Void payment'}
          </Button>
        </>
      }
    >
      <p>
        The {formatPeso(row.amount)} payment from <span className="font-semibold text-zinc-100">{gymName}</span> for {row.periodLabel} will be
        voided and the month will be unpaid again (auto-suspend rules apply). It stays in the payment log.
      </p>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-steel">Reason</span>
        <textarea
          rows={2}
          maxLength={300}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Wrong amount, recorded for the wrong month"
          className="w-full rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-zinc-100 focus:border-ember focus:outline-none"
        />
      </label>
    </Modal>
  )
}
