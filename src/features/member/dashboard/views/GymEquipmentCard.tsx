import { Dumbbell } from 'lucide-react'
import { EquipmentStatusBadge } from '../../../../shared/components/EquipmentStatusBadge'
import { FeatureGuard } from '../../../../shared/features/FeatureGuard'
import { LockedFeature } from '../../../../shared/features/LockedFeature'
import { useGymEquipmentViewModel } from '../viewModels/useGymEquipmentViewModel'

const Card = () => {
  const vm = useGymEquipmentViewModel()
  if (vm.isLoading) return <div className="h-32 animate-pulse rounded-xl bg-coal-800" />
  if (vm.error || vm.total === 0) return null // nothing listed yet: no empty card for members
  const rows = vm.showAll ? vm.all : vm.problems
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
          <Dumbbell className="text-ember" aria-hidden="true" /> Equipment
        </h2>
        <span className="text-sm text-steel">
          <span className="font-semibold text-emerald-400">{vm.available}</span> of {vm.total} working
        </span>
      </div>
      {vm.problems.length === 0 && !vm.showAll && <p className="mt-3 text-sm text-steel">Everything is working today.</p>}
      {rows.length > 0 && (
        <ul className="mt-3 divide-y divide-coal-600">
          {rows.map((i) => (
            <li key={i.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{i.name}</p>
                {(i.note || i.area) && <p className="text-xs text-steel">{i.note ?? i.area}</p>}
              </div>
              <EquipmentStatusBadge status={i.status} />
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={vm.toggleAll} className="mt-3 text-sm font-semibold text-ember hover:underline">
        {vm.showAll ? 'Show only what is out of order' : `See all ${vm.total} machines`}
      </button>
    </section>
  )
}

/** The live list when the gym has the add-on; otherwise a locked card so members know it exists. */
export const GymEquipmentCard = () => (
  <FeatureGuard feature="equipment_status" fallback={<LockedFeature feature="equipment_status" audience="member" compact />}>
    <Card />
  </FeatureGuard>
)
