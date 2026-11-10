import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Switch } from '../../../../shared/components/Switch'
import { ordinal } from '../../../../shared/utils/memberDues'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'

/** Super admin switches the fixed member payment day on or off; the gym admin picks the day. */
export const GymMemberDuesCard = ({ vm }: { vm: GymDetailVM }) => {
  const gym = vm.gym!
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase">Member payment day</h2>
          <p className="mt-1 text-sm text-steel">
            For gyms whose members all pay on the same day each month. New members on plans longer than one month pay only for the days
            until that day; their plan starts on it.
          </p>
        </div>
        {vm.editing && (
          <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_GYMS}>
            <Switch checked={vm.memberDuesView} label={`Fixed member payment day for ${gym.name}`} onChange={vm.setMemberDues} />
          </RoleGuard>
        )}
      </div>
      <p className="mt-3 text-sm">
        {vm.memberDuesStaged ? (
          <span className="font-semibold text-amber-400">Turns {vm.memberDuesView ? 'on' : 'off'} when you press Save</span>
        ) : !gym.memberDuesEnabled ? (
          <span className="text-steel">Off. Members pay when they enroll, like before.</span>
        ) : gym.memberDueDay ? (
          <span className="font-semibold text-emerald-400">On · members pay every {ordinal(gym.memberDueDay)} of the month (set by the gym admin)</span>
        ) : (
          <span className="font-semibold text-amber-400">On · waiting for the gym admin to pick the day in Settings</span>
        )}
      </p>
    </section>
  )
}
