import { memo } from 'react'
import { AuthShell } from '../../../../shared/components/AuthShell'
import { ActivateAccountForm } from './ActivateAccountForm'

/** Page container: layout shell + sections only. */
const ActivateAccount = memo(() => (
  <AuthShell
    badge="SteelSync invite"
    title="Set up your login"
    subtitle="Create a password for your SteelSync account. This link works once."
    headline="Lift. Scan. Sync."
    blurb="One password and you are set: scan the gym QR, track every visit and see when your plan ends."
  >
    <ActivateAccountForm />
  </AuthShell>
))
ActivateAccount.displayName = 'ActivateAccount'

export default ActivateAccount
