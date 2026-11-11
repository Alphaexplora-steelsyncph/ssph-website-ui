import { Link } from 'react-router-dom'
import { COMPANY_NAME, COMPANY_URL } from '../../../../shared/brand/product'
import { Logo } from '../../../../shared/components/Logo'
import type { LandingVM } from '../viewModels/useLandingViewModel'

export const LandingFooter = ({ vm }: { vm: LandingVM }) => (
  <footer className="relative z-30 border-t border-coal-600 bg-coal-900">
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between">
      <div>
        <Logo />
        <p className="mt-3 max-w-xs text-sm text-steel">The front desk system for local gyms. Made in the Philippines.</p>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-steel">Contact</p>
        <a href={vm.contactHref} onClick={vm.goTo('contact')} className="hover:underline">Send us a message</a>
        <a href={vm.inquiryHref} className="break-all hover:underline">{vm.email}</a>
      </div>
    </div>
    <p className="border-t border-coal-600 py-4 text-center font-mono text-xs text-steel">
      © {new Date().getFullYear()} {vm.productName} · Powered by{' '}
      <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">{COMPANY_NAME}</a> ·{' '}
      <Link to="/privacy" className="hover:underline">Privacy Policy</Link> ·{' '}
      <Link to="/terms" className="hover:underline">Terms</Link>
    </p>
  </footer>
)
