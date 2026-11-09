import { formatDate, formatTime, formatWeekday } from '../../../../shared/utils/format'
import type { MemberDetailVM } from '../viewModels/useMemberDetailViewModel'

export const MemberVisitsCard = ({ vm }: { vm: MemberDetailVM }) => (
  <section className="h-fit rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="font-display text-2xl font-bold uppercase">Recent visits</h2>
    {vm.visitsError && <p className="mt-4 text-sm text-red-300">{vm.visitsError}</p>}
    {!vm.visitsError && vm.visits.length === 0 && <p className="mt-4 text-sm text-steel">No visits yet.</p>}
    <ul className="mt-3 divide-y divide-coal-600">
      {vm.visits.map((v) => (
        <li key={v.id} className="flex items-baseline justify-between gap-3 py-3 text-sm">
          <span>
            {formatDate(v.checkedInAt)}
            <span className="ml-2 text-steel">{formatWeekday(v.checkedInAt)}</span>
          </span>
          <span className="text-steel">{formatTime(v.checkedInAt)}</span>
        </li>
      ))}
    </ul>
    {vm.totalVisits > vm.visits.length && (
      <p className="mt-3 text-xs text-steel">Showing the latest {vm.visits.length} of {vm.totalVisits} visits.</p>
    )}
    {vm.totalVisits > 0 && vm.totalVisits <= vm.visits.length && (
      <p className="mt-3 text-xs text-steel">{vm.totalVisits} {vm.totalVisits === 1 ? 'visit' : 'visits'} in total.</p>
    )}
  </section>
)
