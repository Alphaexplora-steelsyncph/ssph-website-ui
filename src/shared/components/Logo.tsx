import { Link } from 'react-router-dom'

/**
 * The plate mark: a bumper plate seen from the front whose centre hole became a check-in tick.
 * One SVG, drawn in currentColor so it follows the text colour it sits in.
 */
export const LogoMark = ({ className = 'h-9 w-9' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <circle cx="32" cy="32" r="28.5" fill="none" stroke="currentColor" strokeWidth="6" />
    <circle cx="32" cy="32" r="19" fill="none" stroke="currentColor" strokeWidth="2" opacity=".4" />
    <path d="M22 33l7 7 14-16" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Mark + wordmark. The wordmark is the current product name until the new name is final. */
export const Logo = ({ to = '/' }: { to?: string }) => (
  <Link to={to} className="flex items-center gap-2.5" aria-label="SteelSync PH home">
    <LogoMark className="h-9 w-9 text-ember" />
    <span className="font-display text-2xl leading-none tracking-wide text-zinc-100 uppercase">
      SteelSync
      <span className="ml-1.5 rounded border border-steel/50 px-1 py-0.5 align-middle font-mono text-[10px] text-steel">PH</span>
    </span>
  </Link>
)
