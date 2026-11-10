import { Download, ShieldAlert } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { Modal } from '../../../../shared/components/Modal'
import type { MemberRecord } from '../../../../shared/models/types'
import { useMemberPrivacyViewModel } from '../viewModels/useMemberPrivacyViewModel'

/** The member's privacy requests: a copy of their data, or erasing it. */
export const MemberPrivacyCard = ({ member }: { member: MemberRecord }) => {
  const vm = useMemberPrivacyViewModel(member.id, member.fullName)
  if (!vm.canManage || member.erased) return null
  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Privacy</h2>
      <p className="mt-1 text-sm text-steel">
        {member.consentAt
          ? `The member agreed to the privacy notice on ${new Date(member.consentAt).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium' })}.`
          : 'No consent is on record for this member (they joined before consent was recorded).'}{' '}
        If the member asks for a copy of their data or for it to be erased, you can do it here.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={vm.exportData}
          disabled={vm.isExporting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-coal-500 px-3 py-1.5 text-sm font-semibold text-zinc-100 hover:bg-coal-700 disabled:opacity-60"
        >
          <Download size={14} aria-hidden="true" /> {vm.isExporting ? 'Preparing…' : 'Download their data'}
        </button>
        <button
          type="button"
          onClick={vm.openErase}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/50 px-3 py-1.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
        >
          <ShieldAlert size={14} aria-hidden="true" /> Erase their data
        </button>
      </div>
      {vm.error && !vm.confirmingErase && <p role="alert" className="mt-2 text-sm text-red-300">{vm.error}</p>}
      {vm.confirmingErase && (
        <Modal
          open
          title="Erase this member's data"
          onClose={vm.closeErase}
          footer={
            <>
              <Button variant="outline" onClick={vm.closeErase} disabled={vm.isErasing}>
                Cancel
              </Button>
              <Button onClick={vm.erase} disabled={!vm.nameMatches || vm.isErasing}>
                {vm.isErasing ? 'Erasing…' : 'Erase permanently'}
              </Button>
            </>
          }
        >
          <p>
            This permanently removes <span className="font-semibold text-zinc-100">{member.fullName}</span>'s name, email, mobile, city, photo, receipt
            images, coach details and login. It cannot be undone. Their payment amounts and visit counts stay, without their name, so your reports
            still add up. Older entries in the activity log that mention them are kept as a security record.
          </p>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-steel">Type their name to confirm</span>
            <input
              value={vm.typedName}
              onChange={(e) => vm.setTypedName(e.target.value)}
              autoComplete="off"
              className="w-full rounded-lg border border-coal-500 bg-coal-900 px-4 py-3 text-zinc-100 focus:border-ember focus:outline-none"
            />
          </label>
          {vm.error && <p role="alert" className="mt-2 text-sm text-red-300">{vm.error}</p>}
        </Modal>
      )}
    </section>
  )
}
