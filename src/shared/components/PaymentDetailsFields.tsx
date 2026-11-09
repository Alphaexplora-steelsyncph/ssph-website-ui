import { Paperclip, X } from 'lucide-react'
import type { PaymentMethod } from '../models/types'
import { TextField } from './TextField'

interface Props {
  paymentMethods: PaymentMethod[]
  method: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  needsReference: boolean
  referenceNo: string
  onReferenceNoChange: (value: string) => void
  referenceError?: string
  receiptFile: File | null
  onReceiptFileChange: (file: File | null) => void
}

/** Payment method, plus the reference number and e-receipt for non-cash payments. Renders grid cells (put it in a grid). */
export const PaymentDetailsFields = ({
  paymentMethods, method, onMethodChange, needsReference, referenceNo, onReferenceNoChange, referenceError, receiptFile, onReceiptFileChange,
}: Props) => (
  <>
    <div>
      <span className="mb-1.5 block text-sm font-medium text-steel">Payment method</span>
      <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2">
        {paymentMethods.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={method === m}
            onClick={() => onMethodChange(m)}
            className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
              method === m ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:border-steel hover:text-zinc-100'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>

    {needsReference && (
      <>
        <TextField
          label={`${method} reference no.`}
          autoComplete="off"
          placeholder="e.g. 1012 345 678901"
          value={referenceNo}
          onChange={(e) => onReferenceNoChange(e.target.value)}
          error={referenceError}
        />
        <div>
          <span className="mb-1.5 block text-sm font-medium text-steel">E-receipt screenshot (optional)</span>
          {receiptFile ? (
            <div className="flex items-center gap-3 rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-sm">
              <Paperclip size={16} className="shrink-0 text-ember" />
              <span className="truncate">{receiptFile.name}</span>
              <button type="button" onClick={() => onReceiptFileChange(null)} aria-label="Remove receipt" className="ml-auto text-steel hover:text-zinc-100">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-coal-500 bg-coal-900 px-4 py-3 text-sm text-steel hover:border-ember hover:text-zinc-100">
              <Paperclip size={16} />
              Attach the e-receipt
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => onReceiptFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      </>
    )}
  </>
)
