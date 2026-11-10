import { CalendarDays, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { BalanceFields } from '../../../../shared/components/BalanceFields'
import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import { PaymentDetailsFields } from '../../../../shared/components/PaymentDetailsFields'
import { TextField } from '../../../../shared/components/TextField'
import type { MemberRecord } from '../../../../shared/models/types'
import { formatDate } from '../../../../shared/utils/format'
import { planPriceLabel, planTermLabel } from '../../../../shared/utils/planBilling'
import { PaymentOptionFields } from '../../../../shared/components/PaymentOptionFields'
import { UpgradeTimeline } from './UpgradeTimeline'
import { useReinstateMemberViewModel, type PlanDialogMode } from '../viewModels/useReinstateMemberViewModel'

interface Props {
  member: MemberRecord
  onClose: () => void
  onReinstated: (updated: MemberRecord) => void
  /** 'renew' for an expired member, 'upgrade' for an active one; 'reinstate' (default) for a terminated one. */
  mode?: PlanDialogMode
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-steel">{title}</h3>
    {children}
  </section>
)

/** Render it only while a member is selected, so the form starts fresh each time. */
export const ReinstateMemberDialog = ({ member, onClose, onReinstated, mode = 'reinstate' }: Props) => {
  const vm = useReinstateMemberViewModel(member, onReinstated, mode)
  const renewing = mode === 'renew'
  const upgrading = mode === 'upgrade'
  const copy = {
    reinstate: { title: 'Reinstate account', action: 'Reinstate member', busy: 'Reinstating…' },
    renew: { title: 'Renew membership', action: 'Renew membership', busy: 'Renewing…' },
    upgrade: { title: 'Upgrade plan', action: 'Upgrade plan', busy: 'Upgrading…' },
  }[mode]

  return (
    <Modal
      open
      size="lg"
      title={copy.title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={vm.isSubmitting}>Cancel</Button>
          <Button onClick={() => vm.submit()} disabled={vm.isSubmitting || vm.isLoadingPlans}>
            {vm.isSubmitting ? copy.busy : copy.action}
          </Button>
        </>
      }
    >
      <form onSubmit={vm.submit} noValidate className="space-y-6">
        <div className="rounded-lg border border-coal-500 bg-coal-900 px-4 py-3">
          <p className="font-semibold text-zinc-100">{member.fullName}</p>
          <p className="text-steel">
            {member.email || 'Walk-in · no email'} · {renewing
              ? `${member.plan} expired ${formatDate(member.expiresAt)}`
              : upgrading
                ? `On ${member.plan} · ${member.daysLeft === 0 ? 'ends today' : `ends in ${member.daysLeft} day${member.daysLeft === 1 ? '' : 's'}`}`
                : `was on ${member.plan}`}
          </p>
        </div>

        {vm.error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>
        )}

        <Section title="Membership plan">
          {vm.isLoadingPlans && <p className="text-steel">Loading plans…</p>}
          {!vm.isLoadingPlans && vm.plans.length === 0 && (
            <p className="text-steel">No plans on offer. Add one under Settings → Membership plans.</p>
          )}
          <div role="radiogroup" aria-label="Membership plan" className="grid gap-3 sm:grid-cols-2">
            {vm.plans.map((p) => {
              const selected = vm.planId === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => vm.selectPlan(p.id)}
                  className={`block w-full rounded-lg border px-4 py-3 text-left transition ${
                    selected ? 'border-ember bg-ember/10' : 'border-coal-500 bg-coal-900 hover:border-steel'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-semibold text-zinc-100">
                      {selected && <Check size={16} className="shrink-0 text-ember" aria-hidden="true" />}
                      {p.name}
                    </span>
                    <span className={`font-semibold ${selected ? 'text-ember' : 'text-zinc-100'}`}>{planPriceLabel(p)}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-steel">{planTermLabel(p)}</span>
                </button>
              )
            })}
          </div>
          {vm.fieldErrors.plan && <p className="mt-2 text-sm text-red-400">{vm.fieldErrors.plan}</p>}

          <div className="mt-4">
            <PaymentOptionFields
              plan={vm.selectedPlan}
              option={vm.paymentOption}
              onOption={vm.setPaymentOption}
              months={vm.monthsNow}
              onMonths={vm.setMonthsNow}
              paidUntil={vm.paidUntil}
            />
          </div>

          {upgrading ? (
            <UpgradeTimeline currentEnd={member.expiresAt} newStart={vm.expiryDate ? vm.startDate : null} newEnd={vm.expiryDate} />
          ) : (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-coal-500 px-4 py-3">
              <CalendarDays size={18} className="shrink-0 text-ember" aria-hidden="true" />
              {vm.expiryDate ? (
                <p className="text-steel">
                  Starts <span className="font-semibold text-zinc-100">today</span> · runs until{' '}
                  <span className="font-semibold text-zinc-100">{formatDate(vm.expiryDate)}</span>
                </p>
              ) : (
                <p className="text-steel">Choose a plan to see the new expiry date.</p>
              )}
            </div>
          )}
        </Section>

        <Section title="Payment">
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
          <div className="mt-4">
            <BalanceFields
              balance={vm.balanceLeft}
              keep={vm.keepBalance}
              onKeepChange={vm.setKeepBalance}
              dueOn={vm.dueOn}
              onDueOnChange={vm.setDueOn}
              error={vm.fieldErrors.dueOn}
            />
          </div>
        </Section>
      </form>
    </Modal>
  )
}
