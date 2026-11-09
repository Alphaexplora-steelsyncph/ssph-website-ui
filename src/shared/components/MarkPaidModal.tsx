import { useState } from 'react'
import type { MarkPaidDetails, PaymentMethod } from '../models/types'
import { formatPeso } from '../utils/format'
import { Button } from './Button'
import { Modal } from './Modal'
import { TextField } from './TextField'

const METHODS: PaymentMethod[] = ['Cash', 'GCash', 'Maya', 'Bank Transfer']

interface Props {
  open: boolean
  gymName: string
  periodLabel: string
  defaultAmount: number
  isSaving: boolean
  onConfirm: (details: MarkPaidDetails) => void
  onClose: () => void
}

/**
 * Optional payment details when switching "Paid for <month>" on. Everything can be left as is.
 * Render it only while open (or give it a key) so the fields start fresh each time.
 */
export const MarkPaidModal = ({ open, gymName, periodLabel, defaultAmount, isSaving, onConfirm, onClose }: Props) => {
  const [amount, setAmount] = useState(String(defaultAmount))
  const [method, setMethod] = useState<PaymentMethod | ''>('')
  const [referenceNo, setReferenceNo] = useState('')

  const parsed = Number(amount)
  const valid = amount !== '' && Number.isFinite(parsed) && parsed >= 0

  return (
    <Modal
      open={open}
      title={`Paid for ${periodLabel}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid || isSaving}
            onClick={() => onConfirm({ amount: parsed, method: method || undefined, referenceNo: referenceNo || undefined })}
          >
            {isSaving ? 'Saving…' : 'Mark as paid'}
          </Button>
        </>
      }
    >
      <p>
        Record <span className="font-semibold text-zinc-100">{gymName}</span> as paid for {periodLabel}. Details are optional.
      </p>
      <div className="mt-4 space-y-4">
        <TextField label={`Amount (default ${formatPeso(defaultAmount)})`} type="number" min="0" step="0.01" value={amount}
          onChange={(e) => setAmount(e.target.value)} />
        <div>
          <span className="mb-1.5 block text-sm font-medium text-steel">Method (optional)</span>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button key={m} type="button" aria-pressed={method === m} onClick={() => setMethod(method === m ? '' : m)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${method === m ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:text-zinc-100'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <TextField label="Reference no. (optional)" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
      </div>
    </Modal>
  )
}
