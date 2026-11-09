import { Mail } from 'lucide-react'
import { Pager } from '../../../../shared/components/Pager'
import { formatDate, formatTime } from '../../../../shared/utils/format'
import { useEmailNoticesViewModel } from '../viewModels/useEmailNoticesViewModel'

const KIND: Record<string, string> = { plan_ending: 'Plan ending', balance_due: 'Payment due', balance_overdue: 'Overdue balance' }

/** What members are (or will be) emailed: plan ending in 2 weeks, payment due, overdue balance. */
export const EmailNoticesSection = () => {
  const vm = useEmailNoticesViewModel()
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
        <Mail className="text-ember" aria-hidden="true" /> Member email notices
      </h2>
      <p className="mt-1 text-sm text-steel">
        Members get an email 2 weeks before their plan ends, 2 weeks before a payment is due, and once when a balance becomes overdue. Each is
        sent once.
      </p>
      <p role="status" className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
        Email sending is not set up yet. These are prepared and saved here, but not delivered.
      </p>
      {vm.error && <p role="alert" className="mt-3 text-sm text-red-300">{vm.error}</p>}
      {vm.notices && vm.notices.length === 0 && <p className="mt-4 text-sm text-steel">No notices yet.</p>}
      {vm.notices && vm.notices.length > 0 && (
        <ul className="mt-4 divide-y divide-coal-600 overflow-hidden rounded-lg border border-coal-600">
          {vm.notices.map((n) => (
            <li key={n.id} className="text-sm">
              <button type="button" onClick={() => vm.toggle(n.id)} aria-expanded={vm.openId === n.id} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-coal-700/50">
                <span className="w-32 shrink-0 text-xs text-steel">
                  {formatDate(n.createdAt)}
                  <span className="block">{formatTime(n.createdAt)}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{n.subject}</span>
                  <span className="block truncate text-xs text-steel">
                    {KIND[n.kind]} · {n.memberName ?? n.to} · {n.to}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-coal-600 px-2 py-0.5 text-xs font-semibold text-steel">{n.status === 'logged' ? 'Not sent' : n.status}</span>
              </button>
              {vm.openId === n.id && <pre className="whitespace-pre-wrap border-t border-coal-600 bg-coal-900 px-4 py-3 font-sans text-sm text-steel">{n.body}</pre>}
            </li>
          ))}
        </ul>
      )}
      <Pager page={vm.paging.page} pageCount={vm.paging.pageCount} total={vm.paging.total} pageSize={vm.paging.pageSize} onPage={vm.paging.setPage} noun="notices" />
    </section>
  )
}
