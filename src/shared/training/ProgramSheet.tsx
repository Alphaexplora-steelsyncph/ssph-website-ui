import { Fragment } from 'react'
import type { TrainingProgram } from '../models/types'
import { getCategoryType, progressionWeekCount } from './categoryTypes'
import { getCategoryVisual } from './categoryVisuals'
import { DAYS, displayProgramTitle, formatProgramDate, upcomingWeeks } from './program'

interface Props {
  program: TrainingProgram
  /** Who it is for and by whom, printed in the header. */
  memberName?: string
  coachName?: string
  gymName?: string
  /** Drop weeks that are already over from the calendar (member view). The exercise tables are not affected. */
  hideCompletedWeeks?: boolean
  /** Export copy: tables keep their full width instead of scrolling, so nothing is cut off in the PNG/PDF. */
  forExport?: boolean
}

const cellBorder = 'border border-zinc-300'

/**
 * Read-only program on a light "paper" sheet: the weekly calendar, then one table per category.
 * The same component is used on screen (tablet/desktop) and for the PNG/PDF download, so they always match.
 */
export const ProgramSheet = ({ program, memberName, coachName, gymName, hideCompletedWeeks = false, forExport = false }: Props) => {
  const weeks = upcomingWeeks(program, hideCompletedWeeks)
  const wrap = forExport ? 'overflow-visible' : 'overflow-x-auto'
  const tableWidth = forExport ? 'w-auto' : 'w-full'
  const dates = program.startDate || program.endDate ? `${formatProgramDate(program.startDate) || '—'} to ${formatProgramDate(program.endDate) || '—'}` : ''

  return (
    <div className="space-y-8 rounded-xl bg-[#f3efe6] p-6 text-zinc-900 sm:p-8" data-program-sheet>
      <header className="flex flex-col gap-3 border-b-4 border-[#0e0e0f] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {dates && <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{dates}</p>}
          <h2 className="font-display text-4xl font-extrabold uppercase leading-none tracking-wide">{displayProgramTitle(program.title)}</h2>
          {memberName && <p className="mt-1 text-sm text-zinc-600">Program for {memberName}</p>}
        </div>
        <div className="shrink-0 text-left sm:text-right">
          {gymName && <p className="font-display text-xl font-bold uppercase leading-none">{gymName}</p>}
          {coachName && <p className="text-sm text-zinc-600">Coach {coachName}</p>}
        </div>
      </header>

      {weeks.length > 0 ? (
        <div className={`rounded-lg border border-zinc-300 ${wrap}`}>
          <table className={`${tableWidth} table-fixed border-collapse text-center text-sm`}>
            <thead className="bg-[#0e0e0f] text-white">
              <tr>
                <th className="w-20 p-2 text-xs font-bold uppercase tracking-wide">Week</th>
                {DAYS.map((day) => (
                  <th key={day} className="w-28 p-2 text-xs font-bold uppercase tracking-wide">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wIndex) => {
                const both = (d: number) => !!week.am[d]?.trim() && !!week.pm[d]?.trim()
                const bg = wIndex % 2 ? 'bg-zinc-100' : 'bg-white'
                return (
                  <Fragment key={week.id}>
                    <tr>
                      <td className={`${cellBorder} ${bg} p-2 font-bold`} rowSpan={week.showPm ? 2 : 1}>
                        Week {week.id}
                      </td>
                      {week.am.map((value, d) => (
                        <td
                          key={d}
                          className={`border-x border-t border-zinc-300 ${bg} whitespace-pre-wrap p-2 align-middle text-xs ${!week.showPm || both(d) ? 'border-b' : ''}`}
                        >
                          {week.showPm && both(d) && <span className="mb-0.5 block text-[10px] font-semibold text-zinc-400">AM</span>}
                          {value}
                        </td>
                      ))}
                    </tr>
                    {week.showPm && (
                      <tr>
                        {week.pm.map((value, d) => (
                          <td key={d} className={`border-x border-b border-zinc-300 ${bg} whitespace-pre-wrap p-2 align-middle text-xs ${both(d) ? 'border-t' : ''}`}>
                            {both(d) && <span className="mb-0.5 block text-[10px] font-semibold text-zinc-400">PM</span>}
                            {value}
                          </td>
                        ))}
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500">All the weeks of this program are done.</p>
      )}

      {program.categories.map((category) => {
        const type = getCategoryType(category.categoryType)
        const weekCount = progressionWeekCount(type, program.weeks.length)
        const multi = type.progressionColumns.length > 1
        const visual = getCategoryVisual(category.categoryType)
        return (
          <section key={category.id}>
            <div className={`mb-3 flex items-center gap-3 rounded-lg border-l-4 p-3 ${visual.sheetHeader}`}>
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${visual.sheetIcon}`}>
                <visual.Icon size={16} aria-hidden="true" />
              </span>
              <h3 className="min-w-0 flex-1 truncate font-bold uppercase">{category.name || type.label}</h3>
              {category.subtitle && <span className="shrink-0 text-sm text-zinc-500">{category.subtitle}</span>}
            </div>
            <div className={`rounded-lg border border-zinc-300 ${wrap}`}>
              <table className={`${tableWidth} border-collapse text-left text-sm`}>
                <thead className={visual.sheetHead}>
                  <tr>
                    <th className={`${cellBorder} min-w-40 p-2`} rowSpan={multi ? 2 : 1}>
                      {type.exerciseColumn?.label ?? 'EXERCISE'}
                    </th>
                    {type.fixedColumnsBefore.map((col) => (
                      <th key={col.key} className={`${cellBorder} p-2 text-center`} rowSpan={multi ? 2 : 1}>
                        {col.label}
                      </th>
                    ))}
                    {Array.from({ length: weekCount }, (_, i) => (
                      <th key={i} className={`${cellBorder} p-2 text-center`} colSpan={type.progressionColumns.length}>
                        WEEK {i + 1}
                      </th>
                    ))}
                    {type.fixedColumnsAfter.map((col) => (
                      <th key={col.key} className={`${cellBorder} p-2 text-center`} rowSpan={multi ? 2 : 1}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                  {multi && (
                    <tr>
                      {Array.from({ length: weekCount }, (_, i) =>
                        type.progressionColumns.map((col) => (
                          <th key={`${i}-${col.key}`} className={`${cellBorder} p-1 text-center text-xs font-medium`}>
                            {col.label}
                          </th>
                        )),
                      )}
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white">
                  {category.exercises.map((ex) => (
                    <tr key={ex.id}>
                      <td className={`${cellBorder} p-2 font-medium`}>{ex.name}</td>
                      {type.fixedColumnsBefore.map((col) => (
                        <td key={col.key} className={`${cellBorder} p-2 text-center`}>
                          {ex.fixed[col.key] ?? ''}
                        </td>
                      ))}
                      {Array.from({ length: weekCount }, (_, i) =>
                        type.progressionColumns.map((col) => (
                          <td key={`${i}-${col.key}`} className={`${cellBorder} p-2 text-center`}>
                            {ex.progression[i]?.[col.key] ?? ''}
                          </td>
                        )),
                      )}
                      {type.fixedColumnsAfter.map((col) => (
                        <td key={col.key} className={`${cellBorder} p-2 text-center`}>
                          {ex.fixed[col.key] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
      <p className="text-right text-[10px] uppercase tracking-wider text-zinc-400">SteelSync PH · Coach App</p>
    </div>
  )
}
