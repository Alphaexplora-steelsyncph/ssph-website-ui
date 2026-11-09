import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import { TextField } from '../../../../shared/components/TextField'
import type { EquipmentVM } from '../viewModels/useEquipmentViewModel'

/** Add or edit one machine. */
export const EquipmentDialog = ({ vm }: { vm: EquipmentVM }) => {
  const d = vm.draft!
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
            {vm.isSaving ? 'Saving…' : d.id ? 'Save' : 'Add'}
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
        <TextField
          label="Note for members (optional)"
          placeholder="e.g. Part ordered, back by Friday"
          value={d.note}
          maxLength={200}
          onChange={(e) => vm.editDraft({ note: e.target.value })}
        />
        {vm.draftError && (
          <p role="alert" className="text-sm text-red-400">
            {vm.draftError}
          </p>
        )}
      </form>
    </Modal>
  )
}
