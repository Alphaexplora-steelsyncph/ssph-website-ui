import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import { useGymProfileViewModel } from '../viewModels/useGymProfileViewModel'

export const GymProfileSection = () => {
  const vm = useGymProfileViewModel()

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Gym profile</h2>
      <p className="mt-1 text-sm text-steel">Shown to your members and used as your admin account name.</p>

      <form onSubmit={vm.save} noValidate className="mt-5">
        <TextField
          label="Gym name"
          placeholder="e.g. Iron Haven Gym"
          value={vm.name}
          disabled={vm.isLoading}
          onChange={(e) => vm.setName(e.target.value)}
          error={vm.error ?? undefined}
          className="max-w-md"
        />
        <p className="mt-3 text-sm text-steel">
          Admin account name: <span className="font-semibold text-zinc-100">{vm.accountNamePreview}</span>
        </p>
        <div className="mt-5 flex items-center gap-4">
          <Button type="submit" disabled={!vm.isDirty || vm.isSaving || vm.isLoading}>
            {vm.isSaving ? 'Saving…' : 'Save'}
          </Button>
          {vm.saved && (
            <span role="status" className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 size={16} /> Saved
            </span>
          )}
        </div>
      </form>
    </section>
  )
}
