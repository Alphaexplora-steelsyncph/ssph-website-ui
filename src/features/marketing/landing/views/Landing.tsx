import { lazy, memo, Suspense } from 'react'
import { LazyMount } from '../../../../shared/components/brand/LazyMount'
import { MorphShape } from '../../../../shared/components/brand/MorphShape'
import { useLandingViewModel } from '../viewModels/useLandingViewModel'
import { HeroSection } from './HeroSection'
import { LandingNav } from './LandingNav'
import { DESKTOP_POSES, MOBILE_POSES } from './morphPoses'

const BelowTheFold = lazy(() => import('./BelowTheFold'))

/** Page container: marketing site on the main domain (gym owners). */
const Landing = memo(() => {
  const vm = useLandingViewModel()
  return (
    <div className="min-h-screen overflow-x-clip bg-ink">
      <LandingNav vm={vm} />
      <main>
        <HeroSection vm={vm} />
        <LazyMount minHeight="300vh" id="more" force={vm.showAll}>
          <Suspense fallback={<div style={{ minHeight: '300vh' }} />}>
            <BelowTheFold vm={vm} />
          </Suspense>
        </LazyMount>
      </main>
      <MorphShape poses={DESKTOP_POSES} mobilePoses={MOBILE_POSES} />
    </div>
  )
})
Landing.displayName = 'Landing'

export default Landing
