import { UserPlus } from 'lucide-react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'

export const UserManagementHeading = () => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="font-display text-5xl font-extrabold uppercase">Members</h1>
      <p className="mt-2 text-steel">Everyone enrolled at your gym. Terminated accounts can no longer check in until you reinstate them.</p>
    </div>
    <RoleGuard requiredPermission={PERMISSIONS.ENROLL_MEMBERS}>
      <Button to="/admin/members/add" variant="outline" className="shrink-0">
        <UserPlus size={18} /> Add existing member
      </Button>
    </RoleGuard>
  </div>
)
