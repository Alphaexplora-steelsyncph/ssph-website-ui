import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../../../../shared/components/Logo'
import type { LandingVM } from '../viewModels/useLandingViewModel'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#faq', label: 'FAQ' },
]

/** Landing header: section links and the inquiry button. Logins live on each gym's own address, not here. */
export const LandingNav = ({ vm }: { vm: LandingVM }) => {
  const [menu, setMenu] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-coal-600/70 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Logo />
        <nav aria-label="Sections" className="ml-6 hidden items-center gap-7 text-sm text-steel lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={vm.goTo(l.href.slice(1))} className="hover:text-chalk">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {vm.isAuthenticated && (
            <Link to={vm.homePath} className="hidden px-3 py-2 text-sm font-semibold text-chalk sm:block">
              My dashboard
            </Link>
          )}
          <a href={vm.contactHref} onClick={vm.goTo('contact')} className="rounded-full bg-chalk px-4 py-2 font-display text-base uppercase tracking-wider text-ink hover:bg-ember-600">
            Inquire
          </a>
          <button type="button" onClick={() => setMenu((o) => !o)} aria-label="Menu" aria-expanded={menu} className="p-2 lg:hidden">
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menu && (
        <nav aria-label="Menu" className="border-t border-coal-600 bg-ink px-5 py-4 lg:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                setMenu(false)
                vm.goTo(l.href.slice(1))(e)
              }}
              className="block py-2.5 font-display text-2xl uppercase"
            >
              {l.label}
            </a>
          ))}
          {vm.isAuthenticated && (
            <Link to={vm.homePath} className="mt-3 inline-block rounded-full border border-coal-500 px-4 py-2 text-sm font-semibold">
              My dashboard
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
