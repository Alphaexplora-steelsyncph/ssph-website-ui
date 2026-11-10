import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import type { MemberRecord } from '../../../../shared/models/types'
import { Link } from 'react-router-dom'
import { Avatar } from '../../../../shared/components/Avatar'
import { StatusBadge } from '../../../../shared/components/StatusBadge'
import { useMemberDetailViewModel } from '../viewModels/useMemberDetailViewModel'
import { MemberProfileForm } from './MemberProfileForm'
import { CollectBalanceDialog } from '../../members/views/CollectBalanceDialog'
import { PayInstallmentDialog } from '../../members/views/PayInstallmentDialog'
import { ReinstateMemberDialog } from '../../members/views/ReinstateMemberDialog'
import { CheckInBlockCard } from './CheckInBlockCard'
import { MemberPhotoControls } from './MemberPhotoControls'
import { MemberPaymentDates } from './MemberPaymentDates'
import { MemberPrivacyCard } from './MemberPrivacyCard'
import { MemberVisitsCard } from './MemberVisitsCard'
import { MembershipSummary, type SettleAction } from './MembershipSummary'
import { SwitchToInstallmentDialog } from './SwitchToInstallmentDialog'

/** Section that owns the ViewModel; the cards below are presentational. */
export const MemberDetailPanel = ({ memberId }: { memberId: string }) => {
  const vm = useMemberDetailViewModel(memberId)
  const [settling, setSettling] = useState<SettleAction | null>(null) // UI-local: the open payment dialog
  const settled = (updated: MemberRecord) => {
    vm.onUpgraded(updated) // keeps the photo, stores the updated member
    setSettling(null)
  }

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
              <MembershipSummary member={vm.member} onUpgrade={vm.canEdit ? vm.openUpgrade : undefined} onAction={vm.canEdit ? setSettling : undefined} />
              <CheckInBlockCard vm={vm} />
              <MemberPrivacyCard member={vm.member} />
            </div>
            <div className="space-y-6">
              <MemberPaymentDates key={`${vm.member.installmentsPaid ?? 0}-${vm.member.expiresAt}-${vm.member.balanceDue}`} member={vm.member} />
              <MemberVisitsCard vm={vm} />
            </div>
          </div>
          {settling === 'pay' && <PayInstallmentDialog member={vm.member} onClose={() => setSettling(null)} onUpdated={settled} />}
          {settling === 'switch' && <SwitchToInstallmentDialog member={vm.member} onClose={() => setSettling(null)} onUpdated={settled} />}
          {settling === 'collect' && <CollectBalanceDialog member={vm.member} onClose={() => setSettling(null)} onUpdated={settled} />}
          {(settling === 'renew' || settling === 'reinstate') && (
            <ReinstateMemberDialog member={vm.member} mode={settling} onClose={() => setSettling(null)} onReinstated={settled} />
          )}
          {vm.upgradeOpen && <ReinstateMemberDialog member={vm.member} mode="upgrade" onClose={vm.closeUpgrade} onReinstated={vm.onUpgraded} />}
        </>
      )}
    </div>
  )
}
