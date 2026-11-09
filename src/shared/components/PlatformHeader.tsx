import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PERMISSIONS } from '../auth/permissions'
import { useAuth } from '../auth/useAuth'
import { Logo } from './Logo'
import { ProfileMenu, type ProfileMenuLink } from './ProfileMenu'

const LINKS: ProfileMenuLink[] = [
  { to: '/platform/settings', label: 'Platform settings', icon: Settings, permission: PERMISSIONS.PLATFORM_MANAGE_SETTINGS },
]

export const PlatformHeader = () => {
  const { user, loginPath, logout } = useAuth()
  const navigate = useNavigate()
  const signOut = () => {
    const destination = loginPath
    logout()
    navigate(destination, { replace: true })
  }
  return (
    <header className="relative z-30 border-b border-coal-600 bg-coal-900">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <Logo to="/platform" />
          <span className="hidden rounded border border-ember/50 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-ember sm:inline">
            Alphaexplora
          </span>
        </div>
        {user && <ProfileMenu name={user.fullName} email={user.email} links={LINKS} onSignOut={signOut} />}
      </div>
    </header>
  )
}
