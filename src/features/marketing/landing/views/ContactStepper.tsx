import { Check } from 'lucide-react'
import type { ContactFormVM, ContactStep } from '../viewModels/useContactFormViewModel'

/** The three phases as numbered plates on a bar. Finished phases can be reopened. */
export const ContactStepper = ({ vm }: { vm: ContactFormVM }) => (
  <ol className="relative mb-8 grid grid-cols-3" aria-label="Steps">
    <span aria-hidden="true" className="absolute left-[16.6%] right-[16.6%] top-5 h-0.5 bg-coal-600" />
    <span
      aria-hidden="true"
      className="absolute left-[16.6%] top-5 h-0.5 bg-chalk transition-[width] duration-500"
      style={{ width: `${(vm.step / (vm.steps.length - 1)) * 66.8}%` }}
    />
    {vm.steps.map((label, i) => {
      const done = i < vm.step
      const current = i === vm.step
      const content = (
        <>
          <span
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full font-display text-lg transition-colors ${
              current ? 'bg-chalk text-ink' : done ? 'bg-chalk-2 text-ink' : 'border-2 border-coal-500 bg-coal-900 text-steel'
            }`}
          >
            {done ? <Check size={18} strokeWidth={3} /> : `0${i + 1}`}
          </span>
          <span className={`mt-2 font-mono text-[11px] uppercase tracking-[0.18em] ${current ? 'text-chalk' : 'text-steel'}`}>{label}</span>
        </>
      )
      return (
        <li key={label} className="flex flex-col items-center" aria-current={current ? 'step' : undefined}>
          {done && !vm.result ? (
            <button type="button" onClick={() => vm.goTo(i as ContactStep)} className="flex flex-col items-center hover:opacity-80" aria-label={`Edit step ${i + 1}: ${label}`}>
              {content}
            </button>
          ) : (
            content
          )}
        </li>
      )
    })}
  </ol>
)
