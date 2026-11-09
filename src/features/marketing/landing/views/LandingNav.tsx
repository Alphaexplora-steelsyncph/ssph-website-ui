import { ChevronDown, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../../../../shared/components/Logo'
import type { LandingVM } from '../viewModels/useLandingViewModel'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#faq', label: 'FAQ' },
]

const LOGINS = [
  { to: '/login', label: 'Member' },
  { to: '/admin/login', label: 'Gym admin' },
  { to: '/coach/login', label: 'Coach' },
]

/** Landing header: section links, a "Log in" menu (member / admin / coach) and the inquiry button. */
export const LandingNav = ({ vm }: { vm: LandingVM }) => {
  const [menu, setMenu] = useState(false)
  const [logins, setLogins] = useState(false)
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
          {vm.isAuthenticated ? (
            <Link to={vm.homePath} className="hidden px-3 py-2 text-sm font-semibold text-chalk sm:block">
              My dashboard
            </Link>
          ) : (
            <div className="relative hidden sm:block">
              <button type="button" onClick={() => setLogins((o) => !o)} aria-expanded={logins} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold">
                Log in <ChevronDown size={14} />
              </button>
              {logins && (
                <>
                  <div className="fixed inset-0" onClick={() => setLogins(false)} aria-hidden="true" />
                  <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-coal-500 bg-coal-800 shadow-xl">
                    {LOGINS.map((l) => (
                      <Link key={l.to} to={l.to} className="block px-4 py-2.5 text-sm hover:bg-coal-700">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
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
          <p className="mt-3 border-t border-coal-600 pt-3 font-mono text-xs uppercase tracking-widest text-steel">Log in as</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(vm.isAuthenticated ? [{ to: vm.homePath, label: 'My dashboard' }] : LOGINS).map((l) => (
              <Link key={l.to} to={l.to} className="rounded-full border border-coal-500 px-4 py-2 text-sm font-semibold">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
