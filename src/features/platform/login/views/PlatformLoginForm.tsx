import { ShieldCheck } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { DemoCredentials } from '../../../../shared/components/DemoCredentials'
import { TextField } from '../../../../shared/components/TextField'
import { usePlatformLoginViewModel } from '../viewModels/usePlatformLoginViewModel'

export const PlatformLoginForm = () => {
  const vm = usePlatformLoginViewModel()
  return (
    <>
      {vm.signedOutForIdle && (
        <p role="status" className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          You were signed out after a period of inactivity.
        </p>
      )}
      <form onSubmit={vm.submit} noValidate className="space-y-5">
        {vm.error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>
        )}
        <TextField label="Email" type="email" autoComplete="username" value={vm.email}
          onChange={(e) => vm.setEmail(e.target.value)} error={vm.fieldErrors.email} />
        <TextField label="Password" type="password" autoComplete="current-password" value={vm.password}
          onChange={(e) => vm.setPassword(e.target.value)} error={vm.fieldErrors.password} />
        <Button type="submit" disabled={vm.isSubmitting} className="w-full">
          {vm.isSubmitting ? 'Signing in…' : (<>Sign in <ShieldCheck size={18} /></>)}
        </Button>
      </form>
      <p className="mt-4 text-xs text-steel">Two-factor authentication is added when the backend is connected.</p>
      <DemoCredentials email="super@steelsync.ph" password="Super@123" />
    </>
  )
}
