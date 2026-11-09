import { UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'

const STATUS_STYLE = { Active: 'text-emerald-400', Invited: 'text-sky-400', Disabled: 'text-red-400' } as const

export const GymAdminsCard = ({ vm }: { vm: GymDetailVM }) => {
  const gym = vm.gym!
  const [email, setEmail] = useState('') // UI-local form field

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (await vm.inviteAdmin(email)) setEmail('')
  }

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Admin accounts</h2>
      <p className="mt-1 text-sm text-steel">Every admin of this gym signs in as “{gym.name} Admin”.</p>
      <ul className="mt-4 divide-y divide-coal-600">
        {gym.admins.length === 0 && <li className="py-3 text-sm text-steel">No admin accounts yet.</li>}
        {gym.admins.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium">{a.email}</span>
              <span className={`text-xs font-semibold ${STATUS_STYLE[a.status]}`}>{a.status}</span>
            </span>
            {a.status !== 'Invited' && (
              <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_GYMS}>
                <span className="flex gap-2">
                  {a.status === 'Active' && (
                    <button type="button" disabled={vm.busy === `admin:${a.id}`} onClick={() => vm.resetPassword(a.id)}
                      className="rounded border border-coal-500 px-3 py-1.5 text-xs font-semibold text-steel hover:text-zinc-100">
                      Reset password
                    </button>
                  )}
                  <button type="button" disabled={vm.busy === `admin:${a.id}`} onClick={() => vm.toggleAdmin(a.id, a.status === 'Active')}
                    className={`rounded border px-3 py-1.5 text-xs font-semibold ${a.status === 'Active' ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'}`}>
                    {a.status === 'Active' ? 'Disable' : 'Enable'}
                  </button>
                </span>
              </RoleGuard>
            )}
          </li>
        ))}
      </ul>
      <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_GYMS}>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextField label="Invite another admin" type="email" placeholder="staff@gym.ph" value={email}
            onChange={(e) => setEmail(e.target.value)} className="flex-1" />
          <Button type="submit" variant="outline" disabled={!email || vm.busy === 'invite'}>
            <UserPlus size={18} /> Invite
          </Button>
        </form>
      </RoleGuard>
    </section>
  )
}
