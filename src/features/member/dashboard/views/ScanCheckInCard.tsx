import { ScanLine } from 'lucide-react'
import { Link } from 'react-router-dom'

/** Tapping opens the in-app camera scanner. */
export const ScanCheckInCard = () => (
  <Link
    to="/member/scan"
    className="group flex flex-col rounded-xl border border-ember/50 bg-ember/10 p-5 transition hover:border-ember hover:bg-ember/15 sm:p-6"
  >
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ember text-charcoal transition group-active:scale-95">
      <ScanLine size={30} />
    </span>
    <span className="mt-3 font-display text-2xl font-bold uppercase">Check in</span>
    <span className="mt-1 text-sm text-steel">Tap to open the camera and scan the QR at the gym entrance.</span>
  </Link>
)
