import { ArrowLeft, ArrowRight, Check, Copy, Loader2, Mail, Send } from 'lucide-react'
import { useContactFormViewModel } from '../viewModels/useContactFormViewModel'
import type { LandingVM } from '../viewModels/useLandingViewModel'
import { ContactGymStep } from './ContactGymStep'
import { ContactPersonStep } from './ContactPersonStep'
import { ContactReviewStep } from './ContactReviewStep'
import { ContactSent } from './ContactSent'
import { ContactStepper } from './ContactStepper'

/**
 * Contact us: the pitch on the left (sticky on desktop), the three-step inquiry form on the right.
 * No pricing anywhere: this is the ask. The email stays visible for people who prefer to write.
 */
export const ContactSection = ({ vm: landing }: { vm: LandingVM }) => {
  const vm = useContactFormViewModel()
  const last = vm.step === vm.steps.length - 1
  return (
    <section id="contact" data-morph="contact" className="relative scroll-mt-16 py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">Contact us</p>
          <h2 className="mt-3 font-display text-[clamp(3.2rem,9vw,7rem)] uppercase leading-[0.85]">
            Load <span className="text-outline">your</span> gym.
          </h2>
          <p className="mt-6 max-w-md text-lg text-chalk-2">
            Every gym is different, so there&apos;s no one-size pricing. Tell us about yours in three quick steps and we&apos;ll get back to you
            with a setup that fits.
          </p>
          <div className="mt-8 border-t border-coal-600 pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">Prefer email?</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <a href={landing.inquiryHref} className="inline-flex items-center gap-2 break-all font-semibold underline underline-offset-4">
                <Mail size={16} className="shrink-0" /> {landing.email}
              </a>
              <button type="button" onClick={landing.copyEmail} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-steel hover:bg-coal-700 hover:text-chalk">
                {landing.copied ? <Check size={14} /> : <Copy size={14} />} {landing.copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <form
          id="contact-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            if (vm.result) return
            if (last) void vm.send()
            else vm.next()
          }}
          className="relative z-[25] scroll-mt-24 rounded-2xl border border-coal-600 bg-coal-900 p-5 shadow-[10px_12px_0_rgba(0,0,0,0.45)] sm:p-8"
        >
          {/* Hidden from people; bots that fill every field give themselves away. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={vm.website} onChange={(e) => vm.setWebsite(e.target.value)} />
            </label>
          </div>

          {vm.result ? (
            <ContactSent vm={vm} />
          ) : (
            <>
              <ContactStepper vm={vm} />
              <div key={vm.step} className="rise-in is-in">
                {vm.step === 0 && <ContactPersonStep vm={vm} />}
                {vm.step === 1 && <ContactGymStep vm={vm} />}
                {vm.step === 2 && <ContactReviewStep vm={vm} />}
              </div>
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-coal-600 pt-6">
                {vm.step > 0 ? (
                  <button type="button" onClick={vm.back} className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-semibold text-chalk-2 hover:bg-coal-700 hover:text-chalk">
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : (
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-steel">Step 1 of 3</span>
                )}
                <button
                  type="submit"
                  disabled={vm.isSending}
                  className="inline-flex items-center gap-2 rounded-full bg-chalk px-6 py-3 font-display text-lg uppercase tracking-wider text-ink hover:bg-ember-600 disabled:opacity-60"
                >
                  {last ? (
                    vm.isSending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send inquiry
                      </>
                    )
                  ) : (
                    <>
                      Next <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
