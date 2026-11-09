import { KeyRound, Mail, Power, RefreshCw, UserMinus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from '../../../../shared/components/Modal'
import { formatDate } from '../../../../shared/utils/format'
import type { CoachesVM } from '../viewModels/useCoachesViewModel'

const action = 'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-steel hover:bg-coal-700 hover:text-zinc-100 disabled:opacity-50'

export const CoachesPanel = ({ vm }: { vm: CoachesVM }) => {
  const confirmText = () => {
    const c = vm.confirm
    if (!c) return { title: '', body: '', button: '' }
    if (c.kind === 'disable')
      return {
        title: `Turn off ${c.coach.fullName}?`,
        body: `${c.coach.fullName} can no longer log in.${c.coach.clients.length ? ` Their ${c.coach.clients.length} client(s) are freed so another coach can take them. The programs stay with the members.` : ''} You can turn the coach back on later (they start with no clients).`,
        button: 'Turn off',
      }
    if (c.kind === 'release')
      return {
        title: 'Remove client from coach?',
        body: `${c.memberName} will no longer be a client of ${c.coach.fullName}. Their program and history stay, and another coach can take them.`,
        button: 'Remove',
      }
    return { title: 'Cancel invite?', body: `The invite link for ${c.name} will stop working.`, button: 'Cancel invite' }
  }
  const text = confirmText()

  return (
    <div className="space-y-8">
      {vm.error && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</p>}
      {vm.notice && <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{vm.notice}</p>}

      {vm.isLoading && <div className="h-32 animate-pulse rounded-xl bg-coal-800" />}

      {!vm.isLoading && vm.coaches.length === 0 && vm.pendingInvites.length === 0 && (
        <div className="rounded-xl border border-dashed border-coal-500 p-8 text-center text-steel">
          No coaches yet. Invite your first coach: they get their own login and pick members as clients.
        </div>
      )}

      {vm.coaches.length > 0 && (
        <section className="space-y-3">
          {vm.coaches.map((coach) => (
            <article key={coach.id} data-testid="coach-row" className={`rounded-xl border border-coal-600 bg-coal-800 p-5 ${coach.disabled ? 'opacity-70' : ''}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-lg font-semibold">
                    {coach.fullName}
                    {coach.disabled && <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">Turned off</span>}
                  </p>
                  <p className="truncate text-sm text-steel">
                    {coach.email} · since {formatDate(coach.createdAt)}
                  </p>
                </div>
                {vm.canManage && (
                  <div className="flex flex-wrap gap-1">
                    {!coach.disabled && (
                      <button type="button" className={action} disabled={!!vm.busy} onClick={() => vm.resetPassword(coach)}>
                        <KeyRound size={15} /> Reset password
                      </button>
                    )}
                    {coach.disabled ? (
                      <button type="button" className={action} disabled={!!vm.busy} onClick={() => vm.enable(coach)}>
                        <Power size={15} /> Turn on
                      </button>
                    ) : (
                      <button type="button" className={`${action} hover:!text-red-400`} disabled={!!vm.busy} onClick={() => vm.askDisable(coach)}>
                        <Power size={15} /> Turn off
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-steel">
                  Clients <span className="text-zinc-100">{coach.clients.length}</span>
                </p>
                {coach.clients.length === 0 ? (
                  <p className="text-sm text-steel">No clients yet.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {coach.clients.map((c) => (
                      <li key={c.memberId} className="inline-flex items-center gap-1 rounded-full bg-coal-700 py-1 pl-3 pr-1 text-sm">
                        <Link to={`/admin/members/${c.memberId}`} className="hover:text-ember">
                          {c.fullName}
                        </Link>
                        {vm.canManage && (
                          <button
                            type="button"
                            onClick={() => vm.askRelease(coach, c.memberId, c.fullName)}
                            title={`Remove ${c.fullName} from ${coach.fullName}`}
                            className="rounded-full p-1 text-steel hover:bg-coal-600 hover:text-red-400"
                          >
                            <UserMinus size={13} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {vm.pendingInvites.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-steel">Invited, not yet active</h2>
          <ul className="divide-y divide-coal-600 rounded-xl border border-coal-600 bg-coal-800">
            {vm.pendingInvites.map((i) => (
              <li key={i.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                <Mail size={16} className="hidden shrink-0 text-steel sm:block" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{i.fullName}</p>
                  <p className="truncate text-sm text-steel">
                    {i.email} · {i.expired ? <span className="text-amber-400">link expired</span> : `link expires ${formatDate(i.expiresAt)}`}
                  </p>
                </div>
                {vm.canManage && (
                  <div className="flex gap-1">
                    <button type="button" className={action} disabled={!!vm.busy} onClick={() => vm.resendInvite(i.id)}>
                      <RefreshCw size={15} /> New link
                    </button>
                    <button type="button" className={action} disabled={!!vm.busy} onClick={() => vm.askCancelInvite(i.id, i.fullName)}>
                      <X size={15} /> Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal
        open={!!vm.confirm}
        onClose={vm.closeConfirm}
        title={text.title}
        footer={
          <>
            <button type="button" onClick={vm.closeConfirm} className="rounded-lg px-4 py-2.5 text-sm text-steel hover:text-zinc-100">
              Keep
            </button>
            <button
              type="button"
              onClick={vm.confirmAction}
              disabled={!!vm.busy}
              className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
            >
              {text.button}
            </button>
          </>
        }
      >
        <p>{text.body}</p>
      </Modal>
    </div>
  )
}
