import { useMemberDashboardViewModel } from '../viewModels/useMemberDashboardViewModel'
import { MemberGreeting } from './MemberGreeting'
import { MembershipStatusCard } from './MembershipStatusCard'

/** Section that owns the dashboard ViewModel; greeting and card are presentational. */
export const MembershipSection = () => {
  const vm = useMemberDashboardViewModel()
  return (
    <div>
      <MemberGreeting firstName={vm.firstName} gymName={vm.gymName} />
      <MembershipStatusCard vm={vm} />
    </div>
  )
}
