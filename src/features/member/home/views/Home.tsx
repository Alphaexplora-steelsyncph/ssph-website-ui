import { memo } from 'react'
import { Footer } from '../../../../shared/components/Footer'
import { Navbar } from '../../../../shared/components/Navbar'
import { useHomeViewModel } from '../viewModels/useHomeViewModel'
import { CtaSection } from './CtaSection'
import { FeaturesSection } from './FeaturesSection'
import { HeroSection } from './HeroSection'
import { HowItWorksSection } from './HowItWorksSection'

const Home = memo(() => {
  const { memberFeatures, adminFeatures, steps } = useHomeViewModel()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection memberFeatures={memberFeatures} adminFeatures={adminFeatures} />
        <HowItWorksSection steps={steps} />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
})
Home.displayName = 'Home'

export default Home
