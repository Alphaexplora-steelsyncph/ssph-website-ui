import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../../../../shared/components/AuthShell'
import { MemberRegisterForm } from './MemberRegisterForm'

/** Page container: layout shell + sections only. */
const MemberRegister = memo(() => (
  <AuthShell
    badge="New member"
    title="Create account"
    subtitle="Walk-in or new member? Sign up, then your gym admin confirms your membership."
    headline="Join the iron."
    blurb="One account, one QR scan, every visit logged."
    footer={
      <>
        Already have an account? <Link to="/login" className="font-semibold text-ember hover:underline">Log in</Link>
      </>
    }
  >
    <MemberRegisterForm />
  </AuthShell>
))
MemberRegister.displayName = 'MemberRegister'

export default MemberRegister
