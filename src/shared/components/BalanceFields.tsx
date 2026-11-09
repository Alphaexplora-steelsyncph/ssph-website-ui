import { formatPeso } from '../utils/format'
import { todayISO } from '../utils/dates'
import { TextField } from './TextField'

interface Props {
  /** What is still unpaid (plan price minus amount paid). Nothing is shown when it is 0 or less. */
  balance: number
  keep: boolean
  onKeepChange: (keep: boolean) => void
  dueOn: string
  onDueOnChange: (dueOn: string) => void
  error?: string
}

/** Shown when the amount paid is below the plan price: keep the rest as a balance, with an optional due date. */
export const BalanceFields = ({ balance, keep, onKeepChange, dueOn, onDueOnChange, error }: Props) => {
  if (balance <= 0) return null
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
      <p className="text-sm font-semibold text-amber-300">{formatPeso(balance)} is still unpaid</p>
      <label className="mt-2 flex items-start gap-3 text-sm text-zinc-100">
        <input
          type="checkbox"
          checked={keep}
          onChange={(e) => onKeepChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#f3efe6]"
        />
        <span>
          Keep it as a balance to collect later
          <span className="block text-steel">
            {keep ? 'The member is marked with a pending balance until you record the payment.' : 'Leave unticked if this is a discount. The member will owe nothing.'}
          </span>
        </span>
      </label>
      {keep && (
        <TextField
          className="mt-3 sm:max-w-xs"
          label="Payment due on (optional)"
          type="date"
          min={todayISO()}
          value={dueOn}
          onChange={(e) => onDueOnChange(e.target.value)}
          error={error}
        />
      )}
    </div>
  )
}
