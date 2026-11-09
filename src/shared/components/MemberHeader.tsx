import { UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PERMISSIONS } from '../auth/permissions'
import { useAuth } from '../auth/useAuth'
import { Logo } from './Logo'
import { NotificationBell } from './NotificationBell'
import { ProfileMenu, type ProfileMenuLink } from './ProfileMenu'

const MEMBER_LINKS: ProfileMenuLink[] = [
  { to: '/member/profile', label: 'My profile', icon: UserRound, permission: PERMISSIONS.VIEW_OWN_PROFILE },
]

export const MemberHeader = () => {
  const { user, loginPath, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = () => {
    const destination = loginPath
    logout()
    navigate(destination, { replace: true })
  }

  return (
    <header className="relative z-30 border-b border-coal-600 bg-coal-900">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
        <Logo to="/member" />
        {user && (
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ProfileMenu name={user.fullName} email={user.email} links={MEMBER_LINKS} onSignOut={signOut} />
          </div>
        )}
      </div>
    </header>
  )
}
