import { memo } from 'react'
import { useParams } from 'react-router-dom'
import { MemberDetailPanel } from './MemberDetailPanel'

/** Page container: reads the route and composes sections only. */
const MemberDetail = memo(() => {
  const { memberId = '' } = useParams()
  // key: opening another member starts with fresh state
  return <MemberDetailPanel key={memberId} memberId={memberId} />
})
MemberDetail.displayName = 'MemberDetail'

export default MemberDetail
