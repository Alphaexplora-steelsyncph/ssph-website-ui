import { ClipboardList, CreditCard, Dumbbell, LayoutDashboard, Lock, ScanLine, Settings, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { PERMISSIONS, type Permission } from '../auth/permissions'
import { RoleGuard } from '../auth/RoleGuard'
import type { FeatureKey } from '../features/featureCatalog'
import { useFeature } from '../features/useFeature'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  permission?: Permission
  /** Add-on feature the gym must have (Equipment Status…). */
  feature?: FeatureKey
}

/** Links are gated by fine-grained permissions, not roles. */
const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/members', label: 'Members', icon: Users, permission: PERMISSIONS.VIEW_MEMBERS },
  { to: '/admin/enroll', label: 'Enroll', icon: UserPlus, permission: PERMISSIONS.ENROLL_MEMBERS },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard, permission: PERMISSIONS.APPROVE_PAYMENTS },
  { to: '/admin/visits', label: 'Visits', icon: ScanLine, permission: PERMISSIONS.VIEW_VISITS },
  { to: '/admin/equipment', label: 'Equipment', icon: Dumbbell, permission: PERMISSIONS.VIEW_MEMBERS, feature: 'equipment_status' },
  { to: '/admin/coaches', label: 'Coaches', icon: ClipboardList, permission: PERMISSIONS.VIEW_MEMBERS, feature: 'coach_app' },
  { to: '/admin/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
]

/** A small lock on links to add-ons the gym does not have (the page explains how to get it). */
const LockMark = ({ feature }: { feature?: FeatureKey }) => {
  const enabled = useFeature(feature ?? 'core')
  return feature && !enabled ? <Lock size={14} className="ml-auto text-steel" aria-label="Not on your plan" /> : null
}

export const AdminSidebar = () => (
  <nav
    aria-label="Admin navigation"
    className="flex gap-1 overflow-x-auto border-b border-coal-600 bg-coal-900 px-3 py-2 lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-6"
  >
    {NAV_ITEMS.map(({ to, label, icon: Icon, end, permission, feature }) => (
      <RoleGuard key={to} requiredPermission={permission}>
        <NavLink
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-ember/15 text-ember' : 'text-steel hover:bg-coal-700 hover:text-zinc-100'
            }`
          }
        >
          <Icon size={18} /> {label}
          <LockMark feature={feature} />
        </NavLink>
      </RoleGuard>
    ))}
  </nav>
)
