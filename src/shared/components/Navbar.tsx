import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Logo } from './Logo'

/** Adaptive: signed-in users get a link to their own workspace instead of the login entry points. */
export const Navbar = () => {
  const { isAuthenticated, homePath } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-coal-600 bg-charcoal/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-steel md:flex">
          <a href="/#features" className="hover:text-zinc-100">Features</a>
          <a href="/#how-it-works" className="hover:text-zinc-100">How it works</a>
          {!isAuthenticated && <Link to="/admin/login" className="hover:text-zinc-100">Gym admin</Link>}
        </nav>
        <Link
          to={isAuthenticated ? homePath : '/login'}
          className="rounded-lg bg-ember px-4 py-2 font-display text-base font-bold uppercase tracking-wider text-charcoal hover:bg-ember-600"
        >
          {isAuthenticated ? 'My dashboard' : 'Member login'}
        </Link>
      </div>
    </header>
  )
}
