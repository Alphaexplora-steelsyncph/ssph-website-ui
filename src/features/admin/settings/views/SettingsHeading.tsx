import { Check, CheckCircle2, Pencil, X } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import type { SettingsVM } from '../viewModels/useSettingsViewModel'

/** Edit / Done / Cancel for the whole page. Done is the only button that sends anything to the server. */
export const SettingsHeading = ({ vm }: { vm: SettingsVM }) => (
  <div className="mb-8 max-w-4xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-5xl font-extrabold uppercase">Settings</h1>
        <p className="mt-2 text-steel">
          {vm.editing
            ? 'Editing. Your changes are kept here and saved all at once when you press Done.'
            : "Your gym's name, check-in QR and the membership plans you offer."}
        </p>
      </div>
      {vm.gym && (
        <div className="flex shrink-0 gap-2">
          {vm.editing ? (
            <>
              <Button type="button" variant="outline" onClick={vm.cancel} disabled={vm.isSaving}>
                <X size={18} /> Cancel
              </Button>
              <Button type="button" onClick={vm.done} disabled={vm.isSaving}>
                <Check size={18} /> {vm.isSaving ? 'Saving…' : 'Done'}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={vm.startEditing}>
              <Pencil size={18} /> Edit settings
            </Button>
          )}
        </div>
      )}
    </div>
    {vm.editing && vm.isDirty && !vm.error && (
      <p role="status" className="mt-3 text-sm text-amber-400">You have unsaved changes. Press Done to save them, or Cancel to discard.</p>
    )}
    {vm.error && (
      <div role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>
    )}
    {!vm.editing && vm.justSaved && (
      <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-emerald-400">
        <CheckCircle2 size={16} /> Changes saved
      </p>
    )}
  </div>
)
