import { Info } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'

/** Cancellation is handled in person, so this only explains how to request it. */
export const CancelMembershipNotice = ({ gymName }: { gymName: string }) => {
  const [open, setOpen] = useState(false) // UI-local
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-red-400 underline-offset-4 hover:underline"
      >
        Cancel membership
      </button>

      <Modal
        open={open}
        title="Cancel membership"
        onClose={close}
        footer={<Button onClick={close}>I understand</Button>}
      >
        <p className="flex gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-ember" />
          <span>
            Membership cancellations are processed in person. Kindly inform a staff member at the front desk of{' '}
            <span className="font-semibold text-zinc-100">{gymName || 'your gym'}</span> so they can assist you with your
            request.
          </span>
        </p>
        <p className="mt-3 text-steel">
          Your membership will remain active until the staff has processed your cancellation.
        </p>
      </Modal>
    </>
  )
}
