import { Avatar } from '../../../../shared/components/Avatar'

/** Read only: the front desk takes the member's photo and uses it to match them at check-in. */
export const MemberPhotoCard = ({ name, photoUrl }: { name: string; photoUrl?: string }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="font-display text-2xl font-bold uppercase">Profile photo</h2>
    <div className="mt-4 flex flex-wrap items-center gap-5">
      <Avatar name={name} photoUrl={photoUrl} size="lg" />
      <p className="min-w-0 flex-1 text-sm text-steel">
        {photoUrl
          ? 'The front desk took this photo. They see it when you check in. Ask them if you want a new one.'
          : 'No photo yet. The front desk will take your photo at your next visit, so they can match you when you check in.'}
      </p>
    </div>
  </section>
)
