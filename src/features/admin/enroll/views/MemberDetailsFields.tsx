import { Camera, X } from 'lucide-react'
import { CityField } from '../../../../shared/components/CityField'
import { PhotoCapture } from '../../../../shared/components/PhotoCapture'
import { TextField } from '../../../../shared/components/TextField'
import type { EnrollMemberVM } from '../viewModels/useEnrollMemberViewModel'
import { FormCard } from '../../../../shared/components/FormCard'

export const MemberDetailsFields = ({ vm }: { vm: EnrollMemberVM }) => (
  <FormCard step={1} title="Member details">
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField
        label="Full name"
        autoComplete="off"
        placeholder="Juan Dela Cruz"
        value={vm.fullName}
        onChange={(e) => vm.setFullName(e.target.value)}
        error={vm.fieldErrors.fullName}
        className="sm:col-span-2"
      />
      <TextField
        label={vm.emailRequired ? 'Email' : 'Email (optional for day passes)'}
        type="email"
        autoComplete="off"
        placeholder="member@email.com"
        value={vm.email}
        onChange={(e) => vm.setEmail(e.target.value)}
        error={vm.fieldErrors.email}
      />
      <TextField
        label="Mobile (optional)"
        type="tel"
        inputMode="tel"
        autoComplete="off"
        placeholder="0917 123 4567"
        value={vm.phone}
        onChange={(e) => vm.setPhone(e.target.value)}
        error={vm.fieldErrors.phone}
      />
      <CityField value={vm.city} onChange={vm.setCity} className="sm:col-span-2" />
    </div>
    <p className="mt-4 text-sm text-steel">
      The member uses this email to create their login and scan the gym QR.
    </p>

    <div className="mt-5 flex flex-wrap items-center gap-4 rounded-lg border border-coal-500 bg-coal-900 px-4 py-3">
      {vm.photoPreview ? (
        <img src={vm.photoPreview} alt="New member photo" className="size-16 rounded-full object-cover" />
      ) : (
        <span className="flex size-16 items-center justify-center rounded-full bg-coal-700 text-steel">
          <Camera size={22} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-zinc-100">Member photo (optional)</p>
        <p className="text-steel">Take it now so the desk can match them when they scan. You can also take it later.</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={vm.openCapture}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ember/60 px-3 py-1.5 text-sm font-semibold text-ember hover:bg-ember/10"
        >
          <Camera size={14} /> {vm.photoPreview ? 'Retake' : 'Take photo'}
        </button>
        {vm.photoPreview && (
          <button type="button" onClick={vm.clearPhoto} aria-label="Remove photo" className="rounded-lg px-2 text-steel hover:text-zinc-100">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
    {vm.capturing && <PhotoCapture title="New member photo" onCapture={vm.acceptPhoto} onClose={vm.closeCapture} />}
  </FormCard>
)
