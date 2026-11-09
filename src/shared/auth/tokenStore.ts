import type { AuthSession } from '../models/types'

/**
 * In-memory holder for the active tokens.
 * Written only by AuthProvider (and by apiService after a silent refresh), read only by apiService.
 * Views and ViewModels never touch tokens.
 */
let activeToken: string | null = null
let activeRefreshToken: string | null = null
let onRefreshed: ((session: AuthSession) => void) | null = null
let onExpired: (() => void) | null = null

export const setAuthTokens = (token: string | null, refreshToken: string | null = null) => {
  activeToken = token
  activeRefreshToken = refreshToken
}

export const getAuthToken = () => activeToken
export const getRefreshToken = () => activeRefreshToken

/** AuthProvider registers these so a refreshed session is saved and an ended one logs out. */
export const setSessionListeners = (listeners: { refreshed: (session: AuthSession) => void; expired: () => void }) => {
  onRefreshed = listeners.refreshed
  onExpired = listeners.expired
}

export const notifySessionRefreshed = (session: AuthSession) => onRefreshed?.(session)
export const notifySessionExpired = () => onExpired?.()
