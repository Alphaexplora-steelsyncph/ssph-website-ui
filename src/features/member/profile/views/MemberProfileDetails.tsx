import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { StatusBadge } from '../../../../shared/components/StatusBadge'
import { formatDate } from '../../../../shared/utils/format'
import { useMemberProfileViewModel } from '../viewModels/useMemberProfileViewModel'
import { MemberPhotoCard } from './MemberPhotoCard'

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex justify-between gap-4 py-3 text-sm">
    <dt className="text-steel">{label}</dt>
    <dd className="text-right font-medium">{children}</dd>
  </div>
)

export const MemberProfileDetails = () => {
  const { user, membership, isLoading, error, signOut } = useMemberProfileViewModel()
  const member = membership?.member

  return (
    <div className="space-y-6">
      {member && <MemberPhotoCard name={user?.fullName ?? member.fullName} photoUrl={member.photoUrl} />}

      <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-bold uppercase">Account</h2>
        <dl className="mt-2 divide-y divide-coal-600">
          <Row label="Name">{user?.fullName}</Row>
          <Row label="Email">{user?.email}</Row>
          {member?.phone && <Row label="Mobile">{member.phone}</Row>}
          <Row label="Gym">{membership?.gymName ?? user?.gymName}</Row>
        </dl>
      </section>

      <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-bold uppercase">Membership</h2>
        {isLoading && <p className="mt-3 text-sm text-steel">Loading…</p>}
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        {membership && (
          <dl className="mt-2 divide-y divide-coal-600">
            <Row label="Status"><StatusBadge status={membership.status} /></Row>
            {member ? (
              <>
                <Row label="Plan">{member.plan}</Row>
                <Row label="Member since">{formatDate(member.memberSince)}</Row>
                <Row label={membership.status === 'Expired' ? 'Expired on' : 'Valid until'}>{formatDate(member.expiresAt)}</Row>
              </>
            ) : (
              <p className="py-3 text-sm text-steel">No membership on file yet. Please see the front desk.</p>
            )}
          </dl>
        )}
        <p className="mt-3 text-xs text-steel">To change your email, mobile number or plan, please ask the front desk. They will update it for you.</p>
      </section>

      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
      >
        <LogOut size={16} /> Log out
      </button>
    </div>
  )
}
