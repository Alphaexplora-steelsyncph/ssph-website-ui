import { Loader2, Plus, Search } from 'lucide-react'
import { Avatar } from '../../../../shared/components/Avatar'
import { Modal } from '../../../../shared/components/Modal'
import { formatDate } from '../../../../shared/utils/format'
import type { AddClientVM } from '../viewModels/useAddClientViewModel'

/** Pick a member of the gym (active plan, no coach yet) to take as a client. */
export const AddClientDialog = ({ vm }: { vm: AddClientVM }) => (
  <Modal open={vm.open} onClose={vm.close} title="Add a client" size="lg">
    <p>Members with an active plan who don&apos;t have a coach yet. A member can only have one coach.</p>
    <label className="relative mt-4 block">
      <span className="sr-only">Search members</span>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
      <input
        autoFocus
        value={vm.query}
        onChange={(e) => vm.setQuery(e.target.value)}
        placeholder="Search by name or email"
        className="w-full rounded-lg border border-coal-500 bg-coal-900 py-2.5 pl-9 pr-3 text-base text-zinc-100 placeholder:text-coal-500 focus:border-ember focus:outline-none"
      />
    </label>
    {vm.error && (
      <p role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300">
        {vm.error}
      </p>
    )}
    <ul className="mt-3 max-h-80 divide-y divide-coal-600 overflow-y-auto rounded-lg border border-coal-600">
      {vm.isSearching && (
        <li className="flex items-center gap-2 px-4 py-4 text-steel">
          <Loader2 size={16} className="animate-spin" /> Searching…
        </li>
      )}
      {vm.results?.length === 0 && <li className="px-4 py-4 text-steel">No members found. Members who already have a coach are not listed.</li>}
      {vm.results?.map((m) => (
        <li key={m.id} className="flex items-center gap-3 px-4 py-3">
          <Avatar name={m.fullName} photoUrl={m.photoUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-100">{m.fullName}</p>
            <p className="truncate text-xs text-steel">
              {m.plan} · until {formatDate(m.expiresAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => vm.add(m)}
            disabled={!!vm.addingId}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ember px-3 py-1.5 text-sm font-semibold text-charcoal hover:bg-ember-600 disabled:opacity-60"
          >
            {vm.addingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
          </button>
        </li>
      ))}
    </ul>
  </Modal>
)
