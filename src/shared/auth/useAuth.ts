import { useCallback, useContext } from 'react'
import type { Role } from '../models/types'
import { AuthContext } from './authContextValue'
import type { Permission } from './permissions'

/** Pure helpers so ViewModels can route right after a login, before context state updates. */
export const homePathFor = (role?: Role) =>
  role === 'SuperAdmin' ? '/platform' : role === 'Admin' ? '/admin' : role === 'Coach' ? '/coach' : '/member'

export const loginPathFor = (role?: Role) =>
  role === 'SuperAdmin' ? '/platform/login' : role === 'Admin' ? '/admin/login' : role === 'Coach' ? '/coach/login' : '/login'

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  const { user, token, setSession, logout, beginImpersonation, endImpersonation } = ctx

  const hasPermission = useCallback(
    (permission: Permission) => !!user?.permissions.includes(permission),
    [user],
  )

  /** For route guards and layout shells only. Feature Views must use permissions instead. */
  const hasRole = useCallback((role: Role) => user?.role === role, [user])

  return {
    user,
    token,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    /** Where this user's workspace lives. Lets shared components adapt without checking roles. */
    homePath: homePathFor(user?.role),
    loginPath: loginPathFor(user?.role),
    isImpersonating: !!user?.impersonation,
    setSession,
    logout,
    beginImpersonation,
    endImpersonation,
  }
}
