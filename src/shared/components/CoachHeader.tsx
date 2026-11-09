import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Logo } from './Logo'
import { ProfileMenu } from './ProfileMenu'

/** Coach shell header: brand + gym name on the left, profile menu (Log out) on the right. */
export const CoachHeader = () => {
  const { user, loginPath, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = () => {
    const destination = loginPath
    logout()
    navigate(destination, { replace: true })
  }

  return (
    <header className="relative z-30 border-b border-coal-600 bg-coal-900">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo to="/coach" />
          {user?.gymName && (
            <span className="hidden truncate border-l border-coal-500 pl-3 text-sm text-steel sm:inline">
              {user.gymName} · <span className="text-ember">Coach</span>
            </span>
          )}
        </div>
        {user && <ProfileMenu name={user.fullName} email={user.email} links={[]} onSignOut={signOut} />}
      </div>
    </header>
  )
}
