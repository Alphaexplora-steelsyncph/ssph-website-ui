import { Plus } from 'lucide-react'
import { memo } from 'react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'
import { GymsTable } from './GymsTable'

/** Page container: composes sections only. */
const PlatformGyms = memo(() => (
  <>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-5xl font-extrabold uppercase">Gyms</h1>
        <p className="mt-2 text-steel">Every gym on SteelSync PH, its package and this month's payment.</p>
      </div>
      <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_GYMS}>
        <Button to="/platform/gyms/new" className="shrink-0">
          <Plus size={18} /> Add gym
        </Button>
      </RoleGuard>
    </div>
    <GymsTable />
  </>
))
PlatformGyms.displayName = 'PlatformGyms'

export default PlatformGyms
