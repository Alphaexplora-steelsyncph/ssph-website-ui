import { CalendarClock } from 'lucide-react'
import { ordinal } from '../../../../shared/utils/memberDues'
import type { SettingsVM } from '../viewModels/useSettingsViewModel'

/** Only for gyms where SteelSync switched on a fixed member payment day. */
export const MemberDueDaySection = ({ vm }: { vm: SettingsVM }) => {
  if (!vm.dueDayEnabled) return null

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
        <CalendarClock className="text-ember" aria-hidden="true" /> Member payment day
      </h2>
      <p className="mt-1 text-sm text-steel">
        The day of the month your members pay. When you enroll someone on a plan longer than one month, they pay only for the days until
        this day, their plan starts on it, and the plan price is due then.
      </p>
      {!vm.editing && (
        <p className="mt-4 text-sm">
          Members pay every{' '}
          <span className="font-semibold text-zinc-100">{vm.savedDueDay ? `${ordinal(vm.savedDueDay)} of the month` : 'day not picked yet'}</span>
        </p>
      )}
      {vm.editing && (
        <>
          {!vm.savedDueDay && (
            <p role="status" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              Pick the day so enrollments can follow it.
            </p>
          )}
          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm font-medium text-steel">Members pay every</span>
            <select
              value={vm.dueDay}
              onChange={(e) => vm.setDueDay(e.target.value)}
              aria-label="Member payment day"
              className="w-48 rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-zinc-100 focus:border-ember focus:outline-none"
            >
              <option value="" disabled>
                Choose a day
              </option>
              {vm.days.map((d) => (
                <option key={d} value={d}>
                  {ordinal(d)} of the month
                </option>
              ))}
            </select>
          </label>
          <p className="mt-3 text-xs text-steel">Only days 1 to 28, so every month has the day. Changing it affects new enrollments only.</p>
        </>
      )}
    </section>
  )
}
