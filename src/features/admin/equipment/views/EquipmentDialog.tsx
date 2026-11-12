import { Camera, Dumbbell, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import { TextField } from '../../../../shared/components/TextField'
import type { EquipmentVM } from '../viewModels/useEquipmentViewModel'

/** Add or edit one machine. */
export const EquipmentDialog = ({ vm }: { vm: EquipmentVM }) => {
  const d = vm.draft!
  const fileRef = useRef<HTMLInputElement>(null)
  const shown = d.photoPreview ?? (d.removePhoto ? null : d.photoUrl)
  return (
    <Modal
      open
      title={d.id ? 'Edit equipment' : 'Add equipment'}
      onClose={vm.closeDraft}
      footer={
        <>
          <Button variant="outline" onClick={vm.closeDraft} disabled={vm.isSaving}>
            Cancel
          </Button>
          <Button onClick={() => vm.saveDraft()} disabled={vm.isSaving}>
            {vm.isSaving ? 'Saving…' : d.id ? 'Apply' : 'Add'}
          </Button>
        </>
      }
    >
      <form onSubmit={vm.saveDraft} noValidate className="space-y-4">
        <TextField
          label="Name"
          placeholder="e.g. Treadmill 1"
          value={d.name}
          maxLength={80}
          onChange={(e) => vm.editDraft({ name: e.target.value })}
        />
        <div>
          <TextField
            label="Area (optional)"
            placeholder="e.g. Cardio, Free weights"
            value={d.area}
            maxLength={60}
            list="equipment-areas"
            onChange={(e) => vm.editDraft({ area: e.target.value })}
          />
          <datalist id="equipment-areas">
            {vm.areas.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-steel">Status</span>
          <div role="radiogroup" aria-label="Status" className="grid grid-cols-3 gap-2">
            {vm.statuses.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={d.status === s}
                onClick={() => vm.editDraft({ status: s })}
                className={`rounded-lg border px-2 py-2.5 text-sm font-semibold ${
                  d.status === s ? 'border-ember bg-ember/10 text-ember' : 'border-coal-500 text-steel hover:text-zinc-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-steel">Photo (optional)</span>
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-coal-500 bg-coal-900 text-coal-500">
              {shown ? <img src={shown} alt="Equipment photo preview" className="size-full object-cover" /> : <Dumbbell size={26} aria-hidden="true" />}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={vm.isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-coal-500 px-3 py-2 text-sm font-semibold text-steel hover:text-zinc-100 disabled:opacity-50"
              >
                <Camera size={15} /> {shown ? 'Change photo' : 'Add photo'}
              </button>
              {shown && (
                <button
                  type="button"
                  onClick={vm.clearPhoto}
                  disabled={vm.isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-steel hover:text-red-400 disabled:opacity-50"
                >
                  <Trash2 size={15} /> Remove
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                vm.pickPhoto(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>
          <p className="mt-1.5 text-xs text-steel">Members see it on their dashboard. It is shrunk before upload, so any phone photo is fine.</p>
        </div>
        <TextField
          label="Note for members (optional)"
          placeholder="e.g. Part ordered, back by Friday"
          value={d.note}
          maxLength={200}
          onChange={(e) => vm.editDraft({ note: e.target.value })}
        />
        {d.id && <p className="text-xs text-steel">Applied to the list now, saved when you press Done.</p>}
        {vm.draftError && (
          <p role="alert" className="text-sm text-red-400">
            {vm.draftError}
          </p>
        )}
      </form>
    </Modal>
  )
}
