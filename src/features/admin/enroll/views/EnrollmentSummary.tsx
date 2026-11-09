import { UserPlus } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import type { EnrollMemberVM } from '../viewModels/useEnrollMemberViewModel'

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 py-2 text-sm">
    <dt className="text-steel">{label}</dt>
    <dd className="text-right font-medium">{value}</dd>
  </div>
)

export const EnrollmentSummary = ({ vm }: { vm: EnrollMemberVM }) => {
  const amount = Number(vm.amountToPay)
  return (
    <aside className="h-fit rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6 xl:sticky xl:top-6">
      <h2 className="font-display text-2xl font-bold uppercase">Summary</h2>
      <dl className="mt-3 divide-y divide-coal-600">
        <Row label="Member" value={vm.fullName.trim() || '—'} />
        <Row label="Plan" value={vm.selectedPlan?.name ?? '—'} />
        {vm.aligned && vm.coveredUntil ? (
          <>
            <Row label="Paid days" value={`${formatDate(vm.startDate)} – ${formatDate(vm.coveredUntil)}`} />
            <Row label="Plan starts" value={formatDate(vm.planStart)} />
          </>
        ) : (
          <Row label="Starts" value={vm.startDate ? formatDate(vm.startDate) : '—'} />
        )}
        <Row label="Valid until" value={vm.expiryDate ? formatDate(vm.expiryDate) : '—'} />
        <Row label="Method" value={vm.method} />
      </dl>
      <div className="mt-3 flex items-baseline justify-between border-t border-coal-500 pt-4">
        <span className="text-steel">Amount paid</span>
        <span className="font-display text-3xl font-bold text-ember">
          {vm.amountToPay && Number.isFinite(amount) ? formatPeso(amount) : '—'}
        </span>
      </div>
      {vm.aligned && vm.selectedPlan && vm.paymentDayStart && (
        <div className="mt-3 flex items-baseline justify-between rounded-lg border border-coal-500 px-3 py-2">
          <span className="text-sm text-steel">Plan price · due {formatDate(vm.paymentDayStart)}</span>
          <span className="font-display text-xl font-bold text-zinc-100">{formatPeso(vm.selectedPlan.price)}</span>
        </div>
      )}
      {!vm.aligned && vm.selectedPlan && vm.amount && amount !== vm.selectedPlan.price && (
        <p className="mt-2 text-xs text-amber-400">List price is {formatPeso(vm.selectedPlan.price)}.</p>
      )}
      {vm.balanceLeft > 0 && vm.keepBalance && (
        <div className="mt-3 flex items-baseline justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2">
          <span className="text-sm text-amber-300">
            Balance{vm.dueOn ? ` · due ${formatDate(vm.dueOn)}` : ' · no due date'}
          </span>
          <span className="font-display text-xl font-bold text-amber-300">{formatPeso(vm.balanceLeft)}</span>
        </div>
      )}

      {vm.error && (
        <div role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {vm.error}
        </div>
      )}

      <Button type="submit" disabled={vm.isSubmitting} className="mt-5 w-full">
        {vm.isSubmitting ? 'Enrolling…' : (<>Enroll member <UserPlus size={18} /></>)}
      </Button>
      <p className="mt-3 text-center text-xs text-steel">Payments you record here are approved immediately.</p>
    </aside>
  )
}
