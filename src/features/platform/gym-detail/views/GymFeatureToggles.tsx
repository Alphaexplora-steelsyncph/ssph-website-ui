import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Switch } from '../../../../shared/components/Switch'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'

export const GymFeatureToggles = ({ vm }: { vm: GymDetailVM }) => {
  const gym = vm.gym!
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Features</h2>
      <p className="mt-1 text-sm text-steel">
        Included features follow the {gym.packageName} package. Switch one on or off to override it for this gym only.
      </p>
      <ul className="mt-4 divide-y divide-coal-600">
        {gym.features.map((f) => (
          <li key={f.key} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {f.label}
                {f.availability === 'coming_soon' && (
                  <span className="rounded bg-coal-600 px-2 py-0.5 text-xs font-normal text-steel">Coming soon</span>
                )}
              </p>
              <p className="text-xs text-steel">{f.description}</p>
              <p className="mt-1 text-xs text-steel">
                {f.alwaysOn
                  ? 'Always included'
                  : f.override === null
                    ? f.includedInPackage
                      ? `Included in ${gym.packageName}`
                      : `Not in ${gym.packageName}`
                    : `Override: ${f.override ? 'on' : 'off'} for this gym`}
                {f.override !== null && !f.alwaysOn && (
                  <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_GYMS}>
                    {' · '}
                    <button type="button" onClick={() => vm.setFeature(f.key, null)} className="font-semibold text-ember hover:underline">
                      Follow package
                    </button>
                  </RoleGuard>
                )}
              </p>
            </div>
            <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_GYMS}>
              <Switch
                checked={f.enabled}
                disabled={f.alwaysOn || vm.busy === `feature:${f.key}`}
                label={`${f.label} for ${gym.name}`}
                onChange={(next) => vm.setFeature(f.key, next === f.includedInPackage ? null : next)}
              />
            </RoleGuard>
          </li>
        ))}
      </ul>
    </section>
  )
}
