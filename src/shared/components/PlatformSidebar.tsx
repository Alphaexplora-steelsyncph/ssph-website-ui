import { Building2, LayoutDashboard, Package, ReceiptText, ScrollText, Settings, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { PERMISSIONS, type Permission } from '../auth/permissions'
import { RoleGuard } from '../auth/RoleGuard'

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean; permission: Permission }[] = [
  { to: '/platform', label: 'Overview', icon: LayoutDashboard, end: true, permission: PERMISSIONS.PLATFORM_VIEW },
  { to: '/platform/gyms', label: 'Gyms', icon: Building2, permission: PERMISSIONS.PLATFORM_VIEW },
  { to: '/platform/billing', label: 'Billing', icon: ReceiptText, permission: PERMISSIONS.PLATFORM_MANAGE_BILLING },
  { to: '/platform/packages', label: 'Packages', icon: Package, permission: PERMISSIONS.PLATFORM_VIEW },
  { to: '/platform/audit', label: 'Audit log', icon: ScrollText, permission: PERMISSIONS.PLATFORM_VIEW_AUDIT },
  { to: '/platform/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PLATFORM_MANAGE_SETTINGS },
]

export const PlatformSidebar = () => (
  <nav
    aria-label="Platform navigation"
    className="flex gap-1 overflow-x-auto border-b border-coal-600 bg-coal-900 px-3 py-2 lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-6"
  >
    {NAV.map(({ to, label, icon: Icon, end, permission }) => (
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
        </NavLink>
      </RoleGuard>
    ))}
  </nav>
)
