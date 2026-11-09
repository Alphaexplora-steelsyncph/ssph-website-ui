import { LogIn } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { DemoCredentials } from '../../../../shared/components/DemoCredentials'
import { TextField } from '../../../../shared/components/TextField'
import { useMemberLoginViewModel } from '../viewModels/useMemberLoginViewModel'

export const MemberLoginForm = () => {
  const { email, setEmail, password, setPassword, fieldErrors, error, isSubmitting, submit, isFinishingCheckIn } =
    useMemberLoginViewModel()

  return (
    <>
      {isFinishingCheckIn && (
        <p role="status" className="mb-5 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
          Log in to finish checking in. You will go straight back to the check-in screen.
        </p>
      )}
      <form onSubmit={submit} noValidate className="space-y-5">
        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <TextField label="Email" type="email" autoComplete="email" placeholder="you@email.com" value={email}
          onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
        <TextField label="Password" type="password" autoComplete="current-password" placeholder="Your password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in…' : (<>Log in <LogIn size={18} /></>)}
        </Button>
      </form>
      <DemoCredentials email="member@steelsync.ph" password="Member@123" />
    </>
  )
}
