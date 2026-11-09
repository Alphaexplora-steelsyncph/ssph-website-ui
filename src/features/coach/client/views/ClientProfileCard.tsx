import { Pencil } from 'lucide-react'
import { TextField } from '../../../../shared/components/TextField'
import { TrainingProfileCard } from '../../../../shared/training/TrainingProfileCard'
import type { CoachClientVM } from '../viewModels/useCoachClientViewModel'

/** Weight, height (BMI) and remarks. The coach edits them; the member sees them read only. */
export const ClientProfileCard = ({ vm }: { vm: CoachClientVM }) => {
  if (!vm.profile) return null
  if (!vm.editingProfile) {
    return (
      <div className="relative">
        <TrainingProfileCard profile={vm.profile} title="Body details" remarksLabel="Remarks (the member sees these)" />
        <button
          type="button"
          onClick={vm.startEditProfile}
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-ember hover:bg-coal-700"
        >
          <Pencil size={14} /> Edit
        </button>
      </div>
    )
  }
  return (
    <form onSubmit={vm.saveProfile} noValidate className="space-y-4 rounded-xl border border-ember/40 bg-coal-800 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-steel">Body details</h2>
      {vm.profileErrors.form && <p className="text-sm text-red-400">{vm.profileErrors.form}</p>}
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Weight (kg)"
          inputMode="decimal"
          value={vm.draft.weightKg}
          onChange={(e) => vm.editProfile({ weightKg: e.target.value })}
          error={vm.profileErrors.weightKg}
          placeholder="e.g. 72.5"
        />
        <TextField
          label="Height (cm)"
          inputMode="decimal"
          value={vm.draft.heightCm}
          onChange={(e) => vm.editProfile({ heightCm: e.target.value })}
          error={vm.profileErrors.heightCm}
          placeholder="e.g. 170"
        />
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-steel">Remarks</span>
        <textarea
          rows={3}
          maxLength={500}
          value={vm.draft.remarks}
          onChange={(e) => vm.editProfile({ remarks: e.target.value })}
          placeholder="Injuries, goals, preferences… (the member can see this)"
          className="w-full rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-base text-zinc-100 placeholder:text-coal-500 focus:border-ember focus:outline-none"
        />
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={vm.cancelEditProfile} className="rounded-lg px-4 py-2 text-sm text-steel hover:text-zinc-100">
          Cancel
        </button>
        <button
          type="submit"
          disabled={vm.isSavingProfile}
          className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-charcoal hover:bg-ember-600 disabled:opacity-60"
        >
          {vm.isSavingProfile ? 'Saving…' : 'Save details'}
        </button>
      </div>
    </form>
  )
}
