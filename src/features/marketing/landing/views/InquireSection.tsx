import { Check, Copy, Mail } from 'lucide-react'
import { ChalkStroke } from '../../../../shared/components/brand/ChalkStroke'
import type { LandingVM } from '../viewModels/useLandingViewModel'

/** The ask: no pricing, just an email. The morphing plate ends here, big and centred. */
export const InquireSection = ({ vm }: { vm: LandingVM }) => (
  <section data-morph="final" className="relative overflow-hidden py-32 sm:py-44">
    <div className="mx-auto max-w-6xl px-5 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">Inquire</p>
      <h2 className="mx-auto mt-4 max-w-4xl font-display text-[clamp(3.5rem,12vw,9.5rem)] uppercase leading-[0.85]">
        Load <span className="text-outline">your</span> gym.
      </h2>
      <p className="mx-auto mt-8 max-w-xl text-lg text-chalk-2">
        Every gym is different, so we don&apos;t do one-size pricing. Tell us about yours: name, location and how many members. We&apos;ll get back
        to you with a setup that fits.
      </p>
      <a href={vm.inquiryHref} className="relative mx-auto mt-10 inline-block break-all font-display text-[clamp(1.6rem,5vw,3.5rem)] uppercase leading-tight">
        {vm.email}
        <ChalkStroke variant="underline" className="absolute -bottom-3 left-0 h-5 w-full text-chalk" delay={0.3} />
      </a>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href={vm.inquiryHref} className="inline-flex items-center gap-2 rounded-full bg-chalk px-7 py-3.5 font-display text-xl uppercase tracking-wider text-ink hover:bg-ember-600">
          <Mail size={18} /> Email us
        </a>
        <button
          type="button"
          onClick={vm.copyEmail}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-display text-xl uppercase tracking-wider shadow-[inset_0_0_0_2px_var(--color-chalk)] hover:bg-chalk/10"
        >
          {vm.copied ? <Check size={18} /> : <Copy size={18} />} {vm.copied ? 'Copied' : 'Copy email'}
        </button>
      </div>
    </div>
  </section>
)
