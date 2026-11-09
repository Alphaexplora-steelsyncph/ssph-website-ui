import { ChevronRight, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../../../shared/components/Avatar'
import type { CoachClient } from '../../../../shared/models/types'
import { ClientStatusBadge } from '../../../../shared/training/ClientStatusBadge'
import { formatDate } from '../../../../shared/utils/format'

export const ClientCard = ({ client }: { client: CoachClient }) => (
  <Link
    to={`/coach/clients/${client.memberId}`}
    data-testid="client-card"
    className="group flex min-w-0 flex-col rounded-xl border border-coal-600 bg-coal-800 p-5 transition hover:border-ember/60"
  >
    <div className="flex items-start gap-3">
      <Avatar name={client.fullName} photoUrl={client.photoUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold">{client.fullName}</p>
        <p className="truncate text-sm text-steel">{client.plan} · until {formatDate(client.expiresAt)}</p>
      </div>
      <ClientStatusBadge client={client} />
    </div>
    <div className="mt-4 flex-1 rounded-lg bg-coal-900 px-3 py-2.5">
      {client.programUpdatedAt ? (
        <>
          <p className="truncate font-medium">{client.programTitle?.trim() || 'Untitled program'}</p>
          <p className="text-xs text-steel">Updated {formatDate(client.programUpdatedAt)}</p>
        </>
      ) : (
        <p className="text-sm text-steel">No program yet</p>
      )}
    </div>
    {!client.programVisible && (
      <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
        <EyeOff size={14} /> Hidden from the member until their plan is active again
      </p>
    )}
    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ember">
      Open <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
    </span>
  </Link>
)
