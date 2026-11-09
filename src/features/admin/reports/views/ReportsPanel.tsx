import { Link } from 'react-router-dom'
import { BarChart } from '../../../../shared/components/BarChart'
import { formatDate, formatPeso, formatPesoWhole } from '../../../../shared/utils/format'
import { useReportsViewModel } from '../viewModels/useReportsViewModel'
import { ReportCard, Stat } from './ReportCard'

/** Section that owns the Reports ViewModel; the cards below are presentational. */
export const ReportsPanel = () => {
  const vm = useReportsViewModel()
  if (vm.error)
    return (
      <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {vm.error}
      </p>
    )
  if (!vm.report) return <div className="h-64 animate-pulse rounded-xl bg-coal-800" />
  const r = vm.report

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label={`Collected · ${vm.thisMonthLabel}`} value={formatPesoWhole(vm.thisMonthTotal)} />
        <Stat
          label="Owed now"
          value={formatPesoWhole(r.owingTotal)}
          tone={r.owingTotal > 0 ? 'text-amber-400' : undefined}
          note="Balances due or overdue"
        />
        <Stat label="Active members" value={r.memberCounts.active.toLocaleString('en-PH')} />
        <Stat label="Expired" value={r.memberCounts.expired.toLocaleString('en-PH')} note="Not renewed yet" />
        <Stat
          label="Check-ins · 30 days"
          value={vm.visits30.toLocaleString('en-PH')}
          note={vm.busiestHour ? `Busiest around ${vm.busiestHour}` : undefined}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-steel">Show the last</span>
        <div role="radiogroup" aria-label="Months shown" className="flex gap-1 rounded-lg bg-coal-900 p-1">
          {vm.ranges.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={vm.months === m}
              onClick={() => vm.setMonths(m)}
              className={`rounded px-3 py-1 text-sm font-semibold ${vm.months === m ? 'bg-ember text-charcoal' : 'text-steel hover:text-zinc-100'}`}
            >
              {m} months
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <ReportCard title="Revenue per month" note="Payments recorded at the desk, by month" onExport={vm.exportRevenue}>
            <div className="grid gap-6 2xl:grid-cols-2">
              <BarChart title="Revenue per month" data={vm.revenueBars} formatValue={formatPeso} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] whitespace-nowrap text-right text-sm">
                  <thead className="text-xs uppercase tracking-wider text-steel">
                    <tr>
                      <th className="py-2 text-left font-medium">Month</th>
                      {vm.methods.map((m) => (
                        <th key={m} className="py-2 font-medium">
                          {m}
                        </th>
                      ))}
                      <th className="py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-coal-600">
                    {[...r.revenue].reverse().map((row) => (
                      <tr key={row.month}>
                        <td className="py-2 text-left">{vm.monthLabel(row.month, true)}</td>
                        {vm.methods.map((m) => (
                          <td key={m} className="py-2 text-steel">
                            {row.byMethod[m] ? formatPesoWhole(row.byMethod[m] ?? 0) : '—'}
                          </td>
                        ))}
                        <td className="py-2 font-semibold">{formatPesoWhole(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ReportCard>
        </div>

        <ReportCard
          title="Members"
          note={`${r.memberCounts.active} active · ${r.memberCounts.expired} expired · ${r.memberCounts.terminated} terminated`}
        >
          <p className="mb-2 text-sm text-steel">New members per month</p>
          <BarChart title="New members per month" data={vm.newMemberBars} />
        </ReportCard>

        <ReportCard title="Check-ins per day" note="Last 30 days" onExport={vm.exportVisits}>
          <BarChart title="Check-ins per day, last 30 days" data={vm.visitBars} labelEvery={5} />
        </ReportCard>

        <ReportCard title="Busiest hours" note="All check-ins in the last 30 days, by hour">
          <BarChart title="Check-ins by hour of day" data={vm.peakBars} labelEvery={3} />
        </ReportCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportCard
          title="Plans ending soon"
          note={`Ending within ${r.noticeDays} days. They get an email reminder.`}
          onExport={vm.exportLists}
        >
          {r.expiringSoon.length === 0 ? (
            <p className="text-sm text-steel">No plans end in the next {r.noticeDays} days.</p>
          ) : (
            <ul className="max-h-[30rem] divide-y divide-coal-600 overflow-y-auto pr-1">
              {r.expiringSoon.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <Link to={`/admin/members/${m.id}`} className="font-medium hover:text-ember hover:underline">
                      {m.fullName}
                    </Link>
                    <p className="text-xs text-steel">
                      {m.plan} · ends {formatDate(m.expiresAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-amber-400">
                    {m.daysLeft === 0 ? 'Today' : `${m.daysLeft} day${m.daysLeft === 1 ? '' : 's'}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ReportCard>

        <ReportCard
          title="Members who owe"
          note="Overdue first. Block check-in from the member's page if needed."
          onExport={vm.exportLists}
        >
          {r.owing.length === 0 ? (
            <p className="text-sm text-steel">Nobody owes the gym anything.</p>
          ) : (
            <ul className="max-h-[30rem] divide-y divide-coal-600 overflow-y-auto pr-1">
              {[...r.owing]
                .sort(
                  (a, b) => Number(b.balanceOverdue) - Number(a.balanceOverdue) || Number(a.balanceUpcoming) - Number(b.balanceUpcoming),
                )
                .map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <Link to={`/admin/members/${m.id}`} className="font-medium hover:text-ember hover:underline">
                        {m.fullName}
                      </Link>
                      <p className="text-xs text-steel">
                        {m.balanceDueOn ? `due ${formatDate(m.balanceDueOn)}` : 'no due date'}
                        {m.checkInBlocked && <span className="text-red-400"> · check-in blocked</span>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold">{formatPeso(m.balanceDue)}</p>
                      <p
                        className={`text-xs font-semibold ${m.balanceOverdue ? 'text-red-400' : m.balanceUpcoming ? 'text-steel' : 'text-amber-400'}`}
                      >
                        {m.balanceOverdue ? 'Overdue' : m.balanceUpcoming ? 'Next payment' : 'Balance'}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </ReportCard>
      </div>
    </div>
  )
}
