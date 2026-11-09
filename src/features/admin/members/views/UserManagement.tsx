import { memo } from 'react'
import { UserManagementHeading } from './UserManagementHeading'
import { UserManagementTable } from './UserManagementTable'

/** Page container: composes sections only. */
const UserManagement = memo(() => (
  <>
    <UserManagementHeading />
    <UserManagementTable />
  </>
))
UserManagement.displayName = 'UserManagement'

export default UserManagement
