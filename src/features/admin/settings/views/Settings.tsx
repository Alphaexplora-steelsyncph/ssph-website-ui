import { memo } from 'react'
import { EmailNoticesSection } from './EmailNoticesSection'
import { GymProfileSection } from './GymProfileSection'
import { GymQrSection } from './GymQrSection'
import { MemberDueDaySection } from './MemberDueDaySection'
import { PlansSection } from './PlansSection'
import { SettingsHeading } from './SettingsHeading'

/** Page container: composes sections only. */
const Settings = memo(() => (
  <>
    <SettingsHeading />
    <div className="max-w-4xl space-y-6">
      <GymProfileSection />
      <GymQrSection />
      <MemberDueDaySection />
      <PlansSection />
      <EmailNoticesSection />
    </div>
  </>
))
Settings.displayName = 'Settings'

export default Settings
