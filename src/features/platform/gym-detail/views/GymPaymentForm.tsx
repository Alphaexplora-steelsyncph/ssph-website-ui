import { Paperclip, X } from 'lucide-react'
import { useEffect } from 'react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import { useGymPaymentFormViewModel } from '../viewModels/useGymPaymentFormViewModel'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'

const label = 'mb-1.5 block text-sm font-medium text-steel'
const input =
  'w-full rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-zinc-100 focus:border-ember focus:outline-none disabled:opacity-60'

/** Record the gym's SteelSync payment. Owns the form ViewModel; keyed by the parent so it starts fresh after saving. */
const Form = ({ vm }: { vm: GymDetailVM }) => {
  const f = useGymPaymentFormViewModel(vm, vm.payFor)

  if (f.periods.length === 0) {
    return <p className="mt-4 text-sm text-steel">Every open month is paid. Nothing to record right now.</p>
  }

  return (
    <form onSubmit={f.submit} noValidate className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Paid for month</span>
          <select
            aria-label="Paid for month"
            value={f.period}
            onChange={(e) => f.setPeriod(e.target.value)}
            disabled={f.disabled}
            className={input}
          >
            {f.periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {f.errors.period && <span className="mt-1 block text-sm text-red-400">{f.errors.period}</span>}
        </label>
        <TextField
          label="Amount paid (₱)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={f.amount}
          onChange={(e) => f.setAmount(e.target.value)}
          error={f.errors.amount}
          disabled={f.disabled}
        />
      </div>

      <div>
        <span className={label}>Mode of payment</span>
        <div role="radiogroup" aria-label="Mode of payment" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {f.methods.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={f.method === m}
              disabled={f.disabled}
              onClick={() => f.setMethod(m)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                f.method === m ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:border-steel hover:text-zinc-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={f.method === 'Cash' ? 'Reference / OR no. (optional)' : `${f.method} reference no.`}
          autoComplete="off"
          value={f.referenceNo}
          onChange={(e) => f.setReferenceNo(e.target.value)}
          error={f.errors.referenceNo}
          disabled={f.disabled}
        />
        <TextField
          label="Date paid"
          type="date"
          value={f.paidOn}
          onChange={(e) => f.setPaidOn(e.target.value)}
          error={f.errors.paidOn}
          disabled={f.disabled}
        />
      </div>

      <div>
        <span className={label}>Proof of payment</span>
        {f.proof ? (
          <div className="flex items-center gap-3 rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-sm">
            <Paperclip size={16} className="shrink-0 text-ember" />
            <span className="truncate">{f.proof.name}</span>
            <button
              type="button"
              onClick={() => f.setProof(null)}
              aria-label="Remove proof"
              className="ml-auto text-steel hover:text-zinc-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-coal-500 bg-coal-900 px-4 py-3 text-sm text-steel hover:border-ember hover:text-zinc-100">
            <Paperclip size={16} />
            Attach the screenshot or photo the gym sent (JPG, PNG or WebP)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              data-testid="proof-input"
              disabled={f.disabled}
              onChange={(e) => f.setProof(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      <label className="block">
        <span className={label}>Notes (optional)</span>
        <textarea
          rows={2}
          maxLength={300}
          value={f.notes}
          onChange={(e) => f.setNotes(e.target.value)}
          disabled={f.disabled}
          placeholder="e.g. Paid by the owner, sent via Messenger"
          className={input}
        />
      </label>

      <Button type="submit" disabled={f.isSaving || f.disabled} className="w-full sm:w-auto">
        {f.isSaving ? 'Saving…' : 'Record payment'}
      </Button>
      {f.disabled && <p className="text-xs text-steel">Restore the gym to record payments.</p>}
    </form>
  )
}

export const GymPaymentForm = ({ vm }: { vm: GymDetailVM }) => {
  // Opened from "Record payment" in the Gyms list / Billing page: bring the form into view.
  useEffect(() => {
    if (!vm.payFor) return
    // After the layout's scroll-to-top on navigation, which runs after this child effect.
    const t = window.setTimeout(() => document.getElementById('record-payment')?.scrollIntoView({ block: 'start' }), 50)
    return () => window.clearTimeout(t)
  }, [vm.payFor])
  return (
    <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_BILLING}>
      <section id="record-payment" className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-bold uppercase">Record a payment</h2>
        <p className="mt-1 text-sm text-steel">The gym's SteelSync bill. Each payment is added to the payment log below.</p>
        <Form key={vm.gym!.paymentLog.length} vm={vm} />
      </section>
    </RoleGuard>
  )
}
