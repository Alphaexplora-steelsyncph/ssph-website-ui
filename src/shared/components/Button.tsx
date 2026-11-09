import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-display text-lg font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-ember text-charcoal hover:bg-ember-600 active:scale-[0.98]',
  outline: 'border border-steel/40 text-zinc-100 hover:border-ember hover:text-ember',
  ghost: 'text-steel hover:text-zinc-100',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  to?: string
  children: ReactNode
}

export const Button = ({ variant = 'primary', to, className = '', children, ...rest }: Props) => {
  const classes = `${base} ${variants[variant]} ${className}`
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
