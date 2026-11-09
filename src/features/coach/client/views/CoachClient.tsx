import { ArrowLeft, CheckCircle2, ClipboardList, Info, Plus } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import { ProgramDisplay } from '../../../../shared/training/ProgramDisplay'
import { useCoachClientViewModel } from '../viewModels/useCoachClientViewModel'
import { useProgramHistoryViewModel } from '../viewModels/useProgramHistoryViewModel'
import { ClientHeader } from './ClientHeader'
import { ClientProfileCard } from './ClientProfileCard'
import { ProgramHistoryDialog } from './ProgramHistoryDialog'

/** Page container: one client of the coach. */
const CoachClient = memo(() => {
  const vm = useCoachClientViewModel()
  const history = useProgramHistoryViewModel(vm.memberId, vm.onProgramRestored)

  return (
    <>
      <Link to="/coach" className="mb-5 inline-flex items-center gap-1.5 text-sm text-steel hover:text-zinc-100">
        <ArrowLeft size={16} /> My clients
      </Link>

      {vm.error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {vm.error}
        </p>
      )}
      {vm.isLoading && <div className="h-40 animate-pulse rounded-xl bg-coal-800" />}

      {vm.client && (
        <div className="space-y-6">
          {vm.justSaved && (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <CheckCircle2 size={16} /> Program saved. {vm.client.fullName.split(' ')[0]} was notified.
            </p>
          )}
          {vm.unchanged && (
            <p className="flex items-center gap-2 rounded-lg border border-coal-500 bg-coal-800 px-4 py-3 text-sm text-steel">
              <Info size={16} /> No changes: the program is the same as before, so nothing was saved or sent to {vm.client.fullName.split(' ')[0]}.
            </p>
          )}
          <ClientHeader vm={vm} onOpenHistory={history.openDialog} />
          <ClientProfileCard vm={vm} />
          {vm.program ? (
            <ProgramDisplay
              program={vm.program}
              memberName={vm.client.fullName}
              coachName={vm.coachName}
              gymName={vm.gymName}
              exportRef={vm.exporter.exportRef}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-coal-500 p-10 text-center">
              <ClipboardList size={32} className="mx-auto text-steel" />
              <h2 className="mt-3 font-display text-3xl font-bold uppercase">No program yet</h2>
              <p className="mt-1 text-steel">Write a weekly schedule and exercise tables. {vm.client.fullName.split(' ')[0]} sees it on their phone.</p>
              <Button to={`/coach/clients/${vm.memberId}/program/new`} className="mt-5">
                <Plus size={18} /> Create program
              </Button>
            </div>
          )}
        </div>
      )}

      <ProgramHistoryDialog vm={history} />

      <Modal
        open={vm.confirmRemove}
        onClose={vm.cancelRemove}
        title="Remove client?"
        footer={
          <>
            <button type="button" onClick={vm.cancelRemove} className="rounded-lg px-4 py-2.5 text-sm text-steel hover:text-zinc-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={vm.remove}
              disabled={vm.isRemoving}
              className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
            >
              {vm.isRemoving ? 'Removing…' : 'Remove client'}
            </button>
          </>
        }
      >
        <p>
          {vm.client?.fullName} will no longer be your client and another coach can take them. Their program and its history stay with them,
          so a new coach continues where you left off.
        </p>
      </Modal>
    </>
  )
})
CoachClient.displayName = 'CoachClient'

export default CoachClient
