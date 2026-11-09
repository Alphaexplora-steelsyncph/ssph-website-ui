import { memo } from 'react'
import { PaymentsPanel } from './PaymentsPanel'

/** Page container: composes sections only. */
const Payments = memo(() => (
  <>
    <div className="mb-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Payments</h1>
      <p className="mt-2 text-steel">
        Every payment recorded at the desk: enrollments, renewals, upgrades, reinstatements and balances. Record new ones where they happen.
      </p>
    </div>
    <PaymentsPanel />
  </>
))
Payments.displayName = 'Payments'

export default Payments
