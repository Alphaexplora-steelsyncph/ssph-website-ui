import { ChevronDown, LogOut, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Permission } from '../auth/permissions'
import { RoleGuard } from '../auth/RoleGuard'

export interface ProfileMenuLink {
  to: string
  label: string
  icon: LucideIcon
  permission?: Permission
}

interface Props {
  name: string
  email: string
  links: ProfileMenuLink[]
  onSignOut: () => void
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

/** Avatar button in the top-right corner: account name, page links (e.g. Settings) and Log out. */
export const ProfileMenu = ({ name, email, links, onSignOut }: Props) => {
  const [open, setOpen] = useState(false) // UI-local state
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-coal-700"
      >
        <span className="hidden max-w-[220px] truncate text-sm font-semibold sm:block">{name}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember font-display text-base font-bold text-charcoal">
          {initials(name)}
        </span>
        <ChevronDown size={16} className={`text-steel transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-coal-500 bg-coal-800 shadow-2xl shadow-black/50"
        >
          <div className="border-b border-coal-600 px-4 py-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-steel">{email}</p>
          </div>
          {links.map(({ to, label, icon: Icon, permission }) => (
            <RoleGuard key={to} requiredPermission={permission}>
              <Link
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-coal-700"
              >
                <Icon size={16} className="text-steel" /> {label}
              </Link>
            </RoleGuard>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-coal-700"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
