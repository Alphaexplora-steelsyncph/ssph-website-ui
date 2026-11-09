import { UserPlus } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import { useMemberRegisterViewModel } from '../viewModels/useMemberRegisterViewModel'

export const MemberRegisterForm = () => {
  const vm = useMemberRegisterViewModel()

  return (
    <form onSubmit={vm.submit} noValidate className="space-y-5">
    {vm.error && (
      <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {vm.error}
      </div>
    )}
    <TextField label="Full name" autoComplete="name" placeholder="Juan Dela Cruz" value={vm.fullName}
      onChange={(e) => vm.setFullName(e.target.value)} error={vm.fieldErrors.fullName} />
    <TextField label="Email" type="email" autoComplete="email" placeholder="you@email.com" value={vm.email}
      onChange={(e) => vm.setEmail(e.target.value)} error={vm.fieldErrors.email} />

    {vm.lockedGym ? (
      <div>
        <p className="mb-1.5 text-sm font-medium text-steel">Your gym</p>
        <p className="rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 font-semibold">{vm.lockedGym.name}</p>
      </div>
    ) : (
    <div>
      <label htmlFor="gym" className="mb-1.5 block text-sm font-medium text-steel">Your gym</label>
      <select
        id="gym"
        value={vm.gymId}
        onChange={(e) => vm.setGymId(e.target.value)}
        className={`w-full rounded-lg border bg-coal-800 px-4 py-3 text-base text-zinc-100 focus:border-ember focus:outline-none ${
          vm.fieldErrors.gymId ? 'border-red-500' : 'border-coal-500'
        }`}
      >
        <option value="">Select your gym</option>
        {vm.gyms.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>
      {vm.fieldErrors.gymId && <p className="mt-1.5 text-sm text-red-400">{vm.fieldErrors.gymId}</p>}
    </div>
    )}

    <TextField label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters"
      value={vm.password} onChange={(e) => vm.setPassword(e.target.value)} error={vm.fieldErrors.password} />
    <TextField label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat password"
      value={vm.confirm} onChange={(e) => vm.setConfirm(e.target.value)} error={vm.fieldErrors.confirm} />

    <Button type="submit" disabled={vm.isSubmitting} className="w-full">
      {vm.isSubmitting ? 'Creating account…' : (<>Create account <UserPlus size={18} /></>)}
    </Button>
  </form>
  )
}
