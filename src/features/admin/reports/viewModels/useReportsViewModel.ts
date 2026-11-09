import { useEffect, useState } from 'react'
import { ApiError, fetchReportSummary } from '../../../../shared/models/apiService'
import type { ReportSummary } from '../../../../shared/models/types'
import { downloadCsv } from '../../../../shared/utils/csv'
import { todayISO } from '../../../../shared/utils/dates'

export const REPORT_RANGES = [3, 6, 12] as const
export type ReportMonths = (typeof REPORT_RANGES)[number]
const METHODS = ['Cash', 'GCash', 'Maya', 'Bank Transfer'] as const

const monthLabel = (ym: string, long = false) =>
  new Date(`${ym}-01T00:00:00+08:00`).toLocaleDateString('en-PH', { month: long ? 'long' : 'short', year: long ? 'numeric' : undefined, timeZone: 'Asia/Manila' })

/** Revenue, members, visits and the "act on these" lists for the Reports page. */
export const useReportsViewModel = () => {
  const [months, setMonths] = useState<ReportMonths>(6)
  const [report, setReport] = useState<ReportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchReportSummary(months)
      .then((r) => {
        if (cancelled) return
        setReport(r)
        setError(null)
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : 'Could not load reports.'))
    return () => {
      cancelled = true
    }
  }, [months])

  const thisMonth = report?.revenue[report.revenue.length - 1]

  const revenueBars =
    report?.revenue.map((r) => ({
      key: r.month,
      label: monthLabel(r.month),
      value: r.total,
      tooltip: METHODS.filter((m) => r.byMethod[m]).map((m) => `${m}: ₱${(r.byMethod[m] ?? 0).toLocaleString('en-PH')}`).join('\n') || 'No payments',
    })) ?? []

  const newMemberBars = report?.newMembers.map((r) => ({ key: r.month, label: monthLabel(r.month), value: r.count })) ?? []

  const visitBars =
    report?.visitsDaily.map((d) => ({
      key: d.date,
      label: new Date(`${d.date}T00:00:00+08:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' }),
      value: d.count,
    })) ?? []

  const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`
  const peakBars = report?.peakHours.map((h) => ({ key: String(h.hour), label: hourLabel(h.hour), value: h.count })) ?? []
  const busiest = report?.peakHours.reduce((a, b) => (b.count > a.count ? b : a), { hour: 0, count: 0 })

  const exportRevenue = () =>
    report &&
    downloadCsv(
      `revenue-${todayISO()}.csv`,
      ['Month', 'Total', ...METHODS, 'Payments'],
      report.revenue.map((r) => [monthLabel(r.month, true), r.total.toFixed(2), ...METHODS.map((m) => (r.byMethod[m] ?? 0).toFixed(2)), r.count]),
    )

  const exportLists = () =>
    report &&
    downloadCsv(
      `members-to-follow-up-${todayISO()}.csv`,
      ['List', 'Member', 'Email', 'Phone', 'Plan', 'Plan ends', 'Days left', 'Balance', 'Balance due', 'Status'],
      [
        ...report.expiringSoon.map((m) => ['Plan ending', m.fullName, m.email, m.phone ?? '', m.plan, m.expiresAt, m.daysLeft ?? '', '', '', m.status]),
        ...report.owing.map((m) => [
          'Owes',
          m.fullName,
          m.email,
          m.phone ?? '',
          m.plan,
          m.expiresAt,
          m.daysLeft ?? '',
          m.balanceDue.toFixed(2),
          m.balanceDueOn ?? '',
          m.balanceOverdue ? 'Overdue' : m.balanceUpcoming ? 'Next payment' : 'Balance',
        ]),
      ],
    )

  const exportVisits = () =>
    report &&
    downloadCsv(
      `visits-per-day-${todayISO()}.csv`,
      ['Date', 'Check-ins'],
      report.visitsDaily.map((d) => [d.date, d.count]),
    )

  return {
    months, setMonths, ranges: REPORT_RANGES, methods: METHODS,
    report, error, isLoading: !report && !error,
    thisMonthTotal: thisMonth?.total ?? 0, thisMonthLabel: thisMonth ? monthLabel(thisMonth.month, true) : '',
    revenueBars, newMemberBars, visitBars, peakBars,
    busiestHour: busiest && busiest.count > 0 ? hourLabel(busiest.hour) : null,
    visits30: report?.visitsDaily.reduce((s, d) => s + d.count, 0) ?? 0,
    monthLabel,
    exportRevenue, exportLists, exportVisits,
  }
}

export type ReportsVM = ReturnType<typeof useReportsViewModel>
