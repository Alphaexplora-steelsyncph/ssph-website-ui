import { RotateCcw } from 'lucide-react'
import { ChalkStroke } from '../../../../shared/components/brand/ChalkStroke'
import type { ContactFormVM } from '../viewModels/useContactFormViewModel'

/** After sending: what happens next. */
export const ContactSent = ({ vm }: { vm: ContactFormVM }) => (
  <div role="status" className="py-6 text-center">
    <p className="relative mx-auto inline-block font-display text-[clamp(2.6rem,7vw,4rem)] uppercase leading-none">
      Inquiry sent.
      <ChalkStroke variant="underline" className="absolute -bottom-3 left-0 h-4 w-full text-chalk" delay={0.2} />
    </p>
    <p className="mx-auto mt-8 max-w-md text-lg text-chalk-2">
      Thanks, {vm.person.firstName.trim()}! Our team will reach out within 1 to 2 business days by email, SMS or a call.
    </p>
    <p className="mx-auto mt-3 max-w-md text-sm text-steel">
      {vm.result?.confirmationSent
        ? `A copy of your inquiry is on its way to ${vm.person.email.trim()}. Check your spam folder if you don't see it.`
        : `We have your details, but we couldn't email a copy to ${vm.person.email.trim()}. Double-check the address when we reach out.`}
    </p>
    <button
      type="button"
      onClick={vm.reset}
      className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-lg uppercase tracking-wider shadow-[inset_0_0_0_2px_var(--color-chalk)] hover:bg-chalk/10"
    >
      <RotateCcw size={16} /> Send another
    </button>
  </div>
)
