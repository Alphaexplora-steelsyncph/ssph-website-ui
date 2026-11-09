import { memo } from 'react'
import { ReportsPanel } from './ReportsPanel'

/** Page container: composes sections only. */
const Reports = memo(() => (
  <>
    <div className="mb-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Reports</h1>
      <p className="mt-2 text-steel">Money, members and visits at a glance. Times are Philippine time.</p>
    </div>
    <ReportsPanel />
  </>
))
Reports.displayName = 'Reports'

export default Reports
