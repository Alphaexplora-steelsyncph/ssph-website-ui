import { memo } from 'react'
import { CheckInStatus } from './CheckInStatus'

/** Page container: the full-screen result a member sees right after scanning the gym QR. */
const CheckIn = memo(() => (
  <main className="flex min-h-screen items-center justify-center px-5 py-10">
    <CheckInStatus />
  </main>
))
CheckIn.displayName = 'CheckIn'

export default CheckIn
