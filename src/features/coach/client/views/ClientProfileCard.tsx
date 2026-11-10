import { Pencil } from 'lucide-react'
import { TrainingProfileCard } from '../../../../shared/training/TrainingProfileCard'
import type { CoachClientVM } from '../viewModels/useCoachClientViewModel'

/** The coach's notes. The coach edits them; the member sees them read only. */
export const ClientProfileCard = ({ vm }: { vm: CoachClientVM }) => {
  if (!vm.profile) return null
  if (!vm.editingProfile) {
    return (
      <div className="relative">
        <TrainingProfileCard profile={vm.profile} title="Coach notes" remarksLabel="The member sees these" emptyText="No notes yet. Add goals or preferences. The member can see them." />
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
      <h2 className="text-sm font-semibold uppercase tracking-wider text-steel">Coach notes</h2>
      {vm.profileErrors.form && <p className="text-sm text-red-400">{vm.profileErrors.form}</p>}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-steel">Notes</span>
        <textarea
          rows={3}
          maxLength={500}
          value={vm.draft.remarks}
          onChange={(e) => vm.editProfile({ remarks: e.target.value })}
          placeholder="Goals, preferences… (the member can see this)"
          className="w-full rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-base text-zinc-100 placeholder:text-coal-500 focus:border-ember focus:outline-none"
        />
        <span className="mt-1.5 block text-xs text-steel">
          Do not record medical diagnoses, prescriptions or clinical conditions. Keep it to training notes.
        </span>
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
          {vm.isSavingProfile ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </form>
  )
}
