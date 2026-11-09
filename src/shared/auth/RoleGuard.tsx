import type { ReactNode } from 'react'
import type { Role } from '../models/types'
import type { Permission } from './permissions'
import { useAuth } from './useAuth'

interface Props {
  requiredPermission?: Permission
  /** Reserved for layout shells. Feature Views should gate on permissions. */
  requiredRole?: Role
  fallback?: ReactNode
  children: ReactNode
}

/** Structural wrapper: renders children only when the signed-in user satisfies the requirement. */
export const RoleGuard = ({ requiredPermission, requiredRole, fallback = null, children }: Props) => {
  const { isAuthenticated, hasPermission, hasRole } = useAuth()
  const allowed =
    isAuthenticated &&
    (!requiredPermission || hasPermission(requiredPermission)) &&
    (!requiredRole || hasRole(requiredRole))
  return <>{allowed ? children : fallback}</>
}
