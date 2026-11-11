import { Dumbbell, Settings, UserRound, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../shared/auth/useAuth'
import { PRODUCT_NAME } from '../../../shared/brand/product'
import { ApiError, fetchGymSite } from '../../../shared/models/apiService'
import type { GymSite } from '../../../shared/models/types'
import { ROOT_DOMAIN, gymSiteLabel } from '../../../shared/tenant/tenant'

export interface RoleChoice {
  role: GymSite['roles'][number]
  label: string
  to: string
  icon: LucideIcon
}

const CHOICES: RoleChoice[] = [
  { role: 'Member', label: 'Member', to: '/login', icon: UserRound },
  { role: 'Admin', label: 'Gym Admin', to: '/admin/login', icon: Settings },
  { role: 'Coach', label: 'Coach', to: '/coach/login', icon: Dumbbell },
]

/** "<slug>.steelsync.ph": the gym's own page. Pick who you are, then log in. Coach shows only with the Coach App. */
export const useGymPortalViewModel = (slug: string) => {
  const { user, homePath } = useAuth()
  const [site, setSite] = useState<GymSite | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGymSite(slug)
      .then(setSite)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not open this gym. Please try again.'))
  }, [slug])

  return {
    productName: PRODUCT_NAME,
    mainSite: `https://${ROOT_DOMAIN}`,
    address: gymSiteLabel(slug),
    isLoading: !site && !error,
    error,
    site,
    isOpen: site?.status === 'Active',
    choices: site ? CHOICES.filter((c) => site.roles.includes(c.role)) : [],
    /** Already signed in on this address: offer a shortcut to their own area. */
    signedIn: user ? { name: user.fullName, to: homePath } : null,
  }
}

export type GymPortalVM = ReturnType<typeof useGymPortalViewModel>
