import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

/** Accessible dialog: Esc and backdrop click close it, focus moves in and returns to the trigger. */
export const Modal = ({ open, title, onClose, children, footer, size = 'md' }: Props) => {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  // Callers often pass a new onClose on every render (e.g. `() => setOpen(false)`). Keeping it in a ref means the
  // effect below runs only when the dialog opens or closes. Otherwise every keystroke in a field re-ran it, which
  // moved focus back to the panel and kicked the cursor out of the textbox after each letter.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current()
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col ${size === 'lg' ? 'max-w-xl' : 'max-w-md'} rounded-2xl border border-coal-500 bg-coal-800 shadow-2xl shadow-black/60 focus:outline-none`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded p-1 text-steel hover:bg-coal-700 hover:text-zinc-100"
        >
          <X size={18} />
        </button>
        <h2 id={titleId} className="shrink-0 px-6 pb-1 pr-14 pt-6 font-display text-3xl font-extrabold uppercase leading-tight">
          {title}
        </h2>
        {/* Only the middle scrolls on small screens: the title and the buttons stay in view. */}
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-6 pb-1 text-sm leading-relaxed text-zinc-300">{children}</div>
        {footer && <div className="flex shrink-0 flex-col-reverse gap-3 px-6 pb-6 pt-5 sm:flex-row sm:justify-end">{footer}</div>}
        {!footer && <div className="h-5 shrink-0" />}
      </div>
    </div>
  )
}
