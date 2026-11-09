import { CreditCard, Dumbbell, ScanLine, Settings, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { useAuth } from '../../../../shared/auth/useAuth'
import { useFeature } from '../../../../shared/features/useFeature'

export interface DashboardCard {
  key: string
  icon: LucideIcon
  label: string
  note: string
  /** Route to open. Omitted for screens that are not built yet. */
  to?: string
  /** Computed here from permissions, so the View never inspects roles. */
  available: boolean
  /** Add-on the gym does not have: the card still shows, with a lock, so they know it exists. */
  locked?: boolean
}

export const useAdminHomeViewModel = () => {
  const { user, hasPermission } = useAuth()
  const hasEquipment = useFeature('equipment_status')

  const cards: DashboardCard[] = [
    {
      key: 'members',
      icon: Users,
      label: 'Members',
      note: 'Details, renew, upgrade, balances and terminate',
      to: '/admin/members',
      available: hasPermission(PERMISSIONS.VIEW_MEMBERS),
    },
    { key: 'enroll', icon: UserPlus, label: 'Enroll', note: 'New members and walk-ins', to: '/admin/enroll', available: hasPermission(PERMISSIONS.ENROLL_MEMBERS) },
    {
      key: 'equipment',
      icon: Dumbbell,
      label: 'Equipment',
      note: hasEquipment ? 'Machine status members can see' : 'Add-on: show members which machines are working',
      to: '/admin/equipment',
      available: hasPermission(PERMISSIONS.VIEW_MEMBERS),
      locked: !hasEquipment,
    },
    {
      key: 'settings',
      icon: Settings,
      label: 'Settings',
      note: 'Gym name, check-in QR, plans and payment day',
      to: '/admin/settings',
      available: hasPermission(PERMISSIONS.MANAGE_SETTINGS),
    },
    {
      key: 'payments',
      icon: CreditCard,
      label: 'Payments',
      note: 'Every payment with receipts, totals and CSV',
      to: '/admin/payments',
      available: hasPermission(PERMISSIONS.APPROVE_PAYMENTS),
    },
    { key: 'visits', icon: ScanLine, label: 'Visits', note: 'Every check-in, by date or member', to: '/admin/visits', available: hasPermission(PERMISSIONS.VIEW_VISITS) },
  ]

  return { user, cards: cards.filter((c) => c.available) }
}
