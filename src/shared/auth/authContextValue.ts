import { createContext } from 'react'
import type { AuthSession, User } from '../models/types'

export interface AuthContextValue {
  user: User | null
  token: string | null
  setSession: (session: AuthSession) => void
  logout: () => void
  /** Super admin "View as gym": keeps the platform session aside and switches to the read-only one. */
  beginImpersonation: (session: AuthSession) => void
  /** Restores the platform session. */
  endImpersonation: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
