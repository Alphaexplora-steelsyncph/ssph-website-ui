import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFeature } from '../features/useFeature'
import { useMemberNotifications } from '../hooks/useMemberNotifications'
import { formatDate, formatTime } from '../utils/format'

/** Member header bell: "Coach … updated your program". Only for gyms with the Coach App add-on. */
export const NotificationBell = () => {
  const enabled = useFeature('coach_app')
  const vm = useMemberNotifications(enabled)
  const navigate = useNavigate()
  if (!enabled) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={vm.toggle}
        aria-label={vm.unread ? `Notifications, ${vm.unread} new` : 'Notifications'}
        aria-expanded={vm.open}
        className="relative rounded-full p-2 text-steel hover:bg-coal-700 hover:text-zinc-100"
      >
        <Bell size={20} />
        {vm.unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-charcoal">
            {vm.unread > 9 ? '9+' : vm.unread}
          </span>
        )}
      </button>
      {vm.open && (
        <>
          <div className="fixed inset-0 z-30" onClick={vm.toggle} aria-hidden="true" />
          <div className="fixed inset-x-4 top-16 z-40 overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 rounded-xl border border-coal-500 bg-coal-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-coal-600 px-4 py-3">
              <p className="font-semibold">Notifications</p>
              {vm.items.length > 0 && (
                <button type="button" onClick={vm.clear} className="text-xs text-steel hover:text-zinc-100">
                  Clear all
                </button>
              )}
            </div>
            {vm.items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-steel">No notifications yet.</p>
            ) : (
              <ul className="max-h-80 divide-y divide-coal-600 overflow-y-auto">
                {vm.items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        vm.toggle()
                        navigate('/member/program')
                      }}
                      className="flex w-full gap-2 px-4 py-3 text-left hover:bg-coal-700"
                    >
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-ember'}`} />
                      <span>
                        <span className="block text-sm">{n.message}</span>
                        <span className="block text-xs text-steel">
                          {formatDate(n.createdAt)} · {formatTime(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
