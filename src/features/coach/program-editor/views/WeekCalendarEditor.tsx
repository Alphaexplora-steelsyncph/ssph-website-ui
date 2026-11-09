import { Copy, Minus, Plus, Trash2 } from 'lucide-react'
import { Fragment } from 'react'
import { DAYS } from '../../../../shared/training/program'
import type { ProgramEditorVM } from '../viewModels/useProgramEditorViewModel'

const iconBtn = 'rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800'

/** Desktop: the weekly calendar as an editable table (AM row, optional PM row per week). */
export const WeekCalendarEditor = ({ vm }: { vm: ProgramEditorVM }) => {
  const weeks = vm.program!.weeks
  const full = weeks.length >= vm.limits.weeks
  return (
    <section>
      <div className="overflow-x-auto rounded-lg border border-zinc-300">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-center text-sm">
          <thead className="bg-[#0e0e0f] text-white">
            <tr>
              <th className="w-24 p-2 text-xs font-bold uppercase tracking-wide">Week</th>
              {DAYS.map((d) => (
                <th key={d} className="p-2 text-xs font-bold uppercase tracking-wide">
                  {d}
                </th>
              ))}
              <th className="w-24 p-2" aria-label="Week actions" />
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, w) => {
              const bg = w % 2 ? 'bg-zinc-50' : 'bg-white'
              const cell = (period: 'am' | 'pm', d: number) => (
                <td key={`${period}-${d}`} className={`border border-zinc-300 p-0 ${bg}`}>
                  {week.showPm && <span className="block pt-1 text-[10px] font-semibold text-zinc-400">{period.toUpperCase()}</span>}
                  <textarea
                    aria-label={`Week ${week.id} ${DAYS[d].toLowerCase()} ${period.toUpperCase()}`}
                    value={week[period][d]}
                    maxLength={120}
                    rows={2}
                    onChange={(e) => vm.setDay(w, period, d, e.target.value)}
                    className="block h-16 w-full resize-none bg-transparent p-2 text-center text-sm outline-none focus:bg-stone-100"
                  />
                </td>
              )
              return (
                <Fragment key={week.id}>
                  <tr>
                    <td className={`border border-zinc-300 p-2 ${bg}`} rowSpan={week.showPm ? 2 : 1}>
                      <p className="font-bold">Week {week.id}</p>
                      <button
                        type="button"
                        onClick={() => vm.toggleWeekPm(w)}
                        className="mx-auto mt-1 flex items-center gap-0.5 text-[11px] text-zinc-500 hover:text-[#0e0e0f]"
                      >
                        {week.showPm ? <Minus size={11} /> : <Plus size={11} />} PM row
                      </button>
                    </td>
                    {DAYS.map((_, d) => cell('am', d))}
                    <td className={`border border-zinc-300 ${bg}`} rowSpan={week.showPm ? 2 : 1}>
                      <div className="flex items-center justify-center gap-0.5">
                        <button type="button" disabled={full} onClick={() => vm.insertWeekAfter(w)} title="Add a week below" className={iconBtn}>
                          <Plus size={15} />
                        </button>
                        <button type="button" disabled={full} onClick={() => vm.duplicateWeek(w)} title="Duplicate week" className={iconBtn}>
                          <Copy size={15} />
                        </button>
                        {weeks.length > 1 && (
                          <button type="button" onClick={() => vm.deleteWeek(w)} title="Delete week" className={`${iconBtn} hover:text-red-600`}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {week.showPm && <tr>{DAYS.map((_, d) => cell('pm', d))}</tr>}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        disabled={full}
        onClick={vm.addWeek}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0e0e0f] hover:underline disabled:opacity-50"
      >
        <Plus size={16} /> Add week {full && `(max ${vm.limits.weeks})`}
      </button>
    </section>
  )
}
