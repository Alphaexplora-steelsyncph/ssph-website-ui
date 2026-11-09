import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export const Footer = () => (
  <footer className="border-t border-coal-600 bg-coal-900">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Logo />
        <p className="mt-3 text-sm text-steel">Connecting the iron. Ang app ng mga sikap sa bakal gym.</p>
      </div>
      <div className="flex gap-6 text-sm text-steel">
        <Link to="/login" className="hover:text-zinc-100">Member login</Link>
        <Link to="/admin/login" className="hover:text-zinc-100">Gym admin</Link>
      </div>
    </div>
    <p className="border-t border-coal-600 py-4 text-center text-xs text-steel/70">
      © {new Date().getFullYear()} SteelSync PH by Alphaexplora Inc.
    </p>
  </footer>
)
