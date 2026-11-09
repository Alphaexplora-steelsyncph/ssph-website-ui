import { memo } from 'react'
import { EnrollMemberHeading } from './EnrollMemberHeading'
import { EnrollmentPanel } from './EnrollmentPanel'

/** Page container: composes sections only. */
const EnrollMember = memo(() => (
  <>
    <EnrollMemberHeading />
    <EnrollmentPanel />
  </>
))
EnrollMember.displayName = 'EnrollMember'

export default EnrollMember
