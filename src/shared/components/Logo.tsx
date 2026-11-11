import { Link } from 'react-router-dom'

/**
 * The SteelSync PH logo for the dark theme: chalk artwork on a transparent background.
 * Files live in /public/brand (served as-is), so they can be swapped without touching the code.
 */
const MARK_SRC = '/brand/steelsync-ph-emblem.png' // barbell + SS emblem, 800 x 407
const LOCKUP_SRC = '/brand/steelsync-ph-lockup.png' // emblem + wordmark side by side, 1616 x 417
const FULL_SRC = '/brand/steelsync-ph-logo.png' // emblem + wordmark + ALPHAEXPLORA INC. tape, 1200 x 915

/** The barbell + SS emblem. Sizes itself from the height (`h-` with `w-auto`). */
export const LogoMark = ({ className = 'h-9 w-auto' }: { className?: string }) => (
  <img src={MARK_SRC} alt="" width={800} height={407} className={`object-contain ${className}`} draggable={false} />
)

/** Emblem + wordmark side by side: the header version. */
export const Logo = ({ to = '/' }: { to?: string }) => (
  <Link to={to} className="flex items-center" aria-label="SteelSync PH home">
    <img src={LOCKUP_SRC} alt="SteelSync PH" width={1616} height={417} className="h-9 w-auto sm:h-11" draggable={false} />
  </Link>
)

/** The complete logo (barbell, wordmark and ALPHAEXPLORA INC. tape) for large placements such as the sign-in side panel. */
export const LogoFull = ({ className = 'w-56' }: { className?: string }) => (
  <img src={FULL_SRC} alt="SteelSync PH by ALPHAEXPLORA INC." width={1200} height={915} className={className} draggable={false} />
)
