import { memo } from 'react'
import { VisitsPanel } from './VisitsPanel'

/** Page container: composes sections only. */
const Visits = memo(() => (
  <>
    <div className="mb-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Visits</h1>
      <p className="mt-2 text-steel">Every check-in at your gym, newest first.</p>
    </div>
    <VisitsPanel />
  </>
))
Visits.displayName = 'Visits'

export default Visits
