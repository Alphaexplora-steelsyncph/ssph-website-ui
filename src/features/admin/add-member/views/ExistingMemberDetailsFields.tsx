import { CityField } from '../../../../shared/components/CityField'
import { FormCard } from '../../../../shared/components/FormCard'
import { TextField } from '../../../../shared/components/TextField'
import type { AddExistingMemberVM } from '../viewModels/useAddExistingMemberViewModel'

export const ExistingMemberDetailsFields = ({ vm }: { vm: AddExistingMemberVM }) => (
  <FormCard step={1} title="Member details">
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField label="Full name" autoComplete="off" placeholder="Juan Dela Cruz" value={vm.fullName}
        onChange={(e) => vm.setFullName(e.target.value)} error={vm.fieldErrors.fullName} className="sm:col-span-2" />
      <TextField label="Email" type="email" autoComplete="off" placeholder="member@email.com" value={vm.email}
        onChange={(e) => vm.setEmail(e.target.value)} error={vm.fieldErrors.email} />
      <TextField label="Mobile (optional)" type="tel" inputMode="tel" autoComplete="off" placeholder="0917 123 4567"
        value={vm.phone} onChange={(e) => vm.setPhone(e.target.value)} error={vm.fieldErrors.phone} />
      <CityField value={vm.city} onChange={vm.setCity} className="sm:col-span-2" />
    </div>
    <p className="mt-4 text-sm text-steel">The member uses this email to create their login and scan the gym QR.</p>
  </FormCard>
)
