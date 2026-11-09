import { KeyRound } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { TextField } from '../../../../shared/components/TextField'
import { useActivateAccountViewModel } from '../viewModels/useActivateAccountViewModel'

export const ActivateAccountForm = () => {
  const vm = useActivateAccountViewModel()

  if (vm.isLoading) return <p className="text-steel">Opening your invite…</p>

  if (vm.loadError || !vm.invite) {
    return (
      <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {vm.loadError ?? 'This invite link is not valid.'}
      </div>
    )
  }

  if (vm.invite.alreadyActivated) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-coal-500 bg-coal-800 px-4 py-3 text-sm">
          The account for <span className="font-semibold">{vm.invite.email}</span> is already set up.
        </p>
        <Button to={vm.loginPath} className="w-full">Log in</Button>
      </div>
    )
  }

  if (vm.invite.expired) {
    return (
      <div role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        This link has expired. {vm.isReset ? 'Ask SteelSync support for a new reset link.' : 'Ask the front desk for a new invite.'}
      </div>
    )
  }

  return (
    <form onSubmit={vm.submit} noValidate className="space-y-5">
      <div className="rounded-lg border border-coal-500 bg-coal-800 px-4 py-3 text-sm">
        <p className="font-semibold">{vm.invite.fullName}</p>
        <p className="text-steel">{vm.invite.email} · {vm.invite.gymName}</p>
      </div>
      {vm.error && (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>
      )}
      <TextField label={vm.isReset ? 'New password' : 'Create password'} type="password" autoComplete="new-password" placeholder="At least 8 characters"
        value={vm.password} onChange={(e) => vm.setPassword(e.target.value)} error={vm.fieldErrors.password} />
      <TextField label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat password"
        value={vm.confirm} onChange={(e) => vm.setConfirm(e.target.value)} error={vm.fieldErrors.confirm} />
      <Button type="submit" disabled={vm.isSubmitting} className="w-full">
        {vm.isSubmitting ? 'Saving…' : (<>{vm.isReset ? 'Save new password' : 'Activate account'} <KeyRound size={18} /></>)}
      </Button>
    </form>
  )
}
