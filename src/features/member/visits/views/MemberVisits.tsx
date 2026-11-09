import { memo } from 'react'
import { MemberVisitsHeading } from './MemberVisitsHeading'
import { VisitHistory } from './VisitHistory'

/** Page container: composes sections only. */
const MemberVisits = memo(() => (
  <>
    <MemberVisitsHeading />
    <VisitHistory />
  </>
))
MemberVisits.displayName = 'MemberVisits'

export default MemberVisits
