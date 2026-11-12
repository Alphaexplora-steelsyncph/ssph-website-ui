import { Dumbbell } from 'lucide-react'
import { useState } from 'react'
import { Modal } from './Modal'

interface Props {
  name: string
  photoUrl?: string
  size?: 'sm' | 'md'
}

/**
 * Small square photo of a machine. Tap it to see it larger. Without a photo, a plain icon keeps the rows aligned.
 * Photos are about 512 px, so the larger view stays sharp without a second, bigger file.
 */
export const EquipmentPhoto = ({ name, photoUrl, size = 'sm' }: Props) => {
  const [open, setOpen] = useState(false)
  const box = size === 'md' ? 'size-14' : 'size-11'
  if (!photoUrl) {
    return (
      <span className={`${box} flex shrink-0 items-center justify-center rounded-lg bg-coal-900 text-coal-500`} aria-hidden="true">
        <Dumbbell size={size === 'md' ? 22 : 18} />
      </span>
    )
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View photo of ${name}`}
        className={`${box} shrink-0 overflow-hidden rounded-lg bg-coal-900 ring-ember focus-visible:outline-none focus-visible:ring-2`}
      >
        <img src={photoUrl} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
      </button>
      {open && (
        <Modal open title={name} onClose={() => setOpen(false)}>
          <img src={photoUrl} alt={`Photo of ${name}`} className="mx-auto aspect-square w-full max-w-sm rounded-xl object-cover" />
        </Modal>
      )}
    </>
  )
}
