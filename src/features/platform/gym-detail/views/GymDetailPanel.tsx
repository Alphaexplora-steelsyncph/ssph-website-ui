import { Check, Pencil, X } from 'lucide-react'
import { useAuth } from '../../../../shared/auth/useAuth'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'
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
  const { hasPermission } = useAuth()
  const canEdit = hasPermission(PERMISSIONS.PLATFORM_MANAGE_GYMS) || hasPermission(PERMISSIONS.PLATFORM_MANAGE_BILLING)

  if (vm.isLoading) return <div className="h-48 animate-pulse rounded-xl bg-coal-800" />
  if (!vm.gym) return <p role="alert" className="text-red-300">{vm.error ?? 'Gym not found.'}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-5xl font-extrabold uppercase">{vm.gym.name}</h1>
          <GymStatusBadge status={vm.gym.status} reason={vm.gym.suspendReason} />
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-2">
            {vm.editing ? (
              <>
                <Button variant="outline" onClick={vm.cancelEditing} disabled={vm.isSaving}>
                  <X size={18} /> Cancel
                </Button>
                <Button onClick={vm.save} disabled={vm.isSaving}>
                  <Check size={18} /> {vm.isSaving ? 'Saving…' : 'Save'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={vm.startEditing}>
                <Pencil size={18} /> Edit
              </Button>
            )}
          </div>
        )}
      </div>
      {vm.editing && (
        <p role="status" className="text-sm text-amber-400">
          {vm.isDirty
            ? 'You have unsaved changes. Press Save to apply them all at once, or Cancel to discard.'
            : 'Editing. Billing, features, admin accounts, member payment day and the gym profile are kept here until you press Save.'}
        </p>
      )}

      {vm.error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}
      {vm.notice && <div role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{vm.notice}</div>}
      {vm.issuedLinks.map((link) => (
        <div key={link.token} className="relative">
          <InviteCard token={link.token} email={link.email} title={link.title} description={link.description} />
          <button type="button" onClick={() => vm.clearIssuedLink(link.token)} className="absolute right-3 top-3 text-xs text-steel hover:text-zinc-100">Dismiss</button>
        </div>
      ))}

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
