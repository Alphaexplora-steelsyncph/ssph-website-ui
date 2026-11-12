import { Dumbbell, Flag } from 'lucide-react'
import { EquipmentPhoto } from '../../../../shared/components/EquipmentPhoto'
import { EquipmentStatusBadge } from '../../../../shared/components/EquipmentStatusBadge'
import { FeatureGuard } from '../../../../shared/features/FeatureGuard'
import { LockedFeature } from '../../../../shared/features/LockedFeature'
import { useGymEquipmentViewModel } from '../viewModels/useGymEquipmentViewModel'
import { ReportEquipmentDialog } from './ReportEquipmentDialog'

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
            <li key={i.id} className="flex items-center gap-3 py-2.5 text-sm">
              <EquipmentPhoto name={i.name} photoUrl={i.photoUrl} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{i.name}</p>
                {(i.note || i.area) && <p className="text-xs text-steel">{i.note ?? i.area}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <EquipmentStatusBadge status={i.status} />
                {i.status !== 'Broken' && (
                  <button
                    type="button"
                    onClick={() => vm.openReport(i.name)}
                    className="text-xs font-semibold text-steel hover:text-zinc-100"
                    aria-label={`Report a problem with ${i.name}`}
                  >
                    Report
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={vm.toggleAll} className="text-sm font-semibold text-ember hover:underline">
          {vm.showAll ? 'Show only what is out of order' : `See all ${vm.total} machines`}
        </button>
        <button
          type="button"
          onClick={() => vm.openReport()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-steel hover:text-zinc-100"
        >
          <Flag size={14} aria-hidden="true" /> Something not working?
        </button>
      </div>
      {vm.isReporting && <ReportEquipmentDialog name={vm.reportingName} onClose={vm.closeReport} />}
    </section>
  )
}

/** The live list when the gym has the add-on; otherwise a locked card so members know it exists. */
export const GymEquipmentCard = () => (
  <FeatureGuard feature="equipment_status" fallback={<LockedFeature feature="equipment_status" audience="member" compact />}>
    <Card />
  </FeatureGuard>
)
