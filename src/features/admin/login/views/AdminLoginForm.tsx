import { LogIn } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { DemoCredentials } from '../../../../shared/components/DemoCredentials'
import { TextField } from '../../../../shared/components/TextField'
import { useAdminLoginViewModel } from '../viewModels/useAdminLoginViewModel'

export const AdminLoginForm = () => {
  const { email, setEmail, password, setPassword, fieldErrors, error, isSubmitting, submit } =
    useAdminLoginViewModel()

  return (
    <>
      <form onSubmit={submit} noValidate className="space-y-5">
    {error && (
      <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    )}
    <TextField label="Email" type="email" autoComplete="email" placeholder="owner@yourgym.ph" value={email}
      onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
    <TextField label="Password" type="password" autoComplete="current-password" placeholder="Your password" value={password}
      onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
    <Button type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting ? 'Signing in…' : (<>Sign in <LogIn size={18} /></>)}
    </Button>
  </form>
      <DemoCredentials email="admin@steelsync.ph" password="Admin@123" />
    </>
  )
}
