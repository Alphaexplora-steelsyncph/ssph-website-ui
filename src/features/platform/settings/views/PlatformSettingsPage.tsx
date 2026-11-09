import { memo } from 'react'
import { PlatformSettingsForm } from './PlatformSettingsForm'

/** Page container: composes sections only. */
const PlatformSettingsPage = memo(() => (
  <>
    <h1 className="font-display text-5xl font-extrabold uppercase">Platform settings</h1>
    <p className="mb-8 mt-2 text-steel">Rules that apply to every gym on SteelSync PH.</p>
    <PlatformSettingsForm />
  </>
))
PlatformSettingsPage.displayName = 'PlatformSettingsPage'

export default PlatformSettingsPage
