import { memo } from 'react'
import { AuthShell } from '../../../../shared/components/AuthShell'
import { PlatformLoginForm } from './PlatformLoginForm'

/** Page container. This route is not linked anywhere on the public site. */
const PlatformLogin = memo(() => (
  <AuthShell
    badge="ALPHAEXPLORA · SteelSync platform"
    title="Staff sign in"
    subtitle="For ALPHAEXPLORA INC. staff only. Every sign-in is recorded."
    headline="Connecting the iron."
    blurb="ALPHAEXPLORA manages every gym, package and bill on SteelSync PH from here."
  >
    <PlatformLoginForm />
  </AuthShell>
))
PlatformLogin.displayName = 'PlatformLogin'

export default PlatformLogin
