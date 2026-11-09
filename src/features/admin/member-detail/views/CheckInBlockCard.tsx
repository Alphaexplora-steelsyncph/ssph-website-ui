import { Ban, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import type { MemberDetailVM } from '../viewModels/useMemberDetailViewModel'

/** Block / allow a member's check-in. Overdue balances are labeled; blocking is always the admin's decision. */
export const CheckInBlockCard = ({ vm }: { vm: MemberDetailVM }) => {
  const m = vm.member!
  const [reason, setReason] = useState(m.balanceOverdue ? 'Overdue balance' : '') // UI-local
  if (m.status === 'Terminated') return null
  return (
    <section className={`rounded-xl border p-5 sm:p-6 ${m.checkInBlocked ? 'border-red-500/40 bg-red-500/5' : 'border-coal-600 bg-coal-800'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase">Check-in</h2>
          {m.checkInBlocked ? (
            <p className="mt-1 text-sm text-red-300">
              <Ban size={14} className="mr-1 inline" aria-hidden="true" /> Blocked: {m.blockReason}. When they scan, they are told to see the front desk.
            </p>
          ) : (
            <p className="mt-1 text-sm text-steel">
              <ShieldCheck size={14} className="mr-1 inline text-emerald-400" aria-hidden="true" /> Allowed.
              {m.balanceOverdue && <span className="text-red-300"> This member has an overdue balance; you can block check-in until they pay.</span>}
            </p>
          )}
        </div>
        {vm.canEdit &&
          (m.checkInBlocked ? (
            <button
              type="button"
              onClick={() => vm.setBlocked(false)}
              disabled={vm.isBlocking}
              className="rounded-lg border border-emerald-500/50 px-3 py-1.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-60"
            >
              {vm.isBlocking ? 'Saving…' : 'Allow check-in'}
            </button>
          ) : (
            <button
              type="button"
              onClick={vm.openBlock}
              className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
            >
              Block check-in
            </button>
          ))}
      </div>
      {vm.blockError && !vm.blockOpen && <p role="alert" className="mt-2 text-sm text-red-300">{vm.blockError}</p>}
      {vm.blockOpen && (
        <Modal
          open
          title="Block check-in"
          onClose={vm.closeBlock}
          footer={
            <>
              <Button variant="outline" onClick={vm.closeBlock} disabled={vm.isBlocking}>
                Cancel
              </Button>
              <Button onClick={() => vm.setBlocked(true, reason.trim())} disabled={reason.trim().length < 3 || vm.isBlocking}>
                {vm.isBlocking ? 'Blocking…' : 'Block check-in'}
              </Button>
            </>
          }
        >
          <p>
            <span className="font-semibold text-zinc-100">{m.fullName}</span> will not be able to check in until you allow it again. When they scan,
            they are told to see the front desk.
          </p>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-steel">Reason (for your records)</span>
            <input
              value={reason}
              maxLength={200}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-zinc-100 focus:border-ember focus:outline-none"
            />
          </label>
          {vm.blockError && <p role="alert" className="mt-2 text-sm text-red-300">{vm.blockError}</p>}
        </Modal>
      )}
    </section>
  )
}
