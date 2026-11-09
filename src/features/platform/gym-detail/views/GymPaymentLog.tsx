import { FileImage } from 'lucide-react'
import { Pager } from '../../../../shared/components/Pager'
import { usePagedList } from '../../../../shared/hooks/usePagedList'
import { formatDate, formatPeso, formatTime } from '../../../../shared/utils/format'
import type { GymDetailVM } from '../viewModels/useGymDetailViewModel'

/** Every payment recorded or voided for this gym, newest first, 10 per page. */
export const GymPaymentLog = ({ vm }: { vm: GymDetailVM }) => {
  const paging = usePagedList(vm.gym!.paymentLog) // UI-local paging of data the view model already has
  const log = paging.pageItems
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Payment log</h2>
      <p className="mt-1 text-sm text-steel">Recorded and voided payments, newest first. Entries cannot be edited or deleted.</p>
      {log.length === 0 ? (
        <p className="mt-4 text-sm text-steel">No payments recorded yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-coal-600">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-coal-900 text-xs uppercase tracking-wider text-steel">
              <tr>
                <th className="px-3 py-2.5 font-medium">Date · time</th>
                <th className="px-3 py-2.5 font-medium">Entry</th>
                <th className="px-3 py-2.5 font-medium">For month</th>
                <th className="px-3 py-2.5 text-right font-medium">Amount</th>
                <th className="px-3 py-2.5 font-medium">Mode · ref</th>
                <th className="px-3 py-2.5 font-medium">Date paid</th>
                <th className="px-3 py-2.5 font-medium">Proof</th>
                <th className="px-3 py-2.5 font-medium">By</th>
                <th className="px-3 py-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coal-600">
              {log.map((e) => {
                const voided = e.event === 'Voided'
                return (
                  <tr key={e.id} className={voided ? 'bg-red-500/5' : undefined}>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {formatDate(e.recordedAt)}
                      <span className="block text-xs text-steel">{formatTime(e.recordedAt)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${voided ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        {e.event}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{e.periodLabel}</td>
                    <td className={`whitespace-nowrap px-3 py-2.5 text-right font-semibold ${voided ? 'text-steel line-through' : ''}`}>{formatPeso(e.amount)}</td>
                    <td className="px-3 py-2.5">
                      {e.method ?? '—'}
                      {e.referenceNo && <span className="block whitespace-nowrap text-xs text-steel">ref {e.referenceNo}</span>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-steel">{e.paidOn ? formatDate(e.paidOn) : '—'}</td>
                    <td className="px-3 py-2.5">
                      {e.proofUrl ? (
                        <a href={e.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline">
                          <FileImage size={12} aria-hidden="true" /> View
                        </a>
                      ) : (
                        <span className="text-steel">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-steel">{e.recordedBy}</td>
                    <td className="max-w-[220px] px-3 py-2.5 text-xs text-steel">
                      {voided && e.reason ? <span className="text-red-300">Voided: {e.reason}</span> : (e.notes ?? '—')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={paging.page} pageCount={paging.pageCount} total={paging.total} pageSize={paging.pageSize} onPage={paging.setPage} noun="entries" />
    </section>
  )
}
