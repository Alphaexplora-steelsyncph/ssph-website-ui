import { Search, UserPlus, Users } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../../../../shared/components/Button'
import { useAuth } from '../../../../shared/auth/useAuth'
import { useAddClientViewModel } from '../viewModels/useAddClientViewModel'
import { useCoachClientsViewModel } from '../viewModels/useCoachClientsViewModel'
import { AddClientDialog } from './AddClientDialog'
import { ClientCard } from './ClientCard'

/** Coach home: "My clients". */
const CoachClients = memo(() => {
  const { user } = useAuth()
  const vm = useCoachClientsViewModel()
  const add = useAddClientViewModel()

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-steel">Hi, {user?.fullName.split(' ')[0]}</p>
          <h1 className="font-display text-5xl font-extrabold uppercase">My clients</h1>
        </div>
        <Button onClick={add.openDialog}>
          <UserPlus size={18} /> Add client
        </Button>
      </div>

      {vm.error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {vm.error}
        </p>
      )}

      {vm.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-coal-800" />
          ))}
        </div>
      ) : !vm.hasClients ? (
        <div className="rounded-xl border border-dashed border-coal-500 p-10 text-center">
          <Users size={32} className="mx-auto text-steel" />
          <h2 className="mt-3 font-display text-3xl font-bold uppercase">No clients yet</h2>
          <p className="mt-1 text-steel">Add a member of the gym as your client, then write their training program.</p>
          <Button onClick={add.openDialog} className="mt-5">
            <UserPlus size={18} /> Add your first client
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-1 overflow-x-auto">
              {vm.filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => vm.setFilter(f)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${
                    vm.filter === f ? 'bg-ember text-charcoal' : 'bg-coal-800 text-steel hover:text-zinc-100'
                  }`}
                >
                  {f} <span className="opacity-70">{vm.counts[f]}</span>
                </button>
              ))}
            </div>
            <label className="relative sm:ml-auto sm:w-64">
              <span className="sr-only">Search clients</span>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                value={vm.search}
                onChange={(e) => vm.setSearch(e.target.value)}
                placeholder="Search clients"
                className="w-full rounded-lg border border-coal-500 bg-coal-800 py-2 pl-9 pr-3 text-sm focus:border-ember focus:outline-none"
              />
            </label>
          </div>
          {vm.clients.length === 0 ? (
            <p className="text-steel">No clients match.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vm.clients.map((c) => (
                <ClientCard key={c.memberId} client={c} />
              ))}
            </div>
          )}
        </>
      )}

      <AddClientDialog vm={add} />
    </>
  )
})
CoachClients.displayName = 'CoachClients'

export default CoachClients
