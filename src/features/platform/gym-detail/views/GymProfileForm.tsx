import type { ReactNode } from 'react'
import { gymSiteLabel, gymSiteUrl } from '../../../../shared/tenant/tenant'
import { TextField } from '../../../../shared/components/TextField'
import { formatPeso } from '../../../../shared/utils/format'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <dt className="text-xs uppercase tracking-wider text-steel">{label}</dt>
    <dd className="mt-1 break-words font-semibold">{children || <span className="font-normal text-steel">—</span>}</dd>
  </div>
)

/** Read-only until Edit; while editing, the fields are kept on the page and saved with everything else on Save. */
export const GymProfileForm = ({ vm }: { vm: GymDetailVM }) => {
  const gym = vm.gym!
  const form = vm.profile
  const pkg = vm.packages.find((p) => p.id === gym.packageId)

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Gym profile & package</h2>
      {vm.editing && form ? (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <TextField label="Gym name" value={form.name} onChange={(e) => vm.setProfileField('name', e.target.value)} />
            <div>
              <TextField label="Gym address (subdomain)" value={form.slug} onChange={(e) => vm.setProfileField('slug', e.target.value)} />
              <a href={gymSiteUrl(gym.slug)} target="_blank" rel="noreferrer" className="mt-1.5 inline-block font-mono text-xs text-steel underline-offset-2 hover:text-zinc-100 hover:underline">
                {gymSiteLabel(gym.slug)} ↗
              </a>
            </div>
            <TextField label="Address" value={form.address} onChange={(e) => vm.setProfileField('address', e.target.value)} className="sm:col-span-2" />
            <TextField label="Contact person" value={form.contactName} onChange={(e) => vm.setProfileField('contactName', e.target.value)} />
            <TextField label="Contact email" type="email" value={form.contactEmail} onChange={(e) => vm.setProfileField('contactEmail', e.target.value)} />
            <TextField label="Contact mobile" type="tel" value={form.contactPhone} onChange={(e) => vm.setProfileField('contactPhone', e.target.value)} />
            <div>
              <label htmlFor="package" className="mb-1.5 block text-sm font-medium text-steel">Package</label>
              <select id="package" value={form.packageId} onChange={(e) => vm.setProfileField('packageId', e.target.value)}
                className="w-full rounded-lg border border-coal-500 bg-coal-800 px-4 py-3 text-base focus:border-ember focus:outline-none">
                {vm.packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} · {formatPeso(p.price)}/month</option>
                ))}
              </select>
            </div>
            <TextField label="Billing day (1–28)" type="number" min="1" max="28" value={String(form.billingDay)}
              onChange={(e) => vm.setProfileField('billingDay', Number(e.target.value))} />
          </div>
          <p className="mt-3 text-xs text-steel">Changing the gym address moves the gym's page to the new subdomain and replaces the check-in QR: old links and posters stop working.</p>
        </>
      ) : (
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Fact label="Gym name">{gym.name}</Fact>
          <Fact label="Gym address (subdomain)">
            <a href={gymSiteUrl(gym.slug)} target="_blank" rel="noreferrer" className="font-mono text-sm hover:underline">{gymSiteLabel(gym.slug)} ↗</a>
          </Fact>
          <Fact label="Address">{gym.address}</Fact>
          <Fact label="Contact person">{gym.contactName}</Fact>
          <Fact label="Contact email">{gym.contactEmail}</Fact>
          <Fact label="Contact mobile">{gym.contactPhone}</Fact>
          <Fact label="Package">{pkg ? `${pkg.name} · ${formatPeso(pkg.price)}/month` : gym.packageName}</Fact>
          <Fact label="Billing day">{String(gym.billingDay)}</Fact>
        </dl>
      )}
    </section>
  )
}
