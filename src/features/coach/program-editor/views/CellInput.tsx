import { useState } from 'react'
import type { CategoryColumn } from '../../../../shared/training/categoryTypes'

interface Props {
  column: CategoryColumn
  value: string
  onChange: (value: string) => void
  className: string
  /** Accessible name, e.g. "Week 2 SET for Military Press". */
  label: string
}

/** A text box, or, for columns with choices (type of run, HYROX station), a dropdown with a free-text "Other…". */
export const CellInput = ({ column, value, onChange, className, label }: Props) => {
  const [other, setOther] = useState(() => !!value && !!column.options && !column.options.includes(value))

  if (!column.options) {
    return <input aria-label={label} value={value} maxLength={60} onChange={(e) => onChange(e.target.value)} className={className} />
  }
  if (other) {
    return (
      <div className="flex items-center">
        <input aria-label={label} autoFocus value={value} maxLength={60} placeholder={column.label} onChange={(e) => onChange(e.target.value)} className={className} />
        <button
          type="button"
          onClick={() => {
            setOther(false)
            onChange('')
          }}
          title="Back to the list"
          className="px-2 text-zinc-400 hover:text-zinc-700"
        >
          ×
        </button>
      </div>
    )
  }
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => {
        if (e.target.value === '__other__') {
          setOther(true)
          onChange('')
        } else onChange(e.target.value)
      }}
      className={className}
    >
      <option value="">—</option>
      {column.options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value="__other__">Other…</option>
    </select>
  )
}
