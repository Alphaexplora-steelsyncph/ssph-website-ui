import { memo } from 'react'
import { PlatformOverviewPanel } from './PlatformOverviewPanel'

/** Page container: composes sections only. */
const PlatformHome = memo(() => (
  <>
    <h1 className="font-display text-5xl font-extrabold uppercase">Platform overview</h1>
    <p className="mb-8 mt-2 text-steel">Every gym on SteelSync PH at a glance.</p>
    <PlatformOverviewPanel />
  </>
))
PlatformHome.displayName = 'PlatformHome'

export default PlatformHome
