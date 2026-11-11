import { ArrowRight, Loader2 } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ChalkStroke } from '../../../shared/components/brand/ChalkStroke'
import { Tape } from '../../../shared/components/brand/Tape'
import { LogoMark } from '../../../shared/components/Logo'
import { useGymPortalViewModel } from '../viewModels/useGymPortalViewModel'
import { RoleList } from './RoleList'

/** Page container: the gym's own address (<slug>.steelsync.ph) asks "who are you?" and sends you to that login. */
const GymPortal = memo(({ slug }: { slug: string }) => {
  const vm = useGymPortalViewModel(slug)

  return (
    <div className="floor-speckle relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* A big plate in the background, cut off by the screen edge */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-[30vmin] top-1/2 size-[90vmin] -translate-y-1/2 rounded-full border-[7vmin] border-chalk/[0.06]">
        <div className="absolute inset-[22%] rounded-full border-[1.2vmin] border-chalk/[0.05]" />
      </div>

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 text-chalk">
          <LogoMark className="h-8 w-auto" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-steel">{vm.address}</span>
        </span>
        {vm.signedIn && (
          <Link to={vm.signedIn.to} className="text-sm font-semibold underline-offset-4 hover:underline">
            Continue as {vm.signedIn.name.split(' ')[0]}
          </Link>
        )}
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 pb-16 pt-6">
        {vm.isLoading && (
          <p className="flex items-center gap-2 text-steel">
            <Loader2 size={18} className="animate-spin" /> Opening your gym…
          </p>
        )}

        {vm.error && (
          <div className="max-w-xl">
            <Tape>Gym not found</Tape>
            <h1 className="mt-6 font-display text-[clamp(3rem,10vw,6rem)] uppercase leading-[0.9]">No gym here.</h1>
            <p className="mt-4 text-lg text-chalk-2">{vm.error}</p>
            <a href={vm.mainSite} className="mt-8 inline-flex items-center gap-2 font-semibold underline underline-offset-4">
              Go to {vm.productName} <ArrowRight size={16} />
            </a>
          </div>
        )}

        {vm.site && (
          <div className="grid items-end gap-12 md:grid-cols-[1.1fr_1fr]">
            <div>
              <Tape>Welcome to</Tape>
              <h1 className="mt-6 font-display text-[clamp(3.2rem,11vw,7.5rem)] uppercase leading-[0.86]">{vm.site.name}</h1>
              <p className="relative mt-8 inline-block font-display text-3xl uppercase sm:text-4xl">
                Who are you?
                <ChalkStroke variant="underline" className="absolute -bottom-3 left-0 h-4 w-full text-chalk" delay={0.4} />
              </p>
            </div>
            {vm.isOpen ? (
              <RoleList choices={vm.choices} />
            ) : (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
                <p className="font-display text-3xl uppercase">{vm.site.status === 'Archived' ? 'Closed' : 'On hold'}</p>
                <p className="mt-2 text-chalk-2">
                  {vm.site.name} can&apos;t be used on {vm.productName} right now. Members: please ask the front desk. Gym owner: contact{' '}
                  {vm.productName} support.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="relative pb-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
        Powered by{' '}
        <a href={vm.mainSite} className="text-chalk-2 hover:text-chalk">
          {vm.productName}
        </a>
        <span className="mt-2 block normal-case tracking-normal">
          <Link to="/privacy" className="hover:text-chalk">Privacy Policy</Link> · <Link to="/terms" className="hover:text-chalk">Terms</Link>
        </span>
      </footer>
    </div>
  )
})
GymPortal.displayName = 'GymPortal'

export default GymPortal
