import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'

interface Props {
  /** The machine the member tapped Report on; null when they used the general "Report a problem" link. */
  name: string | null
  onClose: () => void
}

/**
 * Members cannot change a machine's status themselves: only the front desk can, after checking it.
 * This tells them, kindly, who to tell so it gets fixed and the list stays accurate for everyone.
 */
export const ReportEquipmentDialog = ({ name, onClose }: Props) => (
  <Modal open title="Report a problem" onClose={onClose} footer={<Button onClick={onClose}>Got it</Button>}>
    <p>
      Thanks for letting us know{name ? (
        <>
          {' '}about the <strong className="text-zinc-100">{name}</strong>
        </>
      ) : null}
      !
    </p>
    <p className="mt-3">
      Please tell the <strong className="text-zinc-100">front desk</strong> so they can check it. Once they do, they will update its
      status here so every member knows whether it is safe to use.
    </p>
    <p className="mt-3 text-steel">If it looks unsafe, please don't use it until the staff has checked it.</p>
  </Modal>
)
