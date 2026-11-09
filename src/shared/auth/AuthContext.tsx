import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMe, logout as logoutOnServer } from '../models/apiService'
import type { AuthSession } from '../models/types'
import { AuthContext } from './authContextValue'
import { getAuthToken, setAuthTokens, setSessionListeners } from './tokenStore'

const SESSION_KEY = 'ssph.session'
const STASH_KEY = 'ssph.session.platform' // platform session kept while viewing a gym

const loadSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const session = raw ? (JSON.parse(raw) as AuthSession) : null
    // Sessions saved by the old mock backend have no refresh token and a fake access token.
    if (session && session.token.startsWith('mock.')) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    setAuthTokens(session?.token ?? null, session?.refreshToken ?? null)
    return session
  } catch {
    return null
  }
}

const saveSession = (session: AuthSession | null) => {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage unavailable */
  }
}

/**
 * Global auth state + active tokens. Session persistence lives here, and only here.
 * apiService refreshes an expired access token by itself and tells this provider through the token store.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSessionState] = useState<AuthSession | null>(loadSession)

  const setSession = useCallback((next: AuthSession) => {
    setAuthTokens(next.token, next.refreshToken ?? null)
    setSessionState(next)
    saveSession(next)
  }, [])

  const clearLocal = useCallback(() => {
    setAuthTokens(null)
    setSessionState(null)
    saveSession(null)
    try {
      localStorage.removeItem(STASH_KEY)
    } catch {
      /* storage unavailable */
    }
  }, [])

  const logout = useCallback(() => {
    void logoutOnServer() // revokes the refresh token; local sign-out never waits for it
    clearLocal()
  }, [clearLocal])

  // Silent refresh keeps the session; a refresh that fails ends it.
  useEffect(() => {
    setSessionListeners({
      refreshed: (next) =>
        setSessionState((prev) => {
          const merged = { ...next, user: next.user ?? prev?.user }
          saveSession(merged)
          return merged
        }),
      expired: clearLocal,
    })
  }, [clearLocal])

  // On load, pick up changes made while away (gym renamed, features switched, account disabled).
  const [initialToken] = useState(getAuthToken)
  useEffect(() => {
    if (!initialToken) return
    fetchMe()
      .then((user) =>
        setSessionState((prev) => {
          if (!prev) return prev
          const merged = { ...prev, user }
          saveSession(merged)
          return merged
        }),
      )
      .catch((err: { code?: string }) => {
        if (err?.code === 'UNAUTHORIZED') clearLocal()
      })
  }, [initialToken, clearLocal])

  const beginImpersonation = useCallback(
    (next: AuthSession) => {
      try {
        if (session) localStorage.setItem(STASH_KEY, JSON.stringify(session))
      } catch {
        /* storage unavailable */
      }
      setSession(next)
    },
    [session, setSession],
  )

  const endImpersonation = useCallback(() => {
    let stashed: AuthSession | null = null
    try {
      const raw = localStorage.getItem(STASH_KEY)
      stashed = raw ? (JSON.parse(raw) as AuthSession) : null
      localStorage.removeItem(STASH_KEY)
    } catch {
      /* storage unavailable */
    }
    if (stashed) setSession(stashed)
    else clearLocal()
  }, [setSession, clearLocal])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      setSession,
      logout,
      beginImpersonation,
      endImpersonation,
    }),
    [session, setSession, logout, beginImpersonation, endImpersonation],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
