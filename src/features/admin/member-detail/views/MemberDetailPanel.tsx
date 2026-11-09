import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../../../shared/components/Avatar'
import { StatusBadge } from '../../../../shared/components/StatusBadge'
import { useMemberDetailViewModel } from '../viewModels/useMemberDetailViewModel'
import { MemberProfileForm } from './MemberProfileForm'
import { ReinstateMemberDialog } from '../../members/views/ReinstateMemberDialog'
import { CheckInBlockCard } from './CheckInBlockCard'
import { MemberPhotoControls } from './MemberPhotoControls'
import { MemberVisitsCard } from './MemberVisitsCard'
import { MembershipSummary } from './MembershipSummary'

/** Section that owns the ViewModel; the cards below are presentational. */
export const MemberDetailPanel = ({ memberId }: { memberId: string }) => {
  const vm = useMemberDetailViewModel(memberId)

  return (
    <div>
      <Link to="/admin/members" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-steel hover:text-zinc-100">
        <ArrowLeft size={16} /> All members
      </Link>

      {vm.isLoading && <div className="h-48 animate-pulse rounded-xl bg-coal-800" />}
      {!vm.isLoading && (vm.loadError || !vm.member) && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {vm.loadError ?? 'Member not found.'}
        </p>
      )}

      {vm.member && (
        <>
          <div className="mb-8 flex flex-wrap items-center gap-5">
            <Avatar name={vm.member.fullName} photoUrl={vm.photoUrl} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-5xl font-extrabold uppercase">{vm.member.fullName}</h1>
                <StatusBadge status={vm.member.status} />
              </div>
              <MemberPhotoControls vm={vm} />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <div className="space-y-6">
              <MemberProfileForm vm={vm} />
              <MembershipSummary member={vm.member} onUpgrade={vm.canEdit ? vm.openUpgrade : undefined} />
              <CheckInBlockCard vm={vm} />
            </div>
            <MemberVisitsCard vm={vm} />
          </div>
          {vm.upgradeOpen && <ReinstateMemberDialog member={vm.member} mode="upgrade" onClose={vm.closeUpgrade} onReinstated={vm.onUpgraded} />}
        </>
      )}
    </div>
  )
}
