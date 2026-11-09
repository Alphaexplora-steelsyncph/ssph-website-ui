/** Absolute links that are shared on paper, screens or by email. */
export const inviteLink = (token: string) => `${window.location.origin}/activate?token=${encodeURIComponent(token)}`

export const checkInLink = (gymSlug: string, token: string) =>
  `${window.location.origin}/check-in?gym=${encodeURIComponent(gymSlug)}&t=${encodeURIComponent(token)}`

/** Only same-site paths are allowed as a post-login redirect. */
export const safeNextPath = (next: string | null) =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : null

/**
 * Reads a scanned QR. Only the path and query matter, so a poster printed from another
 * address (e.g. localhost vs. the laptop's IP) still works in the in-app scanner.
 */
export const parseCheckInLink = (text: string): { gymSlug: string; token: string } | null => {
  try {
    const url = new URL(text.trim(), window.location.origin)
    const gymSlug = url.searchParams.get('gym')
    const token = url.searchParams.get('t')
    if (url.pathname.replace(/\/+$/, '') !== '/check-in' || !gymSlug || !token) return null
    return { gymSlug, token }
  } catch {
    return null
  }
}

export const checkInPath = (gymSlug: string, token: string) =>
  `/check-in?gym=${encodeURIComponent(gymSlug)}&t=${encodeURIComponent(token)}`
