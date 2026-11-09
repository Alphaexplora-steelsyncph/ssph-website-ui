import { Button } from './Button'
import { Modal } from './Modal'

interface Props {
  gymName: string
  periodLabel: string
  isSaving: boolean
  onConfirm: () => void
  onClose: () => void
}

/** Confirms switching "Paid for <month>" off, because it can trigger auto-suspension. */
export const MarkUnpaidModal = ({ gymName, periodLabel, isSaving, onConfirm, onClose }: Props) => (
  <Modal
    open
    title="Mark as unpaid?"
    onClose={onClose}
    footer={
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onConfirm}
          className="rounded-lg bg-red-500 px-5 py-3 font-display text-lg font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Mark unpaid'}
        </button>
      </>
    }
  >
    <p>
      The payment record for <span className="font-semibold text-zinc-100">{gymName}</span> · {periodLabel} will be removed.
      If the grace period has already passed, the gym is suspended right away.
    </p>
  </Modal>
)
