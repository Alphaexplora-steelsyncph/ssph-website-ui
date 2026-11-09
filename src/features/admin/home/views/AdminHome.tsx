import { memo } from 'react'
import { AdminHomeCards } from './AdminHomeCards'
import { BillingNotice } from './BillingNotice'
import { AdminHomeHeading } from './AdminHomeHeading'
import { RecentCheckIns } from './RecentCheckIns'

/** Page container: composes sections only. */
const AdminHome = memo(() => (
  <>
    <BillingNotice />
    <AdminHomeHeading />
    <AdminHomeCards />
    <RecentCheckIns />
  </>
))
AdminHome.displayName = 'AdminHome'

export default AdminHome
