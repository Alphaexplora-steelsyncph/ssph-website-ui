import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react'
import { Modal } from '../../../../shared/components/Modal'
import { ProgramCards } from '../../../../shared/training/ProgramCards'
import { displayProgramTitle } from '../../../../shared/training/program'
import { formatDateTime } from '../../../../shared/utils/format'
import type { ProgramHistoryVM } from '../viewModels/useProgramHistoryViewModel'

const when = formatDateTime

/** Every saved version of the client's program, newest first. Open one to preview it and restore it. */
export const ProgramHistoryDialog = ({ vm }: { vm: ProgramHistoryVM }) => {
  const footer = vm.selected && !vm.isCurrent(vm.selected) && !vm.isSameAsCurrent(vm.selected) && (
    <>
      {vm.confirmRestore ? (
        <>
          <button type="button" onClick={vm.cancelRestore} className="rounded-lg px-4 py-2.5 text-sm text-steel hover:text-zinc-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={vm.restore}
            disabled={vm.isRestoring}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold text-charcoal hover:bg-ember-600 disabled:opacity-60"
          >
            {vm.isRestoring ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Yes, restore it
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={vm.askRestore}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-coal-500 px-4 py-2.5 text-sm font-semibold hover:border-ember hover:text-ember"
        >
          <RotateCcw size={16} /> Restore this version
        </button>
      )}
    </>
  )

  return (
    <Modal open={vm.open} onClose={vm.close} title={vm.selected ? 'Saved version' : 'Program history'} size="lg" footer={footer || undefined}>
      {vm.error && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300">{vm.error}</p>}
      {vm.info && <p className="mb-3 rounded-lg border border-coal-500 bg-coal-900 px-3 py-2 text-zinc-100">{vm.info}</p>}
      {vm.isLoading && (
        <p className="flex items-center gap-2 text-steel">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </p>
      )}
      {vm.selected ? (
        <div>
          <button type="button" onClick={() => vm.select(null)} className="mb-3 inline-flex items-center gap-1 text-sm text-ember hover:underline">
            <ArrowLeft size={14} /> All versions
          </button>
          <p className="mb-4 text-steel">
            {when(vm.selected.savedAt)} · {vm.selected.note}
            {vm.selected.savedBy && ` · by ${vm.selected.savedBy}`}
          </p>
          {vm.isSameAsCurrent(vm.selected) && (
            <p className="mb-4 rounded-lg border border-coal-500 bg-coal-900 px-3 py-2 text-steel">
              This version is the same as the current program, so there is nothing to restore.
            </p>
          )}
          {vm.confirmRestore && (
            <p className="mb-4 rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-zinc-100">
              This version becomes the current program and the member is notified. The current program stays in the history.
            </p>
          )}
          <ProgramCards program={vm.selected.program} />
        </div>
      ) : (
        vm.versions && (
          <>
            {vm.versions.length === 0 && <p className="text-steel">No saved versions yet.</p>}
            <ul className="divide-y divide-coal-600 rounded-lg border border-coal-600">
              {vm.versions.map((v) => (
                <li key={v.id}>
                  <button type="button" onClick={() => vm.select(v)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-coal-700">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-zinc-100">{displayProgramTitle(v.program.title)}</span>
                      <span className="block truncate text-xs text-steel">
                        {v.note}
                        {v.savedBy && ` · ${v.savedBy}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-steel">
                      {when(v.savedAt)}
                      {vm.isCurrent(v) && <span className="mt-1 block font-semibold text-emerald-400">Current</span>}
                      {vm.isSameAsCurrent(v) && <span className="mt-1 block text-steel">Same as current</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )
      )}
    </Modal>
  )
}
