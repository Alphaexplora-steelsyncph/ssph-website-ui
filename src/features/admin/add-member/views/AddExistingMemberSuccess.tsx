import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { InviteCard } from '../../../../shared/components/InviteCard'
import type { AddExistingMemberResult } from '../../../../shared/models/types'
import { formatDate } from '../../../../shared/utils/format'

interface Props {
  result: AddExistingMemberResult
  onAddAnother: () => void
}

export const AddExistingMemberSuccess = ({ result, onAddAnother }: Props) => {
  const { member, inviteToken } = result
  const rows: [string, string][] = [
    ['Member', member.fullName],
    ['Email', member.email],
    ['Plan', member.plan],
    ['Member since', formatDate(member.memberSince)],
    ['Plan ends on', formatDate(member.expiresAt)],
    ['Status', member.status],
  ]
  return (
    <div role="status" className="max-w-xl rounded-xl border border-emerald-500/40 bg-coal-800 p-6 sm:p-8">
      <CheckCircle2 size={44} className="text-emerald-400" />
      <h2 className="mt-4 font-display text-4xl font-extrabold uppercase">Member added</h2>
      <p className="mt-1 text-steel">{member.fullName} is now in your SteelSync member list.</p>
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
        <Button onClick={onAddAnother}>Add another</Button>
        <Button to="/admin/members" variant="outline">Back to members</Button>
      </div>
    </div>
  )
}
