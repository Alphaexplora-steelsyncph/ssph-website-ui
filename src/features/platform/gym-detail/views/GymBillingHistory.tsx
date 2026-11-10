import { FileImage } from 'lucide-react'
import { useState } from 'react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import type { BillingPeriodRow } from '../../../../shared/models/types'
import { todayISO } from '../../../../shared/utils/dates'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { ordinal } from '../../../../shared/utils/memberDues'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'
import { VoidPaymentDialog } from './VoidPaymentDialog'

/** Month-by-month status of the gym's SteelSync bill. Payments are recorded with the form; a wrong one is voided here. */
export const GymBillingHistory = ({ vm }: { vm: GymDetailVM }) => {
  const gym = vm.gym!
  const [voiding, setVoiding] = useState<BillingPeriodRow | null>(null) // UI-local
  const today = todayISO()
  const staged = (period: string) => vm.stagedVoids.find((v) => v.period === period)

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">SteelSync billing</h2>
      <p className="mt-1 text-sm text-steel">Due every {ordinal(gym.billingDay)} of the month.</p>
      <ul className="mt-4 divide-y divide-coal-600 overflow-hidden rounded-lg border border-coal-600">
        {gym.billingHistory.map((row) => {
          const late = !row.paid && row.dueDate < today
          return (
            <li key={row.period} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{row.periodLabel}</p>
                <p className="text-xs text-steel">
                  {formatPeso(row.amount)} · due {formatDate(row.dueDate)}
                  {row.paid && row.paidOn && ` · paid ${formatDate(row.paidOn)}`}
                  {row.method && ` · ${row.method}`}
                  {row.referenceNo && ` · ref ${row.referenceNo}`}
                </p>
                {row.proofUrl && (
                  <a href={row.proofUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline">
                    <FileImage size={12} aria-hidden="true" /> View proof
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row.paid ? 'bg-emerald-500/15 text-emerald-400' : late ? 'bg-red-500/15 text-red-400' : 'bg-coal-600 text-steel'
                  }`}
                >
                  {row.paid ? 'Paid' : late ? 'Unpaid' : 'Not yet due'}
                </span>
                {staged(row.period) && (
                  <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300">Void on Save</span>
                )}
                {vm.editing && row.paid && gym.status !== 'Archived' && (
                  <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_BILLING}>
                    {staged(row.period) ? (
                      <button type="button" onClick={() => vm.undoVoid(row.period)} className="text-xs font-semibold text-steel hover:text-zinc-100">
                        Undo
                      </button>
                    ) : (
                      <button type="button" onClick={() => setVoiding(row)} className="text-xs font-semibold text-steel hover:text-red-400">
                        Void
                      </button>
                    )}
                  </RoleGuard>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {voiding && (
        <VoidPaymentDialog
          row={voiding}
          gymName={gym.name}
          isSaving={false}
          onConfirm={(reason) => {
            if (vm.voidPayment(voiding.period, reason)) setVoiding(null)
          }}
          onClose={() => setVoiding(null)}
        />
      )}
    </section>
  )
}
