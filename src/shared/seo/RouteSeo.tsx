import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { currentGymSlug } from '../tenant/tenant'
import { FALLBACK_TITLE, INDEXABLE, OG_IMAGE, SITE_NAME, SITE_URL } from './seoConfig'

const upsert = (selector: string, create: () => HTMLElement, set: (el: HTMLElement) => void) => {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  set(el)
}
const meta = (attr: 'name' | 'property', key: string, content: string) =>
  upsert(
    `meta[${attr}="${key}"]`,
    () => {
      const m = document.createElement('meta')
      m.setAttribute(attr, key)
      return m
    },
    (el) => el.setAttribute('content', content),
  )
const canonical = (href: string) =>
  upsert(
    'link[rel="canonical"]',
    () => {
      const l = document.createElement('link')
      l.rel = 'canonical'
      return l
    },
    (el) => el.setAttribute('href', href),
  )

/**
 * Keeps <title>, description, canonical, Open Graph and robots in step with the current route.
 * Only the marketing page and the legal pages on the main domain are indexable; gym addresses, logins and every
 * signed-in area are "noindex, nofollow".
 */
export const RouteSeo = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const page = currentGymSlug() ? undefined : INDEXABLE[path]
    if (page) {
      const url = `${SITE_URL}${path === '/' ? '/' : path}`
      document.title = page.title
      meta('name', 'description', page.description)
      meta('name', 'robots', 'index, follow, max-image-preview:large')
      canonical(url)
      meta('property', 'og:title', page.title)
      meta('property', 'og:description', page.description)
      meta('property', 'og:url', url)
      meta('property', 'og:image', OG_IMAGE)
      meta('name', 'twitter:title', page.title)
      meta('name', 'twitter:description', page.description)
    } else {
      document.title = FALLBACK_TITLE
      meta('name', 'robots', 'noindex, nofollow')
      meta('property', 'og:title', SITE_NAME)
    }
  }, [pathname])
  return null
}
