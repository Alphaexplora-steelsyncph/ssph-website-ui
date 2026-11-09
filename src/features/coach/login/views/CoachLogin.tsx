import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../../../../shared/components/AuthShell'
import { CoachLoginForm } from './CoachLoginForm'

/** Page container: layout shell + sections only. */
const CoachLogin = memo(() => (
  <AuthShell
    badge="Coach"
    title="Coach login"
    subtitle="Your clients and their training programs."
    headline="Program the work. Track the gains."
    blurb="Pick your clients, write their weekly program and exercise tables, and they see it on their phone right away."
    footer={
      <>
        Are you a member? <Link to="/login" className="font-semibold text-ember hover:underline">Member login</Link>
      </>
    }
  >
    <CoachLoginForm />
  </AuthShell>
))
CoachLogin.displayName = 'CoachLogin'

export default CoachLogin
