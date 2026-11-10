import { Link } from 'react-router-dom'

/**
 * The front desk confirms the member was shown the gym's privacy notice and agreed (Data Privacy Act).
 * Not pre-ticked on purpose: it has to be a deliberate choice for every member.
 */
export const PrivacyConsentField = ({ checked, onChange, error }: { checked: boolean; onChange: (checked: boolean) => void; error?: string }) => (
  <div className="mt-5">
    <label className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-500/60 bg-red-500/5' : 'border-coal-500 bg-coal-900'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={!!error}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#f3efe6]"
      />
      <span>
        <span className="font-medium text-zinc-100">The member has read the privacy notice and agrees.</span>
        <span className="mt-1 block text-steel">
          The gym keeps their name, contact details, photo, payments and check-in history to run the membership. They can ask the gym for a copy
          of their data or to erase it.{' '}
          <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
            Privacy Policy
          </Link>
        </span>
      </span>
    </label>
    {error && <p role="alert" className="mt-1.5 text-sm text-red-400">{error}</p>}
  </div>
)
