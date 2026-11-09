import { EyeOff, History, Pencil, Plus, UserMinus } from 'lucide-react'
import { Avatar } from '../../../../shared/components/Avatar'
import { Button } from '../../../../shared/components/Button'
import { ClientStatusBadge } from '../../../../shared/training/ClientStatusBadge'
import { ExportMenu } from '../../../../shared/training/ExportMenu'
import { formatDate } from '../../../../shared/utils/format'
import type { CoachClientVM } from '../viewModels/useCoachClientViewModel'

interface Props {
  vm: CoachClientVM
  onOpenHistory: () => void
}

/** Who the client is + every action on their program. */
export const ClientHeader = ({ vm, onOpenHistory }: Props) => {
  const client = vm.client!
  const base = `/coach/clients/${client.memberId}/program`
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={client.fullName} photoUrl={client.photoUrl} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-extrabold uppercase leading-none sm:text-4xl">{client.fullName}</h1>
            <p className="mt-1 truncate text-sm text-steel">{client.email || 'No email'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <ClientStatusBadge client={client} />
              <span className="text-steel">
                {client.plan} · until {formatDate(client.expiresAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-coal-600 pt-4">
          {vm.program ? (
            <>
              <Button to={`${base}/edit`} className="!px-4 !py-2.5 !text-base">
                <Pencil size={16} /> Edit program
              </Button>
              <Button to={`${base}/new`} variant="outline" className="!px-4 !py-2.5 !text-base">
                <Plus size={16} /> New program
              </Button>
            </>
          ) : (
            <Button to={`${base}/new`} className="!px-4 !py-2.5 !text-base">
              <Plus size={16} /> Create program
            </Button>
          )}
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-2 rounded-lg border border-coal-500 px-4 py-2.5 text-sm font-semibold hover:border-ember hover:text-ember"
          >
            <History size={16} /> History
          </button>
          {vm.program && <ExportMenu exporter={vm.exporter} />}
          <button
            type="button"
            onClick={vm.askRemove}
            className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-steel hover:text-red-400"
          >
            <UserMinus size={16} /> Remove
          </button>
        </div>
      </div>
      {!client.programVisible && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <EyeOff size={16} className="mt-0.5 shrink-0" />
          {client.fullName.split(' ')[0]} can&apos;t see this program right now because their plan is{' '}
          {client.status === 'Active' ? 'on hold at the front desk' : client.status.toLowerCase()}. You can still edit it; they will see it
          again once the plan is active.
        </p>
      )}
    </section>
  )
}
