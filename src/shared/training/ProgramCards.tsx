import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { TrainingProgram } from '../models/types'
import { getCategoryType, progressionWeekCount } from './categoryTypes'
import { getCategoryVisual } from './categoryVisuals'
import { DAYS, displayProgramTitle, formatProgramDate, upcomingWeeks } from './program'

interface Props {
  program: TrainingProgram
  hideCompletedWeeks?: boolean
}

const dayLabel = (day: string) => day.charAt(0) + day.slice(1).toLowerCase()

/**
 * Phone layout of a program: one card per week (only the days with something on them) and one card per
 * category with each exercise as a small block. One week and one category are open at a time.
 */
export const ProgramCards = ({ program, hideCompletedWeeks = false }: Props) => {
  const weeks = upcomingWeeks(program, hideCompletedWeeks)
  const [openWeek, setOpenWeek] = useState<number | null>(weeks[0]?.id ?? null)
  const [openCategory, setOpenCategory] = useState<string | null>(program.categories[0]?.id ?? null)

  return (
    <div className="space-y-8">
      <div>
        {(program.startDate || program.endDate) && (
          <p className="text-xs font-semibold uppercase tracking-wider text-steel">
            {formatProgramDate(program.startDate) || '—'} to {formatProgramDate(program.endDate) || '—'}
          </p>
        )}
        <h2 className="font-display text-3xl font-extrabold uppercase leading-tight">{displayProgramTitle(program.title)}</h2>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-steel">Schedule</h3>
        {weeks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-coal-500 p-6 text-center text-sm text-steel">All the weeks of this program are done.</p>
        ) : (
          <div className="space-y-3">
            {weeks.map((week) => {
              const days = DAYS.map((day, i) => ({ day, am: week.am[i]?.trim() ?? '', pm: week.showPm ? (week.pm[i]?.trim() ?? '') : '' })).filter(
                (d) => d.am || d.pm,
              )
              const open = openWeek === week.id
              return (
                <div key={week.id} className="overflow-hidden rounded-xl border border-coal-600 bg-coal-800">
                  <button
                    type="button"
                    onClick={() => setOpenWeek(open ? null : week.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  >
                    <span className="font-display text-xl font-bold uppercase">Week {week.id}</span>
                    <ChevronDown size={18} className={`text-steel transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open &&
                    (days.length === 0 ? (
                      <p className="border-t border-coal-600 px-4 py-4 text-sm text-steel">Rest week: nothing scheduled.</p>
                    ) : (
                      <ul className="divide-y divide-coal-600 border-t border-coal-600">
                        {days.map(({ day, am, pm }) => (
                          <li key={day} className="px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-ember">{dayLabel(day)}</p>
                            {am && (
                              <p className="mt-0.5 whitespace-pre-wrap text-sm">
                                {pm && <span className="mr-1.5 text-[10px] font-semibold text-steel">AM</span>}
                                {am}
                              </p>
                            )}
                            {pm && (
                              <p className="mt-0.5 whitespace-pre-wrap text-sm">
                                <span className="mr-1.5 text-[10px] font-semibold text-steel">PM</span>
                                {pm}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ))}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {program.categories.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-steel">Exercises</h3>
          <div className="space-y-3">
            {program.categories.map((category) => {
              const type = getCategoryType(category.categoryType)
              const visual = getCategoryVisual(category.categoryType)
              const weekCount = progressionWeekCount(type, program.weeks.length)
              const open = openCategory === category.id
              return (
                <div key={category.id} className="overflow-hidden rounded-xl border border-coal-600 bg-coal-800">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(open ? null : category.id)}
                    aria-expanded={open}
                    className={`flex w-full items-center gap-3 border-l-4 px-4 py-3 text-left ${visual.darkHeader}`}
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${visual.darkIcon}`}>
                      <visual.Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold uppercase">{category.name || type.label}</span>
                      {category.subtitle && <span className="block truncate text-xs text-steel">{category.subtitle}</span>}
                    </span>
                    <ChevronDown size={18} className={`shrink-0 text-steel transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <ul className="divide-y divide-coal-600">
                      {category.exercises.length === 0 && <li className="px-4 py-3 text-sm text-steel">No exercises yet.</li>}
                      {category.exercises.map((ex) => {
                        const fixed = [...type.fixedColumnsBefore, ...type.fixedColumnsAfter].filter((c) => ex.fixed[c.key]?.trim())
                        return (
                          <li key={ex.id} className="px-4 py-3">
                            <p className="font-semibold">{ex.name || '—'}</p>
                            {fixed.length > 0 && (
                              <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                {fixed.map((c) => (
                                  <div key={c.key} className="flex gap-1">
                                    <dt className="text-steel">{c.label}</dt>
                                    <dd>{ex.fixed[c.key]}</dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                            {weekCount > 0 && (
                              <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-xs">
                                {Array.from({ length: weekCount }, (_, w) => (
                                  <div key={w} className="rounded-md bg-coal-700 px-1 py-1.5">
                                    <p className="text-[10px] font-semibold text-steel">WK {w + 1}</p>
                                    <p className="font-medium">
                                      {type.progressionColumns
                                        .map((c) => ex.progression[w]?.[c.key]?.trim())
                                        .filter(Boolean)
                                        .join(' × ') || '—'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
