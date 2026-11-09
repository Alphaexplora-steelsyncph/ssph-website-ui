import { UserPlus } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { useAddExistingMemberViewModel } from '../viewModels/useAddExistingMemberViewModel'
import { AddExistingMemberSuccess } from './AddExistingMemberSuccess'
import { ExistingMemberDetailsFields } from './ExistingMemberDetailsFields'
import { ExistingMembershipFields } from './ExistingMembershipFields'

/** Section that owns the ViewModel and shares it with the presentational form parts. */
export const AddExistingMemberPanel = () => {
  const vm = useAddExistingMemberViewModel()

  if (vm.result) return <AddExistingMemberSuccess result={vm.result} onAddAnother={vm.reset} />

  return (
    <form onSubmit={vm.submit} noValidate className="max-w-3xl space-y-6">
      <ExistingMemberDetailsFields vm={vm} />
      <ExistingMembershipFields vm={vm} />

      {vm.error && (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {vm.error}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={vm.isSubmitting}>
          {vm.isSubmitting ? 'Adding…' : (<>Add member <UserPlus size={18} /></>)}
        </Button>
        <Button to="/admin/members" variant="outline">Cancel</Button>
      </div>
    </form>
  )
}
