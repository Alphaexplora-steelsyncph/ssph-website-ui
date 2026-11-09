import { useState, type FormEvent } from 'react'
import { gymSiteLabel, gymSiteUrl } from '../../../../shared/tenant/tenant'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import type { GymProfileInput } from '../../../../shared/models/types'
import { formatPeso } from '../../../../shared/utils/format'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'

/** Edit form. Remounted (via key) after each save so fields start from the saved values. */
export const GymProfileForm = ({ vm }: { vm: GymDetailVM }) => {
  const gym = vm.gym!
  const [form, setForm] = useState<GymProfileInput>({
    name: gym.name,
    slug: gym.slug,
    address: gym.address,
    contactName: gym.contactName,
    contactEmail: gym.contactEmail,
    contactPhone: gym.contactPhone,
    packageId: gym.packageId,
    billingDay: gym.billingDay,
  })
  const set = <K extends keyof GymProfileInput>(key: K, value: GymProfileInput[K]) => setForm((f) => ({ ...f, [key]: value }))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    void vm.saveProfile(form)
  }

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Gym profile & package</h2>
      <form onSubmit={submit} noValidate className="mt-5">
        <fieldset disabled={vm.busy === 'profile'} className="grid gap-5 sm:grid-cols-2">
          <TextField label="Gym name" value={form.name} onChange={(e) => set('name', e.target.value)} />
          <div>
            <TextField label="Gym address (subdomain)" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
            <a href={gymSiteUrl(gym.slug)} target="_blank" rel="noreferrer" className="mt-1.5 inline-block font-mono text-xs text-steel underline-offset-2 hover:text-zinc-100 hover:underline">
              {gymSiteLabel(gym.slug)} ↗
            </a>
          </div>
          <TextField label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} className="sm:col-span-2" />
          <TextField label="Contact person" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} />
          <TextField label="Contact email" type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          <TextField label="Contact mobile" type="tel" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
          <div>
            <label htmlFor="package" className="mb-1.5 block text-sm font-medium text-steel">Package</label>
            <select id="package" value={form.packageId} onChange={(e) => set('packageId', e.target.value)}
              className="w-full rounded-lg border border-coal-500 bg-coal-800 px-4 py-3 text-base focus:border-ember focus:outline-none">
              {vm.packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {formatPeso(p.price)}/month</option>
              ))}
            </select>
          </div>
          <TextField label="Billing day (1–28)" type="number" min="1" max="28" value={String(form.billingDay)}
            onChange={(e) => set('billingDay', Number(e.target.value))} />
        </fieldset>
        <p className="mt-3 text-xs text-steel">Changing the gym address moves the gym's page to the new subdomain and replaces the check-in QR: old links and posters stop working.</p>
        <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_GYMS}>
          <Button type="submit" className="mt-5" disabled={vm.busy === 'profile'}>
            {vm.busy === 'profile' ? 'Saving…' : 'Save profile'}
          </Button>
        </RoleGuard>
      </form>
    </section>
  )
}
