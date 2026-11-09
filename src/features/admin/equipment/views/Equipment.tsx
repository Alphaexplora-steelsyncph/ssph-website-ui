import { memo } from 'react'
import { FeatureGuard } from '../../../../shared/features/FeatureGuard'
import { LockedFeature } from '../../../../shared/features/LockedFeature'
import { EquipmentPanel } from './EquipmentPanel'

/** Page container: composes sections only. Shown only when the gym has the Equipment Status add-on. */
const Equipment = memo(() => (
  <FeatureGuard feature="equipment_status" fallback={<LockedFeature feature="equipment_status" audience="admin" />}>
    <div className="mb-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Equipment</h1>
      <p className="mt-2 text-steel">Your machines and their status. Members see this list, with your notes, on their dashboard.</p>
    </div>
    <EquipmentPanel />
  </FeatureGuard>
))
Equipment.displayName = 'Equipment'

export default Equipment
