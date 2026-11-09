import { memo } from 'react'
import { AuthShell } from '../../../../shared/components/AuthShell'
import { PlatformLoginForm } from './PlatformLoginForm'

/** Page container. This route is not linked anywhere on the public site. */
const PlatformLogin = memo(() => (
  <AuthShell
    badge="Alphaexplora · SteelSync platform"
    title="Staff sign in"
    subtitle="For Alphaexplora Inc. staff only. Every sign-in is recorded."
    headline="Connecting the iron."
    blurb="Alphaexplora manages every gym, package and bill on SteelSync PH from here."
  >
    <PlatformLoginForm />
  </AuthShell>
))
PlatformLogin.displayName = 'PlatformLogin'

export default PlatformLogin
