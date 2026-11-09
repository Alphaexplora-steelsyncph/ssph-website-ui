import { ClipboardList, History, House, Lock, ScanLine, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { FeatureKey } from '../features/featureCatalog'
import { useFeature } from '../features/useFeature'

const ITEMS: { to: string; label: string; icon: LucideIcon; end?: boolean; feature?: FeatureKey }[] = [
  { to: '/member', label: 'Home', icon: House, end: true },
  { to: '/member/scan', label: 'Check in', icon: ScanLine },
  { to: '/member/program', label: 'Program', icon: ClipboardList, feature: 'coach_app' },
  { to: '/member/visits', label: 'Visits', icon: History },
]

/** Add-ons the gym does not have keep their tab, with a lock (the page explains). */
const LockMark = ({ feature }: { feature?: FeatureKey }) => {
  const enabled = useFeature(feature ?? 'core')
  return feature && !enabled ? <Lock size={12} className="text-steel" aria-label="Not available at your gym" /> : null
}

/** Tab bar for the signed-in member area. "Check in" opens the full-screen camera scanner.
 * Profile is reached from the profile menu (name + avatar, top right). */
export const MemberNav = () => (
  <nav aria-label="Member navigation" className="border-b border-coal-600 bg-coal-900">
    <div className="mx-auto flex max-w-3xl gap-1 px-3">
      {ITEMS.map(({ to, label, icon: Icon, end, feature }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition sm:flex-none ${
              isActive ? 'border-ember text-ember' : 'border-transparent text-steel hover:text-zinc-100'
            }`
          }
        >
          <Icon size={18} className="shrink-0" /> <span className="text-xs sm:text-sm">{label}</span>
          <LockMark feature={feature} />
        </NavLink>
      ))}
    </div>
  </nav>
)
