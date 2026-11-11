import { ArrowRight, Loader2 } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { COMPANY_NAME, COMPANY_URL } from '../../../shared/brand/product'
import { LogoFull } from '../../../shared/components/Logo'
import { useGymPortalViewModel } from '../viewModels/useGymPortalViewModel'
import { RoleList } from './RoleList'

/** Page container: the gym's own address (<slug>.steelsync.ph) shows one card: "Welcome, select your role". */
const GymPortal = memo(({ slug }: { slug: string }) => {
  const vm = useGymPortalViewModel(slug)

  return (
    <div className="floor-speckle relative flex min-h-[100svh] flex-col items-center justify-center px-5 py-10">
      <main className="w-full max-w-md rounded-2xl border border-coal-600 bg-coal-800/90 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoFull className="w-40" />

          {vm.isLoading && (
            <p className="mt-8 flex items-center gap-2 text-steel">
              <Loader2 size={18} className="animate-spin" /> Opening your gym…
            </p>
          )}

          {vm.error && (
            <>
              <h1 className="mt-6 text-2xl font-semibold">Gym not found</h1>
              <p className="mt-2 text-sm text-chalk-2">{vm.error}</p>
              <a href={vm.mainSite} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
                Go to {vm.productName} <ArrowRight size={16} />
              </a>
            </>
          )}

          {vm.site && (
            <>
              <h1 className="mt-6 text-2xl font-semibold">Welcome</h1>
              <p className="mt-1 font-semibold text-chalk-2">{vm.site.name}</p>
              {vm.isOpen ? (
                <>
                  <p className="mt-2 text-sm text-steel">Please select your role to continue</p>
                  <div className="mt-6 w-full">
                    <RoleList choices={vm.choices} />
                  </div>
                  {vm.signedIn && (
                    <Link to={vm.signedIn.to} className="mt-5 text-sm font-semibold underline underline-offset-4">
                      Continue as {vm.signedIn.name.split(' ')[0]}
                    </Link>
                  )}
                </>
              ) : (
                <div className="mt-6 w-full rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-left">
                  <p className="font-semibold">{vm.site.status === 'Archived' ? 'Closed' : 'On hold'}</p>
                  <p className="mt-1 text-sm text-chalk-2">
                    {vm.site.name} can&apos;t be used on {vm.productName} right now. Members: please ask the front desk. Gym owner: contact{' '}
                    {vm.productName} support.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
        {vm.address}
        <span className="mt-1 block">
          <a href={vm.mainSite} className="text-chalk-2 hover:text-chalk">
            {vm.productName}
          </a>{' '}
          · Powered by{' '}
          <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer" className="text-chalk-2 hover:text-chalk">
            {COMPANY_NAME}
          </a>
        </span>
        <span className="mt-2 block normal-case tracking-normal">
          <Link to="/privacy" className="hover:text-chalk">Privacy Policy</Link> · <Link to="/terms" className="hover:text-chalk">Terms</Link>
        </span>
      </footer>
    </div>
  )
})
GymPortal.displayName = 'GymPortal'

export default GymPortal
