import { memo } from 'react'
import { BillingTable } from './BillingTable'

/** Page container: composes sections only. */
const PlatformBilling = memo(() => (
  <>
    <h1 className="font-display text-5xl font-extrabold uppercase">Billing</h1>
    <p className="mb-8 mt-2 text-steel">
      SteelSync subscriptions per month. Gyms that stay unpaid past the grace period are suspended automatically.
    </p>
    <BillingTable />
  </>
))
PlatformBilling.displayName = 'PlatformBilling'

export default PlatformBilling
