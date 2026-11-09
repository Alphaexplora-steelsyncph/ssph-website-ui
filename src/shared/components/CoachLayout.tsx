import { Outlet } from 'react-router-dom'
import { FeatureGuard } from '../features/FeatureGuard'
import { LockedFeature } from '../features/LockedFeature'
import { CoachHeader } from './CoachHeader'

/** Coach shell (Coach App add-on). When the gym no longer has the add-on, every page shows the locked card. */
const CoachLayout = () => (
  <div className="min-h-screen">
    <CoachHeader />
    <main className="mx-auto max-w-6xl px-5 py-8">
      <FeatureGuard feature="coach_app" fallback={<LockedFeature feature="coach_app" audience="coach" />}>
        <Outlet />
      </FeatureGuard>
    </main>
  </div>
)

export default CoachLayout
