import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { InviteCard } from '../../../../shared/components/InviteCard'
import type { EnrollmentResult } from '../../../../shared/models/types'
import { formatDate, formatPeso } from '../../../../shared/utils/format'

interface Props {
  result: EnrollmentResult
  onEnrollAnother: () => void
  /** The photo taken at the desk could not be saved (the enrollment itself went through). */
  photoFailed?: boolean
}

export const EnrollmentSuccess = ({ result, onEnrollAnother, photoFailed }: Props) => {
  const { member, payment, visitLogged, inviteToken } = result
  const rows: [string, string][] = [
    ['Member', member.fullName],
    ['Email', member.email || 'None (walk-in)'],
    ['Plan', member.plan],
    ['Member since', formatDate(member.memberSince)],
    ['Valid until', formatDate(member.expiresAt)],
    ['Paid', `${formatPeso(payment.amount)} via ${payment.method}`],
    ...(payment.referenceNo ? [['Reference no.', payment.referenceNo] as [string, string]] : []),
    ...(payment.receiptFileName ? [['Receipt', payment.receiptFileName] as [string, string]] : []),
    ["Today's visit", visitLogged ? 'Logged' : 'Not logged'],
  ]

  return (
    <div role="status" className="max-w-xl rounded-xl border border-emerald-500/40 bg-coal-800 p-6 sm:p-8">
      <CheckCircle2 size={44} className="text-emerald-400" />
      <h2 className="mt-4 font-display text-4xl font-extrabold uppercase">Enrolled</h2>
      <p className="mt-1 text-steel">{member.fullName} is now an active member.</p>
      {photoFailed && (
        <p role="alert" className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          The photo could not be saved. Open the member's page from the Members list and take it again.
        </p>
      )}

      <dl className="mt-6 divide-y divide-coal-600">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2.5 text-sm">
            <dt className="text-steel">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      {inviteToken && <InviteCard token={inviteToken} email={member.email} />}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onEnrollAnother}>Enroll another</Button>
        <Button to="/admin/members" variant="outline">View members</Button>
      </div>
    </div>
  )
}
