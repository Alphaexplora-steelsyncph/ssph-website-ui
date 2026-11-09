import { UserPlus } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../../../../shared/components/Button'
import { FeatureGuard } from '../../../../shared/features/FeatureGuard'
import { LockedFeature } from '../../../../shared/features/LockedFeature'
import { useCoachesViewModel } from '../viewModels/useCoachesViewModel'
import { CoachesPanel } from './CoachesPanel'
import { CoachLinkDialog } from './CoachLinkDialog'
import { InviteCoachDialog } from './InviteCoachDialog'

const CoachesPage = () => {
  const vm = useCoachesViewModel()
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl font-extrabold uppercase">Coaches</h1>
          <p className="mt-2 text-steel">
            Coaches log in at <span className="font-mono text-zinc-100">/coach/login</span>, pick members as clients and write their programs.
          </p>
        </div>
        {vm.canManage && (
          <Button onClick={vm.openInvite}>
            <UserPlus size={18} /> Invite coach
          </Button>
        )}
      </div>
      <CoachesPanel vm={vm} />
      <InviteCoachDialog vm={vm} />
      <CoachLinkDialog vm={vm} />
    </>
  )
}

/** Page container. Shown only when the gym has the Coach App add-on. */
const Coaches = memo(() => (
  <FeatureGuard feature="coach_app" fallback={<LockedFeature feature="coach_app" audience="admin" />}>
    <CoachesPage />
  </FeatureGuard>
))
Coaches.displayName = 'Coaches'

export default Coaches
