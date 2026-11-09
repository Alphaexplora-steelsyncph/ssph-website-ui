import { Check, ChevronDown, Loader2, X } from 'lucide-react'
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'

export interface TypeaheadOption {
  value: string
  label: string
  hint?: string
}

interface Props {
  label: string
  options: TypeaheadOption[]
  /** The selected option's value ('' = nothing chosen). */
  value: string
  onSelect: (option: TypeaheadOption | null) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  error?: string
  help?: string
  className?: string
}

const MAX_SHOWN = 60

/** Lower case, no accents, no "city of": "Parañaque" matches "paranaque", "cebu" matches "City of Cebu". */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Starts-with matches first (on the name or any word of it), then anything containing the text. */
const filterOptions = (options: TypeaheadOption[], query: string) => {
  const q = norm(query)
  if (!q) return options
  const first: TypeaheadOption[] = []
  const rest: TypeaheadOption[] = []
  for (const o of options) {
    const n = norm(o.label)
    if (n.startsWith(q) || n.includes(` ${q}`)) first.push(o)
    else if (n.includes(q)) rest.push(o)
  }
  return [...first, ...rest]
}

/**
 * Type-ahead select: type to narrow a long list (regions, cities, barangays ...), pick with the mouse or
 * arrow keys + Enter. Only listed options can be chosen. Accessible combobox (ARIA 1.2 pattern).
 */
export const TypeaheadField = ({ label, options, value, onSelect, placeholder, disabled, loading, error, help, className = '' }: Props) => {
  const id = useId()
  const listId = `${id}-list`
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const selected = options.find((o) => o.value === value) ?? null
  const matches = useMemo(() => filterOptions(options, query), [options, query])
  const shown = matches.slice(0, MAX_SHOWN)

  const close = () => {
    setOpen(false)
    setQuery('')
  }
  const choose = (o: TypeaheadOption) => {
    onSelect(o)
    close()
  }
  const show = () => {
    if (disabled) return
    setOpen(true)
    setActive(0)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) return show()
      setActive((i) => Math.min(i + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && shown[active]) {
        e.preventDefault()
        choose(shown[active])
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        close()
      }
    } else if (e.key === 'Tab' && open && query && shown.length === 1) {
      choose(shown[0]) // typed enough for a single match: take it when moving on
    }
  }

  const describedBy = [error ? `${id}-err` : '', help && !error ? `${id}-help` : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-steel">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && shown[active] ? `${id}-opt-${active}` : undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          autoComplete="off"
          disabled={disabled}
          value={open ? query : (selected?.label ?? '')}
          placeholder={loading ? 'Loading…' : selected ? selected.label : placeholder}
          onFocus={show}
          onClick={show}
          onBlur={close}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
          className={`w-full rounded-lg border bg-coal-800 py-3 pl-4 pr-20 text-base text-zinc-100 placeholder:text-coal-500 focus:border-ember focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-red-500' : 'border-coal-500'
          } ${open && selected ? 'placeholder:text-steel' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 text-steel">
          {loading && <Loader2 size={16} className="mr-1 animate-spin" aria-hidden="true" />}
          {selected && !disabled && (
            <button
              type="button"
              aria-label={`Clear ${label.toLowerCase()}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(null)
                inputRef.current?.focus()
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:text-chalk"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown size={16} className={`mr-1 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </div>
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto overscroll-contain rounded-lg border border-coal-500 bg-coal-800 py-1 shadow-2xl"
        >
          {shown.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(o)}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm ${i === active ? 'bg-coal-600 text-chalk' : 'text-chalk-2'}`}
            >
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              {o.hint && <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-steel">{o.hint}</span>}
              {o.value === value && <Check size={14} className="shrink-0" aria-hidden="true" />}
            </li>
          ))}
          {!shown.length && <li className="px-4 py-3 text-sm text-steel">{loading ? 'Loading…' : 'No match. Check the spelling.'}</li>}
          {matches.length > MAX_SHOWN && (
            <li className="px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-steel">
              {matches.length - MAX_SHOWN} more: keep typing
            </li>
          )}
        </ul>
      )}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      ) : (
        help && (
          <p id={`${id}-help`} className="mt-1.5 text-xs text-steel">
            {help}
          </p>
        )
      )}
    </div>
  )
}
