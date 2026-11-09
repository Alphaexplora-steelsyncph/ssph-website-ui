import type { ProgramEditorVM } from '../viewModels/useProgramEditorViewModel'
import { AddCategoryMenu } from './AddCategoryMenu'
import { CategoryTableEditor } from './CategoryTableEditor'
import { WeekCalendarEditor } from './WeekCalendarEditor'

const dateInput = (bad: boolean) =>
  `rounded-lg border bg-white px-2 py-1.5 text-sm font-medium text-zinc-800 outline-none focus:border-[#0e0e0f] ${bad ? 'border-red-500' : 'border-zinc-300'}`

/** Tablet/desktop editor: the program sheet itself, editable in place (same layout the member downloads). */
export const DesktopProgramEditor = ({ vm }: { vm: ProgramEditorVM }) => {
  const p = vm.program!
  return (
    <div className="space-y-10 rounded-xl bg-[#f3efe6] p-6 text-zinc-900 lg:p-8">
      <header className="flex flex-col gap-4 border-b-4 border-[#0e0e0f] pb-4 lg:flex-row lg:items-end">
        <div className="shrink-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Program dates</p>
          <div className="flex items-center gap-2">
            <input type="date" aria-label="Start date" value={p.startDate} onChange={(e) => vm.setStartDate(e.target.value)} className={dateInput(vm.hasDateProblem && !p.startDate)} />
            <span className="text-sm text-zinc-500">to</span>
            <input
              type="date"
              aria-label="End date"
              value={p.endDate}
              min={p.startDate || undefined}
              onChange={(e) => vm.setEndDate(e.target.value)}
              className={dateInput(vm.hasDateProblem && (!p.endDate || p.endDate < p.startDate))}
            />
          </div>
        </div>
        <input
          aria-label="Program title"
          value={p.title}
          maxLength={120}
          onChange={(e) => vm.setTitle(e.target.value)}
          placeholder="Program title (e.g. HYROX block 1)"
          className="min-w-0 flex-1 rounded bg-transparent px-2 py-1 font-display text-4xl font-extrabold uppercase tracking-wide outline-none placeholder:normal-case placeholder:text-zinc-300 focus:bg-white lg:text-center"
        />
        <p className="shrink-0 text-sm text-zinc-600 lg:text-right">
          for <span className="font-semibold">{vm.clientName}</span>
        </p>
      </header>

      <WeekCalendarEditor vm={vm} />

      {p.categories.map((c, i) => (
        <CategoryTableEditor key={c.id} vm={vm} category={c} index={i} />
      ))}

      <AddCategoryMenu onAdd={vm.addCategory} disabled={p.categories.length >= vm.limits.categories} />
    </div>
  )
}
