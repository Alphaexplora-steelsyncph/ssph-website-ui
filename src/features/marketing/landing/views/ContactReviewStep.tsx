import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ContactFormVM, ContactStep } from '../viewModels/useContactFormViewModel'

const Block = ({ title, onEdit, rows }: { title: string; onEdit: () => void; rows: [string, ReactNode][] }) => (
  <section className="rounded-xl border border-coal-600 p-4 sm:p-5">
    <div className="mb-2 flex items-center justify-between gap-3">
      <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-steel">{title}</h4>
      <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-coal-700">
        <Pencil size={14} /> Edit
      </button>
    </div>
    <dl className="divide-y divide-coal-700">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
          <dt className="text-sm text-steel">{k}</dt>
          <dd className="min-w-0 break-words text-chalk">{v || <span className="text-steel">-</span>}</dd>
        </div>
      ))}
    </dl>
  </section>
)

/** Step 3: everything on one screen before sending. */
export const ContactReviewStep = ({ vm }: { vm: ContactFormVM }) => {
  const edit = (s: ContactStep) => () => vm.goTo(s)
  return (
    <div className="space-y-5">
      <h3 className="font-display text-3xl uppercase">Look good?</h3>
      <Block
        title="You"
        onEdit={edit(0)}
        rows={[
          ['Name', `${vm.person.firstName.trim()} ${vm.person.lastName.trim()}`],
          ['Email', vm.person.email.trim()],
          ['Phone', vm.person.phone.trim()],
        ]}
      />
      <Block
        title="Your gym"
        onEdit={edit(1)}
        rows={[
          ['Gym', vm.gymName.trim()],
          [
            'Address',
            <>
              {vm.fullAddress}{' '}
              <a href={vm.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline underline-offset-4">
                Map
              </a>
            </>,
          ],
          ['Landmark', vm.landmark.trim()],
        ]}
      />
      <p className="text-sm text-steel">
        We&apos;ll email a copy to <span className="text-chalk">{vm.person.email.trim()}</span>. No spam, and your details are only used to reply to you.
      </p>
      <div>
        <label className="flex items-start gap-3 rounded-lg border border-coal-600 px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={vm.consent}
            onChange={(e) => vm.setConsent(e.target.checked)}
            aria-describedby={vm.errors.consent ? 'consent-error' : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#f3efe6]"
          />
          <span>
            <span className="font-medium text-chalk">I agree that SteelSync may use these details to reply to my inquiry.</span>
            <span className="mt-1 block text-steel">
              We use your name, email, phone and gym details only to answer you and set up a demo. Read the{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </span>
          </span>
        </label>
        {vm.errors.consent && (
          <p id="consent-error" role="alert" className="mt-2 text-sm text-red-300">
            {vm.errors.consent}
          </p>
        )}
      </div>
      {vm.sendError && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {vm.sendError}
        </p>
      )}
    </div>
  )
}
