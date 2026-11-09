import { Lock } from 'lucide-react'
import { FEATURE_CATALOG, type FeatureKey } from './featureCatalog'

const MESSAGE = {
  admin: "This feature is not available on your gym's SteelSync plan. Please contact SteelSync support for details on how to add it.",
  member: 'This feature is not available at your gym yet. Please ask the front desk for more details.',
  coach: "This feature is no longer on your gym's SteelSync plan. Please ask the gym owner or admin.",
} as const

interface Props {
  feature: FeatureKey
  /** Gym admin (talks to SteelSync), member (talks to the front desk) or coach (talks to the gym). */
  audience: keyof typeof MESSAGE
  /** Smaller version for dashboard cards. */
  compact?: boolean
}

/**
 * Shown in place of an add-on the gym does not have, so admins and members can see it exists.
 * The backend still refuses its API, so nothing behind it can be used.
 */
export const LockedFeature = ({ feature, audience, compact = false }: Props) => {
  const def = FEATURE_CATALOG.find((f) => f.key === feature)
  const pitch = audience === 'coach' ? def?.description : (def?.pitch?.[audience] ?? def?.description)
  return (
    <section
      data-testid={`locked-${feature}`}
      className={`rounded-xl border border-dashed border-coal-500 bg-coal-800 ${compact ? 'p-5' : 'max-w-2xl p-6 sm:p-8'}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-coal-600 text-steel">
          <Lock size={18} aria-hidden="true" />
        </span>
        <span className="rounded-full border border-ember/50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-ember">Add-on</span>
      </div>
      <h2 className={`mt-3 font-display font-bold uppercase ${compact ? 'text-2xl' : 'text-4xl'}`}>{def?.label ?? feature}</h2>
      {pitch && <p className="mt-1 text-sm text-steel">{pitch}</p>}
      <p className={`mt-4 rounded-lg bg-coal-900 px-4 py-3 text-sm ${compact ? '' : 'sm:text-base'}`}>{MESSAGE[audience]}</p>
    </section>
  )
}
