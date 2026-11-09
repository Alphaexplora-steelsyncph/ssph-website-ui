import { memo } from 'react'
import { MemberProfileDetails } from './MemberProfileDetails'

/** Page container: composes sections only. */
const MemberProfile = memo(() => (
  <>
    <h1 className="font-display text-5xl font-extrabold uppercase">My profile</h1>
    <p className="mb-6 mt-2 text-steel">Your account and membership details.</p>
    <MemberProfileDetails />
  </>
))
MemberProfile.displayName = 'MemberProfile'

export default MemberProfile
