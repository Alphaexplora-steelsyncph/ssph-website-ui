import { InviteCard } from '../../../../shared/components/InviteCard'
import { Modal } from '../../../../shared/components/Modal'
import type { CoachesVM } from '../viewModels/useCoachesViewModel'

/** Shows the invite / password reset link right after it was created (it cannot be shown again). */
export const CoachLinkDialog = ({ vm }: { vm: CoachesVM }) => {
  const link = vm.link
  return (
    <Modal open={!!link} onClose={vm.closeLink} title={link?.kind === 'reset' ? 'Password reset link' : 'Coach invite link'} size="lg">
      {link && (
        <InviteCard
          token={link.token}
          email={link.email}
          title={link.kind === 'reset' ? `Reset link for ${link.fullName}` : `Invite for ${link.fullName}`}
          description={
            link.kind === 'reset'
              ? 'Send this to the coach. It works once and expires in 24 hours. Their clients and programs are not affected.'
              : `Send this to ${link.email} (Messenger, SMS…), or let them scan it. It expires in 14 days. Email sending is not connected yet.`
          }
        />
      )}
    </Modal>
  )
}
