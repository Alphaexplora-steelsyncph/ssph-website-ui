import { Paperclip, X } from 'lucide-react'
import { TextField } from '../../../../shared/components/TextField'
import type { EnrollMemberVM } from '../viewModels/useEnrollMemberViewModel'
import { BalanceFields } from '../../../../shared/components/BalanceFields'
import { FormCard } from '../../../../shared/components/FormCard'
import { formatPeso } from '../../../../shared/utils/format'

export const PaymentFields = ({ vm }: { vm: EnrollMemberVM }) => (
  <FormCard step={vm.aligned ? 4 : 3} title="Payment">
    <div className="grid gap-5 sm:grid-cols-2">
      {vm.aligned ? (
        <div>
          <span className="mb-1.5 block text-sm font-medium text-steel">Amount to pay now</span>
          <p data-testid="amount-to-pay" className="rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 font-semibold text-zinc-100">
            {vm.periodAmount && Number(vm.periodAmount) > 0 ? formatPeso(Number(vm.periodAmount)) : '—'}
          </p>
          <span className="mt-1 block text-xs text-steel">From step 3. The plan price is collected on the payment day.</span>
        </div>
      ) : (
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
      )}

      <div>
        <span className="mb-1.5 block text-sm font-medium text-steel">Payment method</span>
        <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2">
          {vm.paymentMethods.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={vm.method === m}
              onClick={() => vm.setMethod(m)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                vm.method === m ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:border-steel hover:text-zinc-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {vm.needsReference && (
        <>
          <TextField
            label={`${vm.method} reference no.`}
            autoComplete="off"
            placeholder="e.g. 1012 345 678901"
            value={vm.referenceNo}
            onChange={(e) => vm.setReferenceNo(e.target.value)}
            error={vm.fieldErrors.referenceNo}
          />

          <div>
            <span className="mb-1.5 block text-sm font-medium text-steel">E-receipt screenshot (optional)</span>
            {vm.receiptFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-sm">
                <Paperclip size={16} className="shrink-0 text-ember" />
                <span className="truncate">{vm.receiptFile.name}</span>
                <button type="button" onClick={() => vm.setReceiptFile(null)} aria-label="Remove receipt" className="ml-auto text-steel hover:text-zinc-100">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-coal-500 bg-coal-900 px-4 py-3 text-sm text-steel hover:border-ember hover:text-zinc-100">
                <Paperclip size={16} />
                Attach the customer's e-receipt
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => vm.setReceiptFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>
        </>
      )}
    </div>

    {vm.balanceLeft > 0 && (
      <div className="mt-5">
        <BalanceFields
          balance={vm.balanceLeft}
          keep={vm.keepBalance}
          onKeepChange={vm.setKeepBalance}
          dueOn={vm.dueOn}
          onDueOnChange={vm.setDueOn}
          error={vm.fieldErrors.dueOn}
        />
      </div>
    )}

    <label className={`mt-5 flex items-start gap-3 text-sm ${vm.startsToday ? 'text-zinc-100' : 'text-steel'}`}>
      <input
        type="checkbox"
        checked={vm.logFirstVisit && vm.startsToday}
        disabled={!vm.startsToday}
        onChange={(e) => vm.setLogFirstVisit(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#f3efe6]"
      />
      <span>
        Log today's visit now
        <span className="block text-steel">
          {vm.startsToday ? 'They are at the desk, so no need to scan the QR this time.' : 'Only available when the plan starts today.'}
        </span>
      </span>
    </label>
  </FormCard>
)
