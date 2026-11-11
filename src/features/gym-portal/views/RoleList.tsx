import { Link } from 'react-router-dom'
import type { RoleChoice } from '../viewModels/useGymPortalViewModel'

/** The role tiles: two per row; a lone last tile spans the full width. */
export const RoleList = ({ choices }: { choices: RoleChoice[] }) => (
  <nav aria-label="Log in as" className="grid grid-cols-2 gap-3">
    {choices.map(({ role, label, to, icon: Icon }, i) => (
      <Link
        key={role}
        to={to}
        data-testid={`role-${role.toLowerCase()}`}
        className={`group flex flex-col items-center justify-center gap-3 rounded-xl border border-coal-500 bg-coal-900/70 px-3 py-6 text-center transition hover:border-chalk hover:bg-chalk hover:text-ink focus-visible:border-chalk ${
          choices.length % 2 === 1 && i === choices.length - 1 ? 'col-span-2' : ''
        }`}
      >
        <Icon size={26} className="text-chalk transition group-hover:text-ink" />
        <span className="text-sm font-semibold">{label}</span>
      </Link>
    ))}
  </nav>
)
