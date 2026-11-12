/**
 * Gym addresses: every gym lives at <slug>.<root domain> (e.g. iron-haven.steelsync.ph).
 * The main domain (steelsync.ph, www, localhost) is the marketing site + super admin.
 * In development, <slug>.localhost:5173 works the same way (browsers send *.localhost to this machine).
 * Keep RESERVED in sync with ssph-backend/src/shared/constants/subdomains.js.
 */
export const ROOT_DOMAIN = ((import.meta.env.VITE_ROOT_DOMAIN as string | undefined) || 'steelsync.ph').toLowerCase()

const RESERVED = [
  'www', 'app', 'api', 'admin', 'platform', 'coach', 'member', 'members', 'login', 'mail', 'email', 'inquire',
  'help', 'support', 'docs', 'blog', 'status', 'dev', 'staging', 'test', 'demo', 'static', 'assets', 'cdn',
]

const SLUG = /^[a-z0-9-]{3,40}$/

/** The gym slug from the address bar, or null on the main site. Pure function of the hostname. */
export const gymSlugFromHost = (hostname: string): string | null => {
  const host = hostname.toLowerCase()
  let sub: string | null = null
  if (host.endsWith('.localhost')) sub = host.slice(0, -'.localhost'.length)
  else if (host.endsWith(`.${ROOT_DOMAIN}`)) sub = host.slice(0, -(ROOT_DOMAIN.length + 1))
  if (!sub || sub.includes('.') || RESERVED.includes(sub) || !SLUG.test(sub)) return null
  return sub
}

/**
 * DEVELOPMENT ONLY: a phone on a tunnel (e.g. https://xxxx-5173.asse.devtunnels.ms) cannot use iron-haven.localhost,
 * so the gym is picked with ?gym=iron-haven instead. It is remembered for the tab, so links inside the app keep
 * working without the parameter; ?gym= (empty) goes back to the main site. Production builds ignore all of this:
 * there, the gym always comes from the address (iron-haven.steelsync.ph).
 */
const DEV_GYM_KEY = 'ssph.devGym'
const devGymSlug = (): string | null => {
  if (!import.meta.env.DEV) return null
  try {
    const param = new URLSearchParams(window.location.search).get('gym')
    if (param !== null) {
      const slug = param.trim().toLowerCase()
      if (slug && SLUG.test(slug) && !RESERVED.includes(slug)) sessionStorage.setItem(DEV_GYM_KEY, slug)
      else sessionStorage.removeItem(DEV_GYM_KEY)
    }
    return sessionStorage.getItem(DEV_GYM_KEY)
  } catch {
    return null
  }
}

/** The gym of the current address (null on the main site). Never changes while the page is open. */
export const currentGymSlug = (): string | null => {
  if (typeof window === 'undefined') return null
  return gymSlugFromHost(window.location.hostname) ?? devGymSlug()
}

/** Full address of a gym's own page, e.g. https://iron-haven.steelsync.ph (http://iron-haven.localhost:5173 in dev). */
export const gymSiteUrl = (slug: string) => {
  const { protocol, hostname, port } = window.location
  const local = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')
  // Development on a tunnel: the same address, with the gym picked by ?gym= (see devGymSlug).
  if (import.meta.env.DEV && !local && !hostname.endsWith(`.${ROOT_DOMAIN}`) && hostname !== ROOT_DOMAIN) {
    return `${protocol}//${window.location.host}/?gym=${encodeURIComponent(slug)}`
  }
  return local ? `${protocol}//${slug}.localhost${port ? `:${port}` : ''}` : `https://${slug}.${ROOT_DOMAIN}`
}

/** Shown in the UI, without the protocol: iron-haven.steelsync.ph */
export const gymSiteLabel = (slug: string) => `${slug}.${ROOT_DOMAIN}`

/** What the backend will turn a name or typed address into ("Iron Haven Gym!" → "iron-haven-gym"); for previews only. */
export const slugPreview = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .replace(/-$/, '') || 'your-gym'
