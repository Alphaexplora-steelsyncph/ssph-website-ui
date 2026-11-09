import { CalendarClock, CheckCircle2 } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { ordinal } from '../../../../shared/utils/memberDues'
import { useMemberDueDayViewModel } from '../viewModels/useMemberDueDayViewModel'

/** Only for gyms where SteelSync switched on a fixed member payment day. */
export const MemberDueDaySection = () => {
  const vm = useMemberDueDayViewModel()
  if (vm.isLoading || !vm.enabled) return null

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
        <CalendarClock className="text-ember" aria-hidden="true" /> Member payment day
      </h2>
      <p className="mt-1 text-sm text-steel">
        The day of the month your members pay. When you enroll someone on a plan longer than one month, they pay only for the days until
        this day, their plan starts on it, and the plan price is due then.
      </p>
      {!vm.savedDay && (
        <p role="status" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Pick the day so enrollments can follow it.
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-steel">Members pay every</span>
          <select
            value={vm.day}
            onChange={(e) => vm.setDay(e.target.value)}
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
        <Button type="button" onClick={vm.save} disabled={!vm.isDirty || vm.isSaving}>
          {vm.isSaving ? 'Saving…' : 'Save'}
        </Button>
        {vm.saved && (
          <span role="status" className="flex items-center gap-1.5 pb-3 text-sm text-emerald-400">
            <CheckCircle2 size={16} /> Saved
          </span>
        )}
      </div>
      {vm.error && <p role="alert" className="mt-2 text-sm text-red-400">{vm.error}</p>}
      <p className="mt-3 text-xs text-steel">Only days 1 to 28, so every month has the day. Changing it affects new enrollments only.</p>
    </section>
  )
}
