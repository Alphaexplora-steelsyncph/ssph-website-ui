import type { TrainingProfile } from '../models/types'

/** The coach's notes about a member, read only. Shows nothing when there are no notes (unless `emptyText` is given). */
interface Props {
  profile: TrainingProfile
  title?: string
  remarksLabel?: string
  emptyText?: string
}

export const TrainingProfileCard = ({ profile, title = 'Notes from your coach', remarksLabel, emptyText }: Props) => {
  if (!profile.remarks && !emptyText) return null
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-steel">{title}</h2>
      {profile.remarks ? (
        <>
          {remarksLabel && <p className="mt-3 text-xs text-steel">{remarksLabel}</p>}
          <p className="mt-1 whitespace-pre-wrap text-sm">{profile.remarks}</p>
        </>
      ) : (
        <p className="mt-3 text-sm text-steel">{emptyText}</p>
      )}
    </section>
  )
}
