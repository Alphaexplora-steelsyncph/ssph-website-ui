import { memo } from 'react'
import { GymCrowdCard } from './GymCrowdCard'
import { GymEquipmentCard } from './GymEquipmentCard'
import { MembershipSection } from './MembershipSection'
import { MyPayments } from './MyPayments'
import { RecentVisits } from './RecentVisits'
import { ScanCheckInCard } from './ScanCheckInCard'

/** Page container: composes sections only. */
const MemberDashboard = memo(() => (
  <div className="space-y-6">
    <MembershipSection />
    <div className="grid gap-6 sm:grid-cols-2">
      <ScanCheckInCard />
      <GymCrowdCard />
    </div>
    <GymEquipmentCard />
    <RecentVisits />
    <MyPayments />
  </div>
))
MemberDashboard.displayName = 'MemberDashboard'

export default MemberDashboard
