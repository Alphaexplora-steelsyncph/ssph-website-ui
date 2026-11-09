import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react'
import type { ProgramCategory } from '../../../../shared/models/types'
import { getCategoryType, progressionWeekCount } from '../../../../shared/training/categoryTypes'
import { getCategoryVisual } from '../../../../shared/training/categoryVisuals'
import type { ProgramEditorVM } from '../viewModels/useProgramEditorViewModel'
import { CellInput } from './CellInput'

const cellInput = 'w-full min-w-16 bg-transparent p-2 text-center outline-none focus:bg-stone-100'
const iconBtn = 'rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 disabled:opacity-40'
const th = 'border border-zinc-300 p-2 text-center text-xs'

interface Props {
  vm: ProgramEditorVM
  category: ProgramCategory
  index: number
}

/** Desktop: one category as an editable table. Columns come from the category type. */
export const CategoryTableEditor = ({ vm, category, index }: Props) => {
  const type = getCategoryType(category.categoryType)
  const visual = getCategoryVisual(category.categoryType)
  const weekCount = progressionWeekCount(type, vm.program!.weeks.length)
  const multi = type.progressionColumns.length > 1
  const span = multi ? 2 : 1
  const full = category.exercises.length >= vm.limits.exercises
  const last = vm.program!.categories.length - 1

  return (
    <section data-testid="category-editor">
      <div className={`mb-3 flex items-center gap-3 rounded-lg border-l-4 p-3 ${visual.sheetHeader}`}>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${visual.sheetIcon}`} title={type.label}>
          <visual.Icon size={18} />
        </span>
        <input
          aria-label="Category name"
          value={category.name}
          maxLength={60}
          onChange={(e) => vm.setCategoryName(index, e.target.value)}
          placeholder={type.label.toUpperCase()}
          className="min-w-0 flex-1 rounded bg-transparent px-1 text-lg font-bold uppercase outline-none focus:bg-white"
        />
        <input
          aria-label="Category subtitle"
          value={category.subtitle}
          maxLength={60}
          onChange={(e) => vm.setCategorySubtitle(index, e.target.value)}
          placeholder="Subtitle (optional)"
          className="w-48 min-w-0 rounded bg-transparent px-1 text-right text-sm text-zinc-600 outline-none placeholder:text-zinc-400 focus:bg-white"
        />
        <div className="flex shrink-0 items-center">
          <button type="button" disabled={index === 0} onClick={() => vm.moveCategory(index, -1)} title="Move up" className={iconBtn}>
            <ArrowUp size={16} />
          </button>
          <button type="button" disabled={index === last} onClick={() => vm.moveCategory(index, 1)} title="Move down" className={iconBtn}>
            <ArrowDown size={16} />
          </button>
          <button type="button" onClick={() => vm.deleteCategory(index)} title="Delete category" className={`${iconBtn} hover:text-red-600`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-300">
        <table className="w-full border-collapse text-sm">
          <thead className={visual.sheetHead}>
            <tr>
              <th className={`${th} min-w-48 text-left`} rowSpan={span}>
                {type.exerciseColumn?.label ?? 'EXERCISE'}
              </th>
              {type.fixedColumnsBefore.map((c) => (
                <th key={c.key} className={th} rowSpan={span}>
                  {c.label}
                </th>
              ))}
              {Array.from({ length: weekCount }, (_, i) => (
                <th key={i} className={th} colSpan={type.progressionColumns.length}>
                  WEEK {i + 1}
                </th>
              ))}
              {type.fixedColumnsAfter.map((c) => (
                <th key={c.key} className={th} rowSpan={span}>
                  {c.label}
                </th>
              ))}
              <th className={`${th} w-24`} rowSpan={span} aria-label="Row actions" />
            </tr>
            {multi && (
              <tr>
                {Array.from({ length: weekCount }, (_, i) =>
                  type.progressionColumns.map((c) => (
                    <th key={`${i}-${c.key}`} className={`${th} font-medium`}>
                      {c.label}
                    </th>
                  )),
                )}
              </tr>
            )}
          </thead>
          <tbody className="bg-white">
            {category.exercises.map((ex, e) => {
              const rowName = ex.name || `row ${e + 1}`
              return (
                <tr key={ex.id}>
                  <td className="border border-zinc-300 p-0">
                    {type.exerciseColumn ? (
                      <CellInput
                        column={type.exerciseColumn}
                        value={ex.name}
                        onChange={(v) => vm.setExerciseName(index, e, v)}
                        className={`${cellInput} !text-left`}
                        label={`${type.exerciseColumn.label} ${e + 1}`}
                      />
                    ) : (
                      <input
                        aria-label={`Exercise ${e + 1}`}
                        value={ex.name}
                        maxLength={80}
                        placeholder="Exercise"
                        onChange={(ev) => vm.setExerciseName(index, e, ev.target.value)}
                        className={`${cellInput} !text-left placeholder:text-zinc-300`}
                      />
                    )}
                  </td>
                  {type.fixedColumnsBefore.map((c) => (
                    <td key={c.key} className="border border-zinc-300 p-0">
                      <CellInput column={c} value={ex.fixed[c.key] ?? ''} onChange={(v) => vm.setExerciseFixed(index, e, c.key, v)} className={cellInput} label={`${c.label} for ${rowName}`} />
                    </td>
                  ))}
                  {Array.from({ length: weekCount }, (_, w) =>
                    type.progressionColumns.map((c) => (
                      <td key={`${w}-${c.key}`} className="border border-zinc-300 p-0">
                        <input
                          aria-label={`Week ${w + 1} ${c.label} for ${rowName}`}
                          value={ex.progression[w]?.[c.key] ?? ''}
                          maxLength={60}
                          onChange={(ev) => vm.setExerciseWeek(index, e, w, c.key, ev.target.value)}
                          className={cellInput}
                        />
                      </td>
                    )),
                  )}
                  {type.fixedColumnsAfter.map((c) => (
                    <td key={c.key} className="border border-zinc-300 p-0">
                      <CellInput column={c} value={ex.fixed[c.key] ?? ''} onChange={(v) => vm.setExerciseFixed(index, e, c.key, v)} className={cellInput} label={`${c.label} for ${rowName}`} />
                    </td>
                  ))}
                  <td className="border border-zinc-300">
                    <div className="flex items-center justify-center gap-0.5">
                      <button type="button" disabled={full} onClick={() => vm.addExercise(index, e)} title="Add a row below" className={iconBtn}>
                        <Plus size={15} />
                      </button>
                      <button type="button" disabled={full} onClick={() => vm.duplicateExercise(index, e)} title="Duplicate row" className={iconBtn}>
                        <Copy size={15} />
                      </button>
                      <button type="button" onClick={() => vm.deleteExercise(index, e)} title="Delete row" className={`${iconBtn} hover:text-red-600`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        disabled={full}
        onClick={() => vm.addExercise(index)}
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#0e0e0f] hover:underline disabled:opacity-50"
      >
        <Plus size={16} /> Add row
      </button>
    </section>
  )
}
