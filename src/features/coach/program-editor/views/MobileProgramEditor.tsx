import { ChevronRight, Copy, Minus, Plus, Trash2, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { getCategoryType, progressionWeekCount } from '../../../../shared/training/categoryTypes'
import { getCategoryVisual } from '../../../../shared/training/categoryVisuals'
import { DAYS } from '../../../../shared/training/program'
import type { ProgramEditorVM } from '../viewModels/useProgramEditorViewModel'
import { AddCategoryMenu } from './AddCategoryMenu'
import { CellInput } from './CellInput'

const field =
  'w-full rounded-lg border border-coal-500 bg-coal-900 px-3 py-2.5 text-base text-zinc-100 placeholder:text-coal-500 focus:border-ember focus:outline-none'
const small = 'w-full rounded-md border border-coal-500 bg-coal-900 px-2 py-2 text-center text-sm text-zinc-100 focus:border-ember focus:outline-none'
const dayName = (d: string) => d.charAt(0) + d.slice(1).toLowerCase()

/** Full-screen panel for editing one week or one category on a phone. */
const Panel = ({ title, onClose, children, actions }: { title: string; onClose: () => void; children: ReactNode; actions?: ReactNode }) => (
  <div className="fixed inset-0 z-40 overflow-y-auto bg-charcoal" role="dialog" aria-modal="true" aria-label={title}>
    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-coal-600 bg-coal-900 px-4 py-3">
      <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-steel hover:text-zinc-100">
        <X size={20} />
      </button>
      <h2 className="min-w-0 flex-1 truncate font-display text-2xl font-bold uppercase">{title}</h2>
      {actions}
      <button type="button" onClick={onClose} className="rounded-lg bg-ember px-4 py-1.5 text-sm font-semibold text-charcoal">
        Done
      </button>
    </div>
    <div className="space-y-4 px-4 py-5 pb-16">{children}</div>
  </div>
)

const WeekPanel = ({ vm, index, onClose }: { vm: ProgramEditorVM; index: number; onClose: () => void }) => {
  const week = vm.program!.weeks[index]
  if (!week) return null
  const full = vm.program!.weeks.length >= vm.limits.weeks
  return (
    <Panel
      title={`Week ${week.id}`}
      onClose={onClose}
      actions={
        <>
          <button type="button" disabled={full} onClick={() => vm.duplicateWeek(index)} title="Duplicate week" className="rounded p-1.5 text-steel">
            <Copy size={18} />
          </button>
          {vm.program!.weeks.length > 1 && (
            <button
              type="button"
              onClick={() => {
                vm.deleteWeek(index)
                onClose()
              }}
              title="Delete week"
              className="rounded p-1.5 text-steel hover:text-red-400"
            >
              <Trash2 size={18} />
            </button>
          )}
        </>
      }
    >
      <button type="button" onClick={() => vm.toggleWeekPm(index)} className="inline-flex items-center gap-1 text-sm font-semibold text-ember">
        {week.showPm ? <Minus size={14} /> : <Plus size={14} />} {week.showPm ? 'Remove PM sessions' : 'Add PM sessions'}
      </button>
      {DAYS.map((day, d) => (
        <div key={day} className="rounded-xl border border-coal-600 bg-coal-800 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ember">{dayName(day)}</p>
          <textarea
            aria-label={`${dayName(day)} AM`}
            rows={2}
            maxLength={120}
            value={week.am[d]}
            placeholder={week.showPm ? 'AM session' : 'Session (blank = rest)'}
            onChange={(e) => vm.setDay(index, 'am', d, e.target.value)}
            className={field}
          />
          {week.showPm && (
            <textarea
              aria-label={`${dayName(day)} PM`}
              rows={2}
              maxLength={120}
              value={week.pm[d]}
              placeholder="PM session"
              onChange={(e) => vm.setDay(index, 'pm', d, e.target.value)}
              className={`${field} mt-2`}
            />
          )}
        </div>
      ))}
    </Panel>
  )
}

const CategoryPanel = ({ vm, index, onClose }: { vm: ProgramEditorVM; index: number; onClose: () => void }) => {
  const category = vm.program!.categories[index]
  if (!category) return null
  const type = getCategoryType(category.categoryType)
  const weekCount = progressionWeekCount(type, vm.program!.weeks.length)
  const fixed = [...type.fixedColumnsBefore, ...type.fixedColumnsAfter]
  const full = category.exercises.length >= vm.limits.exercises
  return (
    <Panel
      title={category.name || type.label}
      onClose={onClose}
      actions={
        <button
          type="button"
          onClick={() => {
            vm.deleteCategory(index)
            onClose()
          }}
          title="Delete category"
          className="rounded p-1.5 text-steel hover:text-red-400"
        >
          <Trash2 size={18} />
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <input aria-label="Category name" value={category.name} maxLength={60} onChange={(e) => vm.setCategoryName(index, e.target.value)} className={`${field} uppercase`} />
        <input aria-label="Category subtitle" value={category.subtitle} maxLength={60} placeholder="Subtitle (optional)" onChange={(e) => vm.setCategorySubtitle(index, e.target.value)} className={field} />
      </div>
      {category.exercises.map((ex, e) => (
        <div key={ex.id} className="space-y-3 rounded-xl border border-coal-600 bg-coal-800 p-3">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              {type.exerciseColumn ? (
                <CellInput column={type.exerciseColumn} value={ex.name} onChange={(v) => vm.setExerciseName(index, e, v)} className={field} label={`${type.exerciseColumn.label} ${e + 1}`} />
              ) : (
                <input aria-label={`Exercise ${e + 1}`} value={ex.name} maxLength={80} placeholder="Exercise" onChange={(ev) => vm.setExerciseName(index, e, ev.target.value)} className={field} />
              )}
            </div>
            <button type="button" disabled={full} onClick={() => vm.duplicateExercise(index, e)} title="Duplicate row" className="p-1.5 text-steel">
              <Copy size={16} />
            </button>
            <button type="button" onClick={() => vm.deleteExercise(index, e)} title="Delete row" className="p-1.5 text-steel hover:text-red-400">
              <Trash2 size={16} />
            </button>
          </div>
          {fixed.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {fixed.map((c) => (
                <label key={c.key} className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-steel">{c.label}</span>
                  <CellInput column={c} value={ex.fixed[c.key] ?? ''} onChange={(v) => vm.setExerciseFixed(index, e, c.key, v)} className={small} label={`${c.label} for row ${e + 1}`} />
                </label>
              ))}
            </div>
          )}
          {weekCount > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: weekCount }, (_, w) => (
                <div key={w} className="rounded-lg bg-coal-900 p-2">
                  <p className="mb-1 text-[11px] font-semibold text-steel">WEEK {w + 1}</p>
                  <div className="flex items-center gap-1">
                    {type.progressionColumns.map((c, ci) => (
                      <div key={c.key} className="flex flex-1 items-center gap-1">
                        {ci > 0 && <span className="text-steel">×</span>}
                        <input
                          aria-label={`Week ${w + 1} ${c.label} for row ${e + 1}`}
                          value={ex.progression[w]?.[c.key] ?? ''}
                          placeholder={c.label}
                          maxLength={60}
                          onChange={(ev) => vm.setExerciseWeek(index, e, w, c.key, ev.target.value)}
                          className={small}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" disabled={full} onClick={() => vm.addExercise(index)} className="inline-flex items-center gap-1 text-sm font-semibold text-ember disabled:opacity-50">
        <Plus size={16} /> Add row
      </button>
    </Panel>
  )
}

/** Phone editor: tap a week or a category to edit it on its own screen. */
export const MobileProgramEditor = ({ vm }: { vm: ProgramEditorVM }) => {
  const [openWeek, setOpenWeek] = useState<number | null>(null)
  const [openCategory, setOpenCategory] = useState<number | null>(null)
  const p = vm.program!
  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <input aria-label="Program title" value={p.title} maxLength={120} onChange={(e) => vm.setTitle(e.target.value)} placeholder="Program title" className={`${field} font-semibold`} />
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-xs text-steel">Start</span>
            <input type="date" aria-label="Start date" value={p.startDate} onChange={(e) => vm.setStartDate(e.target.value)} className={`${field} ${vm.hasDateProblem && !p.startDate ? '!border-red-500' : ''}`} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-steel">End</span>
            <input type="date" aria-label="End date" value={p.endDate} min={p.startDate || undefined} onChange={(e) => vm.setEndDate(e.target.value)} className={`${field} ${vm.hasDateProblem && (!p.endDate || p.endDate < p.startDate) ? '!border-red-500' : ''}`} />
          </label>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-steel">Schedule</h2>
        <div className="space-y-2">
          {p.weeks.map((week, w) => {
            const planned = DAYS.filter((_, d) => week.am[d]?.trim() || (week.showPm && week.pm[d]?.trim())).length
            return (
              <button key={week.id} type="button" onClick={() => setOpenWeek(w)} className="flex w-full items-center gap-3 rounded-xl border border-coal-600 bg-coal-800 px-4 py-3.5 text-left">
                <span className="font-display text-xl font-bold uppercase">Week {week.id}</span>
                <span className="flex-1 text-sm text-steel">
                  {planned ? `${planned} day${planned > 1 ? 's' : ''} planned` : 'Nothing yet'}
                  {week.showPm && ' · AM/PM'}
                </span>
                <ChevronRight size={18} className="text-steel" />
              </button>
            )
          })}
        </div>
        <button type="button" disabled={p.weeks.length >= vm.limits.weeks} onClick={vm.addWeek} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ember disabled:opacity-50">
          <Plus size={16} /> Add week
        </button>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-steel">Exercises</h2>
        <div className="space-y-2">
          {p.categories.map((c, i) => {
            const v = getCategoryVisual(c.categoryType)
            return (
              <button key={c.id} type="button" onClick={() => setOpenCategory(i)} className={`flex w-full items-center gap-3 rounded-xl border border-l-4 border-coal-600 px-4 py-3 text-left ${v.darkHeader}`}>
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${v.darkIcon}`}>
                  <v.Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold uppercase">{c.name || getCategoryType(c.categoryType).label}</span>
                  <span className="block text-xs text-steel">
                    {c.exercises.length} row{c.exercises.length === 1 ? '' : 's'}
                    {c.subtitle && ` · ${c.subtitle}`}
                  </span>
                </span>
                <ChevronRight size={18} className="text-steel" />
              </button>
            )
          })}
        </div>
        <div className="mt-3">
          <AddCategoryMenu
            dark
            disabled={p.categories.length >= vm.limits.categories}
            onAdd={(t) => {
              vm.addCategory(t)
              setOpenCategory(p.categories.length)
            }}
          />
        </div>
      </section>

      {openWeek !== null && <WeekPanel vm={vm} index={openWeek} onClose={() => setOpenWeek(null)} />}
      {openCategory !== null && <CategoryPanel vm={vm} index={openCategory} onClose={() => setOpenCategory(null)} />}
    </div>
  )
}
