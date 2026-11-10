import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import { ADD_ON_FEATURES, type PackagesVM } from '../viewModels/usePackagesViewModel'

export const PackageForm = ({ vm, title }: { vm: PackagesVM; title: string }) => (
  <div className="rounded-xl border border-ember/40 bg-coal-800 p-5 sm:p-6">
    <h2 className="mb-4 font-display text-2xl font-bold uppercase">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-3">
      <TextField label="Name" placeholder="e.g. Plus" value={vm.draft.name} onChange={(e) => vm.update('name', e.target.value)} />
      <TextField label="Price per month (₱)" type="number" min="0" value={vm.draft.price} onChange={(e) => vm.update('price', e.target.value)} />
      <TextField label="Member limit (empty = unlimited)" type="number" min="1" value={vm.draft.memberLimit}
        onChange={(e) => vm.update('memberLimit', e.target.value)} />
    </div>
    <fieldset className="mt-5">
      <legend className="mb-2 text-sm font-medium text-steel">Included features</legend>
      <label className="flex items-center gap-3 py-1.5 text-sm text-steel">
        <input type="checkbox" checked disabled className="h-4 w-4" /> Basic Gym Management (always)
      </label>
      {ADD_ON_FEATURES.map((f) => (
        <label key={f.key} className="flex items-center gap-3 py-1.5 text-sm">
          <input type="checkbox" checked={vm.draft.features.includes(f.key)} onChange={() => vm.toggleFeature(f.key)} className="h-4 w-4 accent-[#f3efe6]" />
          {f.label}
          {f.availability === 'coming_soon' && <span className="rounded bg-coal-600 px-2 py-0.5 text-xs text-steel">Coming soon</span>}
        </label>
      ))}
    </fieldset>
    <div className="mt-5 flex gap-3">
      <Button onClick={vm.save}>Keep package</Button>
      <Button variant="outline" onClick={vm.cancel}>Cancel</Button>
    </div>
  </div>
)
