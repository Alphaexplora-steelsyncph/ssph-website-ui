import { Lock, MapPin, RotateCw } from 'lucide-react'
import { TextField } from '../../../../shared/components/TextField'
import { TypeaheadField } from '../../../../shared/components/TypeaheadField'
import type { ContactFormVM } from '../viewModels/useContactFormViewModel'

/** Step 2: the gym and where it is, picked top to bottom so the address reads the same way a map searches it. */
export const ContactGymStep = ({ vm }: { vm: ContactFormVM }) => {
  const a = vm.address
  return (
    <fieldset className="space-y-5">
      <legend className="mb-5 font-display text-3xl uppercase">Tell us about your gym</legend>
      <TextField label="Gym name" autoComplete="organization" placeholder="Iron Haven Gym" value={vm.gymName} onChange={(e) => vm.setGymName(e.target.value)} error={vm.errors.gymName} maxLength={100} />

      <div className="rounded-xl border border-coal-600 p-4 sm:p-5">
        <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-steel">
          <MapPin size={14} /> Gym location
        </p>
        {vm.places.failed && (
          <p className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Could not load the list of places.
            <button type="button" onClick={vm.places.retry} className="inline-flex items-center gap-1 font-semibold underline underline-offset-4">
              <RotateCw size={14} /> Try again
            </button>
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-[9.5rem_1fr]">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-steel">Country</span>
            <p className="flex items-center justify-between rounded-lg border border-coal-600 bg-coal-900 px-4 py-3 text-base text-chalk-2">
              {vm.country} <Lock size={14} className="text-steel" aria-label="Fixed" />
            </p>
          </div>
          <TypeaheadField
            label="Region"
            placeholder="Type to search, e.g. CALABARZON"
            options={vm.options.regions}
            value={a.regionCode}
            onSelect={vm.selectRegion}
            loading={vm.places.loading}
            disabled={vm.places.failed}
            error={vm.errors.region}
          />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TypeaheadField
            label="Province or city"
            placeholder={a.regionCode ? 'Type to search' : 'Choose a region first'}
            options={vm.options.provinces}
            value={a.provinceCode}
            onSelect={vm.selectProvince}
            disabled={!a.regionCode}
            error={vm.errors.province}
            help="Big cities like Quezon City or Cebu City are listed on their own."
          />
          <TypeaheadField
            label={vm.cityLabel}
            placeholder={a.provinceCode ? 'Type to search' : 'Choose a province first'}
            options={vm.options.cities}
            value={a.cityCode}
            onSelect={vm.selectCity}
            disabled={!a.provinceCode}
            error={vm.errors.city}
          />
          {(vm.hasBarangays || !a.cityCode) && (
            <TypeaheadField
              label="Barangay"
              placeholder={a.cityCode ? 'Type to search' : 'Choose a city first'}
              options={vm.options.barangays}
              value={a.barangay}
              onSelect={vm.selectBarangay}
              loading={vm.barangaysLoading}
              disabled={!a.cityCode}
              error={vm.errors.barangay}
            />
          )}
          <TextField
            label="Street, building, unit (optional)"
            autoComplete="street-address"
            placeholder="123 Rizal St., 2/F Unit 5"
            value={a.street}
            onChange={(e) => vm.setStreet(e.target.value)}
            error={vm.errors.street}
            maxLength={200}
          />
        </div>
        <TextField
          className="mt-5"
          label="Landmark (optional)"
          placeholder="Across Jollibee, above the 7-Eleven"
          value={vm.landmark}
          onChange={(e) => vm.setLandmark(e.target.value)}
          error={vm.errors.landmark}
          maxLength={200}
        />
        {a.cityCode && (
          <div className="mt-5 rounded-lg bg-coal-800 px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">Address</p>
            <p className="mt-1 text-chalk">{vm.fullAddress}</p>
          </div>
        )}
      </div>
    </fieldset>
  )
}
