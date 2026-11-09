import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../../../../shared/components/AuthShell'
import { AdminLoginForm } from './AdminLoginForm'

/** Page container: layout shell + sections only. */
const AdminLogin = memo(() => (
  <AuthShell
    badge="Gym admin"
    title="Admin login"
    subtitle="Manage members, payments and visits for your gym."
    headline="Run the floor. Own the numbers."
    blurb="Enroll members, approve payments and see who is in the gym right now, all in one place."
    footer={
      <>
        Are you a member? <Link to="/login" className="font-semibold text-ember hover:underline">Member login</Link>
      </>
    }
  >
    <AdminLoginForm />
  </AuthShell>
))
AdminLogin.displayName = 'AdminLogin'

export default AdminLogin
