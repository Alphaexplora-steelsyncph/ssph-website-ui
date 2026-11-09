import { TextField } from '../../../../shared/components/TextField'
import type { ContactFormVM } from '../viewModels/useContactFormViewModel'

/** Step 1: who to get back to. */
export const ContactPersonStep = ({ vm }: { vm: ContactFormVM }) => (
  <fieldset className="space-y-5">
    <legend className="mb-5 font-display text-3xl uppercase">Who are we talking to?</legend>
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField label="First name" autoComplete="given-name" value={vm.person.firstName} onChange={(e) => vm.setPersonField('firstName', e.target.value)} error={vm.errors.firstName} maxLength={60} />
      <TextField label="Last name" autoComplete="family-name" value={vm.person.lastName} onChange={(e) => vm.setPersonField('lastName', e.target.value)} error={vm.errors.lastName} maxLength={60} />
    </div>
    <TextField label="Email" type="email" inputMode="email" autoComplete="email" placeholder="you@gmail.com" value={vm.person.email} onChange={(e) => vm.setPersonField('email', e.target.value)} error={vm.errors.email} maxLength={254} />
    <TextField label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" value={vm.person.phone} onChange={(e) => vm.setPersonField('phone', e.target.value)} error={vm.errors.phone} maxLength={20} />
  </fieldset>
)
