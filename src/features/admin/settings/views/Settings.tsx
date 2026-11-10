import { memo } from 'react'
import { useSettingsViewModel } from '../viewModels/useSettingsViewModel'
import { EmailNoticesSection } from './EmailNoticesSection'
import { GymProfileSection } from './GymProfileSection'
import { GymQrSection } from './GymQrSection'
import { MemberDueDaySection } from './MemberDueDaySection'
import { PlansSection } from './PlansSection'
import { SettingsHeading } from './SettingsHeading'

/**
 * Page container: owns the settings ViewModel and composes the sections.
 * Read-only until Edit; changes are kept on the page and sent in one request when the admin presses Done.
 */
const Settings = memo(() => {
  const vm = useSettingsViewModel()

  return (
    <>
      <SettingsHeading vm={vm} />
      {vm.isLoading && <p className="text-sm text-steel">Loading settings…</p>}
      {vm.loadError && (
        <div role="alert" className="max-w-4xl rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.loadError}</div>
      )}
      {vm.gym && (
        <div className="max-w-4xl space-y-6">
          <GymProfileSection vm={vm} />
          <GymQrSection vm={vm} />
          <MemberDueDaySection vm={vm} />
          <PlansSection vm={vm} />
          <EmailNoticesSection />
        </div>
      )}
    </>
  )
})
Settings.displayName = 'Settings'

export default Settings
