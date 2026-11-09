import { AlertTriangle, ArrowLeft, Loader2, Save } from 'lucide-react'
import { memo } from 'react'
import { Modal } from '../../../../shared/components/Modal'
import { useProgramEditorViewModel, type EditorMode } from '../viewModels/useProgramEditorViewModel'
import { DesktopProgramEditor } from './DesktopProgramEditor'
import { MobileProgramEditor } from './MobileProgramEditor'

/** Page container: program editor for one client ("edit" the current program or start a "new" one). */
const ProgramEditor = memo(({ mode }: { mode: EditorMode }) => {
  const vm = useProgramEditorViewModel(mode)

  if (vm.loadError) {
    return <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.loadError}</p>
  }
  if (vm.isLoading || !vm.program) {
    return (
      <p className="flex items-center gap-2 text-steel">
        <Loader2 size={18} className="animate-spin" /> Loading…
      </p>
    )
  }

  return (
    <>
      <div className="sticky top-0 z-20 -mx-5 mb-6 border-b border-coal-600 bg-charcoal/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button type="button" onClick={vm.back} className="inline-flex min-w-0 items-center gap-1.5 text-sm text-steel hover:text-zinc-100">
            <ArrowLeft size={16} className="shrink-0" /> <span className="truncate">{vm.clientName}</span>
          </button>
          <p className="ml-auto hidden text-sm text-steel sm:block">
            {vm.isNew ? 'New program' : 'Editing program'}
            {vm.isDirty && <span className="ml-2 text-amber-400">· unsaved changes</span>}
          </p>
          <button
            type="button"
            onClick={vm.save}
            disabled={vm.isSaving}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wider text-charcoal hover:bg-ember-600 disabled:opacity-60 sm:ml-0"
          >
            {vm.isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save
          </button>
        </div>
        {(vm.problems.length > 0 || vm.saveError) && (
          <div role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {[...vm.problems, vm.saveError].filter(Boolean).join(' ')}
          </div>
        )}
      </div>

      {vm.replacesCurrent && (
        <p className="mb-5 flex items-start gap-2 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-ember" />
          This starts a fresh program for {vm.clientName}. When you save, it replaces the current one; the current one stays in History.
        </p>
      )}

      <div className="hidden sm:block">
        <DesktopProgramEditor vm={vm} />
      </div>
      <div className="sm:hidden">
        <MobileProgramEditor vm={vm} />
      </div>

      <Modal
        open={vm.confirmLeave}
        onClose={vm.stay}
        title="Unsaved changes"
        footer={
          <>
            <button type="button" onClick={vm.discard} className="rounded-lg px-4 py-2.5 text-sm text-red-400 hover:text-red-300">
              Discard changes
            </button>
            <button type="button" onClick={vm.stay} className="rounded-lg border border-coal-500 px-4 py-2.5 text-sm font-semibold">
              Keep editing
            </button>
            <button type="button" onClick={vm.save} className="rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold text-charcoal hover:bg-ember-600">
              Save
            </button>
          </>
        }
      >
        <p>You changed this program but did not save it. Save it now, or leave without saving?</p>
      </Modal>
    </>
  )
})
ProgramEditor.displayName = 'ProgramEditor'

export default ProgramEditor
