import { ArrowDown, Mail } from 'lucide-react'
import { ChalkStroke } from '../../../../shared/components/brand/ChalkStroke'
import { Tape } from '../../../../shared/components/brand/Tape'
import type { LandingVM } from '../viewModels/useLandingViewModel'

/** Above the fold: loads with the page (no lazy loading). The morphing plate starts here. */
export const HeroSection = ({ vm }: { vm: LandingVM }) => (
  <section data-morph="plate" className="floor-speckle relative overflow-hidden">
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-5 pb-28 pt-14">
      <Tape>Gym management system · Philippines</Tape>
      <h1 className="mt-7 font-display text-[clamp(3.6rem,13vw,10rem)] uppercase leading-[0.86]">
        <span className="block">No more</span>
        <span className="block text-outline">logbooks.</span>
        Just{' '}
        <span className="relative mt-1 inline-block">
          scan.
          <ChalkStroke variant="circle" className="absolute -inset-x-[12%] -inset-y-[18%] h-[136%] w-[124%] text-chalk" strokeWidth={4} delay={0.6} />
        </span>
      </h1>
      <p className="mt-8 max-w-xl text-lg text-chalk-2 sm:text-xl">
        {vm.productName} is gym management software for local gyms in the Philippines: QR code check-in at the door, membership tracking,
        GCash and cash payment records, and coach programs. One system, on the phones you already have.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a href={vm.contactHref} onClick={vm.goTo('contact')} className="inline-flex items-center justify-center gap-2 rounded-full bg-chalk px-7 py-3.5 font-display text-xl uppercase tracking-wider text-ink hover:bg-ember-600">
          <Mail size={18} /> Inquire for your gym
        </a>
        <a href="#how-it-works" onClick={vm.goTo('how-it-works')} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-display text-xl uppercase tracking-wider shadow-[inset_0_0_0_2px_var(--color-chalk)] hover:bg-chalk/10">
          How it works <ArrowDown size={18} />
        </a>
      </div>
    </div>
    {/* Words on a band of tape, running forever */}
    <div className="absolute inset-x-[-2%] bottom-6 -rotate-1 overflow-hidden bg-chalk py-2.5 text-ink" aria-hidden="true">
      <div className="marquee flex w-max gap-10 whitespace-nowrap font-mono text-sm font-bold uppercase tracking-[0.18em]">
        {[...vm.marquee, ...vm.marquee].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w} <span className="text-ink/40">●</span>
          </span>
        ))}
      </div>
    </div>
  </section>
)
