import { GymStatusBadge } from '../../../../shared/components/PlatformBadges'
import { InviteCard } from '../../../../shared/components/InviteCard'
import { useGymDetailViewModel } from '../viewModels/useGymDetailViewModel'
import { GymAdminsCard } from './GymAdminsCard'
import { GymBillingHistory } from './GymBillingHistory'
import { GymFeatureToggles } from './GymFeatureToggles'
import { GymMemberDuesCard } from './GymMemberDuesCard'
import { GymOverviewCard } from './GymOverviewCard'
import { GymPaymentForm } from './GymPaymentForm'
import { GymPaymentLog } from './GymPaymentLog'
import { GymProfileForm } from './GymProfileForm'

/** Section that owns the gym-detail ViewModel; the cards below are presentational. */
export const GymDetailPanel = () => {
  const vm = useGymDetailViewModel()

  if (vm.isLoading) return <div className="h-48 animate-pulse rounded-xl bg-coal-800" />
  if (!vm.gym) return <p role="alert" className="text-red-300">{vm.error ?? 'Gym not found.'}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-5xl font-extrabold uppercase">{vm.gym.name}</h1>
        <GymStatusBadge status={vm.gym.status} reason={vm.gym.suspendReason} />
      </div>

      {vm.error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}
      {vm.notice && <div role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{vm.notice}</div>}
      {vm.issuedLink && (
        <div className="relative">
          <InviteCard token={vm.issuedLink.token} email={vm.issuedLink.email} title={vm.issuedLink.title} description={vm.issuedLink.description} />
          <button type="button" onClick={vm.clearIssuedLink} className="absolute right-3 top-3 text-xs text-steel hover:text-zinc-100">Dismiss</button>
        </div>
      )}

      <GymOverviewCard vm={vm} />
      <div id="billing" className="grid gap-6 xl:grid-cols-2">
        <GymPaymentForm vm={vm} />
        <GymBillingHistory vm={vm} />
      </div>
      <GymPaymentLog vm={vm} />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <GymFeatureToggles vm={vm} />
          <GymMemberDuesCard vm={vm} />
        </div>
        <GymAdminsCard vm={vm} />
      </div>
      <GymProfileForm key={`${vm.gym.id}:${vm.profileVersion}`} vm={vm} />
    </div>
  )
}
