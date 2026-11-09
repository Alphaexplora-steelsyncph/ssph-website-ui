import { Modal } from '../../../../shared/components/Modal'
import { TextField } from '../../../../shared/components/TextField'
import type { CoachesVM } from '../viewModels/useCoachesViewModel'

export const InviteCoachDialog = ({ vm }: { vm: CoachesVM }) => (
  <Modal
    open={vm.inviteOpen}
    onClose={vm.closeInvite}
    title="Invite a coach"
    footer={
      <>
        <button type="button" onClick={vm.closeInvite} className="rounded-lg px-4 py-2.5 text-sm text-steel hover:text-zinc-100">
          Cancel
        </button>
        <button
          type="submit"
          form="invite-coach"
          disabled={vm.isInviting}
          className="rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold text-charcoal hover:bg-ember-600 disabled:opacity-60"
        >
          {vm.isInviting ? 'Creating…' : 'Create invite link'}
        </button>
      </>
    }
  >
    <p className="mb-4">The coach opens the link to set a password, then logs in at the coach login page. The email must not be used by another SteelSync login.</p>
    <form id="invite-coach" onSubmit={vm.submitInvite} noValidate className="space-y-4">
      {vm.inviteErrors.form && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300">{vm.inviteErrors.form}</p>}
      <TextField label="Full name" value={vm.fullName} onChange={(e) => vm.setFullName(e.target.value)} error={vm.inviteErrors.fullName} placeholder="e.g. Ana Cruz" />
      <TextField label="Email" type="email" value={vm.email} onChange={(e) => vm.setEmail(e.target.value)} error={vm.inviteErrors.email} placeholder="coach@email.com" />
    </form>
  </Modal>
)
