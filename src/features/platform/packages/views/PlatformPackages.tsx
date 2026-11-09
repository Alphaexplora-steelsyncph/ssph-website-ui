import { memo } from 'react'
import { PackagesSection } from './PackagesSection'

/** Page container: composes sections only. */
const PlatformPackages = memo(() => (
  <>
    <h1 className="font-display text-5xl font-extrabold uppercase">Packages</h1>
    <p className="mb-8 mt-2 max-w-2xl text-steel">
      What gyms can subscribe to. Every package includes Basic Gym Management; add-on features are switched on per package
      and can be overridden per gym.
    </p>
    <PackagesSection />
  </>
))
PlatformPackages.displayName = 'PlatformPackages'

export default PlatformPackages
