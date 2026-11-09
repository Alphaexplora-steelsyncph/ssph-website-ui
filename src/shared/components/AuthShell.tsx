import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from './Logo'

interface Props {
  badge: string
  title: string
  subtitle: string
  headline: string
  blurb: string
  children: ReactNode
  footer?: ReactNode
}

/** Two-panel layout shared by the admin login, member login and member register pages. */
export const AuthShell = ({ badge, title, subtitle, headline, blurb, children, footer }: Props) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    {/* Brand panel */}
    <aside className="relative hidden overflow-hidden bg-coal-900 p-12 lg:flex lg:flex-col lg:justify-between">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(243,239,230,0.10), transparent 45%), repeating-linear-gradient(135deg, transparent 0 22px, rgba(255,255,255,0.03) 22px 23px)',
        }}
      />
      <div className="relative">
        <Logo />
      </div>
      <div className="relative max-w-md">
        <p className="font-display text-6xl font-extrabold uppercase leading-[0.95]">{headline}</p>
        <p className="mt-5 text-lg text-steel">{blurb}</p>
      </div>
      <p className="relative text-sm text-steel/70">Lift. Scan. Sync. — by Alphaexplora Inc.</p>
    </aside>

    {/* Form panel */}
    <main className="flex flex-col px-5 py-6 sm:px-10">
      <div className="flex items-center justify-between">
        <div className="lg:hidden">
          <Logo />
        </div>
        <Link to="/" className="ml-auto flex items-center gap-1.5 text-sm text-steel hover:text-zinc-100">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <span className="mb-4 w-fit rounded-full border border-ember/50 bg-ember/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ember">
          {badge}
        </span>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-none">{title}</h1>
        <p className="mt-3 text-steel">{subtitle}</p>
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-steel">{footer}</div>}
      </div>
    </main>
  </div>
)
