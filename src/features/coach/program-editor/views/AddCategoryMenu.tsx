import { ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'
import type { CategoryTypeId } from '../../../../shared/models/types'
import { CATEGORY_TYPES } from '../../../../shared/training/categoryTypes'
import { getCategoryVisual } from '../../../../shared/training/categoryVisuals'

interface Props {
  onAdd: (type: CategoryTypeId) => void
  disabled?: boolean
  dark?: boolean
}

const HELP: Record<CategoryTypeId, string> = {
  workout: 'Exercise · tempo · rest · set × rep per week',
  running: 'Type of run · distance · pace · heart rate · time · rest',
  hyrox: 'Station · distance · weight',
}

/** "Add category": the type picked here decides the table's columns and cannot be changed later. */
export const AddCategoryMenu = ({ onAdd, disabled = false, dark = false }: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 font-semibold disabled:opacity-50 ${
          dark ? 'border-coal-500 text-steel hover:border-ember hover:text-ember' : 'border-zinc-300 text-zinc-600 hover:border-[#0e0e0f] hover:text-[#0e0e0f]'
        }`}
      >
        <Plus size={18} /> Add category <ChevronDown size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-full z-40 mb-2 overflow-hidden rounded-lg border border-coal-500 bg-coal-800 text-zinc-100 shadow-xl">
            {CATEGORY_TYPES.map((t) => {
              const v = getCategoryVisual(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onAdd(t.id)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-coal-700"
                >
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${v.darkIcon}`}>
                    <v.Icon size={16} />
                  </span>
                  <span>
                    <span className="block font-semibold">{t.label}</span>
                    <span className="block text-xs text-steel">{HELP[t.id]}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
