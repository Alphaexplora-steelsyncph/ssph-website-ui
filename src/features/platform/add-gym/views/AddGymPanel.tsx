import { Building2, CheckCircle2 } from 'lucide-react'
import { gymSiteLabel, slugPreview } from '../../../../shared/tenant/tenant'
import { Button } from '../../../../shared/components/Button'
import { FormCard } from '../../../../shared/components/FormCard'
import { InviteCard } from '../../../../shared/components/InviteCard'
import { TextField } from '../../../../shared/components/TextField'
import { formatDate, formatPeso } from '../../../../shared/utils/format'
import { useAddGymViewModel } from '../viewModels/useAddGymViewModel'

export const AddGymPanel = () => {
  const vm = useAddGymViewModel()

  if (vm.result) {
    const { gym, adminInviteToken } = vm.result
    return (
      <div role="status" className="max-w-xl rounded-xl border border-emerald-500/40 bg-coal-800 p-6 sm:p-8">
        <CheckCircle2 size={44} className="text-emerald-400" />
        <h2 className="mt-4 font-display text-4xl font-extrabold uppercase">Gym created</h2>
        <p className="mt-1 text-steel">
          {gym.name} is on the {gym.packageName} package. First bill: {gym.billing.periodLabel}, due {formatDate(gym.billing.dueDate)}.
        </p>
        <InviteCard
          token={adminInviteToken}
          email={vm.form.adminEmail}
          title="Gym admin invite"
          description={`Send this link to ${vm.form.adminEmail} so they can set a password. The backend will email it automatically.`}
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button to={`/platform/gyms/${gym.id}`}>Open gym</Button>
          <Button variant="outline" onClick={vm.reset}>Add another</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={vm.submit} noValidate className="max-w-3xl space-y-6">
      <FormCard step={1} title="Gym">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Gym name" placeholder="e.g. Iron Haven Gym" value={vm.form.name}
            onChange={(e) => vm.set('name', e.target.value)} error={vm.fieldErrors.name} />
          <div>
            <TextField label="Gym address (subdomain)" placeholder="iron-haven" value={vm.form.slug}
              onChange={(e) => vm.set('slug', e.target.value)} error={vm.fieldErrors.slug} />
            <p className="mt-1.5 text-xs text-steel">
              The gym's own page: <span className="font-mono text-zinc-100">{gymSiteLabel(slugPreview(vm.form.slug || vm.form.name))}</span>. Leave blank to use the name.
            </p>
          </div>
          <TextField label="Address" value={vm.form.address} onChange={(e) => vm.set('address', e.target.value)} className="sm:col-span-2" />
          <TextField label="Contact person" value={vm.form.contactName} onChange={(e) => vm.set('contactName', e.target.value)} />
          <TextField label="Contact mobile" type="tel" value={vm.form.contactPhone} onChange={(e) => vm.set('contactPhone', e.target.value)} />
          <TextField label="Contact email" type="email" value={vm.form.contactEmail}
            onChange={(e) => vm.set('contactEmail', e.target.value)} error={vm.fieldErrors.contactEmail} />
        </div>
      </FormCard>

      <FormCard step={2} title="Package & billing">
        <div role="radiogroup" aria-label="Package" className="grid gap-3 sm:grid-cols-3">
          {vm.packages.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={vm.form.packageId === p.id} onClick={() => vm.set('packageId', p.id)}
              className={`rounded-lg border p-4 text-left ${vm.form.packageId === p.id ? 'border-ember bg-ember/10' : 'border-coal-500 bg-coal-900 hover:border-steel'}`}>
              <span className="block font-display text-2xl font-bold uppercase">{p.name}</span>
              <span className="block text-sm font-semibold">{formatPeso(p.price)}/month</span>
              <span className="mt-1 block text-xs text-steel">{p.memberLimit === null ? 'Unlimited members' : `Up to ${p.memberLimit} members`}</span>
            </button>
          ))}
        </div>
        {vm.fieldErrors.packageId && <p className="mt-2 text-sm text-red-400">{vm.fieldErrors.packageId}</p>}
        <TextField label="Billing day of the month (1–28)" type="number" min="1" max="28" value={String(vm.form.billingDay)}
          onChange={(e) => vm.set('billingDay', Number(e.target.value))} error={vm.fieldErrors.billingDay} className="mt-5 sm:max-w-xs" />
      </FormCard>

      <FormCard step={3} title="First admin">
        <TextField label="Admin email" type="email" placeholder="owner@gym.ph" value={vm.form.adminEmail}
          onChange={(e) => vm.set('adminEmail', e.target.value)} error={vm.fieldErrors.adminEmail} className="sm:max-w-md" />
        <p className="mt-3 text-sm text-steel">They get an invite link to set a password and sign in as “{vm.form.name || 'Gym Name'} Admin”.</p>
      </FormCard>

      {vm.error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}
      <Button type="submit" disabled={vm.isSubmitting}>
        {vm.isSubmitting ? 'Creating…' : (<>Create gym <Building2 size={18} /></>)}
      </Button>
    </form>
  )
}
