/** Everything search engines see about the public pages, in one place. Keep SITE_URL in sync with the real domain. */
export const SITE_URL = 'https://steelsync.ph'
export const SITE_NAME = 'SteelSync PH'
export const OG_IMAGE = `${SITE_URL}/og-image.png`

export interface PageSeo {
  title: string
  description: string
}

/** Pages that should appear in search results (main domain only). Every other route is noindex. */
export const INDEXABLE: Record<string, PageSeo> = {
  '/': {
    title: 'Gym Management System in the Philippines | SteelSync PH',
    description:
      'SteelSync PH is gym management software for Philippine gyms: QR code check-in, membership tracking, GCash and cash payments, and coach programs. Inquire today.',
  },
  '/privacy': {
    title: 'Privacy Policy | SteelSync PH',
    description: 'How SteelSync PH, by ALPHAEXPLORA INC., collects, uses and protects personal data under the Data Privacy Act of 2012 (RA 10173).',
  },
  '/terms': {
    title: 'Terms of Service | SteelSync PH',
    description: 'The terms for using SteelSync PH, the gym management system by ALPHAEXPLORA INC.',
  },
}

export const FALLBACK_TITLE = 'SteelSync PH'
