import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../../../../shared/components/AuthShell'
import { MemberLoginForm } from './MemberLoginForm'

/** Page container: layout shell + sections only. */
const MemberLogin = memo(() => (
  <AuthShell
    badge="Member"
    title="Welcome back"
    subtitle="Log in first, then scan the QR code at the gym to log your visit."
    headline="Lift. Scan. Sync."
    blurb="Your visits, your membership and your expiry date, always in your pocket."
    footer={
      <>
        New here? <Link to="/register" className="font-semibold text-ember hover:underline">Create an account</Link>
        <span className="mx-2 text-coal-500">|</span>
        <Link to="/admin/login" className="hover:text-zinc-100">Gym admin</Link>
        <span className="mx-2 text-coal-500">|</span>
        <Link to="/coach/login" className="hover:text-zinc-100">Coach</Link>
      </>
    }
  >
    <MemberLoginForm />
  </AuthShell>
))
MemberLogin.displayName = 'MemberLogin'

export default MemberLogin
