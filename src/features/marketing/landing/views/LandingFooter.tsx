import { Link } from 'react-router-dom'
import { COMPANY_NAME } from '../../../../shared/brand/product'
import { Logo } from '../../../../shared/components/Logo'
import type { LandingVM } from '../viewModels/useLandingViewModel'

export const LandingFooter = ({ vm }: { vm: LandingVM }) => (
  <footer className="relative z-30 border-t border-coal-600 bg-coal-900">
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between">
      <div>
        <Logo />
        <p className="mt-3 max-w-xs text-sm text-steel">The front desk system for local gyms. Made in the Philippines.</p>
      </div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
        <p className="col-span-2 mb-1 font-mono text-xs uppercase tracking-widest text-steel sm:col-span-1">Log in</p>
        <p className="hidden font-mono text-xs uppercase tracking-widest text-steel sm:block">Contact</p>
        <div className="flex flex-col gap-2">
          <Link to="/login" className="hover:underline">Member</Link>
          <Link to="/admin/login" className="hover:underline">Gym admin</Link>
          <Link to="/coach/login" className="hover:underline">Coach</Link>
        </div>
        <div className="flex flex-col gap-2">
          <a href={vm.contactHref} onClick={vm.goTo('contact')} className="hover:underline">Send us a message</a>
          <a href={vm.inquiryHref} className="break-all hover:underline">{vm.email}</a>
        </div>
      </div>
    </div>
    <p className="border-t border-coal-600 py-4 text-center font-mono text-xs text-steel">
      © {new Date().getFullYear()} {vm.productName} by {COMPANY_NAME}
    </p>
  </footer>
)
