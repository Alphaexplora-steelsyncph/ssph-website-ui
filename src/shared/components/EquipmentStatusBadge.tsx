import { CheckCircle2, CircleAlert, Wrench } from 'lucide-react'
import type { EquipmentStatus } from '../models/types'

const STYLE: Record<EquipmentStatus, { cls: string; Icon: typeof CheckCircle2 }> = {
  Available: { cls: 'bg-emerald-500/15 text-emerald-400', Icon: CheckCircle2 },
  'Under maintenance': { cls: 'bg-amber-500/15 text-amber-400', Icon: Wrench },
  Broken: { cls: 'bg-red-500/15 text-red-400', Icon: CircleAlert },
}

/** Status with an icon and its name (never color alone). */
export const EquipmentStatusBadge = ({ status }: { status: EquipmentStatus }) => {
  const { cls, Icon } = STYLE[status]
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <Icon size={12} aria-hidden="true" /> {status}
    </span>
  )
}
