import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../../../shared/components/brand/Reveal'
import type { RoleChoice } from '../viewModels/useGymPortalViewModel'

/** The role buttons, stacked like plates (each one a little narrower). */
export const RoleList = ({ choices }: { choices: RoleChoice[] }) => (
  <nav aria-label="Log in as" className="flex flex-col items-end gap-3">
    {choices.map(({ role, label, line, to, icon: Icon }, i) => (
      <Reveal key={role} motion="load" delay={0.1 + i * 0.08} className="w-full" >
        <Link
          to={to}
          data-testid={`role-${role.toLowerCase()}`}
          style={{ width: `${100 - i * 6}%` }}
          className="group ml-auto flex items-center gap-4 rounded-full border-2 border-chalk/80 py-3 pl-3 pr-6 transition hover:bg-chalk hover:text-ink"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-chalk text-ink transition group-hover:bg-ink group-hover:text-chalk">
            <Icon size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-3xl uppercase leading-none">{label}</span>
            <span className="block truncate text-sm text-chalk-2 group-hover:text-ink/70">{line}</span>
          </span>
          <ArrowRight size={20} className="shrink-0 transition group-hover:translate-x-1" />
        </Link>
      </Reveal>
    ))}
  </nav>
)
