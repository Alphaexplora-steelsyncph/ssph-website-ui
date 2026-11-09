import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RoleGuard } from '../../../../shared/auth/RoleGuard'
import { PERMISSIONS } from '../../../../shared/auth/permissions'
import { Button } from '../../../../shared/components/Button'
import { featureLabel } from '../../../../shared/features/featureCatalog'
import { formatPeso } from '../../../../shared/utils/format'
import { usePackagesViewModel } from '../viewModels/usePackagesViewModel'
import { PackageForm } from './PackageForm'

export const PackagesSection = () => {
  const vm = usePackagesViewModel()
  const [confirmId, setConfirmId] = useState<string | null>(null) // UI-local

  return (
    <div className="space-y-5">
      <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_PACKAGES}>
        {vm.editing !== 'new' && (
          <Button variant="outline" onClick={vm.startAdd}><Plus size={18} /> Add package</Button>
        )}
      </RoleGuard>
      {vm.error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>}
      {vm.editing === 'new' && <PackageForm vm={vm} title="New package" />}
      {vm.isLoading && <p className="text-steel">Loading…</p>}

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {vm.packages.map((p) =>
          vm.editing === p.id ? (
            <PackageForm key={p.id} vm={vm} title={`Edit ${p.name}`} />
          ) : (
            <article key={p.id} className="flex flex-col rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-3xl font-extrabold uppercase">{p.name}</h2>
                <span className="rounded bg-coal-600 px-2 py-0.5 text-xs text-steel">{p.gymCount} gym{p.gymCount === 1 ? '' : 's'}</span>
              </div>
              <p className="mt-1 text-xl font-semibold text-ember">{formatPeso(p.price)}<span className="text-sm text-steel"> / month</span></p>
              <p className="mt-1 text-sm text-steel">{p.memberLimit === null ? 'Unlimited members' : `Up to ${p.memberLimit} members`}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li>✓ Basic Gym Management</li>
                {p.features.map((f) => <li key={f}>✓ {featureLabel(f)}</li>)}
              </ul>
              <RoleGuard requiredPermission={PERMISSIONS.PLATFORM_MANAGE_PACKAGES}>
                <div className="mt-auto flex items-center gap-2 pt-5">
                  {confirmId === p.id ? (
                    <>
                      <button type="button" onClick={() => { void vm.remove(p.id); setConfirmId(null) }}
                        className="rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">Delete package</button>
                      <button type="button" onClick={() => setConfirmId(null)} className="text-xs text-steel hover:text-zinc-100">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => vm.startEdit(p)}
                        className="flex items-center gap-1.5 rounded border border-coal-500 px-3 py-1.5 text-xs font-semibold text-steel hover:text-zinc-100">
                        <Pencil size={14} /> Edit
                      </button>
                      <button type="button" onClick={() => setConfirmId(p.id)} aria-label={`Delete ${p.name}`}
                        className="rounded border border-red-500/40 p-1.5 text-red-400 hover:bg-red-500/10">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </RoleGuard>
            </article>
          ),
        )}
      </div>
    </div>
  )
}
