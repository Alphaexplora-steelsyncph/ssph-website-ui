import type { PlatformOverview } from '../../../../shared/models/types'

const Kpi = ({ label, value, note, tone = '' }: { label: string; value: string | number; note?: string; tone?: string }) => (
  <div className="rounded-xl border border-coal-600 bg-coal-800 p-5">
    <p className="text-xs uppercase tracking-wider text-steel">{label}</p>
    <p className={`mt-1 font-display text-4xl font-extrabold ${tone}`}>{value}</p>
    {note && <p className="mt-1 text-xs text-steel">{note}</p>}
  </div>
)

export const OverviewKpis = ({ overview }: { overview: PlatformOverview }) => {
  const { gymCounts: g } = overview
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
      <Kpi label="Active gyms" value={g.active} note={g.archived ? `${g.archived} archived` : undefined} />
      <Kpi label="Suspended" value={g.suspended} tone={g.suspended ? 'text-red-400' : ''} />
      <Kpi label="Due soon / overdue" value={`${g.dueSoon} / ${g.overdue}`} tone={g.overdue ? 'text-amber-400' : ''} />
      <Kpi label="Active members" value={overview.activeMembers} note="All gyms" />
      <Kpi label="Check-ins today" value={overview.checkInsToday} />
    </div>
  )
}
