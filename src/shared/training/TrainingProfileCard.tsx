import type { TrainingProfile } from '../models/types'
import { bmi, bmiLabel } from './program'

/** Weight, height, BMI and the coach's remarks, read only. */
interface Props {
  profile: TrainingProfile
  title?: string
  remarksLabel?: string
}

export const TrainingProfileCard = ({ profile, title = 'Body details', remarksLabel = 'Notes from your coach' }: Props) => {
  const value = bmi(profile.weightKg, profile.heightCm)
  const stats = [
    { label: 'Weight', value: profile.weightKg ? `${profile.weightKg} kg` : '—' },
    { label: 'Height', value: profile.heightCm ? `${profile.heightCm} cm` : '—' },
    { label: 'BMI', value: value ? `${value}` : '—', hint: value ? bmiLabel(value) : undefined },
  ]
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-steel">{title}</h2>
      <dl className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 rounded-lg bg-coal-900 px-2.5 py-2.5 sm:px-3">
            <dt className="text-xs text-steel">{s.label}</dt>
            <dd className="whitespace-nowrap font-display text-xl font-bold leading-tight sm:text-2xl">{s.value}</dd>
            {s.hint && <dd className="text-xs text-steel">{s.hint}</dd>}
          </div>
        ))}
      </dl>
      {profile.remarks && (
        <div className="mt-3">
          <p className="text-xs text-steel">{remarksLabel}</p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm">{profile.remarks}</p>
        </div>
      )}
    </section>
  )
}
