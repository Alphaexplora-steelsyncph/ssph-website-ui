import { Info, TriangleAlert } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { CityField } from '../../../../shared/components/CityField'
import { InviteCard } from '../../../../shared/components/InviteCard'
import { TextField } from '../../../../shared/components/TextField'
import type { MemberDetailVM } from '../viewModels/useMemberDetailViewModel'

export const MemberProfileForm = ({ vm }: { vm: MemberDetailVM }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="font-display text-2xl font-bold uppercase">Contact details</h2>
    <form onSubmit={vm.save} noValidate className="mt-5 space-y-5">
      <TextField
        label="Full name"
        autoComplete="off"
        value={vm.fullName}
        onChange={(e) => vm.setFullName(e.target.value)}
        error={vm.fieldErrors.fullName}
        disabled={!vm.canEdit}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Mobile (optional)"
          type="tel"
          inputMode="tel"
          placeholder="0917 123 4567"
          value={vm.phone}
          onChange={(e) => vm.setPhone(e.target.value)}
          error={vm.fieldErrors.phone}
          disabled={!vm.canEdit}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="off"
          placeholder={vm.member?.email ? undefined : 'No email on file'}
          value={vm.email}
          onChange={(e) => vm.setEmail(e.target.value)}
          error={vm.fieldErrors.email}
          disabled={!vm.canEdit}
        />
      </div>
      {vm.canEdit ? (
        <CityField value={vm.city} onChange={vm.setCity} error={vm.fieldErrors.city} />
      ) : (
        <div>
          <span className="mb-1.5 block text-sm font-medium text-steel">City / municipality</span>
          <p className="text-zinc-100">{vm.city || <span className="text-steel">Not given</span>}</p>
        </div>
      )}

      {vm.hasLogin && !vm.confirmingEmail && (
        <p className="flex items-start gap-2 text-sm text-steel">
          <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          This member has a login. When they ask for a new email, change it here and their login follows: they sign in with the new address from then on.
        </p>
      )}
      {vm.confirmingEmail && vm.member && (
        <div role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <p className="flex items-start gap-2 font-semibold">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            Change the login email?
          </p>
          <p className="mt-1 text-steel">
            {vm.member.fullName} will sign in with <span className="font-semibold text-zinc-100">{vm.email.trim()}</span> instead of {vm.member.email}.
            The old address stops working. Only do this when the member asked for it.
          </p>
        </div>
      )}

      {vm.error && (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>
      )}
      {vm.saved && !vm.error && (
        <p role="status" className="text-sm font-semibold text-emerald-400">Saved.</p>
      )}

      {vm.canEdit ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={vm.isSaving || !vm.dirty}>
            {vm.isSaving ? 'Saving…' : vm.confirmingEmail ? 'Yes, change email' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" onClick={vm.confirmingEmail ? vm.cancelEmailConfirm : vm.reset} disabled={vm.isSaving || !vm.dirty}>
            {vm.confirmingEmail ? 'Back' : 'Discard'}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-steel">You can view this member but not edit them.</p>
      )}
    </form>

    {vm.inviteToken && vm.member && (
      <InviteCard
        token={vm.inviteToken}
        email={vm.member.email}
        description={`The email changed, so here is a new login link for ${vm.member.email}. Have the member scan it to set a password.`}
      />
    )}
  </section>
)
