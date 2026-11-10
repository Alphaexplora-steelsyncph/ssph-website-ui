import { Check, Pencil, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import { ALL_PAYMENT_METHODS, usePlatformSettingsViewModel, type NumericSetting } from '../viewModels/usePlatformSettingsViewModel'
import { DefaultPlansEditor } from './DefaultPlansEditor'

const Card = ({ title, note, children }: { title: string; note: string; children: ReactNode }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="font-display text-2xl font-bold uppercase">{title}</h2>
    <p className="mb-5 mt-1 text-sm text-steel">{note}</p>
    {children}
  </section>
)

export const PlatformSettingsForm = () => {
  const vm = usePlatformSettingsViewModel()
  if (!vm.draft) return vm.error ? <p role="alert" className="text-red-300">{vm.error}</p> : <div className="h-48 animate-pulse rounded-xl bg-coal-800" />
  const d = vm.draft
  const num = (key: NumericSetting, label: string) => (
    <TextField label={label} type="number" min="0" value={Number.isNaN(d[key]) ? '' : String(d[key])}
      onChange={(e) => vm.setNumber(key, e.target.value)} />
  )

  return (
    <div className="max-w-4xl space-y-6">
      <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_SETTINGS}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-sm ${vm.editing ? 'text-amber-400' : 'text-steel'}`}>
            {vm.editing
              ? vm.isDirty
                ? 'You have unsaved changes. Press Save to apply them, or Cancel to discard.'
                : 'Editing. Changes are kept here until you press Save.'
              : 'Read only. Press Edit to change the settings.'}
          </p>
          <div className="flex gap-2">
            {vm.editing ? (
              <>
                <Button variant="outline" onClick={vm.discard} disabled={vm.isSaving}><X size={18} /> Cancel</Button>
                <Button onClick={vm.save} disabled={vm.isSaving}><Check size={18} /> {vm.isSaving ? 'Saving…' : 'Save'}</Button>
              </>
            ) : (
              <Button variant="outline" onClick={vm.startEditing}><Pencil size={18} /> Edit</Button>
            )}
          </div>
        </div>
      </RoleGuard>
      <fieldset disabled={!vm.editing} className="space-y-6 disabled:opacity-90">
      <Card title="Billing" note="When gyms are reminded and when unpaid gyms are suspended automatically.">
        <div className="grid gap-5 sm:grid-cols-2">
          {num('graceDays', 'Grace period after the due date (days)')}
          {num('reminderDays', 'Remind the gym admin this many days before (days)')}
        </div>
      </Card>

      <Card title="Check-in" note="Applies to every gym.">
        <div className="grid gap-5 sm:grid-cols-2">
          {num('checkInCooldownHours', 'Repeat scans within this time count once (hours)')}
          {num('crowdWindowHours', '"In the gym now" counts check-ins from the last (hours)')}
        </div>
      </Card>

      <Card title="Payment methods" note="Methods gym admins can record in Enroll.">
        <div className="flex flex-wrap gap-3">
          {ALL_PAYMENT_METHODS.map((m) => (
            <label key={m} className="flex items-center gap-2 rounded-lg border border-coal-500 px-4 py-2.5 text-sm">
              <input type="checkbox" checked={d.paymentMethods.includes(m)} onChange={() => vm.toggleMethod(m)} className="h-4 w-4 accent-[#f3efe6]" />
              {m}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Security" note="Platform staff sign-in rules.">
        <div className="grid gap-5 sm:grid-cols-2">
          {num('sessionTimeoutMinutes', 'Sign out super admins after inactivity (minutes)')}
          {num('maxFailedLogins', 'Lock any account for 15 minutes after this many wrong passwords')}
        </div>
        <p className="mt-3 text-xs text-steel">Two-factor authentication for super admins is enforced by the backend (Supabase MFA).</p>
      </Card>

      <Card title="Default plans for new gyms" note="Copied into every new gym. Gym admins can change their own plans afterwards.">
        <DefaultPlansEditor vm={vm} />
      </Card>
      </fieldset>

      {vm.error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}
      {vm.notice && <div role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{vm.notice}</div>}

    </div>
  )
}
