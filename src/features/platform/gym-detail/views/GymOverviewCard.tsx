import type { ReactNode } from 'react'
import { Archive, Eye, PauseCircle, PlayCircle, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import { BillingStateText } from '../../../../shared/components/PlatformBadges'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'

type Confirm = null | 'suspend' | 'archive'

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <dt className="text-xs uppercase tracking-wider text-steel">{label}</dt>
    <dd className="mt-1 font-semibold">{children}</dd>
  </div>
)

export const GymOverviewCard = ({ vm }: { vm: GymDetailVM }) => {
  const gym = vm.gym!
  const [confirm, setConfirm] = useState<Confirm>(null) // UI-local
  const [note, setNote] = useState('')
  const archived = gym.status === 'Archived'

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <dl className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <Fact label="Package">{gym.packageName}</Fact>
        <Fact label="Members">
          {gym.activeMembers} active · {gym.totalMembers} total
          {gym.memberLimit !== null && <span className="block text-xs font-normal text-steel">Limit {gym.memberLimit}</span>}
        </Fact>
        <Fact label="SteelSync bill">
          <BillingStateText state={gym.billing.state} daysUntilDue={gym.billing.daysUntilDue} />
          <span className="block text-xs font-normal text-steel">
            {gym.billing.periodLabel} · {formatPeso(gym.billing.amountDue)} · due {formatDate(gym.billing.dueDate)}
          </span>
        </Fact>
        <Fact label="Auto-suspends on">
          {gym.billing.paid ? <span className="text-steel">—</span> : formatDate(gym.billing.suspendsOn)}
        </Fact>
      </dl>

      {gym.suspendReason === 'manual' && gym.suspendNote && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">Suspension note: {gym.suspendNote}</p>
      )}
      {gym.suspendReason === 'overdue' && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">
          Suspended automatically: {gym.billing.periodLabel} is unpaid past the grace period. Mark it paid to reactivate.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_IMPERSONATE}>
          <Button variant="outline" onClick={vm.viewAsGym} disabled={vm.busy === 'impersonate' || archived}>
            <Eye size={18} /> View as gym
          </Button>
        </RoleGuard>
        <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_GYMS}>
          {!archived &&
            (gym.suspendReason === 'manual' ? (
              <Button variant="outline" onClick={vm.liftSuspension} disabled={vm.busy === 'suspend'}>
                <PlayCircle size={18} /> Lift suspension
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setConfirm('suspend')}>
                <PauseCircle size={18} /> Suspend gym
              </Button>
            ))}
          {archived ? (
            <Button variant="outline" onClick={vm.restore} disabled={vm.busy === 'archive'}>
              <RotateCcw size={18} /> Restore gym
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setConfirm('archive')}>
              <Archive size={18} /> Archive
            </Button>
          )}
        </RoleGuard>
      </div>
      <p className="mt-3 text-xs text-steel">View as gym opens the gym's admin dashboard read only for 30 minutes and is recorded in the audit log.</p>

      <Modal
        open={confirm === 'suspend'}
        title="Suspend this gym?"
        onClose={() => setConfirm(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <button
              type="button"
              disabled={vm.busy === 'suspend'}
              onClick={async () => {
                await vm.suspend(note)
                setConfirm(null)
                setNote('')
              }}
              className="rounded-lg bg-red-500 px-5 py-3 font-display text-lg font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-60"
            >
              Suspend
            </button>
          </>
        }
      >
        <p>The gym admin will not be able to sign in and members will not be able to check in until you lift the suspension. Paying the bill does not lift a manual suspension.</p>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-steel">Reason (shown to Alphaexplora only)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            className="w-full rounded-lg border border-coal-500 bg-coal-900 px-3 py-2 text-sm focus:border-ember focus:outline-none" />
        </label>
      </Modal>

      <Modal
        open={confirm === 'archive'}
        title="Archive this gym?"
        onClose={() => setConfirm(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              disabled={vm.busy === 'archive'}
              onClick={async () => {
                await vm.archive()
                setConfirm(null)
              }}
            >
              Archive
            </Button>
          </>
        }
      >
        <p>Archived gyms disappear from billing and sign-up, and nobody at the gym can sign in. Its records are kept and you can restore it later.</p>
      </Modal>
    </section>
  )
}
