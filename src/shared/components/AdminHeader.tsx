import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PERMISSIONS } from '../auth/permissions'
import { useAuth } from '../auth/useAuth'
import { useEndImpersonation } from '../hooks/useEndImpersonation'
import { Logo } from './Logo'
import { ProfileMenu, type ProfileMenuLink } from './ProfileMenu'

const ADMIN_LINKS: ProfileMenuLink[] = [
  { to: '/admin/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
]

/** Admin shell header: brand on the left, profile menu (Settings, Log out) on the right. */
export const AdminHeader = () => {
  const { user, loginPath, logout, isImpersonating } = useAuth()
  const navigate = useNavigate()
  const { exit } = useEndImpersonation()

  const signOut = () => {
    if (isImpersonating) {
      void exit() // "Log out" while viewing a gym returns to the platform instead
      return
    }
    const destination = loginPath
    logout()
    navigate(destination, { replace: true })
  }

  return (
    <header className="relative z-30 border-b border-coal-600 bg-coal-900">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo to="/admin" />
        {user && (
          <ProfileMenu
            name={user.fullName}
            email={user.email}
            links={ADMIN_LINKS}
            onSignOut={signOut}
          />
        )}
      </div>
    </header>
  )
}
