interface Props {
  checked: boolean
  onChange: (next: boolean) => void
  label: string // accessible name
  disabled?: boolean
}

export const Switch = ({ checked, onChange, label, disabled }: Props) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? 'bg-emerald-500' : 'bg-coal-500'}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
)
