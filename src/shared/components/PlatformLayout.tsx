import { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useIdleLogout } from '../hooks/useIdleLogout'
import { PlatformHeader } from './PlatformHeader'
import { PlatformSidebar } from './PlatformSidebar'

/** Super admin shell. Signs out after the idle timeout set in Platform Settings. */
const PlatformLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const onIdle = useCallback(() => {
    logout()
    navigate('/platform/login?reason=idle', { replace: true })
  }, [logout, navigate])
  useIdleLogout(user?.idleTimeoutMinutes, onIdle)

  return (
    <div className="flex min-h-screen flex-col">
      <PlatformHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <PlatformSidebar />
        <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PlatformLayout
