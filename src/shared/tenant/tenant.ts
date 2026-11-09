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

/** The gym of the current address (null on the main site). Never changes while the page is open. */
export const currentGymSlug = (): string | null => (typeof window === 'undefined' ? null : gymSlugFromHost(window.location.hostname))

/** Full address of a gym's own page, e.g. https://iron-haven.steelsync.ph (http://iron-haven.localhost:5173 in dev). */
export const gymSiteUrl = (slug: string) => {
  const { protocol, hostname, port } = window.location
  const local = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')
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
