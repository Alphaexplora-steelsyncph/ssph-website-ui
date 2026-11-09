import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import type { Role } from '../models/types'

interface Props {
  role: Role
  redirectTo: string
}

/** Route-level guard used by App.tsx. Wrong role or signed out → redirect. */
export const ProtectedRoute = ({ role, redirectTo }: Props) => {
  const { hasRole } = useAuth()
  if (!hasRole(role)) return <Navigate to={redirectTo} replace />
  return <Outlet />
}
