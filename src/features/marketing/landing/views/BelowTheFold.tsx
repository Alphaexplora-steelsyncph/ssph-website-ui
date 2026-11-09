import type { LandingVM } from '../viewModels/useLandingViewModel'
import { AddressSection } from './AddressSection'
import { ContactSection } from './ContactSection'
import { FactsSection } from './FactsSection'
import { FaqSection } from './FaqSection'
import { HowSection } from './HowSection'
import { LandingFooter } from './LandingFooter'
import { OldWaySection } from './OldWaySection'
import { PlatesSection } from './PlatesSection'
import { RolesSection } from './RolesSection'

/** Everything after the hero, in one lazily loaded chunk (one extra request, fetched while the hero is on screen). */
const BelowTheFold = ({ vm }: { vm: LandingVM }) => (
  <>
    <OldWaySection vm={vm} />
    <HowSection vm={vm} />
    <PlatesSection vm={vm} />
    <RolesSection vm={vm} />
    <AddressSection vm={vm} />
    <FactsSection vm={vm} />
    <FaqSection vm={vm} />
    <ContactSection vm={vm} />
    <LandingFooter vm={vm} />
  </>
)

export default BelowTheFold
