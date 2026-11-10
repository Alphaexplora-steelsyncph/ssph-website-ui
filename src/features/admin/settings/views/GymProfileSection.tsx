import { TextField } from '../../../../shared/components/TextField'
import type { SettingsVM } from '../viewModels/useSettingsViewModel'

export const GymProfileSection = ({ vm }: { vm: SettingsVM }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="font-display text-2xl font-bold uppercase">Gym profile</h2>
    <p className="mt-1 text-sm text-steel">Shown to your members and used as your admin account name.</p>

    {vm.editing ? (
      <div className="mt-5">
        <TextField
          label="Gym name"
          placeholder="e.g. Iron Haven Gym"
          value={vm.name}
          onChange={(e) => vm.setName(e.target.value)}
          error={vm.nameError ?? undefined}
          className="max-w-md"
        />
        <p className="mt-3 text-sm text-steel">
          Admin account name: <span className="font-semibold text-zinc-100">{vm.accountNamePreview}</span>
        </p>
      </div>
    ) : (
      <dl className="mt-5 space-y-2 text-sm">
        <div>
          <dt className="text-steel">Gym name</dt>
          <dd className="text-lg font-semibold text-zinc-100">{vm.gym?.name}</dd>
        </div>
        <div>
          <dt className="text-steel">Admin account name</dt>
          <dd className="font-semibold text-zinc-100">{vm.gym?.name} Admin</dd>
        </div>
      </dl>
    )}
  </section>
)
